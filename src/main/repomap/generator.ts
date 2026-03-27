/**
 * Repo map generator.
 *
 * Walks a project directory, runs the appropriate extractor on each source file,
 * and writes the formatted Aider-style map to `.claude/specify/context/repo-map.md`.
 *
 * Fully async — yields to the event loop periodically to avoid blocking the
 * Electron main process and freezing the renderer.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { normalizePath } from '../utils/paths.js';
import { formatRepoMap, buildRepoMap } from './format.js';
import type { Extractor, FileExtraction, ExtractionFailure, RepoMap } from './types.js';

const MAP_RELATIVE_PATH = '.claude/specify/context/repo-map.md';

/** Directories to skip during file discovery. */
const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', 'coverage',
  '.next', '.nuxt', '.svelte-kit', 'target', '__pycache__',
  '.claude', 'release', '.idea', '.vscode',
  'resources', 'tests',
]);

/** Yield to the event loop so the main process stays responsive. */
const yieldToEventLoop = () => new Promise<void>((resolve) => setImmediate(resolve));

/** Resolve the absolute path to the repo map file. */
export function getMapPath(repoRoot: string): string {
  return path.join(repoRoot, MAP_RELATIVE_PATH);
}

/** Discover all source files in a repo that match any extractor's extensions (async). */
async function discoverFiles(repoRoot: string, extensions: Set<string>): Promise<string[]> {
  const files: string[] = [];
  let dirCount = 0;

  async function walk(dir: string) {
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch (err: unknown) {
      console.debug(`[repomap] skipping unreadable directory ${dir}:`, err);
      return;
    }

    // Yield every 20 directories so the event loop isn't starved
    if (++dirCount % 20 === 0) await yieldToEventLoop();

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
          await walk(path.join(dir, entry.name));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.has(ext)) {
          files.push(path.join(dir, entry.name));
        }
      }
    }
  }

  await walk(repoRoot);
  return files.sort();
}

/** Parse an existing repo map to extract file hashes for incremental updates. */
async function parseExistingHashes(mapPath: string): Promise<Map<string, string>> {
  const hashes = new Map<string, string>();

  try {
    await fs.promises.access(mapPath);
  } catch {
    return hashes;
  }

  try {
    const content = await fs.promises.readFile(mapPath, 'utf-8');
    // Parse file entries: path line followed by │ hash: <hash> line
    const filePattern = /^([^\s│⋮#-].+)$\n^│ hash: ([a-f0-9]+)$/gm;
    let match: RegExpExecArray | null;
    while ((match = filePattern.exec(content)) !== null) {
      hashes.set(match[1], match[2]);
    }
  } catch {
    // Corrupted map — will trigger full regeneration
  }

  return hashes;
}

/** Generate or incrementally update the repo map. */
export async function generateRepoMap(
  repoRoot: string,
  extractors: Extractor[],
  options?: { incremental?: boolean; signal?: AbortSignal },
): Promise<RepoMap> {
  const allExtensions = new Set<string>();
  for (const ext of extractors) {
    for (const e of ext.extensions) allExtensions.add(e);
  }

  const files = await discoverFiles(repoRoot, allExtensions);

  // Check for cancellation after file discovery
  if (options?.signal?.aborted) {
    throw new DOMException('Generation aborted', 'AbortError');
  }

  const mapPath = getMapPath(repoRoot);
  const existingHashes = options?.incremental ? await parseExistingHashes(mapPath) : new Map<string, string>();

  // Build extractor lookup by extension
  const extractorByExt = new Map<string, Extractor>();
  for (const ext of extractors) {
    for (const e of ext.extensions) extractorByExt.set(e, ext);
  }

  const extractions: FileExtraction[] = [];
  const failures: ExtractionFailure[] = [];

  for (let i = 0; i < files.length; i++) {
    // Yield every 25 files and check for cancellation
    if (i > 0 && i % 25 === 0) {
      await yieldToEventLoop();
      if (options?.signal?.aborted) {
        throw new DOMException('Generation aborted', 'AbortError');
      }
    }

    const filePath = files[i];
    const ext = path.extname(filePath).toLowerCase();
    const extractor = extractorByExt.get(ext);
    if (!extractor) continue;

    let content: string;
    try {
      content = await fs.promises.readFile(filePath, 'utf-8');
    } catch (err: unknown) {
      console.debug(`[repomap] skipping unreadable file ${filePath}:`, err);
      continue;
    }

    const relativePath = normalizePath(path.relative(repoRoot, filePath));

    try {
      const extraction = extractor.extract(filePath, content, repoRoot);
      extractions.push(extraction);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[repomap] EXTRACTION FAILED ${relativePath}: ${message}`);
      failures.push({ path: relativePath, error: message });
    }
  }

  if (failures.length > 0) {
    console.error(`[repomap] ${failures.length} file(s) failed extraction: ${failures.map((f) => f.path).join(', ')}`);
  }

  // Final cancellation check before writing
  if (options?.signal?.aborted) {
    throw new DOMException('Generation aborted', 'AbortError');
  }

  const now = new Date().toISOString();
  const map = buildRepoMap(extractions, now, failures);

  // Write the map
  const mapDir = path.dirname(mapPath);
  await fs.promises.mkdir(mapDir, { recursive: true });

  const formatted = formatRepoMap(map);
  await fs.promises.writeFile(mapPath, formatted, 'utf-8');

  return map;
}

/** Update the map for specific changed files only. */
export async function updateRepoMapFiles(
  repoRoot: string,
  changedFiles: string[],
  extractors: Extractor[],
): Promise<RepoMap> {
  // For changed files, re-generate the full map
  // This is fast enough with TS compiler API (microseconds per file)
  // and ensures consistency. A future optimization could do true incremental
  // patching of individual entries.
  return generateRepoMap(repoRoot, extractors, { incremental: true });
}

/** Check if a repo map exists and is valid. */
export function isMapValid(repoRoot: string): boolean {
  const mapPath = getMapPath(repoRoot);
  if (!fs.existsSync(mapPath)) return false;

  try {
    const content = fs.readFileSync(mapPath, 'utf-8');
    return content.startsWith('# Repo Map') && content.includes('Generated:');
  } catch {
    return false;
  }
}

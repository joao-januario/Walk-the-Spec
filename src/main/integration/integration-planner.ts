import fs from 'fs/promises';
import path from 'path';
import type { IntegrationPlan, IntegrationFileEntry, FileAction, FileCategory } from './types.js';
import { normalizePath } from '../utils/paths.js';

/** Recursively list all files under a directory, returning paths relative to that directory. */
async function listFilesRecursive(dir: string, base?: string): Promise<string[]> {
  const root = base ?? dir;
  const results: string[] = [];

  let entries: Awaited<ReturnType<typeof fs.readdir>>;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch { /* expected: directory may not exist */
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFilesRecursive(fullPath, root);
      results.push(...nested);
    } else {
      results.push(normalizePath(path.relative(root, fullPath)));
    }
  }

  return results;
}

/** Derive the file category from a relative path. */
function categorize(relativePath: string): FileCategory {
  if (relativePath.startsWith('.claude/commands/')) return 'command';
  if (relativePath.startsWith('.claude/specify/scripts/')) return 'script';
  if (relativePath.startsWith('.claude/specify/templates/')) return 'template';
  if (relativePath.startsWith('.claude/best-practices/')) return 'best-practice';
  if (relativePath === '.claude/specify/.scaffold-version' || relativePath === 'CLAUDE.md') return 'meta';
  return 'user';
}

/**
 * Build a mapping from scaffold source paths to their target .claude/ paths.
 * The scaffold directory mirrors the target layout:
 *   resources/scaffold/commands/spec.plan.md → .claude/commands/spec.plan.md
 *   resources/scaffold/specify/templates/... → .claude/specify/templates/...
 *   resources/scaffold/best-practices/...   → .claude/best-practices/...
 *   resources/scaffold/.scaffold-version    → .claude/specify/.scaffold-version
 *   resources/scaffold/CLAUDE.md.template   → CLAUDE.md (special handling)
 */
function scaffoldPathToTarget(scaffoldRelative: string): string {
  // Special cases
  if (scaffoldRelative === '.scaffold-version') return '.claude/specify/.scaffold-version';
  if (scaffoldRelative === 'CLAUDE.md.template') return 'CLAUDE.md';

  // Everything else maps into .claude/
  return normalizePath(path.join('.claude', scaffoldRelative));
}

/**
 * Files that existed in older scaffold versions but have since been removed.
 * Present in a target project → flagged for deletion on refresh.
 */
const DEPRECATED_FILES = new Set([
  '.claude/specify/context/repo-map.md',
]);

/**
 * Generate an integration plan by comparing the scaffold against the target project.
 */
export async function generateIntegrationPlan(
  targetPath: string,
  scaffoldDir: string,
): Promise<IntegrationPlan> {
  // Read scaffold version
  const versionContent = await fs.readFile(path.join(scaffoldDir, '.scaffold-version'), 'utf-8');
  const scaffoldVersion = versionContent.trim();

  // List all files in the scaffold
  const scaffoldFiles = await listFilesRecursive(scaffoldDir);

  // Build the set of target paths owned by the scaffold
  const scaffoldTargetPaths = new Map<string, string>(); // targetRelPath → scaffoldRelPath
  for (const sf of scaffoldFiles) {
    scaffoldTargetPaths.set(scaffoldPathToTarget(sf), sf);
  }

  // Check if CLAUDE.md exists in target
  const claudeMdExists = await fileExists(path.join(targetPath, 'CLAUDE.md'));

  // If CLAUDE.md exists, remove it from scaffold targets (FR-014: never overwrite)
  if (claudeMdExists) {
    scaffoldTargetPaths.delete('CLAUDE.md');
  }

  // Check if .claude/specs/ exists
  const specsWillBeWiped = await dirExists(path.join(targetPath, '.claude', 'specs'));

  // List all existing files under .claude/ in the target
  const existingClaudeFiles = await listFilesRecursive(path.join(targetPath, '.claude'));
  const existingTargetFiles = new Set(
    existingClaudeFiles.map((f) => normalizePath(path.join('.claude', f))),
  );
  // Also check CLAUDE.md at root
  if (claudeMdExists) {
    existingTargetFiles.add('CLAUDE.md');
  }

  const files: IntegrationFileEntry[] = [];

  // Process scaffold-owned paths
  for (const [targetRel] of scaffoldTargetPaths) {
    const exists = existingTargetFiles.has(targetRel);
    const isOverride = targetRel.includes('specify/templates/overrides/');

    let action: FileAction;
    if (isOverride) {
      action = 'preserve';
    } else if (exists) {
      action = 'overwrite';
    } else {
      action = 'create';
    }

    files.push({ relativePath: targetRel, action, category: categorize(targetRel) });
    existingTargetFiles.delete(targetRel);
  }

  // Remaining existing files are user-owned → preserve, or deprecated → delete
  for (const existing of existingTargetFiles) {
    // Skip .claude/specs/ contents — they'll be wiped, not preserved
    if (existing.startsWith('.claude/specs/') || existing === '.claude/specs') continue;

    const action: FileAction = DEPRECATED_FILES.has(existing) ? 'delete' : 'preserve';
    files.push({ relativePath: existing, action, category: categorize(existing) });
  }

  // Sort for consistent output
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  const createCount = files.filter((f) => f.action === 'create').length;
  const overwriteCount = files.filter((f) => f.action === 'overwrite').length;
  const preserveCount = files.filter((f) => f.action === 'preserve').length;
  const deleteCount = files.filter((f) => f.action === 'delete').length;

  return {
    targetPath,
    scaffoldVersion,
    files,
    createCount,
    overwriteCount,
    preserveCount,
    deleteCount,
    specsWillBeWiped,
    claudeMdExists,
  };
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function dirExists(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

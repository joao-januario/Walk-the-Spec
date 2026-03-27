import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { normalizePath } from '../utils/paths.js';
import { ALL_EXTENSIONS } from '../repomap/tree-sitter/languages.js';

export interface WatcherEvents {
  onSpecsChanged: (projectId: string, files: string[]) => void;
  onBranchChanged: (projectId: string) => void;
  onSourceChanged: (projectId: string, files: string[]) => void;
  onError: (projectId: string, error: string) => void;
}

/** File extensions watched for repo map updates (TS/JS + all tree-sitter languages). */
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', ...ALL_EXTENSIONS]);

/** Directories ignored when watching source files. */
const IGNORED_SOURCE_DIRS = [
  '**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**',
  '**/out/**', '**/coverage/**', '**/.next/**', '**/.nuxt/**',
  '**/.svelte-kit/**', '**/target/**', '**/__pycache__/**',
  '**/.claude/**', '**/release/**',
];

interface ProjectWatcher {
  projectId: string;
  projectPath: string;
  specsWatcher: chokidar.FSWatcher | null;
  headWatcher: chokidar.FSWatcher | null;
  sourceWatcher: chokidar.FSWatcher | null;
  debounceTimer: ReturnType<typeof setTimeout> | null;
  sourceDebounceTimer: ReturnType<typeof setTimeout> | null;
  pendingFiles: Set<string>;
  pendingSourceFiles: Set<string>;
}

const watchers = new Map<string, ProjectWatcher>();

export function watchProject(projectId: string, projectPath: string, events: WatcherEvents): void {
  // Don't double-watch
  if (watchers.has(projectId)) return;

  const specsDir = path.join(projectPath, '.claude', 'specs');
  const headPath = path.join(projectPath, '.git', 'HEAD');

  const pw: ProjectWatcher = {
    projectId,
    projectPath,
    specsWatcher: null,
    headWatcher: null,
    sourceWatcher: null,
    debounceTimer: null,
    sourceDebounceTimer: null,
    pendingFiles: new Set(),
    pendingSourceFiles: new Set(),
  };

  // Watch .claude/specs/ for artifact changes
  if (fs.existsSync(specsDir)) {
    pw.specsWatcher = chokidar.watch(specsDir, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    });

    const handleChange = (filePath: string) => {
      const relative = normalizePath(path.relative(specsDir, filePath));
      pw.pendingFiles.add(relative);

      // Debounce 300ms
      if (pw.debounceTimer) clearTimeout(pw.debounceTimer);
      pw.debounceTimer = setTimeout(() => {
        const files = Array.from(pw.pendingFiles);
        pw.pendingFiles.clear();
        events.onSpecsChanged(projectId, files);
      }, 300);
    };

    pw.specsWatcher.on('change', handleChange);
    pw.specsWatcher.on('add', handleChange);
    pw.specsWatcher.on('unlink', handleChange);
    pw.specsWatcher.on('error', (err) => events.onError(projectId, err.message));
  }

  // Watch .git/HEAD for branch changes
  if (fs.existsSync(headPath)) {
    pw.headWatcher = chokidar.watch(headPath, { ignoreInitial: true });
    pw.headWatcher.on('change', () => events.onBranchChanged(projectId));
  }

  // Watch source files for repo map updates
  pw.sourceWatcher = chokidar.watch(projectPath, {
    ignoreInitial: true,
    ignored: IGNORED_SOURCE_DIRS,
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
  });

  const handleSourceChange = (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!SOURCE_EXTENSIONS.has(ext)) return;

    const relative = normalizePath(path.relative(projectPath, filePath));
    pw.pendingSourceFiles.add(relative);

    // Debounce 3000ms — long enough for bulk refactors/formatter runs to settle
    if (pw.sourceDebounceTimer) clearTimeout(pw.sourceDebounceTimer);
    pw.sourceDebounceTimer = setTimeout(() => {
      const files = Array.from(pw.pendingSourceFiles);
      pw.pendingSourceFiles.clear();
      events.onSourceChanged(projectId, files);
    }, 3000);
  };

  pw.sourceWatcher.on('change', handleSourceChange);
  pw.sourceWatcher.on('add', handleSourceChange);
  pw.sourceWatcher.on('unlink', handleSourceChange);
  pw.sourceWatcher.on('error', (err: Error) => events.onError(projectId, `source watcher: ${err.message}`));

  watchers.set(projectId, pw);
}

export function unwatchProject(projectId: string): void {
  const pw = watchers.get(projectId);
  if (!pw) return;

  if (pw.debounceTimer) clearTimeout(pw.debounceTimer);
  if (pw.sourceDebounceTimer) clearTimeout(pw.sourceDebounceTimer);
  pw.specsWatcher?.close();
  pw.headWatcher?.close();
  pw.sourceWatcher?.close();
  watchers.delete(projectId);
}

export function unwatchAll(): void {
  for (const id of watchers.keys()) {
    unwatchProject(id);
  }
}

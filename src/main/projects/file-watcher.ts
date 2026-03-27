import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { normalizePath } from '../utils/paths.js';

export interface WatcherEvents {
  onSpecsChanged: (projectId: string, files: string[]) => void;
  onBranchChanged: (projectId: string) => void;
  onGitIndexChanged: (projectId: string) => void;
  onError: (projectId: string, error: string) => void;
}

interface ProjectWatcher {
  projectId: string;
  projectPath: string;
  specsWatcher: chokidar.FSWatcher | null;
  headWatcher: chokidar.FSWatcher | null;
  gitIndexWatcher: chokidar.FSWatcher | null;
  debounceTimer: ReturnType<typeof setTimeout> | null;
  pendingFiles: Set<string>;
}

const watchers = new Map<string, ProjectWatcher>();

export function watchProject(projectId: string, projectPath: string, events: WatcherEvents): void {
  // Don't double-watch
  if (watchers.has(projectId)) return;

  const specsDir = path.join(projectPath, '.claude', 'specs');
  const headPath = path.join(projectPath, '.git', 'HEAD');
  const indexPath = path.join(projectPath, '.git', 'index');

  const pw: ProjectWatcher = {
    projectId,
    projectPath,
    specsWatcher: null,
    headWatcher: null,
    gitIndexWatcher: null,
    debounceTimer: null,
    pendingFiles: new Set(),
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

  // Watch .git/index for repo map regeneration triggers
  // The git index changes on add, commit, checkout, merge, rebase — every
  // operation that modifies the working tree's file structure.
  if (fs.existsSync(indexPath)) {
    pw.gitIndexWatcher = chokidar.watch(indexPath, { ignoreInitial: true });
    pw.gitIndexWatcher.on('change', () => events.onGitIndexChanged(projectId));
    pw.gitIndexWatcher.on('error', (err: Error) => events.onError(projectId, `git-index watcher: ${err.message}`));
  }

  watchers.set(projectId, pw);
}

export function unwatchProject(projectId: string): void {
  const pw = watchers.get(projectId);
  if (!pw) return;

  if (pw.debounceTimer) clearTimeout(pw.debounceTimer);
  pw.specsWatcher?.close();
  pw.headWatcher?.close();
  pw.gitIndexWatcher?.close();
  watchers.delete(projectId);
}

export function unwatchAll(): void {
  for (const id of watchers.keys()) {
    unwatchProject(id);
  }
}

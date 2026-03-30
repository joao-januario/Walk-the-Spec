import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';

// Mock chokidar before importing the module under test
const mockWatcherInstances: Array<{
  path: string | string[];
  options: Record<string, unknown>;
  handlers: Map<string, (...args: unknown[]) => void>;
  closed: boolean;
}> = [];

function createMockWatcher(watchPath: string | string[], options: Record<string, unknown>) {
  const instance = {
    path: watchPath,
    options,
    handlers: new Map<string, (...args: unknown[]) => void>(),
    closed: false,
  };
  mockWatcherInstances.push(instance);
  const watcher = {
    on(event: string, handler: (...args: unknown[]) => void) {
      instance.handlers.set(event, handler);
      return watcher;
    },
    close() {
      instance.closed = true;
      return Promise.resolve();
    },
  };
  return watcher;
}

vi.mock('chokidar', () => ({
  default: {
    watch: vi.fn((watchPath: string | string[], options: Record<string, unknown>) =>
      createMockWatcher(watchPath, options),
    ),
  },
}));

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn((p: string) => {
      // .claude/specs/ and .git/HEAD and .git/index all exist
      if (p.includes('.claude') && p.includes('specs')) return true;
      if (p.endsWith('HEAD')) return true;
      if (p.endsWith('index') && p.includes('.git')) return true;
      return false;
    }),
  },
}));

import { watchProject, unwatchProject, unwatchAll } from '../../../src/main/projects/file-watcher.js';
import type { WatcherEvents } from '../../../src/main/projects/file-watcher.js';

describe('file-watcher', () => {
  const PROJECT_ID = 'test-project';
  const PROJECT_PATH = '/home/user/my-project';

  let events: WatcherEvents;

  beforeEach(() => {
    // Clear tracked mock instances and internal watcher state
    mockWatcherInstances.length = 0;
    unwatchAll();
    events = {
      onSpecsChanged: vi.fn(),
      onBranchChanged: vi.fn(),
      onGitIndexChanged: vi.fn(),
      onError: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates three watchers: specs, HEAD, and git-index', () => {
    watchProject(PROJECT_ID, PROJECT_PATH, events);

    // Should create exactly 3 watchers
    expect(mockWatcherInstances).toHaveLength(3);

    const watchedPaths = mockWatcherInstances.map((w) => w.path);
    const specsDir = path.join(PROJECT_PATH, '.claude', 'specs');
    const headPath = path.join(PROJECT_PATH, '.git', 'HEAD');
    const indexPath = path.join(PROJECT_PATH, '.git', 'index');

    expect(watchedPaths).toContain(specsDir);
    expect(watchedPaths).toContain(headPath);
    expect(watchedPaths).toContain(indexPath);
  });

  it('does NOT create a broad source watcher on the project root', () => {
    watchProject(PROJECT_ID, PROJECT_PATH, events);

    // None of the watchers should be watching the project root directory
    const watchedPaths = mockWatcherInstances.map((w) => w.path);
    expect(watchedPaths).not.toContain(PROJECT_PATH);
  });

  it('fires onGitIndexChanged when .git/index changes', () => {
    watchProject(PROJECT_ID, PROJECT_PATH, events);

    const indexWatcher = mockWatcherInstances.find((w) => {
      const p = typeof w.path === 'string' ? w.path : '';
      return p.endsWith('index') && p.includes('.git');
    });
    expect(indexWatcher).toBeDefined();

    // Simulate a change event on git index
    const changeHandler = indexWatcher!.handlers.get('change');
    expect(changeHandler).toBeDefined();
    changeHandler!();

    expect(events.onGitIndexChanged).toHaveBeenCalledWith(PROJECT_ID);
  });

  it('closes all three watchers on unwatchProject', () => {
    watchProject(PROJECT_ID, PROJECT_PATH, events);
    expect(mockWatcherInstances).toHaveLength(3);

    unwatchProject(PROJECT_ID);

    for (const instance of mockWatcherInstances) {
      expect(instance.closed).toBe(true);
    }
  });

  it('does not double-watch the same project', () => {
    watchProject(PROJECT_ID, PROJECT_PATH, events);
    watchProject(PROJECT_ID, PROJECT_PATH, events);

    // Should still be exactly 3 watchers (not 6)
    expect(mockWatcherInstances).toHaveLength(3);
  });
});

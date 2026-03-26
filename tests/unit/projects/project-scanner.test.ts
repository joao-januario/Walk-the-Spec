import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { scanProject } from '../../../src/main/projects/project-scanner.js';

const TEMP_DIR = path.join(os.tmpdir(), 'walk-the-spec-scanner-test-' + Date.now());

function createTempProject(opts: { withGit?: boolean; branch?: string; withSpecs?: boolean; specFiles?: string[] } = {}) {
  const projectDir = path.join(TEMP_DIR, 'project-' + Math.random().toString(36).slice(2, 8));
  fs.mkdirSync(projectDir, { recursive: true });

  if (opts.withGit !== false) {
    // Create a fake .git directory with HEAD
    const gitDir = path.join(projectDir, '.git');
    fs.mkdirSync(gitDir, { recursive: true });
    const branch = opts.branch ?? 'main';
    fs.writeFileSync(path.join(gitDir, 'HEAD'), `ref: refs/heads/${branch}\n`);
  }

  if (opts.withSpecs) {
    const branch = opts.branch ?? 'main';
    const specDir = path.join(projectDir, '.claude', 'specs', branch);
    fs.mkdirSync(specDir, { recursive: true });
    const files = opts.specFiles ?? ['spec.md'];
    for (const f of files) {
      fs.writeFileSync(path.join(specDir, f), `# ${f}\nSample content`);
    }
  }

  return projectDir;
}

describe('project-scanner', () => {
  beforeEach(() => {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true });
    }
  });

  it('detects the checked-out branch from .git/HEAD', () => {
    const dir = createTempProject({ branch: '002-my-feature', withSpecs: true });
    const result = scanProject(dir);
    expect(result.currentBranch).toBe('002-my-feature');
  });

  it('locates speckit directory and lists artifact files', () => {
    const dir = createTempProject({
      branch: '001-test',
      withSpecs: true,
      specFiles: ['spec.md', 'plan.md', 'tasks.md'],
    });
    const result = scanProject(dir);
    expect(result.hasSpeckitContent).toBe(true);
    expect(result.specDir).toContain('001-test');
    expect(result.artifactFiles).toContain('spec.md');
    expect(result.artifactFiles).toContain('plan.md');
    expect(result.artifactFiles).toContain('tasks.md');
  });

  it('returns hasSpeckitContent=false when no specs directory', () => {
    const dir = createTempProject({ branch: 'main', withSpecs: false });
    const result = scanProject(dir);
    expect(result.hasSpeckitContent).toBe(false);
    expect(result.artifactFiles).toEqual([]);
  });

  it('throws when path has no .git directory', () => {
    const dir = createTempProject({ withGit: false });
    expect(() => scanProject(dir)).toThrow(/not a git repository/i);
  });

  it('handles detached HEAD (direct commit hash)', () => {
    const dir = createTempProject();
    fs.writeFileSync(path.join(dir, '.git', 'HEAD'), 'abc123def456\n');
    const result = scanProject(dir);
    expect(result.currentBranch).toBe('abc123def456');
  });
});

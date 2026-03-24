import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { loadConfig, saveConfig, addProject } from '../../src/main/config/config-manager.js';
import { parseSpec } from '../../src/main/parser/spec-parser.js';
import { parsePlan } from '../../src/main/parser/plan-parser.js';
import { parseTasks } from '../../src/main/parser/tasks-parser.js';
import { parseResearch } from '../../src/main/parser/research-parser.js';
import { scanProject } from '../../src/main/projects/project-scanner.js';

const TEST_DIR = path.join(os.tmpdir(), '.spec-board-artifact-test-' + Date.now());
const FIXTURES = path.join(__dirname, '../fixtures');

function createProjectWithSpecs(name: string, specFiles: Record<string, string>): string {
  const dir = path.join(TEST_DIR, name);
  const branch = '001-test';
  fs.mkdirSync(path.join(dir, '.git'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.git', 'HEAD'), `ref: refs/heads/${branch}\n`);
  const specDir = path.join(dir, '.claude', 'specs', branch);
  fs.mkdirSync(specDir, { recursive: true });
  for (const [file, content] of Object.entries(specFiles)) {
    fs.writeFileSync(path.join(specDir, file), content);
  }
  return dir;
}

describe('artifact parsing integration', () => {
  beforeEach(() => fs.mkdirSync(TEST_DIR, { recursive: true }));
  afterEach(() => { if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true }); });

  it('parses spec.md and returns user stories with correct structure', () => {
    const specContent = fs.readFileSync(path.join(FIXTURES, 'spec.md'), 'utf-8');
    const result = parseSpec(specContent);
    expect(result.userStories).toHaveLength(2);
    expect(result.userStories[0].type).toBeUndefined(); // raw parser, no type field
    expect(result.userStories[0].title).toContain('Create Widget');
    expect(result.requirements).toHaveLength(3);
    expect(result.requirements[0].id).toBe('FR-001');
    expect(result.successCriteria).toHaveLength(2);
  });

  it('parses plan.md and returns technical context', () => {
    const content = fs.readFileSync(path.join(FIXTURES, 'plan.md'), 'utf-8');
    const result = parsePlan(content);
    expect(result.summary).toBeTruthy();
    expect(result.technicalContext['Language/Version']).toContain('TypeScript');
  });

  it('parses tasks.md and returns phases with tasks', () => {
    const content = fs.readFileSync(path.join(FIXTURES, 'tasks.md'), 'utf-8');
    const result = parseTasks(content);
    expect(result.phases.length).toBeGreaterThanOrEqual(2);
    const allTasks = result.phases.flatMap((p) => p.tasks);
    expect(allTasks.length).toBeGreaterThanOrEqual(5);
  });

  it('parses research.md and returns decisions', () => {
    const content = fs.readFileSync(path.join(FIXTURES, 'research.md'), 'utf-8');
    const result = parseResearch(content);
    expect(result.decisions).toHaveLength(2);
    expect(result.decisions[0].decision).toContain('JSON files');
  });

  it('returns 404-equivalent for missing artifact type', () => {
    const dir = createProjectWithSpecs('no-plan', {
      'spec.md': '# Test\n',
    });
    const scan = scanProject(dir);
    expect(scan.artifactFiles).not.toContain('plan.md');
  });
});

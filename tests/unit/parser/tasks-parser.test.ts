import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseTasks } from '../../../src/main/parser/tasks-parser.js';

const FIXTURES = path.join(__dirname, '../../fixtures');

describe('tasks-parser', () => {
  const content = fs.readFileSync(path.join(FIXTURES, 'tasks.md'), 'utf-8');
  const result = parseTasks(content);

  it('extracts phases', () => {
    expect(result.phases.length).toBeGreaterThanOrEqual(2);
    expect(result.phases[0].name).toContain('Setup');
  });

  it('extracts tasks with IDs', () => {
    const allTasks = result.phases.flatMap((p) => p.tasks);
    expect(allTasks.length).toBeGreaterThanOrEqual(5);

    const t001 = allTasks.find((t) => t.id === 'T001');
    expect(t001).toBeDefined();
  });

  it('detects checked status', () => {
    const allTasks = result.phases.flatMap((p) => p.tasks);
    const checked = allTasks.filter((t) => t.checked);
    const unchecked = allTasks.filter((t) => !t.checked);
    expect(checked.length).toBeGreaterThan(0);
    expect(unchecked.length).toBeGreaterThan(0);
  });

  it('detects parallel markers', () => {
    const allTasks = result.phases.flatMap((p) => p.tasks);
    const parallel = allTasks.filter((t) => t.parallel);
    expect(parallel.length).toBeGreaterThan(0);
  });

  it('detects user story labels', () => {
    const allTasks = result.phases.flatMap((p) => p.tasks);
    const withStory = allTasks.filter((t) => t.userStory);
    expect(withStory.length).toBeGreaterThan(0);
    expect(withStory[0].userStory).toMatch(/^US\d+$/);
  });
});

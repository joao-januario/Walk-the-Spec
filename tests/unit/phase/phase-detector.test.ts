import { describe, it, expect } from 'vitest';
import { detectPhase, type Phase } from '../../../src/main/phase/phase-detector.js';

describe('phase-detector', () => {
  it('returns "unknown" when no artifacts exist', () => {
    expect(detectPhase([])).toBe('unknown');
  });

  it('returns "specify" when only spec.md exists', () => {
    expect(detectPhase(['spec.md'])).toBe('specify');
  });

  it('returns "plan" when plan.md exists (with or without spec.md)', () => {
    expect(detectPhase(['spec.md', 'plan.md'])).toBe('plan');
    expect(detectPhase(['plan.md'])).toBe('plan');
  });

  it('returns "tasks" when tasks.md exists but no tasks are checked', () => {
    const tasksContent = '- [ ] T001 Do something\n- [ ] T002 Do another thing';
    expect(detectPhase(['spec.md', 'plan.md', 'tasks.md'], tasksContent)).toBe('tasks');
  });

  it('returns "implement" when tasks.md exists and at least one task is checked', () => {
    const tasksContent = '- [x] T001 Done\n- [ ] T002 Not done';
    expect(detectPhase(['spec.md', 'plan.md', 'tasks.md'], tasksContent)).toBe('implement');
  });

  it('returns "implement" when all tasks are checked', () => {
    const tasksContent = '- [x] T001 Done\n- [x] T002 Also done';
    expect(detectPhase(['spec.md', 'plan.md', 'tasks.md'], tasksContent)).toBe('implement');
  });

  it('ignores non-speckit files', () => {
    expect(detectPhase(['readme.md', 'notes.txt'])).toBe('unknown');
  });

  it('treats research.md alone as "specify" (not a phase-advancing artifact)', () => {
    expect(detectPhase(['spec.md', 'research.md'])).toBe('specify');
  });

  it('returns "review" when review.md exists and tasks are checked', () => {
    const tasksContent = '- [x] T001 Done\n- [ ] T002 Not done';
    expect(detectPhase(['spec.md', 'plan.md', 'tasks.md', 'review.md'], tasksContent)).toBe('review');
  });

  it('returns "tasks" when review.md exists but no tasks are checked', () => {
    const tasksContent = '- [ ] T001 Not done';
    expect(detectPhase(['spec.md', 'plan.md', 'tasks.md', 'review.md'], tasksContent)).toBe('tasks');
  });

  it('returns "review" over "implement" when review.md is present', () => {
    const tasksContent = '- [x] T001 Done\n- [x] T002 Done';
    expect(detectPhase(['tasks.md', 'review.md'], tasksContent)).toBe('review');
  });

  // Summary phase tests
  it('returns "summary" when summary.md exists with checked tasks and no review.md', () => {
    const tasksContent = '- [x] T001 Done\n- [ ] T002 Not done';
    expect(detectPhase(['spec.md', 'plan.md', 'tasks.md', 'summary.md'], tasksContent)).toBe('summary');
  });

  it('returns "review" over "summary" when review.md is also present', () => {
    const tasksContent = '- [x] T001 Done\n- [x] T002 Done';
    expect(detectPhase(['tasks.md', 'summary.md', 'review.md'], tasksContent)).toBe('review');
  });

  it('returns "tasks" when summary.md exists but no tasks are checked', () => {
    const tasksContent = '- [ ] T001 Not done';
    expect(detectPhase(['spec.md', 'plan.md', 'tasks.md', 'summary.md'], tasksContent)).toBe('tasks');
  });

  it('returns "specify" when summary.md exists alone with spec.md', () => {
    expect(detectPhase(['spec.md', 'summary.md'])).toBe('specify');
  });
});

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parsePlan } from '../../../src/main/parser/plan-parser.js';

const FIXTURES = path.join(__dirname, '../../fixtures');

describe('plan-parser', () => {
  const content = fs.readFileSync(path.join(FIXTURES, 'plan.md'), 'utf-8');
  const result = parsePlan(content);

  it('extracts summary', () => {
    expect(result.summary).toContain('widget management');
  });

  it('extracts technical context key-value pairs', () => {
    expect(result.technicalContext).toBeDefined();
    expect(result.technicalContext['Language/Version']).toContain('TypeScript');
    expect(result.technicalContext['Storage']).toContain('Filesystem');
  });

  it('extracts design decisions as sections', () => {
    // plan.md has a Structure Decision
    expect(result.decisions.length).toBeGreaterThanOrEqual(1);
  });
});

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseResearch } from '../../../src/main/parser/research-parser.js';

const FIXTURES = path.join(__dirname, '../../fixtures');

describe('research-parser', () => {
  const content = fs.readFileSync(path.join(FIXTURES, 'research.md'), 'utf-8');
  const result = parseResearch(content);

  it('extracts decisions', () => {
    expect(result.decisions).toHaveLength(2);
  });

  it('extracts decision heading', () => {
    expect(result.decisions[0].heading).toContain('Storage Approach');
  });

  it('extracts decision text', () => {
    expect(result.decisions[0].decision).toContain('JSON files');
  });

  it('extracts rationale', () => {
    expect(result.decisions[0].rationale).toContain('Simplest option');
  });

  it('extracts alternatives considered', () => {
    expect(result.decisions[0].alternatives).toBeDefined();
    expect(result.decisions[0].alternatives!.length).toBeGreaterThanOrEqual(1);
  });
});

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseRefactorBacklog } from '../../../src/main/parser/refactor-backlog-parser.js';

const FIXTURES = path.join(__dirname, '../../fixtures');

describe('refactor-backlog-parser', () => {
  const content = fs.readFileSync(path.join(FIXTURES, 'refactor-backlog.md'), 'utf-8');
  const result = parseRefactorBacklog(content);

  it('extracts all entries', () => {
    expect(result.entries).toHaveLength(3);
  });

  it('parses entry fields correctly', () => {
    const e1 = result.entries[0];
    expect(e1.id).toBe('RO-001');
    expect(e1.branch).toBe('002-spec-board');
    expect(e1.rule).toBe('EA08');
    expect(e1.files).toContain('mockups');
    expect(e1.description).toContain('bundled in the renderer');
    expect(e1.status).toBe('Open');
  });

  it('parses entries from different branches', () => {
    const branches = new Set(result.entries.map((e) => e.branch));
    expect(branches.size).toBe(2);
    expect(branches).toContain('002-spec-board');
    expect(branches).toContain('003-review-heal-tracking');
  });

  it('returns empty entries for empty string', () => {
    const empty = parseRefactorBacklog('');
    expect(empty.entries).toEqual([]);
  });

  it('returns empty entries for file with only headers', () => {
    const headersOnly = '# Refactor Backlog\n\n| ID | Branch | Rule | File(s) | Description | Status |\n|----|--------|------|---------|-------------|--------|\n';
    const r = parseRefactorBacklog(headersOnly);
    expect(r.entries).toEqual([]);
  });
});

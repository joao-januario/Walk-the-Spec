import { describe, it, expect } from 'vitest';
import { parseComments } from '../../../src/main/parser/comment-parser.js';

const SAMPLE = `# Comments: spec.md

## FR-001
- [2026-03-24 10:30] {id:c1} This requirement seems too broad.
- [2026-03-24 11:15] {id:c2} Should we split registration and validation?

## User Story 2 - Drill Into Feature Artifacts
- [2026-03-24 12:00] {id:c3} The acceptance scenario needs more detail.
`;

describe('comment-parser', () => {
  it('extracts comments grouped by element ID', () => {
    const result = parseComments(SAMPLE);
    expect(result).toHaveLength(3);
  });

  it('parses element ID from H2 heading', () => {
    const result = parseComments(SAMPLE);
    const fr001Comments = result.filter((c) => c.elementId === 'FR-001');
    expect(fr001Comments).toHaveLength(2);
  });

  it('parses timestamp and content from bullet', () => {
    const result = parseComments(SAMPLE);
    const c1 = result.find((c) => c.id === 'c1');
    expect(c1).toBeDefined();
    expect(c1!.createdAt).toBe('2026-03-24 10:30');
    expect(c1!.content).toBe('This requirement seems too broad.');
  });

  it('handles comment for heading-based element ID', () => {
    const result = parseComments(SAMPLE);
    const storyComments = result.filter((c) => c.elementId === 'User Story 2 - Drill Into Feature Artifacts');
    expect(storyComments).toHaveLength(1);
  });

  it('returns empty array for empty string', () => {
    expect(parseComments('')).toEqual([]);
  });

  it('returns empty array for file with no comments', () => {
    expect(parseComments('# Comments: spec.md\n')).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import { formatComments } from '../../src/renderer/src/utils/format-comments.js';
import type { ArtifactType } from '../../src/renderer/src/types/index.js';

describe('formatComments', () => {
  it('formats a single comment block', () => {
    const comments = new Map<ArtifactType, Map<string, string>>([
      ['plan', new Map([['Technical Approach', 'Needs more detail on data flow']])],
    ]);
    expect(formatComments(comments)).toBe(
      '/spec.comments [Plan] > Technical Approach:\nNeeds more detail on data flow',
    );
  });

  it('formats multiple comments within the same artifact', () => {
    const comments = new Map<ArtifactType, Map<string, string>>([
      [
        'spec',
        new Map([
          ['User Stories', 'Missing edge case'],
          ['Success Criteria', 'Metrics too vague'],
        ]),
      ],
    ]);
    const result = formatComments(comments);
    expect(result).toBe(
      '/spec.comments [Spec] > User Stories:\nMissing edge case\n\n[Spec] > Success Criteria:\nMetrics too vague',
    );
  });

  it('formats comments across multiple artifacts in TAB_ORDER', () => {
    const comments = new Map<ArtifactType, Map<string, string>>([
      ['research', new Map([['R1. Caching', 'Consider Redis']])],
      ['spec', new Map([['User Stories', 'Add auth story']])],
    ]);
    const result = formatComments(comments);
    const specIndex = result.indexOf('[Spec]');
    const researchIndex = result.indexOf('[Research]');
    // Spec should come before Research (TAB_ORDER)
    expect(specIndex).toBeLessThan(researchIndex);
  });

  it('skips sections with empty comment text from output', () => {
    const comments = new Map<ArtifactType, Map<string, string>>([
      [
        'plan',
        new Map([
          ['Summary', ''],
          ['Technical Approach', 'Good section'],
        ]),
      ],
    ]);
    const result = formatComments(comments);
    expect(result).not.toContain('Summary');
    expect(result).toBe('/spec.comments [Plan] > Technical Approach:\nGood section');
  });

  it('skips sections with whitespace-only comment text', () => {
    const comments = new Map<ArtifactType, Map<string, string>>([
      ['plan', new Map([['Summary', '   \n  ']])],
    ]);
    expect(formatComments(comments)).toBe('');
  });

  it('returns empty string when no comments exist', () => {
    const comments = new Map<ArtifactType, Map<string, string>>();
    expect(formatComments(comments)).toBe('');
  });

  it('returns empty string when all comments are empty', () => {
    const comments = new Map<ArtifactType, Map<string, string>>([
      ['spec', new Map([['User Stories', '']])],
      ['plan', new Map([['Summary', '']])],
    ]);
    expect(formatComments(comments)).toBe('');
  });

  it('preserves multi-line content within comment text', () => {
    const comments = new Map<ArtifactType, Map<string, string>>([
      ['spec', new Map([['User Stories', 'Line 1\nLine 2\nLine 3']])],
    ]);
    expect(formatComments(comments)).toBe(
      '/spec.comments [Spec] > User Stories:\nLine 1\nLine 2\nLine 3',
    );
  });

  it('preserves special characters in section headings', () => {
    const comments = new Map<ArtifactType, Map<string, string>>([
      ['plan', new Map([['1. Renderer-only comment state via hook', 'Looks good']])],
    ]);
    expect(formatComments(comments)).toBe(
      '/spec.comments [Plan] > 1. Renderer-only comment state via hook:\nLooks good',
    );
  });

  it('preserves headings containing > and : characters', () => {
    const comments = new Map<ArtifactType, Map<string, string>>([
      ['spec', new Map([['Edge Cases: What if > limit?', 'Needs clarification']])],
    ]);
    expect(formatComments(comments)).toBe(
      '/spec.comments [Spec] > Edge Cases: What if > limit?:\nNeeds clarification',
    );
  });

  it('maps artifact types to correct doc labels', () => {
    const types: ArtifactType[] = ['spec', 'plan', 'research', 'summary', 'review'];
    const labels = ['Spec', 'Plan', 'Research', 'Summary', 'Review'];

    for (const [i, type] of types.entries()) {
      const comments = new Map<ArtifactType, Map<string, string>>([
        [type, new Map([['Section', 'Comment']])],
      ]);
      expect(formatComments(comments)).toContain(`[${labels[i]}]`);
    }
  });

  it('does not add trailing blank line after last block', () => {
    const comments = new Map<ArtifactType, Map<string, string>>([
      ['spec', new Map([['Stories', 'Fix']])],
    ]);
    const result = formatComments(comments);
    expect(result.endsWith('\n\n')).toBe(false);
  });
});

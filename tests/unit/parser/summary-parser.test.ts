import { describe, it, expect } from 'vitest';
import { parseSummary } from '../../../src/main/parser/summary-parser.js';

describe('summary-parser', () => {
  it('parses a single H2 section', () => {
    const content = '## Overview\n\nThis is the overview.';
    const result = parseSummary(content);
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0]?.heading).toBe('Overview');
    expect(result.sections[0]?.content).toContain('This is the overview.');
  });

  it('parses multiple H2 sections', () => {
    const content = [
      '## Overview',
      '',
      'First section content.',
      '',
      '## Code Decisions',
      '',
      'Second section content.',
      '',
      '## Gotchas',
      '',
      'Third section content.',
    ].join('\n');
    const result = parseSummary(content);
    expect(result.sections).toHaveLength(3);
    expect(result.sections[0]?.heading).toBe('Overview');
    expect(result.sections[1]?.heading).toBe('Code Decisions');
    expect(result.sections[2]?.heading).toBe('Gotchas');
  });

  it('captures content before first H2 as Introduction', () => {
    const content = [
      '# Summary Report',
      '',
      'Some intro text here.',
      '',
      '## Overview',
      '',
      'Section content.',
    ].join('\n');
    const result = parseSummary(content);
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0]?.heading).toBe('Introduction');
    expect(result.sections[0]?.content).toContain('Some intro text here.');
    expect(result.sections[1]?.heading).toBe('Overview');
  });

  it('returns empty sections for empty content', () => {
    const result = parseSummary('');
    expect(result.sections).toHaveLength(0);
  });

  it('does not treat ## inside code blocks as headings', () => {
    const content = [
      '## Overview',
      '',
      'Here is some code:',
      '',
      '```typescript',
      '// ## This is not a heading',
      'const x = 42;',
      '```',
      '',
      '## Next Section',
      '',
      'More content.',
    ].join('\n');
    const result = parseSummary(content);
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0]?.heading).toBe('Overview');
    expect(result.sections[0]?.content).toContain('```');
    expect(result.sections[1]?.heading).toBe('Next Section');
  });

  it('preserves H3 and H4 headings within a section', () => {
    const content = [
      '## Overview',
      '',
      '### Sub-heading',
      '',
      'Content under sub-heading.',
      '',
      '#### Deep heading',
      '',
      'Deep content.',
    ].join('\n');
    const result = parseSummary(content);
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0]?.content).toContain('### Sub-heading');
    expect(result.sections[0]?.content).toContain('#### Deep heading');
  });

  it('handles content with only an H1 and no H2 sections', () => {
    const content = '# Summary\n\nJust an intro with no sections.';
    const result = parseSummary(content);
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0]?.heading).toBe('Introduction');
    expect(result.sections[0]?.content).toContain('Just an intro with no sections.');
  });
});

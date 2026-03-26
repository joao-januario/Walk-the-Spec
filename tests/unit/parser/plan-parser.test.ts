import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parsePlan, parseFileStructureContent } from '../../../src/main/parser/plan-parser.js';

const FIXTURES = path.join(__dirname, '../../fixtures');

describe('plan-parser', () => {
  describe('old format (key-value Technical Context)', () => {
    const content = fs.readFileSync(path.join(FIXTURES, 'plan.md'), 'utf-8');
    const result = parsePlan(content);

    it('extracts summary', () => {
      expect(result.summary).toContain('widget management');
    });

    it('extracts technical context key-value pairs when no Technical Approach exists', () => {
      expect(result.technicalContext).toBeDefined();
      expect(result.technicalContext['Language/Version']).toContain('TypeScript');
      expect(result.technicalContext['Storage']).toContain('Filesystem');
    });

    it('returns empty technicalApproach for old format', () => {
      expect(result.technicalApproach).toBe('');
    });

    it('extracts legacy design decisions', () => {
      expect(result.decisions.length).toBeGreaterThanOrEqual(1);
      expect(result.decisions[0].heading).toBe('Structure Decision');
    });

    it('returns empty architectureDecisions for old format', () => {
      expect(result.architectureDecisions).toHaveLength(0);
    });
  });

  describe('new format (prose Technical Approach + Architecture Decisions)', () => {
    const content = fs.readFileSync(path.join(FIXTURES, 'plan-new.md'), 'utf-8');
    const result = parsePlan(content);

    it('extracts summary', () => {
      expect(result.summary).toContain('restructured plan');
    });

    it('extracts technical approach as prose', () => {
      expect(result.technicalApproach).toContain('TypeScript 5.x with React 19');
      expect(result.technicalApproach).toContain('Electron shell');
    });

    it('returns empty technicalContext when Technical Approach exists', () => {
      expect(Object.keys(result.technicalContext)).toHaveLength(0);
    });

    it('extracts architecture decisions with structured fields', () => {
      expect(result.architectureDecisions).toHaveLength(2);

      const first = result.architectureDecisions[0];
      expect(first.heading).toContain('heading blocks for review findings');
      expect(first.decision).toContain('pipe-delimited table');
      expect(first.rationale).toContain('Tables cannot contain fenced code blocks');
      expect(first.alternativesRejected).toContain('duplicates data');
    });

    it('strips numeric prefix from decision headings', () => {
      expect(result.architectureDecisions[0].heading).not.toMatch(/^\d+\./);
      expect(result.architectureDecisions[1].heading).not.toMatch(/^\d+\./);
    });

    it('extracts file structure as structured sections', () => {
      expect(result.fileStructure).toHaveLength(1);
      const section = result.fileStructure[0];
      expect(section.title).toBe('Files');
      expect(section.entries.some(e => e.filename === 'plan-parser.ts')).toBe(true);
      expect(section.entries.some(e => e.filename === 'PlanView.tsx')).toBe(true);
    });

    it('returns empty legacy decisions when architecture decisions exist', () => {
      expect(result.decisions).toHaveLength(0);
    });
  });

  describe('code block preservation (plans with diagrams)', () => {
    const content = fs.readFileSync(path.join(FIXTURES, 'plan-with-diagrams.md'), 'utf-8');
    const result = parsePlan(content);

    it('preserves mermaid code blocks in summary', () => {
      expect(result.summary).toContain('```mermaid');
      expect(result.summary).toContain('flowchart LR');
      expect(result.summary).toContain('```');
    });

    it('preserves mermaid code blocks in technical approach', () => {
      expect(result.technicalApproach).toContain('```mermaid');
      expect(result.technicalApproach).toContain('sequenceDiagram');
    });

    it('preserves typescript code blocks in technical approach', () => {
      expect(result.technicalApproach).toContain('```typescript');
      expect(result.technicalApproach).toContain('function processData');
    });

    it('preserves prose alongside code blocks in technical approach', () => {
      expect(result.technicalApproach).toContain('TypeScript 5.x with React 19');
      expect(result.technicalApproach).toContain('renderer then displays');
    });

    it('preserves mermaid code blocks in architecture decision rationale', () => {
      const decision = result.architectureDecisions[0];
      expect(decision.rationale).toContain('```mermaid');
      expect(decision.rationale).toContain('flowchart TD');
    });

    it('does not add code blocks to decisions that have none', () => {
      const decision = result.architectureDecisions[1];
      expect(decision.rationale).not.toContain('```');
    });

    it('still extracts structured decision fields correctly with code blocks present', () => {
      expect(result.architectureDecisions).toHaveLength(2);
      const first = result.architectureDecisions[0];
      expect(first.heading).toBe('Parser preserves code blocks');
      expect(first.decision).toContain('code node handling');
      expect(first.alternativesRejected).toContain('Raw string slicing');
    });
  });

  describe('structured file structure extraction', () => {
    const content = fs.readFileSync(path.join(FIXTURES, 'plan-file-structure.md'), 'utf-8');
    const result = parsePlan(content);

    it('returns an array of FileStructureSection objects', () => {
      expect(Array.isArray(result.fileStructure)).toBe(true);
      expect(result.fileStructure.length).toBeGreaterThan(0);
    });

    it('parses section headings from # comment lines', () => {
      const titles = result.fileStructure.map(s => s.title);
      expect(titles).toContain('New dependencies');
      expect(titles).toContain('Color token definitions');
      expect(titles).toContain('New shared components');
      expect(titles).toContain('Components to remove');
      expect(titles).toContain('Main process');
    });

    it('assigns entries to their correct sections', () => {
      const newDeps = result.fileStructure.find(s => s.title === 'New dependencies');
      expect(newDeps).toBeDefined();
      expect(newDeps!.entries).toHaveLength(1);
      expect(newDeps!.entries[0].filename).toBe('package.json');
    });

    it('splits file path into directory and filename', () => {
      const colorSection = result.fileStructure.find(s => s.title === 'Color token definitions');
      const entry = colorSection!.entries[0];
      expect(entry.filePath).toBe('src/renderer/src/index.css');
      expect(entry.directory).toBe('src/renderer/src/');
      expect(entry.filename).toBe('index.css');
    });

    it('extracts inline comments', () => {
      const newDeps = result.fileStructure.find(s => s.title === 'New dependencies');
      expect(newDeps!.entries[0].comment).toBe('Add react-markdown, @tailwindcss/typography');
    });

    it('infers added operation from keywords', () => {
      const newComps = result.fileStructure.find(s => s.title === 'New shared components');
      const markdownEntry = newComps!.entries.find(e => e.filename === 'MarkdownContent.tsx');
      expect(markdownEntry!.operation).toBe('added');
    });

    it('infers modified operation from keywords', () => {
      const mainSection = result.fileStructure.find(s => s.title === 'Main process');
      const indexEntry = mainSection!.entries.find(e => e.filename === 'index.ts');
      expect(indexEntry!.operation).toBe('modified');
    });

    it('infers removed operation from keywords', () => {
      const removeSection = result.fileStructure.find(s => s.title === 'Components to remove');
      const legacyEntry = removeSection!.entries.find(e => e.filename === 'Legacy.tsx');
      expect(legacyEntry!.operation).toBe('removed');
    });

    it('uses section heading as fallback for operation inference', () => {
      const newDeps = result.fileStructure.find(s => s.title === 'New dependencies');
      // "New dependencies" heading → "add" keyword in heading → 'added'
      expect(newDeps!.entries[0].operation).toBe('added');
    });

    it('infers operation from comments in sections without keyword headings', () => {
      const mainSection = result.fileStructure.find(s => s.title === 'Main process');
      const indexEntry = mainSection!.entries.find(e => e.filename === 'index.ts');
      expect(indexEntry!.operation).toBe('modified');
      const reviewEntry = mainSection!.entries.find(e => e.filename === 'review-parser.ts');
      expect(reviewEntry!.operation).toBe('modified');
    });

    it('handles tree-format with box-drawing characters', () => {
      // The second code block has tree format
      const allEntries = result.fileStructure.flatMap(s => s.entries);
      const planEntry = allEntries.find(e => e.filename === 'plan.md');
      expect(planEntry).toBeDefined();
      expect(planEntry!.filePath).toContain('plan.md');
    });

    it('strips tree characters from file paths', () => {
      const allEntries = result.fileStructure.flatMap(s => s.entries);
      const planEntry = allEntries.find(e => e.filename === 'plan.md');
      expect(planEntry!.filePath).not.toContain('├');
      expect(planEntry!.filePath).not.toContain('└');
      expect(planEntry!.filePath).not.toContain('│');
    });

    it('omits sections with zero entries', () => {
      expect(result.fileStructure.every(s => s.entries.length > 0)).toBe(true);
    });
  });

  describe('parseFileStructureContent directly', () => {
    it('returns empty array for empty input', () => {
      expect(parseFileStructureContent('')).toEqual([]);
    });

    it('places files before any heading into a default "Files" section', () => {
      const result = parseFileStructureContent('src/main/index.ts  # Update something');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Files');
      expect(result[0].entries[0].filename).toBe('index.ts');
    });

    it('handles entry with no comment', () => {
      const result = parseFileStructureContent('src/main/index.ts');
      expect(result[0].entries[0].comment).toBeNull();
      expect(result[0].entries[0].operation).toBe('unknown');
    });

    it('does not match partial keywords', () => {
      // "address" should not match "add"
      const result = parseFileStructureContent('src/address.ts  # Handle address validation');
      expect(result[0].entries[0].operation).toBe('unknown');
    });
  });

  describe('markdown preservation (lists, blockquotes, tables)', () => {
    const content = fs.readFileSync(path.join(FIXTURES, 'plan-with-lists.md'), 'utf-8');
    const result = parsePlan(content);

    it('preserves bullet lists in summary', () => {
      expect(result.summary).toContain('- First benefit item');
      expect(result.summary).toContain('- Second benefit item');
    });

    it('preserves blockquotes in summary', () => {
      expect(result.summary).toContain('> This is an important note');
    });

    it('preserves bullet lists in technical approach', () => {
      expect(result.technicalApproach).toContain('- Step one: parse the input');
    });

    it('preserves blockquotes in technical approach', () => {
      expect(result.technicalApproach).toContain('> Important architectural constraint');
    });

    it('preserves tables in technical approach', () => {
      expect(result.technicalApproach).toContain('| Parser');
    });

    it('preserves sub-headings in technical approach', () => {
      expect(result.technicalApproach).toContain('### Sub-heading within Technical Approach');
    });

    it('preserves lists in architecture decision rationale', () => {
      const decision = result.architectureDecisions[0];
      expect(decision.rationale).toContain('- Reason one');
      expect(decision.rationale).toContain('- Reason two');
    });

    it('preserves blockquotes in architecture decision rationale', () => {
      const decision = result.architectureDecisions[0];
      expect(decision.rationale).toContain('> Additional context');
    });

    it('still extracts structured fields correctly with rich markdown', () => {
      expect(result.architectureDecisions).toHaveLength(2);
      const first = result.architectureDecisions[0];
      expect(first.heading).toBe('Use lists for structured data');
      expect(first.decision).toContain('markdown lists');
      expect(first.alternativesRejected).toContain('Custom JSON');
    });

    it('extracts file structure as structured sections', () => {
      expect(result.fileStructure.length).toBeGreaterThanOrEqual(1);
      const allEntries = result.fileStructure.flatMap(s => s.entries);
      expect(allEntries.some(e => e.filename === 'plan-parser.ts')).toBe(true);
    });
  });
});

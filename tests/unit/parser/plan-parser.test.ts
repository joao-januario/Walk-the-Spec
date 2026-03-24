import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parsePlan } from '../../../src/main/parser/plan-parser.js';

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

    it('extracts file structure from code blocks', () => {
      expect(result.fileStructure).toContain('plan-parser.ts');
      expect(result.fileStructure).toContain('PlanView.tsx');
    });

    it('returns empty legacy decisions when architecture decisions exist', () => {
      expect(result.decisions).toHaveLength(0);
    });
  });
});

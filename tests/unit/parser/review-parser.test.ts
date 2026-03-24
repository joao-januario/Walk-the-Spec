import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseReview } from '../../../src/main/parser/review-parser.js';

const FIXTURES = path.join(__dirname, '../../fixtures');

describe('review-parser', () => {
  describe('old format (table-based findings)', () => {
    const content = fs.readFileSync(path.join(FIXTURES, 'review.md'), 'utf-8');
    const result = parseReview(content);

    it('extracts all findings from the table', () => {
      expect(result.findings).toHaveLength(7);
    });

    it('parses finding fields correctly', () => {
      const f1 = result.findings[0];
      expect(f1.number).toBe(1);
      expect(f1.ruleId).toBe('ES04');
      expect(f1.severity).toBe('CRITICAL');
      expect(f1.location).toBe('src/preload/index.ts:5');
      expect(f1.summary).toContain('Raw ipcRenderer');
    });

    it('sets default values for new fields on old format findings', () => {
      const f1 = result.findings[0];
      expect(f1.why).toBe('');
      expect(f1.gain).toBe('');
      expect(f1.codeBlocks).toEqual([]);
    });

    it('parses all severity levels', () => {
      const severities = result.findings.map((f) => f.severity);
      expect(severities).toContain('CRITICAL');
      expect(severities).toContain('HIGH');
      expect(severities).toContain('MEDIUM');
      expect(severities).toContain('LOW');
      expect(severities).toContain('NEEDS_REFACTOR');
    });

    it('defaults status to unfixed when no heal summary entry', () => {
      const f5 = result.findings.find((f) => f.number === 5);
      expect(f5?.status).toBe('unfixed');
    });

    it('applies heal summary status to findings', () => {
      const f1 = result.findings.find((f) => f.number === 1);
      expect(f1?.status).toBe('FIXED');
      const f3 = result.findings.find((f) => f.number === 3);
      expect(f3?.status).toBe('MANUAL');
    });

    it('extracts heal summary when present', () => {
      const hs = result.healSummary;
      expect(hs).toBeDefined();
      if (!hs) return;
      expect(hs.date).toBe('2026-03-24');
      expect(hs.appliedCount).toBe(2);
      expect(hs.skippedCount).toBe(0);
      expect(hs.revertedCount).toBe(1);
    });

    it('extracts per-finding heal status', () => {
      const hs = result.healSummary;
      if (!hs) { expect(hs).toBeDefined(); return; }
      expect(hs.findings).toHaveLength(4);
      const f3 = hs.findings.find((f) => f.number === 3);
      expect(f3?.status).toBe('MANUAL');
      expect(f3?.notes).toContain('FeatureDetail');
    });

    it('extracts branch info', () => {
      expect(result.branch).toBe('002-spec-board');
    });
  });

  describe('new format (block-based findings)', () => {
    const content = fs.readFileSync(path.join(FIXTURES, 'review-new.md'), 'utf-8');
    const result = parseReview(content);

    it('extracts all findings from heading blocks', () => {
      expect(result.findings).toHaveLength(3);
    });

    it('parses finding number and rule from heading', () => {
      const f1 = result.findings[0];
      expect(f1.number).toBe(1);
      expect(f1.ruleId).toBe('ES04');
    });

    it('parses severity and location', () => {
      const f1 = result.findings[0];
      expect(f1.severity).toBe('CRITICAL');
      expect(f1.location).toBe('src/preload/index.ts:5');
    });

    it('extracts why field', () => {
      const f1 = result.findings[0];
      expect(f1.why).toContain('bypassing the contextBridge security boundary');
    });

    it('extracts gain field', () => {
      const f1 = result.findings[0];
      expect(f1.gain).toContain('restricts the renderer');
    });

    it('extracts code blocks with language', () => {
      const f1 = result.findings[0];
      expect(f1.codeBlocks.length).toBeGreaterThanOrEqual(2);
      expect(f1.codeBlocks[0].language).toBe('typescript');
      expect(f1.codeBlocks[0].code).toContain('ipcRenderer.on');
    });

    it('handles findings with no code blocks', () => {
      const f2 = result.findings[1];
      expect(f2.codeBlocks).toHaveLength(0);
      expect(f2.why).toContain('defeats TypeScript');
    });

    it('handles findings with code blocks at end', () => {
      const f3 = result.findings[2];
      expect(f3.codeBlocks.length).toBeGreaterThanOrEqual(2);
      expect(f3.severity).toBe('MEDIUM');
    });

    it('extracts branch info', () => {
      expect(result.branch).toBe('003-test-feature');
    });
  });

  describe('fallback behavior', () => {
    it('falls back to table parsing when no block findings found', () => {
      const tableOnly = fs.readFileSync(path.join(FIXTURES, 'review.md'), 'utf-8');
      const result = parseReview(tableOnly);
      expect(result.findings.length).toBe(7);
    });

    it('prefers block format over table when both could match', () => {
      const newFormat = fs.readFileSync(path.join(FIXTURES, 'review-new.md'), 'utf-8');
      const result = parseReview(newFormat);
      expect(result.findings.length).toBe(3);
      expect(result.findings[0].why).not.toBe('');
    });
  });

  describe('edge cases', () => {
    it('returns empty findings for empty string', () => {
      const empty = parseReview('');
      expect(empty.findings).toEqual([]);
      expect(empty.healSummary).toBeNull();
    });

    it('handles review with no findings (clean review)', () => {
      const clean = parseReview('## Branch Engineering Review\n\n### Findings\n\n| # | Rule | Category | File:Line | Summary | Fix |\n|---|------|----------|-----------|---------|-----|\n');
      expect(clean.findings).toEqual([]);
    });
  });
});

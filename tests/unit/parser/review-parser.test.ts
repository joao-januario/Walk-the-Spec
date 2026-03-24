import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseReview } from '../../../src/main/parser/review-parser.js';

const FIXTURES = path.join(__dirname, '../../fixtures');

describe('review-parser', () => {
  const content = fs.readFileSync(path.join(FIXTURES, 'review.md'), 'utf-8');
  const result = parseReview(content);

  describe('findings', () => {
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

    it('parses all severity levels', () => {
      const severities = result.findings.map((f) => f.severity);
      expect(severities).toContain('CRITICAL');
      expect(severities).toContain('HIGH');
      expect(severities).toContain('MEDIUM');
      expect(severities).toContain('LOW');
      expect(severities).toContain('NEEDS_REFACTOR');
    });

    it('defaults status to unfixed when no heal summary', () => {
      // Findings 5, 6 have no heal summary entry
      const f5 = result.findings.find((f) => f.number === 5);
      expect(f5?.status).toBe('unfixed');
    });

    it('applies heal summary status to findings', () => {
      const f1 = result.findings.find((f) => f.number === 1);
      expect(f1?.status).toBe('FIXED');
      const f3 = result.findings.find((f) => f.number === 3);
      expect(f3?.status).toBe('MANUAL');
    });
  });

  describe('heal summary', () => {
    it('extracts heal summary when present', () => {
      const hs = result.healSummary;
      expect(hs).toBeDefined();
      if (!hs) return; // guard for TypeScript
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
  });

  describe('summary stats', () => {
    it('extracts branch and base info', () => {
      expect(result.branch).toBe('002-spec-board');
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

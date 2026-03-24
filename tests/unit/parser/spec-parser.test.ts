import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseSpec } from '../../../src/main/parser/spec-parser.js';

const FIXTURES = path.join(__dirname, '../../fixtures');

describe('spec-parser', () => {
  const content = fs.readFileSync(path.join(FIXTURES, 'spec.md'), 'utf-8');
  const result = parseSpec(content);

  describe('user stories', () => {
    it('extracts all user stories', () => {
      expect(result.userStories).toHaveLength(2);
    });

    it('extracts user story fields', () => {
      const us1 = result.userStories[0];
      expect(us1.number).toBe(1);
      expect(us1.title).toContain('Create Widget');
      expect(us1.priority).toBe('P1');
      expect(us1.description).toContain('creates a new widget');
    });

    it('extracts GWT acceptance scenarios', () => {
      const us1 = result.userStories[0];
      expect(us1.acceptanceScenarios.length).toBeGreaterThanOrEqual(1);
      const scenario = us1.acceptanceScenarios[0];
      expect(scenario.given).toBeDefined();
      expect(scenario.when).toBeDefined();
      expect(scenario.then).toBeDefined();
    });
  });

  describe('requirements', () => {
    it('extracts requirements with FR-NNN IDs', () => {
      expect(result.requirements.length).toBeGreaterThanOrEqual(3);
      expect(result.requirements[0].id).toBe('FR-001');
      expect(result.requirements[0].text).toContain('create widgets');
    });
  });

  describe('success criteria', () => {
    it('extracts success criteria with SC-NNN IDs', () => {
      expect(result.successCriteria.length).toBeGreaterThanOrEqual(2);
      expect(result.successCriteria[0].id).toBe('SC-001');
    });
  });

  describe('edge cases', () => {
    it('extracts edge case items', () => {
      expect(result.edgeCases.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('entities', () => {
    it('extracts key entities', () => {
      expect(result.entities.length).toBeGreaterThanOrEqual(1);
      expect(result.entities[0].name).toBe('Widget');
    });
  });
});

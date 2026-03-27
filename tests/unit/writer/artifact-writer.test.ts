import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { editTaskCheckbox, editRequirementText } from '../../../src/main/writer/artifact-writer.js';

const TEST_DIR = path.join(os.tmpdir(), '.walk-the-spec-writer-test-' + Date.now());

describe('artifact-writer', () => {
  beforeEach(() => fs.mkdirSync(TEST_DIR, { recursive: true }));
  afterEach(() => { if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true }); });

  describe('editTaskCheckbox', () => {
    it('checks an unchecked task', async () => {
      const filePath = path.join(TEST_DIR, 'tasks.md');
      const original = '## Phase 1\n\n- [ ] T001 Do something\n- [ ] T002 Do another\n';
      fs.writeFileSync(filePath, original);

      await editTaskCheckbox(filePath, 'T001', true);

      const result = fs.readFileSync(filePath, 'utf-8');
      expect(result).toContain('- [x] T001 Do something');
      expect(result).toContain('- [ ] T002 Do another');
    });

    it('unchecks a checked task', async () => {
      const filePath = path.join(TEST_DIR, 'tasks.md');
      fs.writeFileSync(filePath, '- [x] T001 Done\n');

      await editTaskCheckbox(filePath, 'T001', false);

      const result = fs.readFileSync(filePath, 'utf-8');
      expect(result).toContain('- [ ] T001 Done');
    });

    it('preserves all other content byte-for-byte', async () => {
      const filePath = path.join(TEST_DIR, 'tasks.md');
      const original = '# Tasks\n\n**Note**: Keep this.\n\n- [ ] T001 Task one\n- [x] T002 Task two\n\n## End\n';
      fs.writeFileSync(filePath, original);

      await editTaskCheckbox(filePath, 'T001', true);

      const result = fs.readFileSync(filePath, 'utf-8');
      const expected = original.replace('- [ ] T001', '- [x] T001');
      expect(result).toBe(expected);
    });
  });

  describe('editRequirementText', () => {
    it('updates requirement text preserving ID and formatting', async () => {
      const filePath = path.join(TEST_DIR, 'spec.md');
      const original = '### Functional Requirements\n\n- **FR-001**: System MUST do old thing\n- **FR-002**: System MUST do other\n';
      fs.writeFileSync(filePath, original);

      await editRequirementText(filePath, 'FR-001', 'System MUST do new thing');

      const result = fs.readFileSync(filePath, 'utf-8');
      expect(result).toContain('- **FR-001**: System MUST do new thing');
      expect(result).toContain('- **FR-002**: System MUST do other');
    });
  });
});

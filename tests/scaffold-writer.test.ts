import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { executeIntegration } from '../src/main/integration/scaffold-writer.js';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCAFFOLD_DIR = path.join(PROJECT_ROOT, 'resources/scaffold');

describe('scaffold-writer', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffold-writer-test-'));
    fs.mkdirSync(path.join(tmpDir, '.git'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('executeIntegration', () => {
    it('creates all scaffold files in an empty project', async () => {
      await executeIntegration(tmpDir, SCAFFOLD_DIR);

      // Check some key files exist
      expect(fs.existsSync(path.join(tmpDir, '.claude', 'commands', 'spec.plan.md'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, '.claude', 'specify', 'scripts', 'bash', 'common.sh'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, '.claude', 'specify', 'templates', 'spec-template.md'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, '.claude', 'best-practices', 'testing.md'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, '.claude', 'specify', '.scaffold-version'))).toBe(true);
    });

    it('creates CLAUDE.md from template when it does not exist', async () => {
      await executeIntegration(tmpDir, SCAFFOLD_DIR);

      expect(fs.existsSync(path.join(tmpDir, 'CLAUDE.md'))).toBe(true);
      const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(content).toContain('[PROJECT]');
    });

    it('does not overwrite existing CLAUDE.md (FR-014)', async () => {
      fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# My Existing Project');

      await executeIntegration(tmpDir, SCAFFOLD_DIR);

      const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(content).toBe('# My Existing Project');
    });

    it('wipes .claude/specs/ directory (FR-016)', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude', 'specs', 'old-branch'), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, '.claude', 'specs', 'old-branch', 'spec.md'), '# Old');

      await executeIntegration(tmpDir, SCAFFOLD_DIR);

      expect(fs.existsSync(path.join(tmpDir, '.claude', 'specs', 'old-branch'))).toBe(false);
    });

    it('preserves non-scaffold files in .claude/ (FR-004)', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, '.claude', 'settings.local.json'), '{"key": "value"}');

      await executeIntegration(tmpDir, SCAFFOLD_DIR);

      const content = fs.readFileSync(path.join(tmpDir, '.claude', 'settings.local.json'), 'utf-8');
      expect(content).toBe('{"key": "value"}');
    });

    it('preserves template overrides (FR-005)', async () => {
      const overridesDir = path.join(tmpDir, '.claude', 'specify', 'templates', 'overrides');
      fs.mkdirSync(overridesDir, { recursive: true });
      fs.writeFileSync(path.join(overridesDir, 'my-override.md'), '# Custom');

      await executeIntegration(tmpDir, SCAFFOLD_DIR);

      const content = fs.readFileSync(path.join(overridesDir, 'my-override.md'), 'utf-8');
      expect(content).toBe('# Custom');
    });

    it('overwrites existing scaffold-owned files (FR-003)', async () => {
      const cmdDir = path.join(tmpDir, '.claude', 'commands');
      fs.mkdirSync(cmdDir, { recursive: true });
      fs.writeFileSync(path.join(cmdDir, 'spec.plan.md'), 'OLD CONTENT');

      await executeIntegration(tmpDir, SCAFFOLD_DIR);

      const content = fs.readFileSync(path.join(cmdDir, 'spec.plan.md'), 'utf-8');
      expect(content).not.toBe('OLD CONTENT');
    });

    it('writes the scaffold version stamp', async () => {
      await executeIntegration(tmpDir, SCAFFOLD_DIR);

      const version = fs.readFileSync(
        path.join(tmpDir, '.claude', 'specify', '.scaffold-version'),
        'utf-8',
      );
      expect(version.trim()).toBe('1.1.0');
    });

    it('creates empty context and memory directories', async () => {
      await executeIntegration(tmpDir, SCAFFOLD_DIR);

      expect(fs.existsSync(path.join(tmpDir, '.claude', 'specify', 'context'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, '.claude', 'specify', 'memory'))).toBe(true);
    });
  });
});

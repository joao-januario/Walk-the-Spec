import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateIntegrationPlan } from '../src/main/integration/integration-planner.js';

// Resolve scaffold dir from test location (Vitest __dirname differs from electron-vite)
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCAFFOLD_DIR = path.join(PROJECT_ROOT, 'resources/scaffold');

describe('integration-planner', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'integration-planner-test-'));
    // Ensure .git exists (required by planner)
    fs.mkdirSync(path.join(tmpDir, '.git'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('generateIntegrationPlan', () => {
    it('marks all scaffold files as create when target has no .claude/ directory', async () => {
      const plan = await generateIntegrationPlan(tmpDir, SCAFFOLD_DIR);

      expect(plan.targetPath).toBe(tmpDir);
      expect(plan.scaffoldVersion).toBe('1.0.0');
      expect(plan.createCount).toBeGreaterThan(0);
      expect(plan.overwriteCount).toBe(0);
      expect(plan.preserveCount).toBe(0);
      expect(plan.specsWillBeWiped).toBe(false);
      expect(plan.claudeMdExists).toBe(false);

      const createFiles = plan.files.filter((f) => f.action === 'create');
      expect(createFiles.length).toBe(plan.createCount);
    });

    it('marks existing scaffold files as overwrite', async () => {
      // Create a file at a scaffold-owned path
      const cmdDir = path.join(tmpDir, '.claude', 'commands');
      fs.mkdirSync(cmdDir, { recursive: true });
      fs.writeFileSync(path.join(cmdDir, 'spec.plan.md'), 'old content');

      const plan = await generateIntegrationPlan(tmpDir, SCAFFOLD_DIR);

      const specPlan = plan.files.find((f) => f.relativePath === '.claude/commands/spec.plan.md');
      expect(specPlan).toBeDefined();
      expect(specPlan!.action).toBe('overwrite');
      expect(plan.overwriteCount).toBeGreaterThan(0);
    });

    it('marks non-scaffold files in .claude/ as preserve', async () => {
      // Create a user file not in the scaffold
      const settingsDir = path.join(tmpDir, '.claude');
      fs.mkdirSync(settingsDir, { recursive: true });
      fs.writeFileSync(path.join(settingsDir, 'settings.local.json'), '{}');

      const plan = await generateIntegrationPlan(tmpDir, SCAFFOLD_DIR);

      const settings = plan.files.find((f) => f.relativePath === '.claude/settings.local.json');
      expect(settings).toBeDefined();
      expect(settings!.action).toBe('preserve');
      expect(settings!.category).toBe('user');
    });

    it('detects .claude/specs/ for wiping', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude', 'specs', 'some-branch'), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, '.claude', 'specs', 'some-branch', 'spec.md'), '# Spec');

      const plan = await generateIntegrationPlan(tmpDir, SCAFFOLD_DIR);
      expect(plan.specsWillBeWiped).toBe(true);
    });

    it('detects existing CLAUDE.md', async () => {
      fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# My Project');

      const plan = await generateIntegrationPlan(tmpDir, SCAFFOLD_DIR);
      expect(plan.claudeMdExists).toBe(true);
    });

    it('preserves template overrides', async () => {
      const overridesDir = path.join(tmpDir, '.claude', 'specify', 'templates', 'overrides');
      fs.mkdirSync(overridesDir, { recursive: true });
      fs.writeFileSync(path.join(overridesDir, 'custom.md'), '# Custom override');

      const plan = await generateIntegrationPlan(tmpDir, SCAFFOLD_DIR);

      const override = plan.files.find((f) =>
        f.relativePath.includes('templates/overrides/'),
      );
      expect(override).toBeDefined();
      expect(override!.action).toBe('preserve');
    });

    it('categorizes files correctly by path prefix', async () => {
      const plan = await generateIntegrationPlan(tmpDir, SCAFFOLD_DIR);

      const commands = plan.files.filter((f) => f.category === 'command');
      const scripts = plan.files.filter((f) => f.category === 'script');
      const templates = plan.files.filter((f) => f.category === 'template');
      const bestPractices = plan.files.filter((f) => f.category === 'best-practice');

      expect(commands.length).toBeGreaterThan(0);
      expect(scripts.length).toBeGreaterThan(0);
      expect(templates.length).toBeGreaterThan(0);
      expect(bestPractices.length).toBeGreaterThan(0);

      // All commands should have paths starting with .claude/commands/
      for (const cmd of commands) {
        expect(cmd.relativePath).toMatch(/^\.claude\/commands\//);
      }
    });

    it('uses forward slashes in all relative paths regardless of OS', async () => {
      const plan = await generateIntegrationPlan(tmpDir, SCAFFOLD_DIR);

      for (const file of plan.files) {
        expect(file.relativePath).not.toContain('\\');
      }
    });

    it('includes CLAUDE.md.template as a meta file to create when no CLAUDE.md exists', async () => {
      const plan = await generateIntegrationPlan(tmpDir, SCAFFOLD_DIR);

      const claudeMd = plan.files.find((f) => f.relativePath === 'CLAUDE.md');
      expect(claudeMd).toBeDefined();
      expect(claudeMd!.action).toBe('create');
      expect(claudeMd!.category).toBe('meta');
    });

    it('does not include CLAUDE.md when one already exists (FR-014)', async () => {
      fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# Existing');

      const plan = await generateIntegrationPlan(tmpDir, SCAFFOLD_DIR);

      const claudeMd = plan.files.find(
        (f) => f.relativePath === 'CLAUDE.md' && f.action !== 'preserve',
      );
      expect(claudeMd).toBeUndefined();
    });
  });
});

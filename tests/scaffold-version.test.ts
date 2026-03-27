import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  readScaffoldVersion,
  writeScaffoldVersion,
  getBundledScaffoldVersion,
  getScaffoldDir,
  isScaffoldOutdated,
} from '../src/main/integration/scaffold-version.js';

// In Vitest, __dirname differs from electron-vite. Resolve project root from test location.
const PROJECT_ROOT = path.resolve(__dirname, '..');

describe('scaffold-version', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffold-version-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('readScaffoldVersion', () => {
    it('returns the version string when the file exists', async () => {
      const versionDir = path.join(tmpDir, '.claude', 'specify');
      fs.mkdirSync(versionDir, { recursive: true });
      fs.writeFileSync(path.join(versionDir, '.scaffold-version'), '1.0.0\n');

      const version = await readScaffoldVersion(tmpDir);
      expect(version).toBe('1.0.0');
    });

    it('returns null when the file does not exist', async () => {
      const version = await readScaffoldVersion(tmpDir);
      expect(version).toBeNull();
    });

    it('trims whitespace from the version string', async () => {
      const versionDir = path.join(tmpDir, '.claude', 'specify');
      fs.mkdirSync(versionDir, { recursive: true });
      fs.writeFileSync(path.join(versionDir, '.scaffold-version'), '  2.1.0  \n');

      const version = await readScaffoldVersion(tmpDir);
      expect(version).toBe('2.1.0');
    });
  });

  describe('writeScaffoldVersion', () => {
    it('creates the version file with the given version', async () => {
      await writeScaffoldVersion(tmpDir, '1.0.0');

      const content = fs.readFileSync(
        path.join(tmpDir, '.claude', 'specify', '.scaffold-version'),
        'utf-8',
      );
      expect(content.trim()).toBe('1.0.0');
    });

    it('creates parent directories if they do not exist', async () => {
      await writeScaffoldVersion(tmpDir, '1.0.0');

      expect(fs.existsSync(path.join(tmpDir, '.claude', 'specify'))).toBe(true);
    });

    it('overwrites an existing version file', async () => {
      await writeScaffoldVersion(tmpDir, '1.0.0');
      await writeScaffoldVersion(tmpDir, '2.0.0');

      const version = await readScaffoldVersion(tmpDir);
      expect(version).toBe('2.0.0');
    });
  });

  describe('getBundledScaffoldVersion', () => {
    it('returns a non-empty version string', async () => {
      const scaffoldDir = getScaffoldDir(PROJECT_ROOT);
      const version = await getBundledScaffoldVersion(scaffoldDir);
      expect(version).toBeTruthy();
      expect(typeof version).toBe('string');
    });
  });

  describe('isScaffoldOutdated', () => {
    it('returns true when project has no scaffold version', async () => {
      const result = await isScaffoldOutdated(tmpDir, '1.0.0');
      expect(result).toBe(true);
    });

    it('returns true when versions do not match', async () => {
      await writeScaffoldVersion(tmpDir, '1.0.0');
      const result = await isScaffoldOutdated(tmpDir, '2.0.0');
      expect(result).toBe(true);
    });

    it('returns false when versions match', async () => {
      await writeScaffoldVersion(tmpDir, '1.0.0');
      const result = await isScaffoldOutdated(tmpDir, '1.0.0');
      expect(result).toBe(false);
    });
  });
});

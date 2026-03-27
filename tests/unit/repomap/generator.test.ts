import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateRepoMap, getMapPath, isMapValid } from '../../../src/main/repomap/generator.js';
import { getTypescriptExtractor } from '../../../src/main/repomap/ts-extractor.js';
import type { Extractor } from '../../../src/main/repomap/types.js';

describe('generator', () => {
  let tmpDir: string;
  let typescriptExtractor: Extractor;

  beforeAll(async () => {
    typescriptExtractor = await getTypescriptExtractor();
  });

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'repomap-test-'));
    // Create a minimal project structure
    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, 'src', 'index.ts'),
      `export function main(): void { console.log('hello'); }\nexport const VERSION = '1.0.0';\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'src', 'utils.ts'),
      `import { main } from './index.js';\nexport function helper(x: number): string { return String(x); }\n`,
    );
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('getMapPath', () => {
    it('returns the correct path', () => {
      const result = getMapPath('/projects/my-app');
      expect(result).toContain('.claude');
      expect(result).toContain('repo-map.md');
    });
  });

  describe('generateRepoMap', () => {
    it('generates a map file', async () => {
      const map = await generateRepoMap(tmpDir, [typescriptExtractor]);

      const mapPath = getMapPath(tmpDir);
      expect(fs.existsSync(mapPath)).toBe(true);

      const content = fs.readFileSync(mapPath, 'utf-8');
      expect(content).toContain('# Repo Map');
      expect(content).toContain('src/index.ts');
      expect(content).toContain('src/utils.ts');
    });

    it('extracts identifiers from discovered files', async () => {
      const map = await generateRepoMap(tmpDir, [typescriptExtractor]);

      expect(map.files).toHaveLength(2);

      const indexFile = map.files.find((f) => f.path === 'src/index.ts');
      expect(indexFile).toBeDefined();
      expect(indexFile!.identifiers.some((id) => id.name === 'main')).toBe(true);
      expect(indexFile!.identifiers.some((id) => id.name === 'VERSION')).toBe(true);

      const utilsFile = map.files.find((f) => f.path === 'src/utils.ts');
      expect(utilsFile).toBeDefined();
      expect(utilsFile!.identifiers.some((id) => id.name === 'helper')).toBe(true);
    });

    it('includes SHA-256 hashes per file', async () => {
      const map = await generateRepoMap(tmpDir, [typescriptExtractor]);

      for (const file of map.files) {
        expect(file.hash).toMatch(/^[a-f0-9]{64}$/);
      }
    });

    it('ignores node_modules and other excluded dirs', async () => {
      // Create a file in node_modules
      fs.mkdirSync(path.join(tmpDir, 'node_modules', 'dep'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, 'node_modules', 'dep', 'index.ts'),
        'export function dep(): void {}\n',
      );

      const map = await generateRepoMap(tmpDir, [typescriptExtractor]);
      const depFile = map.files.find((f) => f.path.includes('node_modules'));
      expect(depFile).toBeUndefined();
    });

    it('sets metadata correctly', async () => {
      const map = await generateRepoMap(tmpDir, [typescriptExtractor]);

      expect(map.metadata.fileCount).toBe(2);
      expect(map.metadata.tokenEstimate).toBeGreaterThan(0);
      expect(map.metadata.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(map.metadata.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('creates context directory if it does not exist', async () => {
      const contextDir = path.join(tmpDir, '.claude', 'specify', 'context');
      expect(fs.existsSync(contextDir)).toBe(false);

      await generateRepoMap(tmpDir, [typescriptExtractor]);

      expect(fs.existsSync(contextDir)).toBe(true);
    });
  });

  describe('isMapValid', () => {
    it('returns false when map does not exist', () => {
      expect(isMapValid(tmpDir)).toBe(false);
    });

    it('returns true after generation', async () => {
      await generateRepoMap(tmpDir, [typescriptExtractor]);
      expect(isMapValid(tmpDir)).toBe(true);
    });

    it('returns false for corrupted map', async () => {
      const mapPath = getMapPath(tmpDir);
      fs.mkdirSync(path.dirname(mapPath), { recursive: true });
      fs.writeFileSync(mapPath, 'this is not a valid map');
      expect(isMapValid(tmpDir)).toBe(false);
    });
  });
});

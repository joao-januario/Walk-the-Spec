import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getTypescriptExtractor } from '../../../src/main/repomap/ts-extractor.js';
import type { Extractor } from '../../../src/main/repomap/types.js';

const FIXTURES = path.join(__dirname, '../../fixtures/repomap');

describe('typescriptExtractor', () => {
  let typescriptExtractor: Extractor;

  beforeAll(async () => {
    typescriptExtractor = await getTypescriptExtractor();
  });

  describe('extensions', () => {
    it('handles .ts, .tsx, .js, .jsx', () => {
      expect(typescriptExtractor.extensions).toEqual(['.ts', '.tsx', '.js', '.jsx']);
    });
  });

  describe('extract (TypeScript file)', () => {
    const filePath = path.join(FIXTURES, 'sample.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    it('produces a relative path', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      expect(result.path).toBe('sample.ts');
    });

    it('produces a SHA-256 hash', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('extracts exported interface', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      const iface = result.identifiers.find((id) => id.name === 'WatcherEvents');
      expect(iface).toBeDefined();
      expect(iface!.kind).toBe('interface');
      expect(iface!.exported).toBe(true);
      expect(iface!.signature).toContain('export interface WatcherEvents');
    });

    it('extracts exported type alias', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      const type = result.identifiers.find((id) => id.name === 'Phase');
      expect(type).toBeDefined();
      expect(type!.kind).toBe('type');
      expect(type!.exported).toBe(true);
    });

    it('extracts exported enum', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      const en = result.identifiers.find((id) => id.name === 'Status');
      expect(en).toBeDefined();
      expect(en!.kind).toBe('enum');
      expect(en!.exported).toBe(true);
    });

    it('extracts exported const', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      const c = result.identifiers.find((id) => id.name === 'DEFAULT_TIMEOUT');
      expect(c).toBeDefined();
      expect(c!.kind).toBe('variable');
      expect(c!.exported).toBe(true);
    });

    it('extracts exported class with methods', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      const cls = result.identifiers.find((id) => id.name === 'ProjectWatcher' && id.kind === 'class');
      expect(cls).toBeDefined();
      expect(cls!.exported).toBe(true);

      const methods = result.identifiers.filter((id) => id.parent === 'ProjectWatcher');
      const methodNames = methods.map((m) => m.name);
      expect(methodNames).toContain('start');
      expect(methodNames).toContain('stop');
      expect(methodNames).toContain('create');
    });

    it('marks static methods', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      const create = result.identifiers.find((id) => id.name === 'create' && id.parent === 'ProjectWatcher');
      expect(create).toBeDefined();
      expect(create!.signature).toContain('static');
    });

    it('extracts exported functions', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      const fn = result.identifiers.find((id) => id.name === 'watchProject');
      expect(fn).toBeDefined();
      expect(fn!.kind).toBe('function');
      expect(fn!.exported).toBe(true);
      expect(fn!.signature).toContain('projectId: string');
    });

    it('extracts async function signatures', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      const fn = result.identifiers.find((id) => id.name === 'scanFiles');
      expect(fn).toBeDefined();
      expect(fn!.signature).toContain('async');
      expect(fn!.signature).toContain('Promise<string[]>');
    });

    it('does NOT extract non-exported identifiers', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      const internal = result.identifiers.find((id) => id.name === 'internalHelper');
      expect(internal).toBeUndefined();

      const priv = result.identifiers.find((id) => id.name === 'privateConst');
      expect(priv).toBeUndefined();
    });

    it('extracts imports', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      expect(result.imports.length).toBeGreaterThanOrEqual(2);

      const pathImport = result.imports.find((i) => i.source === 'path');
      expect(pathImport).toBeDefined();
      expect(pathImport!.names).toContain('path');

      const localImport = result.imports.find((i) => i.source === '../utils/paths.js');
      expect(localImport).toBeDefined();
      expect(localImport!.names).toContain('normalizePath');
    });

    it('extracts type-only imports', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      const typeImport = result.imports.find((i) => i.source === './types.js');
      expect(typeImport).toBeDefined();
      expect(typeImport!.names).toContain('SomeType');
    });
  });

  describe('extract (TSX file)', () => {
    const filePath = path.join(FIXTURES, 'sample-react.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    it('parses JSX without errors', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      expect(result.identifiers.length).toBeGreaterThan(0);
    });

    it('extracts component function', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      const button = result.identifiers.find((id) => id.name === 'Button');
      expect(button).toBeDefined();
      expect(button!.kind).toBe('function');
      expect(button!.exported).toBe(true);
    });

    it('extracts interface from TSX', () => {
      const result = typescriptExtractor.extract(filePath, content, FIXTURES);
      const props = result.identifiers.find((id) => id.name === 'ButtonProps');
      expect(props).toBeDefined();
      expect(props!.kind).toBe('interface');
    });
  });
});

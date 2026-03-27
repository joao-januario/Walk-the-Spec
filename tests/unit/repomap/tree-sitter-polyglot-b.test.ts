import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { initTreeSitter, loadLanguage, createTreeSitterExtractor } from '../../../src/main/repomap/tree-sitter/extractor.js';
import { LANGUAGE_CONFIGS } from '../../../src/main/repomap/tree-sitter/languages.js';
import { QUERY_REGISTRY } from '../../../src/main/repomap/tree-sitter/queries.js';
import type { Extractor } from '../../../src/main/repomap/types.js';

const FIXTURES = path.join(__dirname, '../../fixtures/repomap');

function getExtractorForLang(id: string): Promise<Extractor> {
  const config = LANGUAGE_CONFIGS.find((c) => c.id === id);
  if (!config) throw new Error(`No config for language: ${id}`);
  const queries = QUERY_REGISTRY.get(id);
  if (!queries) throw new Error(`No queries for language: ${id}`);
  return loadLanguage(config).then((lang) => createTreeSitterExtractor(config, lang, queries));
}

describe('tree-sitter polyglot B (Lua, Elixir, Zig, Bash, OCaml, ObjC, Solidity, ReScript)', () => {
  beforeAll(async () => {
    await initTreeSitter();
  });

  describe('Lua', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('lua'); });

    it('extracts global functions', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.lua'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.lua'), content, FIXTURES);
      const fn = result.identifiers.find((id) => id.name === 'start_server');
      expect(fn).toBeDefined();
    });

    it('extracts local functions', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.lua'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.lua'), content, FIXTURES);
      const fn = result.identifiers.find((id) => id.name === 'internal_helper');
      expect(fn).toBeDefined();
    });

    it('extracts require imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.lua'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.lua'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('Elixir', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('elixir'); });

    it('extracts modules', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.ex'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.ex'), content, FIXTURES);
      expect(result.identifiers.length).toBeGreaterThan(0);
    });

    it('extracts functions', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.ex'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.ex'), content, FIXTURES);
      const fn = result.identifiers.find((id) => id.name === 'get_user' || id.name === 'create_app');
      expect(fn).toBeDefined();
    });

    it('extracts imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.ex'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.ex'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('Zig', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('zig'); });

    it('extracts pub functions as exported', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.zig'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.zig'), content, FIXTURES);
      const fn = result.identifiers.find((id) => id.name === 'startServer');
      expect(fn).toBeDefined();
      expect(fn!.exported).toBe(true);
    });

    it('extracts non-pub as unexported', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.zig'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.zig'), content, FIXTURES);
      const config = result.identifiers.find((id) => id.name === 'Config');
      expect(config).toBeDefined();
      expect(config!.exported).toBe(false);
    });

    it('extracts @import', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.zig'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.zig'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('Bash', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('bash'); });

    it('extracts functions', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.sh'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.sh'), content, FIXTURES);
      const fn = result.identifiers.find((id) => id.name === 'start_server');
      expect(fn).toBeDefined();
      expect(fn!.kind).toBe('function');
    });

    it('extracts source imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.sh'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.sh'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('OCaml', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('ocaml'); });

    it('extracts let bindings', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.ml'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.ml'), content, FIXTURES);
      const fn = result.identifiers.find((id) => id.name === 'get_user');
      expect(fn).toBeDefined();
    });

    it('extracts type definitions', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.ml'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.ml'), content, FIXTURES);
      const userType = result.identifiers.find((id) => id.name === 'user');
      expect(userType).toBeDefined();
    });

    it('extracts open imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.ml'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.ml'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('Objective-C', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('objc'); });

    it('extracts classes', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.m'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.m'), content, FIXTURES);
      const cls = result.identifiers.find((id) => id.name === 'UserService');
      expect(cls).toBeDefined();
    });

    it('extracts protocols', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.m'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.m'), content, FIXTURES);
      const proto = result.identifiers.find((id) => id.name === 'Repository');
      expect(proto).toBeDefined();
    });

    it('extracts imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.m'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.m'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('Solidity', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('solidity'); });

    it('extracts contracts', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.sol'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.sol'), content, FIXTURES);
      const contract = result.identifiers.find((id) => id.name === 'UserRegistry');
      expect(contract).toBeDefined();
    });

    it('extracts interfaces and structs', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.sol'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.sol'), content, FIXTURES);
      const iface = result.identifiers.find((id) => id.name === 'IRepository');
      expect(iface).toBeDefined();
      const struct = result.identifiers.find((id) => id.name === 'UserData');
      expect(struct).toBeDefined();
    });

    it('extracts imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.sol'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.sol'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('ReScript', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('rescript'); });

    it('extracts let bindings', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.res'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.res'), content, FIXTURES);
      const fn = result.identifiers.find((id) => id.name === 'getUser');
      expect(fn).toBeDefined();
    });

    it('extracts modules', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.res'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.res'), content, FIXTURES);
      const mod = result.identifiers.find((id) => id.name === 'UserService');
      expect(mod).toBeDefined();
    });

    it('extracts open imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.res'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.res'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });
});

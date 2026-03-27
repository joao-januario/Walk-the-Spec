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

describe('tree-sitter extractor', () => {
  beforeAll(async () => {
    await initTreeSitter();
  });

  describe('Python', () => {
    let extractor: Extractor;
    beforeAll(async () => {
      extractor = await getExtractorForLang('python');
    });

    it('handles .py and .pyw extensions', () => {
      expect(extractor.extensions).toContain('.py');
      expect(extractor.extensions).toContain('.pyw');
    });

    it('extracts top-level functions', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.py'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.py'), content, FIXTURES);

      const createApp = result.identifiers.find((id) => id.name === 'create_app');
      expect(createApp).toBeDefined();
      expect(createApp!.kind).toBe('function');
      expect(createApp!.exported).toBe(true);
    });

    it('extracts classes', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.py'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.py'), content, FIXTURES);

      const userService = result.identifiers.find((id) => id.name === 'UserService');
      expect(userService).toBeDefined();
      expect(userService!.kind).toBe('class');
    });

    it('extracts methods inside classes', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.py'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.py'), content, FIXTURES);

      const getUser = result.identifiers.find((id) => id.name === 'get_user');
      expect(getUser).toBeDefined();
      expect(getUser!.kind).toBe('method');
      expect(getUser!.parent).toBe('UserService');
    });

    it('extracts imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.py'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.py'), content, FIXTURES);

      expect(result.imports.length).toBeGreaterThan(0);
      const osImport = result.imports.find((i) => i.source === 'os');
      expect(osImport).toBeDefined();
    });

    it('produces a relative path and hash', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.py'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.py'), content, FIXTURES);

      expect(result.path).toBe('sample.py');
      expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('Java', () => {
    let extractor: Extractor;
    beforeAll(async () => {
      extractor = await getExtractorForLang('java');
    });

    it('extracts public class', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'Sample.java'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'Sample.java'), content, FIXTURES);

      const controller = result.identifiers.find((id) => id.name === 'UserController');
      expect(controller).toBeDefined();
      expect(controller!.kind).toBe('class');
      expect(controller!.exported).toBe(true);
    });

    it('filters out private methods', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'Sample.java'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'Sample.java'), content, FIXTURES);

      const validateInput = result.identifiers.find((id) => id.name === 'validateInput');
      expect(validateInput).toBeDefined();
      expect(validateInput!.exported).toBe(false);
    });

    it('filters out protected methods', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'Sample.java'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'Sample.java'), content, FIXTURES);

      const logAccess = result.identifiers.find((id) => id.name === 'logAccess');
      expect(logAccess).toBeDefined();
      expect(logAccess!.exported).toBe(false);
    });

    it('extracts public methods', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'Sample.java'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'Sample.java'), content, FIXTURES);

      const getUsers = result.identifiers.find((id) => id.name === 'getUsers');
      expect(getUsers).toBeDefined();
      expect(getUsers!.exported).toBe(true);
    });

    it('extracts interfaces and enums', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'Sample.java'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'Sample.java'), content, FIXTURES);

      const repo = result.identifiers.find((id) => id.name === 'UserRepository');
      expect(repo).toBeDefined();

      const role = result.identifiers.find((id) => id.name === 'UserRole');
      expect(role).toBeDefined();
      expect(role!.kind).toBe('enum');
    });

    it('extracts imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'Sample.java'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'Sample.java'), content, FIXTURES);

      expect(result.imports.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Go', () => {
    let extractor: Extractor;
    beforeAll(async () => {
      extractor = await getExtractorForLang('go');
    });

    it('marks uppercase identifiers as exported', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.go'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.go'), content, FIXTURES);

      const startServer = result.identifiers.find((id) => id.name === 'StartServer');
      expect(startServer).toBeDefined();
      expect(startServer!.exported).toBe(true);

      const userService = result.identifiers.find((id) => id.name === 'UserService');
      expect(userService).toBeDefined();
      expect(userService!.exported).toBe(true);
    });

    it('marks lowercase identifiers as unexported', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.go'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.go'), content, FIXTURES);

      const createHandler = result.identifiers.find((id) => id.name === 'createHandler');
      expect(createHandler).toBeDefined();
      expect(createHandler!.exported).toBe(false);

      const internalConfig = result.identifiers.find((id) => id.name === 'internalConfig');
      expect(internalConfig).toBeDefined();
      expect(internalConfig!.exported).toBe(false);
    });

    it('extracts methods with receiver', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.go'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.go'), content, FIXTURES);

      const getUser = result.identifiers.find((id) => id.name === 'GetUser');
      expect(getUser).toBeDefined();
    });

    it('extracts imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.go'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.go'), content, FIXTURES);

      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('Rust', () => {
    let extractor: Extractor;
    beforeAll(async () => {
      extractor = await getExtractorForLang('rust');
    });

    it('marks pub items as exported', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.rs'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.rs'), content, FIXTURES);

      const userService = result.identifiers.find((id) => id.name === 'UserService');
      expect(userService).toBeDefined();
      expect(userService!.exported).toBe(true);

      const createService = result.identifiers.find((id) => id.name === 'create_service');
      expect(createService).toBeDefined();
      expect(createService!.exported).toBe(true);
    });

    it('marks non-pub items as unexported', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.rs'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.rs'), content, FIXTURES);

      const privateHelper = result.identifiers.find((id) => id.name === 'private_helper');
      expect(privateHelper).toBeDefined();
      expect(privateHelper!.exported).toBe(false);
    });

    it('extracts traits and enums', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.rs'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.rs'), content, FIXTURES);

      const repo = result.identifiers.find((id) => id.name === 'Repository');
      expect(repo).toBeDefined();

      const role = result.identifiers.find((id) => id.name === 'UserRole');
      expect(role).toBeDefined();
      expect(role!.kind).toBe('enum');
    });

    it('extracts use imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.rs'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.rs'), content, FIXTURES);

      expect(result.imports.length).toBeGreaterThan(0);
    });
  });
});

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

describe('tree-sitter polyglot A (C, C++, C#, Ruby, PHP, Kotlin, Swift, Scala, Dart)', () => {
  beforeAll(async () => {
    await initTreeSitter();
  });

  describe('C', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('c'); });

    it('extracts functions', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.c'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.c'), content, FIXTURES);
      const fn = result.identifiers.find((id) => id.name === 'start_server');
      expect(fn).toBeDefined();
      expect(fn!.kind).toBe('function');
    });

    it('extracts structs and enums', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.c'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.c'), content, FIXTURES);
      const config = result.identifiers.find((id) => id.name === 'Config');
      expect(config).toBeDefined();
      const status = result.identifiers.find((id) => id.name === 'Status');
      expect(status).toBeDefined();
    });

    it('extracts typedefs', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.c'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.c'), content, FIXTURES);
      const userData = result.identifiers.find((id) => id.name === 'UserData');
      expect(userData).toBeDefined();
    });

    it('extracts includes', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.c'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.c'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('C++', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('cpp'); });

    it('extracts classes and namespaces', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.cpp'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.cpp'), content, FIXTURES);
      const cls = result.identifiers.find((id) => id.name === 'UserService');
      expect(cls).toBeDefined();
      const ns = result.identifiers.find((id) => id.name === 'app');
      expect(ns).toBeDefined();
    });

    it('extracts structs and enums', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.cpp'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.cpp'), content, FIXTURES);
      const config = result.identifiers.find((id) => id.name === 'Config');
      expect(config).toBeDefined();
      const role = result.identifiers.find((id) => id.name === 'Role');
      expect(role).toBeDefined();
    });

    it('extracts includes', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.cpp'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.cpp'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('C#', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('csharp'); });

    it('extracts public class', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.cs'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.cs'), content, FIXTURES);
      const cls = result.identifiers.find((id) => id.name === 'UserService');
      expect(cls).toBeDefined();
      expect(cls!.exported).toBe(true);
    });

    it('filters private methods', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.cs'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.cs'), content, FIXTURES);
      const validate = result.identifiers.find((id) => id.name === 'Validate');
      expect(validate).toBeDefined();
      expect(validate!.exported).toBe(false);
    });

    it('extracts interfaces and enums', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.cs'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.cs'), content, FIXTURES);
      const repo = result.identifiers.find((id) => id.name === 'IRepository');
      expect(repo).toBeDefined();
      const role = result.identifiers.find((id) => id.name === 'UserRole');
      expect(role).toBeDefined();
    });

    it('extracts using imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.cs'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.cs'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('Ruby', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('ruby'); });

    it('extracts classes and modules', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.rb'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.rb'), content, FIXTURES);
      const cls = result.identifiers.find((id) => id.name === 'UserService');
      expect(cls).toBeDefined();
      const mod = result.identifiers.find((id) => id.name === 'Validators');
      expect(mod).toBeDefined();
    });

    it('extracts methods', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.rb'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.rb'), content, FIXTURES);
      const getUser = result.identifiers.find((id) => id.name === 'get_user');
      expect(getUser).toBeDefined();
    });

    it('extracts require imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.rb'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.rb'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
      const jsonImport = result.imports.find((i) => i.source === 'json');
      expect(jsonImport).toBeDefined();
    });
  });

  describe('PHP', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('php'); });

    it('extracts classes', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.php'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.php'), content, FIXTURES);
      const cls = result.identifiers.find((id) => id.name === 'UserService');
      expect(cls).toBeDefined();
    });

    it('filters private methods', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.php'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.php'), content, FIXTURES);
      const validate = result.identifiers.find((id) => id.name === 'validate');
      expect(validate).toBeDefined();
      expect(validate!.exported).toBe(false);
    });

    it('extracts interfaces and traits', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.php'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.php'), content, FIXTURES);
      const repo = result.identifiers.find((id) => id.name === 'UserRepository');
      expect(repo).toBeDefined();
      const trait = result.identifiers.find((id) => id.name === 'Cacheable');
      expect(trait).toBeDefined();
    });

    it('extracts use imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.php'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.php'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('Kotlin', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('kotlin'); });

    it('extracts classes', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.kt'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.kt'), content, FIXTURES);
      const cls = result.identifiers.find((id) => id.name === 'UserService');
      expect(cls).toBeDefined();
    });

    it('extracts objects', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.kt'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.kt'), content, FIXTURES);
      const obj = result.identifiers.find((id) => id.name === 'AppConfig');
      expect(obj).toBeDefined();
    });

    it('extracts functions', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.kt'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.kt'), content, FIXTURES);
      const fn = result.identifiers.find((id) => id.name === 'createApp');
      expect(fn).toBeDefined();
    });

    it('extracts imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.kt'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.kt'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('Swift', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('swift'); });

    it('extracts public classes', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.swift'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.swift'), content, FIXTURES);
      const cls = result.identifiers.find((id) => id.name === 'UserService');
      expect(cls).toBeDefined();
    });

    it('extracts protocols', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.swift'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.swift'), content, FIXTURES);
      const proto = result.identifiers.find((id) => id.name === 'Repository');
      expect(proto).toBeDefined();
    });

    it('extracts functions', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.swift'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.swift'), content, FIXTURES);
      const fn = result.identifiers.find((id) => id.name === 'createApp');
      expect(fn).toBeDefined();
    });

    it('extracts imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.swift'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.swift'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('Scala', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('scala'); });

    it('extracts classes and objects', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.scala'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.scala'), content, FIXTURES);
      const cls = result.identifiers.find((id) => id.name === 'UserService');
      expect(cls).toBeDefined();
      const obj = result.identifiers.find((id) => id.name === 'AppConfig');
      expect(obj).toBeDefined();
    });

    it('extracts traits', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.scala'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.scala'), content, FIXTURES);
      const trait = result.identifiers.find((id) => id.name === 'Repository');
      expect(trait).toBeDefined();
    });

    it('extracts imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.scala'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.scala'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });

  describe('Dart', () => {
    let extractor: Extractor;
    beforeAll(async () => { extractor = await getExtractorForLang('dart'); });

    it('extracts classes', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.dart'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.dart'), content, FIXTURES);
      const cls = result.identifiers.find((id) => id.name === 'UserService');
      expect(cls).toBeDefined();
    });

    it('extracts enums', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.dart'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.dart'), content, FIXTURES);
      const role = result.identifiers.find((id) => id.name === 'UserRole');
      expect(role).toBeDefined();
    });

    it('extracts functions', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.dart'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.dart'), content, FIXTURES);
      const fn = result.identifiers.find((id) => id.name === 'createApp');
      expect(fn).toBeDefined();
    });

    it('extracts imports', () => {
      const content = fs.readFileSync(path.join(FIXTURES, 'sample.dart'), 'utf-8');
      const result = extractor.extract(path.join(FIXTURES, 'sample.dart'), content, FIXTURES);
      expect(result.imports.length).toBeGreaterThan(0);
    });
  });
});

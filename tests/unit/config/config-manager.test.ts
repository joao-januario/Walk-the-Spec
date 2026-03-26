import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  loadConfig,
  saveConfig,
  addProject,
  removeProject,
  getProjects,
  type WalkTheSpecConfig,
} from '../../../src/main/config/config-manager.js';

const TEST_CONFIG_DIR = path.join(os.tmpdir(), '.walk-the-spec-test-' + Date.now());
const TEST_CONFIG_PATH = path.join(TEST_CONFIG_DIR, 'config.json');

describe('config-manager', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_CONFIG_DIR)) {
      fs.rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_CONFIG_DIR)) {
      fs.rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  describe('loadConfig', () => {
    it('creates config file with empty projects on first use', () => {
      const config = loadConfig(TEST_CONFIG_PATH);
      expect(config).toEqual({ projects: [], settings: { fontSize: 16 } });
      expect(fs.existsSync(TEST_CONFIG_PATH)).toBe(true);
    });

    it('reads existing config from file', () => {
      fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
      const existing = {
        projects: [{ id: 'abc', name: 'test', path: '/tmp/test' }],
      };
      fs.writeFileSync(TEST_CONFIG_PATH, JSON.stringify(existing));

      const config = loadConfig(TEST_CONFIG_PATH);
      expect(config.projects).toHaveLength(1);
      expect(config.projects[0].name).toBe('test');
    });
  });

  describe('saveConfig', () => {
    it('writes config to file', () => {
      const config: WalkTheSpecConfig = {
        projects: [{ id: 'xyz', name: 'proj', path: '/tmp/proj' }],
      };
      saveConfig(TEST_CONFIG_PATH, config);

      const raw = fs.readFileSync(TEST_CONFIG_PATH, 'utf-8');
      const loaded = JSON.parse(raw);
      expect(loaded.projects[0].id).toBe('xyz');
    });
  });

  describe('addProject', () => {
    it('adds a project and returns it with generated id', () => {
      const config: WalkTheSpecConfig = { projects: [] };
      const project = addProject(config, '/tmp/my-project', 'my-project');

      expect(project.id).toBeDefined();
      expect(project.name).toBe('my-project');
      expect(project.path).toBe('/tmp/my-project');
      expect(config.projects).toHaveLength(1);
    });

    it('derives name from path basename if not provided', () => {
      const config: WalkTheSpecConfig = { projects: [] };
      const project = addProject(config, '/home/user/cool-repo');

      expect(project.name).toBe('cool-repo');
    });

    it('throws on duplicate path', () => {
      const config: WalkTheSpecConfig = {
        projects: [{ id: 'abc', name: 'existing', path: '/tmp/my-project' }],
      };

      expect(() => addProject(config, '/tmp/my-project')).toThrow(/already registered/);
    });
  });

  describe('removeProject', () => {
    it('removes a project by id', () => {
      const config: WalkTheSpecConfig = {
        projects: [
          { id: 'a', name: 'p1', path: '/tmp/p1' },
          { id: 'b', name: 'p2', path: '/tmp/p2' },
        ],
      };
      removeProject(config, 'a');
      expect(config.projects).toHaveLength(1);
      expect(config.projects[0].id).toBe('b');
    });

    it('throws if project not found', () => {
      const config: WalkTheSpecConfig = { projects: [] };
      expect(() => removeProject(config, 'nonexistent')).toThrow(/not found/);
    });
  });

  describe('getProjects', () => {
    it('returns all registered projects', () => {
      const config: WalkTheSpecConfig = {
        projects: [
          { id: 'a', name: 'p1', path: '/tmp/p1' },
          { id: 'b', name: 'p2', path: '/tmp/p2' },
        ],
      };
      expect(getProjects(config)).toHaveLength(2);
    });
  });
});

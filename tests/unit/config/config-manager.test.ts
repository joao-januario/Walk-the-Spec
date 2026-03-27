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
  initConfigCache,
  resetConfigCache,
  type WalkTheSpecConfig,
} from '../../../src/main/config/config-manager.js';

const TEST_CONFIG_DIR = path.join(os.tmpdir(), '.walk-the-spec-test-' + Date.now());
const TEST_CONFIG_PATH = path.join(TEST_CONFIG_DIR, 'config.json');

describe('config-manager', () => {
  beforeEach(() => {
    resetConfigCache();
    if (fs.existsSync(TEST_CONFIG_DIR)) {
      fs.rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    resetConfigCache();
    if (fs.existsSync(TEST_CONFIG_DIR)) {
      fs.rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  describe('initConfigCache', () => {
    it('creates config file with defaults when none exists', async () => {
      await initConfigCache(TEST_CONFIG_PATH);
      expect(fs.existsSync(TEST_CONFIG_PATH)).toBe(true);

      const config = loadConfig();
      expect(config).toEqual({
        projects: [],
        settings: { fontSize: 16, soundVolume: 'medium', osNotifications: true, theme: 'radix-mauve' },
      });
    });

    it('reads existing config from disk into cache', async () => {
      fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
      const existing = {
        projects: [{ id: 'abc', name: 'test', path: '/tmp/test' }],
        settings: { fontSize: 18, soundVolume: 'low', osNotifications: false, theme: 'dracula' },
      };
      fs.writeFileSync(TEST_CONFIG_PATH, JSON.stringify(existing));

      await initConfigCache(TEST_CONFIG_PATH);
      const config = loadConfig();
      expect(config.projects).toHaveLength(1);
      expect(config.projects[0]?.name).toBe('test');
      expect(config.settings.fontSize).toBe(18);
    });

    it('applies default settings when existing config has none', async () => {
      fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
      fs.writeFileSync(TEST_CONFIG_PATH, JSON.stringify({ projects: [] }));

      await initConfigCache(TEST_CONFIG_PATH);
      const config = loadConfig();
      expect(config.settings).toEqual({
        fontSize: 16, soundVolume: 'medium', osNotifications: true, theme: 'radix-mauve',
      });
    });
  });

  describe('loadConfig', () => {
    it('returns cached data after init (no disk I/O)', async () => {
      await initConfigCache(TEST_CONFIG_PATH);
      const config = loadConfig();
      expect(config.projects).toEqual([]);
    });

    it('throws if cache has not been initialized', () => {
      expect(() => loadConfig()).toThrow(/not initialized/i);
    });
  });

  describe('saveConfig', () => {
    it('writes config to disk and updates cache', async () => {
      await initConfigCache(TEST_CONFIG_PATH);
      const config = loadConfig();
      config.projects.push({ id: 'xyz', name: 'proj', path: '/tmp/proj' });
      await saveConfig(config);

      // Cache is updated
      const cached = loadConfig();
      expect(cached.projects[0]?.id).toBe('xyz');

      // Disk is updated
      const raw = fs.readFileSync(TEST_CONFIG_PATH, 'utf-8');
      const loaded = JSON.parse(raw);
      expect(loaded.projects[0].id).toBe('xyz');
    });

    it('subsequent loadConfig calls reflect saved changes', async () => {
      await initConfigCache(TEST_CONFIG_PATH);
      const config = loadConfig();
      config.settings = { ...config.settings, fontSize: 20 };
      await saveConfig(config);

      const reloaded = loadConfig();
      expect(reloaded.settings.fontSize).toBe(20);
    });
  });

  describe('addProject', () => {
    it('adds a project and returns it with generated id', () => {
      const config: WalkTheSpecConfig = { projects: [], settings: { fontSize: 16, soundVolume: 'medium', osNotifications: true, theme: 'radix-mauve' } };
      const project = addProject(config, '/tmp/my-project', 'my-project');

      expect(project.id).toBeDefined();
      expect(project.name).toBe('my-project');
      expect(project.path).toBe('/tmp/my-project');
      expect(config.projects).toHaveLength(1);
    });

    it('derives name from path basename if not provided', () => {
      const config: WalkTheSpecConfig = { projects: [], settings: { fontSize: 16, soundVolume: 'medium', osNotifications: true, theme: 'radix-mauve' } };
      const project = addProject(config, '/home/user/cool-repo');

      expect(project.name).toBe('cool-repo');
    });

    it('throws on duplicate path', () => {
      const config: WalkTheSpecConfig = {
        projects: [{ id: 'abc', name: 'existing', path: '/tmp/my-project' }],
        settings: { fontSize: 16, soundVolume: 'medium', osNotifications: true, theme: 'radix-mauve' },
      };

      expect(() => addProject(config, '/tmp/my-project')).toThrow(/already registered/);
    });

    it('detects duplicates with different separators', () => {
      const config: WalkTheSpecConfig = {
        projects: [{ id: 'abc', name: 'existing', path: 'C:\\Users\\dev\\project' }],
        settings: { fontSize: 16, soundVolume: 'medium', osNotifications: true, theme: 'radix-mauve' },
      };

      expect(() => addProject(config, 'C:/Users/dev/project')).toThrow(/already registered/);
    });

    it('detects duplicates with different casing', () => {
      const config: WalkTheSpecConfig = {
        projects: [{ id: 'abc', name: 'existing', path: 'C:\\Users\\Dev\\Project' }],
        settings: { fontSize: 16, soundVolume: 'medium', osNotifications: true, theme: 'radix-mauve' },
      };

      expect(() => addProject(config, 'c:\\users\\dev\\project')).toThrow(/already registered/);
    });
  });

  describe('removeProject', () => {
    it('removes a project by id', () => {
      const config: WalkTheSpecConfig = {
        projects: [
          { id: 'a', name: 'p1', path: '/tmp/p1' },
          { id: 'b', name: 'p2', path: '/tmp/p2' },
        ],
        settings: { fontSize: 16, soundVolume: 'medium', osNotifications: true, theme: 'radix-mauve' },
      };
      removeProject(config, 'a');
      expect(config.projects).toHaveLength(1);
      expect(config.projects[0]?.id).toBe('b');
    });

    it('throws if project not found', () => {
      const config: WalkTheSpecConfig = { projects: [], settings: { fontSize: 16, soundVolume: 'medium', osNotifications: true, theme: 'radix-mauve' } };
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
        settings: { fontSize: 16, soundVolume: 'medium', osNotifications: true, theme: 'radix-mauve' },
      };
      expect(getProjects(config)).toHaveLength(2);
    });
  });
});

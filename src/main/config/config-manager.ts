import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { normalizePathForComparison } from '../utils/paths.js';

export interface ProjectEntry {
  id: string;
  name: string;
  path: string;
  scaffoldVersion?: string;
}

export type SoundVolume = 'high' | 'medium' | 'low' | 'off';

export interface AppSettings {
  fontSize: number;
  soundVolume: SoundVolume;
  osNotifications: boolean;
  theme: string;
}

export const DEFAULT_SETTINGS: AppSettings = { fontSize: 16, soundVolume: 'medium', osNotifications: true, theme: 'radix-mauve' };

export interface WalkTheSpecConfig {
  projects: ProjectEntry[];
  settings: AppSettings;
}

const DEFAULT_CONFIG_DIR = path.join(os.homedir(), '.walk-the-spec');
const DEFAULT_CONFIG_PATH = path.join(DEFAULT_CONFIG_DIR, 'config.json');

// --- In-memory cache ---

let cachedConfig: WalkTheSpecConfig | null = null;
let cachedConfigPath: string = DEFAULT_CONFIG_PATH;

/**
 * Initialize the config cache by reading from disk (async).
 * Must be called once at startup before any loadConfig() calls.
 */
export async function initConfigCache(configPath: string = DEFAULT_CONFIG_PATH): Promise<void> {
  cachedConfigPath = configPath;

  try {
    await fs.promises.access(configPath);
  } catch {
    // File doesn't exist — create with defaults
    const dir = path.dirname(configPath);
    await fs.promises.mkdir(dir, { recursive: true });
    const empty: WalkTheSpecConfig = { projects: [], settings: { ...DEFAULT_SETTINGS } };
    await fs.promises.writeFile(configPath, JSON.stringify(empty, null, 2));
    cachedConfig = empty;
    return;
  }

  const raw = await fs.promises.readFile(configPath, 'utf-8');
  const parsed = JSON.parse(raw) as Partial<WalkTheSpecConfig>;
  cachedConfig = {
    projects: parsed.projects ?? [],
    settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
  };
}

/**
 * Reset the cache (for testing only).
 */
export function resetConfigCache(): void {
  cachedConfig = null;
  cachedConfigPath = DEFAULT_CONFIG_PATH;
}

export function getDefaultConfigPath(): string {
  return DEFAULT_CONFIG_PATH;
}

/**
 * Return the cached config. No disk I/O.
 * Throws if initConfigCache() has not been called.
 */
export function loadConfig(): WalkTheSpecConfig {
  if (!cachedConfig) {
    throw new Error('Config cache not initialized. Call initConfigCache() first.');
  }
  return cachedConfig;
}

/**
 * Write config to disk and update the in-memory cache.
 */
export async function saveConfig(config: WalkTheSpecConfig): Promise<void> {
  cachedConfig = config;
  const dir = path.dirname(cachedConfigPath);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(cachedConfigPath, JSON.stringify(config, null, 2));
}

export function addProject(config: WalkTheSpecConfig, projectPath: string, name?: string): ProjectEntry {
  const duplicate = config.projects.find(
    (p) => normalizePathForComparison(p.path) === normalizePathForComparison(projectPath),
  );
  if (duplicate) {
    throw new Error(`Path "${projectPath}" is already registered as "${duplicate.name}"`);
  }

  const entry: ProjectEntry = {
    id: uuidv4(),
    name: name ?? path.basename(projectPath),
    path: projectPath,
  };

  config.projects.push(entry);
  return entry;
}

export function removeProject(config: WalkTheSpecConfig, id: string): void {
  const index = config.projects.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Project with id "${id}" not found`);
  }
  config.projects.splice(index, 1);
}

export function getProjects(config: WalkTheSpecConfig): ProjectEntry[] {
  return config.projects;
}

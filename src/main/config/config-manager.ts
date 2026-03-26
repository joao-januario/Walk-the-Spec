import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { normalizePathForComparison } from '../utils/paths.js';

export interface ProjectEntry {
  id: string;
  name: string;
  path: string;
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

export function getDefaultConfigPath(): string {
  return DEFAULT_CONFIG_PATH;
}

export function loadConfig(configPath: string = DEFAULT_CONFIG_PATH): WalkTheSpecConfig {
  if (!fs.existsSync(configPath)) {
    const dir = path.dirname(configPath);
    fs.mkdirSync(dir, { recursive: true });
    const empty: WalkTheSpecConfig = { projects: [], settings: { ...DEFAULT_SETTINGS } };
    fs.writeFileSync(configPath, JSON.stringify(empty, null, 2));
    return empty;
  }

  const raw = fs.readFileSync(configPath, 'utf-8');
  const parsed = JSON.parse(raw) as Partial<WalkTheSpecConfig>;
  // Backward compat: ensure settings exists with defaults
  return {
    projects: parsed.projects ?? [],
    settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
  };
}

export function saveConfig(configPath: string = DEFAULT_CONFIG_PATH, config: WalkTheSpecConfig): void {
  const dir = path.dirname(configPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
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

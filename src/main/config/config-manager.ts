import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export interface ProjectEntry {
  id: string;
  name: string;
  path: string;
}

export interface SpecBoardConfig {
  projects: ProjectEntry[];
}

const DEFAULT_CONFIG_DIR = path.join(os.homedir(), '.spec-board');
const DEFAULT_CONFIG_PATH = path.join(DEFAULT_CONFIG_DIR, 'config.json');

export function getDefaultConfigPath(): string {
  return DEFAULT_CONFIG_PATH;
}

export function loadConfig(configPath: string = DEFAULT_CONFIG_PATH): SpecBoardConfig {
  if (!fs.existsSync(configPath)) {
    const dir = path.dirname(configPath);
    fs.mkdirSync(dir, { recursive: true });
    const empty: SpecBoardConfig = { projects: [] };
    fs.writeFileSync(configPath, JSON.stringify(empty, null, 2));
    return empty;
  }

  const raw = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(raw) as SpecBoardConfig;
}

export function saveConfig(configPath: string = DEFAULT_CONFIG_PATH, config: SpecBoardConfig): void {
  const dir = path.dirname(configPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function addProject(config: SpecBoardConfig, projectPath: string, name?: string): ProjectEntry {
  const duplicate = config.projects.find((p) => p.path === projectPath);
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

export function removeProject(config: SpecBoardConfig, id: string): void {
  const index = config.projects.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Project with id "${id}" not found`);
  }
  config.projects.splice(index, 1);
}

export function getProjects(config: SpecBoardConfig): ProjectEntry[] {
  return config.projects;
}

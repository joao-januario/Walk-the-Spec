import path from 'path';
import { normalizePath } from '../utils/paths.js';
import type { SomeType } from './types.js';

export interface WatcherEvents {
  onSpecsChanged: (projectId: string, files: string[]) => void;
  onBranchChanged: (projectId: string) => void;
  onError: (projectId: string, error: string) => void;
}

export type Phase = 'specify' | 'plan' | 'implement' | 'review';

export enum Status {
  Active = 'active',
  Inactive = 'inactive',
}

export const DEFAULT_TIMEOUT = 5000;

export class ProjectWatcher {
  private watcher: any;

  constructor(private projectPath: string) {}

  start(): void {
    // implementation
  }

  async stop(): Promise<void> {
    // implementation
  }

  static create(path: string): ProjectWatcher {
    return new ProjectWatcher(path);
  }
}

export function watchProject(projectId: string, projectPath: string): void {
  // implementation
}

export async function scanFiles(dir: string): Promise<string[]> {
  return [];
}

function internalHelper(): void {
  // not exported
}

const privateConst = 42;

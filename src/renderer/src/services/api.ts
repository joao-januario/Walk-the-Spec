import type { Project, Feature, Artifact, ArtifactType, IntegrationPlan } from '../types/index.js';

// Access the Electron IPC bridge exposed via preload
declare global {
  interface Window {
    api: {
      platform: string;
      getProjects: () => Promise<{ projects: Pick<Project, 'id' | 'name' | 'path'>[] }>;
      getProjectState: (projectId: string) => Promise<Project>;
      addProject: (path: string, name?: string) => Promise<Project>;
      deleteProject: (id: string) => Promise<void>;
      planIntegration: (projectPath: string) => Promise<IntegrationPlan>;
      executeIntegration: (projectPath: string) => Promise<{ success: true }>;
      showFolderPicker: () => Promise<{ path: string; isGitRepo: boolean } | null>;
      getFeature: (projectId: string) => Promise<Feature | null>;
      getArtifact: (projectId: string, type: string) => Promise<Artifact>;
      editField: (
        projectId: string,
        artifactType: string,
        elementId: string,
        field: string,
        value: unknown,
      ) => Promise<any>;
      getRefactorBacklog: (projectId: string) => Promise<{ entries: import('../types/index.js').RefactorEntry[] }>;
      getSettings: () => Promise<{ fontSize: number; readingFont?: string }>;
      saveSettings: (partial: Record<string, unknown>) => Promise<{ fontSize: number; readingFont?: string }>;
      getGlossary: (projectId: string) => Promise<{ terms: Record<string, string> }>;
      getMemorySnapshot: () => Promise<{ main: { rss: number; heapTotal: number; heapUsed: number; external: number; arrayBuffers: number }; timestamp: string }>;
      startWindowDrag: (initX: number, initY: number) => Promise<void>;
      updateWindowDrag: (mouseX: number, mouseY: number) => void;
      onSettingsChanged: (callback: (...args: any[]) => void) => () => void;
      onSpecsChanged: (callback: (...args: any[]) => void) => () => void;
      onBranchChanged: (callback: (...args: any[]) => void) => () => void;
      onUpdateAvailable: (callback: (payload: { version: string }) => void) => () => void;
      onUpdateDownloaded: (callback: (payload: { version: string }) => void) => () => void;
      installUpdate: () => Promise<void>;
      restartForUpdate: () => Promise<void>;
    };
  }
}

// --- Projects ---

export async function getProjects() {
  return window.api.getProjects();
}

export async function getProjectState(projectId: string) {
  return window.api.getProjectState(projectId);
}

export async function addProject(path: string, name?: string) {
  return window.api.addProject(path, name);
}

export async function deleteProject(id: string) {
  return window.api.deleteProject(id);
}

// --- Integration ---

export async function planIntegration(projectPath: string) {
  return window.api.planIntegration(projectPath);
}

export async function executeIntegration(projectPath: string) {
  return window.api.executeIntegration(projectPath);
}

// --- Native folder picker ---

export async function showFolderPicker() {
  return window.api.showFolderPicker();
}

// --- Features ---

export async function getFeature(projectId: string) {
  return window.api.getFeature(projectId);
}

// --- Artifacts ---

export async function getArtifact(projectId: string, type: ArtifactType) {
  return window.api.getArtifact(projectId, type);
}

// --- Edits ---

export async function editField(
  projectId: string,
  artifactType: ArtifactType,
  elementId: string,
  field: string,
  value: unknown,
) {
  return window.api.editField(projectId, artifactType, elementId, field, value);
}

// --- Settings ---

export async function getSettings() {
  return window.api.getSettings();
}

export async function saveSettings(partial: Record<string, unknown>) {
  return window.api.saveSettings(partial);
}

// --- Glossary ---

export async function getGlossary(projectId: string) {
  return window.api.getGlossary(projectId);
}

// --- Refactor Backlog ---

export async function getRefactorBacklog(projectId: string) {
  return window.api.getRefactorBacklog(projectId);
}

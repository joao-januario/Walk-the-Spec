import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Projects
  getProjects: () => ipcRenderer.invoke('get-projects'),
  addProject: (path: string, name?: string) => ipcRenderer.invoke('add-project', path, name),
  deleteProject: (id: string) => ipcRenderer.invoke('delete-project', id),

  // Integration
  planIntegration: (projectPath: string) => ipcRenderer.invoke('integration:plan', projectPath),
  executeIntegration: (projectPath: string) => ipcRenderer.invoke('integration:execute', projectPath),

  // Native folder picker
  showFolderPicker: () => ipcRenderer.invoke('show-folder-picker'),

  // Feature
  getFeature: (projectId: string) => ipcRenderer.invoke('get-feature', projectId),

  // Artifacts
  getArtifact: (projectId: string, type: string) => ipcRenderer.invoke('get-artifact', projectId, type),

  // Edits
  editField: (projectId: string, artifactType: string, elementId: string, field: string, value: unknown) =>
    ipcRenderer.invoke('edit-field', projectId, artifactType, elementId, field, value),

  // Refactor backlog (project-level)
  getRefactorBacklog: (projectId: string) => ipcRenderer.invoke('backlog:list', projectId),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (partial: Record<string, unknown>) => ipcRenderer.invoke('save-settings', partial),

  // Glossary
  getGlossary: (projectId: string) => ipcRenderer.invoke('get-glossary', projectId),

  // Settings events — from native menu
  onSettingsChanged: (callback: (...args: any[]) => void) => {
    const sub = (_event: any, ...args: any[]) => callback(...args);
    ipcRenderer.on('settings-changed', sub);
    return () => ipcRenderer.removeListener('settings-changed', sub);
  },

  // Notification events — command completion
  onPhaseChanged: (callback: (...args: any[]) => void) => {
    const sub = (_event: any, ...args: any[]) => callback(...args);
    ipcRenderer.on('phase-changed', sub);
    return () => ipcRenderer.removeListener('phase-changed', sub);
  },

  // File watcher events (Phase 8) — renderer listens
  onSpecsChanged: (callback: (...args: any[]) => void) => {
    const sub = (_event: any, ...args: any[]) => callback(...args);
    ipcRenderer.on('specs-changed', sub);
    return () => ipcRenderer.removeListener('specs-changed', sub);
  },
  onBranchChanged: (callback: (...args: any[]) => void) => {
    const sub = (_event: any, ...args: any[]) => callback(...args);
    ipcRenderer.on('branch-changed', sub);
    return () => ipcRenderer.removeListener('branch-changed', sub);
  },
};

contextBridge.exposeInMainWorld('api', api);

export type ElectronApi = typeof api;

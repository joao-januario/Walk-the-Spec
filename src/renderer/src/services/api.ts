import type { Project, Feature, Artifact, CommentsResponse, Comment, ArtifactType } from '../types/index.js';

// Access the Electron IPC bridge exposed via preload
declare global {
  interface Window {
    api: {
      getProjects: () => Promise<{ projects: Project[] }>;
      addProject: (path: string, name?: string) => Promise<Project>;
      deleteProject: (id: string) => Promise<void>;
      showFolderPicker: () => Promise<{ path: string; isGitRepo: boolean } | null>;
      getFeature: (projectId: string) => Promise<Feature | null>;
      getArtifact: (projectId: string, type: string) => Promise<Artifact>;
      getComments: (projectId: string, artifactType: string) => Promise<CommentsResponse>;
      addComment: (projectId: string, artifactType: string, elementId: string, content: string) => Promise<Comment>;
      updateComment: (projectId: string, artifactType: string, commentId: string, content: string) => Promise<Comment>;
      deleteComment: (projectId: string, artifactType: string, commentId: string) => Promise<void>;
      editField: (projectId: string, artifactType: string, elementId: string, field: string, value: unknown) => Promise<any>;
      onSpecsChanged: (callback: (...args: any[]) => void) => () => void;
      onBranchChanged: (callback: (...args: any[]) => void) => () => void;
    };
  }
}

// --- Projects ---

export async function getProjects() {
  return window.api.getProjects();
}

export async function addProject(path: string, name?: string) {
  return window.api.addProject(path, name);
}

export async function deleteProject(id: string) {
  return window.api.deleteProject(id);
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

// --- Comments ---

export async function getComments(projectId: string, artifactType: ArtifactType) {
  return window.api.getComments(projectId, artifactType);
}

export async function addComment(projectId: string, artifactType: ArtifactType, elementId: string, content: string) {
  return window.api.addComment(projectId, artifactType, elementId, content);
}

export async function updateComment(projectId: string, artifactType: ArtifactType, commentId: string, content: string) {
  return window.api.updateComment(projectId, artifactType, commentId, content);
}

export async function deleteComment(projectId: string, artifactType: ArtifactType, commentId: string) {
  return window.api.deleteComment(projectId, artifactType, commentId);
}

// --- Edits ---

export async function editField(projectId: string, artifactType: ArtifactType, elementId: string, field: string, value: unknown) {
  return window.api.editField(projectId, artifactType, elementId, field, value);
}

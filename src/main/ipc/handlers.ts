import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import { loadConfig, saveConfig, addProject, removeProject, getProjects } from '../config/config-manager.js';
import { scanProject } from '../projects/project-scanner.js';
import { detectPhase } from '../phase/phase-detector.js';
import { parseSpec } from '../parser/spec-parser.js';
import { parsePlan } from '../parser/plan-parser.js';
import { parseTasks } from '../parser/tasks-parser.js';
import { parseResearch } from '../parser/research-parser.js';
import { parseComments } from '../parser/comment-parser.js';
import { parseReview } from '../parser/review-parser.js';
import { parseRefactorBacklog } from '../parser/refactor-backlog-parser.js';
import { writeComment, updateComment, deleteComment } from '../writer/comment-writer.js';
import { editTaskCheckbox, editRequirementText } from '../writer/artifact-writer.js';
import { v4 as uuidv4 } from 'uuid';

function getProjectState(entry: { id: string; name: string; path: string }) {
  try {
    if (!fs.existsSync(entry.path)) {
      return { ...entry, currentBranch: '', hasSpeckitContent: false, phase: 'unknown' as const, error: 'Project path no longer exists' };
    }
    const scan = scanProject(entry.path);
    let tasksContent: string | undefined;
    if (scan.specDir && scan.artifactFiles.includes('tasks.md')) {
      tasksContent = fs.readFileSync(path.join(scan.specDir, 'tasks.md'), 'utf-8');
    }
    return {
      ...entry,
      currentBranch: scan.currentBranch,
      hasSpeckitContent: scan.hasSpeckitContent,
      phase: detectPhase(scan.artifactFiles, tasksContent),
      error: null,
    };
  } catch (err: any) {
    return { ...entry, currentBranch: '', hasSpeckitContent: false, phase: 'unknown' as const, error: err.message ?? 'Unknown error' };
  }
}

export function registerIpcHandlers() {
  // --- Projects ---

  ipcMain.handle('get-projects', () => {
    const config = loadConfig();
    return { projects: getProjects(config).map(getProjectState) };
  });

  ipcMain.handle('add-project', (_event, projectPath: string, name?: string) => {
    if (!fs.existsSync(projectPath)) throw new Error('Path does not exist');
    if (!fs.existsSync(path.join(projectPath, '.git'))) throw new Error('Path is not a git repository');

    const config = loadConfig();
    const entry = addProject(config, projectPath, name);
    saveConfig(undefined, config);
    return getProjectState(entry);
  });

  ipcMain.handle('delete-project', (_event, id: string) => {
    const config = loadConfig();
    removeProject(config, id);
    saveConfig(undefined, config);
  });

  // --- Native folder picker ---

  ipcMain.handle('show-folder-picker', async () => {
    const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: 'Select Project Folder',
    });

    if (result.canceled || result.filePaths.length === 0) return null;

    const selectedPath = result.filePaths[0];
    const isGitRepo = fs.existsSync(path.join(selectedPath, '.git'));
    return { path: selectedPath, isGitRepo };
  });

  // --- Feature ---

  ipcMain.handle('get-feature', (_event, projectId: string) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const scan = scanProject(project.path);
    if (!scan.hasSpeckitContent || !scan.specDir) return null;

    let tasksContent: string | undefined;
    if (scan.artifactFiles.includes('tasks.md')) {
      tasksContent = fs.readFileSync(path.join(scan.specDir, 'tasks.md'), 'utf-8');
    }

    let summary = '';
    if (scan.artifactFiles.includes('spec.md')) {
      const specContent = fs.readFileSync(path.join(scan.specDir, 'spec.md'), 'utf-8');
      const match = specContent.match(/^# (?:Feature Specification: )?(.+)/m);
      if (match) summary = match[1].trim();
    }

    const artifacts = scan.artifactFiles.map((f) => {
      const filePath = path.join(scan.specDir!, f);
      const stat = fs.statSync(filePath);
      return { type: f.replace('.md', ''), filePath: f, lastModified: stat.mtime.toISOString(), elementCount: 0 };
    });

    return {
      branchName: scan.currentBranch,
      phase: detectPhase(scan.artifactFiles, tasksContent),
      specDir: scan.specDir,
      summary,
      artifacts,
    };
  });

  // --- Artifacts ---

  ipcMain.handle('get-artifact', (_event, projectId: string, artifactType: string) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const scan = scanProject(project.path);
    if (!scan.specDir) throw new Error('No speckit content');

    const fileName = `${artifactType}.md`;
    const filePath = path.join(scan.specDir, fileName);
    if (!fs.existsSync(filePath)) throw new Error(`Artifact ${artifactType} not found`);

    const content = fs.readFileSync(filePath, 'utf-8');
    const stat = fs.statSync(filePath);

    let elements: any[] = [];
    let parseWarning: string | null = null;
    try {
    switch (artifactType) {
      case 'spec': {
        const parsed = parseSpec(content);
        elements = [
          ...parsed.userStories.map((s) => ({
            id: `User Story ${s.number}`, type: 'user-story',
            content: { type: 'user-story', ...s },
            editableFields: [
              { fieldName: 'priority', fieldType: 'dropdown', options: ['P1', 'P2', 'P3', 'P4', 'P5'] },
              { fieldName: 'title', fieldType: 'text' },
            ],
            commentCount: 0,
          })),
          ...parsed.requirements.map((r) => ({
            id: r.id, type: 'requirement',
            content: { type: 'requirement', ...r },
            editableFields: [{ fieldName: 'text', fieldType: 'text' }],
            commentCount: 0,
          })),
          ...parsed.successCriteria.map((s) => ({
            id: s.id, type: 'success-criterion',
            content: { type: 'success-criterion', ...s },
            editableFields: [],
            commentCount: 0,
          })),
        ];
        break;
      }
      case 'plan': {
        const parsed = parsePlan(content);
        const planElements: typeof elements = [
          { id: 'Summary', type: 'section', content: { type: 'section', heading: 'Summary', content: parsed.summary }, editableFields: [], commentCount: 0 },
        ];
        // New format: Technical Approach (prose)
        if (parsed.technicalApproach) {
          planElements.push({ id: 'Technical Approach', type: 'section', content: { type: 'section', heading: 'Technical Approach', content: parsed.technicalApproach }, editableFields: [], commentCount: 0 });
        }
        // Old format fallback: Technical Context (key-value)
        if (!parsed.technicalApproach && Object.keys(parsed.technicalContext).length > 0) {
          planElements.push({ id: 'Technical Context', type: 'section', content: { type: 'section', heading: 'Technical Context', content: JSON.stringify(parsed.technicalContext) }, editableFields: [], commentCount: 0 });
        }
        // New format: Architecture Decisions
        for (const ad of parsed.architectureDecisions) {
          planElements.push({
            id: `Decision: ${ad.heading}`, type: 'decision',
            content: { type: 'decision', heading: ad.heading, content: ad.decision, rationale: ad.rationale, alternatives: ad.alternativesRejected },
            editableFields: [], commentCount: 0,
          });
        }
        // Old format fallback: Legacy decisions
        for (const d of parsed.decisions) {
          planElements.push({
            id: d.heading, type: 'decision',
            content: { type: 'decision', ...d },
            editableFields: [], commentCount: 0,
          });
        }
        elements = planElements;
        break;
      }
      case 'tasks': {
        const parsed = parseTasks(content);
        elements = parsed.phases.flatMap((phase) =>
          phase.tasks.map((t) => ({
            id: t.id, type: 'task',
            content: { type: 'task', ...t, phase: phase.name },
            editableFields: [{ fieldName: 'checked', fieldType: 'checkbox' }],
            commentCount: 0,
          }))
        );
        break;
      }
      case 'research': {
        const parsed = parseResearch(content);
        elements = parsed.decisions.map((d) => ({
          id: d.heading, type: 'decision',
          content: { type: 'decision', heading: d.heading, content: d.decision, rationale: d.rationale, alternatives: d.alternatives?.join('; ') },
          editableFields: [],
          commentCount: 0,
        }));
        break;
      }
      case 'review': {
        const parsed = parseReview(content);
        elements = parsed.findings.map((f) => ({
          id: String(f.number),
          type: 'section' as const,
          content: f,
          editableFields: [],
          commentCount: 0,
        }));
        // healSummary and branch returned as top-level reviewMeta field below
        break;
      }
    }
    } catch (err: unknown) {
      parseWarning = `Partial parse: ${err instanceof Error ? err.message : String(err)}`;
    }

    // Enrich elements with comment counts
    const commentsDir = path.join(scan.specDir!, 'comments');
    const commentFileName = `${artifactType}-comments.md`;
    const commentFilePath = path.join(commentsDir, commentFileName);
    if (fs.existsSync(commentFilePath)) {
      const commentContent = fs.readFileSync(commentFilePath, 'utf-8');
      const comments = parseComments(commentContent);
      for (const el of elements) {
        el.commentCount = comments.filter((c) => c.elementId === el.id).length;
      }
    }

    // For review artifacts, include healSummary as top-level metadata
    const reviewMeta = artifactType === 'review'
      ? (() => { const parsed = parseReview(content); return { healSummary: parsed.healSummary, branch: parsed.branch }; })()
      : undefined;

    return {
      type: artifactType,
      filePath: fileName,
      lastModified: stat.mtime.toISOString(),
      elements,
      parseWarning,
      reviewMeta,
    };
  });

  // --- Comments ---

  function getCommentsFilePath(projectPath: string, artifactType: string): { filePath: string; specDir: string; artifactName: string } {
    const scan = scanProject(projectPath);
    if (!scan.specDir) throw new Error('No speckit content');
    const commentsDir = path.join(scan.specDir, 'comments');
    return {
      filePath: path.join(commentsDir, `${artifactType}-comments.md`),
      specDir: scan.specDir,
      artifactName: `${artifactType}.md`,
    };
  }

  ipcMain.handle('get-comments', (_event, projectId: string, artifactType: string) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const { filePath } = getCommentsFilePath(project.path, artifactType);
    if (!fs.existsSync(filePath)) return { artifactType, comments: [] };

    const content = fs.readFileSync(filePath, 'utf-8');
    const comments = parseComments(content).map((c) => ({
      ...c,
      updatedAt: c.createdAt,
    }));
    return { artifactType, comments };
  });

  ipcMain.handle('add-comment', (_event, projectId: string, artifactType: string, elementId: string, commentContent: string) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const { filePath, artifactName } = getCommentsFilePath(project.path, artifactType);
    const id = uuidv4().slice(0, 8);
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    writeComment(filePath, artifactName, elementId, id, commentContent, timestamp);

    return { id, elementId, content: commentContent, createdAt: timestamp, updatedAt: timestamp };
  });

  ipcMain.handle('update-comment', (_event, projectId: string, artifactType: string, commentId: string, newContent: string) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const { filePath } = getCommentsFilePath(project.path, artifactType);
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    updateComment(filePath, commentId, newContent, timestamp);

    return { id: commentId, content: newContent, updatedAt: timestamp };
  });

  ipcMain.handle('delete-comment', (_event, projectId: string, artifactType: string, commentId: string) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const { filePath } = getCommentsFilePath(project.path, artifactType);
    deleteComment(filePath, commentId);
  });

  // --- Edits ---

  ipcMain.handle('edit-field', (_event, projectId: string, artifactType: string, elementId: string, field: string, value: unknown) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const scan = scanProject(project.path);
    if (!scan.specDir) throw new Error('No speckit content');

    const filePath = path.join(scan.specDir, `${artifactType}.md`);
    if (!fs.existsSync(filePath)) throw new Error(`Artifact ${artifactType} not found`);

    switch (`${artifactType}:${field}`) {
      case 'tasks:checked':
        editTaskCheckbox(filePath, elementId, value as boolean);
        break;
      case 'spec:text':
        editRequirementText(filePath, elementId, value as string);
        break;
      default:
        throw new Error(`Unsupported edit: ${artifactType}:${field} on ${elementId}`);
    }

    return {
      elementId,
      field,
      value,
      artifactModified: new Date().toISOString(),
    };
  });

  // --- Refactor Backlog (project-level) ---

  ipcMain.handle('backlog:list', (_event, projectId: string) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const backlogPath = path.join(project.path, '.claude', 'specs', 'refactor-backlog.md');
    if (!fs.existsSync(backlogPath)) return { entries: [] };

    const content = fs.readFileSync(backlogPath, 'utf-8');
    return parseRefactorBacklog(content);
  });
}

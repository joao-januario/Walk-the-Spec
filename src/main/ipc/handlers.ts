import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import { loadConfig, saveConfig, addProject, removeProject, getProjects, DEFAULT_SETTINGS } from '../config/config-manager.js';
import type { AppSettings } from '../config/config-manager.js';
import { scanProject } from '../projects/project-scanner.js';
import { detectPhase } from '../phase/phase-detector.js';
import { parseSpec } from '../parser/spec-parser.js';
import { parsePlan } from '../parser/plan-parser.js';
import { parseTasks } from '../parser/tasks-parser.js';
import { parseResearch } from '../parser/research-parser.js';

import { parseReview } from '../parser/review-parser.js';
import { parseSummary } from '../parser/summary-parser.js';
import { parseRefactorBacklog } from '../parser/refactor-backlog-parser.js';

import { editTaskCheckbox, editRequirementText } from '../writer/artifact-writer.js';
import { generateIntegrationPlan } from '../integration/integration-planner.js';
import { executeIntegration } from '../integration/scaffold-writer.js';
import { readScaffoldVersion, getBundledScaffoldVersion, getScaffoldDir } from '../integration/scaffold-version.js';
import type { IntegrationState } from '../integration/types.js';


/** Cached bundled scaffold version — read once, reused for all projects. */
let bundledScaffoldVersion: string | null = null;

/** Detect integration state from in-project files (async). */
async function detectIntegrationState(projectPath: string): Promise<IntegrationState> {
  const versionPath = path.join(projectPath, '.claude', 'specify', '.scaffold-version');
  try {
    await fs.promises.access(versionPath);
  } catch {
    return 'not-integrated';
  }

  const projectVersion = (await fs.promises.readFile(versionPath, 'utf-8')).trim();
  if (bundledScaffoldVersion && projectVersion !== bundledScaffoldVersion) return 'outdated';

  const constitutionPath = path.join(projectPath, '.claude', 'specify', 'memory', 'constitution.md');
  try {
    await fs.promises.access(constitutionPath);
  } catch {
    return 'needs-constitution';
  }

  return 'current';
}

async function getProjectState(entry: { id: string; name: string; path: string }) {
  try {
    try {
      await fs.promises.access(entry.path);
    } catch {
      return { ...entry, currentBranch: '', hasSpeckitContent: false, phase: 'unknown' as const, integrationState: 'not-integrated' as IntegrationState, error: 'Project path no longer exists' };
    }
    const scan = await scanProject(entry.path);
    let tasksContent: string | undefined;
    if (scan.specDir && scan.artifactFiles.includes('tasks.md')) {
      try {
        tasksContent = await fs.promises.readFile(path.join(scan.specDir, 'tasks.md'), 'utf-8');
      } catch {
        // tasks.md may have been removed between scan and read
      }
    }
    return {
      ...entry,
      currentBranch: scan.currentBranch,
      hasSpeckitContent: scan.hasSpeckitContent,
      phase: detectPhase(scan.artifactFiles, tasksContent),
      integrationState: await detectIntegrationState(entry.path),
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ...entry, currentBranch: '', hasSpeckitContent: false, phase: 'unknown' as const, integrationState: 'not-integrated' as IntegrationState, error: message };
  }
}

export function registerIpcHandlers() {
  // --- Projects ---

  ipcMain.handle('get-projects', () => {
    const config = loadConfig();
    return { projects: getProjects(config).map((p) => ({ id: p.id, name: p.name, path: p.path })) };
  });

  ipcMain.handle('get-project-state', async (_event, projectId: string) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');
    return getProjectState(project);
  });

  ipcMain.handle('add-project', async (_event, projectPath: string, name?: string) => {
    try {
      await fs.promises.access(projectPath);
    } catch {
      throw new Error('Path does not exist');
    }
    try {
      await fs.promises.access(path.join(projectPath, '.git'));
    } catch {
      throw new Error('Path is not a git repository');
    }

    const config = loadConfig();
    const entry = addProject(config, projectPath, name);
    await saveConfig(config);

    return getProjectState(entry);
  });

  ipcMain.handle('delete-project', async (_event, id: string) => {
    const config = loadConfig();
    removeProject(config, id);
    await saveConfig(config);
  });

  // --- Integration ---

  // Cache bundled scaffold version at startup
  void getBundledScaffoldVersion().then((v) => {
    bundledScaffoldVersion = v;
  }).catch((err) => {
    console.error('[integration] failed to read bundled scaffold version:', err);
  });

  ipcMain.handle('integration:plan', async (_event, projectPath: string) => {
    try {
      await fs.promises.access(projectPath);
    } catch {
      throw new Error('Path does not exist');
    }
    try {
      await fs.promises.access(path.join(projectPath, '.git'));
    } catch {
      throw new Error('Path is not a git repository');
    }

    const scaffoldDir = getScaffoldDir();
    return generateIntegrationPlan(projectPath, scaffoldDir);
  });

  ipcMain.handle('integration:execute', async (_event, projectPath: string) => {
    try {
      await fs.promises.access(projectPath);
    } catch {
      throw new Error('Path does not exist');
    }
    try {
      await fs.promises.access(path.join(projectPath, '.git'));
    } catch {
      throw new Error('Path is not a git repository');
    }

    const scaffoldDir = getScaffoldDir();
    await executeIntegration(projectPath, scaffoldDir);
    return { success: true };
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
    let isGitRepo = false;
    try {
      await fs.promises.access(path.join(selectedPath, '.git'));
      isGitRepo = true;
    } catch {
      // not a git repo
    }
    return { path: selectedPath, isGitRepo };
  });

  // --- Feature ---

  ipcMain.handle('get-feature', async (_event, projectId: string) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const scan = await scanProject(project.path);
    if (!scan.hasSpeckitContent || !scan.specDir) return null;

    let tasksContent: string | undefined;
    if (scan.artifactFiles.includes('tasks.md')) {
      tasksContent = await fs.promises.readFile(path.join(scan.specDir, 'tasks.md'), 'utf-8');
    }

    let summary = '';
    if (scan.artifactFiles.includes('spec.md')) {
      const specContent = await fs.promises.readFile(path.join(scan.specDir, 'spec.md'), 'utf-8');
      const match = specContent.match(/^# (?:Feature Specification: )?(.+)/m);
      if (match) summary = match[1].trim();
    }

    const artifacts = await Promise.all(scan.artifactFiles.map(async (f) => {
      const filePath = path.join(scan.specDir!, f);
      const stat = await fs.promises.stat(filePath);
      return { type: f.replace('.md', ''), filePath: f, lastModified: stat.mtime.toISOString(), elementCount: 0 };
    }));

    return {
      branchName: scan.currentBranch,
      phase: detectPhase(scan.artifactFiles, tasksContent),
      specDir: scan.specDir,
      summary,
      artifacts,
    };
  });

  // --- Artifacts ---

  ipcMain.handle('get-artifact', async (_event, projectId: string, artifactType: string) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const scan = await scanProject(project.path);
    if (!scan.specDir) throw new Error('No speckit content');

    const fileName = `${artifactType}.md`;
    const filePath = path.join(scan.specDir, fileName);
    try {
      await fs.promises.access(filePath);
    } catch {
      throw new Error(`Artifact ${artifactType} not found`);
    }

    const content = await fs.promises.readFile(filePath, 'utf-8');
    const stat = await fs.promises.stat(filePath);

    let elements: any[] = [];
    let parseWarning: string | null = null;
    let reviewParsed: ReturnType<typeof parseReview> | null = null;
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
          })),
          ...parsed.requirements.map((r) => ({
            id: r.id, type: 'requirement',
            content: { type: 'requirement', ...r },
            editableFields: [{ fieldName: 'text', fieldType: 'text' }],
          })),
          ...parsed.successCriteria.map((s) => ({
            id: s.id, type: 'success-criterion',
            content: { type: 'success-criterion', ...s },
            editableFields: [],
          })),
        ];
        break;
      }
      case 'plan': {
        const parsed = parsePlan(content);
        const planElements: typeof elements = [
          { id: 'Summary', type: 'section', content: { type: 'section', heading: 'Summary', content: parsed.summary }, editableFields: [] },
        ];
        // New format: Technical Approach (prose)
        if (parsed.technicalApproach) {
          planElements.push({ id: 'Technical Approach', type: 'section', content: { type: 'section', heading: 'Technical Approach', content: parsed.technicalApproach }, editableFields: [] });
        }
        // Old format fallback: Technical Context (key-value)
        if (!parsed.technicalApproach && Object.keys(parsed.technicalContext).length > 0) {
          planElements.push({ id: 'Technical Context', type: 'section', content: { type: 'section', heading: 'Technical Context', content: JSON.stringify(parsed.technicalContext) }, editableFields: [] });
        }
        // New format: Architecture Decisions
        for (const ad of parsed.architectureDecisions) {
          planElements.push({
            id: `Decision: ${ad.heading}`, type: 'decision',
            content: { type: 'decision', heading: ad.heading, content: ad.decision, rationale: ad.rationale, alternatives: ad.alternativesRejected },
            editableFields: [],
          });
        }
        // Old format fallback: Legacy decisions
        for (const d of parsed.decisions) {
          planElements.push({
            id: d.heading, type: 'decision',
            content: { type: 'decision', ...d },
            editableFields: [],
          });
        }
        // Project Structure / Files modified
        if (parsed.fileStructure.length > 0) {
          planElements.push({
            id: 'Project Structure', type: 'file-structure',
            content: { type: 'file-structure', heading: 'Project Structure', sections: parsed.fileStructure },
            editableFields: [],
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
        }));
        break;
      }
      case 'summary':
      case 'deep-dives': {
        const parsed = parseSummary(content);
        elements = parsed.sections.map((s) => ({
          id: s.heading,
          type: 'section' as const,
          content: { type: 'section' as const, heading: s.heading, content: s.content },
          editableFields: [],
        }));
        break;
      }
      case 'review': {
        reviewParsed = parseReview(content);
        elements = reviewParsed.findings.map((f) => ({
          id: String(f.number),
          type: 'section' as const,
          content: f,
          editableFields: [],
        }));
        break;
      }
    }
    } catch (err: unknown) {
      parseWarning = `Partial parse: ${err instanceof Error ? err.message : String(err)}`;
    }

    const reviewMeta = reviewParsed
      ? { healSummary: reviewParsed.healSummary, branch: reviewParsed.branch }
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

  // --- Edits ---

  ipcMain.handle('edit-field', async (_event, projectId: string, artifactType: string, elementId: string, field: string, value: unknown) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const scan = await scanProject(project.path);
    if (!scan.specDir) throw new Error('No speckit content');

    const filePath = path.join(scan.specDir, `${artifactType}.md`);
    try {
      await fs.promises.access(filePath);
    } catch {
      throw new Error(`Artifact ${artifactType} not found`);
    }

    switch (`${artifactType}:${field}`) {
      case 'tasks:checked':
        await editTaskCheckbox(filePath, elementId, value as boolean);
        break;
      case 'spec:text':
        await editRequirementText(filePath, elementId, value as string);
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

  ipcMain.handle('backlog:list', async (_event, projectId: string) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const backlogPath = path.join(project.path, '.claude', 'specs', 'refactor-backlog.md');
    try {
      await fs.promises.access(backlogPath);
    } catch {
      return { entries: [] };
    }

    const content = await fs.promises.readFile(backlogPath, 'utf-8');
    return parseRefactorBacklog(content);
  });

  // --- Settings ---

  ipcMain.handle('get-settings', () => {
    const config = loadConfig();
    return config.settings;
  });

  ipcMain.handle('save-settings', async (_event, partial: Partial<AppSettings>) => {
    const config = loadConfig();
    config.settings = { ...config.settings, ...partial };
    await saveConfig(config);
    return config.settings;
  });

  // --- Glossary ---

  const GLOSSARY_ENTRY = /^- `([^`]+)` — (.+)$/gm;

  ipcMain.handle('get-glossary', async (_event, projectId: string) => {
    const config = loadConfig();
    const project = getProjects(config).find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const scan = await scanProject(project.path);
    if (!scan.specDir) return { terms: {} };

    const glossaryPath = path.join(scan.specDir, 'glossary.md');
    try {
      await fs.promises.access(glossaryPath);
    } catch {
      return { terms: {} };
    }

    const content = await fs.promises.readFile(glossaryPath, 'utf-8');
    const terms: Record<string, string> = {};
    let match: RegExpExecArray | null;
    while ((match = GLOSSARY_ENTRY.exec(content)) !== null) {
      terms[match[1]] = match[2];
    }
    GLOSSARY_ENTRY.lastIndex = 0;
    return { terms };
  });

  // --- Memory diagnostics ---

  ipcMain.handle('memory:snapshot', () => {
    const mem = process.memoryUsage();
    return {
      main: {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        external: mem.external,
        arrayBuffers: mem.arrayBuffers,
      },
      timestamp: new Date().toISOString(),
    };
  });
}

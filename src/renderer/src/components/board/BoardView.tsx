import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils.js';
import FeatureCard from './FeatureCard.js';
import IntegrationDialog from '../integration/IntegrationDialog.js';
import type { Project, IntegrationPlan } from '../../types/index.js';
import * as api from '../../services/api.js';

interface BoardViewProps {
  onSelectProject: (project: Project) => void;
  selectedProjectId: string | null;
  refreshKey?: number;
}

/** Create a placeholder Project from the lightweight list entry while state loads. */
function placeholderProject(entry: { id: string; name: string; path: string }): Project {
  return {
    ...entry,
    currentBranch: '',
    hasSpeckitContent: false,
    phase: 'unknown',
    integrationState: 'not-integrated',
    error: null,
  };
}

export default function BoardView({ onSelectProject, selectedProjectId, refreshKey }: BoardViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set());
  const [integrationPlan, setIntegrationPlan] = useState<IntegrationPlan | null>(null);
  const [integrationExecuting, setIntegrationExecuting] = useState(false);
  const [refreshTarget, setRefreshTarget] = useState<Project | null>(null);

  const fetchProjects = async () => {
    try {
      // Phase 1: Get lightweight project list instantly from config cache
      const data = await api.getProjects();
      const placeholders = data.projects.map(placeholderProject);
      setProjects(placeholders);
      setLoading(false);

      // Auto-select first project if none selected
      if (!selectedProjectId && placeholders.length > 0) {
        onSelectProject(placeholders[0]!);
      }

      // Phase 2: Fetch full state for each project in parallel
      const projectIds = data.projects.map((p) => p.id);
      setLoadingStates(new Set(projectIds));

      await Promise.all(
        data.projects.map(async (entry) => {
          try {
            const state = await api.getProjectState(entry.id);
            setProjects((prev) =>
              prev.map((p) => (p.id === state.id ? state : p)),
            );
            // Update selected project with fresh data if it's the one being loaded
            if (entry.id === selectedProjectId) {
              onSelectProject(state);
            }
          } catch (err) {
            console.error(`Failed to load state for project ${entry.id}:`, err);
          } finally {
            setLoadingStates((prev) => {
              const next = new Set(prev);
              next.delete(entry.id);
              return next;
            });
          }
        }),
      );
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [refreshKey]);

  const handleAddProject = async () => {
    try {
      const result = await api.showFolderPicker();
      if (!result) return;

      if (!result.isGitRepo) {
        alert('Selected folder is not a git repository');
        return;
      }

      // Generate integration plan (read-only scan)
      const plan = await api.planIntegration(result.path);
      setIntegrationPlan(plan);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add project');
    }
  };

  const handleIntegrationConfirm = async () => {
    if (!integrationPlan) return;
    setIntegrationExecuting(true);
    try {
      await api.executeIntegration(integrationPlan.targetPath);
      if (refreshTarget) {
        // Refresh existing project — just refetch
        await fetchProjects();
        setRefreshTarget(null);
      } else {
        // New project — add and select
        const project = await api.addProject(integrationPlan.targetPath);
        setProjects((prev) => [...prev, project]);
        onSelectProject(project);
      }
      setIntegrationPlan(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Integration failed');
    } finally {
      setIntegrationExecuting(false);
    }
  };

  const handleIntegrationCancel = () => {
    setIntegrationPlan(null);
    setRefreshTarget(null);
  };

  const handleContextAction = async (action: 'refresh' | 'delete', project: Project) => {
    if (action === 'refresh') {
      try {
        const plan = await api.planIntegration(project.path);
        setRefreshTarget(project);
        setIntegrationPlan(plan);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to plan refresh');
      }
    } else if (action === 'delete') {
      try {
        await api.deleteProject(project.id);
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        if (selectedProjectId === project.id) {
          const remaining = projects.filter((p) => p.id !== project.id);
          onSelectProject(remaining[0] ?? ({ id: '' } as Project));
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Delete failed');
      }
    }
  };

  const isMac = window.api.platform === 'darwin';

  const handleDragMouseDown = (e: React.MouseEvent) => {
    if (!isMac) return;
    const initX = e.screenX;
    const initY = e.screenY;
    window.api.startWindowDrag(initX, initY);
    const onMouseMove = (ev: MouseEvent) => window.api.updateWindowDrag(ev.screenX, ev.screenY);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className={cn('bg-board-bg border-board-border flex h-screen w-[220px] min-w-[220px] flex-col overflow-hidden border-r px-2', isMac ? 'pb-3 pt-10' : 'py-3')}>
      <div
        onMouseDown={handleDragMouseDown}
        className={cn('flex items-center justify-between px-2 pb-4', isMac && 'cursor-grab active:cursor-grabbing')}
      >
        <span className="text-board-text-muted text-[0.8125rem] font-semibold tracking-[0.1em] uppercase">Projects</span>
        <button
          onClick={handleAddProject}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Add project"
          title="Add project"
          className="border-board-border text-board-text-muted hover:border-board-accent hover:text-board-accent flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-[6px] border bg-transparent text-[0.9rem]"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && <div className="text-board-text-muted p-2 text-[0.875rem]">Loading...</div>}
        {!loading && projects.length === 0 && (
          <div className="text-board-text-muted p-2 text-center text-[0.875rem]">
            No projects yet.
            <br />
            Click + to add one.
          </div>
        )}
        {projects.map((p) => (
          <FeatureCard
            key={p.id}
            project={p}
            selected={p.id === selectedProjectId}
            onClick={() => onSelectProject(p)}
            onContextAction={handleContextAction}
            loading={loadingStates.has(p.id)}
          />
        ))}
      </div>

      {integrationPlan && (
        <IntegrationDialog
          plan={integrationPlan}
          onConfirm={handleIntegrationConfirm}
          onCancel={handleIntegrationCancel}
          executing={integrationExecuting}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import FeatureCard from './FeatureCard.js';
import type { Project } from '../../types/index.js';
import * as api from '../../services/api.js';

interface BoardViewProps {
  onSelectProject: (project: Project) => void;
  selectedProjectId: string | null;
  refreshKey?: number;
}

export default function BoardView({ onSelectProject, selectedProjectId, refreshKey }: BoardViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data.projects);
      // Update selected project with fresh data (phase, branch, hasSpeckitContent)
      if (selectedProjectId) {
        const fresh = data.projects.find((p) => p.id === selectedProjectId);
        if (fresh) onSelectProject(fresh);
      } else if (data.projects.length > 0) {
        onSelectProject(data.projects[0]);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [refreshKey]);

  const handleAddProject = async () => {
    try {
      // Native OS folder picker
      const result = await api.showFolderPicker();
      if (!result) return; // User cancelled

      if (!result.isGitRepo) {
        // Could show a notification, but for now just alert
        alert('Selected folder is not a git repository');
        return;
      }

      const project = await api.addProject(result.path);
      setProjects((prev) => [...prev, project]);
      onSelectProject(project);
    } catch (err: any) {
      alert(err.message ?? 'Failed to add project');
    }
  };

  return (
    <div className="bg-board-bg border-board-border flex h-screen w-[220px] min-w-[220px] flex-col overflow-hidden border-r px-2 py-3">
      <div className="flex items-center justify-between px-2 pb-4">
        <span className="text-board-text-muted text-[0.8125rem] font-semibold tracking-[0.1em] uppercase">Projects</span>
        <button
          onClick={handleAddProject}
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
          />
        ))}
      </div>
    </div>
  );
}

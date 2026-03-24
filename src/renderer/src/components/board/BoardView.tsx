import React, { useState, useEffect } from 'react';
import { theme } from '../../theme.js';
import FeatureCard from './FeatureCard.js';
import type { Project } from '../../types/index.js';
import * as api from '../../services/api.js';

interface BoardViewProps {
  onSelectProject: (project: Project) => void;
  selectedProjectId: string | null;
}

export default function BoardView({ onSelectProject, selectedProjectId }: BoardViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data.projects);
      if (!selectedProjectId && data.projects.length > 0) {
        onSelectProject(data.projects[0]);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

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
    <div style={{
      width: '220px', minWidth: '220px', height: '100vh',
      backgroundColor: theme.bg, borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', padding: '12px 8px',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '4px 8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Projects
        </span>
        <button
          onClick={handleAddProject}
          title="Add project"
          style={{
            width: '22px', height: '22px', border: `1px solid ${theme.border}`, borderRadius: '6px',
            backgroundColor: 'transparent', color: theme.textMuted, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted; }}
        >+</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && <div style={{ color: theme.textMuted, fontSize: '0.8rem', padding: '8px' }}>Loading...</div>}
        {!loading && projects.length === 0 && (
          <div style={{ color: theme.textMuted, fontSize: '0.8rem', padding: '8px', textAlign: 'center' }}>
            No projects yet.<br />Click + to add one.
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

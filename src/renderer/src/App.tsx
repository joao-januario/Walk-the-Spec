import React, { useState, useEffect, useCallback } from 'react';
import { theme } from './theme.js';
import BoardView from './components/board/BoardView.js';
import FeatureDetail from './components/feature/FeatureDetail.js';
import EmptyState from './components/common/EmptyState.js';
import type { Project } from './types/index.js';

function MainContent({ project, refreshKey }: { project: Project | null; refreshKey: number }) {
  if (!project) {
    return <EmptyState message="Select or add a project to get started" />;
  }

  if (!project.hasSpeckitContent) {
    return <EmptyState branchName={project.currentBranch} />;
  }

  // refreshKey forces re-mount of FeatureDetail when files change
  return <FeatureDetail key={`${project.id}-${refreshKey}`} project={project} />;
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  // Listen for file change events from main process
  useEffect(() => {
    const unsubSpecs = window.api.onSpecsChanged((data: any) => {
      setRefreshKey((k) => k + 1);
      setNotification(`Files updated: ${data.files?.join(', ') ?? 'speckit artifacts'}`);
      setTimeout(() => setNotification(null), 3000);
    });

    const unsubBranch = window.api.onBranchChanged((_data: any) => {
      setRefreshKey((k) => k + 1);
      setNotification('Branch changed — reloading');
      setTimeout(() => setNotification(null), 3000);
    });

    return () => { unsubSpecs(); unsubBranch(); };
  }, []);

  return (
    <div style={{
      display: 'flex', height: '100vh', backgroundColor: theme.bg, color: theme.text,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <BoardView
        onSelectProject={setSelectedProject}
        selectedProjectId={selectedProject?.id ?? null}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
        <MainContent project={selectedProject} refreshKey={refreshKey} />
      </div>

      {/* Toast notification for live updates */}
      {notification && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', padding: '10px 18px',
          backgroundColor: `${theme.yellow}15`, border: `1px solid ${theme.yellow}40`,
          borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          fontSize: '0.8rem', color: theme.yellow, zIndex: 200,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span>⚡</span>
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}

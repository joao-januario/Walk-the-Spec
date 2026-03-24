import React, { useState, useEffect } from 'react';
import { theme } from './theme.js';
import BoardView from './components/board/BoardView.js';
import FeatureDetail from './components/feature/FeatureDetail.js';
import RefactorBacklogView from './components/refactor/RefactorBacklogView.js';
import EmptyState from './components/common/EmptyState.js';
import type { Project } from './types/index.js';

function assertNever(x: never): never {
  throw new Error(`Unexpected view: ${JSON.stringify(x)}`);
}

type MainView = { kind: 'project'; project: Project } | { kind: 'backlog'; projectId: string } | { kind: 'empty' };

function MainContent({ view, refreshKey }: { view: MainView; refreshKey: number }) {
  switch (view.kind) {
    case 'empty':
      return <EmptyState message="Select or add a project to get started" />;
    case 'backlog':
      return <RefactorBacklogView key={`backlog-${refreshKey}`} projectId={view.projectId} />;
    case 'project':
      if (!view.project.hasSpeckitContent) {
        return <EmptyState branchName={view.project.currentBranch} />;
      }
      return <FeatureDetail key={`${view.project.id}-${refreshKey}`} project={view.project} />;
    default:
      return assertNever(view);
  }
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showBacklog, setShowBacklog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

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

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setShowBacklog(false);
  };

  let view: MainView;
  if (showBacklog && selectedProject) {
    view = { kind: 'backlog', projectId: selectedProject.id };
  } else if (selectedProject) {
    view = { kind: 'project', project: selectedProject };
  } else {
    view = { kind: 'empty' };
  }

  return (
    <div style={{
      display: 'flex', height: '100vh', backgroundColor: theme.bg, color: theme.text,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <BoardView
        onSelectProject={handleSelectProject}
        selectedProjectId={selectedProject?.id ?? null}
      />
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar with broom icon */}
        {selectedProject && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0' }}>
            <button
              onClick={() => setShowBacklog(!showBacklog)}
              title={showBacklog ? 'Back to feature' : 'Refactor Backlog'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.1rem', padding: '4px 8px', borderRadius: '6px',
                opacity: showBacklog ? 1 : 0.5,
                filter: showBacklog ? 'none' : 'grayscale(0.5)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.filter = 'none'; }}
              onMouseLeave={(e) => { if (!showBacklog) { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.filter = 'grayscale(0.5)'; } }}
            >🧹</button>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 32px 24px' }}>
          <MainContent view={view} refreshKey={refreshKey} />
        </div>
      </div>

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

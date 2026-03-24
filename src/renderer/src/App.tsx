import React, { useState, useEffect } from 'react';
import { getPhaseClasses } from './theme.js';
import { cn } from './lib/utils.js';
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

    return () => {
      unsubSpecs();
      unsubBranch();
    };
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
    <div className="flex h-screen font-sans">
      <BoardView onSelectProject={handleSelectProject} selectedProjectId={selectedProject?.id ?? null} />
      <div className="flex flex-1 flex-col overflow-auto">
        {selectedProject && (
          <div className="flex justify-end px-4 pt-2">
            <button
              onClick={() => setShowBacklog(!showBacklog)}
              aria-label={showBacklog ? 'Back to feature' : 'Refactor Backlog'}
              title={showBacklog ? 'Back to feature' : 'Refactor Backlog'}
              className={cn(
                'rounded-md px-2 py-1 text-lg transition-opacity',
                showBacklog ? 'opacity-100' : 'opacity-50 hover:opacity-100',
              )}
            >
              🧹
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto px-8 pt-2 pb-6">
          <MainContent view={view} refreshKey={refreshKey} />
        </div>
      </div>

      {notification && (
        <div className="border-board-yellow/40 bg-board-yellow/10 text-board-yellow fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg">
          <span>⚡</span>
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}

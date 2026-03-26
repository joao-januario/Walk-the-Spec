import React, { useState, useEffect } from 'react';
import BoardView from './components/board/BoardView.js';
import FeatureDetail from './components/feature/FeatureDetail.js';
import EmptyState from './components/common/EmptyState.js';
import type { Project } from './types/index.js';

function applyFontSize(size: number): void {
  document.documentElement.style.fontSize = `${size}px`;
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  // Load saved font size on mount + listen for menu changes
  useEffect(() => {
    window.api.getSettings().then((settings) => {
      applyFontSize(settings.fontSize);
    }).catch(() => {});

    const unsubSettings = window.api.onSettingsChanged((data: { fontSize: number }) => {
      applyFontSize(data.fontSize);
    });

    return () => { unsubSettings(); };
  }, []);

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
  };

  return (
    <div className="flex h-screen font-sans">
      <BoardView onSelectProject={handleSelectProject} selectedProjectId={selectedProject?.id ?? null} refreshKey={refreshKey} />
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="flex-1 overflow-auto px-8 pt-4 pb-6">
          {selectedProject ? (
            selectedProject.hasSpeckitContent ? (
              <FeatureDetail key={`${selectedProject.id}-${refreshKey}`} project={selectedProject} />
            ) : (
              <EmptyState branchName={selectedProject.currentBranch} />
            )
          ) : (
            <EmptyState message="Select or add a project to get started" />
          )}
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

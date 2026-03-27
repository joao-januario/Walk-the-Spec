import React, { useState, useEffect } from 'react';
import BoardView from './components/board/BoardView.js';
import FeatureDetail from './components/feature/FeatureDetail.js';
import EmptyState from './components/common/EmptyState.js';
import UpdateDialog from './components/common/UpdateDialog.js';
import { usePhaseNotification } from './hooks/usePhaseNotification.js';
import { useAutoUpdate } from './hooks/useAutoUpdate.js';
import { applyTheme } from './themes/apply-theme.js';
import { DEFAULT_THEME_ID } from './themes/themes.js';
import { getReadingFontById, DEFAULT_READING_FONT_ID } from './themes/fonts.js';
import type { Project } from './types/index.js';

function applyFontSize(size: number): void {
  document.documentElement.style.fontSize = `${size}px`;
}

function applyReadingFont(fontId: string): void {
  const font = getReadingFontById(fontId);
  if (font) {
    document.documentElement.style.setProperty('--font-sans', font.stack);
  }
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  usePhaseNotification();
  const autoUpdate = useAutoUpdate();

  // Load saved settings (font size + theme) on mount + listen for menu changes
  useEffect(() => {
    window.api.getSettings().then((settings) => {
      applyFontSize(settings.fontSize);
      applyReadingFont(settings.readingFont ?? DEFAULT_READING_FONT_ID);
      applyTheme(settings.theme ?? DEFAULT_THEME_ID);
    }).catch(() => {});

    const unsubSettings = window.api.onSettingsChanged((data: { fontSize?: number; readingFont?: string; theme?: string }) => {
      if (data.fontSize !== undefined) applyFontSize(data.fontSize);
      if (data.readingFont !== undefined) applyReadingFont(data.readingFont);
      if (data.theme !== undefined) applyTheme(data.theme);
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
      <div className="flex-1 overflow-auto px-8 pt-4 pb-16">
        <div className="max-w-[1500px]">
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

      <UpdateDialog update={autoUpdate} />

      {notification && (
        <div className="border-board-yellow/40 bg-board-yellow/10 text-board-yellow fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg">
          <span>⚡</span>
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}

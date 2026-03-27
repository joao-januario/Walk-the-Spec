import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPhaseClasses } from '../../theme.js';
import { cn } from '../../lib/utils.js';
import ArtifactTabs from './ArtifactTabs.js';
import SpecView from '../artifacts/SpecView.js';
import PlanView from '../artifacts/PlanView.js';
import TasksView from '../artifacts/TasksView.js';
import ResearchView from '../artifacts/ResearchView.js';
import ReviewView from '../artifacts/ReviewView.js';
import SummaryView from '../artifacts/SummaryView.js';
import RefactorBacklogView from '../refactor/RefactorBacklogView.js';
import EmptyState from '../common/EmptyState.js';
import IntegrationBanner from '../integration/IntegrationBanner.js';
import { useFeatureData, useArtifactData } from '../../hooks/useFeatureData.js';
import { useCommentStore } from '../../hooks/useCommentStore.js';
import { usePhaseNotification } from '../../hooks/usePhaseNotification.js';
import { formatComments } from '../../utils/format-comments.js';
import { GlossaryProvider } from '../../context/GlossaryContext.js';
import type { Project, ArtifactType, ReviewFinding } from '../../types/index.js';

const TAB_ORDER: ArtifactType[] = ['spec', 'plan', 'research', 'tasks', 'summary', 'deep-dives', 'review'];

const PHASE_HERO: Record<string, ArtifactType> = {
  specify: 'spec',
  plan: 'plan',
  tasks: 'tasks',
  implement: 'tasks',
  summary: 'summary',
  review: 'review',
};

export default function FeatureDetail({ project }: { project: Project }) {
  const { feature, loading: featureLoading } = useFeatureData(project.id);
  const [showBacklog, setShowBacklog] = useState(false);
  const [glossary, setGlossary] = useState<Record<string, string>>({});
  const [clipboardFallback, setClipboardFallback] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const { commentableTabs } = usePhaseNotification();
  const commentStore = useCommentStore();

  useEffect(() => {
    window.api.getGlossary(project.id).then((res) => setGlossary(res.terms)).catch(() => {});
  }, [project.id]);

  const availableTypes = (feature?.artifacts ?? [])
    .map((a) => a.type)
    .filter((t): t is ArtifactType => TAB_ORDER.includes(t as ArtifactType))
    .sort((a, b) => TAB_ORDER.indexOf(a as ArtifactType) - TAB_ORDER.indexOf(b as ArtifactType));
  const heroType = PHASE_HERO[project.phase] ?? 'spec';
  const defaultTab = availableTypes.includes(heroType) ? heroType : (availableTypes[0] ?? null);

  const [activeTab, setActiveTab] = useState<ArtifactType | null>(defaultTab);

  useEffect(() => {
    const types = (feature?.artifacts ?? [])
      .map((a) => a.type)
      .filter((t): t is ArtifactType => TAB_ORDER.includes(t as ArtifactType))
      .sort((a, b) => TAB_ORDER.indexOf(a as ArtifactType) - TAB_ORDER.indexOf(b as ArtifactType));
    const hero = PHASE_HERO[project.phase] ?? 'spec';
    setActiveTab((types.includes(hero) ? hero : (types[0] ?? null)) as ArtifactType | null);
    setShowBacklog(false);
  }, [project.id, feature]);

  const { artifact, loading: artifactLoading, refetch: refetchArtifact } = useArtifactData(project.id, activeTab);

  const handleToggleTask = async (taskId: string, checked: boolean) => {
    try {
      await window.api.editField(project.id, 'tasks', taskId, 'checked', checked);
      refetchArtifact();
    } catch (err: unknown) {
      console.error('Edit failed:', err);
    }
  };

  const isTabCommentable = useCallback(
    (tab: ArtifactType | null): boolean => {
      if (!tab) return false;
      return commentableTabs.includes(tab);
    },
    [commentableTabs],
  );

  const handleCopyComments = useCallback(async () => {
    const formatted = formatComments(commentStore.comments);
    if (!formatted) return;

    try {
      await navigator.clipboard.writeText(formatted);
      setClipboardFallback(null);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err: unknown) {
      console.warn('Clipboard write failed:', err instanceof Error ? err.message : err);
      setClipboardFallback(formatted);
    }
  }, [commentStore.comments]);

  if (featureLoading) {
    return <div className="text-board-text-muted text-[0.9375rem]">Loading feature...</div>;
  }

  if (!feature) {
    return <EmptyState branchName={project.currentBranch} />;
  }

  const p = getPhaseClasses(project.phase);
  const currentTabCommentable = isTabCommentable(activeTab);

  const commentProps = currentTabCommentable && activeTab
    ? {
        commentEnabled: true,
        getComment: (heading: string) => commentStore.getComment(activeTab, heading),
        onCommentChange: (heading: string, text: string) => commentStore.setComment(activeTab, heading, text),
      }
    : {
        commentEnabled: false,
        getComment: (_heading: string) => '',
        onCommentChange: (_heading: string, _text: string) => {},
      };

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-board-text-bright m-0 flex-1 text-[1.25rem]">{feature.summary || project.name}</h2>
          <AnimatePresence mode="wait">
            <motion.span
              key={project.phase}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={cn('rounded-full px-2.5 py-0.5 text-[0.8125rem] font-semibold', p.bg, p.text)}
            >
              {p.label}
            </motion.span>
          </AnimatePresence>
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
        <div className="text-board-text-muted mt-1 text-[0.8125rem]">
          <code className="text-board-text text-[0.8125rem]">{feature.branchName}</code>
        </div>
      </div>

      <IntegrationBanner integrationState={project.integrationState} />

      {showBacklog ? (
        <RefactorBacklogView projectId={project.id} />
      ) : (
        <GlossaryProvider value={glossary}>
          {commentStore.hasAnyComments() && (
            <button
              type="button"
              onClick={handleCopyComments}
              className={cn(
                'fixed top-4 right-6 z-50 flex items-center gap-1.5 rounded-lg px-4 py-2 text-[0.875rem] font-semibold shadow-lg transition-all',
                'border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-cyan',
                copyFeedback
                  ? 'bg-board-cyan/20 border-board-cyan/50 text-board-cyan'
                  : 'bg-board-surface border-board-cyan/40 text-board-cyan hover:bg-board-cyan/10 hover:border-board-cyan/60',
              )}
            >
              {copyFeedback ? (
                <><Check size={15} /> Copied!</>
              ) : (
                <><Copy size={15} /> Copy comments</>
              )}
            </button>
          )}
          {availableTypes.length > 0 && activeTab && (
            <ArtifactTabs
              available={availableTypes}
              active={activeTab}
              onSelect={setActiveTab}
              heroTab={heroType}
              phase={project.phase}
            />
          )}

          {clipboardFallback && (
            <div className="mb-4 rounded-md border border-board-yellow/30 bg-board-yellow/[0.05] p-3">
              <div className="text-board-yellow mb-2 text-[0.8125rem] font-semibold">
                Clipboard write failed — copy manually:
              </div>
              <textarea
                readOnly
                value={clipboardFallback}
                className="w-full rounded border border-board-border bg-board-bg p-2 text-[0.8125rem] text-board-text font-mono resize-y min-h-20"
                rows={6}
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                onClick={() => setClipboardFallback(null)}
                className="mt-2 text-[0.75rem] text-board-text-muted underline bg-transparent border-none cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {artifactLoading && <div className="text-board-text-muted text-[0.9375rem]">Loading...</div>}

          {artifact && activeTab === 'spec' && (
            <SpecView elements={artifact.elements} {...commentProps} />
          )}
          {artifact && activeTab === 'plan' && (
            <PlanView elements={artifact.elements} {...commentProps} />
          )}
          {artifact && activeTab === 'tasks' && <TasksView elements={artifact.elements} onToggleTask={handleToggleTask} />}
          {artifact && activeTab === 'research' && (
            <ResearchView elements={artifact.elements} {...commentProps} />
          )}
          {artifact && activeTab === 'summary' && (
            <SummaryView elements={artifact.elements} {...commentProps} />
          )}
          {artifact && activeTab === 'deep-dives' && (
            <SummaryView elements={artifact.elements} {...commentProps} />
          )}
          {artifact && activeTab === 'review' && (
            <ReviewView
              findings={artifact.elements.map((e) => e.content as ReviewFinding)}
              healSummary={artifact.reviewMeta?.healSummary ?? null}
              {...commentProps}
            />
          )}
        </GlossaryProvider>
      )}
    </div>
  );
}

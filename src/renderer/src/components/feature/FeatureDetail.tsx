import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPhaseClasses } from '../../theme.js';
import { cn } from '../../lib/utils.js';
import ArtifactTabs from './ArtifactTabs.js';
import SpecView from '../artifacts/SpecView.js';
import PlanView from '../artifacts/PlanView.js';
import TasksView from '../artifacts/TasksView.js';
import ResearchView from '../artifacts/ResearchView.js';
import ReviewView from '../artifacts/ReviewView.js';
import EmptyState from '../common/EmptyState.js';
import { useFeatureData, useArtifactData } from '../../hooks/useFeatureData.js';
import { useComments } from '../../hooks/useComments.js';
import type { Project, ArtifactType, ReviewFinding } from '../../types/index.js';

const PHASE_HERO: Record<string, ArtifactType> = {
  specify: 'spec',
  plan: 'plan',
  tasks: 'tasks',
  implement: 'tasks',
  review: 'review',
};

export default function FeatureDetail({ project }: { project: Project }) {
  const { feature, loading: featureLoading } = useFeatureData(project.id);
  const availableTypes = (feature?.artifacts ?? [])
    .map((a) => a.type)
    .filter((t) => ['spec', 'plan', 'tasks', 'research', 'review'].includes(t));
  const heroType = PHASE_HERO[project.phase] ?? 'spec';
  const defaultTab = availableTypes.includes(heroType) ? heroType : (availableTypes[0] ?? null);

  const [activeTab, setActiveTab] = useState<ArtifactType | null>(defaultTab);

  useEffect(() => {
    const types = (feature?.artifacts ?? [])
      .map((a) => a.type)
      .filter((t) => ['spec', 'plan', 'tasks', 'research', 'review'].includes(t));
    const hero = PHASE_HERO[project.phase] ?? 'spec';
    setActiveTab((types.includes(hero) ? hero : (types[0] ?? null)) as ArtifactType | null);
  }, [project.id, feature]);

  const { artifact, loading: artifactLoading, refetch: refetchArtifact } = useArtifactData(project.id, activeTab);
  const {
    comments,
    add: addComment,
    update: updateComment,
    remove: removeComment,
  } = useComments(project.id, activeTab);

  const handleAddComment = async (elementId: string, content: string) => {
    await addComment(elementId, content);
    refetchArtifact();
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    await updateComment(commentId, content);
  };

  const handleDeleteComment = async (commentId: string) => {
    await removeComment(commentId);
    refetchArtifact();
  };

  const handleToggleTask = async (taskId: string, checked: boolean) => {
    try {
      await window.api.editField(project.id, 'tasks', taskId, 'checked', checked);
      refetchArtifact();
    } catch (err: any) {
      console.error('Edit failed:', err);
    }
  };

  if (featureLoading) {
    return <div className="text-board-text-muted text-[0.9375rem]">Loading feature...</div>;
  }

  if (!feature) {
    return <EmptyState branchName={project.currentBranch} />;
  }

  const p = getPhaseClasses(project.phase);

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-board-text-bright m-0 text-[1.25rem]">{feature.summary || project.name}</h2>
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
        </div>
        <div className="text-board-text-muted mt-1 text-[0.8125rem]">
          <code className="text-board-text text-[0.8125rem]">{feature.branchName}</code>
        </div>
      </div>

      {availableTypes.length > 0 && activeTab && (
        <ArtifactTabs available={availableTypes} active={activeTab} onSelect={setActiveTab} />
      )}

      {artifactLoading && <div className="text-board-text-muted text-[0.9375rem]">Loading...</div>}

      {artifact && activeTab === 'spec' && (
        <SpecView
          elements={artifact.elements}
          comments={comments}
          onAddComment={handleAddComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
        />
      )}
      {artifact && activeTab === 'plan' && <PlanView elements={artifact.elements} />}
      {artifact && activeTab === 'tasks' && <TasksView elements={artifact.elements} onToggleTask={handleToggleTask} />}
      {artifact && activeTab === 'research' && <ResearchView elements={artifact.elements} />}
      {artifact && activeTab === 'review' && (
        <ReviewView
          findings={artifact.elements.map((e) => e.content as ReviewFinding)}
          healSummary={artifact.reviewMeta?.healSummary ?? null}
        />
      )}
    </div>
  );
}

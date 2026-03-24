import React, { useState, useEffect } from 'react';
import { theme, getPhaseColors } from '../../theme.js';
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
  const availableTypes = (feature?.artifacts ?? []).map((a) => a.type).filter((t) => ['spec', 'plan', 'tasks', 'research', 'review'].includes(t));
  const heroType = PHASE_HERO[project.phase] ?? 'spec';
  const defaultTab = availableTypes.includes(heroType) ? heroType : availableTypes[0] ?? null;

  const [activeTab, setActiveTab] = useState<ArtifactType | null>(defaultTab);

  useEffect(() => {
    const types = (feature?.artifacts ?? []).map((a) => a.type).filter((t) => ['spec', 'plan', 'tasks', 'research', 'review'].includes(t));
    const hero = PHASE_HERO[project.phase] ?? 'spec';
    setActiveTab((types.includes(hero) ? hero : types[0] ?? null) as ArtifactType | null);
  }, [project.id, feature]);

  const { artifact, loading: artifactLoading, refetch: refetchArtifact } = useArtifactData(project.id, activeTab);
  const { comments, add: addComment, update: updateComment, remove: removeComment } = useComments(project.id, activeTab);

  const handleAddComment = async (elementId: string, content: string) => {
    await addComment(elementId, content);
    refetchArtifact(); // refresh comment counts
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
    return <div style={{ color: theme.textMuted, fontSize: '0.85rem' }}>Loading feature...</div>;
  }

  if (!feature) {
    return <EmptyState branchName={project.currentBranch} />;
  }

  const p = getPhaseColors(project.phase);

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: theme.textBright }}>{feature.summary || project.name}</h2>
          <span style={{ padding: '2px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: p.bg, color: p.text }}>{p.label}</span>
        </div>
        <div style={{ color: theme.textMuted, fontSize: '0.75rem', marginTop: '4px' }}>
          <code style={{ fontSize: '0.7rem', color: theme.text }}>{feature.branchName}</code>
        </div>
      </div>

      {availableTypes.length > 0 && activeTab && (
        <ArtifactTabs available={availableTypes} active={activeTab} onSelect={setActiveTab} />
      )}

      {artifactLoading && <div style={{ color: theme.textMuted, fontSize: '0.85rem' }}>Loading...</div>}

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

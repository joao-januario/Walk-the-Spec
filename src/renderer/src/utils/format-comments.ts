import type { ArtifactType } from '../types/index.js';

const TAB_ORDER: ArtifactType[] = ['spec', 'plan', 'research', 'tasks', 'summary', 'deep-dives', 'review'];

const DOC_LABELS: Record<string, string> = {
  spec: 'Spec',
  plan: 'Plan',
  research: 'Research',
  summary: 'Summary',
  'deep-dives': 'Deep Dives',
  review: 'Review',
  tasks: 'Tasks',
};

export function formatComments(comments: Map<ArtifactType, Map<string, string>>): string {
  const blocks: string[] = [];

  const sortedTypes = [...comments.keys()].sort(
    (a, b) => TAB_ORDER.indexOf(a) - TAB_ORDER.indexOf(b),
  );

  for (const artifactType of sortedTypes) {
    const sections = comments.get(artifactType);
    if (!sections) continue;

    const label = DOC_LABELS[artifactType] ?? artifactType;

    for (const [heading, text] of sections) {
      if (!text.trim()) continue;
      blocks.push(`[${label}] > ${heading}:\n${text}`);
    }
  }

  if (blocks.length === 0) return '';
  return '/spec.comments ' + blocks.join('\n\n');
}

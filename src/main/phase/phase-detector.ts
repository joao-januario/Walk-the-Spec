export type Phase = 'specify' | 'plan' | 'tasks' | 'implement' | 'review' | 'unknown';

const CHECKED_PATTERN = /- \[x\]/i;

export function detectPhase(artifactFiles: string[], tasksContent?: string): Phase {
  const hasSpec = artifactFiles.includes('spec.md');
  const hasPlan = artifactFiles.includes('plan.md');
  const hasTasks = artifactFiles.includes('tasks.md');
  const hasReview = artifactFiles.includes('review.md');

  if (hasReview && hasTasks && tasksContent && CHECKED_PATTERN.test(tasksContent)) {
    return 'review';
  }

  if (hasTasks) {
    if (tasksContent && CHECKED_PATTERN.test(tasksContent)) {
      return 'implement';
    }
    return 'tasks';
  }

  if (hasPlan) return 'plan';
  if (hasSpec) return 'specify';

  return 'unknown';
}

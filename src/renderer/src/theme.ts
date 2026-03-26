// Phase class mappings — returns Tailwind class strings for phase-colored elements.
// All actual colors are defined in index.css @theme block. This is the lookup utility.

export const phaseClasses = {
  specify: {
    bg: 'bg-phase-specify/20',
    text: 'text-phase-specify',
    dot: 'bg-phase-specify',
    border: 'border-phase-specify',
    label: 'Specify',
  },
  plan: {
    bg: 'bg-phase-plan/20',
    text: 'text-phase-plan',
    dot: 'bg-phase-plan',
    border: 'border-phase-plan',
    label: 'Plan',
  },
  tasks: {
    bg: 'bg-phase-tasks/20',
    text: 'text-phase-tasks',
    dot: 'bg-phase-tasks',
    border: 'border-phase-tasks',
    label: 'Tasks',
  },
  implement: {
    bg: 'bg-phase-implement/20',
    text: 'text-phase-implement',
    dot: 'bg-phase-implement',
    border: 'border-phase-implement',
    label: 'Implement',
  },
  summary: {
    bg: 'bg-phase-summary/20',
    text: 'text-phase-summary',
    dot: 'bg-phase-summary',
    border: 'border-phase-summary',
    label: 'Summary',
  },
  review: {
    bg: 'bg-phase-review/20',
    text: 'text-phase-review',
    dot: 'bg-phase-review',
    border: 'border-phase-review',
    label: 'Review',
  },
  unknown: {
    bg: 'bg-phase-unknown/20',
    text: 'text-phase-unknown',
    dot: 'bg-phase-unknown',
    border: 'border-phase-unknown',
    label: '—',
  },
} as const;

export function getPhaseClasses(phase: string) {
  return phaseClasses[phase as keyof typeof phaseClasses] ?? phaseClasses.unknown;
}

// Severity class mappings for review findings
export const severityClasses = {
  CRITICAL: { bg: 'bg-board-red/20', text: 'text-board-red' },
  HIGH: { bg: 'bg-board-orange/20', text: 'text-board-orange' },
  MEDIUM: { bg: 'bg-board-yellow/20', text: 'text-board-yellow' },
  LOW: { bg: 'bg-board-teal/20', text: 'text-board-teal' },
  NEEDS_REFACTOR: { bg: 'bg-board-purple/20', text: 'text-board-purple' },
} as const;

// Finding status class mappings
export const statusClasses = {
  FIXED: { bg: 'bg-board-green/20', text: 'text-board-green', label: 'FIXED' },
  SKIPPED: { bg: 'bg-board-yellow/20', text: 'text-board-yellow', label: 'SKIPPED' },
  MANUAL: { bg: 'bg-board-red/20', text: 'text-board-red', label: 'MANUAL — needs manual fix' },
  unfixed: { bg: 'bg-board-border/40', text: 'text-board-text-muted', label: 'Unfixed' },
} as const;

// Priority metadata for tooltips
export interface PriorityMeta {
  label: string;
  description: string;
}

export const priorityMeta: Record<string, PriorityMeta> = {
  P1: { label: 'Critical', description: 'Must ship for MVP — blocks release' },
  P2: { label: 'High', description: 'Important but not blocking MVP' },
  P3: { label: 'Medium', description: 'Valuable enhancement, can defer' },
  P4: { label: 'Low', description: 'Minor improvement, nice-to-have' },
  P5: { label: 'Nice-to-have', description: 'Stretch goal if time permits' },
};

export function getPriorityMeta(priority: string): PriorityMeta {
  return priorityMeta[priority] ?? { label: priority, description: '' };
}

// Priority badge classes
export const priorityClasses: Record<string, string> = {
  P1: 'bg-board-red/20 text-board-red',
  P2: 'bg-board-orange/20 text-board-orange',
  P3: 'bg-board-yellow/20 text-board-yellow',
  P4: 'bg-board-green/20 text-board-green',
  P5: 'bg-board-accent/20 text-board-accent',
};

export function getPriorityClasses(priority: string): string {
  return priorityClasses[priority] ?? 'bg-board-text-muted/20 text-board-text-muted';
}

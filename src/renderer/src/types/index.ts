// Phase enum
export type Phase = 'specify' | 'plan' | 'tasks' | 'implement' | 'summary' | 'review' | 'unknown';

// Artifact types
export type ArtifactType = 'spec' | 'plan' | 'tasks' | 'research' | 'summary' | 'deep-dives' | 'review';

// Review finding types
export type FindingSeverity = 'NEEDS_REFACTOR' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type FindingStatus = 'unfixed' | 'FIXED' | 'SKIPPED' | 'MANUAL';

export interface CodeSnippet {
  label: string;
  language: string;
  code: string;
}

export interface ReviewFinding {
  number: number;
  ruleId: string;
  severity: FindingSeverity;
  location: string;
  summary: string;
  fix: string;
  why: string;
  gain: string;
  codeBlocks: CodeSnippet[];
  status: FindingStatus;
}

export interface HealFindingStatus {
  number: number;
  ruleId: string;
  status: FindingStatus;
  notes: string;
}

export interface HealSummary {
  date: string;
  appliedCount: number;
  skippedCount: number;
  revertedCount: number;
  findings: HealFindingStatus[];
}

export interface RefactorEntry {
  id: string;
  branch: string;
  rule: string;
  files: string;
  description: string;
  status: string;
}

// Element types within artifacts
export type ElementType =
  | 'user-story'
  | 'requirement'
  | 'success-criterion'
  | 'task'
  | 'decision'
  | 'section'
  | 'edge-case';

// Field types for structured editing
export type FieldType = 'checkbox' | 'dropdown' | 'text';

// --- Project ---

export interface Project {
  id: string;
  name: string;
  path: string;
  currentBranch: string;
  hasSpeckitContent: boolean;
  phase: Phase;
  error?: string | null;
}

// --- Feature ---

export interface Feature {
  branchName: string;
  phase: Phase;
  specDir: string;
  summary: string;
  artifacts: ArtifactSummary[];
}

export interface ArtifactSummary {
  type: ArtifactType;
  filePath: string;
  lastModified: string;
  elementCount: number;
}

// --- Artifact & Elements ---

export interface Artifact {
  type: ArtifactType;
  filePath: string;
  lastModified: string;
  elements: Element[];
  reviewMeta?: { healSummary: HealSummary | null; branch: string };
}

export interface Element {
  id: string;
  type: ElementType;
  content: ElementContent;
  editableFields: EditableField[];
  commentCount: number;
}

export interface EditableField {
  fieldName: string;
  fieldType: FieldType;
  options?: string[];
}

// Element content subtypes
export type ElementContent =
  | UserStoryContent
  | RequirementContent
  | SuccessCriterionContent
  | TaskContent
  | DecisionContent
  | SectionContent;

export interface UserStoryContent {
  type: 'user-story';
  number: number;
  title: string;
  priority: string;
  description: string;
  whyPriority: string;
  independentTest: string;
  acceptanceScenarios: GWTScenario[];
}

export interface GWTScenario {
  given: string;
  when: string;
  then: string;
}

export interface RequirementContent {
  type: 'requirement';
  id: string;
  text: string;
}

export interface SuccessCriterionContent {
  type: 'success-criterion';
  id: string;
  text: string;
}

export interface TaskContent {
  type: 'task';
  id: string;
  description: string;
  checked: boolean;
  parallel: boolean;
  userStory: string | null;
  phase: string;
}

export interface DecisionContent {
  type: 'decision';
  heading: string;
  content: string;
  rationale?: string;
  alternatives?: string;
}

export interface SectionContent {
  type: 'section';
  heading: string;
  content: string;
}

// --- Comments ---

export interface Comment {
  id: string;
  elementId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentsResponse {
  artifactType: ArtifactType;
  comments: Comment[];
}

// --- WebSocket Messages ---

export type WSMessage = SpecsChangedMessage | BranchChangedMessage | ProjectErrorMessage;

export interface SpecsChangedMessage {
  type: 'specs-changed';
  projectId: string;
  files: string[];
  timestamp: string;
}

export interface BranchChangedMessage {
  type: 'branch-changed';
  projectId: string;
  oldBranch: string;
  newBranch: string;
  hasSpeckitContent: boolean;
  phase: Phase;
  timestamp: string;
}

export interface ProjectErrorMessage {
  type: 'project-error';
  projectId: string;
  error: string;
  timestamp: string;
}

# Repo Map

Generated: 2026-03-27T11:47:53.948Z
Updated: 2026-03-27T11:47:53.948Z
Files: 102
Token estimate: ~7087

---

electron.vite.config.ts
│ hash: 728675d71fec
│
│ imports: electron-vite, @vitejs/plugin-react, @tailwindcss/vite
│
│ export default default

⋮...

src/main/config/config-manager.ts
│ hash: 24f8cf04b72b
│
│ imports: fs, path, os, uuid
│ local: ../utils/paths.js
│
│ export interface ProjectEntry
│ export type SoundVolume
│ export interface AppSettings
│ export const DEFAULT_SETTINGS: AppSettings
│ export interface WalkTheSpecConfig
│ export function getDefaultConfigPath(): string
│ export function loadConfig(configPath: string = DEFAULT_CONFIG_PATH): WalkTheSpecConfig
│ export function saveConfig(configPath: string = DEFAULT_CONFIG_PATH, config: WalkTheSpecConfig): void
│ export function addProject(config: WalkTheSpecConfig, projectPath: string, name?: string): ProjectEntry
│ export function removeProject(config: WalkTheSpecConfig, id: string): void
│ export function getProjects(config: WalkTheSpecConfig): ProjectEntry[]

⋮...

src/main/index.ts
│ hash: 6b6931ba8b32
│
│ imports: electron, path, fs
│ local: ./ipc/handlers.js, ./config/config-manager.js, ./projects/file-watcher.js, ./notifications/os-notifier.js, ./notifications/sound-player.js, ./notifications/notify-server.js, ./projects/project-scanner.js, ./phase/phase-detector.js, ./utils/paths.js, ./repomap/index.js, ./repomap/extractors.js
│
│ export function startWatchingProject(projectId: string, projectPath: string)
│ export function stopWatchingProject(projectId: string)

⋮...

src/main/ipc/handlers.ts
│ hash: 1d0d7b187b81
│
│ imports: electron, fs, path
│ local: ../config/config-manager.js, ../config/config-manager.js, ../projects/project-scanner.js, ../phase/phase-detector.js, ../parser/spec-parser.js, ../parser/plan-parser.js, ../parser/tasks-parser.js, ../parser/research-parser.js, ../parser/review-parser.js, ../parser/summary-parser.js, ../parser/refactor-backlog-parser.js, ../writer/artifact-writer.js, ../repomap/index.js, ../repomap/extractors.js
│
│ export function registerIpcHandlers()

⋮...

src/main/notifications/notify-server.ts
│ hash: 2e962d5277aa
│
│ imports: http
│
│ export interface NotifyPayload
│ export function startNotifyServer(onNotify: NotifyHandler): void
│ export function stopNotifyServer(): void
│ export { NOTIFY_PORT }

⋮...

src/main/notifications/os-notifier.ts
│ hash: 02fd7a4da1ef
│
│ imports: electron, path
│
│ export interface CompletionNotificationOpts
│ export function showCompletionNotification({ projectName, command, mainWindow }: CompletionNotificationOpts): void

⋮...

src/main/notifications/sound-player.ts
│ hash: 932a4c4ee99f
│
│ imports: child_process, path
│ local: ../config/config-manager.js
│
│ export async function playNotificationSound(volume: SoundVolume, command: string): Promise<void>

⋮...

src/main/parser/markdown-parser.ts
│ hash: 5e7084ba03ed
│
│ imports: unified, remark-parse, remark-gfm, remark-frontmatter, mdast
│
│ export function parseMarkdown(content: string): Root

⋮...

src/main/parser/plan-parser.ts
│ hash: 565a0d197038
│
│ imports: mdast
│ local: ./markdown-parser.js
│
│ export interface ArchitectureDecision
│ export interface Decision
│ export type OperationType
│ export interface FileStructureEntry
│ export interface FileStructureSection
│ export interface PlanParseResult
│ export function parsePlan(content: string): PlanParseResult
│ export function parseFileStructureContent(raw: string): FileStructureSection[]

⋮...

src/main/parser/refactor-backlog-parser.ts
│ hash: 9fd57b9990f0
│
│ export interface RefactorEntry
│ export interface RefactorBacklogResult
│ export function parseRefactorBacklog(content: string): RefactorBacklogResult

⋮...

src/main/parser/research-parser.ts
│ hash: d9842d910122
│
│ imports: mdast
│ local: ./markdown-parser.js
│
│ export interface ResearchDecision
│ export interface ResearchParseResult
│ export function parseResearch(content: string): ResearchParseResult

⋮...

src/main/parser/review-parser.ts
│ hash: f6f858a5d93d
│
│ export type FindingSeverity
│ export type FindingStatus
│ export interface CodeSnippet
│ export interface ReviewFinding
│ export interface HealFindingStatus
│ export interface HealSummary
│ export interface ReviewParseResult
│ export function parseReview(content: string): ReviewParseResult

⋮...

src/main/parser/spec-parser.ts
│ hash: 44191e78ec0a
│
│ imports: mdast, unist-util-visit
│ local: ./markdown-parser.js
│
│ export interface GWTScenario
│ export interface UserStory
│ export interface Requirement
│ export interface SuccessCriterion
│ export interface Entity
│ export interface SpecParseResult
│ export function parseSpec(content: string): SpecParseResult

⋮...

src/main/parser/summary-parser.ts
│ hash: e1ff98baf7f6
│
│ imports: mdast
│ local: ./markdown-parser.js
│
│ export interface SummarySection
│ export interface SummaryParseResult
│ export function parseSummary(content: string): SummaryParseResult

⋮...

src/main/parser/tasks-parser.ts
│ hash: 9ff42cc6ac55
│
│ imports: mdast
│ local: ./markdown-parser.js
│
│ export interface TaskItem
│ export interface Phase
│ export interface TasksParseResult
│ export function parseTasks(content: string): TasksParseResult

⋮...

src/main/phase/phase-detector.ts
│ hash: ff06397c45ca
│
│ export type Phase
│ export function detectPhase(artifactFiles: string[], tasksContent?: string): Phase

⋮...

src/main/projects/file-watcher.ts
│ hash: ca0a26a40a80
│
│ imports: chokidar, path, fs
│ local: ../utils/paths.js, ../repomap/tree-sitter/languages.js
│
│ export interface WatcherEvents
│ export function watchProject(projectId: string, projectPath: string, events: WatcherEvents): void
│ export function unwatchProject(projectId: string): void
│ export function unwatchAll(): void

⋮...

src/main/projects/project-scanner.ts
│ hash: 51a0f2c4a447
│
│ imports: fs, path
│
│ export interface ScanResult
│ export function scanProject(projectPath: string): ScanResult

⋮...

src/main/repomap/extractors.ts
│ hash: 60dbeb10d378
│
│ local: ./ts-extractor.js, ./tree-sitter/index.js, ./types.js
│
│ export async function getAllExtractors(): Promise<Extractor[]>

⋮...

src/main/repomap/format.ts
│ hash: 4381f7b4262e
│
│ local: ./types.js
│
│ export function formatRepoMap(map: RepoMap): string
│ export function buildRepoMap(files: FileExtraction[], now?: string): RepoMap

⋮...

src/main/repomap/generator.ts
│ hash: f16657a2849e
│
│ imports: fs, path, crypto
│ local: ../utils/paths.js, ./format.js, ./types.js
│
│ export function getMapPath(repoRoot: string): string
│ export async function generateRepoMap(repoRoot: string, extractors: Extractor[], options?: { incremental?: boolean }): Promise<RepoMap>
│ export async function updateRepoMapFiles(repoRoot: string, changedFiles: string[], extractors: Extractor[]): Promise<RepoMap>
│ export function isMapValid(repoRoot: string): boolean

⋮...

src/main/repomap/index.ts
│ hash: 6d868865abb1
│
│ export { typescriptExtractor }
│ export { getAllExtractors }
│ export { formatRepoMap }
│ export { buildRepoMap }
│ export { generateRepoMap }
│ export { updateRepoMapFiles }
│ export { getMapPath }
│ export { isMapValid }
│ export { Extractor }
│ export { FileExtraction }
│ export { ExtractedIdentifier }
│ export { ImportEntry }
│ export { RepoMap }
│ export { RepoMapMetadata }

⋮...

src/main/repomap/tree-sitter/extractor.ts
│ hash: 1c28fec3ef08
│
│ imports: web-tree-sitter, crypto, path
│ local: ../../utils/paths.js, ../types.js, ./languages.js, ./queries.js
│
│ export async function initTreeSitter(): Promise<void>
│ export async function loadLanguage(config: LanguageConfig): Promise<Language>
│ export function createTreeSitterExtractor(config: LanguageConfig, language: Language, queries: LanguageQueries): Extractor

⋮...

src/main/repomap/tree-sitter/index.ts
│ hash: 08c9bc4959c8
│
│ local: ./extractor.js, ./languages.js, ./queries.js, ../types.js
│
│ export async function getTreeSitterExtractors(): Promise<Extractor[]>
│ export { ALL_EXTENSIONS }
│ export { EXTENSION_TO_LANGUAGE }
│ export { EXTRACTABLE_LANGUAGES }
│ export { LANGUAGE_CONFIGS }
│ export { QUERY_REGISTRY }

⋮...

src/main/repomap/tree-sitter/languages.ts
│ hash: cd8d0db669c5
│
│ export type VisibilityStrategy
│ export interface LanguageConfig
│ export const LANGUAGE_CONFIGS: LanguageConfig[]
│ export const ALL_EXTENSIONS
│ export const EXTENSION_TO_LANGUAGE
│ export const EXTRACTABLE_LANGUAGES

⋮...

src/main/repomap/tree-sitter/queries.ts
│ hash: 42ab9c10b0be
│
│ export interface LanguageQueries
│ export const QUERY_REGISTRY

⋮...

src/main/repomap/ts-extractor.ts
│ hash: 5f664a0dc471
│
│ imports: typescript, crypto, path
│ local: ../utils/paths.js, ./types.js
│
│ export const typescriptExtractor: Extractor

⋮...

src/main/repomap/types.ts
│ hash: 20d50dcb8cb7
│
│ export interface ExtractedIdentifier
│ export interface FileExtraction
│ export interface ImportEntry
│ export interface Extractor
│ export interface RepoMapMetadata
│ export interface RepoMap

⋮...

src/main/utils/paths.ts
│ hash: 2744a62f0d03
│
│ export function normalizePath(p: string): string
│ export function normalizePathForComparison(p: string): string

⋮...

src/main/writer/artifact-writer.ts
│ hash: 720327f16827
│
│ imports: fs
│ local: ./markdown-serializer.js
│
│ export function editTaskCheckbox(filePath: string, taskId: string, checked: boolean): void
│ export function editRequirementText(filePath: string, requirementId: string, newText: string): void

⋮...

src/main/writer/markdown-serializer.ts
│ hash: 9645525bf5ef
│
│ export function spliceAtPosition(original: string, startOffset: number, endOffset: number, replacement: string): string

⋮...

src/preload/index.ts
│ hash: d5e8c52a12a2
│
│ imports: electron
│
│ export type ElectronApi

⋮...

src/renderer/src/App.tsx
│ hash: 8ba6c0d9ee87
│
│ imports: react
│ local: ./components/board/BoardView.js, ./components/feature/FeatureDetail.js, ./components/common/EmptyState.js, ./hooks/usePhaseNotification.js, ./themes/apply-theme.js, ./themes/themes.js, ./types/index.js
│
│ export default function App()

⋮...

src/renderer/src/components/artifacts/PlanView.tsx
│ hash: c9f80a35872b
│
│ imports: react
│ local: ../elements/CodeBlock.js, ../elements/FileStructureView.js, ../ui/CollapsibleSection.js, ../ui/CodeTag.js, ../ui/MarkdownContent.js, ../../types/index.js
│
│ export default function PlanView({ elements, commentEnabled, getComment, onCommentChange }: PlanViewProps)

⋮...

src/renderer/src/components/artifacts/ResearchView.tsx
│ hash: 26e4155c808b
│
│ imports: react
│ local: ../ui/CollapsibleSection.js, ../ui/CodeTag.js, ../ui/MarkdownContent.js, ../../types/index.js
│
│ export default function ResearchView({ elements, commentEnabled, getComment, onCommentChange }: ResearchViewProps)

⋮...

src/renderer/src/components/artifacts/ReviewView.tsx
│ hash: 07d7641e717c
│
│ imports: react, framer-motion
│ local: ../../lib/utils.js, ../../theme.js, ../elements/CodeBlock.js, ../ui/CodeTag.js, ../ui/CollapsibleSection.js, ../ui/MarkdownContent.js, ../../types/index.js
│
│ export default function ReviewView({ findings, healSummary, commentEnabled, getComment, onCommentChange }: ReviewViewProps)

⋮...

src/renderer/src/components/artifacts/SpecView.tsx
│ hash: 9e14edb22cb8
│
│ imports: react
│ local: ../elements/UserStoryCard.js, ../elements/RequirementRow.js, ../ui/CodeTag.js, ../ui/CollapsibleSection.js, ../ui/MarkdownContent.js, ../../types/index.js
│
│ export default function SpecView({
  elements,
  commentEnabled,
  getComment,
  onCommentChange,
}: SpecViewProps)

⋮...

src/renderer/src/components/artifacts/SummaryView.tsx
│ hash: 8f0369ef3283
│
│ imports: react
│ local: ../ui/CollapsibleSection.js, ../ui/MarkdownContent.js, ../../types/index.js
│
│ export default function SummaryView({ elements, commentEnabled, getComment, onCommentChange }: SummaryViewProps)

⋮...

src/renderer/src/components/artifacts/TasksView.tsx
│ hash: 9418d7c6841c
│
│ imports: react
│ local: ../../lib/utils.js, ../ui/CollapsibleSection.js, ../elements/TaskRow.js, ../../types/index.js
│
│ export default function TasksView({ elements, onToggleTask }: TasksViewProps)

⋮...

src/renderer/src/components/board/BoardView.tsx
│ hash: a0d3f21d18e2
│
│ imports: react
│ local: ./FeatureCard.js, ../../types/index.js, ../../services/api.js
│
│ export default function BoardView({ onSelectProject, selectedProjectId, refreshKey }: BoardViewProps)

⋮...

src/renderer/src/components/board/FeatureCard.tsx
│ hash: a2ca702b8d13
│
│ imports: react, framer-motion
│ local: ../../theme.js, ../../lib/utils.js, ../../hooks/usePrevious.js, ../../types/index.js
│
│ export default function FeatureCard({ project, selected, onClick }: FeatureCardProps)

⋮...

src/renderer/src/components/board/RefactorBacklogIcon.tsx
│ hash: b71a64266e07
│
│ imports: react
│ local: ../../lib/utils.js
│
│ export default function RefactorBacklogIcon({ active, onClick }: RefactorBacklogIconProps)

⋮...

src/renderer/src/components/common/EmptyState.tsx
│ hash: 807532608033
│
│ imports: react
│
│ export default function EmptyState({ branchName, message }: EmptyStateProps)

⋮...

src/renderer/src/components/editing/TextEditor.tsx
│ hash: aabcd28610b4
│
│ imports: react
│
│ export default function TextEditor({ value, onSave }: TextEditorProps)

⋮...

src/renderer/src/components/elements/CodeBlock.tsx
│ hash: ac8e9da3f263
│
│ imports: react, react-dom, highlight.js, mermaid
│
│ export default function CodeBlock({ code, language, label }: CodeBlockProps)

⋮...

src/renderer/src/components/elements/DecisionSection.tsx
│ hash: 67fed3a9f7ed
│
│ imports: react, framer-motion
│ local: ../../types/index.js, ../ui/SectionLabel.js, ../ui/MarkdownContent.js
│
│ export default function DecisionSection({ content }: { content: DecisionContent })

⋮...

src/renderer/src/components/elements/FileStructureView.tsx
│ hash: e5ca6ff8bc6e
│
│ imports: react, lucide-react
│ local: ../../lib/utils.js, ../../theme.js, ../../types/index.js
│
│ export default function FileStructureView({ sections }: FileStructureViewProps): JSX.Element

⋮...

src/renderer/src/components/elements/RequirementRow.tsx
│ hash: e0910cb86fba
│
│ imports: react
│ local: ../../types/index.js, ../ui/CodeTag.js, ../ui/MarkdownContent.js
│
│ export default function RequirementRow({ content }: { content: RequirementContent })

⋮...

src/renderer/src/components/elements/TaskRow.tsx
│ hash: 366f1493233d
│
│ imports: react
│ local: ../../lib/utils.js, ../../types/index.js, ../ui/CodeTag.js, ../ui/MarkdownContent.js
│
│ export default function TaskRow({ content, onToggle }: TaskRowProps)

⋮...

src/renderer/src/components/elements/UserStoryCard.tsx
│ hash: 36ff0d2e842d
│
│ imports: react, framer-motion
│ local: ../../lib/utils.js, ../../theme.js, ../ui/Tooltip.js, ../ui/SectionLabel.js, ../ui/MarkdownContent.js, ../../types/index.js
│
│ export default function UserStoryCard({ content }: { content: UserStoryContent })

⋮...

src/renderer/src/components/feature/ArtifactTabs.tsx
│ hash: f33516f8ef36
│
│ imports: react, framer-motion
│ local: ../../lib/utils.js, ../../theme.js, ../../types/index.js
│
│ export default function ArtifactTabs({ available, active, onSelect, heroTab, phase }: ArtifactTabsProps)

⋮...

src/renderer/src/components/feature/FeatureDetail.tsx
│ hash: 5fc8840ecb92
│
│ imports: react, lucide-react, framer-motion
│ local: ../../theme.js, ../../lib/utils.js, ./ArtifactTabs.js, ../artifacts/SpecView.js, ../artifacts/PlanView.js, ../artifacts/TasksView.js, ../artifacts/ResearchView.js, ../artifacts/ReviewView.js, ../artifacts/SummaryView.js, ../refactor/RefactorBacklogView.js, ../common/EmptyState.js, ../../hooks/useFeatureData.js, ../../hooks/useCommentStore.js, ../../hooks/usePhaseNotification.js, ../../utils/format-comments.js, ../../context/GlossaryContext.js, ../../types/index.js
│
│ export default function FeatureDetail({ project }: { project: Project })

⋮...

src/renderer/src/components/refactor/RefactorBacklogView.tsx
│ hash: 84b76d40993a
│
│ imports: react
│ local: ../../lib/utils.js, ../../types/index.js, ../../services/api.js, ../ui/CodeTag.js, ../ui/MarkdownContent.js
│
│ export default function RefactorBacklogView({ projectId }: RefactorBacklogViewProps)

⋮...

src/renderer/src/components/ui/CodeTag.tsx
│ hash: 5deca3c71d3f
│
│ imports: react
│ local: ../../lib/utils.js
│
│ export default function CodeTag({ color = 'accent', size = 'md', className, children }: CodeTagProps)

⋮...

src/renderer/src/components/ui/CollapsibleSection.tsx
│ hash: 22f6d5d80111
│
│ imports: react, lucide-react
│ local: ../../lib/utils.js
│
│ export default function CollapsibleSection({
  id,
  heading,
  level,
  number,
  defaultOpen = true,
  children,
  trailing,
  commentEnabled,
  commentText,
  onCommentChange,
}: CollapsibleSectionProps)

⋮...

src/renderer/src/components/ui/MarkdownContent.tsx
│ hash: 79a51a7d59be
│
│ imports: react, react-markdown, remark-gfm
│ local: ../../lib/utils.js, ../../lib/inline-code-color.js, ../../context/GlossaryContext.js, ../elements/CodeBlock.js, ./Tooltip.js
│
│ export default function MarkdownContent({ content, inline, className }: MarkdownContentProps)

⋮...

src/renderer/src/components/ui/SectionLabel.tsx
│ hash: 978bf7fc23c7
│
│ imports: react
│ local: ../../lib/utils.js
│
│ export default function SectionLabel({
  color = 'text-board-text-muted',
  sub = false,
  className,
  children,
}: SectionLabelProps)

⋮...

src/renderer/src/components/ui/Tooltip.tsx
│ hash: 109dc152d743
│
│ imports: react, @radix-ui/react-tooltip
│
│ export default function Tooltip({ content, children, side = 'top', delayDuration = 200 }: TooltipProps)

⋮...

src/renderer/src/context/GlossaryContext.ts
│ hash: 85b225a14dad
│
│ imports: react
│
│ export const useGlossary
│ export const GlossaryProvider

⋮...

src/renderer/src/hooks/useCommentStore.ts
│ hash: 257571419e98
│
│ imports: react
│ local: ../types/index.js
│
│ export interface CommentStore
│ export function useCommentStore(): CommentStore

⋮...

src/renderer/src/hooks/useFeatureData.ts
│ hash: 53743a5a8c03
│
│ imports: react
│ local: ../types/index.js, ../services/api.js
│
│ export function useFeatureData(projectId: string | null)
│ export function useArtifactData(projectId: string | null, artifactType: ArtifactType | null)

⋮...

src/renderer/src/hooks/usePhaseNotification.ts
│ hash: 70c304924aac
│
│ imports: react
│ local: ../types/index.js
│
│ export interface PhaseNotificationState
│ export function usePhaseNotification(): PhaseNotificationState

⋮...

src/renderer/src/hooks/usePrevious.ts
│ hash: f1bf6f732605
│
│ imports: react
│
│ export function usePrevious(value: T): T | undefined

⋮...

src/renderer/src/lib/inline-code-color.ts
│ hash: 7d0e01a41fdc
│
│ export function getInlineCodeColor(text: string): string

⋮...

src/renderer/src/lib/utils.ts
│ hash: 4b705c7d7e5c
│
│ imports: clsx, tailwind-merge
│
│ export function cn(...inputs: ClassValue[])

⋮...

src/renderer/src/main.tsx
│ hash: c47190ff9330
│
│ imports: react, react-dom/client
│ local: ./index.css, ./App.js

⋮...

src/renderer/src/services/api.ts
│ hash: 6cb93522574d
│
│ local: ../types/index.js
│
│ export async function getProjects()
│ export async function addProject(path: string, name?: string)
│ export async function deleteProject(id: string)
│ export async function showFolderPicker()
│ export async function getFeature(projectId: string)
│ export async function getArtifact(projectId: string, type: ArtifactType)
│ export async function editField(projectId: string, artifactType: ArtifactType, elementId: string, field: string, value: unknown)
│ export async function getSettings()
│ export async function saveSettings(partial: Record<string, unknown>)
│ export async function getGlossary(projectId: string)
│ export async function getRefactorBacklog(projectId: string)

⋮...

src/renderer/src/theme.ts
│ hash: dedcc95b8c11
│
│ export const phaseClasses
│ export function getPhaseClasses(phase: string)
│ export const severityClasses
│ export const statusClasses
│ export interface PriorityMeta
│ export const priorityMeta: Record<string, PriorityMeta>
│ export function getPriorityMeta(priority: string): PriorityMeta
│ export const operationClasses
│ export function getOperationClasses(operation: string)
│ export const priorityClasses: Record<string, string>
│ export function getPriorityClasses(priority: string): string

⋮...

src/renderer/src/themes/apply-theme.ts
│ hash: 02531e850ff9
│
│ local: ./themes.js, ./themes.js
│
│ export function applyTheme(themeId: string): string

⋮...

src/renderer/src/themes/themes.ts
│ hash: 59bf31da7c58
│
│ export interface ThemeDefinition
│ export const themes: readonly ThemeDefinition[]
│ export const darkThemes
│ export const lightThemes
│ export function getThemeById(id: string): ThemeDefinition | undefined
│ export { DEFAULT_THEME_ID }

⋮...

src/renderer/src/types/index.ts
│ hash: aaa8fe5da9bd
│
│ export type Phase
│ export type ArtifactType
│ export type FindingSeverity
│ export type FindingStatus
│ export interface CodeSnippet
│ export interface ReviewFinding
│ export interface HealFindingStatus
│ export interface HealSummary
│ export interface RefactorEntry
│ export type ElementType
│ export type FieldType
│ export interface Project
│ export interface Feature
│ export interface ArtifactSummary
│ export interface Artifact
│ export interface Element
│ export interface EditableField
│ export type ElementContent
│ export interface UserStoryContent
│ export interface GWTScenario
│ export interface RequirementContent
│ export interface SuccessCriterionContent
│ export interface TaskContent
│ export interface DecisionContent
│ export interface SectionContent
│ export type OperationType
│ export interface FileStructureEntry
│ export interface FileStructureSection
│ export interface FileStructureContent
│ export type WSMessage
│ export interface SpecsChangedMessage
│ export interface BranchChangedMessage
│ export interface ProjectErrorMessage

⋮...

src/renderer/src/utils/format-comments.ts
│ hash: 768366db7bc3
│
│ local: ../types/index.js
│
│ export function formatComments(comments: Map<ArtifactType, Map<string, string>>): string

⋮...

tests/fixtures/repomap/Sample.java
│ hash: 1a3a289eeb44
│
│ imports: java.util.List, java.util.Optional, com.example.db.DatabaseService
│
│ public class UserController
│   public UserController(DatabaseService db) {
│   public List<User> getUsers()
│   private void validateInput(String input)
│   protected void logAccess()
│   ⋮...
│ interface UserRepository
│ enum UserRole

⋮...

tests/fixtures/repomap/sample-react.tsx
│ hash: a9bc15d1d427
│
│ imports: react
│ local: ../hooks/useTheme.js
│
│ export interface ButtonProps
│ export function Button({ label, onClick, variant = 'primary' }: ButtonProps): React.ReactElement
│ export default function App(): React.ReactElement

⋮...

tests/fixtures/repomap/sample.go
│ hash: 7a800ef070b0
│
│ imports: fmt, net/http
│
│ type UserService struct {
│ func (s *UserService) GetUser(id int) (*User, error)
│ func createHandler() http.Handler
│ func StartServer(port int) error
│ type internalConfig struct {

⋮...

tests/fixtures/repomap/sample.py
│ hash: 866479ddcfb7
│
│ imports: os, pathlib, typing
│
│ class UserService:
│   def __init__(self, db_url: str):
│   def get_user(self, user_id: int) -> dict:
│   def list_users(self) -> list:
│   ⋮...
│ def create_app(config: dict) -> object:
│ def _internal_helper():

⋮...

tests/fixtures/repomap/sample.rs
│ hash: 6f10a961c028
│
│ imports: std::collections::HashMap, crate::db::Database
│
│ pub struct UserService
│ impl UserService
│ pub fn new(db: Database) -> Self
│ pub fn get_user(&self, id: u64) -> Option<User>
│ fn internal_validate(&self) -> bool
│ pub trait Repository
│ pub enum UserRole {
│ fn private_helper() -> String
│ pub fn create_service(db: Database) -> UserService

⋮...

tests/fixtures/repomap/sample.ts
│ hash: 24cc959ae39b
│
│ imports: path
│ local: ../utils/paths.js, ./types.js
│
│ export interface WatcherEvents
│ export type Phase
│ export enum Status
│ export const DEFAULT_TIMEOUT
│ export class ProjectWatcher
│   start(): void
│   async stop(): Promise<void>
│   static create(path: string): ProjectWatcher
│   ⋮...
│ export function watchProject(projectId: string, projectPath: string): void
│ export async function scanFiles(dir: string): Promise<string[]>

⋮...

tests/integration/artifacts.test.ts
│ hash: f083a83750ef
│
│ imports: vitest, fs, path, os
│ local: ../../src/main/config/config-manager.js, ../../src/main/parser/spec-parser.js, ../../src/main/parser/plan-parser.js, ../../src/main/parser/tasks-parser.js, ../../src/main/parser/research-parser.js, ../../src/main/projects/project-scanner.js

⋮...

tests/unit/config/config-manager.test.ts
│ hash: 2b3e5905a21b
│
│ imports: vitest, fs, path, os
│ local: ../../../src/main/config/config-manager.js

⋮...

tests/unit/format-comments.test.ts
│ hash: 8abe333155d2
│
│ imports: vitest
│ local: ../../src/renderer/src/utils/format-comments.js, ../../src/renderer/src/types/index.js

⋮...

tests/unit/os-notifier.test.ts
│ hash: 9bad319fb826
│
│ imports: vitest, electron
│ local: ../../src/main/notifications/os-notifier.js

⋮...

tests/unit/parser/markdown-parser.test.ts
│ hash: fea1bac92304
│
│ imports: vitest, fs, path
│ local: ../../../src/main/parser/markdown-parser.js

⋮...

tests/unit/parser/plan-parser.test.ts
│ hash: 22c701d03789
│
│ imports: vitest, fs, path
│ local: ../../../src/main/parser/plan-parser.js

⋮...

tests/unit/parser/refactor-backlog-parser.test.ts
│ hash: ac7eb8371c7f
│
│ imports: vitest, fs, path
│ local: ../../../src/main/parser/refactor-backlog-parser.js

⋮...

tests/unit/parser/research-parser.test.ts
│ hash: af47d57955a0
│
│ imports: vitest, fs, path
│ local: ../../../src/main/parser/research-parser.js

⋮...

tests/unit/parser/review-parser.test.ts
│ hash: 28908fab93ad
│
│ imports: vitest, fs, path
│ local: ../../../src/main/parser/review-parser.js

⋮...

tests/unit/parser/spec-parser.test.ts
│ hash: d1ba5fff7922
│
│ imports: vitest, fs, path
│ local: ../../../src/main/parser/spec-parser.js

⋮...

tests/unit/parser/summary-parser.test.ts
│ hash: 460c910d0519
│
│ imports: vitest
│ local: ../../../src/main/parser/summary-parser.js

⋮...

tests/unit/parser/tasks-parser.test.ts
│ hash: 8f6a57417553
│
│ imports: vitest, fs, path
│ local: ../../../src/main/parser/tasks-parser.js

⋮...

tests/unit/paths.test.ts
│ hash: 96e8f1944a88
│
│ imports: vitest
│ local: ../../src/main/utils/paths.js

⋮...

tests/unit/phase/phase-detector.test.ts
│ hash: 775adb9af7d6
│
│ imports: vitest
│ local: ../../../src/main/phase/phase-detector.js

⋮...

tests/unit/projects/project-scanner.test.ts
│ hash: fd1b3dc2791d
│
│ imports: vitest, fs, path, os
│ local: ../../../src/main/projects/project-scanner.js

⋮...

tests/unit/repomap/format.test.ts
│ hash: eef9bff8fa17
│
│ imports: vitest
│ local: ../../../src/main/repomap/format.js, ../../../src/main/repomap/types.js

⋮...

tests/unit/repomap/generator.test.ts
│ hash: d9f6a666208b
│
│ imports: vitest, fs, path, os
│ local: ../../../src/main/repomap/generator.js, ../../../src/main/repomap/ts-extractor.js

⋮...

tests/unit/repomap/tree-sitter-extractor.test.ts
│ hash: b75c571db6dd
│
│ imports: vitest, fs, path
│ local: ../../../src/main/repomap/tree-sitter/extractor.js, ../../../src/main/repomap/tree-sitter/languages.js, ../../../src/main/repomap/tree-sitter/queries.js, ../../../src/main/repomap/types.js

⋮...

tests/unit/repomap/ts-extractor.test.ts
│ hash: ae3233958083
│
│ imports: vitest, fs, path
│ local: ../../../src/main/repomap/ts-extractor.js

⋮...

tests/unit/sound-player.test.ts
│ hash: 2e1d3d27f02c
│
│ imports: vitest, child_process
│ local: ../../src/main/notifications/sound-player.js

⋮...

tests/unit/themes.test.ts
│ hash: dd9dedf7a6b0
│
│ imports: vitest
│ local: ../../src/renderer/src/themes/themes.js

⋮...

tests/unit/writer/artifact-writer.test.ts
│ hash: d31578c999d7
│
│ imports: vitest, fs, path, os
│ local: ../../../src/main/writer/artifact-writer.js

⋮...

tests/unit/writer/markdown-serializer.test.ts
│ hash: 37a60fabbcd1
│
│ imports: vitest
│ local: ../../../src/main/writer/markdown-serializer.js

⋮...

vitest.config.ts
│ hash: aa9748653e10
│
│ imports: vitest/config
│
│ export default default

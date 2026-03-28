# Repo Map

Generated: 2026-03-28T13:43:00.545Z
Updated: 2026-03-28T13:43:00.545Z
Files: 85
Token estimate: ~6533

---

electron.vite.config.ts
│ hash: a6f7ae027cfc
│
│ imports: electron-vite, @vitejs/plugin-react, @tailwindcss/vite
│
│ export default default

⋮...

src/main/config/config-manager.ts
│ hash: 323e50d86f6e
│
│ imports: fs, path, os, uuid
│ local: ../utils/paths.js
│
│ export interface ProjectEntry
│ export type SoundVolume
│ export interface AppSettings
│ export const DEFAULT_SETTINGS: AppSettings
│ export interface WalkTheSpecConfig
│ export async function initConfigCache(configPath: string = DEFAULT_CONFIG_PATH): Promise<void>
│ export function resetConfigCache(): void
│ export function getDefaultConfigPath(): string
│ export function loadConfig(): WalkTheSpecConfig
│ export async function saveConfig(config: WalkTheSpecConfig): Promise<void>
│ export function addProject(config: WalkTheSpecConfig, projectPath: string, name?: string): ProjectEntry
│ export function removeProject(config: WalkTheSpecConfig, id: string): void
│ export function getProjects(config: WalkTheSpecConfig): ProjectEntry[]

⋮...

src/main/index.ts
│ hash: 93c84b2163ef
│
│ imports: electron, path, fs
│ local: ./utils/logger.js, ./ipc/handlers.js, ./config/config-manager.js, ./projects/file-watcher.js, ./notifications/os-notifier.js, ./notifications/sound-player.js, ./notifications/notify-server.js, ./projects/project-scanner.js, ./phase/phase-detector.js, ./utils/paths.js, ./updater/auto-updater.js
│
│ export function startWatchingProject(projectId: string, projectPath: string)
│ export function stopWatchingProject(projectId: string)

⋮...

src/main/integration/integration-planner.ts
│ hash: cfa6df1cb9e7
│
│ imports: fs/promises, path
│ local: ./types.js, ../utils/paths.js
│
│ export async function generateIntegrationPlan(targetPath: string, scaffoldDir: string): Promise<IntegrationPlan>

⋮...

src/main/integration/scaffold-version.ts
│ hash: 5f30db1cf137
│
│ imports: fs/promises, path
│
│ export function getScaffoldDir(base?: string): string
│ export async function readScaffoldVersion(projectPath: string): Promise<string | null>
│ export async function writeScaffoldVersion(projectPath: string, version: string): Promise<void>
│ export async function getBundledScaffoldVersion(scaffoldDir?: string): Promise<string>
│ export async function isScaffoldOutdated(projectPath: string, appVersion: string): Promise<boolean>

⋮...

src/main/integration/scaffold-writer.ts
│ hash: a4742e7adee2
│
│ imports: fs/promises, path
│ local: ../utils/paths.js
│
│ export async function executeIntegration(targetPath: string, scaffoldDir: string): Promise<void>

⋮...

src/main/integration/types.ts
│ hash: 0a5f30b660c3
│
│ export type FileAction
│ export type FileCategory
│ export interface IntegrationFileEntry
│ export interface IntegrationPlan
│ export type IntegrationState

⋮...

src/main/ipc/handlers.ts
│ hash: b32af77e4f65
│
│ imports: electron, fs, path
│ local: ../config/config-manager.js, ../config/config-manager.js, ../projects/project-scanner.js, ../phase/phase-detector.js, ../parser/spec-parser.js, ../parser/plan-parser.js, ../parser/tasks-parser.js, ../parser/research-parser.js, ../parser/review-parser.js, ../parser/summary-parser.js, ../parser/refactor-backlog-parser.js, ../writer/artifact-writer.js, ../integration/integration-planner.js, ../integration/scaffold-writer.js, ../integration/scaffold-version.js, ../integration/types.js
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
│ hash: 34d7b0572f45
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
│ hash: f3a45bb2f057
│
│ imports: chokidar, path, fs
│ local: ../utils/paths.js
│
│ export interface WatcherEvents
│ export function watchProject(projectId: string, projectPath: string, events: WatcherEvents): void
│ export function unwatchProject(projectId: string): void
│ export function unwatchAll(): void

⋮...

src/main/projects/project-scanner.ts
│ hash: afb38a8b2aa8
│
│ imports: fs, path
│
│ export interface ScanResult
│ export async function scanProject(projectPath: string): Promise<ScanResult>

⋮...

src/main/repomap/extractors.ts
│ hash: 710a86e43fcb
│
│ local: ./types.js
│
│ export async function getAllExtractors(extensionFilter?: Set<string>): Promise<Extractor[]>

⋮...

src/main/repomap/format.ts
│ hash: b3e0db90f810
│
│ local: ./types.js
│
│ export function formatRepoMap(map: RepoMap): string
│ export function buildRepoMap(files: FileExtraction[], now?: string, failures?: ExtractionFailure[]): RepoMap

⋮...

src/main/repomap/generator.ts
│ hash: 525a4cd061b7
│
│ imports: fs, path, crypto
│ local: ../utils/paths.js, ./format.js, ./types.js
│
│ export function getMapPath(repoRoot: string): string
│ export async function discoverProjectExtensions(repoRoot: string): Promise<Set<string>>
│ export async function generateRepoMap(repoRoot: string, extractors: Extractor[], options?: { incremental?: boolean; signal?: AbortSignal }): Promise<RepoMap>
│ export async function updateRepoMapFiles(repoRoot: string, changedFiles: string[], extractors: Extractor[]): Promise<RepoMap>
│ export function isMapValid(repoRoot: string): boolean

⋮...

src/main/repomap/index.ts
│ hash: 022887fcd1e6
│
│ export { getTypescriptExtractor }
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
│ hash: 498583193f63
│
│ imports: web-tree-sitter, crypto, path
│ local: ../../utils/paths.js, ../types.js, ./languages.js, ./queries.js
│
│ export async function initTreeSitter(): Promise<void>
│ export async function loadLanguage(config: LanguageConfig): Promise<Language>
│ export function createTreeSitterExtractor(config: LanguageConfig, language: Language, queries: LanguageQueries): Extractor

⋮...

src/main/repomap/tree-sitter/index.ts
│ hash: e008fe7e1ed9
│
│ local: ../types.js
│
│ export async function getTreeSitterExtractors(extensionFilter?: Set<string>): Promise<Extractor[]>
│ export { ALL_EXTENSIONS }
│ export { EXTENSION_TO_LANGUAGE }
│ export { EXTRACTABLE_LANGUAGES }
│ export { LANGUAGE_CONFIGS }
│ export { QUERY_REGISTRY }

⋮...

src/main/repomap/tree-sitter/languages.ts
│ hash: 89efb73390eb
│
│ export type VisibilityStrategy
│ export interface LanguageConfig
│ export const LANGUAGE_CONFIGS: LanguageConfig[]
│ export const ALL_EXTENSIONS
│ export const EXTENSION_TO_LANGUAGE
│ export const EXTRACTABLE_LANGUAGES

⋮...

src/main/repomap/tree-sitter/queries.ts
│ hash: 3de36c4ad523
│
│ export interface LanguageQueries
│ export const QUERY_REGISTRY

⋮...

src/main/repomap/ts-extractor.ts
│ hash: b9b53fc848e8
│
│ imports: crypto, path
│ local: ../utils/paths.js, ./types.js
│
│ export async function getTypescriptExtractor(): Promise<Extractor>

⋮...

src/main/repomap/types.ts
│ hash: 154b1dd1b605
│
│ export interface ExtractedIdentifier
│ export interface FileExtraction
│ export interface ImportEntry
│ export interface Extractor
│ export interface RepoMapMetadata
│ export interface ExtractionFailure
│ export interface RepoMap

⋮...

src/main/updater/auto-updater.ts
│ hash: aa8e5becb679
│
│ imports: electron, electron-updater
│
│ export function initAutoUpdater(mainWindow: BrowserWindow): void
│ export function checkForUpdatesManual(): void

⋮...

src/main/utils/logger.ts
│ hash: 448064d59d05
│
│ imports: electron-log
│
│ export default log

⋮...

src/main/utils/paths.ts
│ hash: 2744a62f0d03
│
│ export function normalizePath(p: string): string
│ export function normalizePathForComparison(p: string): string

⋮...

src/main/writer/artifact-writer.ts
│ hash: 0a214286ca84
│
│ imports: fs
│ local: ./markdown-serializer.js
│
│ export async function editTaskCheckbox(filePath: string, taskId: string, checked: boolean): Promise<void>
│ export async function editRequirementText(filePath: string, requirementId: string, newText: string): Promise<void>

⋮...

src/main/writer/markdown-serializer.ts
│ hash: 9645525bf5ef
│
│ export function spliceAtPosition(original: string, startOffset: number, endOffset: number, replacement: string): string

⋮...

src/preload/index.ts
│ hash: 9fb4a08d6c99
│
│ imports: electron
│
│ export type ElectronApi

⋮...

src/renderer/src/App.tsx
│ hash: 97fcfc8aa8d4
│
│ imports: react
│ local: ./components/board/BoardView.js, ./components/feature/FeatureDetail.js, ./components/common/EmptyState.js, ./components/common/UpdateDialog.js, ./hooks/usePhaseNotification.js, ./hooks/useAutoUpdate.js, ./themes/apply-theme.js, ./themes/themes.js, ./themes/fonts.js, ./types/index.js
│
│ export default function App()

⋮...

src/renderer/src/components/artifacts/PlanView.tsx
│ hash: dacb2e8f94d8
│
│ imports: react
│ local: ../elements/CodeBlock.js, ../elements/FileStructureView.js, ../ui/CollapsibleSection.js, ../ui/CodeTag.js, ../ui/MarkdownContent.js, ../../types/index.js
│
│ export default function PlanView({ elements, commentEnabled, getComment, onCommentChange }: PlanViewProps)

⋮...

src/renderer/src/components/artifacts/ResearchView.tsx
│ hash: b1359d4f313b
│
│ imports: react
│ local: ../ui/CollapsibleSection.js, ../ui/CodeTag.js, ../ui/MarkdownContent.js, ../../types/index.js
│
│ export default function ResearchView({ elements, commentEnabled, getComment, onCommentChange }: ResearchViewProps)

⋮...

src/renderer/src/components/artifacts/ReviewView.tsx
│ hash: 7c48254fdbe0
│
│ imports: react, framer-motion
│ local: ../../lib/utils.js, ../../theme.js, ../elements/CodeBlock.js, ../ui/CodeTag.js, ../ui/CollapsibleSection.js, ../ui/MarkdownContent.js, ../../types/index.js
│
│ export default function ReviewView({ findings, healSummary, commentEnabled, getComment, onCommentChange }: ReviewViewProps)

⋮...

src/renderer/src/components/artifacts/SpecView.tsx
│ hash: e5ac40bc9652
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
│ hash: 9f83840dae0f
│
│ imports: react
│ local: ../ui/CollapsibleSection.js, ../ui/MarkdownContent.js, ../../types/index.js
│
│ export default function SummaryView({ elements, commentEnabled, getComment, onCommentChange }: SummaryViewProps)

⋮...

src/renderer/src/components/artifacts/TasksView.tsx
│ hash: 7bc6650a1362
│
│ imports: react
│ local: ../../lib/utils.js, ../ui/CollapsibleSection.js, ../elements/TaskRow.js, ../../types/index.js
│
│ export default function TasksView({ elements, onToggleTask }: TasksViewProps)

⋮...

src/renderer/src/components/board/BoardView.tsx
│ hash: 03eab01936b4
│
│ imports: react
│ local: ./FeatureCard.js, ../integration/IntegrationDialog.js, ../../types/index.js, ../../services/api.js
│
│ export default function BoardView({ onSelectProject, selectedProjectId, refreshKey }: BoardViewProps)

⋮...

src/renderer/src/components/board/FeatureCard.tsx
│ hash: abf1f3d149a9
│
│ imports: react, framer-motion
│ local: ../../theme.js, ../../lib/utils.js, ../../hooks/usePrevious.js, ../../types/index.js
│
│ export default function FeatureCard({ project, selected, onClick, onContextAction, loading }: FeatureCardProps)

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

src/renderer/src/components/common/UpdateDialog.tsx
│ hash: 777103e952bf
│
│ imports: react, framer-motion
│ local: ../../lib/utils.js, ../../hooks/useAutoUpdate.js
│
│ export default function UpdateDialog({ update }: UpdateDialogProps)

⋮...

src/renderer/src/components/editing/TextEditor.tsx
│ hash: aabcd28610b4
│
│ imports: react
│
│ export default function TextEditor({ value, onSave }: TextEditorProps)

⋮...

src/renderer/src/components/elements/CodeBlock.tsx
│ hash: 86c5f206dfb9
│
│ imports: react, highlight.js
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
│ hash: 176195c3c77e
│
│ imports: react, lucide-react
│ local: ../../lib/utils.js, ../../theme.js, ../../types/index.js
│
│ export default function FileStructureView({ sections }: FileStructureViewProps): JSX.Element

⋮...

src/renderer/src/components/elements/MermaidBlock.tsx
│ hash: 9c3638881498
│
│ imports: react, react-dom, mermaid
│
│ export default function MermaidBlock({ code }: { code: string })

⋮...

src/renderer/src/components/elements/RequirementRow.tsx
│ hash: 202c909d4b9e
│
│ imports: react
│ local: ../../types/index.js, ../ui/CodeTag.js, ../ui/MarkdownContent.js
│
│ export default function RequirementRow({ content }: { content: RequirementContent })

⋮...

src/renderer/src/components/elements/TaskRow.tsx
│ hash: c3589b0f90ec
│
│ imports: react
│ local: ../../lib/utils.js, ../../types/index.js, ../ui/CodeTag.js, ../ui/MarkdownContent.js
│
│ export default function TaskRow({ content, onToggle }: TaskRowProps)

⋮...

src/renderer/src/components/elements/UserStoryCard.tsx
│ hash: 93822bf98d4f
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
│ hash: dc33c7b6f872
│
│ imports: react, lucide-react, framer-motion
│ local: ../../theme.js, ../../lib/utils.js, ./ArtifactTabs.js, ../artifacts/SpecView.js, ../artifacts/PlanView.js, ../artifacts/TasksView.js, ../artifacts/ResearchView.js, ../artifacts/ReviewView.js, ../artifacts/SummaryView.js, ../refactor/RefactorBacklogView.js, ../common/EmptyState.js, ../integration/IntegrationBanner.js, ../../hooks/useFeatureData.js, ../../hooks/useCommentStore.js, ../../hooks/usePhaseNotification.js, ../../utils/format-comments.js, ../../context/GlossaryContext.js, ../../types/index.js
│
│ export default function FeatureDetail({ project }: { project: Project })

⋮...

src/renderer/src/components/integration/IntegrationBanner.tsx
│ hash: 8b270f425977
│
│ imports: react
│ local: ../../lib/utils.js, ../../types/index.js
│
│ export default function IntegrationBanner({ integrationState }: IntegrationBannerProps)

⋮...

src/renderer/src/components/integration/IntegrationDialog.tsx
│ hash: cf2ba73ba363
│
│ imports: react, framer-motion
│ local: ../../lib/utils.js, ../../types/index.js
│
│ export default function IntegrationDialog({ plan, onConfirm, onCancel, executing }: IntegrationDialogProps)

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
│ hash: d6c5b6a8f812
│
│ imports: react
│ local: ../../lib/utils.js
│
│ export default function CodeTag({ color = 'accent', size = 'md', className, children }: CodeTagProps)

⋮...

src/renderer/src/components/ui/CollapsibleSection.tsx
│ hash: 69e131ae604d
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
│ hash: e6836dabb9db
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

src/renderer/src/hooks/useAutoUpdate.ts
│ hash: 59a71724c57f
│
│ imports: react
│
│ export interface AutoUpdateHandle
│ export function useAutoUpdate(): AutoUpdateHandle

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
│ hash: dc09b8ed146a
│
│ local: ../types/index.js
│
│ export async function getProjects()
│ export async function getProjectState(projectId: string)
│ export async function addProject(path: string, name?: string)
│ export async function deleteProject(id: string)
│ export async function planIntegration(projectPath: string)
│ export async function executeIntegration(projectPath: string)
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
│ hash: c052982f0ac9
│
│ local: ./themes.js, ./themes.js
│
│ export function applyTheme(themeId: string): string

⋮...

src/renderer/src/themes/fonts.ts
│ hash: 79fd2121e587
│
│ export interface ReadingFont
│ export const DEFAULT_READING_FONT_ID
│ export const readingFonts: readonly ReadingFont[]
│ export function getReadingFontById(id: string): ReadingFont | undefined

⋮...

src/renderer/src/themes/themes.ts
│ hash: b46dad771722
│
│ export interface ThemeDefinition
│ export const themes: readonly ThemeDefinition[]
│ export const darkThemes
│ export const lightThemes
│ export function getThemeById(id: string): ThemeDefinition | undefined
│ export { DEFAULT_THEME_ID }

⋮...

src/renderer/src/types/index.ts
│ hash: 74587c0bcc5f
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
│ export type IntegrationState
│ export type FileAction
│ export type FileCategory
│ export interface IntegrationFileEntry
│ export interface IntegrationPlan
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

vitest.config.ts
│ hash: aa9748653e10
│
│ imports: vitest/config
│
│ export default default

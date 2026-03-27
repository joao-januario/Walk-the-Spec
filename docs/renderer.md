# Renderer Area Guide

## Purpose

The renderer is a React 19 SPA running in Electron's renderer process. It displays a project sidebar (always visible) and a main content area showing parsed speckit artifacts for the selected project. All data comes from the main process via IPC — the renderer never touches the filesystem.

## Component Hierarchy

```
App
├── BoardView (sidebar, always visible)
│   ├── FeatureCard[] (one per project, right-click context menu)
│   └── Add Project button
├── UpdateDialog (modal, shown when auto-update available)
│
└── Main content area
    ├── FeatureDetail (selected project)
    │   ├── Header (project title, phase badge)
    │   ├── Toolbar (refactor backlog toggle, copy comments)
    │   ├── ArtifactTabs (tab navigation)
    │   │
    │   └── Active artifact view (one of):
    │       ├── SpecView → UserStoryCard[], RequirementRow[], SuccessCriterion[]
    │       ├── PlanView → FileStructureView (if file-structure type), DecisionSection[], CodeBlock[], MarkdownContent
    │       ├── TasksView → TaskRow[] grouped by Phase
    │       ├── ResearchView → DecisionSection[]
    │       ├── SummaryView → MarkdownContent sections
    │       ├── ReviewView → ReviewFinding cards, HealSummary
    │       └── RefactorBacklogView → table rows
    │
    └── EmptyState (when no project selected)
```

## Key Components

**FileStructureView** (`src/renderer/src/components/elements/FileStructureView.tsx`): Renders structured file lists with color-coded operation types (added/modified/removed). Receives `FileStructureSection[]` from the plan parser via PlanView. Uses collapsible section groups with file count badges, and each file entry displays a colored left border, file icon, directory-dimmed filename, operation label, and optional comment. Operation colors are mapped via `operationClasses` in `theme.ts`.

## State Management

No external state library. State lives in three places:

### 1. App-level state (`App.tsx`)
- `selectedProject: Project | null` — currently selected project in sidebar
- `refreshKey: number` — incremented on specs-changed/branch-changed events, forces FeatureDetail to re-mount
- `notification: { message, type } | null` — temporary toast (3s timeout)

### 2. FeatureDetail state
- `activeTab: ArtifactType` — currently selected artifact tab
- `showBacklog: boolean` — toggle between artifact view and refactor backlog
- `glossary: Record<string, string>` — term definitions fetched once per project

### 3. Hooks (per-component instances)
- **useFeatureData**: Returns `{ feature, loading, error, refetch }`. Fetches via `api.getFeature()`.
- **useArtifactData** (inline in FeatureDetail): Returns `{ artifact, loading, error }`. Fetches via `api.getArtifact()`.
- **usePhaseNotification**: Returns `{ commentableTabs, lastCommand }`. Persists to `sessionStorage`.
- **useCommentStore**: Returns `{ getComment, setComment, hasAnyComments }`. In-memory only.
- **useAutoUpdate**: Returns `{ state, install, dismiss, restart }`. Discriminated union state machine (idle/available/downloading/ready) driven by IPC events from electron-updater.

## Tab System

Constants in `FeatureDetail.tsx`:

```typescript
TAB_ORDER = ['spec', 'plan', 'research', 'tasks', 'summary', 'deep-dives', 'review']
TAB_LABELS = { spec: 'Spec', plan: 'Plan', research: 'Research', ... }
PHASE_HERO = { specify: 'spec', plan: 'plan', implement: 'tasks', summary: 'summary', review: 'review' }
```

- Available tabs filtered to only those present in `feature.artifacts`
- Default tab = hero tab for current phase (e.g., plan phase → plan tab)
- Hero tab gets an animated phase-colored dot indicator in `ArtifactTabs`

## Comment System

Comments are ephemeral (in-memory). Not persisted to disk.

- `useCommentStore` manages comments keyed by `(artifactType, sectionHeading)`
- Only tabs in `commentableTabs` (from `usePhaseNotification`) show comment UI
- `commentableTabs` is determined by the last completed command:
  - `spec.specify` / `spec.clarify` → `['spec']`
  - `spec.plan` → `['plan', 'research']`
  - `spec.implement` → `['summary']`
  - `spec.review` → `['review']`
- "Copy Comments" button formats all comments via `format-comments.ts` and copies to clipboard

## IPC Event Handling

`App.tsx` subscribes to four IPC events in a `useEffect`:

| Event | Handler |
|-------|---------|
| `settings-changed` | Updates `document.documentElement.style.fontSize` |
| `specs-changed` | Increments `refreshKey`, shows toast notification |
| `branch-changed` | Increments `refreshKey`, shows toast notification |
| `phase-changed` | (handled by `usePhaseNotification` in FeatureDetail) |
| `update-available` | (handled by `useAutoUpdate` — shows UpdateDialog) |
| `update-downloaded` | (handled by `useAutoUpdate` — transitions dialog to "restart" state) |

Cleanup functions from `window.api.on*` are called in the effect's return.

## How to Add a New Artifact View

1. Create `src/renderer/src/components/artifacts/<Name>View.tsx`
2. Props: `{ elements: Element[], commentProps?: CommentProps }`
3. Add to `TAB_ORDER` and `TAB_LABELS` in `FeatureDetail.tsx`
4. Add the rendering case in FeatureDetail's tab content switch
5. If it needs a hero phase, add to `PHASE_HERO`

## How to Add a New Component

1. Create in the appropriate directory:
   - `components/artifacts/` — full artifact views
   - `components/elements/` — renders a single element type
   - `components/ui/` — shared primitives
2. Import in the parent component
3. Use Tailwind CSS for styling (v4, no config file — `@import "tailwindcss"` in CSS)

## Gotchas

1. **FeatureDetail re-mounts on refresh**: Uses `key={project.id}-${refreshKey}` — any state inside FeatureDetail resets when specs or branch change. This is intentional (forces fresh data fetch).

2. **Phase-adaptive default tab**: When the user switches projects, the active tab resets to the hero tab for the new project's phase. This can be surprising if you expect the tab to persist.

3. **Comment data lost on refresh**: Since comments are in-memory and FeatureDetail re-mounts on `refreshKey` change, saving a file externally (which triggers specs-changed) clears all comments. This is a known limitation.

4. **Clipboard fallback**: If `navigator.clipboard.writeText` fails (common in Electron), FeatureDetail falls back to a visible textarea with a "copy manually" prompt.

5. **Glossary context**: `GlossaryContext` is provided by FeatureDetail and consumed by `MarkdownContent` to render inline term definitions. If glossary fails to load, terms render as plain text.

6. **No React Router**: The app uses conditional rendering based on `selectedProject` state, not URL routing. There are no routes.

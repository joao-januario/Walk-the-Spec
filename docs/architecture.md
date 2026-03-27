# Architecture Overview

## Primary Data Flow

```
Filesystem change (artifact file saved)
  → chokidar detects change (file-watcher.ts, 300ms debounce)
  → main process sends 'specs-changed' IPC event to renderer
  → App.tsx listener increments refreshKey
  → FeatureDetail re-renders (key={projectId-refreshKey})
  → useFeatureData calls api.getFeature(projectId) via IPC
  → handlers.ts: scanProject → detectPhase → return Feature metadata
  → useArtifactData calls api.getArtifact(projectId, type) via IPC
  → handlers.ts: reads file → calls parser (parseSpec/parsePlan/etc.) → return elements[]
  → Artifact view component renders parsed elements
```

## IPC Channel Registry

### Request/Response Channels (`ipcMain.handle` / `ipcRenderer.invoke`)

| Channel | Handler | Renderer Caller | Purpose |
|---------|---------|-----------------|---------|
| `get-projects` | `handlers.ts` | `api.getProjects()` | List all projects with branch, phase, errors |
| `add-project` | `handlers.ts` | `api.addProject(path, name?)` | Register new project (validates git repo) |
| `delete-project` | `handlers.ts` | `api.deleteProject(id)` | Unregister project |
| `show-folder-picker` | `handlers.ts` | `api.showFolderPicker()` | Native OS folder dialog |
| `get-feature` | `handlers.ts` | `api.getFeature(projectId)` | Feature metadata (branch, phase, artifacts list) |
| `get-artifact` | `handlers.ts` | `api.getArtifact(projectId, type)` | Parse artifact file, return typed elements[] |
| `edit-field` | `handlers.ts` | `api.editField(projectId, type, elementId, field, value)` | Surgical edit of artifact field (checkbox, text) |
| `backlog:list` | `handlers.ts` | `api.getRefactorBacklog(projectId)` | Parse refactor-backlog.md entries |
| `get-settings` | `handlers.ts` | `api.getSettings()` | App settings (fontSize, soundVolume, osNotifications) |
| `save-settings` | `handlers.ts` | `api.saveSettings(partial)` | Update partial settings |
| `get-glossary` | `handlers.ts` | `api.getGlossary(projectId)` | Parse glossary.md term definitions |

### Event Channels (`mainWindow.webContents.send` / `ipcRenderer.on`)

| Channel | Payload | Trigger |
|---------|---------|---------|
| `specs-changed` | `{ projectId, files[], timestamp }` | Artifact files modified on disk |
| `branch-changed` | `{ projectId, timestamp }` | `.git/HEAD` changed (branch switch) |
| `phase-changed` | `{ projectId, projectName, command, phase, timestamp }` | External command completed (via notify server) |
| `settings-changed` | `{ fontSize?, soundVolume?, osNotifications? }` | Menu or settings update |

## File Watching

**Module**: `src/main/projects/file-watcher.ts`

Two independent chokidar watchers per project:
1. **Specs watcher**: Monitors `.claude/specs/` for artifact file changes (add/change/unlink)
2. **HEAD watcher**: Monitors `.git/HEAD` for branch switches

Key behaviors:
- `awaitWriteFinish`: 500ms stability threshold, 100ms poll interval (ensures writes complete before firing)
- `ignoreInitial: true`: No events for existing files at startup
- **Debouncing**: Specs changes accumulate in a `pendingFiles` Set, flushed after 300ms of quiet. Multiple rapid saves batch into one `specs-changed` event. Branch changes fire immediately (no debounce).

## Phase Detection

**Module**: `src/main/phase/phase-detector.ts`

Pure function. Determines phase from which artifact files exist in the spec directory:

| Phase | Detection Rule |
|-------|---------------|
| `review` | `review.md` exists AND (`summary.md` exists OR tasks have checked items) |
| `summary` | `summary.md` exists |
| `implement` | `tasks.md` exists with `- [x]` items |
| `tasks` | `tasks.md` exists (no checked items) |
| `plan` | `plan.md` exists |
| `specify` | Only `spec.md` exists |
| `unknown` | No recognized artifacts |

Precedence: evaluated top-to-bottom, first match wins.

## Repository Map Generation

**Module**: `src/main/repomap/`

The repomap system analyzes source code structure across multiple languages and generates repository maps for context injection. It powers the structural codebase understanding in spec commands.

**System Components**:
- `index.ts`: Main generator orchestrates extractor calls and aggregates results
- `extractors.ts`: Registry of language-specific code structure extractors (TypeScript, Python, Go, Rust, Java)
- `ts-extractor.ts`: TypeScript AST walker extracts classes, functions, interfaces, types
- `tree-sitter-extractor.ts`: Tree-sitter fallback parser for non-TypeScript languages (Python, Go, Rust, Java)
- `format.ts`: Formats extracted structures into human-readable tree and summary formats
- `types.ts`: Typed interfaces for extractors and generated maps

**Lifecycle**:
- Generated on project add (background, non-blocking)
- Regenerated on source file changes via `onSourceChanged` event in file watcher
- Results stored in project cache for command context injection

## Notifications

Three components work together when an external command completes:

1. **Notify Server** (`notify-server.ts`): HTTP server on `127.0.0.1:3847`. Shell scripts POST `{command, status, projectPath}` when spec commands start/complete. Only `status: "completed"` triggers notifications.

2. **Sound Player** (`sound-player.ts`): Maps command suffix to `.wav` file (e.g., `spec.plan` → `plan.wav`). Plays via PowerShell `MediaPlayer` (Windows) or `afplay` (macOS). Volume configurable: off/low(0.2)/medium(0.5)/high(1.0).

3. **OS Notifier** (`os-notifier.ts`): Shows desktop toast via Electron `Notification` API. Clicking the notification focuses/restores the app window.

**Flow**: Script POSTs to notify server → `handleNotify` in `index.ts` matches project by path → scans project → detects phase → sends `phase-changed` IPC to renderer → flashes taskbar (Windows) / bounces dock (macOS) → plays sound → shows OS notification.

## Config & Storage

**File**: `~/.walk-the-spec/config.json`

```json
{
  "projects": [{ "id": "uuid", "name": "my-project", "path": "/path/to/project" }],
  "settings": { "fontSize": 16, "soundVolume": "medium", "osNotifications": true }
}
```

No database. All runtime state is derived from filesystem (git branch, artifact files). Comments are ephemeral (in-memory with sessionStorage fallback).

## Scaffold & Integration

**Modules**: `src/main/integration/`, `resources/scaffold/`, `scripts/sync-scaffold.sh`

The scaffold is a bundled set of speckit files (commands, templates, scripts, best-practices) that gets copied into other projects when they "integrate" with Walk the Spec. It lives in `resources/scaffold/` and is distributed with the packaged Electron app.

**Dual-source with auto-sync**: The live speckit files in `.claude/commands/`, `.claude/specify/templates/`, and `.claude/specify/scripts/` are the source of truth. `scripts/sync-scaffold.sh` copies them to `resources/scaffold/` at build time via the `prebuild` npm script. Scaffold-only files (`best-practices/`, `CLAUDE.md.template`, `.scaffold-version`) are not synced — they're maintained directly in `resources/scaffold/`.

**Integration flow**: When a user adds a project or clicks "Refresh Specs", the app runs `generateIntegrationPlan()` in `integration-planner.ts` to produce a read-only diff (create/overwrite/preserve for each file). The `IntegrationDialog` component shows this plan. On confirm, `executeIntegration()` in `scaffold-writer.ts` copies scaffold files to the target project's `.claude/` directory, skipping `CLAUDE.md` if it already exists and preserving template overrides.

**Scaffold versioning**: Each scaffold has a version in `.scaffold-version`. When a project's scaffold version doesn't match the bundled version, the app shows an "outdated" integration state. Bump `resources/scaffold/.scaffold-version` when scaffold content changes meaningfully.

**Runtime path resolution**: `getScaffoldDir()` in `scaffold-version.ts` resolves the scaffold directory relative to `__dirname` (which is `out/main/` in the built app), going up two levels to the app root then into `resources/scaffold/`.

## Auto-Update

**Module**: `src/main/updater/auto-updater.ts`

On startup (production only — skipped when `ELECTRON_RENDERER_URL` is set), `initAutoUpdater()` configures `electron-updater` with `autoDownload: false` and checks GitHub Releases for a newer version via `latest.yml`. If found, it forwards `update-available` to the renderer via IPC. The renderer shows an `UpdateDialog` modal. User clicks "Update" → `update:install` IPC triggers download → `update-downloaded` event → user clicks "Restart" → `update:restart` IPC calls `quitAndInstall()`. All errors are silently logged (no user-facing error on network failure).

## Where to Start

| Task | Files to touch |
|------|---------------|
| Add new IPC channel | `src/main/ipc/handlers.ts` (add handler) → `src/preload/index.ts` (expose via bridge) → `src/renderer/src/services/api.ts` (add typed wrapper) |
| Add new parser | Create `src/main/parser/<name>-parser.ts` → add import + case in `src/main/ipc/handlers.ts` `get-artifact` handler → add type to `src/renderer/src/types/index.ts` |
| Add new artifact view | Create `src/renderer/src/components/artifacts/<Name>View.tsx` → add to tab rendering in `src/renderer/src/components/feature/FeatureDetail.tsx` → add to `TAB_ORDER` and `TAB_LABELS` |
| Add new renderer component | Create in `src/renderer/src/components/<area>/` → import in parent component |
| Modify notification behavior | `src/main/notifications/sound-player.ts` (sounds), `os-notifier.ts` (toasts), or `notify-server.ts` (HTTP endpoint) |
| Change phase detection logic | `src/main/phase/phase-detector.ts` (single pure function) |
| Add new setting | `src/main/config/config-manager.ts` (add to AppSettings + DEFAULT_SETTINGS) → `src/main/index.ts` (add menu item if needed) |
| Edit artifact fields | `src/main/writer/artifact-writer.ts` (add edit function) → `src/main/ipc/handlers.ts` (add case in `edit-field` handler) |

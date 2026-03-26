# IPC Handlers Area Guide

## Purpose

The IPC layer connects the React renderer to the Electron main process. All filesystem operations, parsing, and config management happen in main — the renderer requests data and receives events through IPC channels. The handler registration, preload bridge, and renderer API wrapper form a three-file contract.

## Handler Registration Pattern

All handlers are registered in a single `registerIpcHandlers()` function called once at app startup from `index.ts`. Each handler follows:

```typescript
ipcMain.handle('channel-name', async (_event, arg1: Type1, arg2?: Type2) => {
  // validate args, do work, return result
});
```

Key conventions:
- Channel names are lowercase kebab-case (e.g., `get-projects`, `add-project`, `edit-field`)
- Exception: `backlog:list` uses colon namespace (legacy pattern)
- First parameter is always `_event` (unused in handle pattern)
- All handlers return serializable data (no class instances, no functions)

## Preload Bridge Contract

The preload script exposes two kinds of API:

**Request/Response** (invoke pattern):
```typescript
getProjects: () => ipcRenderer.invoke('get-projects')
addProject: (path: string, name?: string) => ipcRenderer.invoke('add-project', path, name)
```

**Event Listeners** (on pattern with cleanup):
```typescript
onSpecsChanged: (callback) => {
  const sub = (_event, ...args) => callback(...args);
  ipcRenderer.on('specs-changed', sub);
  return () => { ipcRenderer.removeListener('specs-changed', sub); };
}
```

Every `on`-style listener returns a cleanup function for React `useEffect` teardown.

## Renderer API Wrapper

`api.ts` provides typed async functions that match the preload bridge 1:1:

```typescript
export async function getProjects(): Promise<{ projects: Project[] }> {
  return window.api.getProjects();
}
```

The renderer NEVER calls `window.api` directly from components — always through `api.ts`.

## Data Flow

```
Component calls api.getArtifact(projectId, 'spec')
  → window.api.getArtifact(projectId, 'spec')     [preload bridge]
  → ipcRenderer.invoke('get-artifact', ...)         [Electron IPC]
  → ipcMain.handle('get-artifact', handler)         [main process]
  → handler reads file, calls parseSpec(content)
  → returns { type, filePath, lastModified, elements[] }
  → result serialized back through IPC
  → api.ts returns typed Artifact to component
```

## How to Add a New IPC Channel

1. **Main handler** (`src/main/ipc/handlers.ts`):
   ```typescript
   ipcMain.handle('my-channel', async (_event, arg1: string) => {
     // do work
     return result;
   });
   ```

2. **Preload bridge** (`src/preload/index.ts`):
   ```typescript
   myChannel: (arg1: string) => ipcRenderer.invoke('my-channel', arg1)
   ```

3. **Renderer API** (`src/renderer/src/services/api.ts`):
   ```typescript
   export async function myChannel(arg1: string): Promise<ResultType> {
     return window.api.myChannel(arg1);
   }
   ```

4. **Window type declaration** (in `api.ts`):
   Add `myChannel` to the `Window.api` interface declaration.

All three files must be updated together. Missing any one causes a runtime error.

## The `get-artifact` Handler (Most Complex)

This is the largest handler (~120 lines). It:
1. Looks up the project from config
2. Scans the project for its spec directory
3. Reads the artifact file from disk
4. Switches on `artifactType` to call the right parser
5. Wraps parsed elements in a standardized `Artifact` envelope
6. Attaches `reviewMeta` (heal summary, branch) for review artifacts

For the 'plan' artifact type specifically: After parsing summary, technical approach, decisions, and legacy sections, the handler checks if `parsed.fileStructure.length > 0`. If file structure data exists, it wraps the `FileStructureSection[]` array in a `FileStructureContent` element with type 'file-structure', enabling PlanView to render a styled, color-coded file list instead of a raw code block.

Supported artifact types: `spec`, `plan`, `tasks`, `research`, `summary`, `deep-dives`, `review`.

## The `edit-field` Handler

Handles surgical edits to artifact files without full rewrite:
- `checked` field on tasks → calls `editTaskCheckbox(filePath, taskId, checked)`
- `text` field on requirements → calls `editRequirementText(filePath, reqId, newText)`

After editing, the file watcher detects the change → triggers `specs-changed` → renderer re-fetches and re-renders.

## Gotchas

1. **All handlers are registered once**: `registerIpcHandlers()` is called from `index.ts` during `app.whenReady()`. Do not call it again or register handlers elsewhere.

2. **Config reload on every call**: Most handlers call `loadConfig()` at the start — config is re-read from disk each time, not cached. This ensures config changes from the menu or other sources are always reflected.

3. **Glossary is inline**: The `get-glossary` handler parses `glossary.md` using raw regex directly in `handlers.ts`, unlike other artifacts which use dedicated parser modules.

4. **Error wrapping**: All handlers wrap errors as `{ error: message }` objects rather than throwing. The renderer checks for `.error` on the response.

5. **Sync file reads**: Some handlers use `fs.readFileSync` for simplicity. This is acceptable because reads are small (markdown files) and infrequent (on-demand from user interaction, not polling).

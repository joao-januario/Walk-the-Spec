# Electron Architecture Best Practices

Rules for main/renderer separation, lifecycle, file system access, and process management.
Applies to: `src/main/**`, `src/preload/**`

---

## EA01 — No File System in Renderer

**Severity**: CRITICAL
**Rule**: All file system operations MUST happen in the main process. Renderer MUST request file operations via IPC.

**Detect**: Flag any import of `fs`, `path`, `child_process`, or `os` in renderer source files (`src/renderer/**`).

---

## EA02 — Async File Operations Only

**Severity**: HIGH
**Rule**: MUST use `fs.promises` (async) for all file operations in production code. MUST NOT use `readFileSync`, `writeFileSync`, `existsSync`, or other sync variants — they block the main process event loop.

**Detect**: Search `src/main/**` for `Sync(` calls on `fs` methods. Flag each occurrence.

**Exception**: `existsSync` is acceptable in startup/initialization code (app launch) where async would complicate control flow. Must have `// sync: startup only` comment.

```ts
// WRONG
const content = fs.readFileSync(filePath, 'utf-8');

// CORRECT
const content = await fs.promises.readFile(filePath, 'utf-8');
```

---

## EA03 — Centralized IPC Registration

**Severity**: HIGH
**Rule**: All `ipcMain.handle` calls MUST be registered in a centralized initialization function called once at startup. MUST NOT scatter handler registration across the codebase.

**Detect**: Search for `ipcMain.handle` outside of the designated handler registration file(s). Flag if found in multiple unrelated files.

---

## EA04 — Resource Cleanup on Window Close

**Severity**: HIGH
**Rule**: MUST clean up IPC listeners, file watchers, timers, and window references when windows close or app quits.

**Detect**: Check for `chokidar` watchers, `setInterval`/`setTimeout` handles, and `ipcMain.on` listeners. Flag if there's no corresponding cleanup in `window.on('closed')` or `app.on('window-all-closed')`.

---

## EA05 — Platform Lifecycle Handling

**Severity**: MEDIUM
**Rule**: MUST handle `window-all-closed` (quit on Windows/Linux, stay alive on macOS) and `activate` (re-create window on macOS).

**Detect**: Search `src/main/index.ts` for both event handlers. Flag if either is missing.

```ts
// CORRECT
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
```

---

## EA06 — Show Window on Ready

**Severity**: MEDIUM
**Rule**: SHOULD create BrowserWindow with `show: false` and call `win.show()` on `ready-to-show` event to prevent white flash.

**Detect**: Flag if BrowserWindow is created without `show: false` or without a `ready-to-show` listener.

---

## EA07 — Scoped File Watchers

**Severity**: MEDIUM
**Rule**: File watchers SHOULD be scoped to the narrowest possible directory. MUST debounce change events (100-300ms) before sending to renderer.

**Detect**: Check chokidar watch paths. Flag overly broad watches (e.g., watching entire home directory). Check for debounce logic.

---

## EA08 — No CPU Work in Renderer

**Severity**: HIGH
**Rule**: CPU-intensive operations (markdown parsing, large file reads, computation) MUST stay in the main process. Renderer MUST NOT import parser or writer modules directly.

**Detect**: Flag any import of parser/writer modules from `src/main/` in renderer files.

---

## EA09 — DevTools Only in Development

**Severity**: MEDIUM
**Rule**: DevTools SHOULD only be opened in development builds. Guard with `!app.isPackaged`.

**Detect**: Search for `openDevTools()`. Flag if not guarded by a development check.

---

## EA10 — Preload Path Correctness

**Severity**: CRITICAL
**Rule**: The preload script path in BrowserWindow webPreferences MUST resolve to an existing file. CJS format (`.js`) is required for Electron preload — ESM (`.mjs`) is not supported.

**Detect**: Check the `preload` path in BrowserWindow constructor. Verify it ends in `.js` not `.mjs`. Cross-reference with build output configuration.

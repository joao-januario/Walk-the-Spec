# Electron Security Best Practices

Rules for Electron main process, preload scripts, and IPC security.
Applies to: `src/main/**`, `src/preload/**`, `electron.vite.config.*`

---

## ES01 — Context Isolation Must Be Enabled

**Severity**: CRITICAL
**Rule**: Every BrowserWindow MUST set `contextIsolation: true` in webPreferences.

**Detect**: Search BrowserWindow constructor calls. Flag if `contextIsolation` is missing or set to `false`.

```ts
// WRONG
new BrowserWindow({ webPreferences: { contextIsolation: false } })

// CORRECT
new BrowserWindow({ webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true } })
```

---

## ES02 — Node Integration Must Be Disabled

**Severity**: CRITICAL
**Rule**: Every BrowserWindow MUST set `nodeIntegration: false` in webPreferences.

**Detect**: Flag if `nodeIntegration: true` appears anywhere.

---

## ES03 — Sandbox Must Be Enabled

**Severity**: HIGH
**Rule**: Every BrowserWindow SHOULD set `sandbox: true` in webPreferences.

**Detect**: Flag if `sandbox` is missing or set to `false` in webPreferences.

---

## ES04 — No Raw ipcRenderer Exposure

**Severity**: CRITICAL
**Rule**: Preload scripts MUST NOT expose raw `ipcRenderer` to the renderer. MUST expose named functions only via `contextBridge.exposeInMainWorld`.

**Detect**: Search preload files for `ipcRenderer` being passed directly to `exposeInMainWorld`.

```ts
// WRONG
contextBridge.exposeInMainWorld('api', { ipcRenderer })
contextBridge.exposeInMainWorld('electron', { ipcRenderer: ipcRenderer })

// CORRECT
contextBridge.exposeInMainWorld('api', {
  getProjects: () => ipcRenderer.invoke('get-projects'),
})
```

---

## ES05 — Use invoke/handle, Not sendSync

**Severity**: CRITICAL
**Rule**: MUST use `ipcMain.handle` / `ipcRenderer.invoke` for request-response IPC. MUST NOT use `ipcRenderer.sendSync`.

**Detect**: Flag any usage of `sendSync`.

---

## ES06 — IPC Argument Validation

**Severity**: HIGH
**Rule**: All `ipcMain.handle` handlers MUST validate arguments received from the renderer. The renderer is untrusted.

**Detect**: Check each `ipcMain.handle` callback. Flag handlers that use string arguments in file paths without validation (e.g., `path.join` with unvalidated input).

```ts
// WRONG
ipcMain.handle('read-file', (_event, filePath: string) => {
  return fs.readFileSync(filePath, 'utf-8'); // arbitrary path!
})

// CORRECT
ipcMain.handle('read-file', (_event, filePath: string) => {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(allowedBaseDir)) throw new Error('Access denied');
  return fs.readFileSync(resolved, 'utf-8');
})
```

---

## ES07 — IPC Channel Namespacing

**Severity**: MEDIUM
**Rule**: IPC channels SHOULD follow `domain:action` naming convention.

**Detect**: Flag channels that don't contain a colon separator (e.g., `get-projects` instead of `projects:list`).

```ts
// WRONG
ipcMain.handle('get-projects', ...)
ipcMain.handle('addProject', ...)

// CORRECT
ipcMain.handle('projects:list', ...)
ipcMain.handle('projects:add', ...)
```

---

## ES08 — Content Security Policy

**Severity**: HIGH
**Rule**: Renderer HTML MUST include a strict CSP meta tag. MUST NOT use `'unsafe-eval'`.

**Detect**: Check renderer `index.html` for CSP meta tag. Flag if missing or if it contains `unsafe-eval`.

```html
<!-- CORRECT -->
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'" />
```

---

## ES09 — Preload Script Thinness

**Severity**: MEDIUM
**Rule**: Preload scripts MUST contain only IPC bridging. No business logic, no imports of application modules, no data transformation.

**Detect**: Flag preload files that import from `src/main/` application modules (parsers, services, etc.) or contain logic beyond simple `ipcRenderer.invoke` wrappers.

---

## ES10 — Listener Cleanup in Preload

**Severity**: HIGH
**Rule**: Any `ipcRenderer.on` listener exposed via preload MUST return a cleanup/unsubscribe function.

**Detect**: Search for `ipcRenderer.on` in preload. Flag if the exposed function doesn't return a removal function.

```ts
// WRONG
onSpecsChanged: (cb: Function) => { ipcRenderer.on('specs-changed', cb); }

// CORRECT
onSpecsChanged: (cb: Function) => {
  const handler = (_e: any, ...args: any[]) => cb(...args);
  ipcRenderer.on('specs-changed', handler);
  return () => ipcRenderer.removeListener('specs-changed', handler);
}
```

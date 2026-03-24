---
name: electron-native-app
description: User strongly prefers Electron desktop app over browser-based web app for local dev tools. No Docker, no browser tabs.
type: feedback
---

Spec Board must be an Electron desktop app, not a browser-based web app.

**Why:** A local dev tool should run as a native OS window — not a random browser tab. Electron gives native folder picker, system tray, proper window management, and single-binary distribution. Docker adds isolation friction that works against filesystem-heavy tools.

**How to apply:** For any local developer tool, default to Electron over Express+browser. Use IPC instead of HTTP APIs. Use native OS dialogs (dialog.showOpenDialog, etc.) instead of web workarounds.

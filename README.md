# Walk the Spec

A desktop dashboard that monitors your local projects for spec artifacts (`.claude/specs/<branch>/*.md`) — heavily modified from [spec-kit](https://github.com/github/spec-kit) — and renders them as an interactive, real-time board.

Think of it as a mission control for your spec-driven development workflow: see every feature's phase at a glance, drill into specs, plans, tasks, research, and reviews — all parsed and rendered live as files change on disk.

## What It Does

- **Project sidebar** — persistent list of monitored projects with phase-status badges (specify, plan, implement, review, done)
- **Artifact rendering** — specs, plans, tasks, research, reviews, and summaries parsed from markdown into rich, interactive views
- **Live file watching** — chokidar monitors your `.claude/specs/` directories; changes appear instantly without manual refresh
- **Inline editing** — toggle task checkboxes and edit requirement text directly in the dashboard
- **Phase detection** — automatically determines which workflow phase each feature branch is in
- **OS notifications** — optional sound + native notifications when a spec command completes
- **Code-aware repo maps** — tree-sitter powered structural analysis of your codebase
- **10 built-in themes** — dark and light, from Radix Mauve to Catppuccin to Solarized

## Download

Grab the latest release for your platform:

| Platform | Download |
|----------|----------|
| Windows (x64) | [Walk-the-Spec-Setup.exe](https://github.com/joao-januario/Walk-the-Spec/releases/latest) |
| macOS (Intel) | [Walk-the-Spec.dmg (x64)](https://github.com/joao-januario/Walk-the-Spec/releases/latest) |
| macOS (Apple Silicon) | [Walk-the-Spec-arm64.dmg](https://github.com/joao-januario/Walk-the-Spec/releases/latest) |
| Linux (x64) | [Walk-the-Spec.AppImage](https://github.com/joao-januario/Walk-the-Spec/releases/latest) |

### First Launch — Unsigned App Workarounds

This app is not code-signed. Your OS will warn you on first launch:

**macOS**: Right-click the app > "Open" > click "Open" in the dialog. You only need to do this once.

**Windows**: Click "More info" on the SmartScreen dialog > "Run anyway". You only need to do this once.

**Linux**: Make the AppImage executable first: `chmod +x Walk-the-Spec-*.AppImage`, then run it.

## Auto-Update

Walk the Spec checks for updates automatically on startup. When a new version is available, you'll see an in-app dialog with the option to update or dismiss. Updates download in the background — you'll be prompted to restart when ready.

## Development

```bash
# Clone
git clone https://github.com/joao-januario/Walk-the-Spec.git
cd Walk-the-Spec

# Install dependencies
npm install

# Start dev server (electron-vite with hot reload)
npm run dev

# Run tests
npm test

# Production build
npm run build
```

## Tech Stack

- **Electron** — cross-platform desktop shell
- **React 19** — renderer UI
- **TypeScript 5** — strict mode everywhere
- **electron-vite** — build tooling
- **Tailwind CSS v4** — styling
- **chokidar** — file system watching
- **unified/remark** — markdown parsing
- **tree-sitter** (WASM) — code structure extraction
- **framer-motion** — animations
- **electron-updater** — auto-update from GitHub Releases
- **Vitest** — testing

## License

MIT

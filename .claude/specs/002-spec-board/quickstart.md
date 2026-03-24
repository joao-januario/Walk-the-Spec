# Quickstart: Spec Board

**Branch**: `002-spec-board` | **Date**: 2026-03-24

## Prerequisites

- Node.js >= 20.19 (for ESM support and chokidar v5)
- Git installed and in PATH
- A local project with speckit artifacts (`.claude/specs/` directory)

## Setup

```bash
# Clone and install
git clone <repo-url> spec-board
cd spec-board

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Development

```bash
# Terminal 1: Start backend (Express + WebSocket on port 3001)
cd backend
npm run dev

# Terminal 2: Start frontend (Vite dev server on port 5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## First Use

1. Click "Add Project" on the board
2. Enter the absolute path to a local project with speckit artifacts
3. The project appears as a card showing the checked-out branch and its phase
4. Click the card to drill into the feature's artifacts

## Key Paths

| What | Where |
|------|-------|
| Config file | `~/.spec-board/config.json` |
| Backend API | `http://localhost:3001/api` |
| WebSocket | `ws://localhost:3001/ws` |
| Frontend dev | `http://localhost:5173` |
| Speckit artifacts | `<project>/.claude/specs/<branch>/` |
| Comment files | `<project>/.claude/specs/<branch>/comments/` |

## Project Structure

```
spec-board/
├── backend/          # Node.js/Express API + WebSocket + file watching
│   ├── src/
│   └── tests/
├── frontend/         # React/Vite SPA
│   ├── src/
│   └── tests/
└── .claude/specs/    # Speckit artifacts for this project itself
```

## Testing

```bash
# Backend unit + integration tests
cd backend
npm test

# Frontend component tests
cd frontend
npm test
```

## Build for Production

```bash
# Build frontend
cd frontend
npm run build
# Output: frontend/dist/

# Backend serves the built frontend static files in production mode
cd backend
NODE_ENV=production npm start
```

In production mode, the backend serves the frontend's built files and the API from a single port.

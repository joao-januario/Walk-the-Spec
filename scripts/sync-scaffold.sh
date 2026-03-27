#!/usr/bin/env bash
# Sync .claude/ live files → resources/scaffold/ (shared files only)
#
# .claude/ is the source of truth. resources/scaffold/ is the bundled copy
# distributed to other projects during integration. This script keeps them
# in sync at build time.
#
# Usage:
#   bash scripts/sync-scaffold.sh          # sync files
#   bash scripts/sync-scaffold.sh --check  # verify sync (exit 1 if out of sync)
#
# NOT synced (scaffold-only, intentionally different):
#   resources/scaffold/best-practices/   — generic templates, not project-specific
#   resources/scaffold/CLAUDE.md.template — template for new projects
#   resources/scaffold/.scaffold-version — manually bumped on content changes
#
# EXCLUDED from sync (project-specific commands that should NOT go to other projects):
EXCLUDE_FILES=(
  "commands/release-new-version.md"
)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCAFFOLD="$ROOT/resources/scaffold"
LIVE="$ROOT/.claude"
CHECK_MODE=false
[[ "${1:-}" == "--check" ]] && CHECK_MODE=true

# Directories to sync: live path (relative to .claude/) → scaffold path (relative to resources/scaffold/)
SYNC_DIRS=(
  "commands"
  "specify/templates"
  "specify/scripts"
)

out_of_sync=0

for dir in "${SYNC_DIRS[@]}"; do
  src="$LIVE/$dir"
  dst="$SCAFFOLD/$dir"

  if [ ! -d "$src" ]; then
    echo "WARN: source directory missing: $src"
    continue
  fi

  if $CHECK_MODE; then
    # Build exclude args for diff
    exclude_args=""
    for excl in "${EXCLUDE_FILES[@]}"; do
      if [[ "$excl" == "$dir/"* ]]; then
        exclude_args="$exclude_args --exclude=$(basename "$excl")"
      fi
    done
    if ! diff -r --strip-trailing-cr -q $exclude_args "$src" "$dst" > /dev/null 2>&1; then
      echo "OUT OF SYNC: $dir"
      diff -r --strip-trailing-cr $exclude_args "$src" "$dst" || true
      out_of_sync=1
    fi
  else
    mkdir -p "$dst"
    # Delete destination contents first, but preserve excluded files
    for f in $(find "$dst" -type f 2>/dev/null); do
      rel="${f#$SCAFFOLD/}"
      skip=false
      for excl in "${EXCLUDE_FILES[@]}"; do
        if [[ "$rel" == "$excl" ]]; then skip=true; break; fi
      done
      $skip || rm -f "$f"
    done
    # Copy source, then remove excluded files from destination
    cp -r "$src/." "$dst/"
    for excl in "${EXCLUDE_FILES[@]}"; do
      if [[ "$excl" == "$dir/"* ]]; then
        rm -f "$SCAFFOLD/$excl" 2>/dev/null || true
      fi
    done
    echo "Synced: .claude/$dir → resources/scaffold/$dir"
  fi
done

if $CHECK_MODE; then
  if [ $out_of_sync -ne 0 ]; then
    echo "ERROR: Scaffold is out of sync. Run 'npm run sync-scaffold' to fix."
    exit 1
  else
    echo "Scaffold is in sync."
  fi
fi

#!/usr/bin/env bash
# Consolidated phase teardown script
# Replaces separate write-status "completed" + extensions.yml after-hooks check.
#
# Usage:
#   teardown-phase.sh --command "spec.plan" --json

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Argument parsing ---
COMMAND=""
JSON=false
HELP=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --command)
            COMMAND="$2"
            shift 2
            ;;
        --json)
            JSON=true
            shift
            ;;
        --help)
            HELP=true
            shift
            ;;
        *)
            echo "ERROR: Unknown argument: $1" >&2
            exit 1
            ;;
    esac
done

if [[ "$HELP" == true ]]; then
    cat <<'HELPTEXT'
Usage: teardown-phase.sh --command <cmd> [OPTIONS]

Consolidated phase teardown: status signal "completed" + extensions check.

OPTIONS:
  --command   The spec command name (e.g., "spec.plan")
  --json      Output in JSON format
  --help      Show this help message
HELPTEXT
    exit 0
fi

# Validate required args
if [[ -z "$COMMAND" ]]; then
    echo "ERROR: --command is required" >&2
    exit 1
fi

# Source common functions
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

# Get feature paths
get_feature_paths_env

# --- 1. Notify app: phase completed ---
send_phase_notify "$COMMAND" "completed" "$REPO_ROOT"

# --- 2. Check extensions.yml for after-hooks ---
has_extensions=false
extensions_path="$REPO_ROOT/.claude/specify/extensions.yml"
if [[ -f "$extensions_path" ]]; then
    has_extensions=true
fi

# --- 3. Output ---
if [[ "$JSON" == true ]]; then
    printf '{"STATUS":"completed","HAS_EXTENSIONS":%s}\n' "$has_extensions"
else
    echo "Status: completed"
    echo "HAS_EXTENSIONS: $has_extensions"
fi

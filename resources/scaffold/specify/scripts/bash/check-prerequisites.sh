#!/usr/bin/env bash
# Consolidated prerequisite checking script (Bash)
# Adapted from github/spec-kit
set -euo pipefail

# Parse arguments
json=false
require_tasks=false
include_tasks=false
paths_only=false
show_help=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --json)           json=true;           shift ;;
        --require-tasks)  require_tasks=true;  shift ;;
        --include-tasks)  include_tasks=true;  shift ;;
        --paths-only)     paths_only=true;     shift ;;
        --help)           show_help=true;      shift ;;
        *)
            echo "ERROR: Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

# Show help if requested
if [[ "$show_help" == "true" ]]; then
    cat <<'HELP'
Usage: check-prerequisites.sh [OPTIONS]

Consolidated prerequisite checking for Spec-Driven Development workflow.

OPTIONS:
  --json               Output in JSON format
  --require-tasks      Require tasks.md to exist (for implementation phase)
  --include-tasks      Include tasks.md in AVAILABLE_DOCS list
  --paths-only         Only output path variables (no prerequisite validation)
  --help               Show this help message

EXAMPLES:
  ./check-prerequisites.sh --json
  ./check-prerequisites.sh --json --require-tasks --include-tasks
  ./check-prerequisites.sh --paths-only

HELP
    exit 0
fi

# Source common functions
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$script_dir/common.sh"

# Get feature paths and validate branch
get_feature_paths_env

if ! test_feature_branch "$CURRENT_BRANCH" "$HAS_GIT"; then
    exit 1
fi

# If paths-only mode, output paths and exit
if [[ "$paths_only" == "true" ]]; then
    if [[ "$json" == "true" ]]; then
        printf '{"REPO_ROOT":"%s","BRANCH":"%s","FEATURE_DIR":"%s","FEATURE_SPEC":"%s","IMPL_PLAN":"%s","TASKS":"%s"}\n' \
            "$REPO_ROOT" "$CURRENT_BRANCH" "$FEATURE_DIR" "$FEATURE_SPEC" "$IMPL_PLAN" "$TASKS"
    else
        echo "REPO_ROOT: $REPO_ROOT"
        echo "BRANCH: $CURRENT_BRANCH"
        echo "FEATURE_DIR: $FEATURE_DIR"
        echo "FEATURE_SPEC: $FEATURE_SPEC"
        echo "IMPL_PLAN: $IMPL_PLAN"
        echo "TASKS: $TASKS"
    fi
    exit 0
fi

# Validate required directories and files
if [[ ! -d "$FEATURE_DIR" ]]; then
    echo "ERROR: Feature directory not found: $FEATURE_DIR"
    echo "Run /spec.specify first to create the feature structure."
    exit 1
fi

if [[ ! -f "$IMPL_PLAN" ]]; then
    echo "ERROR: plan.md not found in $FEATURE_DIR"
    echo "Run /spec.plan first to create the implementation plan."
    exit 1
fi

# Check for tasks.md if required
if [[ "$require_tasks" == "true" && ! -f "$TASKS" ]]; then
    echo "ERROR: tasks.md not found in $FEATURE_DIR"
    echo "Run /spec.plan first (tasks phase has been removed) to create the task list."
    exit 1
fi

# Build list of available documents
docs=()

if [[ -f "$RESEARCH" ]]; then docs+=('research.md'); fi
if [[ -f "$DATA_MODEL" ]]; then docs+=('data-model.md'); fi

if [[ -d "$CONTRACTS_DIR" ]] && find "$CONTRACTS_DIR" -maxdepth 1 -type f | read -r _; then
    docs+=('contracts/')
fi

if [[ -f "$QUICKSTART" ]]; then docs+=('quickstart.md'); fi

if [[ "$include_tasks" == "true" && -f "$TASKS" ]]; then
    docs+=('tasks.md')
fi

# Output results
if [[ "$json" == "true" ]]; then
    # Build JSON array of docs
    docs_json=""
    for i in "${!docs[@]}"; do
        if [[ $i -gt 0 ]]; then
            docs_json+=","
        fi
        docs_json+="\"${docs[$i]}\""
    done
    printf '{"FEATURE_DIR":"%s","AVAILABLE_DOCS":[%s]}\n' "$FEATURE_DIR" "$docs_json"
else
    echo "FEATURE_DIR:$FEATURE_DIR"
    echo "AVAILABLE_DOCS:"

    test_file_exists "$RESEARCH" 'research.md' || true
    test_file_exists "$DATA_MODEL" 'data-model.md' || true
    test_dir_has_files "$CONTRACTS_DIR" 'contracts/' || true
    test_file_exists "$QUICKSTART" 'quickstart.md' || true

    if [[ "$include_tasks" == "true" ]]; then
        test_file_exists "$TASKS" 'tasks.md' || true
    fi
fi

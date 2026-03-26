#!/usr/bin/env bash
# Setup implementation plan for a feature
# Adapted from github/spec-kit
set -euo pipefail

# Parse arguments
json=false
show_help=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --json) json=true;      shift ;;
        --help) show_help=true; shift ;;
        *)
            echo "ERROR: Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

# Show help if requested
if [[ "$show_help" == "true" ]]; then
    echo "Usage: ./setup-plan.sh [--json] [--help]"
    echo "  --json     Output results in JSON format"
    echo "  --help     Show this help message"
    exit 0
fi

# Source common functions
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$script_dir/common.sh"

# Get all paths and variables from common functions
get_feature_paths_env

# Check if we're on a proper feature branch (only for git repos)
if ! test_feature_branch "$CURRENT_BRANCH" "$HAS_GIT"; then
    exit 1
fi

# Ensure the feature directory exists
mkdir -p "$FEATURE_DIR"

# Copy plan template if it exists, otherwise create empty file
template="$(resolve_template 'plan-template' "$REPO_ROOT" || true)"
if [[ -n "$template" && -f "$template" ]]; then
    cp "$template" "$IMPL_PLAN"
    echo "Copied plan template to $IMPL_PLAN"
else
    echo "Warning: Plan template not found" >&2
    touch "$IMPL_PLAN"
fi

# Output results
if [[ "$json" == "true" ]]; then
    printf '{"FEATURE_SPEC":"%s","IMPL_PLAN":"%s","SPECS_DIR":"%s","BRANCH":"%s","HAS_GIT":"%s"}\n' \
        "$FEATURE_SPEC" "$IMPL_PLAN" "$FEATURE_DIR" "$CURRENT_BRANCH" "$HAS_GIT"
else
    echo "FEATURE_SPEC: $FEATURE_SPEC"
    echo "IMPL_PLAN: $IMPL_PLAN"
    echo "SPECS_DIR: $FEATURE_DIR"
    echo "BRANCH: $CURRENT_BRANCH"
    echo "HAS_GIT: $HAS_GIT"
fi

#!/usr/bin/env bash
# Sends a phase notification to the Walk the Spec app via HTTP API.
#
# Usage:
#   write-status.sh --command "spec.plan" --status "started"
#   write-status.sh --command "spec.plan" --status "completed" --json
set -euo pipefail

# Parse arguments
command_name=""
status_value=""
json=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --command)
            command_name="$2"
            shift 2
            ;;
        --status)
            status_value="$2"
            shift 2
            ;;
        --json)
            json=true
            shift
            ;;
        *)
            echo "ERROR: Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

# Validate required arguments
if [[ -z "$command_name" ]]; then
    echo "ERROR: --command is required" >&2
    exit 1
fi

if [[ -z "$status_value" ]]; then
    echo "ERROR: --status is required" >&2
    exit 1
fi

if [[ "$status_value" != "started" && "$status_value" != "completed" ]]; then
    echo "ERROR: --status must be 'started' or 'completed'" >&2
    exit 1
fi

# Source common functions
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$script_dir/common.sh"

# Get feature paths
get_feature_paths_env

# Send notification
send_phase_notify "$command_name" "$status_value" "$REPO_ROOT"

# Output JSON if requested
if [[ "$json" == "true" ]]; then
    printf '{"ok":true,"command":"%s","status":"%s"}\n' "$command_name" "$status_value"
fi

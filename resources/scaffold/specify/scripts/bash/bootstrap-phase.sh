#!/usr/bin/env bash
# Consolidated phase bootstrap script
# Replaces separate write-status + check-prerequisites + setup-plan calls at the start of each phase.
# Returns a single JSON blob with all context needed to begin a phase.
#
# Usage:
#   bootstrap-phase.sh --command "spec.plan" --phase plan --json
#   bootstrap-phase.sh --command "spec.implement" --phase implement --json
#   bootstrap-phase.sh --command "spec.specify" --phase specify --json --skip-prereqs

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Argument parsing ---
COMMAND=""
PHASE=""
JSON=false
SKIP_PREREQS=false
COPY_PLAN_TEMPLATE=false
HELP=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --command)
            COMMAND="$2"
            shift 2
            ;;
        --phase)
            PHASE="$2"
            shift 2
            ;;
        --json)
            JSON=true
            shift
            ;;
        --skip-prereqs)
            SKIP_PREREQS=true
            shift
            ;;
        --copy-plan-template)
            COPY_PLAN_TEMPLATE=true
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
Usage: bootstrap-phase.sh --command <cmd> --phase <phase> [OPTIONS]

Consolidated phase startup: status signal + prerequisites + extensions check.

OPTIONS:
  --command            The spec command name (e.g., "spec.plan")
  --phase              The phase type (plan, implement, review, etc.)
  --json               Output in JSON format
  --skip-prereqs       Skip prerequisite validation (for specify/constitution)
  --copy-plan-template Copy plan template to feature dir (for plan phase)
  --help               Show this help message
HELPTEXT
    exit 0
fi

# Validate required args
if [[ -z "$COMMAND" ]]; then
    echo "ERROR: --command is required" >&2
    exit 1
fi
if [[ -z "$PHASE" ]]; then
    echo "ERROR: --phase is required" >&2
    exit 1
fi

# Validate phase value
VALID_PHASES="specify clarify plan tasks implement review heal conclude analyze checklist dive constitution taskstoissues"
phase_valid=false
for vp in $VALID_PHASES; do
    if [[ "$PHASE" == "$vp" ]]; then
        phase_valid=true
        break
    fi
done
if [[ "$phase_valid" != true ]]; then
    echo "ERROR: Invalid phase '$PHASE'. Must be one of: $VALID_PHASES" >&2
    exit 1
fi

# Source common functions
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

# Get feature paths (called ONCE for the entire bootstrap)
get_feature_paths_env

# --- 1. Notify app: phase started ---
send_phase_notify "$COMMAND" "started" "$REPO_ROOT"

# --- 2. Validate branch ---
if [[ "$HAS_GIT" == true ]]; then
    if ! test_feature_branch "$CURRENT_BRANCH" "$HAS_GIT"; then
        echo "ERROR: Not on a feature branch. Current branch: $CURRENT_BRANCH"
        exit 1
    fi
fi

# --- 3. Prerequisite checks (unless skipped) ---
if [[ "$SKIP_PREREQS" != true ]]; then
    if [[ ! -d "$FEATURE_DIR" ]]; then
        echo "ERROR: Feature directory not found: $FEATURE_DIR"
        echo "Run /spec.specify first to create the feature structure."
        exit 1
    fi

    # Plan phase needs plan.md for implement/review/heal/etc.
    requires_plan="implement review heal conclude analyze dive taskstoissues"
    for rp in $requires_plan; do
        if [[ "$PHASE" == "$rp" ]]; then
            if [[ ! -f "$IMPL_PLAN" ]]; then
                echo "ERROR: plan.md not found in $FEATURE_DIR"
                echo "Run /spec.plan first to create the implementation plan."
                exit 1
            fi
            break
        fi
    done
fi

# --- 4. Copy plan template if requested (plan phase) ---
if [[ "$COPY_PLAN_TEMPLATE" == true ]]; then
    mkdir -p "$FEATURE_DIR"
    template="$(resolve_template "plan-template" "$REPO_ROOT")"
    if [[ -n "$template" && -f "$template" ]]; then
        cp "$template" "$IMPL_PLAN"
    else
        echo "Warning: Plan template not found" >&2
        touch "$IMPL_PLAN"
    fi
fi

# --- 5. Scan available docs ---
docs=()
[[ -f "$FEATURE_SPEC" ]] && docs+=("spec.md")
[[ -f "$IMPL_PLAN" ]] && docs+=("plan.md")
[[ -f "$RESEARCH" ]] && docs+=("research.md")
[[ -f "$DATA_MODEL" ]] && docs+=("data-model.md")
if [[ -d "$CONTRACTS_DIR" ]]; then
    # Check if contracts dir has at least one file
    first_contract="$(find "$CONTRACTS_DIR" -maxdepth 1 -type f 2>/dev/null | head -n 1)"
    if [[ -n "$first_contract" ]]; then
        docs+=("contracts/")
    fi
fi
[[ -f "$QUICKSTART" ]] && docs+=("quickstart.md")

# --- 6. Check extensions.yml ---
has_extensions=false
extensions_path="$REPO_ROOT/.claude/specify/extensions.yml"
if [[ -f "$extensions_path" ]]; then
    has_extensions=true
fi

# --- 7. Output ---
if [[ "$JSON" == true ]]; then
    # Build JSON docs array
    docs_json=""
    for i in "${!docs[@]}"; do
        if [[ $i -gt 0 ]]; then
            docs_json="$docs_json,"
        fi
        docs_json="$docs_json\"${docs[$i]}\""
    done

    printf '{"REPO_ROOT":"%s","BRANCH":"%s","HAS_GIT":%s,"FEATURE_DIR":"%s","FEATURE_SPEC":"%s","IMPL_PLAN":"%s","AVAILABLE_DOCS":[%s],"HAS_EXTENSIONS":%s}\n' \
        "$REPO_ROOT" \
        "$CURRENT_BRANCH" \
        "$HAS_GIT" \
        "$FEATURE_DIR" \
        "$FEATURE_SPEC" \
        "$IMPL_PLAN" \
        "$docs_json" \
        "$has_extensions"
else
    echo "BRANCH: $CURRENT_BRANCH"
    echo "FEATURE_DIR: $FEATURE_DIR"
    # Join docs array with ", "
    docs_str=""
    for i in "${!docs[@]}"; do
        if [[ $i -gt 0 ]]; then
            docs_str="$docs_str, "
        fi
        docs_str="$docs_str${docs[$i]}"
    done
    echo "AVAILABLE_DOCS: $docs_str"
    echo "HAS_EXTENSIONS: $has_extensions"
fi

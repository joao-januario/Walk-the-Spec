#!/usr/bin/env bash
# Common bash functions analogous to common.ps1
# Adapted from github/spec-kit — paths changed to .claude/specs/ and .claude/specify/

# Get the repository root directory
get_repo_root() {
    local result
    result=$(git rev-parse --show-toplevel 2>/dev/null)
    if [[ $? -eq 0 && -n "$result" ]]; then
        echo "$result"
        return
    fi

    # Fall back to script location for non-git repos
    # Script is at .claude/specify/scripts/bash/common.sh — go up 4 levels
    local script_dir
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    echo "$(cd "$script_dir/../../../.." && pwd)"
}

# Get the current feature branch name
get_current_branch() {
    # First check if SPECIFY_FEATURE environment variable is set
    if [[ -n "${SPECIFY_FEATURE:-}" ]]; then
        echo "$SPECIFY_FEATURE"
        return
    fi

    # Then check git if available
    local result
    result=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [[ $? -eq 0 && -n "$result" ]]; then
        echo "$result"
        return
    fi

    # For non-git repos, try to find the latest feature directory
    local repo_root specs_dir
    repo_root="$(get_repo_root)"
    specs_dir="$repo_root/.claude/specs"

    if [[ -d "$specs_dir" ]]; then
        local latest_feature=""
        local highest=0
        local latest_timestamp=""

        for dir in "$specs_dir"/*/; do
            [[ -d "$dir" ]] || continue
            local name
            name="$(basename "$dir")"

            if [[ "$name" =~ ^([0-9]{8}-[0-9]{6})- ]]; then
                # Timestamp-based branch: compare lexicographically
                local ts="${BASH_REMATCH[1]}"
                if [[ "$ts" > "$latest_timestamp" ]]; then
                    latest_timestamp="$ts"
                    latest_feature="$name"
                fi
            elif [[ "$name" =~ ^([0-9]{3})- ]]; then
                local num=$((10#${BASH_REMATCH[1]}))
                if (( num > highest )); then
                    highest=$num
                    # Only update if no timestamp branch found yet
                    if [[ -z "$latest_timestamp" ]]; then
                        latest_feature="$name"
                    fi
                fi
            fi
        done

        if [[ -n "$latest_feature" ]]; then
            echo "$latest_feature"
            return
        fi
    fi

    # Final fallback
    echo "main"
}

# Check if the current directory is inside a git repository
test_has_git() {
    git rev-parse --show-toplevel >/dev/null 2>&1
    return $?
}

# Validate that the branch name follows the feature naming convention
test_feature_branch() {
    local branch="$1"
    local has_git="${2:-true}"

    # For non-git repos, we can't enforce branch naming but still provide output
    if [[ "$has_git" != "true" ]]; then
        echo "[specify] Warning: Git repository not detected; skipped branch validation" >&2
        return 0
    fi

    if [[ ! "$branch" =~ ^[0-9]{3}- && ! "$branch" =~ ^[0-9]{8}-[0-9]{6}- ]]; then
        echo "ERROR: Not on a feature branch. Current branch: $branch"
        echo "Feature branches should be named like: 001-feature-name or 20260319-143022-feature-name"
        return 1
    fi
    return 0
}

# Get the feature directory path for a given branch
get_feature_dir() {
    local repo_root="$1"
    local branch="$2"
    echo "$repo_root/.claude/specs/$branch"
}

# Set global variables for all standard feature paths
get_feature_paths_env() {
    REPO_ROOT="$(get_repo_root)"
    CURRENT_BRANCH="$(get_current_branch)"

    if test_has_git; then
        HAS_GIT="true"
    else
        HAS_GIT="false"
    fi

    FEATURE_DIR="$(get_feature_dir "$REPO_ROOT" "$CURRENT_BRANCH")"
    FEATURE_SPEC="$FEATURE_DIR/spec.md"
    IMPL_PLAN="$FEATURE_DIR/plan.md"
    TASKS="$FEATURE_DIR/tasks.md"
    RESEARCH="$FEATURE_DIR/research.md"
    DATA_MODEL="$FEATURE_DIR/data-model.md"
    QUICKSTART="$FEATURE_DIR/quickstart.md"
    CONTRACTS_DIR="$FEATURE_DIR/contracts"
}

# Check if a file exists and print status
test_file_exists() {
    local path="$1"
    local description="$2"

    if [[ -f "$path" ]]; then
        echo "  ✓ $description"
        return 0
    else
        echo "  ✗ $description"
        return 1
    fi
}

# Check if a directory has files and print status
test_dir_has_files() {
    local path="$1"
    local description="$2"

    if [[ -d "$path" ]] && find "$path" -maxdepth 1 -type f | read -r _; then
        echo "  ✓ $description"
        return 0
    else
        echo "  ✗ $description"
        return 1
    fi
}

# Resolve a template name to a file path using the priority stack:
#   1. .claude/specify/templates/overrides/
#   2. .claude/specify/presets/<preset-id>/templates/ (sorted by priority from .registry)
#   3. .claude/specify/extensions/<ext-id>/templates/
#   4. .claude/specify/templates/ (core)
resolve_template() {
    local template_name="$1"
    local repo_root="$2"
    local base="$repo_root/.claude/specify/templates"

    # Priority 1: Project overrides
    local override="$base/overrides/$template_name.md"
    if [[ -f "$override" ]]; then
        echo "$override"
        return
    fi

    # Priority 2: Installed presets (sorted by priority from .registry)
    local presets_dir="$repo_root/.claude/specify/presets"
    if [[ -d "$presets_dir" ]]; then
        local registry_file="$presets_dir/.registry"
        local sorted_presets=()

        if [[ -f "$registry_file" ]]; then
            # Try jq first for proper priority-based sorting
            if command -v jq >/dev/null 2>&1; then
                while IFS= read -r preset_id; do
                    [[ -n "$preset_id" ]] && sorted_presets+=("$preset_id")
                done < <(jq -r '
                    .presets // {} | to_entries
                    | sort_by(.value.priority // 10)
                    | .[].key
                ' "$registry_file" 2>/dev/null)
            fi

            # Fallback: if jq failed or not available, iterate alphabetically
            if [[ ${#sorted_presets[@]} -eq 0 ]]; then
                for preset in "$presets_dir"/*/; do
                    [[ -d "$preset" ]] || continue
                    local name
                    name="$(basename "$preset")"
                    # Skip hidden directories
                    [[ "$name" == .* ]] && continue
                    sorted_presets+=("$name")
                done
            fi
        else
            # No registry: alphabetical directory order
            for preset in "$presets_dir"/*/; do
                [[ -d "$preset" ]] || continue
                local name
                name="$(basename "$preset")"
                [[ "$name" == .* ]] && continue
                sorted_presets+=("$name")
            done
        fi

        for preset_id in "${sorted_presets[@]}"; do
            local candidate="$presets_dir/$preset_id/templates/$template_name.md"
            if [[ -f "$candidate" ]]; then
                echo "$candidate"
                return
            fi
        done
    fi

    # Priority 3: Extension-provided templates
    local ext_dir="$repo_root/.claude/specify/extensions"
    if [[ -d "$ext_dir" ]]; then
        for ext in "$ext_dir"/*/; do
            [[ -d "$ext" ]] || continue
            local name
            name="$(basename "$ext")"
            # Skip hidden directories
            [[ "$name" == .* ]] && continue
            local candidate="$ext/templates/$template_name.md"
            if [[ -f "$candidate" ]]; then
                echo "$candidate"
                return
            fi
        done
    fi

    # Priority 4: Core templates
    local core="$base/$template_name.md"
    if [[ -f "$core" ]]; then
        echo "$core"
        return
    fi

    # Not found
    return 1
}

# Send a phase notification to the walk-the-spec app
send_phase_notify() {
    local command="$1"
    local status="$2"
    local repo_root="$3"

    # Normalize backslashes to forward slashes for the project path
    local project_path="${repo_root//\\//}"

    local payload
    payload=$(printf '{"command":"%s","status":"%s","projectPath":"%s"}' "$command" "$status" "$project_path")

    curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        --connect-timeout 2 \
        --max-time 3 \
        "http://127.0.0.1:3847/notify" \
        >/dev/null 2>&1 || true
}

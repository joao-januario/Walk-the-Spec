#!/usr/bin/env bash
# Create a new feature
# Adapted from github/spec-kit — paths changed to .claude/specs/
set -euo pipefail

# Load common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

# ── Argument parsing ─────────────────────────────────────────────────────────

json=false
short_name=""
number=0
timestamp=false
show_help=false
feature_description=()

while [[ $# -gt 0 ]]; do
    case "$1" in
        --json)
            json=true
            shift
            ;;
        --short-name)
            if [[ $# -lt 2 ]]; then
                echo "Error: --short-name requires a value" >&2
                exit 1
            fi
            short_name="$2"
            shift 2
            ;;
        --number)
            if [[ $# -lt 2 ]]; then
                echo "Error: --number requires a value" >&2
                exit 1
            fi
            number="$2"
            shift 2
            ;;
        --timestamp)
            timestamp=true
            shift
            ;;
        --help)
            show_help=true
            shift
            ;;
        --)
            shift
            feature_description+=("$@")
            break
            ;;
        -*)
            echo "Error: Unknown option: $1" >&2
            exit 1
            ;;
        *)
            feature_description+=("$1")
            shift
            ;;
    esac
done

# ── Help ─────────────────────────────────────────────────────────────────────

if [[ "$show_help" == "true" ]]; then
    echo "Usage: ./create-new-feature.sh [--json] [--short-name <name>] [--number N] [--timestamp] <feature description>"
    echo ""
    echo "Options:"
    echo "  --json               Output in JSON format"
    echo "  --short-name <name>  Provide a custom short name (2-4 words) for the branch"
    echo "  --number N           Specify branch number manually (overrides auto-detection)"
    echo "  --timestamp          Use timestamp prefix (YYYYMMDD-HHMMSS) instead of sequential numbering"
    echo "  --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./create-new-feature.sh 'Add user authentication system' --short-name 'user-auth'"
    echo "  ./create-new-feature.sh 'Implement OAuth2 integration for API'"
    echo "  ./create-new-feature.sh --timestamp --short-name 'user-auth' 'Add user authentication'"
    exit 0
fi

# ── Validate description ────────────────────────────────────────────────────

if [[ ${#feature_description[@]} -eq 0 ]]; then
    echo "Usage: ./create-new-feature.sh [--json] [--short-name <name>] [--number N] [--timestamp] <feature description>" >&2
    exit 1
fi

feature_desc="${feature_description[*]}"
# Trim leading/trailing whitespace
feature_desc="$(echo "$feature_desc" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"

if [[ -z "$feature_desc" ]]; then
    echo "Error: Feature description cannot be empty or contain only whitespace" >&2
    exit 1
fi

# ── Helper functions ─────────────────────────────────────────────────────────

# Walk up from a start directory looking for repository markers (.git or .claude/specify)
find_repository_root() {
    local current
    current="$(cd "$1" && pwd)"
    while true; do
        if [[ -d "$current/.git" || -d "$current/.claude/specify" ]]; then
            echo "$current"
            return 0
        fi
        local parent
        parent="$(dirname "$current")"
        if [[ "$parent" == "$current" ]]; then
            return 1
        fi
        current="$parent"
    done
}

# Scan .claude/specs/ directories for the highest NNN- prefix number
get_highest_number_from_specs() {
    local specs_dir="$1"
    local highest=0

    if [[ -d "$specs_dir" ]]; then
        for dir in "$specs_dir"/*/; do
            [[ -d "$dir" ]] || continue
            local name
            name="$(basename "$dir")"
            if [[ "$name" =~ ^([0-9]{3})- ]]; then
                local num=$((10#${BASH_REMATCH[1]}))
                if (( num > highest )); then
                    highest=$num
                fi
            fi
        done
    fi
    echo "$highest"
}

# Parse git branch -a output for the highest NNN- prefix number
get_highest_number_from_branches() {
    local highest=0
    local branches
    branches="$(git branch -a 2>/dev/null)" || true

    if [[ -n "$branches" ]]; then
        while IFS= read -r branch; do
            # Strip leading whitespace, asterisk, and remote prefix
            local clean_branch
            clean_branch="$(echo "$branch" | sed 's/^[[:space:]]*\*\?[[:space:]]*//' | sed 's|^remotes/[^/]*/||')"
            if [[ "$clean_branch" =~ ^([0-9]{3})- ]]; then
                local num=$((10#${BASH_REMATCH[1]}))
                if (( num > highest )); then
                    highest=$num
                fi
            fi
        done <<< "$branches"
    fi
    echo "$highest"
}

# Fetch all remotes, then return max(branches, specs) + 1
get_next_branch_number() {
    local specs_dir="$1"

    git fetch --all --prune >/dev/null 2>&1 || true

    local highest_branch highest_spec max_num
    highest_branch="$(get_highest_number_from_branches)"
    highest_spec="$(get_highest_number_from_specs "$specs_dir")"

    if (( highest_branch > highest_spec )); then
        max_num=$highest_branch
    else
        max_num=$highest_spec
    fi
    echo $(( max_num + 1 ))
}

# Lowercase, replace non-alphanumeric with -, collapse multiple dashes, trim leading/trailing dashes
clean_branch_name() {
    local name="$1"
    echo "$name" \
        | tr '[:upper:]' '[:lower:]' \
        | sed 's/[^a-z0-9]/-/g' \
        | sed 's/-\{2,\}/-/g' \
        | sed 's/^-//' \
        | sed 's/-$//'
}

# Generate a branch name suffix from a description using stop word filtering
get_branch_name() {
    local description="$1"

    local stop_words=(
        i a an the to for of in on at by with from
        is are was were be been being have has had
        do does did will would should could can may might must shall
        this that these those my your our their
        want need add get set
    )

    # Lowercase and replace non-alphanumeric (except space) with space
    local clean_name
    clean_name="$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]/ /g')"

    # Split into words
    local words=()
    read -ra words <<< "$clean_name"

    # Filter meaningful words
    local meaningful_words=()
    for word in "${words[@]}"; do
        [[ -z "$word" ]] && continue

        # Check if word is a stop word
        local is_stop=false
        for sw in "${stop_words[@]}"; do
            if [[ "$word" == "$sw" ]]; then
                is_stop=true
                break
            fi
        done
        if [[ "$is_stop" == "true" ]]; then
            continue
        fi

        # Keep words with 3+ characters, or short words that appear as uppercase in original
        if (( ${#word} >= 3 )); then
            meaningful_words+=("$word")
        else
            local upper_word
            upper_word="$(echo "$word" | tr '[:lower:]' '[:upper:]')"
            # Check if the uppercase version appears as a whole word in the original description
            if echo "$description" | grep -qw "$upper_word" 2>/dev/null; then
                meaningful_words+=("$word")
            fi
        fi
    done

    if (( ${#meaningful_words[@]} > 0 )); then
        local max_words=3
        if (( ${#meaningful_words[@]} == 4 )); then
            max_words=4
        fi
        local result_words=("${meaningful_words[@]:0:$max_words}")
        local IFS='-'
        echo "${result_words[*]}"
    else
        # Fallback: clean the full description and take first 3 words
        local cleaned
        cleaned="$(clean_branch_name "$description")"
        local fallback_words=()
        IFS='-' read -ra fallback_words <<< "$cleaned"
        local trimmed=()
        local count=0
        for fw in "${fallback_words[@]}"; do
            [[ -z "$fw" ]] && continue
            trimmed+=("$fw")
            (( ++count >= 3 )) && break
        done
        local IFS='-'
        echo "${trimmed[*]}"
    fi
}

# ── Resolve repository root ─────────────────────────────────────────────────

fallback_root="$(find_repository_root "$SCRIPT_DIR")" || true
if [[ -z "${fallback_root:-}" ]]; then
    echo "Error: Could not determine repository root." >&2
    exit 1
fi

has_git=false
repo_root=""
if repo_root="$(git rev-parse --show-toplevel 2>/dev/null)"; then
    has_git=true
else
    repo_root="$fallback_root"
    has_git=false
fi

cd "$repo_root"

specs_dir="$repo_root/.claude/specs"
mkdir -p "$specs_dir"

# ── Generate branch name ────────────────────────────────────────────────────

if [[ -n "$short_name" ]]; then
    branch_suffix="$(clean_branch_name "$short_name")"
else
    branch_suffix="$(get_branch_name "$feature_desc")"
fi

# Warn if both --number and --timestamp are specified
if [[ "$timestamp" == "true" && "$number" -ne 0 ]]; then
    echo "[specify] Warning: --number is ignored when --timestamp is used" >&2
    number=0
fi

# Determine branch prefix
if [[ "$timestamp" == "true" ]]; then
    feature_num="$(date '+%Y%m%d-%H%M%S')"
    branch_name="${feature_num}-${branch_suffix}"
else
    if [[ "$number" -eq 0 ]]; then
        if [[ "$has_git" == "true" ]]; then
            number="$(get_next_branch_number "$specs_dir")"
        else
            number=$(( $(get_highest_number_from_specs "$specs_dir") + 1 ))
        fi
    fi
    feature_num="$(printf '%03d' "$number")"
    branch_name="${feature_num}-${branch_suffix}"
fi

# ── GitHub 244-byte branch name limit ────────────────────────────────────────

max_branch_length=244
if (( ${#branch_name} > max_branch_length )); then
    prefix_length=$(( ${#feature_num} + 1 ))
    max_suffix_length=$(( max_branch_length - prefix_length ))
    truncated_suffix="${branch_suffix:0:$max_suffix_length}"
    # Remove trailing dash from truncated suffix
    truncated_suffix="${truncated_suffix%-}"
    original_branch_name="$branch_name"
    branch_name="${feature_num}-${truncated_suffix}"
    echo "[specify] Branch name exceeded GitHub's 244-byte limit" >&2
    echo "[specify] Original: $original_branch_name (${#original_branch_name} bytes)" >&2
    echo "[specify] Truncated to: $branch_name (${#branch_name} bytes)" >&2
fi

# ── Create git branch ───────────────────────────────────────────────────────

if [[ "$has_git" == "true" ]]; then
    branch_created=false
    if git checkout -q -b "$branch_name" 2>/dev/null; then
        branch_created=true
    fi

    if [[ "$branch_created" != "true" ]]; then
        existing_branch="$(git branch --list "$branch_name" 2>/dev/null)"
        if [[ -n "$existing_branch" ]]; then
            if [[ "$timestamp" == "true" ]]; then
                echo "Error: Branch '$branch_name' already exists. Rerun to get a new timestamp or use a different --short-name." >&2
            else
                echo "Error: Branch '$branch_name' already exists. Please use a different feature name or specify a different number with --number." >&2
            fi
            exit 1
        else
            echo "Error: Failed to create git branch '$branch_name'. Please check your git configuration and try again." >&2
            exit 1
        fi
    fi
else
    echo "[specify] Warning: Git repository not detected; skipped branch creation for $branch_name" >&2
fi

# ── Create feature directory and spec file ───────────────────────────────────

feature_dir="$specs_dir/$branch_name"
mkdir -p "$feature_dir"

template="$(resolve_template 'spec-template' "$repo_root")" || true
spec_file="$feature_dir/spec.md"

if [[ -n "${template:-}" && -f "$template" ]]; then
    cp "$template" "$spec_file"
else
    touch "$spec_file"
fi

# ── Set SPECIFY_FEATURE env var ──────────────────────────────────────────────

export SPECIFY_FEATURE="$branch_name"

# ── Output ───────────────────────────────────────────────────────────────────

if [[ "$json" == "true" ]]; then
    # Escape any special characters in values for JSON safety
    printf '{"BRANCH_NAME":"%s","SPEC_FILE":"%s","FEATURE_NUM":"%s","HAS_GIT":%s}\n' \
        "$branch_name" "$spec_file" "$feature_num" "$has_git"
else
    echo "BRANCH_NAME: $branch_name"
    echo "SPEC_FILE: $spec_file"
    echo "FEATURE_NUM: $feature_num"
    echo "HAS_GIT: $has_git"
    echo "SPECIFY_FEATURE environment variable set to: $branch_name"
fi

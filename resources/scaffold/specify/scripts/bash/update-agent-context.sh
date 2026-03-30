#!/usr/bin/env bash
#
# Update agent context files with information from plan.md (bash version)
# Adapted from github/spec-kit
#
# Usage:
#   ./update-agent-context.sh [--agent-type <type>]
#
# If --agent-type is omitted, updates all existing agent files.

set -euo pipefail

# Import common helpers
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

# ── Argument parsing ────────────────────────────────────────────────────────

VALID_AGENT_TYPES=(
    claude gemini copilot cursor-agent qwen opencode codex windsurf junie
    kilocode auggie roo codebuddy amp shai tabnine kiro-cli agy bob
    qodercli vibe kimi trae pi iflow generic
)

AGENT_TYPE=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --agent-type)
            if [[ -z "${2:-}" ]]; then
                echo "ERROR: --agent-type requires a value" >&2
                exit 1
            fi
            AGENT_TYPE="$2"
            shift 2
            ;;
        *)
            echo "ERROR: Unknown argument: $1" >&2
            exit 1
            ;;
    esac
done

# Validate agent type if provided
if [[ -n "$AGENT_TYPE" ]]; then
    valid=false
    for t in "${VALID_AGENT_TYPES[@]}"; do
        if [[ "$t" == "$AGENT_TYPE" ]]; then
            valid=true
            break
        fi
    done
    if [[ "$valid" != "true" ]]; then
        echo "ERROR: Invalid agent type '$AGENT_TYPE'. Valid types: ${VALID_AGENT_TYPES[*]}" >&2
        exit 1
    fi
fi

# ── Acquire environment paths ──────────────────────────────────────────────

get_feature_paths_env
NEW_PLAN="$IMPL_PLAN"

# ── Agent file paths ───────────────────────────────────────────────────────

CLAUDE_FILE="$REPO_ROOT/CLAUDE.md"
GEMINI_FILE="$REPO_ROOT/GEMINI.md"
COPILOT_FILE="$REPO_ROOT/.github/agents/copilot-instructions.md"
CURSOR_FILE="$REPO_ROOT/.cursor/rules/specify-rules.mdc"
QWEN_FILE="$REPO_ROOT/QWEN.md"
AGENTS_FILE="$REPO_ROOT/AGENTS.md"
WINDSURF_FILE="$REPO_ROOT/.windsurf/rules/specify-rules.md"
JUNIE_FILE="$REPO_ROOT/.junie/AGENTS.md"
KILOCODE_FILE="$REPO_ROOT/.kilocode/rules/specify-rules.md"
AUGGIE_FILE="$REPO_ROOT/.augment/rules/specify-rules.md"
ROO_FILE="$REPO_ROOT/.roo/rules/specify-rules.md"
CODEBUDDY_FILE="$REPO_ROOT/CODEBUDDY.md"
QODER_FILE="$REPO_ROOT/QODER.md"
AMP_FILE="$REPO_ROOT/AGENTS.md"
SHAI_FILE="$REPO_ROOT/SHAI.md"
TABNINE_FILE="$REPO_ROOT/TABNINE.md"
KIRO_FILE="$REPO_ROOT/AGENTS.md"
AGY_FILE="$REPO_ROOT/.agent/rules/specify-rules.md"
BOB_FILE="$REPO_ROOT/AGENTS.md"
VIBE_FILE="$REPO_ROOT/.vibe/agents/specify-agents.md"
KIMI_FILE="$REPO_ROOT/KIMI.md"
TRAE_FILE="$REPO_ROOT/.trae/rules/AGENTS.md"
IFLOW_FILE="$REPO_ROOT/IFLOW.md"

TEMPLATE_FILE="$REPO_ROOT/.claude/specify/templates/agent-file-template.md"

# ── Parsed plan data placeholders ──────────────────────────────────────────

NEW_LANG=""
NEW_FRAMEWORK=""
NEW_DB=""
NEW_PROJECT_TYPE=""

# ── Logging helpers ────────────────────────────────────────────────────────

write_info()    { echo "INFO: $1"; }
write_success() { echo "✓ $1"; }
write_warning() { echo "WARNING: $1" >&2; }
write_err()     { echo "ERROR: $1" >&2; }

# ── validate_environment ───────────────────────────────────────────────────

validate_environment() {
    if [[ -z "$CURRENT_BRANCH" ]]; then
        write_err "Unable to determine current feature"
        if [[ "$HAS_GIT" == "true" ]]; then
            write_info "Make sure you're on a feature branch"
        else
            write_info "Set SPECIFY_FEATURE environment variable or create a feature first"
        fi
        exit 1
    fi
    if [[ ! -f "$NEW_PLAN" ]]; then
        write_err "No plan.md found at $NEW_PLAN"
        write_info "Ensure you are working on a feature with a corresponding spec directory"
        if [[ "$HAS_GIT" != "true" ]]; then
            write_info 'Use: export SPECIFY_FEATURE=your-feature-name or create a new feature first'
        fi
        exit 1
    fi
    if [[ ! -f "$TEMPLATE_FILE" ]]; then
        write_err "Template file not found at $TEMPLATE_FILE"
        write_info "Ensure .claude/specify/templates/agent-file-template.md exists."
        exit 1
    fi
}

# ── extract_plan_field ─────────────────────────────────────────────────────
# Grep for **FieldName**: value pattern in plan.md

extract_plan_field() {
    local field_pattern="$1"
    local plan_file="$2"

    [[ -f "$plan_file" ]] || return 0

    # Escape regex special chars in field_pattern for grep
    local escaped
    escaped=$(printf '%s' "$field_pattern" | sed 's/[.[\*^$()+?{|\\]/\\&/g')

    local val
    val=$(grep -oP "^\*\*${escaped}\*\*: \K.+" "$plan_file" 2>/dev/null | head -n 1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    if [[ -n "$val" && "$val" != "NEEDS CLARIFICATION" && "$val" != "N/A" ]]; then
        echo "$val"
    fi
}

# ── extract_prose_field ────────────────────────────────────────────────────
# Scan the Technical Approach section for a regex match

extract_prose_field() {
    local pattern="$1"
    local plan_file="$2"

    [[ -f "$plan_file" ]] || return 0

    local in_section=false
    while IFS= read -r line; do
        if [[ "$line" =~ ^##[[:space:]]Technical[[:space:]]Approach ]]; then
            in_section=true
            continue
        fi
        if [[ "$in_section" == true && "$line" =~ ^##[[:space:]] ]]; then
            in_section=false
            continue
        fi
        if [[ "$in_section" == true ]]; then
            local match
            match=$(echo "$line" | grep -oP "$pattern" 2>/dev/null | head -n 1)
            if [[ -n "$match" ]]; then
                echo "$match"
                return 0
            fi
        fi
    done < "$plan_file"
}

# ── parse_plan_data ────────────────────────────────────────────────────────

parse_plan_data() {
    local plan_file="$1"

    if [[ ! -f "$plan_file" ]]; then
        write_err "Plan file not found: $plan_file"
        return 1
    fi

    write_info "Parsing plan data from $plan_file"

    # Try old key-value format first
    NEW_LANG=$(extract_plan_field "Language/Version" "$plan_file")
    NEW_FRAMEWORK=$(extract_plan_field "Primary Dependencies" "$plan_file")
    NEW_DB=$(extract_plan_field "Storage" "$plan_file")
    NEW_PROJECT_TYPE=$(extract_plan_field "Project Type" "$plan_file")

    # Fallback: extract from Technical Approach prose if key-value not found
    if [[ -z "$NEW_LANG" ]]; then
        local match
        match=$(extract_prose_field 'TypeScript\s+\d+\.\w+' "$plan_file")
        if [[ -z "$match" ]]; then match=$(extract_prose_field 'Python\s+\d+\.\d+' "$plan_file"); fi
        if [[ -z "$match" ]]; then match=$(extract_prose_field 'Rust\s+\d+\.\d+' "$plan_file"); fi
        if [[ -z "$match" ]]; then match=$(extract_prose_field 'Go\s+\d+\.\d+' "$plan_file"); fi
        if [[ -n "$match" ]]; then NEW_LANG="$match"; fi
    fi

    if [[ -z "$NEW_FRAMEWORK" ]]; then
        local match
        match=$(extract_prose_field '(React\s+\d+|Express|FastAPI|Django|Next\.js|Vue\s+\d+|Angular\s+\d+|Electron|Flask|Spring\s+Boot)' "$plan_file")
        if [[ -n "$match" ]]; then NEW_FRAMEWORK="$match"; fi
    fi

    if [[ -n "$NEW_LANG" ]]; then write_info "Found language: $NEW_LANG"; else write_warning "No language information found in plan"; fi
    if [[ -n "$NEW_FRAMEWORK" ]]; then write_info "Found framework: $NEW_FRAMEWORK"; fi
    if [[ -n "$NEW_DB" && "$NEW_DB" != "N/A" ]]; then write_info "Found database: $NEW_DB"; fi
    if [[ -n "$NEW_PROJECT_TYPE" ]]; then write_info "Found project type: $NEW_PROJECT_TYPE"; fi

    return 0
}

# ── format_technology_stack ────────────────────────────────────────────────

format_technology_stack() {
    local lang="$1"
    local framework="$2"
    local parts=()

    if [[ -n "$lang" && "$lang" != "NEEDS CLARIFICATION" ]]; then
        parts+=("$lang")
    fi
    if [[ -n "$framework" && "$framework" != "NEEDS CLARIFICATION" && "$framework" != "N/A" ]]; then
        parts+=("$framework")
    fi

    if [[ ${#parts[@]} -eq 0 ]]; then
        echo ""
        return
    fi

    local IFS=" + "
    echo "${parts[*]}"
}

# ── get_project_structure ──────────────────────────────────────────────────

get_project_structure() {
    local project_type="$1"
    if [[ "$project_type" =~ web ]]; then
        printf 'backend/\nfrontend/\ntests/'
    else
        printf 'src/\ntests/'
    fi
}

# ── get_commands_for_language ──────────────────────────────────────────────

get_commands_for_language() {
    local lang="$1"
    if [[ "$lang" =~ Python ]]; then
        echo "cd src; pytest; ruff check ."
    elif [[ "$lang" =~ Rust ]]; then
        echo "cargo test; cargo clippy"
    elif [[ "$lang" =~ (JavaScript|TypeScript) ]]; then
        echo "npm test; npm run lint"
    else
        echo "# Add commands for $lang"
    fi
}

# ── get_language_conventions ───────────────────────────────────────────────

get_language_conventions() {
    local lang="$1"
    if [[ -n "$lang" ]]; then
        echo "${lang}: Follow standard conventions"
    else
        echo "General: Follow standard conventions"
    fi
}

# ── new_agent_file ─────────────────────────────────────────────────────────
# Copy template, sed-replace placeholders, write to target

new_agent_file() {
    local target_file="$1"
    local project_name="$2"
    local date_str="$3"

    if [[ ! -f "$TEMPLATE_FILE" ]]; then
        write_err "Template not found at $TEMPLATE_FILE"
        return 1
    fi

    local tmpfile
    tmpfile=$(mktemp)
    cp "$TEMPLATE_FILE" "$tmpfile"

    local project_structure commands language_conventions
    project_structure=$(get_project_structure "$NEW_PROJECT_TYPE")
    commands=$(get_commands_for_language "$NEW_LANG")
    language_conventions=$(get_language_conventions "$NEW_LANG")

    # Build technology stack entry for template
    local tech_stack_template=""
    if [[ -n "$NEW_LANG" && -n "$NEW_FRAMEWORK" ]]; then
        tech_stack_template="- $NEW_LANG + $NEW_FRAMEWORK ($CURRENT_BRANCH)"
    elif [[ -n "$NEW_LANG" ]]; then
        tech_stack_template="- $NEW_LANG ($CURRENT_BRANCH)"
    elif [[ -n "$NEW_FRAMEWORK" ]]; then
        tech_stack_template="- $NEW_FRAMEWORK ($CURRENT_BRANCH)"
    fi

    # Build recent changes entry for template
    local recent_changes_template=""
    if [[ -n "$NEW_LANG" && -n "$NEW_FRAMEWORK" ]]; then
        recent_changes_template="- ${CURRENT_BRANCH}: Added ${NEW_LANG} + ${NEW_FRAMEWORK}"
    elif [[ -n "$NEW_LANG" ]]; then
        recent_changes_template="- ${CURRENT_BRANCH}: Added ${NEW_LANG}"
    elif [[ -n "$NEW_FRAMEWORK" ]]; then
        recent_changes_template="- ${CURRENT_BRANCH}: Added ${NEW_FRAMEWORK}"
    fi

    # Escape sed replacement strings (handle &, /, \, newlines)
    _sed_escape() { printf '%s' "$1" | sed -e 's/[&/\]/\\&/g'; }

    local esc_project_name esc_date esc_tech_stack esc_structure esc_commands esc_conventions esc_changes
    esc_project_name=$(_sed_escape "$project_name")
    esc_date=$(_sed_escape "$date_str")
    esc_tech_stack=$(_sed_escape "$tech_stack_template")
    esc_structure=$(_sed_escape "$project_structure")
    esc_commands=$(_sed_escape "$commands")
    esc_conventions=$(_sed_escape "$language_conventions")
    esc_changes=$(_sed_escape "$recent_changes_template")

    sed -i \
        -e "s/\[PROJECT NAME\]/${esc_project_name}/g" \
        -e "s/\[DATE\]/${esc_date}/g" \
        -e "s/\[EXTRACTED FROM ALL PLAN\.MD FILES\]/${esc_tech_stack}/g" \
        -e "s/\[ACTUAL STRUCTURE FROM PLANS\]/${esc_structure}/g" \
        -e "s/\[ONLY COMMANDS FOR ACTIVE TECHNOLOGIES\]/${esc_commands}/g" \
        -e "s/\[LANGUAGE-SPECIFIC, ONLY FOR LANGUAGES IN USE\]/${esc_conventions}/g" \
        -e "s/\[LAST 3 FEATURES AND WHAT THEY ADDED\]/${esc_changes}/g" \
        "$tmpfile"

    # Replace literal \n with actual newlines
    sed -i 's/\\n/\n/g' "$tmpfile"

    # Handle .mdc files (Cursor): prepend YAML frontmatter
    if [[ "$target_file" == *.mdc ]]; then
        local frontmatter_file
        frontmatter_file=$(mktemp)
        printf '%s\n' '---' 'description: Project Development Guidelines' 'globs: ["**/*"]' 'alwaysApply: true' '---' '' > "$frontmatter_file"
        cat "$tmpfile" >> "$frontmatter_file"
        mv "$frontmatter_file" "$tmpfile"
    fi

    # Ensure parent directory exists
    local parent_dir
    parent_dir=$(dirname "$target_file")
    mkdir -p "$parent_dir"

    mv "$tmpfile" "$target_file"
    return 0
}

# ── update_existing_agent_file ─────────────────────────────────────────────
# Parse existing file line by line, insert new tech entries under
# ## Active Technologies, insert change entry under ## Recent Changes
# (keep max 3), update last-updated date. Uses temp file approach.

update_existing_agent_file() {
    local target_file="$1"
    local date_str="$2"

    # If file doesn't exist, create new
    if [[ ! -f "$target_file" ]]; then
        local project_name
        project_name=$(basename "$REPO_ROOT")
        new_agent_file "$target_file" "$project_name" "$date_str"
        return $?
    fi

    local tech_stack
    tech_stack=$(format_technology_stack "$NEW_LANG" "$NEW_FRAMEWORK")

    # Build list of new tech entries to add
    local new_tech_entries=()
    if [[ -n "$tech_stack" ]]; then
        # Check if this tech stack is already mentioned in the file
        local escaped_tech
        escaped_tech=$(printf '%s' "$tech_stack" | sed 's/[.[\*^$()+?{|\\]/\\&/g')
        if ! grep -qF "$tech_stack" "$target_file" 2>/dev/null; then
            new_tech_entries+=("- $tech_stack ($CURRENT_BRANCH)")
        fi
    fi
    if [[ -n "$NEW_DB" && "$NEW_DB" != "N/A" && "$NEW_DB" != "NEEDS CLARIFICATION" ]]; then
        if ! grep -qF "$NEW_DB" "$target_file" 2>/dev/null; then
            new_tech_entries+=("- $NEW_DB ($CURRENT_BRANCH)")
        fi
    fi

    # Build the new change entry
    local new_change_entry=""
    if [[ -n "$tech_stack" ]]; then
        new_change_entry="- ${CURRENT_BRANCH}: Added ${tech_stack}"
    elif [[ -n "$NEW_DB" && "$NEW_DB" != "N/A" && "$NEW_DB" != "NEEDS CLARIFICATION" ]]; then
        new_change_entry="- ${CURRENT_BRANCH}: Added ${NEW_DB}"
    fi

    # Line-by-line processing: read from original, write to temp
    local tmpfile
    tmpfile=$(mktemp)

    local in_tech=false
    local in_changes=false
    local tech_added=false
    local change_added=false
    local existing_changes=0

    while IFS= read -r line || [[ -n "$line" ]]; do
        # Detect ## Active Technologies heading
        if [[ "$line" == "## Active Technologies" ]]; then
            echo "$line" >> "$tmpfile"
            in_tech=true
            continue
        fi

        # In tech section and hit another ## heading — flush pending tech entries first
        if [[ "$in_tech" == true && "$line" =~ ^##[[:space:]] ]]; then
            if [[ "$tech_added" == false && ${#new_tech_entries[@]} -gt 0 ]]; then
                for entry in "${new_tech_entries[@]}"; do
                    echo "$entry" >> "$tmpfile"
                done
                tech_added=true
            fi
            echo "$line" >> "$tmpfile"
            in_tech=false
            continue
        fi

        # In tech section and hit a blank line — insert entries before the blank
        if [[ "$in_tech" == true && -z "${line// /}" ]]; then
            if [[ "$tech_added" == false && ${#new_tech_entries[@]} -gt 0 ]]; then
                for entry in "${new_tech_entries[@]}"; do
                    echo "$entry" >> "$tmpfile"
                done
                tech_added=true
            fi
            echo "$line" >> "$tmpfile"
            continue
        fi

        # Detect ## Recent Changes heading
        if [[ "$line" == "## Recent Changes" ]]; then
            echo "$line" >> "$tmpfile"
            if [[ -n "$new_change_entry" ]]; then
                echo "$new_change_entry" >> "$tmpfile"
                change_added=true
            fi
            in_changes=true
            continue
        fi

        # In changes section and hit another ## heading
        if [[ "$in_changes" == true && "$line" =~ ^##[[:space:]] ]]; then
            echo "$line" >> "$tmpfile"
            in_changes=false
            continue
        fi

        # In changes section and hit an existing change entry — keep max 2 old ones (new + 2 = 3 total)
        if [[ "$in_changes" == true && "$line" =~ ^-[[:space:]] ]]; then
            if (( existing_changes < 2 )); then
                echo "$line" >> "$tmpfile"
                (( existing_changes++ ))
            fi
            continue
        fi

        # Update last-updated date
        if [[ "$line" =~ [0-9]{4}-[0-9]{2}-[0-9]{2} ]] && echo "$line" | grep -qP '(\*\*)?Last updated(\*\*)?: '; then
            local updated_line
            updated_line=$(echo "$line" | sed -E "s/[0-9]{4}-[0-9]{2}-[0-9]{2}/${date_str}/g")
            echo "$updated_line" >> "$tmpfile"
            continue
        fi

        # Default: pass through
        echo "$line" >> "$tmpfile"
    done < "$target_file"

    # If we were still in tech section at EOF and haven't added entries
    if [[ "$in_tech" == true && "$tech_added" == false && ${#new_tech_entries[@]} -gt 0 ]]; then
        for entry in "${new_tech_entries[@]}"; do
            echo "$entry" >> "$tmpfile"
        done
    fi

    # Handle .mdc files (Cursor): prepend YAML frontmatter if missing
    if [[ "$target_file" == *.mdc ]]; then
        local first_line
        first_line=$(head -n 1 "$tmpfile")
        if [[ "$first_line" != "---" ]]; then
            local frontmatter_file
            frontmatter_file=$(mktemp)
            printf '%s\n' '---' 'description: Project Development Guidelines' 'globs: ["**/*"]' 'alwaysApply: true' '---' '' > "$frontmatter_file"
            cat "$tmpfile" >> "$frontmatter_file"
            mv "$frontmatter_file" "$tmpfile"
        fi
    fi

    mv "$tmpfile" "$target_file"
    return 0
}

# ── update_agent_file ──────────────────────────────────────────────────────

update_agent_file() {
    local target_file="$1"
    local agent_name="$2"

    if [[ -z "$target_file" || -z "$agent_name" ]]; then
        write_err "update_agent_file requires target_file and agent_name"
        return 1
    fi

    write_info "Updating $agent_name context file: $target_file"

    local project_name
    project_name=$(basename "$REPO_ROOT")
    local date_str
    date_str=$(date '+%Y-%m-%d')

    # Ensure parent directory exists
    local dir
    dir=$(dirname "$target_file")
    mkdir -p "$dir"

    if [[ ! -f "$target_file" ]]; then
        if new_agent_file "$target_file" "$project_name" "$date_str"; then
            write_success "Created new $agent_name context file"
        else
            write_err "Failed to create new agent file"
            return 1
        fi
    else
        if update_existing_agent_file "$target_file" "$date_str"; then
            write_success "Updated existing $agent_name context file"
        else
            write_err "Failed to update agent file"
            return 1
        fi
    fi

    return 0
}

# ── update_specific_agent ─────────────────────────────────────────────────

update_specific_agent() {
    local agent_type="$1"

    case "$agent_type" in
        claude)       update_agent_file "$CLAUDE_FILE"    "Claude Code" ;;
        gemini)       update_agent_file "$GEMINI_FILE"    "Gemini CLI" ;;
        copilot)      update_agent_file "$COPILOT_FILE"   "GitHub Copilot" ;;
        cursor-agent) update_agent_file "$CURSOR_FILE"    "Cursor IDE" ;;
        qwen)         update_agent_file "$QWEN_FILE"      "Qwen Code" ;;
        opencode)     update_agent_file "$AGENTS_FILE"    "opencode" ;;
        codex)        update_agent_file "$AGENTS_FILE"    "Codex CLI" ;;
        windsurf)     update_agent_file "$WINDSURF_FILE"  "Windsurf" ;;
        junie)        update_agent_file "$JUNIE_FILE"     "Junie" ;;
        kilocode)     update_agent_file "$KILOCODE_FILE"  "Kilo Code" ;;
        auggie)       update_agent_file "$AUGGIE_FILE"    "Auggie CLI" ;;
        roo)          update_agent_file "$ROO_FILE"       "Roo Code" ;;
        codebuddy)    update_agent_file "$CODEBUDDY_FILE" "CodeBuddy CLI" ;;
        qodercli)     update_agent_file "$QODER_FILE"     "Qoder CLI" ;;
        amp)          update_agent_file "$AMP_FILE"       "Amp" ;;
        shai)         update_agent_file "$SHAI_FILE"      "SHAI" ;;
        tabnine)      update_agent_file "$TABNINE_FILE"   "Tabnine CLI" ;;
        kiro-cli)     update_agent_file "$KIRO_FILE"      "Kiro CLI" ;;
        agy)          update_agent_file "$AGY_FILE"       "Antigravity" ;;
        bob)          update_agent_file "$BOB_FILE"       "IBM Bob" ;;
        vibe)         update_agent_file "$VIBE_FILE"      "Mistral Vibe" ;;
        kimi)         update_agent_file "$KIMI_FILE"      "Kimi Code" ;;
        trae)         update_agent_file "$TRAE_FILE"      "Trae" ;;
        pi)           update_agent_file "$AGENTS_FILE"    "Pi Coding Agent" ;;
        iflow)        update_agent_file "$IFLOW_FILE"     "iFlow CLI" ;;
        generic)      write_info "Generic agent: no predefined context file." ;;
        *)
            write_err "Unknown agent type '$agent_type'"
            return 1
            ;;
    esac
}

# ── update_all_existing_agents ─────────────────────────────────────────────

update_all_existing_agents() {
    local found=false
    local ok=true

    # Note: AMP_FILE, KIRO_FILE, BOB_FILE all map to AGENTS_FILE, so we only
    # check AGENTS_FILE once (via the codex/opencode entry), same as the PS script.
    if [[ -f "$CLAUDE_FILE" ]];   then update_agent_file "$CLAUDE_FILE"    "Claude Code"    || ok=false; found=true; fi
    if [[ -f "$GEMINI_FILE" ]];   then update_agent_file "$GEMINI_FILE"    "Gemini CLI"     || ok=false; found=true; fi
    if [[ -f "$COPILOT_FILE" ]];  then update_agent_file "$COPILOT_FILE"   "GitHub Copilot" || ok=false; found=true; fi
    if [[ -f "$CURSOR_FILE" ]];   then update_agent_file "$CURSOR_FILE"    "Cursor IDE"     || ok=false; found=true; fi
    if [[ -f "$QWEN_FILE" ]];     then update_agent_file "$QWEN_FILE"      "Qwen Code"      || ok=false; found=true; fi
    if [[ -f "$AGENTS_FILE" ]];   then update_agent_file "$AGENTS_FILE"    "Codex/opencode"  || ok=false; found=true; fi
    if [[ -f "$WINDSURF_FILE" ]]; then update_agent_file "$WINDSURF_FILE"  "Windsurf"       || ok=false; found=true; fi
    if [[ -f "$JUNIE_FILE" ]];    then update_agent_file "$JUNIE_FILE"     "Junie"          || ok=false; found=true; fi
    if [[ -f "$KILOCODE_FILE" ]]; then update_agent_file "$KILOCODE_FILE"  "Kilo Code"      || ok=false; found=true; fi
    if [[ -f "$AUGGIE_FILE" ]];   then update_agent_file "$AUGGIE_FILE"    "Auggie CLI"     || ok=false; found=true; fi
    if [[ -f "$ROO_FILE" ]];      then update_agent_file "$ROO_FILE"       "Roo Code"       || ok=false; found=true; fi
    if [[ -f "$CODEBUDDY_FILE" ]]; then update_agent_file "$CODEBUDDY_FILE" "CodeBuddy CLI" || ok=false; found=true; fi
    if [[ -f "$QODER_FILE" ]];    then update_agent_file "$QODER_FILE"     "Qoder CLI"      || ok=false; found=true; fi
    if [[ -f "$SHAI_FILE" ]];     then update_agent_file "$SHAI_FILE"      "SHAI"           || ok=false; found=true; fi
    if [[ -f "$TABNINE_FILE" ]];  then update_agent_file "$TABNINE_FILE"   "Tabnine CLI"    || ok=false; found=true; fi
    if [[ -f "$KIRO_FILE" ]];     then update_agent_file "$KIRO_FILE"      "Kiro CLI"       || ok=false; found=true; fi
    if [[ -f "$AGY_FILE" ]];      then update_agent_file "$AGY_FILE"       "Antigravity"    || ok=false; found=true; fi
    if [[ -f "$BOB_FILE" ]];      then update_agent_file "$BOB_FILE"       "IBM Bob"        || ok=false; found=true; fi
    if [[ -f "$VIBE_FILE" ]];     then update_agent_file "$VIBE_FILE"      "Mistral Vibe"   || ok=false; found=true; fi
    if [[ -f "$KIMI_FILE" ]];     then update_agent_file "$KIMI_FILE"      "Kimi Code"      || ok=false; found=true; fi
    if [[ -f "$TRAE_FILE" ]];     then update_agent_file "$TRAE_FILE"      "Trae"           || ok=false; found=true; fi
    if [[ -f "$IFLOW_FILE" ]];    then update_agent_file "$IFLOW_FILE"     "iFlow CLI"      || ok=false; found=true; fi

    if [[ "$found" == false ]]; then
        write_info "No existing agent files found, creating default Claude file..."
        update_agent_file "$CLAUDE_FILE" "Claude Code" || ok=false
    fi

    if [[ "$ok" == true ]]; then
        return 0
    else
        return 1
    fi
}

# ── print_summary ─────────────────────────────────────────────────────────

print_summary() {
    echo ""
    write_info "Summary of changes:"
    if [[ -n "$NEW_LANG" ]];                              then echo "  - Added language: $NEW_LANG"; fi
    if [[ -n "$NEW_FRAMEWORK" ]];                         then echo "  - Added framework: $NEW_FRAMEWORK"; fi
    if [[ -n "$NEW_DB" && "$NEW_DB" != "N/A" ]];         then echo "  - Added database: $NEW_DB"; fi
    echo ""
}

# ── main ───────────────────────────────────────────────────────────────────

main() {
    validate_environment

    write_info "=== Updating agent context files for feature $CURRENT_BRANCH ==="

    if ! parse_plan_data "$NEW_PLAN"; then
        write_err "Failed to parse plan data"
        exit 1
    fi

    local success=true

    if [[ -n "$AGENT_TYPE" ]]; then
        write_info "Updating specific agent: $AGENT_TYPE"
        if ! update_specific_agent "$AGENT_TYPE"; then
            success=false
        fi
    else
        write_info "No agent specified, updating all existing agent files..."
        if ! update_all_existing_agents; then
            success=false
        fi
    fi

    print_summary

    if [[ "$success" == true ]]; then
        write_success "Agent context update completed successfully"
        exit 0
    else
        write_err "Agent context update completed with errors"
        exit 1
    fi
}

main

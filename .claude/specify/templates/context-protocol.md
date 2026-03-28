## Context Protocol

**This section is mandatory for the main session. Follow it before every codebase interaction.**

**Exception — sub-agents**: If you were spawned as a sub-agent with an explicit file list and inline data (diffs, context) already in your prompt, skip step 1. The orchestrator already read the map and passed you what you need — reading it again is redundant overhead.

Before exploring the codebase, you MUST follow this procedure:

1. **Read the structural map** at `.claude/specify/context/repo-map.md`
2. **Identify relevant files** from the map based on your current task — use file paths, exported identifiers, and import relationships to predict which files you need
3. **Read only those files** — go directly to the source files identified in step 2
4. **If the map doesn't cover what you need** (e.g., a newly created file not yet indexed, or a file type not supported by the extractor), fall back to targeted search — but ONLY after confirming the map doesn't have what you need

### Prohibitions

- **DO NOT** run broad `Grep` or `Glob` searches to "discover" the codebase when the map can answer your question
- **DO NOT** read files unrelated to your current task "just to understand the project"
- **DO NOT** ignore the map and explore from scratch — the map exists to eliminate redundant discovery
- **DO NOT** re-read files whose map entry hash matches the current file (the entry is current)

### When to fall back

You MAY use targeted search (not broad exploration) when:
- The map has no entry for the file you need (new file, unsupported language)
- The map entry's hash doesn't match the file on disk (stale entry — re-read the file)
- You need to find a very specific string or pattern that the map's structural view doesn't capture (e.g., a specific error message)

### Quick Reference

| Looking for... | Do this |
|----------------|---------|
| A function or type by name | Grep repo-map.md for the identifier |
| What a file exports/imports | Read the file's entry in repo-map.md |
| Which files use a module | Grep repo-map.md for the filename in `local:` lines |
| A specific string or error message | Grep source files directly (map doesn't capture literals) |
| A newly created file not in the map | Grep or Glob source by name pattern |

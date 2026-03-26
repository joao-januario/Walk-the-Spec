# Parsers Area Guide

## Purpose

Parse speckit markdown artifact files into typed, structured data that the renderer displays. Each parser takes a raw markdown string and returns a typed result object with extracted elements. Parsers are pure functions — no side effects, no filesystem access.

## Parser Contract

Every parser follows the same pattern:

```
Input:  content: string     (raw markdown file content)
Output: <ParserResult>      (typed result object with extracted data)
```

Parsers are called from `src/main/ipc/handlers.ts` in the `get-artifact` handler. A switch on `artifactType` dispatches to the right parser:

```
'spec'        → parseSpec(content)        → SpecParseResult
'plan'        → parsePlan(content)        → PlanParseResult
'tasks'       → parseTasks(content)       → TasksParseResult
'research'    → parseResearch(content)    → ResearchParseResult
'summary'     → parseSummary(content)     → SummaryParseResult
'deep-dives'  → parseSummary(content)     → SummaryParseResult  (same parser)
'review'      → parseReview(content)      → ReviewParseResult
```

`parseRefactorBacklog` is called separately in the `backlog:list` handler (not via `get-artifact`).

## Key Types

Defined in `src/renderer/src/types/index.ts`:

- **UserStory**: `{ number, title, priority, description, whyPriority, independentTest, acceptanceScenarios: GWTScenario[] }`
- **Requirement**: `{ id (FR-NNN), text }`
- **SuccessCriterion**: `{ id (SC-NNN), text }`
- **TaskItem**: `{ id (TNNN), description, checked, parallel, userStory }`
- **Phase**: `{ name, tasks: TaskItem[] }`
- **ArchitectureDecision**: `{ heading, decision, rationale, alternativesRejected }`
- **ResearchDecision**: `{ heading, decision, rationale, alternatives[] }`
- **ReviewFinding**: `{ number, ruleId, severity, location, summary, fix, why, gain, codeBlocks[], status }`
- **HealSummary**: `{ date, appliedCount, skippedCount, revertedCount, findings[] }`
- **RefactorEntry**: `{ id, branch, rule, files, description, status }`

## Data Flow

```
Renderer requests artifact
  → api.getArtifact(projectId, type) [IPC]
  → handlers.ts: reads file from disk (fs.readFileSync)
  → handlers.ts: calls appropriate parser function
  → parser returns typed result
  → handlers.ts wraps elements in { type, filePath, lastModified, elements[], reviewMeta? }
  → returns to renderer via IPC
  → artifact view component renders elements
```

## How to Add a New Parser

1. Create `src/main/parser/<name>-parser.ts`
2. Import `parseMarkdown` from `markdown-parser.ts` for AST access
3. Export a function: `export function parse<Name>(content: string): <Name>ParseResult`
4. Add import + case in `src/main/ipc/handlers.ts` `get-artifact` switch
5. Add result type to `src/renderer/src/types/index.ts`
6. Create a renderer view component to display the parsed data

## Gotchas

1. **Dual-format plan parsing**: `parsePlan` supports both new format (Technical Approach as prose, Architecture Decisions with Decision/Rationale/Alternatives) and legacy format (Technical Context as key-value pairs, generic decisions). New format takes precedence if present.

   **Structured file structure**: Within plan parsing, `extractFileStructure()` parses the "Project Structure" section and returns `FileStructureSection[]` (typed data) instead of a raw string. The parser handles both flat file lists and tree-format (├──, └──) structures, strips tree characters, and infers operation type (added/modified/removed) from inline comments (with word-boundary keyword matching like `\badd\b`) or section headings as fallback. This structured data is wrapped in `FileStructureContent` with type 'file-structure' in the handler, enabling rich rendering in PlanView.

2. **Raw content slicing**: Plan and summary parsers preserve markdown formatting by slicing the original `content` string using MDAST position offsets, rather than reconstructing from the AST. This preserves complex markdown (tables, code blocks, nested lists) exactly as written.

3. **Review parser has two extraction strategies**: Tries modern block-based format (H4 headings per finding) first. Falls back to old table format if no findings found in block mode.

4. **Heal status mutation**: In `parseReview`, healing findings are extracted separately and their status is mutated into the findings array — findings aren't re-parsed, they're post-processed by matching finding number.

5. **No error throwing**: Parsers silently succeed even with malformed markdown. Missing sections return empty arrays/objects. Parse errors are caught in `handlers.ts` and returned as `parseWarning` on the artifact object.

6. **Task ID regex**: Tasks use regex `^(T\d+)\s+(?:\[P\]\s+)?(?:\[(US\d+)\]\s+)?(.+)` to extract ID, optional parallel flag `[P]`, and optional user story link `[US#]` from list item text.

7. **Glossary is NOT a parser**: Glossary terms are extracted inline in `handlers.ts` using raw regex against `glossary.md`, not via a parser module.

8. **Refactor backlog is table-only**: Strictly parses markdown tables with 6 columns via regex. No fallback format.

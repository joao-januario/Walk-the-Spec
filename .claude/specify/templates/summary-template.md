# Implementation Summary: [FEATURE NAME]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link to spec.md]
**Reviewed by**: [Author / AI agent that generated this]

<!--
  PURPOSE: This is a mandatory engineering deliverable produced at the end of
  every implementation. It serves as the primary onboarding document for any
  developer reviewing, inheriting, or modifying this work.

  AUDIENCE: A developer who can read the language but has never seen this codebase.

  TEACHING MINDSET:
  This document should feel like pair programming with a patient senior developer.
  The reader should LEARN something from every section — a pattern, a technique,
  a way of thinking about a problem. If a section only says "we did X because the
  spec said so," it has failed. Explain HOW the code works and WHY it's written
  that way, not just WHAT it does.

  ZERO-CONTEXT RULE (most important rule — overrides all others):
  Every section must be readable by a developer who has NEVER opened this
  repository. Before writing any paragraph, ask: "would someone who just
  cloned this repo understand what I'm saying?" If not, add context.

  This rule is enforced through five concrete writing patterns:

  1. OPEN WITH THE PROBLEM IN PLAIN ENGLISH before touching any code.
     Don't start with "The parser splits at H2 boundaries." Start with
     "When a user opens the Summary tab, the app needs to turn a markdown
     file into collapsible sections. Here's how that works." Establish
     what the reader is looking at and why it exists BEFORE showing code.

  2. EXPLAIN WHY SOMETHING EXISTS BEFORE SHOWING WHAT IT DOES.
     Don't show a function and then explain it. First explain the problem
     it solves, then show the code as the solution. The reader should
     already understand the goal before they see a single line of code.

  3. EVERY CODE SNIPPET MUST HAVE THE FILE PATH above it so the reader
     knows which file they're looking at. Just the path in backticks on
     its own line — no label needed.

  4. KEEP CODE CLEAN — DON'T OVER-COMMENT. Inline comments should ONLY
     explain lines that aren't self-explanatory. The explanation of WHAT
     the code does belongs in the prose BEFORE the snippet, not as
     comments inside it. Inline comments are only for the lines where
     a reader would think "wait, what?"

  5. SHOW THE FULL FUNCTION SHAPE — signature, parameters, return value,
     and enough surrounding logic to follow the flow. Never show a single
     ripped-out line without the function it belongs to.

  6. EVERY ABBREVIATION OR INTERNAL TERM MUST BE IN THE GLOSSARY. Don't
     spell out abbreviations inline — that's what the glossary hover is
     for. But every abbreviation (AST, IPC, etc.) and every codebase-
     specific term MUST have a glossary entry so the reader can hover it.
     If a term appears in backticks and isn't in the glossary, add it.

  "NEW TO X?" EXPLAINERS — MANDATORY FOR EVERY CODE SNIPPET:
  Every section that contains a code snippet MUST have at least one
  `#### New to [pattern/syntax]?` subsection. These render as collapsible
  purple-tinted cards in the UI — experts skip them, beginners expand.
  MINIMUM: one per code section, multiple if the snippet is complex.

  OUTPUT FORMAT SPECIFICATION:
  Every visual element must use a specific markdown convention so the UI
  can render it correctly. Reference this table when writing:

  | Visual element           | Markdown convention                          |
  |--------------------------|----------------------------------------------|
  | File path before code    | `src/path/to/file.ts` on its own line        |
  | Code snippet             | Fenced block with language (```typescript)    |
  | Callout label            | **Label** as its own paragraph                |
  | "New to X?" explainer    | #### New to [topic]? heading                  |
  | Folder structure         | Fenced block with ```text language            |
  | Diagram                  | Fenced block with ```mermaid language          |
  | Approach/Tradeoffs       | **Approach** / **Tradeoffs** own paragraphs   |
  | Sub-section heading      | ### Step N: [title] or ### [title]            |
  | Top-level section        | ## [title]                                    |

  Any new visual element type needs to be added here with its convention.

  SECTION PURPOSES — each section has a distinct role and a distinct LENS:

  - OVERVIEW: What was built and why. Sets the scene. No code.
  - IMPLEMENTATION OVERVIEW: Thorough walkthrough of everything implemented.
    The lens is WHAT and HOW — what was built, how the pieces connect,
    what the code does in the flow. Be verbose — no surprises in the diff.
  - DESIGN DECISIONS: The reasoning behind architectural choices. The lens
    is WHY — why this approach, what constraints shaped it, what tradeoffs.
    Support with code, diagrams, folder trees — text alone is often not
    enough.
  - CODE DEEP-DIVES: Generated separately via `/speckit.dive`. Not part
    of the summary.
  - EDGE CASES & GOTCHAS: Non-obvious things a future developer needs to know.

  NO-REPEAT RULE: Code snippets CAN appear in multiple sections — the reader
  shouldn't have to scroll back to find code. But the EXPLANATION must be
  different each time. If the overview explains what a function does in the
  flow, the design decision explains why that approach was chosen, and the
  deep-dive explains the internals comprehensively. Same code, different lens.
  If you find yourself writing the same explanation twice, one of them is in
  the wrong section.
-->

## Overview *(mandatory)*

<!--
  2-3 paragraphs. NO code in this section.

  Paragraph 1: What was built and what problem it solves
  Paragraph 2: The mental model — how the pieces connect
  Paragraph 3: Context a developer needs before reading the rest
-->

[Paragraph 1: what and why]

[Paragraph 2: mental model]

[Paragraph 3: prerequisites]

## Implementation Overview *(mandatory)*

<!--
  Walk through every meaningful thing that was implemented, step by step,
  with enough code and context that a reviewer finds no surprises in the
  diff. Be thorough — it's better to be verbose than to miss something.

  When a step involves an interesting architectural choice, mention it
  briefly but save the deep reasoning for the Design Decisions section.
  When a step involves complex code worth studying in detail, show enough
  to understand the flow but point the curious reader to Code Deep-Dives.

  Format — for each step:

  ### Step N: [What happens at this step]

  [Problem in plain English, then the code as the solution]

  `src/path/to/file.ts`

  ```language
  // full function shape, only non-obvious inline comments
  ```

  [Explanation of the code in prose AFTER the snippet]

  #### New to [pattern]?
  [Collapsible explainer card]
-->

### Step 1: [title]

[Context and code]

### Step 2: [title]

[Context and code]

### Step 3: [title]

[Context and code]

## Design Decisions *(mandatory)*

<!--
  The reasoning behind architectural choices — why this approach, what
  constraints shaped it, what tradeoffs were accepted, what technical
  debt it creates.

  The overview introduces these decisions briefly — this is where you
  go into the full reasoning. Show as much implementation detail as
  needed to make it concrete.

  Support decisions with whatever makes them clearest: code snippets,
  mermaid diagrams, folder structure trees, before/after comparisons.
  Text alone is often not enough — a diagram of how data flows between
  processes can communicate in seconds what three paragraphs of prose
  can't. Use ```mermaid for diagrams, never ASCII art.

  Ask yourself: "would a tech lead discuss this in a design review?"
  If yes, it's a design decision.

  Each decision follows this structure:

  ### N. [Decision title]

  **Approach**

  [What we did and why, with supporting code/diagrams/structures]

  **Tradeoffs**

  [Risks, limitations, technical debt, what to watch for]

  Minimum 2 decisions.
-->

### 1. [Decision title]

**Approach**

[What we did and why]

**Tradeoffs**

[Risks and limitations]

### 2. [Decision title]

**Approach**

[What we did and why]

**Tradeoffs**

[Risks and limitations]

<!--
  CODE DEEP-DIVES are generated separately via `/speckit.dive` and stored
  in `deep-dives.md` as a separate artifact with its own tab. They are NOT
  part of this summary document. The summary focuses on overview, design
  decisions, and edge cases. Deep-dives are optional and generated on demand.
-->

## Edge Cases & Gotchas *(include if any exist)*

<!--
  Things a future developer working in this area NEEDS to know.
  Show the relevant code and explain why it's written that way.
  Omit this section entirely if there are no gotchas.
-->

### [Gotcha title]

[Code and explanation]

## Glossary *(mandatory — separate file)*

<!--
  The glossary lives in `glossary.md` in the same spec directory.
  It is NOT a section in this document — it's a separate artifact.

  RULE: Every backtick term that references something specific to this
  codebase MUST have an entry in glossary.md. If a term appears in any
  artifact and isn't in the glossary, the feature is incomplete.

  Terms render as hoverable inline code in the UI — dotted underline,
  tooltip on hover with the definition.
-->

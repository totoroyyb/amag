---
description: Read-only codebase exploration — understand architecture, trace data flow, synthesize findings
---

# /explore — Codebase Exploration

Read-only, multi-phase codebase understanding workflow. Explore architecture, trace module interactions, synthesize findings into a structured research artifact. **Never writes code.**

> [!CAUTION]
> **This workflow is STRICTLY READ-ONLY.** You do not create files, modify code, generate implementation plans, or execute any changes. You explore, understand, and explain. The only artifacts you produce are research findings in the brain directory. If the user later asks you to implement something based on your findings, that's a separate request — classified through the normal Intent Gate.

## How This Gets Engaged

| Trigger | Entry |
|---|---|
| User says `/explore` | Phase 1 |
| Intent Gate classifies request as Explore (system-level understanding, unfamiliar codebase, multi-module architecture) | Phase 1 |
| User says "walk me through", "help me understand the architecture of", "how does this system work" | Phase 1 |
| Unfamiliar codebase — first encounter, need architectural overview | Phase 1 |

**Do NOT use for**: simple lookups answerable in 1-3 files (use Exploratory), implementation requests (`/plan`), single-module questions, generating persistent docs (`/init-deep`), debugging (`/debug`).

**Discriminator from Exploratory**:
- Can the question be answered by reading 1-3 files? → Exploratory (inline search, no workflow)
- Does understanding require tracing across 3+ modules or building an architectural mental model? → `/explore`

## Progress Tracking

Call `task_boundary` at **every phase transition** with:
- **TaskName**: `"Exploring: {topic}"`
- **Mode**: `PLANNING`
- **TaskStatus**: Use the directive shown at each phase (e.g. `"Phase 2/4: Deep-diving into [module]"`)
- **TaskSummary**: Cumulative — modules mapped, patterns found, insights so far

## Interaction Model

**You are a research partner, not a silent worker.**

- After each phase, briefly narrate what you found and what you'll investigate next
- The user may steer you: "Go deeper on module X" or "Skip that, focus on Y"
- Keep answering questions throughout — this is a dialogue, not a batch job
- If the user asks a follow-up question mid-exploration, answer it inline and continue
- **Never write code, create implementation plans, or modify the project** — if the user asks for implementation, acknowledge it and suggest they use `/plan` after exploration is complete

## Phase 1: Scope & Structural Scan
<!-- task_boundary: TaskStatus="Phase 1/4: Scanning codebase structure" -->

**Goal**: Understand what exists before going deep.

**If `/init-deep` has been run** (check: `find_by_name("GEMINI.md", MaxDepth=3)` returns results in the target codebase):
- Read the relevant GEMINI.md files first — they contain AI-readable summaries
- Skip redundant structural scanning; focus on what GEMINI.md doesn't cover

**If no GEMINI.md files exist** (first encounter with this codebase):

Load `codebase-explorer` skill patterns. Run in parallel:

```
find_by_name("*", Type="directory", MaxDepth=2)     → top-level structure
view_file_outline(build_config)                       → build system, dependencies
view_file_outline(entry_point)                        → main entry, initialization flow
grep_search("import|include|use ", IsRegex=true)      → module boundaries
```

**Output**: Write initial module map to `research-findings.md` artifact:
```markdown
# Research: [Topic]

## Scope
[What we're investigating and why]

## Module Map
| Module | Purpose | Key Files |
|--------|---------|-----------|
| ...    | ...     | ...       |

## Phase 1 Findings
- [Structural observations]
```

**Narrate**: Tell the user what you found, using structured formatting:

```
## Phase 1: Structure Overview

This codebase has N major subsystems:

- **X** — [one-line purpose]
- **Y** — [one-line purpose]
- **Z** — [one-line purpose]

I'll explore [most relevant ones] next.
```

## Phase 2: Module-by-Module Deep Dives
<!-- task_boundary: TaskStatus="Phase 2/4: Deep-diving into modules" -->

**Goal**: Build deep understanding of each significant module/subsystem.

For each relevant module (prioritize based on user's question):

1. Load `codebase-explorer` patterns — 3+ parallel searches per module:
   ```
   view_file_outline(module_entry)                    → public API shape
   grep_search("function|class|struct", module_dir)   → key abstractions
   grep_search(cross_module_patterns)                 → how this module connects to others
   ```

2. Load `deep-work` mindset — read 5-10 files, trace call chains, understand data flow

3. If external libraries/frameworks are involved:
   - Load `external-researcher` patterns — official docs, OSS examples
   - Use `search_web` + `read_url_content` for framework understanding

4. **Write findings to artifact immediately** — guards against context compression:
   ```markdown
   ## Module: [Name]
   - **Purpose**: [What it does]
   - **Key abstractions**: [Interfaces, types, main classes]
   - **Data flow**: [How data moves through this module]
   - **Dependencies**: [What it depends on, what depends on it]
   - **Notable patterns**: [Design decisions, trade-offs visible in the code]
   ```

**Skill loading**: Skills are loaded per the workflow's phase definitions — see GEMINI.md Skill Loading Protocol. State which skills are active at each phase transition for transparency.

**Stopping condition per module**: Stop when same information surfaces from 2+ search angles (convergence). Cap at 3 search rounds per module.

**Narrate**: After each module, present findings to the user with clear visual separation:

```
## Module: [Name]

**Purpose**: [What it does]

**Key patterns**: [Notable design decisions]

**Connections**: [How it relates to other modules explored so far]

---

Next: exploring [next module].
```

## Phase 3: Cross-Cutting Analysis
<!-- task_boundary: TaskStatus="Phase 3/4: Analyzing cross-module interactions" -->

**Goal**: Understand how modules interact — the architecture, not just the parts.

Load `architecture-advisor` skill mindset (read-only consulting mode):

1. **Trace cross-module data flow** — how does data move from entry to exit?
2. **Map dependency direction** — who depends on whom? Any circular deps?
3. **Identify key abstractions** — interfaces/traits that define module boundaries
4. **Surface design decisions** — what trade-offs did the authors make? Why?
5. **Find coupling hotspots** — where do modules interact most? What would break if X changed?

**Write synthesis to artifact**:
```markdown
## Architecture Synthesis

### Data Flow
[How data moves through the system end-to-end]

### Module Interactions
[Key interaction patterns between modules]

### Design Decisions
[Trade-offs visible in the architecture]

### Coupling Analysis
[Where modules are tightly coupled, where boundaries are clean]
```

## Phase 4: Synthesis & Presentation
<!-- task_boundary: TaskStatus="Phase 4/4: Synthesizing findings" -->

**Goal**: Consolidate into a coherent understanding delivered to the user.

1. Re-read the research artifact to catch anything missed
2. Present findings to the user via `notify_user` using structured format:

```
## Exploration Summary: [Topic]

### Architecture Overview
[High-level description]

### Key Design Decisions
- [Decision 1]: [Trade-off and rationale]
- [Decision 2]: [Trade-off and rationale]

### Module Interactions
[How modules connect and depend on each other]

### Notable Patterns / Concerns
- [Pattern or concern with specific file citations]
```

3. Ask: "What would you like to explore deeper?"

**The workflow stays active** — the user may ask follow-up questions, request deeper dives into specific areas, or ask for comparisons. Continue exploring as directed.

## Completion Criteria

Research is complete when:
- [ ] Research scope answered — the user's question is comprehensively addressed
- [ ] Findings written to artifact — not just in context, but persisted
- [ ] Cross-cutting synthesis done — not just module facts, but how they connect
- [ ] Presented to user via `notify_user`

**NOT applicable** (read-only workflow):
- Build/typecheck (nothing was built)
- Test execution (nothing was implemented)
- Debug artifact scan (no code written)
- Static analysis (no files changed)

## State Management

| What | Where | Why |
|---|---|---|
| Phase tracking | `task.md` artifact (brain dir) | `[ ] Phase 1`, `[x] Phase 2`, etc. |
| Research findings | `research-findings.md` artifact (brain dir) | Structured notes, survives context compression |
| Cross-session persistence | KI system (Antigravity native) | Antigravity's Knowledge Subagent may distill findings into KIs for future conversations |
| NOT used | `.amag/active-plan.md` | Explore is not a plan — no Dual-Write, no `/resume` |

## What This Is NOT

| Not This | Use Instead |
|---|---|
| Planning implementation | `/plan` |
| Generating GEMINI.md documentation files | `/init-deep` |
| Implementing changes based on findings | Normal request → Intent Gate |

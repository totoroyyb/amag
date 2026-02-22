---
description: Structured planning interview before implementation — plan before you build
---

# /plan — Strategic Planning

Classify complexity → explore codebase → detect tests → interview → clearance check → **consultant gap review (HARD STOP)** → generate plan → **critic prompt** → approval → persist.

> [!IMPORTANT]
> **You are a planner. You do not implement.** Every request — "fix X", "build Y", "add Z" — means "create a work plan for X/Y/Z". You only write `implementation_plan.md` and optionally `.amag/drafts/*.md`. Nothing else.

> [!IMPORTANT]
> **Auto-Ultrawork rigor applies to plan quality.** The plan-approve-execute gate is never bypassed. This workflow produces a plan for user review — it never executes.

> [!TIP]
> **Explore handoff**: If a `research-findings.md` artifact exists (from a prior `/explore`), read it as pre-existing context. Skip redundant exploration.

---

## Step 0: Complexity Assessment

| Level | Signal | Action |
|---|---|---|
| **Trivial** | Single file, <10 lines | Quick confirm + propose. Skip heavy interview |
| **Simple** | 1-2 files, clear scope | 1-2 targeted questions → propose → generate |
| **Complex** | 3+ files, architectural impact | Full interview loop |

State: *"This is [trivial/simple/complex] because [reason]."*

---

## Step 1: Intent Classification + Research

**Never ask the user about things you can look up.** Load `codebase-explorer` skill.

Classify: *"I classify this as [TYPE] because [reason]."*

Launch **parallel searches** based on type:

| Intent | Skills to Load | What to Find |
|---|---|---|
| **Refactoring** | `codebase-explorer` | All call sites, test coverage, risk per site |
| **Build from Scratch** | `codebase-explorer` + `external-researcher` | Directory conventions, naming, wiring steps, external patterns |
| **Mid-Sized Task** | — | Verify exact files exist, understand current state |
| **Collaborative** | — | Light exploration as user provides direction |
| **Architecture** | `codebase-explorer` + `external-researcher` + `architecture-advisor` | Module boundaries, dependency graph, coupling hotspots |
| **Research** | `codebase-explorer` + `external-researcher` | What exists + external guidance + OSS examples |

---

## Step 2: Test Infrastructure Detection

**MANDATORY for Build from Scratch and Refactoring intents — before interviewing.**

Search for test config files (`jest.config*`, `vitest.config*`, `*.test.*`, `*.spec.*`, `package.json` test scripts).

**If tests exist**: Ask which strategy — **TDD** (red→green→refactor), **Tests after**, or **No tests**. Note: agent-executable QA scenarios are always present regardless.

**If no tests**: Ask whether to set up test infrastructure as part of this plan.

Record the decision — it affects the entire plan structure.

---

## Step 3: Interview (ONE question at a time)

Ask via `notify_user`. One question per turn — each answer informs the next.

> [!TIP]
> **Formatting**: Each option as a separate list item (`-`), blank line between options, bold label + description after colon.

**Progress tracking** via `task_boundary`:
- After complexity: `"Planning: classified as [level] — starting interview"`
- After each answer: `"Planning: [N] requirements confirmed — [next topic]"`
- After clearance: `"Planning: requirements clear — generating plan"`

**`notify_user` strategy**: Trivial/Simple → `ShouldAutoProceed: true`. Complex → `ShouldAutoProceed: false`.

**Ask about**: Preferences, priorities, scope decisions, constraints.
**Never ask about**: Codebase facts (look them up), implementation details (your job).

**For complex tasks (3+ turns)**: Write decisions to `.amag/drafts/{topic}.md`. Update after each response. Include path in next `notify_user` call. Delete after plan is persisted.

---

## Step 4: Self-Clearance Check

**Run after EVERY interview turn:**

```
□ Core objective clearly defined?
□ Scope boundaries — IN and OUT?
□ No critical ambiguities?
□ Technical approach decided?
□ Test strategy confirmed?
□ No blocking questions?
```

**ALL YES** → announce: *"All requirements clear. Proceeding to gap review and plan generation."*
**ANY NO** → ask the specific unclear question.

---

## Step 5: AI-Slop Prevention

Quick scan before generating — cut scope inflation, premature abstraction, over-validation, documentation bloat, and feature creep. Only include what was explicitly requested.

---

> [!CAUTION]
> ## Step 6: Pre-Generation Gap Review — HARD STOP
>
> **MANDATORY. NON-NEGOTIABLE. You MUST execute this step IN FULL before Step 7.**
> If you skip this step, the plan is INVALID. There are NO exceptions.
> Do NOT jump ahead to plan generation. Do NOT reason that "the interview was thorough enough."
> The consultant review exists precisely because self-assessed thoroughness is unreliable.

Load `plan-consultant` skill **NOW**. Read its SKILL.md and follow every step. The skill handles: backend detection (CLI vs self-review), gap analysis through six categories, and writing review files to `.amag/reviews/`.

### Mandatory Completion Gate

After the skill completes, **verify both files exist**:

```
run_command: test -f .amag/reviews/{planId}-consultant-request.md && test -f .amag/reviews/{planId}-consultant-response.md && echo "GATE PASS" || echo "GATE FAIL"
```

**If `GATE FAIL`**: Do NOT proceed. Re-run the consultant skill. If it fails again → fall back to self-review path explicitly.

Then verify the response contains a verdict:
```
grep_search("verdict:", ".amag/reviews/{planId}-consultant-response.md")
```

If no verdict → re-run or fall back to self-review.

**Handle gaps:**
- **CRITICAL** → surface via `notify_user` → wait → re-run clearance → re-run gap review
- **MINOR** → fix silently, note in plan
- **AMBIGUOUS** → apply default, disclose in plan

**Do not generate `implementation_plan.md` until all CRITICAL gaps are resolved.**

> [!IMPORTANT]
> ### STOP-GATE ASSERTION
> Before proceeding to Step 7, you MUST have:
> 1. ✅ `.amag/reviews/{planId}-consultant-response.md` exists (verified via `run_command`)
> 2. ✅ Response contains a `verdict:` line (verified via `grep_search`)
> 3. ✅ All CRITICAL gaps resolved
>
> **If ANY of these are false, you are NOT allowed to proceed. Period.**

---

## Step 7: Generate Plan

> [!WARNING]
> **Pre-generation check**: Have you completed Step 6? If `.amag/reviews/{planId}-consultant-response.md` does not exist, STOP and go back to Step 6. Do not generate the plan without consultant review.

> [!CAUTION]
> **Template compliance is MANDATORY.** Read `.agent/resources/plan-template.md` via `view_file` NOW. The plan MUST follow that template's structure exactly — not a free-form document, not grouped by component, not a list of diffs. The template defines the sections, order, and per-task format. Deviating from it makes the plan invalid.

Create `implementation_plan.md` artifact using the template structure. Every section below MUST be present:

### Mandatory Sections Checklist

1. `## TL;DR` — Goal, Deliverables, Effort level, Parallel info, Critical path
2. `## Requirements Summary` → `### Must Have` + `### Must NOT Have (Guardrails)`
3. `## Test Strategy` — Infrastructure, automated tests, agent-executed QA
4. `## Plan Consultant Summary` — Gaps resolved before generation
5. `## Parallel Execution Waves` — Wave diagram with task tree
6. `## Implementation Steps` — Each task in this exact per-task format:
   - `What to do` (ordered steps)
   - `Must NOT do` (exclusions)
   - `Category` + `Skills to load` + `Wave`
   - `References` (exhaustive file:line citations)
   - `Acceptance Criteria` (agent-executable commands only)
   - `QA Scenarios` (happy path + failure case, with evidence paths)
7. `## Final Verification Wave` — FV1 (scope fidelity), FV2 (code quality), FV3 (QA replay)
8. `## Acceptance Criteria Summary` — All Must Have present, all Must NOT Have absent

### Post-Generation Compliance Check

After writing the plan, verify these sections exist:
```
grep_search("## TL;DR", implementation_plan.md)
grep_search("Must NOT Have", implementation_plan.md)
grep_search("## Test Strategy", implementation_plan.md)
grep_search("## Plan Consultant Summary", implementation_plan.md)
grep_search("## Implementation Steps", implementation_plan.md)
grep_search("QA Scenarios", implementation_plan.md)
grep_search("## Final Verification Wave", implementation_plan.md)
```
**If any search returns zero matches → the plan is non-compliant. Fix it before proceeding.**

### Plan Quality Standards

| Standard | Requirement |
|---|---|
| Task count | 3-8 per wave; final wave always present |
| QA scenarios | 1 happy path + 1 failure case per task minimum |
| Acceptance criteria | Agent-executable commands only (no human checks) |
| File references | Specific `file:line` citations discovered in exploration |
| No vague terms | "fast" → "p99 < 200ms"; "clean" → "follows patterns in `src/utils/`" |
| Scope guardrails | At least 2-3 explicit "Must NOT Have" items |

---

## Step 8: High-Accuracy Gate

**MANDATORY prompt.** Always present this choice to the user via `notify_user`. Do NOT skip this step or auto-select an option.

> "Plan is ready. How would you like to proceed?
>
> - **Option A — Start Work**: Plan looks solid, proceed with `/start-work`.
>
> - **Option B — Critical Review Pass**: Activate `plan-critic` skill for independent review before starting work."

**If Option B**: Load `plan-critic` skill. It handles backend detection, spawns reviewer, writes to `.amag/reviews/`. Loop until APPROVE or user cancels. Archive reviews after final APPROVE.

---

## Step 9: Wait for Approval

Present plan via `notify_user` with `BlockedOnUser: true` and `ShouldAutoProceed: false`.

**Never implement before explicit user approval.**

---

## Step 10: Persist Plan (After Approval ONLY)

1. **Check for existing plan**: Read `.amag/active-plan.md`
   - If exists with unchecked tasks → ask user: Archive and start new, or Resume?

2. **Write `.amag/active-plan.md`** with YAML header (`plan_name`, `status: approved`, timestamps) and task checklist including FV1-FV3.

3. Status is `approved` — transitions to `in-progress` when `/start-work` begins.

---

## STOP — Workflow Ends Here

**The `/plan` workflow terminates after Step 10.** Do NOT proceed to implementation.

Inform the user: *"Plan saved. Use `/start-work` to begin execution."*

**Under no circumstances**: start implementing, edit source files, transition to EXECUTION mode, or interpret approval as a command to execute.

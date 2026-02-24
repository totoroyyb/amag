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

## Progress Tracking

Call `task_boundary` at **every step transition** with:
- **TaskName**: `"Planning: {feature}"`
- **Mode**: `PLANNING`
- **TaskStatus**: Use the directive shown at each step (e.g. `"Step 2/10: Exploring codebase"`)
- **TaskSummary**: Cumulative — what has been decided/discovered so far

---

## Step 0: Complexity Assessment
<!-- task_boundary: TaskStatus="Step 1/10: Assessing complexity" -->

| Level | Signal | Action |
|---|---|---|
| **Trivial** | Single file, <10 lines | Quick confirm + propose. Skip heavy interview |
| **Simple** | 1-2 files, clear scope | 1-2 targeted questions → propose → generate |
| **Complex** | 3+ files, architectural impact | Full interview loop |

State: *"This is [trivial/simple/complex] because [reason]."*

---

## Step 1: Intent Classification + Research
<!-- task_boundary: TaskStatus="Step 2/10: Classifying intent and exploring codebase" -->

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
<!-- task_boundary: TaskStatus="Step 3/10: Detecting test infrastructure" -->

**MANDATORY for Build from Scratch and Refactoring intents — before interviewing.**

Search for test config files (`jest.config*`, `vitest.config*`, `*.test.*`, `*.spec.*`, `package.json` test scripts).

**If tests exist**: Ask which strategy — **TDD** (red→green→refactor), **Tests after**, or **No tests**. Note: agent-executable QA scenarios are always present regardless.

**If no tests**: Ask whether to set up test infrastructure as part of this plan.

Record the decision — it affects the entire plan structure.

---

## Step 3: Interview (ONE question at a time)
<!-- task_boundary: TaskStatus="Step 4/10: Interviewing — [N] requirements confirmed" -->

Ask via `notify_user`. One question per turn — each answer informs the next.

> [!TIP]
> **Formatting**: Each option as a separate list item (`-`), blank line between options, bold label + description after colon.

**`notify_user` strategy**: Trivial/Simple → `ShouldAutoProceed: true`. Complex → `ShouldAutoProceed: false`.

**Ask about**: Preferences, priorities, scope decisions, constraints.
**Never ask about**: Codebase facts (look them up), implementation details (your job).

**For complex tasks (3+ turns)**: Write decisions to `.amag/drafts/{topic}.md`. Update after each response. Include path in next `notify_user` call. Delete after plan is persisted.

---

## Step 4: Self-Clearance Check
<!-- task_boundary: TaskStatus="Step 5/10: Running self-clearance check" -->

**Run after EVERY interview turn.** Check these internally — do NOT present the raw checklist to the user:

1. Core objective clearly defined?
2. Scope boundaries — IN and OUT?
3. No critical ambiguities?
4. Technical approach decided?
5. Test strategy confirmed?
6. No blocking questions?

**ALL YES** → announce:

> **✅ All requirements clear.** Proceeding to gap review and plan generation.

**ANY NO** → ask the specific unclear question.

---

## Step 5: AI-Slop Prevention
<!-- task_boundary: TaskStatus="Step 6/10: AI-slop prevention scan" -->

Quick scan before generating — cut scope inflation, premature abstraction, over-validation, documentation bloat, and feature creep. Only include what was explicitly requested.

---

> [!CAUTION]
> ## Step 6: Pre-Generation Gap Review — HARD STOP
> <!-- task_boundary: TaskStatus="Step 7/10: Running plan consultant (gap review)" -->
>
> **MANDATORY. NON-NEGOTIABLE. No exceptions.** Do NOT skip this step, jump to plan generation, or reason that "the interview was thorough enough." Self-assessed thoroughness is unreliable.
>
> **GATE**: Step 7 is BLOCKED until ALL four conditions pass:
> 1. ✅ `.amag/reviews/{planId}-consultant-response.md` exists (verified via `run_command`)
> 2. ✅ Response contains a `verdict:` line (verified via `grep_search`)
> 3. ✅ All CRITICAL gaps resolved
> 4. ✅ `.amag/reviews/{planId}-consultant-cli-attempts.log` exists (CLI was attempted)
>
> **If ANY condition fails → you CANNOT proceed. Period.**

Load `plan-consultant` skill **NOW**. Read its SKILL.md and follow every step. The skill handles: gap analysis through six categories, writing review files to `.amag/reviews/`, and CLI delegation (via `external-cli-runner` skill) with automatic fallback to self-review.

### Mandatory Completion Gate

After the skill completes, verify:

```
run_command: test -f .amag/reviews/{planId}-consultant-request.md && test -f .amag/reviews/{planId}-consultant-response.md && test -f .amag/reviews/{planId}-consultant-cli-attempts.log && echo "GATE PASS" || echo "GATE FAIL"
grep_search("verdict:", ".amag/reviews/{planId}-consultant-response.md")
```

**If `GATE FAIL` or no verdict**: Re-run the consultant skill. If it fails again → fall back to self-review.

**Handle gaps:**
- **CRITICAL** → surface via `notify_user` → wait → re-run clearance → re-run gap review
- **MINOR** → fix silently, note in plan
- **AMBIGUOUS** → apply default, disclose in plan

---

## Step 7: Generate Plan
<!-- task_boundary: TaskStatus="Step 8/10: Generating implementation plan" -->

> [!CAUTION]
> **Template compliance is MANDATORY.** Read `.agent/resources/plan-template.md` via `view_file` NOW. The plan MUST follow that template's structure exactly. Deviating makes the plan invalid.

Create `implementation_plan.md` artifact using the template structure. Every section in the template MUST be present — the post-generation compliance check below verifies this.

### Post-Generation Compliance Check

After writing the plan, verify all required sections exist:
```
grep_search("## TL;DR", implementation_plan.md)
grep_search("Must NOT Have", implementation_plan.md)
grep_search("## Test Strategy", implementation_plan.md)
grep_search("## Plan Consultant Summary", implementation_plan.md)
grep_search("## Implementation Steps", implementation_plan.md)
grep_search("QA Scenarios", implementation_plan.md)
grep_search("## Final Verification Wave", implementation_plan.md)
```
**If any search returns zero matches → fix the plan before proceeding.**

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
<!-- task_boundary: TaskStatus="Step 9/10: Presenting plan for review" -->

**MANDATORY prompt.** Always present this choice to the user via `notify_user`. Do NOT skip this step or auto-select an option.

Present exactly this (with blank lines between options for readability):

```
Plan is ready. How would you like to proceed?

- **Option A — Proceed to Approval**: Plan looks solid, skip critic review.

- **Option B — Critical Review Pass**: Activate `plan-critic` skill for independent review before approval.
```

**If Option B**: Load `plan-critic` skill. It handles backend detection, spawns reviewer, writes to `.amag/reviews/`. Loop until APPROVE or user cancels. Archive reviews after final APPROVE.

---

## Step 9: Wait for Approval
<!-- task_boundary: TaskStatus="Step 10/10: Waiting for user approval" -->

Present plan via `notify_user` with `BlockedOnUser: true` and `ShouldAutoProceed: false`.

**The `notify_user` message MUST include:**

> ⚠️ Approving this plan does **NOT** start implementation.
> Type `/start-work` to begin execution.

**Never implement before explicit user approval. "Approval" means the plan is accepted — it does NOT mean "start building."**

---

## Step 10: Persist Plan (After Approval ONLY)
<!-- task_boundary: TaskStatus="Step 10/10: Persisting approved plan" -->

1. **Check for existing plan**: Read `.amag/active-plan.md`
   - If exists with unchecked tasks → ask user: Archive and start new, or Resume?

2. **Write `.amag/active-plan.md`** with YAML header (`plan_name`, `status: approved`, timestamps) and task checklist including FV1-FV3.

3. Status is `approved` — transitions to `in-progress` when `/start-work` begins.

4. **Archive remaining review files** (catch-all safety net):
   ```
   run_command: [ "$(ls -A .amag/reviews/ 2>/dev/null)" ] && mkdir -p .amag/archive/reviews/{planId} && mv .amag/reviews/* .amag/archive/reviews/{planId}/ || true
   ```

---

## STOP — Workflow Ends Here

**The `/plan` workflow terminates after Step 10.** Do NOT proceed to implementation.

Inform the user:

> **📋 Plan saved.** Use `/start-work` to begin execution.

**Under no circumstances**: start implementing, edit source files, transition to EXECUTION mode, or interpret "Proceed" / "Go ahead" / approval as a command to execute. Only an explicit `/start-work` invocation triggers implementation.

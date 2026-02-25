---
description: Structured planning interview before implementation — plan before you build
---

# /plan — Strategic Planning

Classify complexity → explore → detect tests → interview → clearance → **gap review (HARD STOP)** → generate plan → **critic prompt** → approval → persist.

> [!IMPORTANT]
> **You are a planner. You do not implement.** Every request means "create a work plan". You only write `implementation_plan.md` and optionally `.amag/drafts/*.md`. The plan-approve-execute gate is **never bypassed**. If a `research-findings.md` artifact exists (from a prior `/explore`), read it as context. This enriches your research — it does NOT reduce or skip any steps.

> [!WARNING]
> **Steps 0→10 must execute IN ORDER.** Do NOT jump to plan generation after research. Step 4 writes a checkpoint file that Step 7 verifies — skipping blocks plan generation.

## Progress Tracking

Call `task_boundary` at **every step transition**: TaskName=`"Planning: {feature}"`, Mode=`PLANNING`, TaskStatus per step directive, TaskSummary cumulative.

---

## Step 0: Complexity Assessment
<!-- task_boundary: TaskStatus="Step 1/10: Assessing complexity" -->

| Level | Signal | Action |
|---|---|---|
| **Trivial** | Single file, <10 lines | Quick confirm + propose |
| **Simple** | 1-2 files, clear scope | 1-2 targeted questions → generate |
| **Complex** | 3+ files, architectural impact | Full interview loop |

State: *"This is [trivial/simple/complex] because [reason]."*

### Complexity-Dependent Step Skips

Trivial/Simple may skip heavy steps. **Announce skips** via `notify_user`:

> ℹ️ **Skipped: {step name}** — Task classified as {trivial/simple} because {reason}.
> You can still run this step manually: say **"run gap analysis"** or **"run critic review"**.

`ShouldAutoProceed`: `true` for trivial, `false` for simple.

| Step | Trivial | Simple | Complex |
|------|---------|--------|---------|
| Steps 1-2 (Research + Tests) | Skip or minimal | Targeted | Full |
| Step 3 (Interview) | Quick confirm only | 1-2 questions | Full loop |
| Step 5 (AI-Slop scan) | Skip | Skip | Run |
| **Step 6 (Gap Review)** | **Skip — announce** | **Skip — announce** | **MANDATORY** |
| **Step 8 (Critic Prompt)** | **Skip — announce** | **Auto-select A — announce** | **MANDATORY prompt** |

---

## Step 1: Intent Classification + Research
<!-- task_boundary: TaskStatus="Step 2/10: Classifying intent and exploring codebase" -->

**Never ask users things you can look up.** Load `codebase-explorer` skill. Classify: *"I classify this as [TYPE] because [reason]."*

| Intent | Skills to Load | What to Find |
|---|---|---|
| **Refactoring** | `codebase-explorer` | Call sites, test coverage, risk |
| **Build from Scratch** | `codebase-explorer` + `external-researcher` | Conventions, naming, wiring, external patterns |
| **Mid-Sized Task** | — | Verify files exist, current state |
| **Collaborative** | — | Light exploration per user direction |
| **Architecture** | `codebase-explorer` + `external-researcher` + `architecture-advisor` | Boundaries, dependencies, coupling |
| **Research** | `codebase-explorer` + `external-researcher` | What exists + external guidance |

---

## Step 2: Test Infrastructure Detection
<!-- task_boundary: TaskStatus="Step 3/10: Detecting test infrastructure" -->

**MANDATORY for Build from Scratch and Refactoring — before interviewing.**

Search for test configs (`jest.config*`, `vitest.config*`, `*.test.*`, `*.spec.*`, test scripts).

- **Tests exist**: Ask: **TDD**, **Tests after**, or **No tests** (QA scenarios always present regardless)
- **No tests**: Ask whether to set up test infra in this plan

Record the decision — it shapes the plan structure.

---

## Step 3: Interview (ONE question at a time)
<!-- task_boundary: TaskStatus="Step 4/10: Interviewing — [N] requirements confirmed" -->

Ask via `notify_user`. One question per turn. Format options per GEMINI.md User-Facing Output Formatting (blank lines between options, bold labels). `ShouldAutoProceed`: trivial/simple=`true`, complex=`false`.

**Ask about**: Preferences, priorities, scope decisions, constraints.
**Never ask about**: Codebase facts (look them up), implementation details (your job).

**Complex tasks (3+ turns)**: Write decisions to `.amag/drafts/{topic}.md`. Include path in next `notify_user`. Delete after plan persisted.

---

## Step 4: Self-Clearance Check
<!-- task_boundary: TaskStatus="Step 5/10: Running self-clearance check" -->

**Run after EVERY interview turn.** Check internally — do NOT present to user:

1. Core objective defined? 2. Scope boundaries set? 3. No ambiguities? 4. Technical approach decided? 5. Test strategy confirmed? 6. No blocking questions?

**ALL YES** → announce: **"✅ All requirements clear."** Then write checkpoint:
```
run_command: mkdir -p .amag/plan-checkpoints && echo "CLEARANCE_PASS" > .amag/plan-checkpoints/clearance.done
```

**ANY NO** → ask the specific unclear question.

---

## Step 5: AI-Slop Prevention
<!-- task_boundary: TaskStatus="Step 6/10: AI-slop prevention scan" -->

Quick scan — cut scope inflation, premature abstraction, over-validation, documentation bloat, feature creep. Only include what was explicitly requested.

---

## Step 6: Pre-Generation Gap Review
<!-- task_boundary: TaskStatus="Step 7/10: Running plan consultant (gap review)" -->

**Trivial/Simple**: Announce skip (template from Step 0). Note in plan: `## Plan Consultant Summary: Skipped — [trivial/simple]`. Proceed to Step 7.

**Complex**: HARD STOP below — no exceptions.

> [!WARNING]
> **No exemptions.** Prior `/explore` sessions, research findings, or existing codebase understanding do NOT exempt complex tasks from gap review. The consultant catches blind spots in YOUR analysis — it exists precisely because you think you already understand the problem.

> [!CAUTION]
> ### HARD STOP — Complex Tasks Only
>
> **GATE** — Step 7 BLOCKED until ALL pass:
> 1. `.amag/reviews/{planId}-consultant-response.md` exists
> 2. Response contains `verdict:` line
> 3. All CRITICAL gaps resolved
> 4. `.amag/reviews/{planId}-consultant-cli-attempts.log` exists
>
> **ANY fail → CANNOT proceed.**

Load `plan-consultant` skill NOW. It handles gap analysis via `external-cli-runner` with self-review fallback.

**Verify GATE PASS**:
```
test -f .amag/reviews/{planId}-consultant-response.md && test -f .amag/reviews/{planId}-consultant-cli-attempts.log && grep verdict: .amag/reviews/{planId}-consultant-response.md && echo GATE PASS || echo GATE FAIL
```
`GATE FAIL` → re-run consultant. Still fails → self-review fallback.

**Gaps**: CRITICAL → `notify_user` → wait → re-run. MINOR → fix silently. AMBIGUOUS → apply default, disclose.

---

## Step 7: Generate Plan
<!-- task_boundary: TaskStatus="Step 8/10: Generating implementation plan" -->

### Readiness Gate (MANDATORY)

```
test -f .amag/plan-checkpoints/clearance.done && echo "GATE: CLEARANCE OK" || echo "GATE: BLOCKED — Go back to Step 3."
```
**If BLOCKED → return to earliest skipped step.**

> [!CAUTION]
> **Read `.agent/resources/plan-template.md` NOW.** The plan MUST follow that template exactly.

Create `implementation_plan.md` using the template. All template sections MUST be present.

### Post-Generation Checks

Read `.agent/resources/plan-generation-checks.md` via `view_file` and run all three checks in order. Fix issues before proceeding. If CRITICAL gaps found → surface them in Step 8's `notify_user` alongside the A/B options.

---

## Step 8: High-Accuracy Gate
<!-- task_boundary: TaskStatus="Step 9/10: Presenting plan for review" -->

**Trivial/Simple**: Auto-select Option A. Combine with Step 9 approval message. Proceed to Step 9.

**Complex** — present via `notify_user`:

```
Plan is ready. How would you like to proceed?

- **Option A — Proceed to Approval**: Skip critic review.

- **Option B — Critical Review Pass**: Activate `plan-critic` for independent review.
```

**Option B**: Load `plan-critic` skill. Loop until APPROVE or user cancels.

---

## Step 9: Wait for Approval
<!-- task_boundary: TaskStatus="Step 9/10: Waiting for user approval" -->

Present plan via `notify_user` (`BlockedOnUser: true`, `ShouldAutoProceed: false`). MUST include:

> ⚠️ Approving this plan does **NOT** start implementation. Type `/start-work` to begin.

---

## Step 10: Persist Plan (After Approval ONLY)
<!-- task_boundary: TaskStatus="Step 10/10: Persisting approved plan" -->

1. **Check `.amag/active-plan.md`** — if exists with unchecked tasks → ask: Archive or Resume?
2. **Write `.amag/active-plan.md`** with YAML header (`plan_name`, `status: approved`, timestamps) and task checklist. **MUST include FV1-FV3** (Final Verification Wave tasks from the plan template) — they are NOT optional.
3. **Archive reviews**:
   ```
   run_command: [ "$(ls -A .amag/reviews/ 2>/dev/null)" ] && mkdir -p .amag/archive/reviews/{planId} && mv .amag/reviews/* .amag/archive/reviews/{planId}/ || true
   ```
4. **Clean up checkpoints**: `run_command: rm -rf .amag/plan-checkpoints/`

---

## STOP — Workflow Ends Here

**Do NOT implement.** Inform the user:

> **📋 Plan saved.** Use `/start-work` to begin execution.

**Under no circumstances**: start implementing, edit source files, transition to EXECUTION mode, or interpret "Proceed"/"Go ahead" as a command to execute. Only `/start-work` triggers implementation.

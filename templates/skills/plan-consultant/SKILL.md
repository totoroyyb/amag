---
name: plan-consultant
description: Pre-generation gap analysis — surface hidden requirements, AI-slop risks, and missing guardrails before the plan is written
---

# Plan Consultant

Pre-planning analysis skill. Activated before generating a work plan. Identifies gaps, hidden requirements, and AI failure points — then classifies each for handling. Supports two backends: CLI agent review (via `external-cli-runner` skill) or enhanced self-review.

Derived from OMO's Metis agent (pre-planning consultant, read-only, intent classification first).

## When to Activate

**Only during `/plan` workflow**, at Step 6 (Pre-Generation Gap Review) — after the interview is complete and clearance check has passed, but BEFORE generating `implementation_plan.md`.

## Step 1: Write Review Request

Write the request file via `write_to_file` to `.amag/reviews/{planId}-consultant-request.md`.

**Inline key context as a baseline.** The request should contain enough information for the reviewer to understand the task without filesystem access (user's goal, interview transcript, research findings, key file contents). However, external CLIs **can and should read additional files** from the codebase for deeper analysis. The hard constraint is on **command execution**, not file reading.

```markdown
---
role: consultant
phase: pre-generation
plan_id: {planId}
created: {timestamp}
---

# SYSTEM

You are a Plan Consultant in the AMAG agent protocol system.
You operate under maximum rigor — thorough analysis, zero shortcuts.
You are a disciplined senior engineer who catches what others miss.

Your output feeds directly into the planner. Be precise, actionable,
and ruthlessly honest. No flattery, no filler, no hedging.

## Hard Constraints

- **ANALYSIS ONLY.** You do NOT implement, do NOT modify files, do NOT run shell commands.
- **NO COMMAND EXECUTION.** Do not run builds, tests, scripts, or any shell commands. Commands may fail in sandboxed environments. You CAN read files from the codebase to deepen your analysis.
- **Follow the response format exactly.** The planner parses your output programmatically.
- **No AI slop.** No "delve", "leverage", "comprehensive", "robust". Plain words, direct statements.

## Your Job

Analyze this request BEFORE the plan is written. Surface gaps that would
cause the plan to fail, be incomplete, or produce AI-slop output.

## Phase 0: Intent Classification (MANDATORY FIRST STEP)

Classify the work intent:
- Refactoring — SAFETY: regression prevention, behavior preservation
- Build from Scratch — DISCOVERY: explore patterns, informed questions
- Mid-sized Task — GUARDRAILS: exact deliverables, explicit exclusions
- Collaborative — INTERACTIVE: incremental clarity through dialogue
- Architecture — STRATEGIC: long-term impact, trade-off analysis
- Research — INVESTIGATION: exit criteria, parallel probes

## What to Identify

1. Hidden intentions and unstated requirements
2. Ambiguities that could derail implementation
3. AI-slop risks:
   - Scope inflation (steps beyond what was asked)
   - Premature abstraction (utilities for single-use code)
   - Over-validation (15 error checks for 3 inputs)
   - Documentation bloat (JSDoc on every internal function)
   - Feature creep ("also add logging, metrics, caching")
4. Questions the planner should ask the user
5. Guardrails (explicit MUST NOT items)
6. Missing acceptance criteria — all criteria must be agent-executable

---

## User's Goal
{summarize what user wants}

## What Was Discussed
{key points from interview}

## Planner's Understanding
{interpretation of requirements}

## Research Findings
{discoveries from codebase exploration}

## Relevant File Contents (Baseline)
{paste key file contents that provide essential context — the reviewer may also read additional files from the codebase for deeper analysis}

---

## Response Format (MUST follow exactly)

```
---
verdict: APPROVE | REVISE
---

## Intent Classification
**Type**: [classification]
**Confidence**: [High | Medium | Low]

## Questions for User (if any)
1. [Most critical first]

## Identified Risks
- [Risk]: [Mitigation]

## Directives for Planner
- MUST: [required action]
- MUST NOT: [forbidden action]
- PATTERN: Follow `[file:lines]`

## AI-Slop Warnings
- [Detected pattern]: [How to avoid]
```
```

## Step 2: Execute Review via CLI

Load `external-cli-runner` skill. Invoke with:
- **configPath**: `review.consultant`
- **requestFile**: `.amag/reviews/{planId}-consultant-request.md`
- **responseFileRaw**: `.amag/reviews/{planId}-consultant-response-raw.md`
- **responseFile**: `.amag/reviews/{planId}-consultant-response.md`
- **requiredField**: `verdict:`
- **fallbackAction**: "Proceed to Step 3 (Self-Review Path)"

If the runner returns **success** → skip Step 3, proceed to **Step 4: Act on Verdict**.
If the runner returns **failure** (CLI not found, or 3 retries exhausted) → proceed to **Step 3: Self-Review**.

## Step 3: Self-Review Path (Fallback)

When no CLI is available or CLI execution failed after retries.

### 1. Write Review Request

If not already written in Step 1, write the **same** request file to `.amag/reviews/{planId}-consultant-request.md`.

### 2. Perform Self-Review

Read the request file back via `view_file`. **Adopt the consultant role** defined in the file. Work through:

1. **Intent Classification** — classify the request type
2. **Six Gap Categories**:
   - Questions not asked (compare interview transcript against required topics)
   - Missing guardrails (Must NOT Have items)
   - Scope creep risks (anything beyond the explicit request)
   - Unvalidated assumptions (file locations, tech choices, data shapes)
   - Missing acceptance criteria (every task needs agent-verifiable conditions)
   - Unaddressed edge cases (empty inputs, failures, concurrency)
3. **AI-Slop Detection** — scan for inflation, abstraction, over-validation, bloat
4. **Directives** — generate MUST/MUST NOT items for planner

### 3. Write Response

Write response to `.amag/reviews/{planId}-consultant-response.md` using the exact same format as the CLI path. Set `backend: self-review` in metadata.

## Step 4: Act on Verdict

Read `.amag/reviews/{planId}-consultant-response.md` via `view_file`.

### Gap Classification Protocol

For each gap found, classify it:

| Class | Definition | Action |
|---|---|---|
| **CRITICAL** | Requires user decision — business logic choice, unclear requirement | Do NOT generate plan. Ask user via `notify_user`. After answer → re-run consultant |
| **MINOR** | Can self-resolve — missing file ref findable via search | Fix silently. Note in gap summary |
| **AMBIGUOUS** | Has reasonable default — error handling style, naming convention | Apply default. Disclose in plan summary under "Defaults Applied" |

### If CRITICAL gaps exist:
- Surface via `notify_user` with `BlockedOnUser: true`
- After user answers → re-run clearance check → re-run consultant → generate plan

### If only MINOR/AMBIGUOUS:
- Fix/apply defaults silently
- Proceed immediately to plan generation

## Output Format (for presenting results)

After processing the consultant response, present this summary to the user via `notify_user` and include it in the plan's `## Plan Consultant Summary` section:

```
## Plan Consultant Analysis

**Backend**: [cli: claude | self-review]

---

### CRITICAL Gaps (need user input before generating plan)

- [Gap description]: [Specific question to ask]

### MINOR Gaps (self-resolved)

- [Gap]: [How resolved]

### AMBIGUOUS Gaps (defaults applied)

- [Gap]: [Default chosen, override if needed]

---

### Directives for Planner

- MUST: [required action]
- MUST NOT: [forbidden action]

### AI-Slop Warnings

- [Pattern]: [Prevention measure]

**No gaps found** ← If all clear
```

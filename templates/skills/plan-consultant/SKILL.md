---
name: plan-consultant
description: Pre-generation gap analysis — surface hidden requirements, AI-slop risks, and missing guardrails before the plan is written
---

# Plan Consultant

Pre-planning analysis skill. Activated before generating a work plan. Identifies gaps, hidden requirements, and AI failure points — then classifies each for handling. Supports two backends: CLI agent review (via `run_command`) or enhanced self-review.

Derived from OMO's Metis agent (pre-planning consultant, read-only, intent classification first).

## When to Activate

**Only during `/plan` workflow**, at Step 6 (Pre-Generation Gap Review) — after the interview is complete and clearance check has passed, but BEFORE generating `implementation_plan.md`.

## Step 1: Detect Review Backend

1. Read `.amag/config.json` via `view_file`. Check `review.consultant` settings.
2. If `cli` is set, verify availability:
   ```
   run_command: which <cli_name>
   ```
3. If exit 0 → **CLI Path** (Step 2A). If exit non-zero or no CLI configured → **Self-Review Path** (Step 2B).

Update `task_boundary` with: `TaskStatus: "Plan consultant: detecting review backend..."`

### Fallback Warning (MANDATORY when falling back to self-review)

If CLI was configured but not found, **immediately surface a prominent warning** before proceeding:

1. Update `task_boundary`: `TaskStatus: "⚠️ Plan consultant: CLI not found — falling back to self-review"`
2. Include in output a clear alert:
   ```
   > [!CAUTION]
   > **Review backend fallback**: Configured CLI `{cli_name}` was not found on PATH.
   > Falling back to self-review (same agent reviewing its own work).
   > For independent review, install the CLI: `npm install -g @openai/codex`
   > or reconfigure: `amag config set review.consultant.cli null`
   ```

This ensures the user is never silently downgraded from independent CLI review to self-review.

## Step 2A: CLI Review Path

When a CLI agent is available, delegate the review for an independent perspective.

### 1. Write Review Request

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

### 2. Spawn CLI Agent

Read model and thinking level from config (defaults: `claude-opus-4-6`, thinking: `max`). Spawn via `run_command`.

**For claude:**
```
run_command: claude --print --model {model} --effort {thinking_mapped} --dangerously-skip-permissions < .amag/reviews/{planId}-consultant-request.md > .amag/reviews/{planId}-consultant-response-raw.md 2>&1
```

**For codex:**
```
run_command: codex exec --full-auto -m {model} -c model_reasoning_effort="{thinking_mapped}" -o .amag/reviews/{planId}-consultant-response-raw.md < .amag/reviews/{planId}-consultant-request.md
```

If `-o` flag is not available on the installed version, fall back to stdout redirect:
```
run_command: codex exec --full-auto -m {model} -c model_reasoning_effort="{thinking_mapped}" < .amag/reviews/{planId}-consultant-request.md > .amag/reviews/{planId}-consultant-response-raw.md 2>&1
```

**For gemini-cli:**
```
run_command: cat .amag/reviews/{planId}-consultant-request.md | gemini --yolo > .amag/reviews/{planId}-consultant-response-raw.md 2>&1
```

**Thinking level mapping** (read from `review.consultant.thinking` in config):

| Config value | claude `--effort` | codex `-c model_reasoning_effort` | gemini behavior |
|---|---|---|---|
| `max` | `high` | `high` | Default |
| `high` | `high` | `high` | Default |
| `medium` | `medium` | `medium` | Default |
| `low` | `low` | `low` | Default |
| `none` | `low` | `low` | Default |

Set `WaitMsBeforeAsync: 500` to run async. Poll via `command_status` at 60s intervals. If no progress for 2 polls → `send_command_input(Terminate=true)` → fall back to Self-Review Path (Step 2B).

> [!NOTE]
> **No `--json` flag.** CLI output should be human-readable in the terminal for transparency. Structured capture happens via the response file, not JSON parsing.

### 3. Parse Response

If a raw response file was produced (`.amag/reviews/{planId}-consultant-response-raw.md`), read it via `view_file`. If the CLI wrote to stdout instead, read from `command_status` output.

Clean up the raw output — strip ANSI codes, CLI chrome, or wrapper formatting — and write the final parsed response to `.amag/reviews/{planId}-consultant-response.md` via `write_to_file`.

Verify the response contains the required `verdict:` line. If missing or malformed → fall back to Self-Review Path (Step 2B).

Proceed to **Step 3: Act on Verdict**.

## Step 2B: Self-Review Path

When no CLI is available, perform enhanced self-review using the same evaluation criteria.

### 1. Write Review Request

Write the **same** request file as Step 2A to `.amag/reviews/{planId}-consultant-request.md`. This creates an audit trail and ensures identical evaluation criteria.

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

## Step 3: Act on Verdict

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

## Output Format

```
## Plan Consultant Analysis

**Backend**: [cli: claude | self-review]

**CRITICAL gaps (need user input before generating plan):**
- [Gap description]: [Specific question to ask]

**MINOR gaps (self-resolved):**
- [Gap]: [How resolved]

**AMBIGUOUS gaps (defaults applied):**
- [Gap]: [Default chosen, override if needed]

**Directives for Planner:**
- MUST: [required action]
- MUST NOT: [forbidden action]

**AI-Slop Warnings:**
- [Pattern]: [Prevention measure]

**No gaps found** ← If all clear
```

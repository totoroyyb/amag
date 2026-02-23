---
name: plan-critic
description: Post-generation plan review — verify references, executability, and acceptance criteria before execution
---

# Plan Critic

Post-generation plan review skill. Activated after `implementation_plan.md` is written. Verifies the plan is executable and references are valid. Supports two backends: CLI agent review (via `external-cli-runner` skill) or enhanced self-review.

Derived from OMO's Momus agent (plan reviewer, approval bias, blocker-only focus, max 3 issues).

## When to Activate

- `/plan` Step 8 (High-Accuracy Gate) — if user selects "Critical Review Pass"

## Step 1: Write Review Request

Write the request via `write_to_file` to `.amag/reviews/{planId}-critic-request.md`.

**Inline the full plan content as a baseline.** The request should contain the complete `implementation_plan.md` and key referenced file contents. However, external CLIs **can and should read additional files** from the codebase to verify references. The hard constraint is on **command execution**, not file reading.

```markdown
---
role: critic
phase: post-generation
plan_id: {planId}
created: {timestamp}
---

# SYSTEM

You are a Plan Critic in the AMAG agent protocol system.
You are a practical, experienced engineer with approval bias.
Your job is fast, focused verification — not perfectionism.

You answer ONE question: "Can a developer execute this plan without getting stuck?"

## Hard Constraints

- **ANALYSIS ONLY.** You do NOT implement, do NOT modify files, do NOT run shell commands.
- **NO COMMAND EXECUTION.** Do not run builds, tests, scripts, or any shell commands. Commands may fail in sandboxed environments. You CAN read files from the codebase to verify references and deepen your analysis.
- **Follow the response format exactly.** The planner parses your output programmatically.
- **No AI slop.** No "delve", "leverage", "comprehensive", "robust". Direct statements only.
- **Max 3 blocking issues.** If you find more, pick the 3 most critical. Everything else is a warning.

## What You Check (ONLY THESE)

### 1. Reference Verification (CRITICAL)
- Do referenced files exist based on the file contents provided below?
- Do referenced line numbers contain relevant code?
- If "follow pattern in X" is mentioned, does X demonstrate that pattern?
- PASS even if reference isn't perfect (developer can explore from there)
- FAIL only if reference doesn't exist OR points to completely wrong content

### 2. Executability Check (PRACTICAL)
- Can a developer START working on each task?
- Is there at least a starting point (file, pattern, or clear description)?
- PASS even if some details need figuring out during implementation
- FAIL only if task is so vague developer has NO idea where to begin

### 3. Acceptance Criteria
- Are criteria agent-executable (commands, not "user manually tests")?
- FAIL if any criterion requires human intervention

### 4. Critical Blockers Only
- Missing information that would COMPLETELY STOP work
- Contradictions that make the plan impossible to follow
- NOT blockers: missing edge cases, incomplete criteria, style preferences,
  "could be clearer" suggestions, minor ambiguities

## Anti-Patterns (DO NOT reject for these)
❌ "Task 3 could be clearer about error handling" — NOT a blocker
❌ "Consider adding acceptance criteria for..." — NOT a blocker
❌ "The approach in Task 5 might be suboptimal" — NOT YOUR JOB
❌ Listing more than 3 issues — pick top 3 most critical
❌ Rejecting because you'd do it differently — NEVER

**APPROVAL BIAS: When in doubt, APPROVE.**

---

## Plan Content

{full implementation_plan.md content}

## Referenced File Contents (Baseline)
{paste key file contents that are referenced in the plan — the reviewer may also read additional files from the codebase to verify other references}

---

## Response Format (MUST follow exactly)

```
---
verdict: APPROVE | REVISE | REJECT
---

## Summary
[1-2 sentences explaining verdict]

## Blocking Issues (max 3, only if REVISE or REJECT)
1. [Specific issue + exact task/file + what needs to change]
2. [...]
3. [...]

## Warnings (optional, non-blocking)
- [Warning detail]
```
```

## Step 2: Execute Review via CLI

Load `external-cli-runner` skill. Invoke with:
- **configPath**: `review.critic`
- **requestFile**: `.amag/reviews/{planId}-critic-request.md`
- **responseFileRaw**: `.amag/reviews/{planId}-critic-response-raw.md`
- **responseFile**: `.amag/reviews/{planId}-critic-response.md`
- **requiredField**: `verdict:`
- **fallbackAction**: "Proceed to Step 3 (Self-Review Path)"

If the runner returns **success** → skip Step 3, proceed to **Step 4: Act on Verdict**.
If the runner returns **failure** (CLI not found, or 3 retries exhausted) → proceed to **Step 3: Self-Review**.

## Step 3: Self-Review Path (Fallback)

When no CLI is available or CLI execution failed after retries.

### 1. Write Review Request

If not already written in Step 1, write the **same** request file to `.amag/reviews/{planId}-critic-request.md`.

### 2. Perform Self-Review

Read the request file back via `view_file`. **Adopt the critic role**. Work through:

1. **Reference Verification** — For each file reference in the plan:
   ```
   view_file: {referenced path}
   ```
   If file doesn't exist → BLOCKING issue.
   If line numbers cited → verify content at those lines.
   Use `grep_search` for batch checking when plan references many files.

2. **Executability Check** — For each task: is there enough context to START?

3. **Acceptance Criteria** — Scan every criterion. Flag any requiring human action.

4. **Blocker Scan** — Contradictions, impossible requirements, missing start points.

**CRITICAL**: Maintain approval bias. The goal is UNBLOCKING work, not blocking it with perfectionism. Max 3 issues.

### 3. Write Response

Write response to `.amag/reviews/{planId}-critic-response.md` using the exact same format. Set `backend: self-review`.

## Step 4: Act on Verdict

Read `.amag/reviews/{planId}-critic-response.md` via `view_file`.

### If APPROVE:
- Log: "Plan critic: APPROVE — plan is ready"
- Proceed to plan approval / start-work

### If REVISE:
- Fix ALL blocking issues in `implementation_plan.md`
- Re-write review request with updated plan
- Re-invoke plan-critic (loop)
- Update `task_boundary`: `"Plan critic: REVISE — fixing N blocking issues..."`

### If REJECT:
- Surface rejection to user via `notify_user`
- Include the specific blocking issues
- Wait for user guidance

## Loop Protocol

```
while verdict != APPROVE:
  1. Fix ALL blocking issues in implementation_plan.md
  2. Write new review request with updated plan content
  3. Re-invoke plan-critic (same backend)
  4. Read new response
```

No maximum iterations. Loop until APPROVE or user explicitly cancels.

## Output Format

```
## Plan Critic Result

**Backend**: [cli: codex | self-review]
**VERDICT**: [APPROVE | REVISE | REJECT]

**Summary**: [1-2 sentences]

---

If REVISE/REJECT:

### Blocking Issues (max 3)

1. [Issue]: [Location] — [What's wrong] — [How to fix]

### Warnings (non-blocking)

- [Warning detail]

---

If APPROVE:

### Verification Summary

- File references: [N/M verified]
- Acceptance criteria: [N/M agent-executable]
- Executability: [All tasks have starting points]
```

## Review Archive

After plan is approved, archive review files:
```
run_command: mkdir -p .amag/archive/reviews/{planId} && mv .amag/reviews/{planId}-* .amag/archive/reviews/{planId}/
```

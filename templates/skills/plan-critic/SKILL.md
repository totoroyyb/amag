---
name: plan-critic
description: Post-generation plan review — verify references, executability, and acceptance criteria before execution
---

# Plan Critic

Post-generation plan review skill. Activated after `implementation_plan.md` is written. Verifies the plan is executable and references are valid. Supports two backends: CLI agent review (via `run_command`) or enhanced self-review.

Derived from OMO's Momus agent (plan reviewer, approval bias, blocker-only focus, max 3 issues).

## When to Activate

- `/plan` Step 8 (High-Accuracy Gate) — if user selects "Critical Review Pass"
- `/start-work` Final Verification — scope fidelity and acceptance criteria check

## Step 1: Detect Review Backend

1. Read `.amag/config.json` via `view_file`. Check `review.critic` settings.
2. If `cli` is set, verify availability:
   ```
   run_command: which <cli_name>
   ```
3. If exit 0 → **CLI Path** (Step 2A). If exit non-zero or no CLI configured → **Self-Review Path** (Step 2B).

Update `task_boundary` with: `TaskStatus: "Plan critic: detecting review backend..."`

### Fallback Warning (MANDATORY when falling back to self-review)

If CLI was configured but not found, **immediately surface a prominent warning** before proceeding:

1. Update `task_boundary`: `TaskStatus: "⚠️ Plan critic: CLI not found — falling back to self-review"`
2. Include in output a clear alert:
   ```
   > [!CAUTION]
   > **Review backend fallback**: Configured CLI `{cli_name}` was not found on PATH.
   > Falling back to self-review (same agent reviewing its own work).
   > For independent review, install the CLI: `npm install -g @openai/codex`
   > or reconfigure: `amag config set review.critic.cli null`
   ```

This ensures the user is never silently downgraded from independent CLI review to self-review.

## Step 2A: CLI Review Path

### 1. Write Review Request

Write the request via `write_to_file` to `.amag/reviews/{planId}-critic-request.md`:

```markdown
---
role: critic
phase: post-generation
plan_id: {planId}
created: {timestamp}
---

## Your Role: Plan Critic

You are a practical plan reviewer. Your goal: verify the plan is
EXECUTABLE and REFERENCES ARE VALID.

You answer ONE question: "Can a developer execute this without getting stuck?"

## What You ARE Here To Do
- Verify referenced files exist and contain what's claimed
- Ensure tasks have enough context to START working
- Catch BLOCKING issues only (things that completely stop work)

## What You Are NOT Here To Do
- Nitpick every detail
- Question the approach or architecture choices
- Demand perfection
- Find as many issues as possible
- Force multiple revision cycles

**APPROVAL BIAS: When in doubt, APPROVE.**

## What You Check (ONLY THESE)

### 1. Reference Verification (CRITICAL)
- Do referenced files exist?
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

## Plan Content

{full implementation_plan.md content}

## Response Format (MUST follow exactly)

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

### 2. Spawn CLI Agent

Read model from config (default: `gpt-5.2`). Spawn via `run_command`:

**For codex (default for critic):**
```
run_command: echo "$(cat .amag/reviews/{planId}-critic-request.md)" | codex exec --full-auto --json -m gpt-5.2
```

**For claude-code:**
```
run_command: claude --print --model claude-opus-4-6 --max-turns 1 --dangerously-skip-permissions < .amag/reviews/{planId}-critic-request.md
```

**For gemini-cli:**
```
run_command: cat .amag/reviews/{planId}-critic-request.md | gemini --yolo
```

Set `WaitMsBeforeAsync: 500`. Poll via `command_status` at 60s intervals. Timeout: kill via `send_command_input(Terminate=true)` → fall back to Self-Review Path (Step 2B).

### 3. Parse Response

Read CLI output. Write parsed response to `.amag/reviews/{planId}-critic-response.md`. Proceed to **Step 3: Act on Verdict**.

## Step 2B: Self-Review Path

### 1. Write Review Request

Write the **same** request file as Step 2A to `.amag/reviews/{planId}-critic-request.md`.

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

## Step 3: Act on Verdict

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

If REVISE/REJECT:

### Blocking Issues (max 3)
1. [Issue]: [Location] — [What's wrong] — [How to fix]

### Warnings (non-blocking)
- [Warning detail]

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

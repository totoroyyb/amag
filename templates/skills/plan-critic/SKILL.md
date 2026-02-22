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

### 2. Spawn CLI Agent

Read model and thinking level from config (defaults: `gpt-5.2`, thinking: `medium`). Spawn via `run_command`.

**For codex (default for critic):**
```
run_command: codex exec --full-auto -m {model} -c model_reasoning_effort="{thinking_mapped}" -o .amag/reviews/{planId}-critic-response-raw.md < .amag/reviews/{planId}-critic-request.md
```

If `-o` flag is not available on the installed version, fall back to stdout redirect:
```
run_command: codex exec --full-auto -m {model} -c model_reasoning_effort="{thinking_mapped}" < .amag/reviews/{planId}-critic-request.md > .amag/reviews/{planId}-critic-response-raw.md 2>&1
```

**For claude:**
```
run_command: claude --print --model {model} --effort {thinking_mapped} --dangerously-skip-permissions < .amag/reviews/{planId}-critic-request.md > .amag/reviews/{planId}-critic-response-raw.md 2>&1
```

**For gemini-cli:**
```
run_command: cat .amag/reviews/{planId}-critic-request.md | gemini --yolo > .amag/reviews/{planId}-critic-response-raw.md 2>&1
```

**Thinking level mapping** (read from `review.critic.thinking` in config):

| Config value | claude `--effort` | codex `-c model_reasoning_effort` | gemini behavior |
|---|---|---|---|
| `max` | `high` | `high` | Default |
| `high` | `high` | `high` | Default |
| `medium` | `medium` | `medium` | Default |
| `low` | `low` | `low` | Default |
| `none` | `low` | `low` | Default |

Set `WaitMsBeforeAsync: 500`. Poll via `command_status` at 60s intervals. Timeout: kill via `send_command_input(Terminate=true)` → fall back to Self-Review Path (Step 2B).

> [!NOTE]
> **No `--json` flag.** CLI output should be human-readable in the terminal for transparency. Structured capture happens via the response file, not JSON parsing.

### 3. Parse Response

If a raw response file was produced (`.amag/reviews/{planId}-critic-response-raw.md`), read it via `view_file`. If the CLI wrote to stdout instead, read from `command_status` output.

Clean up the raw output — strip ANSI codes, CLI chrome, or wrapper formatting — and write the final parsed response to `.amag/reviews/{planId}-critic-response.md` via `write_to_file`.

Verify the response contains the required `verdict:` line. If missing or malformed → fall back to Self-Review Path (Step 2B).

Proceed to **Step 3: Act on Verdict**.

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

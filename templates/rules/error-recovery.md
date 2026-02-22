# Error Recovery Protocol

## Core Principle

Fix root causes, not symptoms. Re-verify after EVERY fix attempt. **Never retry the same failing action without first understanding WHY it failed.**

## On Fix Failure

1. **Diagnose**: Read the error completely. Understand WHY, not just WHAT.
2. **Hypothesize**: Form a theory BEFORE making changes.
3. **Fix minimally**: Change only what addresses the root cause. NEVER refactor while fixing.
4. **Verify**: Run build/test/lint immediately after the fix.

## Command Wait Loop Detection (CRITICAL)

When running a command and waiting for output, you MUST self-monitor for this anti-pattern:

**The blind retry loop**: running a command → waiting → timeout/error → increasing wait time → running again → waiting longer → timeout again...

### Trigger: Same command fails or hangs twice

After the **second** time a command produces the same error, timeout, or hangs:

1. **STOP** running the command again
2. **DIAGNOSE** why it's failing — don't just wait longer:
   - Read error output carefully. What is it actually saying?
   - Check if a prerequisite is missing (dependency not installed, service not running, wrong directory)
   - Check if the command itself is wrong (wrong flags, wrong path, wrong environment)
   - Check if something is blocking it (port already in use, lock file, permission issue)
3. **Fix the root cause** before re-running
4. If you cannot determine the cause after investigation: **ASK USER** immediately. Do not retry a third time.

### Anti-Patterns (You MUST Recognize These)

| What You're Doing | What You Should Do Instead |
|---|---|
| Running `npm start` again with a longer wait because it timed out | Check the error output — is a port in use? Is a dependency missing? |
| Re-running a build command with `WaitMsBeforeAsync: 10000` after it failed with `5000` | The wait time is not the problem. Read the build errors. |
| Running the same test suite again hoping it passes this time | Tests don't flake for no reason. Read the failure, fix the cause. |
| Waiting for a dev server to start after it already failed to start | The server didn't start because of an error. Find and fix the error. |
| Increasing `WaitDurationSeconds` on `command_status` because the command hasn't completed | Ask yourself: is the command actually making progress, or is it stuck? Check partial output. |

**The key insight**: If a command failed or timed out, making it wait longer is almost never the fix. The fix is understanding *why* it failed.

---

## Long-Running Command Protocol (CRITICAL)

Some commands take legitimate time (large test suites, full builds, cargo compilation). But "takes a long time" and "silently hung" look identical if you don't actively check. You MUST distinguish between them.

### Poll discipline

- Use `WaitDurationSeconds: 60` maximum per `command_status` call. **Never use 300.** Waiting 5 minutes per poll burns context and prevents any decision-making.
- After each poll, **read the partial output**. Note how many lines appeared since the last poll.
- If the output is growing → the command is making progress. Keep polling.
- If the output has not grown for **2 consecutive polls** → the command is hung. Act immediately.

### When hung: KILL IT

This is a hard instruction. When a command is confirmed hung:

1. **Call `send_command_input(CommandId, Terminate=true)`** — this kills the process. Do NOT skip this step and keep polling. A hung process left running blocks the agent indefinitely.
2. **Read whatever partial output exists** — look for the last line of output. Where did it stop? What was it doing?
3. **Diagnose the root cause**: Did a test block waiting for I/O? Did a build step stall on a missing resource? Did execution reach an infinite loop?
4. **Decide a different approach** before re-running:
   - Add a timeout flag: `cargo test -- --test-timeout 30`, `npm test -- --forceExit`
   - Run a subset: target a specific test file or module instead of the full suite
   - Skip and report: if the hang cannot be resolved, **report to the user** with what was tried

### Self-counting rule for hung commands

"Still running with zero output growth" counts the same as a failed command for the purpose of the 3-failure escalation rule. Do not assume a hung command is "different" from a failing command just because it has no error message.

---

## 3-Failure Escalation (All Failure Types)

After 3 consecutive failed attempts on the same issue (whether fix attempts, command retries, hung-and-killed commands, or any repeated action):

1. **STOP** all further attempts immediately
2. **REVERT** to last known working state (undo edits or `git checkout`)
3. **DOCUMENT** what was attempted and what failed:
   ```
   Attempt 1: [what I tried] → [what happened]
   Attempt 2: [what I tried] → [what happened]
   Attempt 3: [what I tried] → [what happened]
   ```
4. **TRY A FUNDAMENTALLY DIFFERENT APPROACH** — not a variation of the same thing, but a genuinely different strategy
5. If the different approach also fails: **ASK USER** for guidance

### When Operating Under `/debug` Workflow

The `/debug` workflow has its own escalation for **hypothesis-level failures** (root cause theories that prove wrong): 3 failed hypotheses → `architecture-advisor` → user. That escalation governs debugging reasoning. This file's 3-failure escalation governs **command-level failures** (builds, tests, hung processes). If both apply simultaneously, the debug hypothesis escalation takes precedence for the investigation, while this file's protocol applies to any commands that fail during that investigation.

## Self-Counting Rule

Since there is no external system counting your failures, you MUST track them yourself:

- **Before every retry**, ask: "Is this the same action I already tried? How many times?"
- **Count honestly**. Changing a wait timeout does NOT make it a different attempt.
- **A "different attempt" means** a genuinely different approach — different command, different fix strategy, different angle of diagnosis.

## Hard Rules

| Rule | No Exceptions |
|------|---------------|
| Never shotgun debug (random changes hoping something works) | Never |
| Never leave code in a broken state after failures | Never |
| Never delete failing tests to "pass" | Never |
| Never suppress errors with `try/catch {}` to hide the problem | Never |
| Never continue past 3 failures silently | Never |
| Never increase wait time as a "fix" for a failing command | Never |
| Never re-run the same failing command without diagnosing first | Never |

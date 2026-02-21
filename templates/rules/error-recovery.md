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

## 3-Failure Escalation (All Failure Types)

After 3 consecutive failed attempts on the same issue (whether fix attempts, command retries, or any repeated action):

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

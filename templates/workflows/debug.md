---
description: Systematic debugging — reproduce first, trace root cause, fix surgically, verify thoroughly
---

# /debug — Systematic Debugging

Engage systematic debugging mode. No guessing. No shotgun fixes. Trace the root cause, prove it, fix it once.

**MANDATORY**: Say "SYSTEMATIC DEBUG MODE" to the user when this activates.

**When active, `/debug` supersedes Auto-Ultrawork.** Debugging's hypothesis-iterate loop is inherently uncertain — ultrawork's "100% certainty before acting" conflicts with that. The debug workflow has its own thoroughness guarantees.

Load `deep-work` skill for exploration methodology (parallel searches, trace call chains, read 5-10 files minimum). The phase structure below takes precedence over deep-work's goal-driven autonomy.

## How This Gets Engaged

| Trigger | Entry Point |
|---|---|
| User says `/debug` explicitly | Phase 0 |
| Intent gate classifies a bug as HARD (see `GEMINI.md` difficulty gate) | Phase 0 |
| Transparent upgrade — inline fix failed, revealed deeper issue | Phase 1 (carry the failed attempt as eliminated hypothesis) |

## Phase 0 — Triage

Classify the bug type. This determines your investigation strategy.

| Bug Type | Key Investigation Strategy |
|---|---|
| **Test failure** | Read FULL error + stack trace. Check test setup/fixtures. Trace unexpected value to source |
| **Runtime error** | Capture stack trace. Find the throw line. Trace null/undefined backward to origin |
| **"It worked before"** | Check `git log` / `git diff` for recent changes. Find the changed assumption. Use `git bisect` if needed |
| **Intermittent** | Look for race conditions, shared mutable state, timing dependencies, async ordering |
| **Wrong behavior** (no error) | Compare expected vs actual. Find where the logic diverges. Add logging/assertions to narrow |

**Output**: State the bug type and your investigation strategy before proceeding.

## Phase 1 — Reproduce (NEVER SKIP)

**If you can't reproduce it, you can't verify a fix.**

1. **Find or write a failing test** that captures the bug behavior
   - If the project has a test framework: write a test that fails with the current bug
   - If no test framework: identify exact manual repro steps and document them
2. **Confirm the reproduction is reliable** — run it 2-3 times
3. **Minimize the repro** — strip away unrelated setup until you have the smallest case that still fails

**If reproduction fails**: This IS useful information. Document what you tried. The bug may be environment-specific, timing-dependent, or already fixed. Report to the user.

**Output**: A failing test or documented repro steps that reliably triggers the bug.

## Phase 2 — Root Cause Investigation

This is where you use `deep-work` exploration methodology. Fire parallel searches, trace call chains, read broadly.

### Step 1: Trace from Symptom to Source

Follow the **Root Cause Tracing** technique:

```
1. OBSERVE — Where does the error manifest? (file, line, function)
2. IMMEDIATE CAUSE — Which code directly produces the wrong behavior?
3. TRACE UPWARD — What called this code? What data did it pass?
4. FOLLOW THE DATA — Where did the bad/unexpected value originate?
5. FIND THE TRIGGER — What is the ORIGINAL source of the problem?
```

**Key principle**: Never fix where the error appears — trace to where it starts.

### Step 2: Form Competing Hypotheses

After tracing, form **2-3 hypotheses** about the root cause:

```
Hypothesis 1: [specific claim about what's wrong and why]
Hypothesis 2: [alternative explanation]
Hypothesis 3: [if applicable]
```

### Step 3: Eliminate Systematically

For each hypothesis:
1. **Predict** — If this hypothesis is correct, what specific behavior would I observe?
2. **Test** — Design a minimal check that distinguishes this hypothesis from others
3. **Observe** — Run the check. Does the prediction hold?
4. **Verdict** — CONFIRMED or ELIMINATED. Move on.

**Change ONE variable at a time.** If you change two things, you learn nothing.

**Output**: The confirmed root cause with evidence. You must be able to explain WHY the bug exists, not just WHERE.

## Phase 3 — Pattern Analysis

Before fixing, verify your understanding by comparing against working code:

1. **Find working examples** — Locate similar code in the codebase that works correctly
2. **Compare thoroughly** — What's different between the working code and the broken code?
3. **Validate the difference** — Does the difference explain the bug? (It should, if your root cause is correct)

This step catches cases where the "root cause" is actually a symptom of a wrong assumption. If working and broken code differ in ways your hypothesis doesn't explain, your hypothesis is wrong — go back to Phase 2.

**Output**: Confirmation that pattern analysis supports the root cause, OR a revised hypothesis.

## Phase 4 — Fix (Minimal & Surgical)

1. **Implement a single fix** that addresses the root cause — not the symptom
2. **Change ONE thing** — if your fix touches many files, question whether you're fixing the root cause or patching symptoms
3. **Verify the failing test/repro now passes**
4. **Run the full test suite** — check for regressions
5. **If the fix fails**: Do NOT try a variation. Go back to Phase 2 and re-examine your hypothesis

### Red Flags — Stop Immediately If:

- You're thinking "quick fix for now, investigate later"
- You're on your 3rd fix attempt without re-examining the root cause
- Your fix creates new failures in unrelated areas (signals architectural issue)
- You're suppressing errors rather than fixing them
- You can't explain WHY the fix works

## Phase 5 — Verification & Hardening

### Verify the Fix

Follow the full Verification Protocol from `GEMINI.md` (Steps 1-6), PLUS:

- [ ] Root cause identified and documented (you can explain WHY)
- [ ] Failing test/repro now passes
- [ ] Fix addresses root cause, not symptoms
- [ ] Full test suite passes (no regressions)
- [ ] Fix is minimal and focused — no scope creep

### Systemic Check

The bug you just fixed may exist elsewhere:

1. `grep_search` for the same pattern that caused the bug
2. If found in other locations → note them and report to the user
3. Do NOT fix other instances without discussing scope — just report

### Document Root Cause

In your final report to the user, include:

```
**Root Cause**: [What was actually wrong and why]
**Fix**: [What was changed to address it]
**Systemic Risk**: [Whether the same pattern exists elsewhere — yes/no + locations]
```

## Escalation

### Hypothesis-Level Escalation

After **3 failed hypotheses** (3 root cause theories tested and eliminated):

1. **STOP** further investigation
2. **Load `architecture-advisor` skill** — shift to read-only consulting mode
3. **Document** what was tested and eliminated:
   ```
   Hypothesis 1: [claim] → ELIMINATED because [evidence]
   Hypothesis 2: [claim] → ELIMINATED because [evidence]
   Hypothesis 3: [claim] → ELIMINATED because [evidence]
   ```
4. In advisor mode: re-examine the problem from a structural/architectural angle
5. If `architecture-advisor` cannot resolve → **ASK USER** with full context

### Command-Level Failures

If builds, tests, or commands fail/hang during debugging, follow `error-recovery.md` — that protocol governs command-level failures. The debug workflow's hypothesis escalation is separate from command-level escalation.

## Common Debugging Scenarios

### Test Failures
```
1. Read the FULL error message and stack trace
2. Identify which assertion failed and what it expected vs got
3. Check test setup — is the test environment configured correctly?
4. Check test data — are mocks/fixtures stale or wrong?
5. Trace the unexpected value backward to its source
```

### "It Worked Before"
```
1. git log -n 20 — what changed recently?
2. git diff HEAD~5 — inspect recent changes in the affected area
3. git bisect — if the breaking change isn't obvious, bisect to find it
4. Compare the breaking commit's assumption vs current state
5. Fix at the source of the assumption violation
```

### Intermittent Failures
```
1. Look for race conditions (shared state across threads/async)
2. Check for timing dependencies (setTimeout, setInterval, network)
3. Examine async operation ordering (Promise chains, event listeners)
4. Look for shared mutable state that isn't synchronized
5. Add deterministic waits or proper synchronization
```

## When to Use

- User says "debug", "trace this bug", "find the root cause"
- Auto-engaged by `GEMINI.md` difficulty gate when bug is classified as HARD
- Transparent upgrade when an inline fix fails and reveals deeper complexity
- Any time you need to understand WHY something is broken, not just make it work

## When NOT to Use

- Typos, obvious one-line fixes (just fix them directly)
- Build configuration issues (follow `error-recovery.md` instead)
- Feature requests disguised as bugs ("it doesn't do X" when X was never built)

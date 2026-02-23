---
description: Systematic debugging — reproduce first, trace root cause, fix surgically, verify thoroughly
---

# /debug — Systematic Debugging

Engage systematic debugging mode. No guessing. No shotgun fixes. Trace the root cause, prove it, fix it once.

**MANDATORY**: Announce to the user:

> **🔍 SYSTEMATIC DEBUG MODE**

**Auto-Ultrawork rigor applies during `/debug`**, but "100% certainty before acting" is relaxed — debugging's hypothesis-iterate loop is inherently uncertain. The debug workflow's phase structure governs the investigation; ultrawork provides base-level thoroughness.

Load `deep-work` skill for exploration methodology (parallel searches, trace call chains, read 5-10 files minimum). The phase structure below takes precedence over deep-work's goal-driven autonomy.

## Progress Tracking

Call `task_boundary` at **every phase transition** with:
- **TaskName**: `"Debugging: {symptom}"`
- **Mode**: `EXECUTION`
- **TaskStatus**: Use the directive shown at each phase (e.g. `"Phase 2/6: Reproducing the bug"`)
- **TaskSummary**: Cumulative — hypotheses formed/eliminated, evidence found

## How This Gets Engaged

| Trigger | Entry Point |
|---|---|
| User says `/debug` explicitly | Phase 1 |
| Intent gate classifies a bug as HARD (see `GEMINI.md` difficulty gate) | Phase 1 |
| Transparent upgrade — inline fix failed, revealed deeper issue | Phase 2 (carry failed attempt as eliminated hypothesis) |
| User says "debug", "trace this bug", "find the root cause" | Phase 1 |

**Do NOT use for**: typos/one-line fixes (just fix directly), build config issues (`error-recovery.md`), feature requests disguised as bugs.

## Phase 1 — Triage
<!-- task_boundary: TaskStatus="Phase 1/6: Triaging bug type" -->

Classify the bug type. This determines your investigation strategy.

| Bug Type | Key Investigation Strategy |
|---|---|
| **Test failure** | Read FULL error + stack trace. Check test setup/fixtures. Trace unexpected value to source |
| **Runtime error** | Capture stack trace. Find the throw line. Trace null/undefined backward to origin |
| **"It worked before"** | Check `git log` / `git diff` for recent changes. Find the changed assumption. Use `git bisect` if needed |
| **Intermittent** | Look for race conditions, shared mutable state, timing dependencies, async ordering |
| **Wrong behavior** (no error) | Compare expected vs actual. Find where the logic diverges. Add logging/assertions to narrow |

**Output**: State the bug type and your investigation strategy before proceeding.

## Phase 2 — Reproduce (NEVER SKIP)
<!-- task_boundary: TaskStatus="Phase 2/6: Reproducing the bug" -->

**If you can't reproduce it, you can't verify a fix.**

1. **Find or write a failing test** that captures the bug behavior
   - If the project has a test framework: write a test that fails with the current bug
   - If no test framework: identify exact manual repro steps and document them
2. **Confirm the reproduction is reliable** — run it 2-3 times
3. **Minimize the repro** — strip away unrelated setup until you have the smallest case that still fails

**If reproduction fails**: This IS useful information. Document what you tried. The bug may be environment-specific, timing-dependent, or already fixed. Report to the user.

**Output**: A failing test or documented repro steps that reliably triggers the bug.

## Phase 3 — Root Cause Investigation
<!-- task_boundary: TaskStatus="Phase 3/6: Investigating root cause" -->

This is where you use `deep-work` exploration methodology. Fire parallel searches, trace call chains, read broadly.

### Step 1: Trace from Symptom to Source

**Root Cause Tracing**: OBSERVE (where error manifests) → IMMEDIATE CAUSE (which code is wrong) → TRACE UPWARD (what called it, what data) → FOLLOW DATA (where bad value originated) → FIND TRIGGER (original source of problem).

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

## Phase 4 — Pattern Analysis
<!-- task_boundary: TaskStatus="Phase 4/6: Analyzing patterns against working code" -->

Before fixing, verify your understanding by comparing against working code:

1. **Find working examples** — Locate similar code in the codebase that works correctly
2. **Compare thoroughly** — What's different between the working code and the broken code?
3. **Validate the difference** — Does the difference explain the bug? (It should, if your root cause is correct)

This step catches cases where the "root cause" is actually a symptom of a wrong assumption. If working and broken code differ in ways your hypothesis doesn't explain, your hypothesis is wrong — go back to Phase 2.

**Output**: Confirmation that pattern analysis supports the root cause, OR a revised hypothesis.

## Phase 5 — Fix (Minimal & Surgical)
<!-- task_boundary: TaskStatus="Phase 5/6: Applying surgical fix" -->

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

## Phase 6 — Verification & Hardening
<!-- task_boundary: TaskStatus="Phase 6/6: Verifying fix and checking for systemic risk" -->

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
## Debug Report

**Root Cause**: [What was actually wrong and why]

**Fix**: [What was changed to address it]

**Systemic Risk**: [Whether the same pattern exists elsewhere — yes/no + locations]
```

## Escalation

### Hypothesis-Level Escalation

After **3 failed hypotheses** (3 root cause theories tested and eliminated):

1. **STOP** further investigation
2. **Load `architecture-advisor` skill** — shift to read-only consulting mode
3. **Document** eliminated hypotheses: `Hypothesis N: [claim] → ELIMINATED because [evidence]`
4. In advisor mode: re-examine from a structural/architectural angle
5. **If advisor cannot resolve** → attempt external CLI consultation:
   - Update `task_boundary`: `TaskStatus: "Escalation: consulting external debug agent..."`
   - Write request to `.amag/reviews/debug-{timestamp}-request.md` using template in `.agent/resources/debug-escalation-template.md` (read it via `view_file`)
   - **Load `external-cli-runner` skill.** Invoke with:
     - **configPath**: `debug.consultant`
     - **requestFile**: `.amag/reviews/debug-{timestamp}-request.md`
     - **responseFileRaw**: `.amag/reviews/debug-{timestamp}-response-raw.md`
     - **responseFile**: `.amag/reviews/debug-{timestamp}-response.md`
     - **requiredField**: `## Recommendation`
     - **fallbackAction**: "Skip external consultation — proceed to ASK USER"
   - **If success**: apply recommendation, re-attempt fix from Phase 5. If still fails → ASK USER
   - **If failure** (CLI not found / 3 retries exhausted) → ASK USER
6. **ASK USER** with full context — include eliminated hypotheses, advisor analysis, and CLI recommendation (if available)

### Command-Level Failures

Builds, tests, or commands that fail/hang during debugging follow `error-recovery.md` — that protocol governs command-level failures. The debug workflow's hypothesis escalation is separate.

## Quick Reference: Common Debugging Scenarios

**Test Failures**: Read FULL error + stack trace → identify which assertion failed (expected vs got) → check test setup/fixtures for staleness → trace unexpected value backward to source.

**"It Worked Before"**: `git log -n 20` for recent changes → `git diff HEAD~5` in affected area → `git bisect` if breaking change isn't obvious → fix at the source of the assumption violation.

**Intermittent Failures**: Look for race conditions (shared state across threads/async) → check timing dependencies → examine async ordering → look for unsynchronized shared mutable state → add deterministic waits or proper synchronization.

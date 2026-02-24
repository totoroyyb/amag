---
description: Systematic debugging — reproduce first, trace root cause, fix surgically, verify thoroughly
---

# /debug — Systematic Debugging

Engage systematic debugging mode. No guessing. No shotgun fixes. Trace the root cause, prove it, fix it once.

**MANDATORY**: Announce to the user:

> **🔍 SYSTEMATIC DEBUG MODE**

**Auto-Ultrawork rigor applies during `/debug`**, but "100% certainty before acting" is relaxed — debugging's hypothesis-iterate loop is inherently uncertain.

Load `deep-work` skill for exploration methodology (parallel searches, trace call chains, read 5-10 files minimum). The phase structure below takes precedence over deep-work's goal-driven autonomy.

## Progress Tracking

Call `task_boundary` at **every phase transition** with:
- **TaskName**: `"Debugging: {symptom}"`
- **Mode**: `EXECUTION`
- **TaskStatus**: Phase directive (e.g. `"Phase 2/6: Reproducing the bug"`)
- **TaskSummary**: Cumulative — hypotheses formed/eliminated, evidence found

## How This Gets Engaged

| Trigger | Entry Point |
|---|---|
| User says `/debug` explicitly | Phase 1 |
| Intent gate classifies a bug as HARD | Phase 1 |
| Transparent upgrade — inline fix failed | Phase 2 (carry failed attempt as eliminated hypothesis) |
| User says "debug", "trace this bug", "find the root cause" | Phase 1 |
| User says `/debug-escalate` | Escalation → External CLI (immediate) |
| "consult external", "ask codex/claude", "get second opinion" | Escalation → External CLI (immediate) |

**Do NOT use for**: typos/one-line fixes, build config issues (`error-recovery.md`), feature requests disguised as bugs.

## Phase 1 — Triage
<!-- task_boundary: TaskStatus="Phase 1/6: Triaging bug type" -->

Classify the bug type to determine investigation strategy:

| Bug Type | Key Strategy |
|---|---|
| **Test failure** | Read FULL error + stack trace → check test setup → trace unexpected value to source |
| **Runtime error** | Capture stack trace → find throw line → trace null/undefined backward |
| **"It worked before"** | `git log`/`git diff` → find changed assumption → `git bisect` if needed |
| **Intermittent** | Race conditions, shared mutable state, timing dependencies, async ordering |
| **Wrong behavior** | Compare expected vs actual → find logic divergence → add logging to narrow |

**Output**: State the bug type and investigation strategy.

## Phase 2 — Reproduce (NEVER SKIP)
<!-- task_boundary: TaskStatus="Phase 2/6: Reproducing the bug" -->

**If you can't reproduce it, you can't verify a fix.**

1. **Find or write a failing test** that captures the bug
2. **Confirm reliability** — run 2-3 times
3. **Minimize** — strip to smallest failing case

**If reproduction fails**: document attempts and report to user.

**Output**: A failing test or documented repro steps.

## Phase 3 — Root Cause Investigation
<!-- task_boundary: TaskStatus="Phase 3/6: Investigating root cause" -->

Use `deep-work` exploration: parallel searches, trace call chains, read broadly.

### Trace from Symptom to Source

OBSERVE (where error manifests) → IMMEDIATE CAUSE (which code) → TRACE UPWARD (callers, data) → FOLLOW DATA (bad value origin) → FIND TRIGGER (original source).

**Key principle**: Never fix where the error appears — trace to where it starts.

### Form 2-3 Competing Hypotheses

```
Hypothesis 1: [specific claim about what's wrong and why]
Hypothesis 2: [alternative explanation]
```

### Eliminate Systematically

For each hypothesis: **Predict** → **Test** → **Observe** → **Verdict** (CONFIRMED or ELIMINATED).

**Change ONE variable at a time.**

**Output**: Confirmed root cause with evidence — explain WHY the bug exists, not just WHERE.

## Deep Analysis Checkpoint
<!-- Runs between Phase 3 and Phase 4. Phase 4 only begins after Option A is chosen. -->

After presenting your confirmed root cause (Phase 3 output), **pause and offer the user a choice** via `notify_user` (`BlockedOnUser: true`) before proceeding to Phase 4:

```
## Root Cause Found

**Root Cause**: {confirmed root cause with evidence}

---

**Option A** — Proceed to fix (default)

**Option B** — Deep analysis from {agent_label}
```

**Determining `{agent_label}`**: Read `.amag/config.json` → `debug.consultant.cli`:
- If set → "external agent (`{cli}` / `{model}`)"
- If null → "architecture-advisor (native)"

**Option A**: continue to Phase 4.

**Option B**:
1. If external CLI configured → follow `/debug-escalate` procedure (write request, invoke `external-cli-runner` with `configPath: debug.consultant`, `fallbackAction: "Fall back to architecture-advisor"`)
2. If null or CLI failed → load `architecture-advisor` skill for native analysis
3. Present findings, then continue to Phase 4

## Phase 4 — Pattern Analysis
<!-- task_boundary: TaskStatus="Phase 4/6: Analyzing patterns against working code" -->

Verify understanding by comparing against working code:

1. **Find working examples** — similar code that works correctly
2. **Compare** — what's different?
3. **Validate** — does the difference explain the bug?

If working and broken code differ in ways your hypothesis doesn't explain → go back to Phase 3.

**Output**: Confirmation that pattern analysis supports the root cause, OR revised hypothesis.

## Phase 5 — Fix (Minimal & Surgical)
<!-- task_boundary: TaskStatus="Phase 5/6: Applying surgical fix" -->

1. **Single fix** addressing root cause — not symptom
2. **Change ONE thing** — multi-file fixes = question your root cause
3. **Verify** failing test/repro now passes
4. **Full test suite** — check regressions
5. **If fix fails**: go back to Phase 3, re-examine hypothesis

### Red Flags — Stop Immediately If:

- Thinking "quick fix for now, investigate later"
- 3rd fix attempt without re-examining root cause
- Fix creates new failures in unrelated areas
- Suppressing errors rather than fixing them
- Can't explain WHY the fix works

## Phase 6 — Verification & Hardening
<!-- task_boundary: TaskStatus="Phase 6/6: Verifying fix and checking for systemic risk" -->

Follow the full Verification Protocol from `GEMINI.md` (Steps 1-6), PLUS:

- [ ] Root cause identified and documented (you can explain WHY)
- [ ] Failing test/repro now passes
- [ ] Fix addresses root cause, not symptoms
- [ ] Full test suite passes (no regressions)
- [ ] Fix is minimal — no scope creep

### Systemic Check

1. `grep_search` for the same pattern that caused the bug
2. Found elsewhere → report to user (do NOT fix without discussing scope)

### Debug Report

```
**Root Cause**: [What was actually wrong and why]
**Fix**: [What was changed]
**Systemic Risk**: [Same pattern elsewhere — yes/no + locations]
```

## Escalation

> [!IMPORTANT]
> **User override**: If the user requests external help at any point — via `/debug-escalate`, keyword triggers, or any clear request — skip the 3-hypothesis gate and follow the `/debug-escalate` workflow immediately.

### User-Triggered Escalation

| Trigger | Action |
|---|---|
| `/debug-escalate` | Immediately invoke external CLI — see [debug-escalate workflow](file:///debug-escalate.md) |
| "consult external", "ask codex/claude", "get second opinion" | Same as `/debug-escalate` |
| Any explicit request for external help | Same as `/debug-escalate` |

### Automatic Hypothesis-Level Escalation

After **3 failed hypotheses**:

1. **STOP** — load `architecture-advisor` skill (read-only consulting)
2. **Document**: `Hypothesis N: [claim] → ELIMINATED because [evidence]`
3. Re-examine from structural/architectural angle
4. **If advisor fails** → follow `/debug-escalate` procedure
   - Success → apply recommendation, re-attempt from Phase 5. Still fails → ASK USER
   - Failure → ASK USER
5. **ASK USER** with full context: eliminated hypotheses, advisor analysis, CLI recommendation (if any)

### Command-Level Failures

Builds/tests/commands that fail during debugging → `error-recovery.md`. Separate from hypothesis escalation.

## Quick Reference

**Test Failures**: Full error + stack trace → assertion check → fixture staleness → trace backward.

**"It Worked Before"**: `git log -n 20` → `git diff HEAD~5` → `git bisect` if needed → fix assumption violation.

**Intermittent**: Race conditions → timing dependencies → async ordering → shared mutable state → add synchronization.

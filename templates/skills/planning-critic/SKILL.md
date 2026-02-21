---
name: planning-critic
description: Pre-generation gap analysis — find what the planning session missed before generating a work plan
---

# Planning Critic

Adversarial self-review mode for planning. Activated before generating a work plan. Find every gap, missing guardrail, unvalidated assumption, and scope ambiguity — then classify and handle each one before the plan is written.

## When to Activate

**Only during `/plan` workflow**, at Step 6 (Pre-Generation Gap Review) — after the interview is complete and clearance check has passed, but BEFORE generating `implementation_plan.md`.

## What to Look For

Run through all six categories:

### 1. Questions Not Asked

Review the interview transcript. For each topic below, did you ask or discover the answer?

| Topic | Required Question |
|---|---|
| Test strategy | TDD / tests-after / none? |
| Scope boundaries | What is explicitly OUT of scope? |
| Error handling | Silent, logged, or user-visible? |
| Performance | Any latency/throughput requirements? |
| Compatibility | Any version constraints or backward compat needs? |
| Rollback | If this fails, how do we revert? |

If any answer is unknown AND it affects implementation → Gap detected.

### 2. Missing Guardrails (Must NOT Have)

Every plan needs explicit exclusions to prevent AI scope creep. Did you capture:
- What NOT to build (adjacent features not requested)
- What NOT to modify (files/systems outside scope)
- What NOT to abstract (single-use code that should stay inline)
- What NOT to add (logging, metrics, extra validation) unless requested

### 3. Scope Creep Risks

Scan the planned features for classic AI over-build:
- Is there anything that goes *beyond* the explicit request?
- Are there "while we're at it" additions that weren't asked for?
- Is the planned scope larger than what the user described?

### 4. Unvalidated Assumptions

What are you assuming that the user didn't explicitly confirm?
- File locations ("I assume the auth module is in `src/auth/`")
- Technology choices ("I'll use JWT for this")
- Data shapes ("I'll model it as an array")
- Integration points ("This hooks into the existing middleware")

Each unvalidated assumption that affects implementation = potential blocker.

### 5. Missing Acceptance Criteria

For each planned task, does it have:
- A verifiable condition (a command to run, not "user checks manually")?
- A success state that's binary (pass/fail, not "looks good")?
- At least one failure/edge case scenario?

### 6. Unaddressed Edge Cases

Given what the user wants, what could go wrong at runtime?
- Empty/null inputs
- Network failures or timeouts
- Concurrent access
- Large data volumes
- Permission/auth failures

Are these handled? Does the plan need to address them?

## Gap Classification Protocol

For each gap found, classify it:

| Class | Definition | Action |
|---|---|---|
| **CRITICAL** | Requires user decision — business logic choice, unclear requirement, tech preference | Do NOT generate plan yet. Ask user. After answer → update understanding → re-run clearance check |
| **MINOR** | Can self-resolve — missing file reference findable via search, obvious acceptance criteria | Fix silently. Note in gap summary. |
| **AMBIGUOUS** | Has a reasonable default — error handling style, naming convention, file organization | Apply sensible default. Disclose in plan summary under "Defaults Applied". |

## Output Format

After running the analysis, produce a gap summary:

```
## Planning Critic Analysis

**CRITICAL gaps (need user input before generating plan):**
- [Gap description]: [Specific question to ask]

**MINOR gaps (self-resolved):**
- [Gap]: [How resolved]

**AMBIGUOUS gaps (defaults applied):**
- [Gap]: [Default chosen, override if needed]

**No gaps found** ← If all clear
```

**If CRITICAL gaps exist:**
- Do NOT generate `implementation_plan.md` yet
- Surface the critical questions to the user via `notify_user`
- After user answers → re-run clearance check → re-run planning critic → generate plan

**If only MINOR/AMBIGUOUS:**
- Fix/apply defaults silently
- Proceed immediately to plan generation

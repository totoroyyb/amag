---
description: Maximum effort deep work mode — 100% certainty before acting, zero compromises
---

# /ultrawork — Deep Work Mode

Activate maximum-effort autonomous execution. You MUST achieve 100% certainty before implementing. Zero scope reduction, zero shortcuts, zero compromises.

**MANDATORY**: Say "ULTRAWORK MODE ACTIVATED" to the user when this mode activates.

## Certainty Protocol (NON-NEGOTIABLE)

**YOU MUST NOT START IMPLEMENTATION UNTIL YOU ARE 100% CERTAIN.**

| Before writing a single line of code, you MUST: |
|---|
| **FULLY UNDERSTAND** what the user ACTUALLY wants (not what you assume) |
| **EXPLORE** the codebase to understand existing patterns and architecture |
| **HAVE A CRYSTAL CLEAR PLAN** — if your plan is vague, your work WILL fail |
| **RESOLVE ALL AMBIGUITY** — if anything is unclear, investigate or ask |

### Signs You Are NOT Ready

- You're making assumptions about requirements
- You're unsure which files to modify
- You don't understand how existing code works
- Your plan has "probably" or "maybe" in it
- You can't explain the exact steps you'll take

### When Not Ready

1. **THINK DEEPLY** — What is the user's TRUE intent?
2. **EXPLORE THOROUGHLY** — Fire 3+ parallel searches from different angles
3. **READ EXTENSIVELY** — Spend time understanding before acting (5-15 min of reading is normal)
4. **ASK THE USER** — If ambiguity remains after exploration, ask. Don't guess.

## Execution Rules

### Deliver EXACTLY What Was Asked

| Violation | Response |
|---|---|
| "I couldn't because..." | **UNACCEPTABLE.** Find a way or ask for help. |
| "This is a simplified version..." | **UNACCEPTABLE.** Deliver the FULL implementation. |
| "You can extend this later..." | **UNACCEPTABLE.** Finish it NOW. |
| "I made some assumptions..." | **UNACCEPTABLE.** You should have asked FIRST. |

### Category-Aware Execution

For each sub-task, classify and adopt the right mindset:

| Category | Mindset |
|---|---|
| **Visual/UI** | Design-first — bold aesthetics, cohesive palettes, micro-animations |
| **Deep logic** | Strategic — simplicity bias, one clear path, effort estimate |
| **Quick fix** | Efficient — fast, minimal, no over-engineering |
| **Writing** | Anti-slop — no "delve", plain words, human tone |
| **General** | Standard — match existing patterns, verify with evidence |

### Parallel Execution

Fire all independent tool calls simultaneously:
- Read all target files in parallel
- Run searches from multiple angles simultaneously
- Background long operations (`run_command` with `WaitMsBeforeAsync: 500`)
- Continue work while waiting for background results

### Verification Guarantee

**NOTHING is "done" without PROOF it works.**

Follow the full Verification Protocol from `GEMINI.md` (Steps 1-6), PLUS these ultrawork-specific additions:

| Additional Check | Required Evidence |
|---|---|
| Manual demonstration | Show the feature actually works (not just "tests pass") |
| Regression | Existing tests still pass — not just new ones |
| Scope completeness | Re-read original request, verify 100% delivery — no "simplified version" |

### State Tracking

Even in ultrawork mode, track your work:
1. Create `task.md` artifact immediately with task breakdown
2. Update `task_boundary` at each major phase transition
3. If working from a plan: dual-write progress to both `task.md` and `.superag/active-plan.md`
4. On completion: mark all items done, update `last_updated` timestamps

### Completion Self-Check

Follow the Completion Self-Check from `GEMINI.md`, PLUS verify:
- [ ] Manual demonstration evidence provided (not just automated checks)
- [ ] Every task item in `task.md` marked completed
- [ ] No scope reduction — full delivery, not "basic version"

**If ANY check fails: keep working. Don't stop.**

### Failure Recovery

Follow the full Error Recovery Protocol from `error-recovery.md`. Key rules that apply in ultrawork:
- **Command wait loops**: If a command hangs/fails twice → STOP and diagnose, don't increase wait time
- **3-failure escalation**: After 3 failed attempts → STOP → REVERT → try a fundamentally different approach → if still failing, ASK USER
- **Self-count retries**: Before every retry, ask "Is this the same action I already tried?"

## When to Use

- User says "ultrawork", "ulw", or "go deep"
- Complex tasks where you want 1000% effort
- Tasks where partial delivery is unacceptable
- When thorough exploration before acting is critical

## When NOT to Use

- Simple, well-scoped tasks (just do them directly)
- Plan execution (use `/start-work` instead)
- Exploratory questions ("how does X work?")

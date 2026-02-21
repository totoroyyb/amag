---
description: Execute an implementation plan task-by-task with category-aware delegation
---

# /start-work — Plan Execution

Read an existing plan and execute it task-by-task with verification. This is the execution counterpart to `/plan`.

**You are a conductor, not a player.** For each task, adopt the right persona (category), load relevant skills, verify completion, then move to the next task.

## Steps

### 1. Find and Read the Plan

**Check both sources and combine:**

1. Read `.amag/active-plan.md` in the project root (cross-session truth for checkbox state)
2. Check for an `implementation_plan.md` artifact in this conversation (detailed plan with file references, acceptance criteria)

**If `.amag/active-plan.md` exists:**
- **Self-validate** — parse all `- [ ]` and `- [x]` checkboxes
- Calculate actual progress: `completed / total`
- If all tasks checked → inform user: "Plan is complete. Use `/plan` for new work."
- If some unchecked → proceed with resume
- If `implementation_plan.md` artifact also exists → use it for detailed context per task

**If only `implementation_plan.md` artifact exists (no active-plan.md):**
- This means the plan was approved but Step 8 of `/plan` wasn't executed, or this is the first `/start-work` in the same conversation
- Create `.amag/active-plan.md` from the artifact's task list before proceeding

**If neither found:**
- Tell the user: "No active plan found. Use `/plan` to create one."

### 2. Create Task Breakdown

Create a `task.md` artifact with all tasks from the plan. Copy checkbox state from `.amag/active-plan.md` if resuming.

Update `task_boundary` to reflect current state.

Update `.amag/active-plan.md` YAML header:
- Set `status: in-progress`
- Set `last_updated` to current timestamp

### 3. Execute Task-by-Task

For each uncompleted task:

#### a) Classify the Category

Before executing, classify what kind of work this task requires:

| Category | When to Activate | Persona Shift |
|---|---|---|
| **visual** | UI, CSS, frontend, design, animation | Design-first: bold aesthetics, distinctive typography, cohesive palettes |
| **deep** | Complex logic, architecture, multi-file refactor | Autonomous: explore 5-15 min silently, build full mental model, act decisively |
| **quick** | Single file, typo fix, small change | Efficient: fast, no over-engineering, minimal overhead |
| **writing** | Documentation, README, comments, tech writing | Anti-slop: no "delve"/"leverage", plain words, human tone, varied sentences |
| **general** | Everything else | Standard execution with full verification |

#### b) Load Relevant Skills

Check if any installed skills apply:
- Frontend/UI work → activate `frontend-ui-ux` skill
- Git operations → activate `git-master` skill
- Browser testing needed → activate `browser-testing` skill
- Deep exploration → activate `deep-work` skill
- Writing/docs → activate `writing` skill

#### c) Execute with Category Persona

Adopt the category's mindset for the duration of this task. Match existing codebase patterns. Implement exactly what the plan specifies.

#### d) Verify Against Acceptance Criteria

Check the plan's acceptance criteria for this task:
- Run build/test commands
- Verify with `grep_search` for expected patterns
- Use `browser_subagent` for visual verification if needed

Mark task as completed only AFTER verification passes.

#### e) Dual-Write Progress (MANDATORY after each task)

All three updates must happen together:

1. **`.amag/active-plan.md`** — mark `[x]` on the completed task, update `last_updated` in YAML header
2. **`task.md` artifact** — mark `[x]` on the completed task
3. **`task_boundary`** — update TaskStatus and TaskSummary

**Never update one without the others.**

### 4. Accumulate Learnings

After each task, note:
- Conventions discovered (naming, patterns, style)
- Gotchas encountered (edge cases, unexpected behavior)
- Decisions made (trade-offs, alternatives considered)

Apply these learnings to subsequent tasks to maintain consistency.

### 5. Final Verification (NON-NEGOTIABLE — after ALL tasks)

This is not a formality. This is where you catch everything the per-task checks missed.

Follow the full Verification Protocol from `GEMINI.md` (Steps 1-6) across ALL files modified during the entire plan, PLUS these plan-specific checks:

#### a) Scope Fidelity — Plan vs Reality

Activate `plan-validator` skill for this check.

- For each task in the plan: verify it was implemented completely
- Check: nothing was built that the plan didn't specify (scope creep)
- Check: nothing was skipped or simplified ("basic version")
- Check: "Must NOT Have" guardrails from the plan were respected
- Output: `Tasks [N/N compliant] | VERDICT: APPROVE/REJECT`

If REJECT: fix flagged issues before proceeding to step `b)`.

#### b) Acceptance Criteria

Activate `plan-validator` skill for this check.

- Verify EVERY acceptance criterion from the plan with tool-produced evidence
- Run QA scenarios from the plan: follow exact steps, capture evidence
- No criterion passes on assertion alone — run the command, show the output
- Output: `Criteria [N/N pass] | QA Scenarios [N/N pass] | Evidence [CAPTURED]`

#### c) AI Slop Visual Check
During the self-review (GEMINI.md Step 2), also check for AI slop patterns from `code-quality.md` Section 6 (generic names, over-abstraction, excessive comments, commented-out code). These require judgment — `grep_search` can't reliably detect them.

#### d) Report
- Summarize what was implemented, verified, and any issues encountered
- Re-read the original plan one final time — did you miss anything?

#### e) Stuck During Verification

If a build or test command hangs during this phase, follow the Long-Running Command Protocol from `error-recovery.md`:

1. **Apply poll discipline** — poll `command_status` at 60s intervals. If output hasn't grown for 2 consecutive polls, the command is hung.
2. **Kill it** — call `send_command_input(CommandId, Terminate=true)`. Do not leave it running.
3. **Mark the task blocked** — in `task.md` and `.amag/active-plan.md`, annotate the hung task as `[blocked]` (not complete, not failed).
4. **Notify the user** via `notify_user` with:
   - Which command hung and what it was verifying
   - The last lines of partial output seen
   - What was already verified before the hang
5. **Do NOT mark the plan complete** while any task remains unverified due to a hang.

### 6. Mark Plan Complete

1. Update `.amag/active-plan.md` YAML header: `status: completed`, `last_updated`
2. Create `walkthrough.md` artifact summarizing what was implemented and verified
3. Do NOT delete `active-plan.md` — leave it as a completed record

## Resume Support

If the session is interrupted mid-work:

- `.amag/active-plan.md` checkboxes reflect exactly which tasks are done
- A new session can read this file, self-validate, and resume at the first unchecked task
- No external state files or session IDs needed — the checkboxes are the truth

## When to Use

- After `/plan` generates and user approves an implementation plan
- User says "start work", "execute the plan", or "start-work"
- When there's an existing plan to execute (in conversation or `.amag/active-plan.md`)

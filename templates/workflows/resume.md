---
description: Resume work from a previous plan — self-validates progress and continues
---

# /resume — Cross-Session Resume

Pick up where you left off. Reads `.superag/active-plan.md`, validates actual progress via checkboxes, and resumes from the first uncompleted task.

## Steps

### 1. Read Active Plan

Read `.superag/active-plan.md` in the project root.

- **Not found** → "No active plan. Use `/plan` to create one."
- **Found** → proceed to self-validation

### 2. Self-Validate (Ignore Stale Metadata)

Parse the file content. Count checkboxes:

| Checkbox | Meaning |
|---|---|
| `- [ ]` | Uncompleted task |
| `- [x]` or `- [X]` | Completed task |

Calculate: `completed / total`

**Fix inconsistencies automatically:**
- All checked but `status` ≠ `completed` → update status to `completed`, inform user
- Some unchecked but `status` = `completed` → warn user: "Status says complete but X tasks remain unchecked"

**If all tasks are complete:**
- "Previous plan [name] is complete (X/X tasks). Use `/plan` to start new work."
- Stop here

### 3. Rebuild Context

1. Read `.superag/active-plan.md` for task list and progress
2. Search for an `implementation_plan.md` artifact (if in the same conversation that created it)
3. If detailed plan not available (new conversation): the checklist in `active-plan.md` is sufficient to continue
4. Create `task.md` artifact in this conversation, seeded from `active-plan.md` checkboxes

### 4. Begin Execution

1. Set `status: in-progress` and `last_updated` in `.superag/active-plan.md`
2. Set `task_boundary` with first uncompleted task
3. Execute following `/start-work` protocol from Step 3 onwards

All progress updates follow the **dual-write protocol**: update both `.superag/active-plan.md` and `task.md` artifact simultaneously.

## When to Use

- User says "resume", "continue", or uses `/resume`
- Starting a new conversation and wanting to continue previous work
- After a session interruption or crash

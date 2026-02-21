# Todo Enforcement

## When to Create Task Breakdowns

| Trigger | Action |
|---------|--------|
| Multi-step task (2+ steps) | ALWAYS create task breakdown via `task_boundary` |
| Uncertain scope | ALWAYS (task lists clarify thinking) |
| User request with multiple items | ALWAYS |
| Complex single task | Break down into verifiable sub-steps |

## Workflow (Non-Negotiable)

1. **On receiving request**: Break into atomic steps immediately. No announcements — just plan it.
2. **Before starting each step**: Mark `in_progress` (only ONE at a time)
3. **After completing each step**: Mark `completed` IMMEDIATELY (never batch)
4. **If scope changes**: Update breakdown before proceeding

## State Tracking Tools

| Tool | When | What |
|------|------|------|
| `task_boundary` | Every task transition | Real-time IDE UI updates |
| `task.md` artifact | Every task completion | Conversation-scoped checklist |
| `.amag/active-plan.md` | Every task completion (plan-driven work) | Cross-session truth |

**Dual-write rule**: When working from a plan, update BOTH `task.md` artifact AND `.amag/active-plan.md` on every task completion. Never update one without the other.

## Why This Matters

- **User visibility**: User sees real-time progress, not a black box
- **Prevents drift**: Task list anchors you to the actual request
- **Recovery**: If interrupted, `.amag/active-plan.md` enables seamless cross-session resume
- **Accountability**: Each item = explicit commitment

## Anti-Patterns (Violations)

| Violation | Why It's Bad |
|-----------|--------------|
| Skipping breakdown on multi-step tasks | User has no visibility, steps get forgotten |
| Batch-completing multiple items | Defeats real-time tracking purpose |
| Proceeding without marking in_progress | No indication of what you're working on |
| Finishing without completing all items | Task appears incomplete to user |
| Creating items you won't actually track | Noise that erodes trust |
| Updating `task.md` but not `active-plan.md` | Cross-session state goes stale |

**Failure to track non-trivial tasks = incomplete work.**

---
description: Structured planning interview before implementation — plan before you build
---

# /plan — Strategic Planning

Create a comprehensive, actionable work plan through structured consultation. Classify the intent, explore the codebase first, ask the user about preferences (not facts), generate a plan with acceptance criteria, then self-review for blockers before presenting.

## Step 1: Intent Classification (Mandatory First Step)

Before ANY analysis, classify the work intent. This determines your entire strategy:

| Intent Type | Signal | Focus |
|---|---|---|
| **Refactoring** | "refactor", "restructure", "clean up" | SAFETY: regression prevention, behavior preservation |
| **Build from Scratch** | "create new", "add feature", greenfield | DISCOVERY: explore patterns first, informed questions |
| **Mid-sized Task** | Scoped feature, bounded work | GUARDRAILS: exact deliverables, explicit exclusions |
| **Collaborative** | "help me plan", "let's figure out" | INTERACTIVE: incremental clarity through dialogue |
| **Architecture** | "how should we structure", system design | STRATEGIC: long-term impact, trade-off analysis |
| **Research** | Investigation needed, path unclear | INVESTIGATION: exit criteria, parallel probes |

State your classification before proceeding: "I classify this as [TYPE] because [reason]."

## Step 2: Explore Before Asking

**CRITICAL: Never ask the user about things you can look up.**

Launch parallel searches to gather codebase facts:
- `grep_search` for patterns and existing implementations
- `find_by_name` for file structure and naming conventions
- `view_file_outline` for code architecture

```
BAD: "Where is authentication implemented?"
GOOD: Fire searches → "I found JWT auth in src/auth/ using Passport.js."
```

### Intent-Specific Exploration

| Intent | What to Explore |
|---|---|
| **Refactoring** | Map all usages, find tests, check for dependent code |
| **Build from Scratch** | Find similar features, discover patterns and conventions |
| **Mid-sized** | Find exact files to modify, verify boundaries |
| **Architecture** | Study existing architecture, find pain points in code |
| **Research** | Check what exists, find relevant docs |

## Step 3: Interview (ONE question at a time)

Ask via `notify_user`. Each question builds on the previous answer.

**Only ask about:**
- Preferences: "Dark mode default or opt-in?"
- Priorities: "Performance or simplicity first?"
- Scope decisions: "Include feature Y or keep it minimal?"
- Constraints: "Any timeline or compatibility requirements?"

**Never ask about:**
- Codebase facts (look them up)
- Implementation details (that's your job)

## Step 4: AI-Slop Prevention (Before generating plan)

Check your plan for these common AI failure patterns:

| Pattern | How to Detect | Fix |
|---|---|---|
| **Scope inflation** | Steps that go beyond what was asked | Cut to explicit request only |
| **Premature abstraction** | Utilities/helpers for single-use code | Inline, don't abstract |
| **Over-validation** | 15 error checks for 3 inputs | Match codebase's existing level |
| **Documentation bloat** | JSDoc on every internal function | Follow existing conventions |
| **Feature creep** | "Also add logging, metrics, caching" | Only what was requested |

## Step 5: Generate Plan

Create an `implementation_plan.md` artifact with:

- **Intent Classification**: Type + rationale
- **Requirements Summary**: What we're building
- **Must Have**: Exact deliverables
- **Must NOT Have**: Explicit exclusions (prevents AI scope creep)
- **Implementation Steps**: 3-6 steps with file references and acceptance criteria
- **Verification Steps**: Executable commands (not "user manually checks")

### Quality Standards

| Criterion | Standard |
|---|---|
| Step count | 3-6 (not 30 micro-steps, not 2 vague directives) |
| Acceptance criteria | Must be executable commands, not manual checks |
| File references | Cite specific files discovered in exploration |
| No vague terms | "fast" → "p99 < 200ms", "clean" → "follows existing patterns in src/utils/" |

### Mandatory Final Verification Task

Every generated plan MUST include a **Final Verification** as the last task. This is not optional — omitting it is a plan defect.

The final task should specify:
1. **Full build + test suite** — `run_command` with evidence
2. **Self-review** — re-read ALL files modified across ALL tasks, verify logic matches plan
3. **Scope fidelity** — compare what was built against the plan: nothing extra (scope creep), nothing missing (partial delivery)
4. **AI slop scan** — check changed files for generic names, over-abstraction, excessive comments, commented-out code (per `code-quality.md` Section 6)
5. **Acceptance criteria** — verify every criterion from the plan with tool-produced evidence

## Step 6: Self-Review (Blocker Check)

Before presenting to the user, review your own plan:

1. **Do referenced files actually exist?** (verify with tools)
2. **Can each step be started?** (must have a clear entry point)
3. **Any internal contradictions?** (steps that conflict)

If ANY of these fail → fix before presenting. Don't waste the user's time with a broken plan.

## Step 7: Wait for Approval

Present via `notify_user` with `BlockedOnUser: true` and `ShouldAutoProceed: false`. Never implement before explicit approval.

## Step 8: Persist Plan to Project (After Approval ONLY)

Once the user approves the plan:

1. **Check for existing plan**: Read `.superag/active-plan.md` in project root
   - If exists with unchecked tasks → ask user: "Found incomplete plan [name] (X/Y done). Archive and start new, or resume?"
   - If user says archive → move to `.superag/archive/{plan-name}-{timestamp}.md`

2. **Write `.superag/active-plan.md`** with:

```markdown
---
plan_name: "descriptive-name"
status: approved
created: {current timestamp}
last_updated: {current timestamp}
---

# Plan Name

{One-paragraph context summary from the implementation plan}

## Tasks

- [ ] 1. {Task from implementation plan}
- [ ] 2. {Task from implementation plan}
- [ ] 3. {Task from implementation plan}
```

3. **Status is `approved`** — it transitions to `in-progress` when `/start-work` begins execution.

## STOP — Workflow Ends Here

**The `/plan` workflow terminates after Step 8.** Do NOT proceed to implementation, code editing, or execution of any kind. Your job was to produce a plan — that job is now complete.

Inform the user: _"Plan saved. Use `/start-work` to begin execution."_

**Under no circumstances should you:**
- Start implementing the plan
- Edit any project source files
- Transition to EXECUTION mode
- Interpret the user's approval as a command to execute

## When to Use

- User says "plan", "let's plan", or uses `/plan`
- Complex tasks that benefit from structured thinking
- When the user wants to review approach before implementation

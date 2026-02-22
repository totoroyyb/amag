---
description: Structured planning interview before implementation — plan before you build
---

# /plan — Strategic Planning

Comprehensive work plan through structured consultation. Classify complexity → explore the codebase → detect test infrastructure → interview → auto-transition when clear → gap review → generate plan → optional validation → wait for approval → persist.

> [!IMPORTANT]
> **You are a planner. You do not implement.** Every request — "fix X", "build Y", "add Z" — means "create a work plan for X/Y/Z". You only write `implementation_plan.md` and optionally `.amag/drafts/*.md`. Nothing else.

> [!IMPORTANT]
> **Auto-Ultrawork rigor applies to plan quality.** The plan-approve-execute gate is never bypassed — ultrawork's "act decisively" does not mean "skip approval." This workflow produces a plan for user review — it never executes.

> [!TIP]
> **Explore handoff**: If a `research-findings.md` artifact exists in this conversation (from a prior `/explore`), read it as pre-existing context. Skip redundant exploration that the research already covers.

---

## Step 0: Complexity Assessment

Before full interview, gate on complexity. This prevents over-interviewing trivial requests.

| Level | Signal | Action |
|---|---|---|
| **Trivial** | Single file, obvious fix, <10 lines change | Skip heavy interview. Quick confirm + propose action. "I see X. Should I include Y too? Or just note this fix?" |
| **Simple** | 1-2 files, clear scope, <30 min | Lightweight: 1-2 targeted questions → propose approach → generate plan |
| **Complex** | 3+ files, multiple components, architectural impact | Full consultation: intent classification + full interview loop |

State your assessment: *"This is [trivial/simple/complex] because [reason]."*

---

## Step 1: Intent Classification + Intent-Specific Research

**CRITICAL: Never ask the user about things you can look up.**

Load `codebase-explorer` skill. State your classification first:

*"I classify this as [TYPE] because [reason]."*

Then launch **parallel searches** based on intent type:

### Refactoring

Load `codebase-explorer`. Launch in parallel:

```
grep_search(target_function, MatchPerLine=true)          → all call sites
grep_search(target_function, Includes=["*.test.*"])      → test coverage
find_by_name("*.test.*", SearchDirectory="src")          → test inventory
```

Find: all usages, risk per call site (high/medium/low), coverage gaps (behaviors tested vs untested).

### Build from Scratch

Load `codebase-explorer` + `external-researcher`. Launch in parallel:

```
grep_search("similar_feature_keyword")                   → existing implementations
find_by_name("similar-module-name")                      → directory conventions
view_file_outline(best_existing_example)                 → public API shape
search_web("{technology} official documentation")        → external library patterns (if applicable)
```

Find: directory structure, naming conventions, barrel patterns, error handling, registration/wiring steps.

### Mid-Sized Task

```
grep_search(exact_files_or_patterns_mentioned)
view_file_outline(key_files_involved)
```

Targeted only — verify exact files exist and understand their current state.

### Collaborative

Light exploration to gather context as user provides direction. No heavy up-front research.

### Architecture

Load `codebase-explorer` + `external-researcher` + `architecture-advisor`. Launch in parallel:

```
grep_search("import.*from", IsRegex=true)                → dependency direction
grep_search("interface|abstract class", IsRegex=true)    → abstractions
search_web("{domain} architecture patterns best practices")
```

Find: module boundaries, dependency graph, coupling hotspots, load-bearing abstractions.

### Research

Load `codebase-explorer` + `external-researcher`. Launch 3 angles in parallel:

```
grep_search(current_implementation_keywords)             → what exists
search_web("{topic} production implementation patterns") → external guidance
search_web("{topic} github.com stars:>1000")             → OSS examples
```

---

## Step 2: Mandatory Test Infrastructure Detection

**For Build from Scratch and Refactoring intents: MANDATORY before interviewing.**

Load `codebase-explorer`. Search in parallel:

```
find_by_name("jest.config*")
find_by_name("vitest.config*")
grep_search("\"test\":", Includes=["package.json"])
find_by_name("*.test.*", Type="file")
find_by_name("*.spec.*", Type="file")
grep_search("bun test", Includes=["package.json"])
```

**Then ask the mandatory test strategy question:**

If infrastructure EXISTS:
> "I see you have test infrastructure ([framework]). Should this work include automated tests?
>
> - **TDD**: RED → GREEN → REFACTOR. Each task includes test cases as acceptance criteria.
>
> - **Tests after**: Implementation first, tests added as separate tasks.
>
> - **No tests**: Skip unit/integration tests.
>
> Regardless of choice, every task will include agent-executable QA scenarios (browser_subagent/run_command/grep_search to verify actual behavior)."

If infrastructure DOES NOT exist:
> "No test infrastructure found. Would you like to set it up as part of this plan?
>
> - **Yes**: Include framework selection + config + example test, then TDD for the actual work.
>
> - **No**: Skip — agent-executed QA scenarios will be the primary verification method."

Record the decision. It affects the entire plan structure.

---

## Step 3: Interview (ONE question at a time)

Ask via `notify_user`. Each question builds on the previous answer. Ask one question per turn so answers can inform follow-up questions. (Exception: when surfacing CRITICAL gaps in Step 6, batch all independent gaps into a single `notify_user` call.)

> [!TIP]
> **Formatting for readability**: When presenting options to the user, always:
> - Format each option as a separate list item (`-`)
> - Add a blank line between options for visual separation
> - Bold the option label, then describe after the colon
> - This ensures each option starts on its own line and is visually scannable

**Progress tracking**: Update `task_boundary` at each interview phase transition:
- After complexity assessment: TaskStatus = `"Planning: classified as [level] — starting interview"`
- After each question answered: TaskStatus = `"Planning: [N] requirements confirmed — [next topic]"`
- After clearance check passes: TaskStatus = `"Planning: requirements clear — generating plan"`
- After plan generated: TaskStatus = `"Planning: plan ready for review"`

**`notify_user` parameter strategy during interview:**

| Complexity | BlockedOnUser | ShouldAutoProceed | Rationale |
|---|---|---|---|
| Trivial | `true` | `true` | Quick confirm, don't force the user to manually click through |
| Simple | `true` | `true` for factual confirmations, `false` for scope decisions | Scope decisions need explicit input |
| Complex | `true` | `false` | Every answer matters at this level |

**Only ask about:**
- Preferences: "Dark mode default or opt-in?"
- Priorities: "Performance or simplicity first?"
- Scope decisions: "Include Y or keep it minimal?"
- Constraints: "Any timeline or compatibility requirements?"

**Never ask about:**
- Codebase facts (look them up via `codebase-explorer`)
- Implementation details (that's your job)

**For long planning sessions**: Write key decisions to `.amag/drafts/{topic}.md` as you go. Update after every meaningful user response. This prevents context loss. Delete draft files after the corresponding plan is persisted to `.amag/active-plan.md`. **For complex tasks (3+ interview turns)**: after each user response, update the draft file and include its path in `PathsToReview` on the NEXT `notify_user` call. This lets the user see all accumulated decisions at a glance in their IDE, instead of scrolling back through chat history.

```markdown
# Draft: {Topic}

## Requirements (confirmed)
- [requirement]: [user's exact words]

## Technical Decisions
- [decision]: [rationale]

## Research Findings
- [source]: [key finding]

## Open Questions
- [question not yet answered]

## Scope Boundaries
- INCLUDE: ...
- EXCLUDE: ...
```

---

## Step 4: Self-Clearance Check

**Run this checklist after EVERY interview turn:**

```
□ Core objective clearly defined?
□ Scope boundaries established — both IN and OUT?
□ No critical ambiguities remaining?
□ Technical approach decided?
□ Test strategy confirmed (TDD / after / none)?
□ No blocking questions outstanding?
```

**ALL YES** → announce: *"All requirements clear. Proceeding to gap review and plan generation."* → auto-transition to Step 5.

**ANY NO** → continue interviewing. Ask the specific unclear question. Never move forward with unknowns.

---

## Step 5: AI-Slop Prevention

Before generating the plan, check your planned scope for these patterns:

| Pattern | How to Detect | Fix |
|---|---|---|
| **Scope inflation** | Steps that go beyond what was asked | Cut to explicit request only |
| **Premature abstraction** | Utilities/helpers for single-use code | Inline, don't abstract |
| **Over-validation** | 15 error checks for 3 inputs | Match codebase's existing level |
| **Documentation bloat** | JSDoc on every internal function | Follow existing conventions |
| **Feature creep** | "Also add logging, metrics, caching" | Only what was requested |

---

## Step 6: Pre-Generation Gap Review

Load `plan-consultant` skill. The skill handles backend detection (CLI vs self-review) and uses AG-native tools (`run_command`, `view_file`, `write_to_file`) for the review. No external infrastructure needed.

The skill will:
1. Check `.amag/config.json` for CLI configuration
2. If CLI available → spawn via `run_command` for independent analysis
3. If no CLI → perform enhanced self-review with structured gap analysis

Either path runs through all six gap categories:
1. Questions not asked
2. Missing guardrails (Must NOT Have)
3. Scope creep risks
4. Unvalidated assumptions
5. Missing acceptance criteria
6. Unaddressed edge cases

Review files are written to `.amag/reviews/` for auditability.

**Handle gaps:**
- **CRITICAL** (requires user input) → surface via `notify_user` → wait for answer → re-run clearance check → re-run gap review → then generate plan
- **MINOR** (self-resolvable) → fix silently, note in plan summary
- **AMBIGUOUS** (has reasonable default) → apply default, disclose under "Defaults Applied" in plan summary

Do not generate `implementation_plan.md` until all CRITICAL gaps are resolved.

---

## Step 7: Generate Plan

Create `implementation_plan.md` artifact with this structure:

```markdown
# [Plan Title]

## TL;DR

> **Goal**: [1-2 sentences: core objective]
> **Deliverables**: [Bullet list of concrete outputs]
> **Effort**: Quick | Short | Medium | Large | XL
> **Parallel Execution**: YES - N waves | NO - sequential
> **Critical Path**: Task A → Task B → Task C

---

## Requirements Summary

### Must Have
- [Non-negotiable, concrete deliverable]

### Must NOT Have (Guardrails)
- [Explicit exclusion to prevent scope creep]
- [AI slop pattern to avoid]

---

## Test Strategy

- **Infrastructure**: YES ([framework]) / NO
- **Automated tests**: TDD / Tests-after / None
- **Agent-Executed QA**: ALWAYS present on every task (mandatory)

---

## Plan Consultant Summary

**Gaps resolved before generation:**
- Minor: [gap] → [how resolved]
- Defaults applied: [assumption] → [default chosen]

---

## Parallel Execution Waves

> Group independent tasks into waves. Each wave completes before the next begins.
> Target: 3-8 tasks per wave. Fewer than 3 (except final) = under-splitting.

```
Wave 1 (Start immediately — foundation):
├── Task 1: [title] [quick]
├── Task 2: [title] [quick]
└── Task 3: [title] [quick]

Wave 2 (After Wave 1 — core work):
├── Task 4: [title] (depends: 1, 2) [deep]
├── Task 5: [title] (depends: 2) [visual]
└── Task 6: [title] (depends: 1, 3) [general]

Wave FINAL (After all tasks — verification):
├── FV1: Scope fidelity check [deep]
├── FV2: Code quality + build/test/lint [general]
└── FV3: QA scenario replay [general]
```

---

## Implementation Steps

- [ ] 1. [Task Title]

  **What to do**:
  - [Clear, ordered implementation steps]
  - [Include test cases if TDD]

  **Must NOT do**:
  - [Specific exclusions from guardrails]

  **Category**: `[visual | deep | quick | writing | general]`
  **Skills to load**: `[frontend-ui-ux | deep-work | git-master | browser-testing | writing]` (list relevant ones + justify)
  **Wave**: Wave N | Can run in parallel with Tasks X, Y | Blocks: Tasks Z

  **References** (executor has NO context from this interview — be exhaustive):

  - `src/path/to/file.ts:L45-78` — [What pattern to follow and why]
  - `src/types/foo.ts:FooType` — [What contract to implement against]

  **Acceptance Criteria** (agent-executable ONLY — no human checks):

  - [ ] `run_command: [exact command]` → exit 0
  - [ ] `grep_search("[pattern]", Includes=["src/"])` → found at [expected location]

  **QA Scenarios** (MANDATORY — task is incomplete without these):

  ```
  Scenario: [Happy path — what SHOULD work]
    Tool: [browser_subagent / run_command / grep_search]
    Preconditions: [Exact setup state]
    Steps:
      1. [Exact action with specific data/selector]
      2. [Next action with expected intermediate state]
      3. [Assertion with exact expected value]
    Expected Result: [Concrete binary pass/fail]
    Failure Indicators: [What specifically = failure]
    Evidence: .amag/evidence/task-1-happy-path.[ext]

  Scenario: [Failure/edge case — what SHOULD fail gracefully]
    Tool: [same format]
    Preconditions: [Invalid input / error state]
    Steps:
      1. [Trigger error condition]
      2. [Assert graceful handling]
    Expected Result: [Correct error message/code/behavior]
    Evidence: .amag/evidence/task-1-error-case.[ext]
  ```

  > QA anti-patterns (your scenario is INVALID if it looks like this):
  > - ❌ "Verify it works correctly" — HOW?
  > - ❌ "Check the API returns data" — WHAT data?
  > - ❌ Any scenario without an evidence path

  > **Evidence directory**: `.amag/evidence/` is created when evidence capture begins. Evidence files are screenshots (`.png`), command output (`.txt`), or browser recordings (`.webp`). Evidence persists until the plan is archived.

---

## Final Verification Wave

> Runs AFTER all implementation tasks complete.

- [ ] FV1. **Scope Fidelity** — activate `plan-critic` skill
  For each task: read "What to do", compare against actual changes. Verify nothing was missed (partial delivery) and nothing was added beyond spec (scope creep). Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT: APPROVE/REVISE/REJECT`

- [ ] FV2. **Code Quality** — activate `architecture-advisor` skill for review
  Run build + typecheck + tests. Scan all changed files for: `as any`/`@ts-ignore`, empty catches, `console.log` in production code, commented-out code, unused imports. Check AI slop (generic names, over-abstraction, excessive comments) per `code-quality.md` Section 6.
  Output: `Build [PASS/FAIL] | Tests [N pass/N fail] | Slop [CLEAN/N issues] | VERDICT`

- [ ] FV3. **QA Scenario Replay**
  Execute EVERY QA scenario from EVERY task. Follow exact steps. Capture evidence. Save to `.amag/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Evidence [CAPTURED/MISSING] | VERDICT`

---

## Acceptance Criteria Summary

- [ ] All "Must Have" items present with evidence
- [ ] All "Must NOT Have" exclusions confirmed absent
- [ ] All tests pass (or pre-existing failures documented)
- [ ] All QA scenarios pass with evidence captured
```

### Plan Quality Standards

| Standard | Requirement |
|---|---|
| Task count | 3-8 per wave; final wave always present |
| QA scenarios | 1 happy path + 1 failure case per task minimum |
| Acceptance criteria | Agent-executable commands only (no human checks) |
| File references | Specific `file:line` citations discovered in exploration |
| No vague terms | "fast" → "p99 < 200ms"; "clean" → "follows patterns in `src/utils/`" |
| Scope guardrails | At least 2-3 explicit "Must NOT Have" items |

---

## Step 8: High-Accuracy Gate (Optional)

After generating the plan, present the user a choice via `notify_user`:

> "Plan is ready. How would you like to proceed?
>
> - **Option A — Start Work**: Plan looks solid, proceed with `/start-work`.
>
> - **Option B — Critical Review Pass**: Activate `plan-critic` skill for independent review. If a CLI agent is configured (codex/claude-code), it will provide an external perspective. Otherwise, enhanced self-review."

**If Option B selected:**
1. Load `plan-critic` skill
2. Skill detects backend (CLI vs self-review), spawns reviewer via `run_command` if available
3. Review files written to `.amag/reviews/` for auditability
4. If REVISE: fix all blocking issues → re-submit to critic → loop
5. If REJECT: surface to user via `notify_user`
6. If APPROVE: present verdict to user

There is no maximum iteration limit. Loop until the plan passes or user explicitly cancels.

After final APPROVE, archive reviews: `run_command: mkdir -p .amag/archive/reviews/{planId} && mv .amag/reviews/{planId}-* .amag/archive/reviews/{planId}/`

---

## Step 9: Wait for Approval

Present plan via `notify_user` with `BlockedOnUser: true` and `ShouldAutoProceed: false`.

**Never implement before explicit user approval.** The user's approval of the plan is NOT a signal to start executing.

---

## Step 10: Persist Plan to Project (After Approval ONLY)

Once user approves:

1. **Check for existing plan**: Read `.amag/active-plan.md`
   - If exists with unchecked tasks → present via `notify_user`:
     > "Found incomplete plan [name] (X/Y done). How should I proceed?
     >
     > - **Archive and start new**: Move old plan to `.amag/archive/` and create a fresh one.
     >
     > - **Resume**: Continue from where the existing plan left off."
   - If archive: move to `.amag/archive/{plan-name}-{timestamp}.md`

2. **Write `.amag/active-plan.md`**:

```markdown
---
plan_name: "descriptive-name"
status: approved
created: {current timestamp}
last_updated: {current timestamp}
---

# Plan Name

{One-paragraph context summary}

## Tasks

- [ ] 1. {Task from implementation plan}
- [ ] 2. {Task from implementation plan}
- [ ] FV1. Scope Fidelity check
- [ ] FV2. Code Quality check
- [ ] FV3. QA Scenario Replay
```

3. Status is `approved` — transitions to `in-progress` when `/start-work` begins.

---

## STOP — Workflow Ends Here

**The `/plan` workflow terminates after Step 10.** Do NOT proceed to implementation, code editing, or execution of any kind.

Inform the user: *"Plan saved. Use `/start-work` to begin execution."*

**Under no circumstances should you:**
- Start implementing the plan
- Edit any project source files
- Transition to EXECUTION mode
- Interpret the user's approval as a command to execute

---

## When to Use

- User says "plan", "let's plan", or uses `/plan`
- Complex tasks that benefit from structured thinking
- When the user wants to review approach before implementation

---
description: Implementation plan template — referenced by /plan workflow Step 7
---

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
  Run build + typecheck + tests. Scan all changed files for: `as any`/`@ts-ignore`, empty catches, `console.log` in production code, commented-out code, unused imports. Check AI slop per `code-quality.md` Section 6.
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

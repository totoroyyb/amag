---
name: plan-validator
description: Post-generation adversarial plan validation — verify every reference, criterion, and QA scenario before approval
---

# Plan Validator

Adversarial validation mode for generated plans. Activated after `implementation_plan.md` is written. Read the plan as a skeptic. Verify every claim. Reject if anything is vague, broken, or unverifiable.

## When to Activate

- `/plan` Step 8 (High-Accuracy Gate) — if user selects "Critical Review Pass"
- `/start-work` Final Verification — scope fidelity and acceptance criteria check

## Validation Checklist

Work through every section of the plan:

### 1. File References — Verify They Exist

For every file cited in the plan:
```
view_file_outline(cited_file)   → does it exist?
grep_search(cited_symbol)       → does the cited function/class/type exist?
```

Mark each reference:
- ✅ VERIFIED — file and symbol confirmed to exist
- ❌ BROKEN — file doesn't exist or symbol not found
- ⚠️ UNVERIFIED — couldn't confirm (note why)

**Threshold**: ≥80% of references must be VERIFIED. Any BROKEN reference = REJECT.

### 2. Acceptance Criteria — Must Be Agent-Executable

For every acceptance criterion in the plan, ask: **Can an agent verify this without human intervention?**

✅ VALID examples:
- `run_command: bun test src/auth/ → exit 0`
- `grep_search("class AuthService") → found in src/auth/auth.service.ts`
- `browser_subagent → navigate to /login → verify "Welcome" text present`

❌ INVALID examples:
- "User confirms the UI looks correct"
- "Manually test the happy path"
- "Check that it works"
- "Verify behavior is as expected"

If ANY criterion requires human action → **REJECT**.

### 3. QA Scenarios — Must Be Specific

For every QA scenario, verify it has ALL of the following:

| Required Field | What to Check |
|---|---|
| **Tool** | Specific tool named (browser_subagent / run_command / grep_search) |
| **Concrete data** | Actual values, not placeholders (`"test@example.com"` not `"[EMAIL]"`) |
| **Specific selectors** | CSS class / ID / text content (not "the button") |
| **Expected result** | Exact, binary pass/fail condition |
| **Failure indicators** | What specifically would mean failure |
| **Evidence path** | Where to save screenshot/output |
| **Negative scenario** | At least one failure/edge case per task |

If a scenario is missing ANY of these → **REJECT that scenario as invalid**.

### 4. Scope Boundaries — Must Be Explicit

The plan must have:
- **Must Have**: explicit list of concrete deliverables
- **Must NOT Have**: explicit exclusions (at minimum 2-3 scope limits)

If "Must NOT Have" section is missing or empty → **REJECT**.

### 5. Vague Language Scan

Scan the entire plan for:

| Vague term | Rejection trigger |
|---|---|
| "fast", "efficient", "optimized" | No quantified target (p99 < Xms) |
| "clean", "proper", "correct" | No reference to what standard |
| "good error handling" | No specification of what errors and how |
| "similar to existing pattern" | No cite of which file to follow |
| "appropriate" | No definition of what appropriate means |

Each vague term without definition → flag for fix.

### 6. Final Verification Wave — Must Be Present

The plan must include a Final Verification Wave as the last section with:
- Scope fidelity check (plan vs implementation)
- Code quality check (build, lint, tests, AI slop scan)
- QA scenario replay (agent-executed, not manual)
- Acceptance criteria verification

If Final Verification Wave is missing → **REJECT**.

## Output Format

```
## Plan Validation Result

**VERDICT: APPROVE / REJECT**

If REJECT:

### Critical Issues (must fix before approval)
- [Issue 1]: [Exact location in plan] — [What's wrong] — [How to fix]
- [Issue 2]: [...]

### Warnings (fix if possible)
- [Warning 1]: [...]

If APPROVE:

### Summary
- File references: [N/M verified]
- Acceptance criteria: [N/M agent-executable]
- QA scenarios: [N valid, M invalid]
- Scope boundaries: [PRESENT / MISSING]
- Final Verification Wave: [PRESENT / MISSING]
- Vague terms: [0 / N found]
```

## Loop Protocol (if activated for High-Accuracy Gate)

```
while verdict != APPROVE:
  1. Fix ALL critical issues in implementation_plan.md
  2. Re-run full validation checklist
  3. Re-issue verdict
```

No maximum iterations. Loop until APPROVE or user explicitly cancels.

This loop is a commitment — if you entered it, fix until it's done.

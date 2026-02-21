# Code Quality Standards

## 1. Think Before Coding

**Don't assume. Surface tradeoffs.**

Before implementing:
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated issues, mention them — don't fix them.

When YOUR changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Verify before claiming done.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

## 5. Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are focused (< 50 lines)
- [ ] No deep nesting (> 4 levels)
- [ ] Proper error handling (no empty catch blocks)
- [ ] No leftover debug code (console.log, TODO, HACK, debugger)
- [ ] No hardcoded values that should be configurable
- [ ] Matches existing codebase patterns

## 6. AI Slop Detection (On Output)

**After implementing, scan your own output for these AI-typical defects:**

| Pattern | What to Look For | Fix |
|---------|-----------------|-----|
| **Generic names** | `data`, `result`, `item`, `temp`, `value`, `obj`, `response` as variable names | Rename to domain-specific: `user`, `invoice`, `config` |
| **Over-abstraction** | Factory/wrapper/utility for code used exactly once | Inline it. Abstract only when reused |
| **Excessive comments** | Comments restating the code: `// increment counter` above `counter++` | Delete. Comment only WHY, never WHAT |
| **Commented-out code** | Blocks of code wrapped in `/* */` or `//` | Delete. Git has history |
| **Unused imports** | Imports added but never referenced | Remove |
| **Over-validation** | 15 null checks for 3 inputs; defensive code beyond the codebase's norm | Match the project's existing validation level |
| **Boilerplate bloat** | Long structured output with sections nobody asked for | Strip to what's needed |

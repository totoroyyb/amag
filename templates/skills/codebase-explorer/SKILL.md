---
name: codebase-explorer
description: Structured codebase search protocol — deep parallel exploration before acting on unfamiliar code
---

# Codebase Explorer

Structured protocol for thorough codebase research. When activated, shift into comprehensive search mode: launch parallel searches from multiple angles, synthesize findings, then surface concrete evidence to guide decisions.

## When to Activate

- Understanding how an existing module, feature, or pattern works before modifying it
- Finding all usages of a function, type, or pattern before refactoring
- Discovering conventions to match when adding new code
- Mapping architectural boundaries and dependencies
- Any task where "I need to understand the codebase first" applies

**Key triggers from other agents or workflows that load this skill:**
- `/plan` Step 1 (intent-specific exploration) and Step 2 (test infra detection)
- `/ultrawork` during Certainty Protocol
- `/start-work` when a task is classified `deep`
- Default behavior for any Exploratory or Open-ended request

## Core Pattern: Parallel Multi-Angle Search

Never single-angle. Always launch 3+ parallel searches:

```
grep_search("pattern")        → find text/symbol occurrences
find_by_name("*.config.*")    → find files by name/extension
view_file_outline(key_file)   → understand structure without reading all
```

Fire all simultaneously. Synthesize after results return.

## Search Prompt Structure

When forming search goals (especially for complex exploration), structure thinking with:

- **[CONTEXT]**: What you're working on, files/modules involved
- **[GOAL]**: The specific outcome needed — what decision this unblocks
- **[DOWNSTREAM]**: How results will be used
- **[REQUEST]**: What to find, what format to return, what to skip

## Intent-Specific Patterns

### Refactoring — Map Impact Before Touching Anything

```
grep_search(target_function, IsRegex=false, MatchPerLine=true)    → all call sites
grep_search(target_type, Includes=["*.test.*"])                    → test coverage
find_by_name("*.test.*", SearchDirectory=src)                      → test file inventory
```

Focus on:
- All usages: call sites, how return values are consumed
- Risk per call site (high/medium/low — would break on signature change?)
- Test coverage: which behaviors are tested vs untested

### Build from Scratch — Discover Patterns Before Building

```
grep_search("similar_feature_name")                      → existing implementations
find_by_name("similar-module")                           → directory structure
view_file_outline(best_existing_example)                 → public API shape
```

Focus on:
- Directory structure and naming conventions
- Export patterns (barrel `index.ts` vs direct exports)
- Error handling conventions
- Registration/wiring steps (how is this module plugged in?)

### Architecture — Map Boundaries

```
grep_search("import.*from", IsRegex=true)         → dependency direction
grep_search("interface|abstract class", IsRegex=true)  → abstractions
find_by_name("*.config*")                          → configuration surface
```

Focus on:
- Module boundaries and dependency direction
- Key abstractions (interfaces, base classes, shared types)
- Circular dependencies and coupling hotspots

### Test Infrastructure Detection

```
find_by_name("jest.config*")
find_by_name("vitest.config*")
grep_search("\"test\":", Includes=["package.json"])
find_by_name("*.test.*", Type="file")
find_by_name("*.spec.*", Type="file")
```

Return: YES/NO for test infrastructure with framework name and example test file.

## Stop Conditions

Stop searching when:
- You have enough context to proceed confidently
- Same information appearing from 2+ independent sources
- 3 rounds of search yielded no new useful data
- A direct answer was found

**Cap at 2 rounds. Do NOT over-explore. Time is precious.** (Matches GEMINI.md Exploration Protocol.)

## Synthesis Format

After search rounds complete, synthesize:

```
Found:
- [Pattern/file]: [What it tells us]
- [Pattern/file]: [What it tells us]

Conclusion: [What this means for the task]
Confidence: HIGH / MEDIUM / LOW
Remaining unknowns: [What's still unclear, if anything]
```

## Quality Bar

- Return **file paths + line numbers**, not vague descriptions
- Explain **why** each finding matters, not just what it is
- Flag **risk** when relevant (e.g., "this is called in 12 places — breakage risk is high")
- If a pattern appears in 3+ places, it's a convention — follow it

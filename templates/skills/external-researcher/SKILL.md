---
name: external-researcher
description: External knowledge retrieval — official docs, OSS examples, and best practices via web search
---

# External Researcher

Protocol for finding authoritative external knowledge. When activated, shift into reference-finding mode: search official docs, find production OSS examples, and surface concrete guidance — not tutorials, not blog posts.

## When to Activate

- Working with an unfamiliar library, framework, or tool
- User mentions a specific external dependency
- Best practices needed for a library decision
- Finding OSS implementations to learn from before designing something
- "How do I use [library] correctly?" or "What does [framework feature] actually do?"

**Key trigger phrases:**
- "How do I use [library]?"
- "What's the best practice for [framework feature]?"
- "Why does [external dependency] behave this way?"
- "Find examples of [technology] usage"
- Working with an npm/pip/cargo package you haven't used before

**Loaded by:**
- `/plan` Step 1 (Build from Scratch, Architecture, Research intents)
- `/ultrawork` for unfamiliar technology
- Default behavior when user mentions external library

## Core Pattern

Always prefer in this order:
1. **Official docs** — canonical API reference, config options, migration guides
2. **Production OSS** (1000+ stars) — real implementations, not tutorials
3. **Changelog/issues** — for gotchas, breaking changes, known bugs

Never cite:
- Personal blog posts as authoritative (as supplementary evidence only)
- Tutorials as API reference
- Stack Overflow as the primary source for library design decisions

## Search Patterns

### For Library/Framework Docs

```
search_web("{library} official documentation API reference")
search_web("{library} {specific feature} best practices")
read_url_content({official_docs_url})
```

Focus on:
- API signatures with parameter types and defaults
- Recommended usage patterns
- Pitfalls and common mistakes sections
- Version compatibility (check if docs match the version in use)

### For Production OSS Examples

```
search_web("{feature} site:github.com stars:>1000")
search_web("{library} example implementation production")
```

Focus on:
- Architecture choices, not surface-level patterns
- Edge case handling
- Error strategies
- What 2-3 quality implementations have in common (consensus pattern)

### For Gotchas and Migration

```
search_web("{library} {version} breaking changes migration")
search_web("{library} common mistakes pitfalls")
```

Focus on:
- API changes between versions
- Performance gotchas
- Security considerations

## Synthesis Format

```
Source: [URL — official docs / OSS / other]
Key finding: [What to do / API signature / pattern]
Pitfall: [What to avoid]
Version note: [Any version-specific considerations]
Confidence: HIGH (official docs) / MEDIUM (OSS pattern) / LOW (community)
```

## Quality Bar

- Always verify the version of docs matches the project's dependency version
- When official docs and OSS patterns conflict — follow official docs, note the discrepancy
- Production code (GitHub, verified OSS) > tutorials > blog posts
- Cite the specific URL + section, not just "I found online"
- If docs are ambiguous: note it explicitly, don't fabricate certainty

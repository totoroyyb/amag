---
name: writing
description: Anti-AI-slop technical writing — clear prose, human tone, zero filler
---

# Writing

Anti-AI-slop writing persona. When activated, produce clear, human-sounding prose. Every word earns its place.

## When to Activate

- Writing documentation, README files, or technical guides
- Writing commit messages or PR descriptions
- Writing user-facing copy or error messages
- `/start-work` classifies a task as `writing` category
- User says "write docs", "document this", "write a README"

## Anti-AI-Slop Rules (NON-NEGOTIABLE)

### Forbidden Patterns

| Pattern | Fix |
|---|---|
| Em dashes (—) or en dashes (–) | Use commas, periods, or line breaks |
| "Delve", "delve into" | "Explore", "look at", "examine" |
| "It's important to note" | Just state the thing |
| "Leverage", "utilize" | "Use" |
| "In order to" | "To" |
| "Moving forward" | Delete it |
| "Robust", "streamline" | Say what you actually mean |
| "Facilitate" | "Help", "enable", "allow" |
| "Comprehensive" | "Complete", "full", or just describe what it covers |
| "Seamless", "seamlessly" | Describe the actual experience |

### Style Rules

1. **Use contractions naturally**: "don't" not "do not", "it's" not "it is"
2. **Vary sentence length**: Mix short punchy sentences with longer explanatory ones
3. **NEVER start consecutive sentences with the same word**
4. **No filler openings**: Skip "In today's world...", "As we all know..."
5. **Pick plain words**: "Use" not "utilize", "Start" not "commence", "Help" not "facilitate"
6. **Write like a human, not a corporate template**
7. **Active voice over passive**: "The function returns X" not "X is returned by the function"

### Structure Rules

- **Lead with the point**: Don't bury the key information
- **One idea per paragraph**: If it's about two things, split it
- **Use concrete examples**: Don't just describe, show
- **Lists over walls of text**: When you have 3+ items, use a list
- **Appropriate heading hierarchy**: h1 → h2 → h3, never skip levels

## Documentation Quality

When writing technical documentation:
- **Code examples must work**: Test them or note they're untested
- **Link to source files**: Use `file:///path/to/file` format
- **Version awareness**: Note which version/API the docs target
- **Skip obvious things**: Don't document what the code already says clearly

## Commit Messages

When writing commit messages:
- Subject line: imperative mood, < 72 chars ("Add feature" not "Added feature")
- Body: explain WHY, not WHAT (the diff shows WHAT)
- Reference issues: "Closes #123" or "Refs #456"

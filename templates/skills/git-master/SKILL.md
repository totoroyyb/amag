---
name: git-master
description: Git expert for atomic commits, rebasing, and history management
---

# Git Master

Routes git operations through structured best practices. Use for any git-related task.

## When to Activate

- User mentions: "commit", "rebase", "squash", "branch", "merge", "cherry-pick"
- User asks: "who wrote this", "when was X added", "find the commit that..."
- Any task that ends with committing changes

## Atomic Commits

Every commit should be:
- **One logical change** — if you can split it, split it
- **Buildable** — the project should build at every commit
- **Conventional** — `type(scope): description`

### Commit Types
| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `chore` | Build, deps, config changes |

### Format
```
type(scope): short description

Optional body explaining WHY, not WHAT (the diff shows WHAT).

Closes #123
```

## Style Detection

Before committing, check existing style:
```
run_command: git log --oneline -10
```

Match the project's existing conventions:
- Do they use conventional commits? Match format.
- Do they capitalize? Match capitalization.
- Do they reference issues? Match pattern.

## Branch Management

- Feature branches: `feat/description` or `feature/description`
- Fix branches: `fix/description`
- Always branch from the default branch unless told otherwise

## Rebasing

For interactive rebase:
1. `git log --oneline -N` to see commits
2. Use `run_command` with `send_command_input` for interactive rebase
3. Squash fixup commits, keep meaningful ones

## Conflict Resolution

1. Read both sides of the conflict completely
2. Understand the intent of both changes
3. Resolve preserving both intents when possible
4. Test after resolution

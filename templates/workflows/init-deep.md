---
description: Generate hierarchical GEMINI.md context files across the codebase
---

# /init-deep — Deep Codebase Initialization

Generate hierarchical GEMINI.md documentation files across the entire codebase. These files serve as AI-readable context that helps agents understand each directory's purpose, key files, and working instructions.

## Steps

### 1. Map Directory Structure

```
find_by_name with Pattern="*" and Type="directory"
```

Exclude: `node_modules`, `.git`, `dist`, `build`, `__pycache__`, `.venv`, `coverage`, `.next`

### 2. Plan Generation Order

Generate **parent levels before child levels** to ensure references are valid:

```
Level 0: / (root)
Level 1: /src, /docs, /tests
Level 2: /src/components, /src/utils
```

### 3. Generate GEMINI.md Per Directory

For each directory:
1. Read key files using `view_file_outline` (don't read entire large files)
2. Analyze purpose and relationships
3. Write GEMINI.md with this template:

```markdown
# {Directory Name}

## Purpose
{One paragraph: what this directory contains and its role}

## Key Files
| File | Description |
|------|-------------|
| `file.ts` | Brief description |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `subdir/` | What it contains |

## For AI Agents

### Working Here
{Special instructions for modifying files in this directory}

### Testing
{How to verify changes in this directory}

### Patterns
{Code conventions used here}
```

### 4. Skip Rules

| Condition | Action |
|-----------|--------|
| Empty directory (no files, no subdirs) | Skip |
| Only generated/build files (.min.js, .map) | Skip |
| Only config files | Create minimal GEMINI.md |
| Has substantive code | Full GEMINI.md |

### 5. Validate

After generation:
- Verify all GEMINI.md files reference real files
- Ensure no orphaned GEMINI.md for deleted directories
- Check that descriptions are specific, not generic boilerplate

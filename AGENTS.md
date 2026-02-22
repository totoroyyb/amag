# AMAG — Agent Protocol System

OmO-style agent orchestration for Antigravity. Rules, workflows, skills, and a CLI (`amag`) to install them into any project.

**Version**: 0.1.0

## Architecture

| Layer | Location | Count | Purpose |
|-------|----------|-------|---------|
| Root prompt | `templates/GEMINI.md` | 1 | Core behavioral protocol — installed to project root as `GEMINI.md` |
| Rules | `templates/rules/*.md` | 4 | Always-on constraints (code quality, error recovery, task tracking, session start) |
| Workflows | `templates/workflows/*.md` | 7 | Slash-command flows (`/plan`, `/start-work`, `/debug`, `/explore`, `/ultrawork`, `/resume`, `/init-deep`) |
| Skills | `templates/skills/*/SKILL.md` | 10 | On-demand expertise loaded by workflows or ad-hoc |
| CLI source | `src/` | 5 files | TypeScript CLI that installs/updates/removes components into `.agent/` |

## Key Files

| File | Role |
|------|------|
| `templates/GEMINI.md` | Source of truth for the agent's behavioral protocol |
| `src/registry.ts` | Canonical list of all components (`COMPONENTS` array) |
| `scripts/validate-registry.ts` | Bidirectional sync enforcer — runs on `prebuild` |
| `src/installer.ts` | Copies templates into target projects |
| `src/config.ts` | `.amag/config.json` schema and defaults |
| `.amag/config.json` | Review agent configuration (CLI, model, thinking level) |

---

## Cross-File Dependency Map

**Before finishing any change, check this table.**

| If you modify... | Also check/update... |
|---|---|
| Any file in `templates/rules/` | `src/registry.ts` COMPONENTS array — add/remove/rename entry |
| Any file in `templates/workflows/` | `src/registry.ts` COMPONENTS array — add/remove/rename entry |
| Any file in `templates/skills/*/SKILL.md` | `src/registry.ts` COMPONENTS array — add/remove/rename entry |
| `src/registry.ts` (add/remove component) | Corresponding template file must exist on disk |
| `templates/GEMINI.md` | All workflow/skill/rule names referenced in it still exist and match |
| A skill's name or interface | Every workflow that loads that skill (search: `grep -rn "skill-name" templates/workflows/`) |
| A workflow's name or step numbering | `templates/GEMINI.md` references, other workflows that reference it (e.g., `/resume` → `/start-work`) |
| `.amag/config.json` structure | `src/config.ts` defaults, `plan-consultant` and `plan-critic` SKILL.md files |
| A rule's filename | `src/registry.ts` name field, `templates/GEMINI.md` if referenced by name |

---

## Three-Way Sync Invariant

Every component exists in exactly three places that must agree:

```
templates/           ←→  src/registry.ts  ←→  scripts/validate-registry.ts
(files on disk)          (COMPONENTS[])        (bidirectional checker)
```

1. **`templates/`** — source of truth for all template files (rules as `.md`, workflows as `.md`, skills as `*/SKILL.md`)
2. **`src/registry.ts`** — canonical array of `{ type, name, description }` for every component
3. **`scripts/validate-registry.ts`** — runs on `prebuild`, exits 1 if anything is out of sync in either direction

**Invariant**: A component on disk without a registry entry (or vice versa) breaks the build. `npm run build` catches this automatically.

---

## Consistency Check Protocol

**After modifying ANY skill, workflow, or rule, perform three rounds of verification before marking work done.**

### Round 1 — Internal Consistency

Check the changed file itself:
- All cross-references within the file point to real files, real step numbers, real skill names
- Terminology matches its own definitions (e.g., if it defines "Phase 2", later references say "Phase 2", not "Step 2")
- YAML frontmatter is present and valid (workflows require `description`, skills require `name` + `description`)

### Round 2 — Cross-File Consistency

Check every file that references the changed file:
- `grep -rn "<changed-component-name>" templates/ src/` to find all references
- Verify each reference still works: correct skill name, correct workflow step number, correct behavioral claim
- Check the Cross-File Dependency Map above for known dependencies

### Round 3 — Terminology & Behavioral Alignment

Verify naming and behavior agree across all layers:
- The component's name in `registry.ts` matches its filename and its internal header
- The `description` in `registry.ts` accurately reflects what the component actually does
- Trigger conditions in `GEMINI.md` (e.g., Intent Gate, Skill Pre-Check) match the component's own "When to Activate" section
- Behavioral contracts are consistent: if `GEMINI.md` says "X never writes code", the component's instructions also say "never write code"

**All three rounds must pass. If Round 2 or 3 reveals issues, fix them and re-run all three rounds.**

---

## Project Invariants

These rules are absolute. Violating any of them causes regressions.

### Structure & Build

| # | Invariant | Enforced By |
|---|-----------|-------------|
| 1 | Every skill directory MUST contain `SKILL.md` | `validate-registry.ts` |
| 2 | Every workflow MUST have YAML frontmatter with `description` | Antigravity workflow loader |
| 3 | `templates/GEMINI.md` is the source of truth — edits go there, not to installed copies | Convention |
| 4 | `registry.ts` descriptions must accurately reflect component purpose | Round 3 of consistency check |
| 5 | `npm run build` must pass after every change (runs `validate-registry.ts` as prebuild) | CI / developer discipline |

### Behavioral Contracts

| # | Invariant | Where Defined |
|---|-----------|---------------|
| 6 | `/plan` never implements — terminates at Step 10, no code changes | `templates/workflows/plan.md` |
| 7 | `/explore` never writes — strictly read-only, no project files created | `templates/workflows/explore.md` |
| 8 | Verification Protocol (Steps 1→2→2.5→3→4→5→6) is non-negotiable and ordered | `templates/GEMINI.md` |
| 9 | Dual-Write Protocol — `active-plan.md`, `task.md`, AND `task_boundary` update together | `templates/GEMINI.md`, `templates/rules/todo-enforcement.md` |
| 10 | Self-validation on every read — `active-plan.md` checkboxes are truth, metadata is secondary | `templates/GEMINI.md` |
| 11 | Lifecycle guard — never overwrite an active plan without archiving first | `templates/GEMINI.md` |

### Error Handling & Safety

| # | Invariant | Where Defined |
|---|-----------|---------------|
| 12 | 3-failure escalation — stop → revert → different approach → ask user | `templates/rules/error-recovery.md` |
| 13 | Command polling max 60s — `WaitDurationSeconds` must never exceed 60 | `templates/GEMINI.md`, `templates/rules/error-recovery.md` |
| 14 | No type suppression — `as any`, `@ts-ignore`, empty catches are never allowed | `templates/GEMINI.md` |
| 15 | No blind retries — same failing command/action requires diagnosis before retry | `templates/rules/error-recovery.md` |

### Skill & Workflow Interaction

| # | Invariant | Where Defined |
|---|-----------|---------------|
| 16 | Ad-hoc skill loading requires explicit justification + omission reasoning | `templates/GEMINI.md` |
| 17 | Auto-Ultrawork rigor is always on unless user explicitly opts out | `templates/GEMINI.md` |
| 18 | Category tiebreaker: primary = hardest part; load skills from ALL matching categories | `templates/GEMINI.md` |
| 19 | Config schema changes must be backward-compatible (skills handle missing keys gracefully) | `src/config.ts`, skill files |
| 20 | State lives in two places: brain artifacts (conversation) + `.amag/active-plan.md` (cross-session) | `templates/GEMINI.md` |

---

## Common Regression Patterns

| Pattern | What Breaks | Prevention |
|---------|-------------|------------|
| Renamed skill, forgot `GEMINI.md` | Skill Pre-Check table points to nonexistent skill | Round 2 cross-file check |
| New template added, not in `registry.ts` | `npm run build` fails on prebuild | Always run `npm run build` |
| Changed workflow step numbers | Other files reference stale step numbers (e.g., "/plan Step 6") | `grep -rn "Step [0-9]" templates/` after renumbering |
| Inconsistent trigger conditions | `GEMINI.md` says "auto-engage on X" but workflow says "only on explicit invoke" | Round 3 behavioral alignment |
| Stale `registry.ts` description | CLI `amag list` shows wrong purpose for a component | Round 3 terminology check |
| Modified config schema without defaults | Skills crash reading missing config keys | `src/config.ts` merge logic + test with empty config |
| Workflow references skill that doesn't exist yet | Agent tries to load missing skill at runtime | `grep -rn "skill-name" templates/` before deleting any skill |

---

## Skill ↔ Workflow Reference Map

Which workflows load which skills (all references must stay valid):

| Skill | Loaded By |
|-------|-----------|
| `codebase-explorer` | `/plan` Step 1, `/explore` Phase 1-2, `/debug` (via `deep-work`) |
| `deep-work` | `/start-work` Step 3b, `/debug` Phase 2, `/ultrawork`, `/explore` Phase 2 |
| `external-researcher` | `/plan` Step 1, `/explore` Phase 2 |
| `plan-consultant` | `/plan` Step 6 |
| `plan-critic` | `/plan` Step 8, `/start-work` Step 5a-b |
| `architecture-advisor` | `/debug` escalation, `/explore` Phase 3 |
| `frontend-ui-ux` | `/start-work` Step 3b (visual category) |
| `git-master` | `/start-work` Step 3b (git operations), Skill Pre-Check |
| `browser-testing` | `/start-work` Step 3b, Skill Pre-Check |
| `writing` | `/start-work` Step 3b (writing category) |

---

## Build & Validation

```bash
npm run build              # TypeScript compile + prebuild registry validation
npm run typecheck           # tsc --noEmit (type checking only)
npm run validate-registry   # Standalone registry ↔ template sync check
```

**After every change**: run `npm run build`. If it fails on the prebuild step, `registry.ts` and `templates/` are out of sync. You should also update the `AGENTS.md` file to reflect the important changes that are referenced in this file.

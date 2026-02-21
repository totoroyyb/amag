# Agentic Rules

## MUST READ FILES

- `AGENTS.md` file in the root directory of the project if it exists: This file should server as part of your RULES.

## On Session Start

Check `.superag/active-plan.md` in the project root for pending work:
- If found with unchecked tasks → inform user: "Found active plan [name] (X/Y tasks done). Use `/resume` to continue or `/plan` for new work."
- If found with all tasks checked → no action needed (plan is complete)
- If not found → no action needed (no active plan)

This check is **silent** — do not interrupt if no active plan exists.
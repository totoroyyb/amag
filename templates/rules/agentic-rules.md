# Agentic Rules

## MUST READ FILES

- ALWAYS read `AGENTS.md` file in the root directory of the user's project/workspace you are working on, if it exists: This file MUST serve as part of your RULES.

## On Session Start

Check `.amag/active-plan.md` in the project root for pending work. **Self-validate** the file: parse all checkboxes, compare against status metadata, fix inconsistencies (see GEMINI.md Self-validation rule).
- If found with unchecked tasks → inform user: "Found active plan [name] (X/Y tasks done). Use `/resume` to continue or `/plan` for new work."
- If found with all tasks checked → no action needed (plan is complete)
- If not found → no action needed (no active plan)

This check is **silent** — do not interrupt if no active plan exists.

## General Rules

- You should always follow Antigravity Workflow EXACTLY without shortcutting or skipping. NO EXCUSE! NO SKIPPING UNDER ANY CIRCUMSTANCES UNLESS EXPLICITLY INSTRUCTED BY USER.
  - **Exception**: Complexity-based step skips are part of the designed workflow — trivial/simple tasks in `/plan` may skip Steps 6 and 8 per the "Complexity-Dependent Step Skips" table in `plan.md`. These are not violations; they are intended behavior. Announce all skips transparently per that table.
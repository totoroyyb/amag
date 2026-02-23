---
description: Immediately escalate to external CLI consultation during an active /debug session
---

# /debug-escalate — Immediate External CLI Consultation

Skip the automatic escalation chain and immediately consult an external agent for help with the current debugging problem.

> [!IMPORTANT]
> This command only works **during an active `/debug` session**. If no debug session is active, inform the user and suggest starting one with `/debug`.

## What Happens

1. **Collect current debug context** — gather everything accumulated so far:
   - Symptom and bug type (from Phase 1, if reached)
   - Reproduction steps (from Phase 2, if reached)
   - Any hypotheses tested/eliminated (from Phase 3, if reached)
   - Any code sections already investigated

2. **Write escalation request** to `.amag/reviews/debug-{timestamp}-request.md` using template in `.agent/resources/debug-escalation-template.md` (read it via `view_file`)

3. **Load `external-cli-runner` skill.** Invoke with:
   - **configPath**: `debug.consultant`
   - **requestFile**: `.amag/reviews/debug-{timestamp}-request.md`
   - **responseFileRaw**: `.amag/reviews/debug-{timestamp}-response-raw.md`
   - **responseFile**: `.amag/reviews/debug-{timestamp}-response.md`
   - **requiredField**: `## Recommendation`
   - **fallbackAction**: "Skip external consultation — report findings to user"

4. **On success**: present recommendation to user, then apply and re-attempt fix from Phase 5 of the debug workflow

5. **On failure**: report to user with all context gathered so far

## Keyword Aliases

These phrases are treated identically to `/debug-escalate`:

- "consult external"
- "ask codex" / "ask claude"
- "get second opinion"
- Any explicit request for external help

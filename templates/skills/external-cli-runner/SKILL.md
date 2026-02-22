---
name: external-cli-runner
description: Unified external CLI agent runner — backend detection, command dispatch, retry logic, response parsing
---

# External CLI Runner

Reusable infrastructure for spawning external CLI agents (claude, codex, gemini-cli). Handles backend detection, command construction, thinking level mapping, retry-on-failure (up to 3 attempts), and response parsing.

**Any skill that needs to delegate work to an external CLI agent should load this skill** instead of implementing CLI invocation directly.

## When to Activate

Loaded by other skills that need external CLI execution:
- `plan-consultant` — pre-plan gap analysis
- `plan-critic` — post-plan review
- Future: any skill that delegates to an external agent

## Inputs (provided by caller)

The calling skill MUST provide these parameters:

| Parameter | Example | Description |
|---|---|---|
| `configPath` | `review.consultant` | Dot-path into `.amag/config.json` to read `cli`, `model`, `thinking` |
| `requestFile` | `.amag/reviews/{id}-consultant-request.md` | Path to the request file (already written by caller) |
| `responseFileRaw` | `.amag/reviews/{id}-consultant-response-raw.md` | Where raw CLI output goes |
| `responseFile` | `.amag/reviews/{id}-consultant-response.md` | Where cleaned/parsed response goes |
| `requiredField` | `verdict:` | A string that must appear in a valid response |
| `fallbackAction` | "Proceed to Self-Review Path (Step 2B)" | What the caller does on total failure |

---

## Step 1: Detect Backend

1. Read `.amag/config.json` via `view_file`. Navigate to `{configPath}` to get `cli`, `model`, `thinking`.
2. If `cli` is set, verify availability:
   ```
   run_command: which <cli_name>
   ```
3. If exit 0 → **CLI Path** (Step 2). If exit non-zero or `cli` is null → **report failure to caller**.

Update `task_boundary`: `TaskStatus: "External CLI: detecting backend for {configPath}..."`

### Fallback Warning (MANDATORY when CLI not found)

If CLI was configured but not found on PATH:

1. Update `task_boundary`: `TaskStatus: "⚠️ External CLI: {cli_name} not found — caller should fall back"`
2. Surface a warning:
   ```
   > [!CAUTION]
   > **CLI not found**: Configured CLI `{cli_name}` was not found on PATH.
   > Falling back to caller's fallback path.
   > To install: `npm install -g @openai/codex` or `npm install -g @anthropic-ai/claude-code`
   > To disable CLI: set `{configPath}.cli` to `null` in `.amag/config.json`
   ```
3. **Return to caller** with failure — caller handles fallback.

---

## Step 2: Build + Run CLI Command

Read `model` and `thinking` from config. Map thinking level, build command, execute.

### Thinking Level Mapping

| Config value | claude `--effort` | codex `-c model_reasoning_effort` | gemini behavior |
|---|---|---|---|
| `max` | `high` | `high` | Default |
| `high` | `high` | `high` | Default |
| `medium` | `medium` | `medium` | Default |
| `low` | `low` | `low` | Default |
| `none` | `low` | `low` | Default |

### CLI Command Templates

**Claude:**
```
run_command: claude --print --model {model} --effort {thinking_mapped} --fallback-model sonnet --dangerously-skip-permissions < {requestFile} > {responseFileRaw} 2>&1
```

> [!NOTE]
> `--fallback-model sonnet` enables automatic model fallback when the primary model is overloaded or returns a server error. Only works with `--print`.

**Codex:**
```
run_command: codex exec --full-auto -m {model} -c model_reasoning_effort="{thinking_mapped}" -o {responseFileRaw} < {requestFile}
```

If `-o` flag is not available on the installed version, fall back to stdout redirect:
```
run_command: codex exec --full-auto -m {model} -c model_reasoning_effort="{thinking_mapped}" < {requestFile} > {responseFileRaw} 2>&1
```

**Gemini CLI:**
```
run_command: cat {requestFile} | gemini --yolo > {responseFileRaw} 2>&1
```

### Execution Protocol

Set `WaitMsBeforeAsync: 500` to run async. Poll via `command_status` at 60s intervals.

If no output progress for 2 consecutive polls → `send_command_input(Terminate=true)` → count as a failed attempt.

> [!NOTE]
> **No `--json` flag.** CLI output should be human-readable for transparency. Structured capture happens via the response file.

---

## Step 3: Error Detection + Retry (up to 3 attempts)

> [!IMPORTANT]
> **3 retries maximum.** After 3 failed attempts, return failure to caller.

After each CLI execution, check for errors:

### Error Detection

Check **both** of these:

1. **Exit code ≠ 0** — command failed
2. **Raw response contains error patterns** — scan `{responseFileRaw}` for:
   - `API Error:`
   - `Internal server error`
   - `overloaded`
   - `rate_limit`
   - `timeout`

> [!IMPORTANT]
> The `2>&1` redirect sends stderr to the raw file, so the exit code alone may not reveal the error. **Always scan the raw file content** in addition to checking exit code.

### Retry Protocol

```
attempt = 1
while attempt <= 3:
    run CLI command (Step 2)
    if exit code == 0 AND no error patterns in raw response:
        → proceed to Step 4 (Parse Response)
    else:
        log: "External CLI attempt {attempt}/3 failed: {error summary}"
        attempt += 1

if attempt > 3:
    update task_boundary: TaskStatus: "⚠️ External CLI: 3 attempts failed — returning to caller for fallback"
    → return failure to caller (caller executes their fallbackAction)
```

Update `task_boundary` on each attempt:
- `TaskStatus: "External CLI: attempt {N}/3 for {configPath}..."`

---

## Step 4: Parse Response

After a successful CLI execution (exit 0, no error patterns):

1. Read `{responseFileRaw}` via `view_file`
2. Clean up: strip ANSI escape codes, CLI chrome/wrapper formatting
3. Write cleaned output to `{responseFile}` via `write_to_file`
4. Verify `{requiredField}` exists in the response:
   ```
   grep_search("{requiredField}", "{responseFile}")
   ```
   - If found → **return success to caller** with the response file path
   - If not found → treat as a failed attempt, go back to retry loop (Step 3)

---

## Caller Integration Pattern

Skills that use this runner should follow this pattern:

```markdown
### CLI Execution

Load `external-cli-runner` skill. Invoke with:
- configPath: `review.consultant`
- requestFile: `.amag/reviews/{planId}-consultant-request.md`
- responseFileRaw: `.amag/reviews/{planId}-consultant-response-raw.md`
- responseFile: `.amag/reviews/{planId}-consultant-response.md`
- requiredField: `verdict:`
- fallbackAction: "Proceed to Self-Review Path (Step 2B)"

If the runner returns success → read responseFile and proceed.
If the runner returns failure → execute fallbackAction.
```

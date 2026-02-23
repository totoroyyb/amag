# AMAG: All Mighty AntiGravity

Agent orchestration for [Antigravity](https://antigravity.google). Curated rules, workflows, and skills that transform Antigravity's AI agent into a disciplined engineering partner.

Inspired by [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) — rebuilt from scratch for Antigravity's native tooling.

## Quick Start

```bash
cd /path/to/your/project
npx @totoroyyb/amag init
```

Or build from source:

```bash
git clone https://github.com/totoroyyb/amag.git
cd amag && npm install && npm run build && npm link
```

That's it. Your project now has a `GEMINI.md` root prompt, always-on rules, slash-command workflows, and on-demand skills.

## What You Get

### Core System (`GEMINI.md`)

The root prompt that orchestrates everything:

- **Intent Gate** — classifies every request before acting (trivial, explicit, exploratory, open-ended)
- **True Intent Extraction** — understands what you *actually* want, not just what you typed
- **Auto-Ultrawork** — maximum rigor is always on: full verification, zero scope reduction
- **Codebase Assessment** — evaluates project maturity and adapts behavior accordingly
- **Verification Protocol** — evidence-based completion with a 6-step checklist (spec compliance → build → tests → debug scan)

### Rules (Always-On)

Loaded into every conversation automatically.

| Rule | What it does |
|------|-------------|
| `code-quality` | Think-first coding, surgical changes, no AI slop |
| `error-recovery` | 3-failure escalation, blind retry prevention, hung command detection |
| `todo-enforcement` | Task breakdown, progress tracking, never abandon work |
| `agentic-rules` | Session start checks, active plan detection, auto-resume guidance |

### Workflows (Slash Commands)

Type the command to activate.

| Command | What it does |
|---------|-------------|
| `/plan` | Planning interview with optional external consultant + critic review |
| `/start-work` | Execute a plan task-by-task with category-aware delegation |
| `/resume` | Cross-session resume from `.amag/active-plan.md` |
| `/debug` | 6-phase systematic debugging with external agent escalation |
| `/debug-escalate` | Immediately escalate to external CLI during an active `/debug` |
| `/explore` | Read-only multi-phase codebase exploration and architecture synthesis |
| `/ultrawork` | Maximum effort mode — 100% certainty before acting |
| `/init-deep` | Generate hierarchical `GEMINI.md` context files across the codebase |

### Skills (On-Demand)

Auto-loaded when relevant, or loaded explicitly by workflows.

| Skill | What it does |
|-------|-------------|
| `deep-work` | Autonomous exploration — read extensively, build mental model, act decisively |
| `git-master` | Atomic commits, conventional format, rebasing, conflict resolution |
| `browser-testing` | Visual testing via Antigravity's `browser_subagent` |
| `frontend-ui-ux` | Design-first UI with bold aesthetics and responsive patterns |
| `writing` | Anti-AI-slop technical writing — plain words, human tone |
| `architecture-advisor` | Read-only design review with simplicity bias |
| `codebase-explorer` | Structured parallel codebase research and cross-validation |
| `external-researcher` | External library/API research — official docs and best practices |
| `external-cli-runner` | Unified runner for Claude, Codex, and Gemini CLIs with retry logic |
| `plan-consultant` | Pre-plan gap analysis — surface missing requirements before generation |
| `plan-critic` | Post-plan adversarial review — verify references and executability |

## Typical Workflow

```
You:   /plan add OAuth login with Google and GitHub
Agent: [explores codebase → asks clarifying questions → drafts plan]
       [runs plan through consultant + critic if configured]
       → implementation_plan.md ready for review

You:   /start-work
Agent: [executes plan task-by-task: build → type-check → test after each]
       → all tasks complete, verified with evidence

You:   /resume                      # pick up where you left off in a new session

You:   /debug login redirects fail on Safari
Agent: [reproduce → hypothesize → instrument → root-cause → fix → verify]
       [escalates to external CLI if stuck: /debug-escalate]

You:   /explore how does the auth middleware chain work?
Agent: [structural scan → module deep-dives → synthesizes architecture doc]
       → read-only, never modifies code
```

## External Agent Integration

AMAG can delegate work to external CLI agents — Claude, Codex, or Gemini — to get a second opinion from a different model. This happens in two contexts:

**Plan review** (`/plan` workflow):
1. **Consultant** — before the plan is generated, an external agent analyzes your requirements for gaps, ambiguities, and missing edge cases
2. **Critic** — after the plan is generated, a different external agent stress-tests it for executability, missing references, and unrealistic assumptions

**Debug consultation** (`/debug` workflow):
- When debugging stalls after multiple failed hypotheses, AMAG sends the full debug context to an external agent for fresh analysis
- Trigger manually with `/debug-escalate` or let the workflow offer it at a natural checkpoint

Each external call includes full project context, retry logic (up to 3 attempts), and a configurable thinking level that controls how deeply the external model reasons.

### Configuration

```bash
npx @totoroyyb/amag config show                              # View current config
npx @totoroyyb/amag config set review.consultant.cli claude   # Set plan consultant
npx @totoroyyb/amag config set review.critic.cli codex        # Set plan critic
npx @totoroyyb/amag config set debug.consultant.cli codex     # Set debug consultant
npx @totoroyyb/amag config set review.critic.thinking high    # Set thinking level
npx @totoroyyb/amag config reset                              # Reset to defaults
```

Thinking levels: `max`, `high`, `medium`, `low`, `none`.

Configuration is stored in `.amag/config.json` in your project root. This file is created during `init` or `update` with sensible defaults. You can modify it via the CLI commands above or edit the JSON directly.

### Prerequisites

External agent features require the corresponding CLI tools to be installed and authenticated on your machine:

| CLI | Install | Auth |
|-----|---------|------|
| [Claude Code](https://code.claude.com/docs/en/overview) | `curl -fsSL https://claude.ai/install.sh | bash` | You might need to login with `claude` CLI first |
| [Codex CLI](https://github.com/openai/codex) | `npm install -g @openai/codex` | `codex login` |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | `npm install -g @google/gemini-cli` | You might need to login with `gemini` CLI first |

If no external CLI is configured or available, AMAG falls back to native single-agent review — everything still works, just without the multi-model perspective.

## CLI Reference

```bash
npx @totoroyyb/amag init                    # Install all components
npx @totoroyyb/amag update                  # Overwrite with latest templates
npx @totoroyyb/amag add <type> <name>       # Install one component (rule, workflow, skill)
npx @totoroyyb/amag remove <type> <name>    # Remove one component
npx @totoroyyb/amag uninstall               # Remove all AMAG files
npx @totoroyyb/amag list                    # Show available components
npx @totoroyyb/amag doctor                  # Check installation status
npx @totoroyyb/amag config show|set|reset   # Manage configuration
```

## Design Philosophy

1. **System prompts are the product** — the CLI is just a delivery mechanism
2. **Every template earns its place** — no bloat, curated for real engineering workflows
3. **Antigravity-native** — built on AG's actual tools, not abstractions
4. **Composable** — add only what you need, remove what you don't

## License

MIT

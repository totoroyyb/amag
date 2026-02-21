# AMAG

OmO-style agent orchestration for [Antigravity](https://antigravity.google). Curated rules, workflows, and skills that transform Antigravity's AI agent into a disciplined engineering team.

## What is this?

AMAG brings the best ideas from [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) to Google Antigravity — without the overhead. No hooks, no multi-model routing, no platform-specific ceremony. Just high-quality prompt engineering that works natively with Antigravity's tools.

## Install

```bash
# Clone and install
git clone https://github.com/your-org/amag.git
cd amag
npm install
npm run build

# Install into any project
cd /path/to/your/project
npx amag init
```

Or install individual components:

```bash
amag add rule code-quality
amag add workflow ultrawork
amag add skill git-master
```

## What Gets Installed

### GEMINI.md (Root Context)

The core system prompt — adapts the Sisyphus orchestrator pattern for Antigravity:
- **Intent Gate**: Classifies every request before acting
- **Codebase Assessment**: Evaluates project maturity before following patterns
- **Parallel Execution**: Fires tool calls simultaneously by default
- **Verification Protocol**: Evidence-based completion (not "should work")

### Rules (Always-On)

| Rule | Purpose |
|------|---------|
| `todo-enforcement` | Task tracking discipline — break down, track progress, never abandon |
| `error-recovery` | Failure protocol — 3 failures → stop, revert, ask |
| `code-quality` | Karpathy guidelines — think first, simplify, surgical changes |

### Workflows (Slash Commands)

| Command | Purpose |
|---------|---------|
| `/ultrawork` | Full autonomous parallel execution with verification loop |
| `/plan` | Strategic planning interview — explore before asking |
| `/init-deep` | Generate hierarchical GEMINI.md context files |

### Skills (On-Demand)

| Skill | Purpose |
|-------|---------|
| `git-master` | Atomic commits, conventional format, rebasing |
| `browser-testing` | Visual testing via Antigravity's browser_subagent |
| `frontend-ui-ux` | Design-first UI development |

## CLI Commands

```bash
amag init              # Install everything
amag add <type> <name> # Install one component
amag list              # Show available components
amag doctor            # Check installation status
```

## Design Philosophy

1. **System prompts are the product** — the CLI is just a delivery mechanism
2. **Every template earns its place** — no bloat, no rarely-used features
3. **Antigravity-native** — uses AG's actual tools (`grep_search`, `run_command`, `browser_subagent`), not abstractions
4. **Borrowed from the best, adapted for reality** — Sisyphus orchestration without the multi-agent overhead

## Reference

Built on research from:
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) — Sisyphus orchestrator, phased execution, intent gate
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) — skill format patterns, template rules

## License

MIT

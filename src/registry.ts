import chalk from "chalk";
import { log } from "./utils.js";

export type ComponentType = "rule" | "workflow" | "skill";

export interface Component {
    type: ComponentType;
    name: string;
    description: string;
}

export const COMPONENTS: Component[] = [
    // Rules (always-on behavioral constraints)
    {
        type: "rule",
        name: "todo-enforcement",
        description: "Task tracking discipline — create task breakdowns, mark progress, never abandon work",
    },
    {
        type: "rule",
        name: "error-recovery",
        description: "Failure protocol — fix root causes, blind retry prevention, 3-failure escalation, command wait loop detection",
    },
    {
        type: "rule",
        name: "code-quality",
        description: "Coding standards — think first, simplicity, surgical changes, no leftover debug code",
    },
    {
        type: "rule",
        name: "agentic-rules",
        description: "Session start checks — read AGENTS.md, detect active plans, guide to /resume",
    },

    // Workflows (slash-command triggers)
    {
        type: "workflow",
        name: "ultrawork",
        description: "/ultrawork — Maximum effort deep work: 100% certainty, zero compromises",
    },
    {
        type: "workflow",
        name: "plan",
        description: "/plan — Structured planning interview before implementation",
    },
    {
        type: "workflow",
        name: "start-work",
        description: "/start-work — Execute an implementation plan task-by-task with category awareness",
    },
    {
        type: "workflow",
        name: "init-deep",
        description: "/init-deep — Generate hierarchical GEMINI.md context files per directory",
    },
    {
        type: "workflow",
        name: "resume",
        description: "/resume — Cross-session resume from .amag/active-plan.md with self-validation",
    },

    // Skills (on-demand expertise)
    {
        type: "skill",
        name: "git-master",
        description: "Git expertise — atomic commits, conventional format, rebasing, conflict resolution",
    },
    {
        type: "skill",
        name: "browser-testing",
        description: "Browser testing — Antigravity browser_subagent patterns for visual verification",
    },
    {
        type: "skill",
        name: "frontend-ui-ux",
        description: "Design-first frontend — bold aesthetics, typography, responsive patterns, accessibility",
    },
    {
        type: "skill",
        name: "deep-work",
        description: "Autonomous exploration — read extensively before acting, goal-driven execution",
    },
    {
        type: "skill",
        name: "writing",
        description: "Anti-AI-slop writing — plain words, human tone, zero filler, varied sentences",
    },
    {
        type: "skill",
        name: "architecture-advisor",
        description: "Architecture consulting — read-only design review, simplicity bias, evidence-based recommendations",
    },
    {
        type: "skill",
        name: "codebase-explorer",
        description: "Structured parallel codebase research — multi-angle search, cross-validation, mental model building",
    },
    {
        type: "skill",
        name: "external-researcher",
        description: "External library/API research — official docs, production examples, current best practices",
    },
    {
        type: "skill",
        name: "plan-validator",
        description: "Adversarial plan validation — find gaps, risks, and missing requirements before execution",
    },
    {
        type: "skill",
        name: "planning-critic",
        description: "Pre-plan gap analysis — identify missing requirements and ambiguities before generating a plan",
    },
];

export function listComponents(): void {
    log.header("AMAG Components\n");

    const groups: Record<ComponentType, Component[]> = {
        rule: [],
        workflow: [],
        skill: [],
    };

    for (const comp of COMPONENTS) {
        groups[comp.type].push(comp);
    }

    const labels: Record<ComponentType, string> = {
        rule: "Rules (always-on)",
        workflow: "Workflows (slash commands)",
        skill: "Skills (on-demand)",
    };

    for (const type of ["rule", "workflow", "skill"] as ComponentType[]) {
        console.log(chalk.bold.underline(labels[type]));
        for (const comp of groups[type]) {
            console.log(`  ${chalk.green(comp.name.padEnd(20))} ${chalk.dim(comp.description)}`);
        }
        console.log();
    }

    console.log(chalk.dim("+ GEMINI.md (root context prompt — installed with `amag init`)"));
}

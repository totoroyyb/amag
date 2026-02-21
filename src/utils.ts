import chalk from "chalk";
import path from "node:path";
import fs from "fs-extra";
import { COMPONENTS, type ComponentType } from "./registry.js";

export const log = {
    header: (msg: string) => console.log(chalk.bold.cyan(msg)),
    success: (msg: string) => console.log(chalk.green("✓ " + msg)),
    warn: (msg: string) => console.log(chalk.yellow("⚠ " + msg)),
    error: (msg: string) => console.error(chalk.red("✗ " + msg)),
    info: (msg: string) => console.log(chalk.dim("  " + msg)),
};

export function resolveProjectDir(targetDir: string): string {
    return path.resolve(process.cwd(), targetDir);
}

export async function copyTemplate(
    src: string,
    dest: string,
    label: string,
    options?: { force?: boolean }
): Promise<void> {
    const exists = await fs.pathExists(dest);

    if (exists && !options?.force) {
        log.warn(`${label} — already exists, skipping`);
        return;
    }

    if (!(await fs.pathExists(src))) {
        log.error(`${label} — template not found at ${src}`);
        return;
    }

    await fs.copy(src, dest);
    log.success(exists ? `${label} (updated)` : label);
}

export async function removeIfExists(
    filePath: string,
    label: string
): Promise<boolean> {
    if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        log.success(`Removed ${label}`);
        return true;
    }
    log.warn(`${label} — not installed, skipping`);
    return false;
}

export async function cleanEmptyDirs(
    dir: string,
    stopAt: string
): Promise<void> {
    let current = path.resolve(dir);
    const boundary = path.resolve(stopAt);

    while (current !== boundary && current.startsWith(boundary)) {
        try {
            const entries = await fs.readdir(current);
            if (entries.length === 0) {
                await fs.rmdir(current);
            } else {
                break;
            }
        } catch {
            break;
        }
        current = path.dirname(current);
    }
}

export async function doctorCheck(targetDir: string): Promise<void> {
    const projectDir = resolveProjectDir(targetDir);

    log.header(`AMAG Doctor — Checking ${projectDir}\n`);

    const DEST_MAP: Record<ComponentType, string> = {
        rule: ".agent/rules",
        workflow: ".agent/workflows",
        skill: ".agent/skills",
    };

    let installed = 0;
    let missing = 0;

    // Check GEMINI.md
    const geminiPath = path.join(projectDir, "GEMINI.md");
    if (await fs.pathExists(geminiPath)) {
        log.success("GEMINI.md");
        installed++;
    } else {
        log.warn("GEMINI.md — not installed");
        missing++;
    }

    // Check each component
    for (const comp of COMPONENTS) {
        const destDir = path.join(projectDir, DEST_MAP[comp.type]);
        let filePath: string;

        if (comp.type === "skill") {
            filePath = path.join(destDir, comp.name, "SKILL.md");
        } else {
            filePath = path.join(destDir, `${comp.name}.md`);
        }

        if (await fs.pathExists(filePath)) {
            log.success(`${comp.type}/${comp.name}`);
            installed++;
        } else {
            log.warn(`${comp.type}/${comp.name} — not installed`);
            missing++;
        }
    }

    console.log();
    console.log(
        chalk.bold(
            `${installed} installed, ${missing} missing out of ${COMPONENTS.length + 1} components`
        )
    );

    if (missing > 0) {
        log.info('Run `amag init` to install all components.');
    }
}

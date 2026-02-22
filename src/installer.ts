import { COMPONENTS, type ComponentType } from "./registry.js";
import { resolveProjectDir, copyTemplate, removeIfExists, cleanEmptyDirs, log } from "./utils.js";
import path from "node:path";
import fs from "fs-extra";

const DEST_MAP: Record<ComponentType, string> = {
    rule: ".agent/rules",
    workflow: ".agent/workflows",
    skill: ".agent/skills",
};

const SRC_MAP: Record<ComponentType, string> = {
    rule: "rules",
    workflow: "workflows",
    skill: "skills",
};

function getTemplatesDir(): string {
    // Resolve relative to this file's location (dist/ or src/)
    return path.resolve(import.meta.dirname, "..", "templates");
}

function getDestPath(comp: { type: ComponentType; name: string }, projectDir: string): string {
    const destDir = path.join(projectDir, DEST_MAP[comp.type]);
    if (comp.type === "skill") {
        return path.join(destDir, comp.name, "SKILL.md");
    }
    return path.join(destDir, `${comp.name}.md`);
}

async function installComponent(
    comp: { type: ComponentType; name: string },
    templatesDir: string,
    projectDir: string,
    options?: { force?: boolean }
): Promise<void> {
    const srcDir = path.join(templatesDir, SRC_MAP[comp.type]);
    const destDir = path.join(projectDir, DEST_MAP[comp.type]);

    if (comp.type === "skill") {
        const srcSkillDir = path.join(srcDir, comp.name);
        const destSkillDir = path.join(destDir, comp.name);
        await fs.ensureDir(destSkillDir);
        await copyTemplate(
            path.join(srcSkillDir, "SKILL.md"),
            path.join(destSkillDir, "SKILL.md"),
            comp.name,
            options
        );
    } else {
        await fs.ensureDir(destDir);
        await copyTemplate(
            path.join(srcDir, `${comp.name}.md`),
            path.join(destDir, `${comp.name}.md`),
            comp.name,
            options
        );
    }
}

async function findExistingComponents(projectDir: string): Promise<string[]> {
    const existing: string[] = [];
    for (const comp of COMPONENTS) {
        const dest = getDestPath(comp, projectDir);
        if (await fs.pathExists(dest)) {
            existing.push(`${comp.type}/${comp.name}`);
        }
    }
    if (await fs.pathExists(path.join(projectDir, "GEMINI.md"))) {
        existing.push("GEMINI.md");
    }
    if (await fs.pathExists(path.join(projectDir, ".amag", "config.json"))) {
        existing.push(".amag/config.json");
    }
    return existing;
}

export async function initCommand(
    targetDir: string,
    options: { skipGeminiMd: boolean; force?: boolean },
    confirmFn?: () => Promise<boolean>
): Promise<void> {
    const projectDir = resolveProjectDir(targetDir);
    const templatesDir = getTemplatesDir();

    log.header(`AMAG — Installing to ${projectDir}`);

    // Check for existing files and warn
    if (!options.force) {
        const existing = await findExistingComponents(projectDir);
        if (existing.length > 0) {
            log.warn(`\n${existing.length} file(s) already exist and will be SKIPPED:`);
            for (const name of existing) {
                log.info(`  • ${name}`);
            }
            console.log();
            log.info("Use `amag update` to overwrite existing files with latest templates.");
            console.log();

            if (confirmFn) {
                const proceed = await confirmFn();
                if (!proceed) {
                    console.log("Cancelled.");
                    return;
                }
            }
        }
    }

    // Install all components
    for (const comp of COMPONENTS) {
        await installComponent(comp, templatesDir, projectDir, { force: options.force });
    }

    // Generate GEMINI.md at project root
    if (!options.skipGeminiMd) {
        await copyTemplate(
            path.join(templatesDir, "GEMINI.md"),
            path.join(projectDir, "GEMINI.md"),
            "GEMINI.md",
            { force: options.force }
        );
    }

    // Generate default .amag/config.json
    const configPath = path.join(projectDir, ".amag", "config.json");
    if (options.force || !(await fs.pathExists(configPath))) {
        const { writeConfig, getDefaultConfig } = await import("./config.js");
        await writeConfig(targetDir, getDefaultConfig());
        log.success(".amag/config.json");
    } else {
        log.warn(".amag/config.json (exists, skipped)");
    }

    log.success("\nDone! AMAG is installed.");
    log.info("Run `amag doctor` to verify installation.");
}

export async function updateCommand(
    targetDir: string,
    options: { skipGeminiMd: boolean }
): Promise<void> {
    const projectDir = resolveProjectDir(targetDir);
    const templatesDir = getTemplatesDir();

    log.header(`AMAG — Updating ${projectDir}`);

    let updated = 0;
    let created = 0;

    for (const comp of COMPONENTS) {
        const dest = getDestPath(comp, projectDir);
        const existed = await fs.pathExists(dest);
        await installComponent(comp, templatesDir, projectDir, { force: true });
        if (existed) updated++;
        else created++;
    }

    if (!options.skipGeminiMd) {
        const geminiPath = path.join(projectDir, "GEMINI.md");
        const existed = await fs.pathExists(geminiPath);
        await copyTemplate(
            path.join(templatesDir, "GEMINI.md"),
            geminiPath,
            "GEMINI.md",
            { force: true }
        );
        if (existed) updated++;
        else created++;
    }

    // Update .amag/config.json — merge with defaults to pick up new fields
    const configFilePath = path.join(projectDir, ".amag", "config.json");
    const { readConfig, writeConfig } = await import("./config.js");
    if (await fs.pathExists(configFilePath)) {
        // Re-read merges user overrides with latest defaults (picks up new fields)
        const merged = await readConfig(targetDir);
        await writeConfig(targetDir, merged);
        log.success(".amag/config.json (merged with latest defaults)");
        updated++;
    } else {
        const { getDefaultConfig } = await import("./config.js");
        await writeConfig(targetDir, getDefaultConfig());
        log.success(".amag/config.json (created)");
        created++;
    }

    console.log();
    log.success(`Done! ${updated} updated, ${created} newly created.`);
}

export async function addComponent(
    type: string,
    name: string,
    targetDir: string
): Promise<void> {
    const validTypes = ["rule", "workflow", "skill"];
    if (!validTypes.includes(type)) {
        log.error(`Invalid type "${type}". Must be one of: ${validTypes.join(", ")}`);
        process.exit(1);
    }

    const comp = COMPONENTS.find((c) => c.type === type && c.name === name);
    if (!comp) {
        log.error(`Unknown ${type} "${name}". Run \`amag list\` to see available components.`);
        process.exit(1);
    }

    const projectDir = resolveProjectDir(targetDir);
    const templatesDir = getTemplatesDir();

    await installComponent(comp, templatesDir, projectDir);
    log.success(`\nAdded ${type} "${name}" to ${projectDir}`);
}

export async function uninstallCommand(
    targetDir: string,
    options: { keepGeminiMd: boolean }
): Promise<void> {
    const projectDir = resolveProjectDir(targetDir);

    log.header(`AMAG — Uninstalling from ${projectDir}`);

    let removed = 0;
    let absent = 0;

    // Remove all registered components
    for (const comp of COMPONENTS) {
        const destDir = path.join(projectDir, DEST_MAP[comp.type]);
        let filePath: string;

        if (comp.type === "skill") {
            filePath = path.join(destDir, comp.name); // entire skill directory
        } else {
            filePath = path.join(destDir, `${comp.name}.md`);
        }

        const wasRemoved = await removeIfExists(filePath, `${comp.type}/${comp.name}`);
        if (wasRemoved) removed++;
        else absent++;
    }

    // Clean up empty directories
    const seenDirs = new Set<string>();
    for (const comp of COMPONENTS) {
        const destDir = path.join(projectDir, DEST_MAP[comp.type]);
        if (!seenDirs.has(destDir)) {
            seenDirs.add(destDir);
            await cleanEmptyDirs(destDir, projectDir);
        }
    }

    // Remove GEMINI.md
    if (!options.keepGeminiMd) {
        const wasRemoved = await removeIfExists(
            path.join(projectDir, "GEMINI.md"),
            "GEMINI.md"
        );
        if (wasRemoved) removed++;
        else absent++;
    }

    // Remove .amag/config.json
    const configRemoved = await removeIfExists(
        path.join(projectDir, ".amag", "config.json"),
        ".amag/config.json"
    );
    if (configRemoved) removed++;
    else absent++;

    // Clean .amag directory if empty
    await cleanEmptyDirs(path.join(projectDir, ".amag"), projectDir);

    console.log();
    log.success(`Done! ${removed} removed, ${absent} already absent.`);
}

export async function removeComponent(
    type: string,
    name: string,
    targetDir: string
): Promise<void> {
    const validTypes = ["rule", "workflow", "skill"];
    if (!validTypes.includes(type)) {
        log.error(`Invalid type "${type}". Must be one of: ${validTypes.join(", ")}`);
        process.exit(1);
    }

    const comp = COMPONENTS.find((c) => c.type === type && c.name === name);
    if (!comp) {
        log.error(`Unknown ${type} "${name}". Run \`amag list\` to see available components.`);
        process.exit(1);
    }

    const projectDir = resolveProjectDir(targetDir);
    const componentType = type as ComponentType;
    const destDir = path.join(projectDir, DEST_MAP[componentType]);

    let filePath: string;
    if (componentType === "skill") {
        filePath = path.join(destDir, name);
    } else {
        filePath = path.join(destDir, `${name}.md`);
    }

    await removeIfExists(filePath, `${type}/${name}`);
    await cleanEmptyDirs(destDir, projectDir);
}

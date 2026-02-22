import path from "node:path";
import fs from "fs-extra";
import { resolveProjectDir, log } from "./utils.js";

// --- Types ---

export type ReviewCLI = "codex" | "claude" | "gemini-cli";

export type ThinkingLevel = "max" | "high" | "medium" | "low" | "none";

export interface ReviewRoleConfig {
    cli: ReviewCLI | null;
    model: string | null;
    thinking: ThinkingLevel;
}

export interface ReviewConfig {
    consultant: ReviewRoleConfig;
    critic: ReviewRoleConfig;
    timeout_ms: number;
}

export interface AmagConfig {
    review: ReviewConfig;
}

// --- Defaults ---

const DEFAULT_CONFIG: AmagConfig = {
    review: {
        consultant: { cli: "claude", model: "claude-opus-4-6", thinking: "max" },
        critic: { cli: "codex", model: "gpt-5.2", thinking: "medium" },
        timeout_ms: 120000,
    },
};

// --- Functions ---

function configPath(projectDir: string): string {
    return path.join(projectDir, ".amag", "config.json");
}

export function getDefaultConfig(): AmagConfig {
    return structuredClone(DEFAULT_CONFIG);
}

export async function readConfig(targetDir: string): Promise<AmagConfig> {
    const projectDir = resolveProjectDir(targetDir);
    const filePath = configPath(projectDir);

    if (await fs.pathExists(filePath)) {
        try {
            const raw = await fs.readJson(filePath);
            // Merge with defaults to handle missing keys from older configs
            return {
                review: {
                    consultant: { ...DEFAULT_CONFIG.review.consultant, ...raw?.review?.consultant },
                    critic: { ...DEFAULT_CONFIG.review.critic, ...raw?.review?.critic },
                    timeout_ms: raw?.review?.timeout_ms ?? DEFAULT_CONFIG.review.timeout_ms,
                },
            };
        } catch {
            log.warn("Invalid .amag/config.json — using defaults");
            return getDefaultConfig();
        }
    }

    return getDefaultConfig();
}

export async function writeConfig(targetDir: string, config: AmagConfig): Promise<void> {
    const projectDir = resolveProjectDir(targetDir);
    const filePath = configPath(projectDir);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJson(filePath, config, { spaces: 2 });
}

/**
 * Set a dot-path value in the config.
 * e.g. "review.consultant.cli" → "codex"
 */
export async function setConfigValue(
    targetDir: string,
    dotPath: string,
    value: string
): Promise<void> {
    const config = await readConfig(targetDir);

    const parts = dotPath.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = config;
    for (let i = 0; i < parts.length - 1; i++) {
        if (obj[parts[i]] === undefined) {
            throw new Error(`Invalid config path: ${dotPath}`);
        }
        obj = obj[parts[i]];
    }

    const lastKey = parts[parts.length - 1];
    if (obj[lastKey] === undefined) {
        throw new Error(`Invalid config path: ${dotPath}`);
    }

    // Coerce numeric values
    const numericValue = Number(value);
    obj[lastKey] = Number.isNaN(numericValue) ? (value === "null" ? null : value) : numericValue;

    await writeConfig(targetDir, config);
}

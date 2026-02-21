#!/usr/bin/env tsx
/**
 * validate-registry.ts
 * Runs as `prebuild` to ensure every template on disk has a matching COMPONENTS entry
 * and every COMPONENTS entry has a matching template on disk.
 *
 * Exits 1 with a clear error if anything is out of sync.
 */

import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve project root relative to this script
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const templatesDir = path.join(projectRoot, "templates");

// Dynamically import registry to avoid duplicating the source of truth
const { COMPONENTS } = await import("../src/registry.js");

// Build a set of registry keys: "type/name"
const registryKeys = new Set(COMPONENTS.map((c) => `${c.type}/${c.name}`));

// Collect keys from disk
const diskKeys = new Set<string>();

const rulesDir = path.join(templatesDir, "rules");
for (const file of await fs.readdir(rulesDir)) {
    if (file.endsWith(".md")) {
        diskKeys.add(`rule/${file.replace(/\.md$/, "")}`);
    }
}

const workflowsDir = path.join(templatesDir, "workflows");
for (const file of await fs.readdir(workflowsDir)) {
    if (file.endsWith(".md")) {
        diskKeys.add(`workflow/${file.replace(/\.md$/, "")}`);
    }
}

const skillsDir = path.join(templatesDir, "skills");
for (const dir of await fs.readdir(skillsDir)) {
    const skillMd = path.join(skillsDir, dir, "SKILL.md");
    if (await fs.pathExists(skillMd)) {
        diskKeys.add(`skill/${dir}`);
    }
}

// Check both directions
let ok = true;

for (const key of diskKeys) {
    if (!registryKeys.has(key)) {
        console.error(`✗  ${key}  — exists in templates/ but is NOT registered in COMPONENTS`);
        ok = false;
    }
}

for (const key of registryKeys) {
    if (!diskKeys.has(key)) {
        console.error(`✗  ${key}  — registered in COMPONENTS but template file NOT found on disk`);
        ok = false;
    }
}

if (!ok) {
    console.error("\nFix registry.ts to match the templates/ directory, then rebuild.");
    process.exit(1);
}

console.log(`✓  Registry validated — ${diskKeys.size} components in sync`);

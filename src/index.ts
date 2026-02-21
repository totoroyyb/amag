#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./installer.js";
import { listComponents } from "./registry.js";
import { doctorCheck } from "./utils.js";
import readline from "node:readline/promises";

const program = new Command();

program
    .name("superag")
    .description(
        "OmO-style agent orchestration for Antigravity — install rules, workflows, and skills"
    )
    .version("0.1.0");

program
    .command("init")
    .description("Install all SuperAG components (skips existing files with warning)")
    .option("-t, --target <dir>", "Target project directory", ".")
    .option("--no-gemini-md", "Skip generating GEMINI.md at project root")
    .action(async (options) => {
        await initCommand(options.target, { skipGeminiMd: !options.geminiMd });
    });

program
    .command("update")
    .description("Overwrite all SuperAG components with latest templates")
    .option("-t, --target <dir>", "Target project directory", ".")
    .option("--no-gemini-md", "Skip updating GEMINI.md at project root")
    .action(async (options) => {
        const { updateCommand } = await import("./installer.js");
        await updateCommand(options.target, { skipGeminiMd: !options.geminiMd });
    });

program
    .command("add <type> <name>")
    .description("Add a single component (rule, workflow, or skill)")
    .option("-t, --target <dir>", "Target project directory", ".")
    .action(async (type, name, options) => {
        const { addComponent } = await import("./installer.js");
        await addComponent(type, name, options.target);
    });

program
    .command("uninstall")
    .description("Remove all SuperAG-managed files from the target project")
    .option("-t, --target <dir>", "Target project directory", ".")
    .option("--keep-gemini-md", "Keep GEMINI.md at project root")
    .option("-f, --force", "Skip confirmation prompt")
    .action(async (options) => {
        if (!options.force) {
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            const answer = await rl.question("This will remove all SuperAG components. Continue? (y/N) ");
            rl.close();
            if (answer.toLowerCase() !== "y") {
                console.log("Cancelled.");
                return;
            }
        }
        const { uninstallCommand } = await import("./installer.js");
        await uninstallCommand(options.target, { keepGeminiMd: !!options.keepGeminiMd });
    });

program
    .command("remove <type> <name>")
    .description("Remove a single component (rule, workflow, or skill)")
    .option("-t, --target <dir>", "Target project directory", ".")
    .action(async (type, name, options) => {
        const { removeComponent } = await import("./installer.js");
        await removeComponent(type, name, options.target);
    });

program
    .command("list")
    .description("List all available components")
    .action(() => {
        listComponents();
    });

program
    .command("doctor")
    .description("Check what SuperAG components are installed in the target project")
    .option("-t, --target <dir>", "Target project directory", ".")
    .action(async (options) => {
        await doctorCheck(options.target);
    });

program.parse();


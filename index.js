#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync, spawnSync } from "node:child_process";

import { parse } from "yaml";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import enquirer from "enquirer";
import { temporaryFile as tempy } from "tempy";

// Check if fileicon exists
try {
    execSync("fileicon --version");
} catch (error) {
    console.error(
        "Error: fileicon is not installed. Please install fileicon from https://github.com/mklement0/fileicon"
    );
    process.exit(1);
}

// Parse icons.yaml
function readYamlConfig(parentFolder) {
    const yamlFilePath = join(parentFolder, "icons.yaml");
    const ymlFilePath = join(parentFolder, "icons.yml");

    if (existsSync(yamlFilePath)) {
        return parse(readFileSync(yamlFilePath, "utf8"));
    } else if (existsSync(ymlFilePath)) {
        return parse(readFileSync(ymlFilePath, "utf8"));
    } else {
        console.error(
            "[error] No icons.yaml or icons.yml file found in the specified folder."
        );
    }
}

// Check if the folder has a custom icon
function hasCustomIcon(folderPath) {
    try {
        execSync(`fileicon get "${folderPath}"`, { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

// Set folder icons based on the YAML configuration
async function setFolderIcons(yamlConfig, parentFolder, noConfirm) {
    const foldersToChange = [];

    for (const [folder, iconName] of Object.entries(yamlConfig)) {
        const folderPath = join(parentFolder, folder);
        const iconPath = join(parentFolder, ".icons", iconName);

        if (existsSync(folderPath) && existsSync(iconPath)) {
            foldersToChange.push({
                folderPath,
                iconPath,
                overwrite: hasCustomIcon(folderPath),
            });
        } else {
            console.error(
                `[warning] Folder or icon not found for ${folder} -> ${iconName}`
            );
        }
    }

    if (!noConfirm) {
        console.log("Folders to be changed:");
        for (const { folderPath, iconPath, overwrite } of foldersToChange.slice(
            0,
            10
        )) {
            console.log(
                `${folderPath} -> ${iconPath}${overwrite ? " [overwrite]" : ""}`
            );
        }

        if (foldersToChange.length > 10) {
            const tempFile = tempy({ extension: "txt" });
            writeFileSync(
                tempFile,
                foldersToChange
                    .map(
                        ({ folderPath, iconPath, overwrite }) =>
                            `${folderPath} -> ${iconPath}${
                                overwrite ? " [overwrite]" : ""
                            }`
                    )
                    .join("\n")
            );
            console.log(`...and more. Full list saved to: ${tempFile}`);
        }

        const confirm = await enquirer.prompt({
            name: "response",
            type: "confirm",
            message: "Proceed with changes?",
        });

        if (!confirm) {
            console.log("Cancelled.");
            return;
        }
    }

    for (const { folderPath, iconPath } of foldersToChange) {
        try {
            spawnSync("fileicon", ["set", folderPath, iconPath]);
            console.log(`[+] Icon set for ${folderPath}`);
        } catch (error) {
            console.error(
                `[error] Error setting icon for ${folderPath}: ${error.message}`
            );
        }
    }
}

// Main function
function main() {
    const argv = yargs(hideBin(process.argv))
        .usage("Usage: $0 <parent_folder> [--no-confirm]")
        .demandCommand(1)
        .option("no-confirm", {
            alias: "n",
            type: "boolean",
            default: false,
            description: "Skip confirmation prompt",
        }).argv;

    const parentFolder = argv._[0];

    if (!existsSync(parentFolder)) {
        console.error("[error] Parent folder not found");
        process.exit(1);
    }

    const yamlConfig = readYamlConfig(parentFolder);
    setFolderIcons(yamlConfig, parentFolder, argv.noConfirm);
}

main();

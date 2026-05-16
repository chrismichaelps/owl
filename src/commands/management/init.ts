/**
 * @Owl.Commands.Management.Init - Scaffold a CLAUDE.md in the project root: /init
 *
 * Creates a project-specific CLAUDE.md with a starter template when none exists.
 * If a CLAUDE.md already exists, reports its location and size without overwriting.
 *
 * The generated template includes:
 * - Project overview section
 * - Architecture and key decisions sections
 * - Coding conventions
 * - Common commands
 *
 * @example
 * /init
 * // ✓ Created CLAUDE.md (812 bytes)
 * //   Edit it to add project-specific instructions for Owl.
 */
import { writeFile, stat, readFile } from "node:fs/promises"
import { join } from "node:path"
import { Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const CLAUDE_MD_TEMPLATE = `# CLAUDE.md — Project Instructions

> This file is read by Owl at session start and injected into the system prompt.
> Keep it concise and focused on what an AI assistant needs to know.

## Project Overview

<!-- Describe what this project does in 1-2 sentences -->

## Architecture

<!-- Key modules, patterns, and dependencies -->

## Coding Conventions

- <!-- Language/framework version -->
- <!-- Style guide or linter config -->
- <!-- Test runner and how to run tests -->
- <!-- Any strict rules (e.g. no any, no default exports) -->

## Common Commands

\`\`\`bash
# Install
# Test
# Build
# Lint
\`\`\`

## Key Files

<!-- List the most important files/directories an AI should know about -->

## What to Avoid

<!-- Common mistakes, footguns, off-limits areas -->
`

/**
 * @Owl.Commands.Management.Init.Factory - Create the /init command handler
 */
export function makeInitCommand(projectRoot: string): CommandHandler {
  return {
    name: "init",
    description: "Scaffold a CLAUDE.md in the project root: /init",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.promise(async (): Promise<CommandResult> => {
        const targetPath = join(projectRoot, "CLAUDE.md")

        // Check if CLAUDE.md already exists
        try {
          const existing = await stat(targetPath)
          const content = await readFile(targetPath, "utf-8")
          const lines = content.split("\n").length
          return {
            output:
              `CLAUDE.md already exists at ${targetPath}\n` +
              `  Size: ${String(existing.size)} bytes · ${String(lines)} lines\n` +
              `  Edit it directly to update project instructions.`,
          }
        } catch {
          // File doesn't exist — create it
        }

        await writeFile(targetPath, CLAUDE_MD_TEMPLATE, { encoding: "utf-8" })
        const created = await stat(targetPath)

        return {
          output:
            `✓ Created CLAUDE.md (${String(created.size)} bytes)\n` +
            `  Path: ${targetPath}\n` +
            `  Edit it to add project-specific instructions for Owl.\n` +
            `  It will be injected into the system prompt at the next session start.`,
        }
      }),
  }
}

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
import { Chunk, Effect } from "effect"
import type { FileSystem } from "@effect/platform"
import { PROJECT_CONTEXT_CONSTANTS } from "../../core/constants/index.js"
import { resolveProjectPath } from "../../core/path/index.js"
import { CommandParseError } from "../../core/errors/index.js"
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
export function makeInitCommand(
  fs: FileSystem.FileSystem,
  projectRoot: string,
): CommandHandler {
  return {
    name: "init",
    description: "Scaffold a CLAUDE.md in the project root: /init",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const fileName = PROJECT_CONTEXT_CONSTANTS.INSTRUCTIONS_FILE
        const targetPath = yield* resolveProjectPath(
          projectRoot,
          fileName,
          "init",
        ).pipe(
          Effect.mapError(
            (err) =>
              new CommandParseError({
                input: "/init",
                reason: String(err),
              }),
          ),
        )

        const exists = yield* fs.exists(targetPath).pipe(
          Effect.mapError(
            () =>
              new CommandParseError({
                input: "/init",
                reason: "Unable to inspect project instructions file",
              }),
          ),
        )

        if (exists) {
          const existing = yield* fs.stat(targetPath).pipe(
            Effect.mapError(
              () =>
                new CommandParseError({
                  input: "/init",
                  reason: "Unable to stat project instructions file",
                }),
            ),
          )
          const content = yield* fs.readFileString(targetPath).pipe(
            Effect.mapError(
              () =>
                new CommandParseError({
                  input: "/init",
                  reason: "Unable to read project instructions file",
                }),
            ),
          )
          const lines = Chunk.size(Chunk.fromIterable(content.split("\n")))
          return {
            output:
              `${fileName} already exists\n` +
              `  Size: ${String(existing.size)} bytes · ${String(lines)} lines\n` +
              `  Edit it directly to update project instructions.`,
          }
        }

        yield* fs.writeFileString(targetPath, CLAUDE_MD_TEMPLATE).pipe(
          Effect.mapError(
            () =>
              new CommandParseError({
                input: "/init",
                reason: "Unable to write project instructions file",
              }),
          ),
        )
        const created = yield* fs.stat(targetPath).pipe(
          Effect.mapError(
            () =>
              new CommandParseError({
                input: "/init",
                reason: "Unable to stat created project instructions file",
              }),
          ),
        )

        return {
          output:
            `✓ Created ${fileName} (${String(created.size)} bytes)\n` +
            `  Path: ${fileName}\n` +
            `  Edit it to add project-specific instructions for Owl.\n` +
            `  It will be injected into the system prompt at the next session start.`,
        }
      }),
  }
}

/**
 * @Owl.Commands.Editing.Create - Create a new file: /create <file> "<content>"
 *
 * Creates a new file with the specified content.
 *
 * Arguments: <file_path> <content>
 * Content should be quoted if it contains spaces.
 *
 * @example
 * /create src/new-file.ts "// New file"
 */
import { Effect } from "effect"
import type { FileSystem } from "@effect/platform"
import { CommandParseError } from "../../core/errors/index.js"
import path from "node:path"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Editing.Create.Factory - Create the /create command handler
 */
export function makeCreateCommand(
  fs: FileSystem.FileSystem,
  projectRoot: string,
): CommandHandler {
  return {
    name: "create",
    description: 'Create a new file with content: /create <file> "<content>"',
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const [file, ...rest] = args
      if (file === undefined) {
        return Effect.fail(
          new CommandParseError({
            input: "/create",
            reason: "File path is required",
          }),
        )
      }
      const content = rest.join(" ")
      const fullPath = path.join(projectRoot, file)
      return fs.writeFileString(fullPath, content).pipe(
        Effect.map(() => ({ output: "Created " + file })),
        Effect.catchAll((err) =>
          Effect.fail(
            new CommandParseError({
              input: "/create " + file,
              reason: String(err),
            }),
          ),
        ),
      )
    },
  }
}

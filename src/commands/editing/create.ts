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
import path from "node:path"
import { CommandParseError } from "../../core/errors/index.js"
import { resolveProjectPath } from "../../core/path/index.js"
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
      return resolveProjectPath(projectRoot, file, "create").pipe(
        Effect.mapError(
          (err) =>
            new CommandParseError({
              input: "/create " + file,
              reason: String(err),
            }),
        ),
        Effect.flatMap((fullPath) =>
          Effect.gen(function* () {
            const alreadyExists = yield* fs.exists(fullPath).pipe(
              Effect.mapError(
                () =>
                  new CommandParseError({
                    input: "/create " + file,
                    reason: "Unable to inspect target file",
                  }),
              ),
            )

            if (alreadyExists) {
              return yield* Effect.fail(
                new CommandParseError({
                  input: "/create " + file,
                  reason: "File already exists; use /edit for existing files",
                }),
              )
            }

            yield* fs
              .makeDirectory(path.dirname(fullPath), { recursive: true })
              .pipe(
                Effect.mapError(
                  () =>
                    new CommandParseError({
                      input: "/create " + file,
                      reason: "Unable to create parent directory",
                    }),
                ),
              )

            yield* fs.writeFileString(fullPath, content).pipe(
              Effect.mapError(
                () =>
                  new CommandParseError({
                    input: "/create " + file,
                    reason: "Unable to write file",
                  }),
              ),
            )

            return { output: "Created " + file } satisfies CommandResult
          }),
        ),
      )
    },
  }
}

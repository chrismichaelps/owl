/**
 * @Owl.Core.Path - Project-root path containment utilities
 *
 * Centralizes path resolution for mutation-capable code so file operations
 * cannot escape the active project root.
 */
import path from "node:path"
import { Effect } from "effect"
import { MutationError } from "../errors/index.js"

/** @Owl.Core.Path.Resolve - Resolves root-relative mutation paths */
export const resolveProjectPath = (
  projectRoot: string,
  filePath: string,
  stage: string,
): Effect.Effect<string, MutationError> =>
  Effect.gen(function* () {
    const trimmed = filePath.trim()
    if (trimmed.length === 0) {
      return yield* Effect.fail(
        new MutationError({
          stage,
          file: filePath,
          reason: "File path must not be empty",
        }),
      )
    }

    if (path.isAbsolute(trimmed)) {
      return yield* Effect.fail(
        new MutationError({
          stage,
          file: filePath,
          reason: "File path must be relative to the project root",
        }),
      )
    }

    const root = path.resolve(projectRoot)
    const resolved = path.resolve(root, trimmed)
    const insideRoot = resolved === root || resolved.startsWith(root + path.sep)

    if (!insideRoot) {
      return yield* Effect.fail(
        new MutationError({
          stage,
          file: filePath,
          reason: "File path escapes the project root",
        }),
      )
    }

    return resolved
  })

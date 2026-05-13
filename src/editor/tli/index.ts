/** @Owl.Editor.TLI - Targeted Line Injection: surgical string replacement with governance pre-check */
import { Context, Effect, Layer } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { TLIError, MutationError } from "../../core/errors/index.js"
import { EDITOR_CONSTANTS } from "../../core/constants/index.js"
import { findExactMatch, applyReplacement } from "../utils/strings.js"
import path from "node:path"

/** @Owl.Editor.TLI.Target - Specification for a single surgical replacement */
export interface TLITarget {
  readonly file: string
  readonly oldString: string
  readonly newString: string
  readonly replaceAll?: boolean
}

/** @Owl.Editor.TLI.Result - Pre-mutation snapshot + computed new content (write not yet applied) */
export interface TLIResult {
  readonly file: string
  readonly oldContent: string
  readonly newContent: string
}

/** @Owl.Editor.TLI.Service - Two-phase API: prepare (validate + compute) then write (persist) */
export interface TLIExecutorService {
  readonly prepare: (
    target: TLITarget,
    projectRoot: string,
  ) => Effect.Effect<TLIResult, TLIError | MutationError>
  readonly write: (
    file: string,
    newContent: string,
    projectRoot: string,
  ) => Effect.Effect<void, MutationError>
}

export class TLIExecutor extends Context.Tag("TLIExecutor")<
  TLIExecutor,
  TLIExecutorService
>() {}

/** @Owl.Editor.TLI.Live - FileSystem-backed two-phase executor */
export const TLIExecutorLive = Layer.effect(
  TLIExecutor,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const prepare = (
      target: TLITarget,
      projectRoot: string,
    ): Effect.Effect<TLIResult, TLIError | MutationError> =>
      Effect.gen(function* () {
        const fullPath = path.join(projectRoot, target.file)

        const stat = yield* fs.stat(fullPath).pipe(
          Effect.mapError(
            () =>
              new MutationError({
                stage: "planning",
                file: target.file,
                reason: `File not found: ${target.file}`,
              }),
          ),
        )

        if (stat.size > EDITOR_CONSTANTS.MAX_FILE_SIZE_BYTES) {
          return yield* Effect.fail(
            new MutationError({
              stage: "planning",
              file: target.file,
              reason: `File exceeds maximum size (${String(EDITOR_CONSTANTS.MAX_FILE_SIZE_BYTES)} bytes)`,
            }),
          )
        }

        const oldContent = yield* fs.readFileString(fullPath).pipe(
          Effect.mapError(
            () =>
              new MutationError({
                stage: "planning",
                file: target.file,
                reason: `Cannot read file: ${target.file}`,
              }),
          ),
        )

        const matchResult = findExactMatch(
          oldContent,
          target.oldString,
          target.replaceAll ?? false,
        )

        if (!matchResult.found) {
          return yield* Effect.fail(
            new TLIError({
              file: target.file,
              line: 0,
              reason: matchResult.reason,
            }),
          )
        }

        const newContent = applyReplacement(
          oldContent,
          target.oldString,
          target.newString,
          target.replaceAll ?? false,
        )

        return { file: target.file, oldContent, newContent } satisfies TLIResult
      })

    const write = (
      file: string,
      newContent: string,
      projectRoot: string,
    ): Effect.Effect<void, MutationError> => {
      const fullPath = path.join(projectRoot, file)
      return fs.writeFileString(fullPath, newContent).pipe(
        Effect.mapError(
          () =>
            new MutationError({
              stage: "tli",
              file,
              reason: `Cannot write file: ${file}`,
            }),
        ),
      )
    }

    return { prepare, write } satisfies TLIExecutorService
  }),
).pipe(Layer.provide(NodeFileSystem.layer))

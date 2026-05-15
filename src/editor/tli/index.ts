/**
 * @Owl.Editor.TLI - Targeted Line Injection: surgical string replacement with governance pre-check
 *
 * TLI is Phase 3 of the Deepening Flow — the Shadow role's primary tool.
 *
 * Two-phase API:
 * 1. **prepare()**: Validate file exists, find old string, compute new content
 *    - Returns TLIResult without writing (safe for preview/approval)
 *    - Fails fast on: file not found, string not found, string appears multiple times
 * 2. **write()**: Persist the computed new content
 *    - Called after approval in the pipeline
 *    - No re-validation (prepare already did it)
 *
 * TLI Design Principles:
 * - Surgical: replace exactly what you specify, nothing more
 * - Fail-fast: detect problems during prepare, not during write
 * - Quote-aware: LLM curly quotes ('', "") normalized to straight quotes
 *
 * Error handling:
 * - MutationError: file I/O problems (not found, permission, size limits)
 * - TLIError: string matching problems (not found, ambiguous)
 *
 * @example
 * // Safe preview (no file written)
 * const result = yield* Effect.flatMap(TLIExecutor, (t) =>
 *   t.prepare({ file: "src/foo.ts", oldString: "const x", newString: "const x: number" }, projectRoot)
 * )
 * // result.newContent ready for diff display and user approval
 *
 * // After approval
 * yield* Effect.flatMap(TLIExecutor, (t) =>
 *   t.write("src/foo.ts", result.newContent, projectRoot)
 * )
 */
import { Context, Effect, Layer } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { TLIError, MutationError } from "../../core/errors/index.js"
import { EDITOR_CONSTANTS } from "../../core/constants/index.js"
import { resolveProjectPath } from "../../core/path/index.js"
import { findExactMatch, applyReplacement } from "../utils/strings.js"

/**
 * @Owl.Editor.TLI.Target - Specification for a single surgical replacement
 *
 * @example
 * const target: TLITarget = {
 *   file: "src/utils.ts",
 *   oldString: "export function foo() {",
 *   newString: "export function foo(): void {",
 *   replaceAll: false, // Only replace first occurrence
 * }
 */
export interface TLITarget {
  readonly file: string
  readonly oldString: string
  readonly newString: string
  readonly replaceAll?: boolean
}

/**
 * @Owl.Editor.TLI.Result - Pre-mutation snapshot + computed new content (write not yet applied)
 *
 * The TLIResult is the output of prepare() — a snapshot of the file state
 * before mutation, plus the computed new content. This enables:
 * - Diff generation for approval UI
 * - Shard Split detection
 * - Rollback registration
 */
export interface TLIResult {
  readonly file: string
  readonly oldContent: string
  readonly newContent: string
}

/**
 * @Owl.Editor.TLI.Service - Two-phase API: prepare (validate + compute) then write (persist)
 */
export interface TLIExecutorService {
  /**
   * Phase 1: Validate and compute new content
   *
   * Reads the file, validates oldString exists (exactly once unless replaceAll),
   * and computes newContent. NO write occurs.
   *
   * @param target - TLITarget with file, oldString, newString
   * @param projectRoot - Project root for resolving relative paths
   * @returns TLIResult with oldContent and computed newContent
   * @throws MutationError - File not found or exceeds MAX_FILE_SIZE_BYTES
   * @throws TLIError - oldString not found or ambiguous (appears >1 time without replaceAll)
   */
  readonly prepare: (
    target: TLITarget,
    projectRoot: string,
  ) => Effect.Effect<TLIResult, TLIError | MutationError>
  /**
   * Phase 2: Write new content to disk
   *
   * Assumes prepare() was called first. Reuses the newContent computed then.
   *
   * @param file - Relative file path (same as in target)
   * @param newContent - Content to write (from TLIResult.newContent)
   * @param projectRoot - Project root for resolving relative paths
   */
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

/**
 * @Owl.Editor.TLI.Live - FileSystem-backed two-phase executor
 *
 * Uses NodeFileSystem for file I/O. Validates file size before reading.
 */
export const TLIExecutorLive = Layer.effect(
  TLIExecutor,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const prepare = (
      target: TLITarget,
      projectRoot: string,
    ): Effect.Effect<TLIResult, TLIError | MutationError> =>
      Effect.gen(function* () {
        const fullPath = yield* resolveProjectPath(
          projectRoot,
          target.file,
          "planning",
        )

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
      return resolveProjectPath(projectRoot, file, "tli").pipe(
        Effect.flatMap((fullPath) =>
          fs.writeFileString(fullPath, newContent).pipe(
            Effect.mapError(
              () =>
                new MutationError({
                  stage: "tli",
                  file,
                  reason: `Cannot write file: ${file}`,
                }),
            ),
          ),
        ),
      )
    }

    return { prepare, write } satisfies TLIExecutorService
  }),
).pipe(Layer.provide(NodeFileSystem.layer))

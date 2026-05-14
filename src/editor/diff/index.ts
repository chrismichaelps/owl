/**
 * @Owl.Editor.Diff - Structured diff generation for Mutation display and Shard Split detection
 *
 * Generates machine-readable diffs between old and new file content. Diffs are used:
 * 1. Display: Show users what changed before approval (Stage 3 of pipeline)
 * 2. Shard Split Detection: changePercent >= SHARD_SPLIT_THRESHOLD triggers protocol
 * 3. Verification: Post-write diff confirms changes were applied correctly
 *
 * The diff engine:
 * - Normalizes whitespace before comparing (leading tabs → 2 spaces)
 * - Escapes special characters (&, $) that confuse the diff library
 * - Counts lines added/removed for impact metrics
 *
 * @example
 * const diff = yield* Effect.flatMap(DiffGenerator, (d) =>
 *   d.generate("src/foo.ts", oldContent, newContent)
 * )
 * // diff.isShardSplit: true if changePercent >= 0.15
 */
import { Context, Effect, Layer } from "effect"
import { DiffGenerationError } from "../../core/errors/index.js"
import { SHARD_SPLIT_THRESHOLD } from "../../core/constants/index.js"
import {
  getPatchFromContents,
  countChangedLines,
  formatUnifiedDiff,
  type StructuredPatchHunk,
} from "../utils/patch.js"

/**
 * @Owl.Editor.Diff.FileDiff - Immutable diff result carrying hunk data and impact metrics
 *
 * Structured output suitable for both display (format()) and analysis (isShardSplit).
 *
 * @example
 * const diff: FileDiff = {
 *   file: "src/utils.ts",
 *   hunks: [...],
 *   linesAdded: 15,
 *   linesRemoved: 3,
 *   totalOldLines: 100,
 *   changePercent: 0.18, // 18% changed
 *   isShardSplit: true   // > 15% → Shard Split Protocol
 * }
 */
export interface FileDiff {
  readonly file: string
  readonly hunks: readonly StructuredPatchHunk[]
  readonly linesAdded: number
  readonly linesRemoved: number
  readonly totalOldLines: number
  readonly changePercent: number
  readonly isShardSplit: boolean
}

/**
 * @Owl.Editor.Diff.Service - Pure diff computation: no I/O, no side effects
 */
export interface DiffGeneratorService {
  /**
   * Generate structured diff from old and new content
   *
   * @param file - File path for patch headers
   * @param oldContent - Original file content
   * @param newContent - Modified file content
   * @returns FileDiff with hunk data and impact metrics
   */
  readonly generate: (
    file: string,
    oldContent: string,
    newContent: string,
  ) => Effect.Effect<FileDiff, DiffGenerationError>
  /**
   * Format FileDiff as unified diff string
   *
   * @param diff - FileDiff from generate()
   * @returns String in ---/+++@@ format suitable for display
   */
  readonly format: (diff: FileDiff) => string
}

export class DiffGenerator extends Context.Tag("DiffGenerator")<
  DiffGenerator,
  DiffGeneratorService
>() {}

/** @Owl.Editor.Diff.Live - Layer.succeed: pure computation, no setup required */
export const DiffGeneratorLive = Layer.succeed(DiffGenerator, {
  generate: (
    file: string,
    oldContent: string,
    newContent: string,
  ): Effect.Effect<FileDiff, DiffGenerationError> =>
    Effect.try({
      try: () => {
        const hunks = getPatchFromContents(file, oldContent, newContent)
        const { added, removed } = countChangedLines(hunks)
        const totalOldLines =
          oldContent === "" ? 0 : oldContent.split("\n").length
        const changePercent =
          totalOldLines > 0 ? (added + removed) / totalOldLines : 0

        return {
          file,
          hunks,
          linesAdded: added,
          linesRemoved: removed,
          totalOldLines,
          changePercent: Math.round(changePercent * 10_000) / 10_000,
          isShardSplit: changePercent >= SHARD_SPLIT_THRESHOLD,
        } satisfies FileDiff
      },
      catch: (e) =>
        new DiffGenerationError({
          file,
          reason: `Patch generation failed: ${String(e)}`,
        }),
    }),

  format: (diff: FileDiff): string => formatUnifiedDiff(diff.file, diff.hunks),
} satisfies DiffGeneratorService)

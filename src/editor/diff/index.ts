/** @Owl.Editor.Diff - Structured diff generation for Mutation display and Shard Split detection */
import { Context, Effect, Layer } from "effect"
import { DiffGenerationError } from "../../core/errors/index.js"
import { SHARD_SPLIT_THRESHOLD } from "../../core/constants/index.js"
import {
  getPatchFromContents,
  countChangedLines,
  formatUnifiedDiff,
  type StructuredPatchHunk,
} from "../utils/patch.js"

/** @Owl.Editor.Diff.FileDiff - Immutable diff result carrying hunk data and impact metrics */
export interface FileDiff {
  readonly file: string
  readonly hunks: readonly StructuredPatchHunk[]
  readonly linesAdded: number
  readonly linesRemoved: number
  readonly totalOldLines: number
  readonly changePercent: number
  readonly isShardSplit: boolean
}

/** @Owl.Editor.Diff.Service - Pure diff computation: no I/O, no side effects */
export interface DiffGeneratorService {
  readonly generate: (
    file: string,
    oldContent: string,
    newContent: string,
  ) => Effect.Effect<FileDiff, DiffGenerationError>
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

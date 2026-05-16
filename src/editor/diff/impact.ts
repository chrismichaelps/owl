/** @Owl.Editor.Diff.Impact - Mutation impact overlay formatting */
import { Chunk, Data } from "effect"
import {
  EDITOR_CONSTANTS,
  SHARD_SPLIT_THRESHOLD,
} from "../../core/constants/index.js"
import type { FileDiff } from "./index.js"

export type MutationImpactSeverity = "low" | "medium" | "high"

export type MutationImpact = Readonly<{
  readonly file: string
  readonly severity: MutationImpactSeverity
  readonly linesAdded: number
  readonly linesRemoved: number
  readonly changePercent: number
  readonly isShardSplit: boolean
}>

const classifyImpact = (changePercent: number): MutationImpactSeverity => {
  if (changePercent >= SHARD_SPLIT_THRESHOLD) return "high"
  if (changePercent >= EDITOR_CONSTANTS.IMPACT_LOW_THRESHOLD) return "medium"
  return "low"
}

const formatPercent = (value: number): string =>
  (value * EDITOR_CONSTANTS.IMPACT_PERCENT_MULTIPLIER).toFixed(
    EDITOR_CONSTANTS.IMPACT_PERCENT_DECIMALS,
  ) + "%"

/** @Owl.Editor.Diff.Impact.Make - Build hashable Mutation impact */
export const makeMutationImpact = (diff: FileDiff): MutationImpact =>
  Data.struct({
    file: diff.file,
    severity: classifyImpact(diff.changePercent),
    linesAdded: diff.linesAdded,
    linesRemoved: diff.linesRemoved,
    changePercent: diff.changePercent,
    isShardSplit: diff.isShardSplit,
  })

const formatImpactLine = (impact: MutationImpact): string =>
  "- " +
  impact.file +
  ": " +
  impact.severity +
  " · +" +
  String(impact.linesAdded) +
  "/-" +
  String(impact.linesRemoved) +
  " · " +
  formatPercent(impact.changePercent) +
  " changed" +
  (impact.isShardSplit ? " · shard split required" : " · shard split clear")

/** @Owl.Editor.Diff.Impact.Format - Render compact impact overlay */
export const formatMutationImpactBlock = (
  diffs: readonly FileDiff[],
): string => {
  if (diffs.length === 0) return "Impact overlay\n- no file changes"

  const impacts = Chunk.map(Chunk.fromIterable(diffs), makeMutationImpact)
  const added = Chunk.reduce(impacts, 0, (total, impact) => {
    return total + impact.linesAdded
  })
  const removed = Chunk.reduce(impacts, 0, (total, impact) => {
    return total + impact.linesRemoved
  })
  const requiresShardSplit = Chunk.some(impacts, (impact) => {
    return impact.isShardSplit
  })
  const header =
    "Impact overlay — " +
    String(Chunk.size(impacts)) +
    " file(s), +" +
    String(added) +
    "/-" +
    String(removed) +
    (requiresShardSplit ? ", shard split required" : ", shard split clear")

  return Chunk.toReadonlyArray(
    Chunk.prepend(Chunk.map(impacts, formatImpactLine), header),
  ).join("\n")
}

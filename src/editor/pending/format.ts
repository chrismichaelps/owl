/** @Owl.Editor.Pending.Format - Pending Mutation display helpers */
import { Chunk } from "effect"
import { formatMutationImpactInline } from "../diff/impact.js"
import type { PendingMutation } from "./index.js"

/** @Owl.Editor.Pending.Format.Line - Render pending Mutation summary */
export const formatPendingMutationLine = (
  mutation: PendingMutation,
): string => {
  const files = Chunk.map(mutation.targets, (target) => target.file)
  const previewDiffs = Chunk.map(mutation.previews, (preview) => preview.diff)
  const impact = Chunk.isEmpty(previewDiffs)
    ? ""
    : " · " + formatMutationImpactInline(Chunk.toReadonlyArray(previewDiffs))

  return (
    mutation.mutationId +
    " — " +
    Chunk.toReadonlyArray(files).join(", ") +
    impact +
    " (" +
    mutation.createdAt +
    ")"
  )
}

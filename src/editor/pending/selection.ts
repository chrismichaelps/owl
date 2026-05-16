/** @Owl.Editor.Pending.Selection - Select pending Mutation targets */
import { Chunk, Data, HashSet } from "effect"
import type { PendingMutation } from "./index.js"
import type { PipelineMutationResult } from "../pipeline/index.js"
import type { TLITarget } from "../tli/index.js"

/** @Owl.Editor.Pending.Selection.Result - Selected and remaining Mutation targets */
export interface PendingMutationSelection {
  readonly selectedTargets: Chunk.Chunk<TLITarget>
  readonly remainingTargets: Chunk.Chunk<TLITarget>
  readonly remainingPreviews: Chunk.Chunk<PipelineMutationResult>
  readonly unknownFiles: Chunk.Chunk<string>
}

/** @Owl.Editor.Pending.Selection.Resolve - Resolve requested files against mutation targets */
export const selectPendingMutationTargets = (
  mutation: PendingMutation,
  selectedFiles: Chunk.Chunk<string>,
): PendingMutationSelection => {
  if (Chunk.isEmpty(selectedFiles)) {
    return Data.struct({
      selectedTargets: mutation.targets,
      remainingTargets: Chunk.empty<TLITarget>(),
      remainingPreviews: Chunk.empty<PipelineMutationResult>(),
      unknownFiles: Chunk.empty<string>(),
    })
  }

  const selectedFileSet = HashSet.fromIterable(selectedFiles)
  const targetFileSet = HashSet.fromIterable(
    Chunk.map(mutation.targets, (target) => target.file),
  )
  const unknownFiles = Chunk.filter(
    selectedFiles,
    (file) => !HashSet.has(targetFileSet, file),
  )
  const selectedTargets = Chunk.filter(mutation.targets, (target) =>
    HashSet.has(selectedFileSet, target.file),
  )
  const remainingTargets = Chunk.filter(
    mutation.targets,
    (target) => !HashSet.has(selectedFileSet, target.file),
  )
  const remainingFileSet = HashSet.fromIterable(
    Chunk.map(remainingTargets, (target) => target.file),
  )
  const remainingPreviews = Chunk.filter(mutation.previews, (preview) =>
    HashSet.has(remainingFileSet, preview.file),
  )

  return Data.struct({
    selectedTargets,
    remainingTargets,
    remainingPreviews,
    unknownFiles,
  })
}

/** @Owl.TUI.Components.PendingApprovals - Edit approval queue rail */
import React, { memo } from "react"
import { Box, Text } from "ink"
import { Chunk } from "effect"
import { TUI_PENDING_APPROVALS } from "../../core/constants/index.js"
import type { PendingMutationSummary } from "../state.js"

interface PendingApprovalsPanelProps {
  readonly mutations: Chunk.Chunk<PendingMutationSummary>
}

/** @Owl.TUI.Components.PendingApprovals.Files - Render compact file list */
export function formatPendingApprovalFiles(files: Chunk.Chunk<string>): string {
  const visible = Chunk.take(files, TUI_PENDING_APPROVALS.FILE_PREVIEW_LIMIT)
  const hiddenCount = Chunk.size(files) - Chunk.size(visible)
  const names = Chunk.toReadonlyArray(visible).join(", ")

  return hiddenCount > 0 ? names + " +" + String(hiddenCount) + " more" : names
}

/** @Owl.TUI.Components.PendingApprovals.Row - Single pending Mutation row */
const PendingApprovalRow = memo(function PendingApprovalRow({
  mutation,
}: {
  readonly mutation: PendingMutationSummary
}): React.ReactElement {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color="yellowBright">{mutation.mutationId}</Text>
      <Text color="gray" dimColor wrap="truncate">
        {formatPendingApprovalFiles(mutation.files)}
      </Text>
      <Text color="gray" dimColor>
        /diff {mutation.mutationId} · /apply {mutation.mutationId}
      </Text>
      <Text color="gray" dimColor>
        {TUI_PENDING_APPROVALS.SHORTCUT_HINT}
      </Text>
    </Box>
  )
})

/** @Owl.TUI.Components.PendingApprovals.Component - Pending approval summary */
export const PendingApprovalsPanel: React.FC<PendingApprovalsPanelProps> = memo(
  ({ mutations }) => {
    const visible = Chunk.take(mutations, TUI_PENDING_APPROVALS.VISIBLE_ITEMS)
    const hiddenCount = Chunk.size(mutations) - Chunk.size(visible)

    return (
      <Box flexDirection="column">
        <Text color="gray">{"─".repeat(22)}</Text>
        <Box justifyContent="space-between">
          <Text color="yellow" dimColor>
            {TUI_PENDING_APPROVALS.TITLE}
          </Text>
          {Chunk.isEmpty(mutations) ? null : (
            <Text color="yellow">{String(Chunk.size(mutations))}</Text>
          )}
        </Box>
        {Chunk.isEmpty(mutations) ? (
          <Text color="gray" dimColor>
            {TUI_PENDING_APPROVALS.EMPTY_LABEL}
          </Text>
        ) : (
          Chunk.toReadonlyArray(
            Chunk.map(visible, (mutation) => (
              <PendingApprovalRow
                key={mutation.mutationId}
                mutation={mutation}
              />
            )),
          )
        )}
        {hiddenCount > 0 ? (
          <Text color="gray" dimColor>
            +{String(hiddenCount)} more pending
          </Text>
        ) : null}
      </Box>
    )
  },
)

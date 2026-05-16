/** @Owl.TUI.Components.ConversationThread - Scrollable list of all completed turns */
import React, { memo } from "react"
import { Box, Text } from "ink"
import { formatEstimatedCostUsd } from "../../core/cost.js"
import { MarkdownText } from "./MarkdownText.js"
import type { ConversationTurn } from "../state.js"

interface ConversationThreadProps {
  readonly turns: readonly ConversationTurn[]
}

/** @Owl.TUI.Components.ConversationThread.Row - Single turn display */
const InferenceTurnRow = memo(function InferenceTurnRow({
  turn,
}: {
  readonly turn: Extract<ConversationTurn, { readonly kind: "inference" }>
}): React.ReactElement {
  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* User prompt */}
      <Box gap={1}>
        <Text color="cyan" bold>
          ❯
        </Text>
        <Text color="white" wrap="wrap">
          {turn.prompt}
        </Text>
      </Box>
      {/* Assistant response */}
      <Box paddingLeft={2} flexDirection="column">
        <MarkdownText content={turn.response} />
        <Text color="gray" dimColor>
          {turn.provider} · {turn.model} · {String(turn.latencyMs)}ms ·{" "}
          {String(turn.inputTokens)}↑ {String(turn.outputTokens)}↓ ·{" "}
          {formatEstimatedCostUsd(turn.estimatedCostUsd)}
        </Text>
      </Box>
    </Box>
  )
})

/** @Owl.TUI.Components.ConversationThread.Command - Slash command display */
const CommandTurnRow = memo(function CommandTurnRow({
  turn,
}: {
  readonly turn: Extract<ConversationTurn, { readonly kind: "command" }>
}): React.ReactElement {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box gap={1}>
        <Text color="magenta" bold>
          /
        </Text>
        <Text color="magentaBright" wrap="wrap">
          {turn.command}
        </Text>
      </Box>
      <Box paddingLeft={2} flexDirection="column">
        <MarkdownText content={turn.output} />
        <Text color="gray" dimColor>
          command
        </Text>
      </Box>
    </Box>
  )
})

/** @Owl.TUI.Components.ConversationThread.Row - Dispatches turn renderer */
const TurnRow = memo(function TurnRow({
  turn,
}: {
  readonly turn: ConversationTurn
}): React.ReactElement {
  return turn.kind === "command" ? (
    <CommandTurnRow turn={turn} />
  ) : (
    <InferenceTurnRow turn={turn} />
  )
})

/** @Owl.TUI.Components.ConversationThread.Component - Full conversation list */
export const ConversationThread: React.FC<ConversationThreadProps> = memo(
  ({ turns }) => (
    <Box flexDirection="column" flexGrow={1}>
      {turns.length === 0 ? (
        <Text color="gray" dimColor>
          Send a prompt to get started.
        </Text>
      ) : (
        turns.map((turn) => <TurnRow key={turn.id} turn={turn} />)
      )}
    </Box>
  ),
)

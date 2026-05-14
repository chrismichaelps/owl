/** @Owl.TUI.Components.OutputPanel - Center panel: conversation thread + active spinner */
import React, { memo } from "react"
import { Box, Text } from "ink"
import type { AgentStatus, ConversationTurn } from "../state.js"
import { ConversationThread } from "./ConversationThread.js"
import { Spinner } from "./Spinner.js"

interface OutputPanelProps {
  readonly status: AgentStatus
  readonly turns: readonly ConversationTurn[]
  readonly error: string | null
  readonly streamingContent: string
}

/** @Owl.TUI.Components.OutputPanel.Component - Center panel with response area */
export const OutputPanel: React.FC<OutputPanelProps> = memo(
  ({ status, turns, error, streamingContent }) => (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="green"
      paddingX={1}
      flexGrow={1}
    >
      <Text bold color="greenBright">
        ◉ Response
      </Text>
      <Box flexDirection="column" flexGrow={1} marginTop={1}>
        {error !== null ? (
          <Text color="red">{error}</Text>
        ) : status === "routing" ? (
          <Spinner label="Routing to provider…" color="yellow" />
        ) : status === "inferring" ? (
          <Box flexDirection="column">
            <Spinner label="Inferring…" color="cyan" />
            {streamingContent.length > 0 ? (
              <Box marginTop={1}>
                <Text wrap="wrap">{streamingContent}</Text>
              </Box>
            ) : null}
          </Box>
        ) : (
          <ConversationThread turns={turns} />
        )}
      </Box>
    </Box>
  ),
)

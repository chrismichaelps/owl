/** @Owl.TUI.Components.OutputPanel - Center panel: LLM response + spinner */
import React, { memo } from "react"
import { Box, Text } from "ink"
import type { ResponseSnapshot } from "../state.js"
import type { AgentStatus } from "../state.js"
import { Spinner } from "./Spinner.js"

interface OutputPanelProps {
  readonly status: AgentStatus
  readonly response: ResponseSnapshot | null
  readonly error: string | null
}

export const OutputPanel: React.FC<OutputPanelProps> = memo(
  ({ status, response, error }) => (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="green"
      paddingX={1}
      flexGrow={1}
    >
      {/* Header */}
      <Text bold color="greenBright">
        ◉ Response
      </Text>

      {/* Content */}
      <Box flexDirection="column" flexGrow={1} marginTop={1}>
        {error !== null ? (
          <Text color="red">{error}</Text>
        ) : status === "routing" ? (
          <Spinner label="Routing to provider…" color="yellow" />
        ) : status === "inferring" ? (
          <Spinner label="Inferring…" color="cyan" />
        ) : response !== null ? (
          <Text>{response.content}</Text>
        ) : (
          <Text color="gray" dimColor>
            Send a prompt to get started. Type your task below.
          </Text>
        )}
      </Box>

      {/* Model tag when complete */}
      {response !== null && status === "complete" ? (
        <Box marginTop={1}>
          <Text color="gray" dimColor>
            {response.model} · {String(response.latencyMs)}ms ·{" "}
            {String(response.usage.inputTokens)}↑{" "}
            {String(response.usage.outputTokens)}↓
          </Text>
        </Box>
      ) : null}
    </Box>
  ),
)

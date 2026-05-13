/** @Owl.TUI.Components.PromptInput - Bottom input: REPL-style prompt with mode prefix */
import React, { memo, useState } from "react"
import { Box, Text, useInput } from "ink"
import type { Mode } from "../../core/schema/index.js"

const MODE_COLOR: Record<Mode, string> = {
  standard: "green",
  quick: "yellow",
  deep: "blue",
  economy: "gray",
  god: "red",
}

interface PromptInputProps {
  readonly mode: Mode
  readonly disabled: boolean
  readonly onSubmit: (prompt: string, mode: Mode) => void
  readonly onModeChange: (mode: Mode) => void
}

export const PromptInput: React.FC<PromptInputProps> = memo(
  ({ mode, disabled, onSubmit, onModeChange }) => {
    const [value, setValue] = useState("")

    useInput(
      (input, key) => {
        if (disabled) return

        if (key.return) {
          const trimmed = value.trim()
          if (trimmed.length === 0) return

          // Slash command mode switching
          if (trimmed === "/quick" || trimmed.startsWith("/quick ")) {
            onModeChange("quick")
            const rest = trimmed.slice("/quick".length).trim()
            if (rest.length > 0) onSubmit(rest, "quick")
            setValue("")
            return
          }
          if (trimmed === "/deep" || trimmed.startsWith("/deep ")) {
            onModeChange("deep")
            const rest = trimmed.slice("/deep".length).trim()
            if (rest.length > 0) onSubmit(rest, "deep")
            setValue("")
            return
          }
          if (trimmed === "/economy" || trimmed.startsWith("/economy ")) {
            onModeChange("economy")
            const rest = trimmed.slice("/economy".length).trim()
            if (rest.length > 0) onSubmit(rest, "economy")
            setValue("")
            return
          }
          if (trimmed === "/task" || trimmed.startsWith("/task ")) {
            onModeChange("standard")
            const rest = trimmed.slice("/task".length).trim()
            if (rest.length > 0) onSubmit(rest, "standard")
            setValue("")
            return
          }

          onSubmit(trimmed, mode)
          setValue("")
          return
        }

        if (key.backspace || key.delete) {
          setValue((v) => v.slice(0, -1))
          return
        }

        // Suppress non-printable / control sequences
        if (!key.ctrl && !key.meta && input.length > 0) {
          setValue((v) => v + input)
        }
      },
      { isActive: !disabled },
    )

    return (
      <Box borderStyle="single" borderColor={MODE_COLOR[mode]} paddingX={1}>
        <Text color={MODE_COLOR[mode]} bold>
          [{mode}]
        </Text>
        <Text> ❯ </Text>
        <Text>
          {value}
          {!disabled ? <Text color="white">█</Text> : null}
        </Text>
        {disabled ? (
          <Text color="gray" dimColor>
            {" "}
            (processing…)
          </Text>
        ) : null}
      </Box>
    )
  },
)

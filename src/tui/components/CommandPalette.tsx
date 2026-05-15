/** @Owl.TUI.Components.CommandPalette - Fuzzy slash command overlay */
import React, { memo } from "react"
import { Box, Text } from "ink"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { rankPaletteCommands } from "../commands/fuzzy.js"
import type { PaletteCommand } from "../commands/fuzzy.js"

interface CommandPaletteProps {
  readonly open: boolean
  readonly query: string
  readonly selectedIndex: number
  readonly commands: readonly PaletteCommand[]
}

/** @Owl.TUI.Components.CommandPalette.Component - Selectable command list */
export const CommandPalette: React.FC<CommandPaletteProps> = memo(
  ({ open, query, selectedIndex, commands }) => {
    if (!open) return null

    const ranked = rankPaletteCommands(commands, query).slice(
      0,
      COMMAND_CONSTANTS.PALETTE_VISIBLE_COUNT,
    )

    return (
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={1}
        flexDirection="column"
        marginBottom={1}
      >
        <Box justifyContent="space-between">
          <Text color="cyanBright" bold>
            Slash commands
          </Text>
          <Text color="gray" dimColor>
            ↑↓ select · enter run · esc close
          </Text>
        </Box>
        <Text color="gray">/{query}</Text>

        {ranked.length === 0 ? (
          <Text color="gray" dimColor>
            No matching commands
          </Text>
        ) : (
          ranked.map((command, index) => {
            const selected = index === selectedIndex
            return (
              <Box key={command.name}>
                {selected ? (
                  <Text color="black" backgroundColor="cyan" bold>
                    /{command.name}
                  </Text>
                ) : (
                  <Text color="cyan">/{command.name}</Text>
                )}
                <Text color="gray" dimColor={!selected}>
                  {"  "}
                  {command.description}
                </Text>
              </Box>
            )
          })
        )}
      </Box>
    )
  },
)

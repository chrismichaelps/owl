/** @Owl.TUI.Components.ShortcutsOverlay - Keyboard guide for terminal workflows */
import React, { memo } from "react"
import { Box, Text } from "ink"
import {
  TUI_SHORTCUTS,
  TUI_SHORTCUTS_LAYOUT,
} from "../../core/constants/index.js"

/** @Owl.TUI.Components.ShortcutsOverlay.Format - Stable shortcut label alignment */
export function formatShortcutKey(key: string): string {
  return key.padEnd(TUI_SHORTCUTS_LAYOUT.KEY_COLUMN_WIDTH)
}

/** @Owl.TUI.Components.ShortcutsOverlay.Component - Discoverable keyboard reference */
export const ShortcutsOverlay: React.FC = memo(() => (
  <Box justifyContent="center">
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      width={TUI_SHORTCUTS_LAYOUT.PANEL_WIDTH}
    >
      <Text bold color="cyanBright">
        Owl Shortcuts
      </Text>
      <Text color="gray" dimColor>
        Keyboard-first controls for the current session.
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {TUI_SHORTCUTS.map(([key, description]) => (
          <Box key={key}>
            <Text color="yellow">{formatShortcutKey(key)}</Text>
            <Text>{description}</Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          Press esc to close.
        </Text>
      </Box>
    </Box>
  </Box>
))

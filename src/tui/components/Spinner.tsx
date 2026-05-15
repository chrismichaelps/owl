/** @Owl.TUI.Components.Spinner - Animated spinner for active inference state */
import React, { memo } from "react"
import { Box, Text } from "ink"
import { TUI_ANIMATION } from "../../core/constants/index.js"
import {
  getFrame,
  useTerminalAnimation,
} from "../hooks/useTerminalAnimation.js"

interface SpinnerProps {
  readonly label: string
  readonly color?: string
}

/** @Owl.TUI.Components.Spinner.Component - Animated loading indicator */
export const Spinner: React.FC<SpinnerProps> = memo(
  ({ label, color = "cyan" }) => {
    const frame = useTerminalAnimation(true)
    const glyph = getFrame(
      TUI_ANIMATION.SPINNER_FRAMES,
      frame,
      TUI_ANIMATION.SPINNER_FRAMES[0],
    )

    return (
      <Box>
        <Text color={color}>{glyph} </Text>
        <Text color={color}>{label}</Text>
      </Box>
    )
  },
)

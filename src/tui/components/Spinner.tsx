/** @Owl.TUI.Components.Spinner - Animated spinner for active inference state */
import React, { memo, useEffect, useState } from "react"
import { Box, Text } from "ink"

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
const INTERVAL_MS = 80

interface SpinnerProps {
  readonly label: string
  readonly color?: string
}

export const Spinner: React.FC<SpinnerProps> = memo(
  ({ label, color = "cyan" }) => {
    const [frame, setFrame] = useState(0)

    useEffect(() => {
      const id = setInterval(() => {
        setFrame((f) => (f + 1) % FRAMES.length)
      }, INTERVAL_MS)
      return () => {
        clearInterval(id)
      }
    }, [])

    return (
      <Box>
        <Text color={color}>{FRAMES[frame]} </Text>
        <Text color={color}>{label}</Text>
      </Box>
    )
  },
)

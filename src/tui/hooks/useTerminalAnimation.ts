/** @Owl.TUI.Hooks.Animation - Terminal-safe frame clock */
import { useEffect, useState } from "react"
import { TUI_ANIMATION } from "../../core/constants/index.js"

/** @Owl.TUI.Hooks.Animation.Frame - Deterministic frame selector */
export const getFrame = <T>(
  frames: readonly T[],
  frame: number,
  fallback: T,
): T => frames[frame % frames.length] ?? fallback

/** @Owl.TUI.Hooks.Animation.Clock - Ink-native animation frame counter */
export function useTerminalAnimation(
  enabled: boolean,
  intervalMs: number = TUI_ANIMATION.FRAME_INTERVAL_MS,
): number {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (!enabled) return

    const id = setInterval(() => {
      setFrame((current) => current + 1)
    }, intervalMs)

    return () => {
      clearInterval(id)
    }
  }, [enabled, intervalMs])

  return frame
}

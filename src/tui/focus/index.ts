/** @Owl.TUI.Focus - Deterministic workbench panel navigation */
import { Chunk } from "effect"
import { TUI_FOCUS, TUI_FOCUS_ORDER } from "../../core/constants/index.js"

export type FocusedPanel = (typeof TUI_FOCUS)[keyof typeof TUI_FOCUS]

const isFocusedPanel = (value: string): value is FocusedPanel =>
  value === TUI_FOCUS.LOGS ||
  value === TUI_FOCUS.RESPONSE ||
  value === TUI_FOCUS.METRICS

/** @Owl.TUI.Focus.Move - Cycle panel focus left or right */
export const moveFocusPanel = (
  current: FocusedPanel,
  delta: -1 | 1,
): FocusedPanel => {
  const panels = Chunk.toReadonlyArray(TUI_FOCUS_ORDER)
  const currentIndex = panels.indexOf(current)
  const nextIndex =
    (currentIndex + delta + panels.length) % Math.max(1, panels.length)
  const next = panels[nextIndex] ?? TUI_FOCUS.RESPONSE
  return isFocusedPanel(next) ? next : TUI_FOCUS.RESPONSE
}

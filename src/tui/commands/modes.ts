/** @Owl.TUI.Commands.Modes - Slash mode routing helpers */
import { Chunk, HashMap, Option } from "effect"
import {
  PARSER_CHARS,
  TUI_MODE_COLORS,
  TUI_SLASH_MODE_COMMANDS,
} from "../../core/constants/index.js"
import type { Mode } from "../../core/schema/index.js"

const isMode = (value: string): value is Mode =>
  value === "standard" ||
  value === "quick" ||
  value === "deep" ||
  value === "economy" ||
  value === "god"

/** @Owl.TUI.Commands.Modes.Detect - Resolve slash command mode */
export function detectSlashMode(value: string): Mode | null {
  const match = Chunk.findFirst(
    Chunk.fromIterable(HashMap.entries(TUI_SLASH_MODE_COMMANDS)),
    ([prefix]) =>
      value === prefix || value.startsWith(prefix + PARSER_CHARS.SPACE),
  )

  if (Option.isNone(match)) return null
  const [, mode] = match.value
  return isMode(mode) ? mode : null
}

/** @Owl.TUI.Commands.Modes.Color - Resolve prompt mode color */
export function resolveModeColor(mode: Mode): string {
  return Option.getOrElse(HashMap.get(TUI_MODE_COLORS, mode), () => "white")
}

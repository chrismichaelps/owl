/** @Owl.Commands.Parser - Quote-aware tokenizer and slash-command validator */
import { Effect } from "effect"
import { CommandParseError } from "../core/errors/index.js"
import type { ParsedCommand } from "./types.js"

/** Tokenize input respecting single/double-quoted spans */
function tokenize(input: string): string[] {
  const tokens: string[] = []
  let current = ""
  let inQuote: '"' | "'" | null = null

  for (const ch of input) {
    if (inQuote !== null) {
      if (ch === inQuote) {
        inQuote = null
      } else {
        current += ch
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch
    } else if (ch === " " || ch === "\t") {
      if (current.length > 0) {
        tokens.push(current)
        current = ""
      }
    } else {
      current += ch
    }
  }
  if (current.length > 0) tokens.push(current)
  return tokens
}

/** Parse a raw slash-command string into a ParsedCommand */
export function parseCommand(
  raw: string,
): Effect.Effect<ParsedCommand, CommandParseError> {
  const trimmed = raw.trim()

  if (!trimmed.startsWith("/")) {
    return Effect.fail(
      new CommandParseError({
        input: raw,
        reason: "Command must start with '/'",
      }),
    )
  }

  const tokens = tokenize(trimmed.slice(1))
  const name = tokens[0]

  if (name === undefined || name.length === 0) {
    return Effect.fail(
      new CommandParseError({ input: raw, reason: "Command name is empty" }),
    )
  }

  return Effect.succeed({ name, args: tokens.slice(1), raw })
}

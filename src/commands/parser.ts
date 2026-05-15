/**
 * @Owl.Commands.Parser - Quote-aware tokenizer and slash-command validator
 *
 * Converts raw input strings into ParsedCommand objects.
 *
 * Features:
 * - Respects quoted spans (single and double quotes)
 * - Validates slash prefix
 * - Extracts command name and arguments
 *
 * @example
 * parseCommand("/deep analyze this code")
 * // → { name: "deep", args: ["analyze", "this", "code"], raw: "/deep analyze this code" }
 *
 * parseCommand('/edit "src/foo.ts" "old" "new"')
 * // → { name: "edit", args: ["src/foo.ts", "old", "new"], raw: "..." }
 */
import { Effect } from "effect"
import { CommandParseError } from "../core/errors/index.js"
import type { ParsedCommand } from "./types.js"

interface TokenizeResult {
  readonly tokens: readonly string[]
  readonly unterminatedQuote: '"' | "'" | null
}

/** Tokenize input respecting single/double-quoted spans */
function tokenize(input: string): TokenizeResult {
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
  return { tokens, unterminatedQuote: inQuote }
}

/**
 * Parse a raw slash-command string into a ParsedCommand
 *
 * @param raw - Raw input string (may include / prefix)
 * @returns ParsedCommand with name and args
 * @throws CommandParseError - If input doesn't start with / or has no command name
 */
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

  const tokenized = tokenize(trimmed.slice(1))

  if (tokenized.unterminatedQuote !== null) {
    return Effect.fail(
      new CommandParseError({
        input: raw,
        reason: "Command contains an unterminated quoted argument",
      }),
    )
  }

  const tokens = tokenized.tokens
  const name = tokens[0]

  if (name === undefined || name.length === 0) {
    return Effect.fail(
      new CommandParseError({ input: raw, reason: "Command name is empty" }),
    )
  }

  return Effect.succeed({ name, args: tokens.slice(1), raw })
}

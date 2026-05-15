/** @Owl.Commands.Utils.Prompt - Shared command text validation */
import { Effect } from "effect"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { CommandParseError } from "../../core/errors/index.js"

/** @Owl.Commands.Utils.Text - Join and validate command prompt text */
export const requireCommandText = (
  commandName: string,
  args: readonly string[],
  label: string,
): Effect.Effect<string, CommandParseError> => {
  const text = args.join(" ").trim()

  if (text.length < COMMAND_CONSTANTS.MIN_PROMPT_LENGTH) {
    return Effect.fail(
      new CommandParseError({
        input: "/" + commandName,
        reason: label + " is required",
      }),
    )
  }

  if (text.length > COMMAND_CONSTANTS.MAX_PROMPT_LENGTH) {
    return Effect.fail(
      new CommandParseError({
        input: "/" + commandName,
        reason:
          label +
          " exceeds maximum length of " +
          String(COMMAND_CONSTANTS.MAX_PROMPT_LENGTH),
      }),
    )
  }

  return Effect.succeed(text)
}

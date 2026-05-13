/** @Owl.Commands.Management.Model - Display active model information: /model */
import { Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

export function makeModelCommand(): CommandHandler {
  return {
    name: "model",
    description:
      "Display active model and operational mode information: /model",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.succeed({
        output:
          "Model is configured via provider settings.\n" +
          "Operational modes: standard (/task), deep (/deep, /plan, /analyze, /friction, /grill), " +
          "quick (/quick), raw (/raw), god (/god), economy (/economy).",
      }),
  }
}

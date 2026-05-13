/** @Owl.Commands.Editing.Inject - Insert content after a specific string: /inject <file> "<after>" "<content>" */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { EditingPipelineService } from "../../editor/pipeline/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

export function makeInjectCommand(
  pipeline: EditingPipelineService,
  projectRoot: string,
): CommandHandler {
  return {
    name: "inject",
    description:
      'Insert content after a specific string: /inject <file> "<after>" "<content>"',
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const [file, after, content] = args
      if (file === undefined || after === undefined || content === undefined) {
        return Effect.fail(
          new CommandParseError({
            input: "/inject",
            reason: 'Usage: /inject <file> "<after_string>" "<new_content>"',
          }),
        )
      }
      const newString = after + "\n" + content
      return pipeline
        .execute({
          mutationId: "inject-" + Date.now().toString(36),
          targets: [{ file, oldString: after, newString }],
          projectRoot,
          autoApprove: true,
        })
        .pipe(
          Effect.map((_result) => ({ output: "Injected into " + file })),
          Effect.catchAll((err) =>
            Effect.fail(
              new CommandParseError({ input: "/inject", reason: String(err) }),
            ),
          ),
        )
    },
  }
}

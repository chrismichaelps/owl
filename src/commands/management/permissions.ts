/** @Owl.Commands.Management.Permissions - Control session Permission mode */
import { Chunk, Effect, Option } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import { parseToolPermissionMode } from "../../tools/permissionState.js"
import type { ToolPermissionStateService } from "../../tools/permissionState.js"
import type { ToolPermissionMode } from "../../tools/permission.js"
import type { CommandHandler, CommandResult } from "../types.js"

const formatModes = (modes: Chunk.Chunk<ToolPermissionMode>): string =>
  Chunk.toReadonlyArray(modes).join(", ")

/** @Owl.Commands.Management.Permissions.Factory - Create /permissions handler */
export function makePermissionsCommand(
  state: ToolPermissionStateService,
): CommandHandler {
  return {
    name: "permissions",
    description: "Show or set tool Permission mode: /permissions <mode>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const requested = args[0]

        if (requested === undefined || requested === "status") {
          const snapshot = yield* state.snapshot()
          return {
            output:
              "Permission mode: " +
              snapshot.mode +
              "\nAvailable modes: " +
              formatModes(snapshot.modes) +
              "\nBlocked ToolRisk is always denied.",
          }
        }

        const mode = parseToolPermissionMode(requested)
        if (Option.isNone(mode)) {
          const snapshot = yield* state.snapshot()
          return yield* Effect.fail(
            new CommandParseError({
              input: "/permissions " + requested,
              reason:
                "Invalid Permission mode. Valid modes: " +
                formatModes(snapshot.modes),
            }),
          )
        }

        yield* state.setMode(mode.value)
        return {
          output:
            "Permission mode: " +
            mode.value +
            "\nTool decisions now resolve against this session mode.",
        }
      }),
  }
}

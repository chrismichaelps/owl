/** @Owl.Commands.Management.Role - Transition the FMCF specialist role: /role <name> */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { RoleContextService, RoleId } from "../../fmcf/roles/architect.js"
import type { CommandHandler, CommandResult } from "../types.js"

const VALID_ROLES = ["architect", "dna-engineer", "shadow", "guardian"] as const

function isRoleId(s: string): s is RoleId {
  return (VALID_ROLES as readonly string[]).includes(s)
}

export function makeRoleCommand(roleCtx: RoleContextService): CommandHandler {
  return {
    name: "role",
    description:
      "Transition to an FMCF specialist role: /role <architect|dna-engineer|shadow|guardian>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const roleName = args[0]
      if (roleName === undefined) {
        return Effect.fail(
          new CommandParseError({
            input: "/role",
            reason: "Role name is required. Valid: " + VALID_ROLES.join(", "),
          }),
        )
      }
      if (!isRoleId(roleName)) {
        return Effect.fail(
          new CommandParseError({
            input: "/role " + roleName,
            reason: "Invalid role. Valid: " + VALID_ROLES.join(", "),
          }),
        )
      }
      return roleCtx.transition(roleName).pipe(
        Effect.map(() => ({ output: "Active role: " + roleName })),
        Effect.catchAll((err) =>
          Effect.fail(
            new CommandParseError({
              input: "/role " + roleName,
              reason: String(err),
            }),
          ),
        ),
      )
    },
  }
}

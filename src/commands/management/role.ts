/**
 * @Owl.Commands.Management.Role - Transition the FMCF specialist role: /role <name>
 *
 * Transitions to a different FMCF specialist role.
 * Valid roles follow the Deepening Flow:
 * - architect (default) → dna-engineer → shadow → guardian
 *
 * Role constraints:
 * - Only forward transitions allowed
 * - Invalid transitions return GovernanceViolationError
 *
 * Valid role names: architect, dna-engineer, shadow, guardian
 *
 * @example
 * /role dna-engineer
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { RoleContextService, RoleId } from "../../fmcf/roles/architect.js"
import type { CommandHandler, CommandResult } from "../types.js"

const VALID_ROLES = ["architect", "dna-engineer", "shadow", "guardian"] as const

/** Type guard for RoleId */
function isRoleId(s: string): s is RoleId {
  return (VALID_ROLES as readonly string[]).includes(s)
}

/**
 * @Owl.Commands.Management.Role.Factory - Create the /role command handler
 */
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

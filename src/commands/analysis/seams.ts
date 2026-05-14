/**
 * @Owl.Commands.Analysis.Seams - Display hash registry seams: /seams
 *
 * Reads from the HashRegistry to display all seams with their capacity.
 * Shows seam ID, capacity badge, and description.
 *
 * Seam capacities:
 * - BACKBONE: High-traffic, critical seams (deepen heavily)
 * - CRITICAL: Important seams (deepen moderately)
 * - EXPLORATORY: Experimental seams (keep simple or collapse)
 * - INTERNAL: Within-subsystem seams (tight coupling allowed)
 *
 * @example
 * /seams
 * // seam-orchestrator-router [BACKBONE] — Orchestrator-Router Crossing Point
 * // seam-context-memory [CRITICAL] — Context-Memory Seam
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { HashRegistryService } from "../../fmcf/registry/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Analysis.Seams.Factory - Create the /seams command handler
 */
export function makeSeamsCommand(
  registry: HashRegistryService,
): CommandHandler {
  return {
    name: "seams",
    description: "Display all seams from the hash registry: /seams",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      registry.readSeams().pipe(
        Effect.map((seams) => {
          const lines = seams.map(
            (s) => s.id + " [" + s.capacity + "] — " + s.name,
          )
          return { output: lines.join("\n") }
        }),
        Effect.catchAll((err) =>
          Effect.fail(
            new CommandParseError({ input: "/seams", reason: String(err) }),
          ),
        ),
      ),
  }
}

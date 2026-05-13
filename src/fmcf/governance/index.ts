/** @Owl.FMCF.Governance - Constitutional enforcement for FMCF v3.5 invariants */
import { Context, Effect, Layer } from "effect"
import { GovernanceViolationError } from "../../core/errors/index.js"
import { SHARD_SPLIT_THRESHOLD } from "../../core/constants/index.js"
import type { RoleId } from "../roles/architect.js"

export interface GovernanceEngineService {
  readonly validateImportInvariant: (
    subsystemId: string,
    invariants: readonly string[],
    importedFromSubsystem: string,
  ) => Effect.Effect<void, GovernanceViolationError>

  readonly validateTLIScope: (
    file: string,
    changedLines: number,
    totalLines: number,
  ) => Effect.Effect<"OK" | "SHARD_SPLIT">

  readonly validateRoleTransition: (
    from: RoleId,
    to: RoleId,
    allowedFlow: readonly RoleId[],
  ) => Effect.Effect<void, GovernanceViolationError>
}

export class GovernanceEngine extends Context.Tag("GovernanceEngine")<
  GovernanceEngine,
  GovernanceEngineService
>() {}

const violatesInvariant = (
  invariants: readonly string[],
  importedFrom: string,
): string | undefined =>
  invariants.find((inv) => {
    if (!inv.startsWith("MUST NOT:")) return false
    const lowerInv = inv.toLowerCase()
    const lowerImport = importedFrom.toLowerCase()
    return (
      lowerInv.includes(lowerImport) ||
      (lowerImport.startsWith("subsystem-") &&
        lowerInv.includes("other src/ subsystem"))
    )
  })

export const GovernanceEngineLive = Layer.succeed(GovernanceEngine, {
  validateImportInvariant: (
    subsystemId: string,
    invariants: readonly string[],
    importedFromSubsystem: string,
  ): Effect.Effect<void, GovernanceViolationError> => {
    const violated = violatesInvariant(invariants, importedFromSubsystem)
    if (violated !== undefined) {
      return Effect.fail(
        new GovernanceViolationError({
          rule: "IMPORT_INVARIANT",
          module: subsystemId,
          detail: `"${importedFromSubsystem}" violates: ${violated}`,
        }),
      )
    }
    return Effect.void
  },

  validateTLIScope: (
    _file: string,
    changedLines: number,
    totalLines: number,
  ): Effect.Effect<"OK" | "SHARD_SPLIT"> => {
    const ratio = changedLines / totalLines
    return Effect.succeed(ratio >= SHARD_SPLIT_THRESHOLD ? "SHARD_SPLIT" : "OK")
  },

  validateRoleTransition: (
    from: RoleId,
    to: RoleId,
    allowedFlow: readonly RoleId[],
  ): Effect.Effect<void, GovernanceViolationError> => {
    const fromIdx = allowedFlow.indexOf(from)
    const expectedNext = allowedFlow[fromIdx + 1]
    if (to !== expectedNext) {
      return Effect.fail(
        new GovernanceViolationError({
          rule: "DEEPENING_FLOW",
          module: "GovernanceEngine",
          detail: `Invalid transition: ${from} → ${to}. Expected: ${expectedNext ?? "none (end of flow)"}`,
        }),
      )
    }
    return Effect.void
  },
} satisfies GovernanceEngineService)

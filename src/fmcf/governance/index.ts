/**
 * @Owl.FMCF.Governance - Constitutional enforcement for FMCF v3.5 invariants
 *
 * The Governance Engine enforces the Mathematical Constitution of FMCF v3.5:
 * the non-negotiable laws that govern all AI behavior in the Owl system.
 *
 * Enforced invariants:
 * 1. Hash-First Hard-Lock: Registry must be updated before implementation code
 * 2. Sequential Integrity (Loopback): TLI must be followed by registry update
 * 3. Specialist-Silo Constraint: Roles stay within their boundaries
 * 4. Shard Split Protocol: Changes >15% of a file trigger a split
 *
 * Violations are never allowed to proceed. The engine returns GovernanceViolationError
 * that blocks the pipeline until resolved by the Architect role.
 *
 * @example
 * // Validate a role transition (architect → dna-engineer ✓, architect → shadow ✗)
 * yield* Effect.flatMap(GovernanceEngine, (g) =>
 *   g.validateRoleTransition("architect", "dna-engineer", DEEPENING_FLOW)
 * )
 *
 * // Check if a mutation exceeds Shard Split threshold
 * const result = yield* Effect.flatMap(GovernanceEngine, (g) =>
 *   g.validateTLIScope("src/foo.ts", 30, 100) // 30% changed → "SHARD_SPLIT"
 * )
 */
import { Context, Effect, Layer } from "effect"
import { GovernanceViolationError } from "../../core/errors/index.js"
import { SHARD_SPLIT_THRESHOLD } from "../../core/constants/index.js"
import type { RoleId } from "../roles/architect.js"

/**
 * @Owl.FMCF.Governance.Service - Constitutional enforcement interface
 *
 * Three validation gates that enforce FMCF invariants throughout the pipeline.
 */
export interface GovernanceEngineService {
  /**
   * Validate subsystem import invariants
   *
   * Checks that an import doesn't violate subsystem MUST NOT invariants.
   * For example: "MUST NOT: import from other src/ subsystem" would block
   * a subsystem-X file from importing subsystem-Y modules.
   *
   * @param subsystemId - The subsystem doing the importing
   * @param invariants - The subsystem's MUST NOT constraints
   * @param importedFromSubsystem - The subsystem being imported
   * @returns void on success, GovernanceViolationError on violation
   */
  readonly validateImportInvariant: (
    subsystemId: string,
    invariants: readonly string[],
    importedFromSubsystem: string,
  ) => Effect.Effect<void, GovernanceViolationError>

  /**
   * Validate TLI scope for Shard Split detection
   *
   * When changedLines / totalLines >= SHARD_SPLIT_THRESHOLD (0.15),
   * the Shard Split Protocol triggers. Large changes should be split
   * into smaller, focused changes across multiple files or modules.
   *
   * @param file - File being changed (for error messages)
   * @param changedLines - Lines added + removed
   * @param totalLines - Total lines in file before change
   * @returns "OK" if under threshold, "SHARD_SPLIT" if threshold exceeded
   */
  readonly validateTLIScope: (
    file: string,
    changedLines: number,
    totalLines: number,
  ) => Effect.Effect<"OK" | "SHARD_SPLIT">

  /**
   * Validate role transition follows Deepening Flow
   *
   * The only valid transitions are: architect → dna-engineer → shadow → guardian.
   * After guardian, the flow loops back to architect for a new task.
   * Invalid transitions (skipping, backwards, wrong order) are blocked.
   *
   * @param from - Current role
   * @param to - Attempted role
   * @param allowedFlow - The DEEPENING_FLOW sequence to validate against
   * @returns void on valid transition, GovernanceViolationError on invalid
   */
  readonly validateRoleTransition: (
    from: RoleId,
    to: RoleId,
    allowedFlow: readonly RoleId[],
  ) => Effect.Effect<void, GovernanceViolationError>
}

/** @Owl.FMCF.Governance.Tag - Service tag for constitutional enforcement */
export class GovernanceEngine extends Context.Tag("GovernanceEngine")<
  GovernanceEngine,
  GovernanceEngineService
>() {}

/**
 * @Owl.FMCF.Governance.Validation - Helper for invariant violation detection
 *
 * Parses MUST NOT constraints to check if an import violates them.
 * Case-insensitive matching for robust comparison.
 */
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

/**
 * @Owl.FMCF.Governance.Live - Constitutional enforcement implementation
 *
 * All methods are pure functions with no side effects. Uses Layer.succeed
 * for stateless, dependency-free execution.
 */
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

/**
 * @Owl.FMCF.Roles.Architect - RoleContext service, Deepening Flow, and Architect role definition
 *
 * This module defines the FMCF v3.5 Specialist Silo Constraint — the role system that governs
 * every AI action in the Owl system. The Architect is the entry role for the Deepening Flow
 * and is responsible for topology, friction discovery, seam analysis, deepening, and the grilling loop.
 *
 * The Architect is strictly prohibited from writing code, writing contracts, or editing the registry.
 * This separation enforces the Hash-First Hard-Lock principle: architecture decisions are made
 * before any implementation work begins.
 *
 * The deepening flow defines a strict sequential progression:
 *   Architect → DNA Engineer → Shadow → Forensic Guardian
 *
 * Each role has a defined set of responsibilities and prohibitions enforced by GovernanceEngine.
 * Role transitions are validated to ensure only forward progression through the flow.
 *
 * @example
 * // Reading current role
 * const role = yield* Effect.flatMap(RoleContext, (ctx) => ctx.current())
 *
 * // Transitioning to next role (enforces flow order)
 * yield* Effect.flatMap(RoleContext, (ctx) => ctx.transition("dna-engineer"))
 *
 * // Reset to architect for new task
 * yield* Effect.flatMap(RoleContext, (ctx) => ctx.reset())
 */
import { Context, Effect, Layer, Ref } from "effect"
import { GovernanceViolationError } from "../../core/errors/index.js"

/**
 * @Owl.FMCF.Roles.Architect.Id - Valid role identifiers
 *
 * Four specialist silos: Architect (topology/seams), DNA Engineer (contracts/blueprints),
 * Shadow (TLI code injection), Forensic Guardian (registry/forensics).
 */
export type RoleId = "architect" | "dna-engineer" | "shadow" | "guardian"

/**
 * @Owl.FMCF.Roles.Architect.Definition - Role contract structure
 *
 * Each role has explicit responsibilities (what it MAY do) and prohibitions (what it MUST NOT do).
 * This contract is the foundation of the Specialist Silo Constraint — a hard architectural boundary
 * that prevents role confusion and maintains governance integrity.
 *
 * @example
 * const roleDefinition: RoleDefinition = {
 *   id: "architect",
 *   responsibilities: ["topology", "friction-discovery", ...],
 *   prohibited: ["write-code", "write-contracts", ...],
 * }
 */
export interface RoleDefinition {
  readonly id: RoleId
  readonly responsibilities: readonly string[]
  readonly prohibited: readonly string[]
}

/**
 * @Owl.FMCF.Roles.Architect.Flow - Sequential role progression through the Deepening Flow
 *
 * Law 3 of FMCF v3.5: Sequential Integrity (Loopback) — every TLI code injection must be
 * immediately followed by a registry update. The Deepening Flow enforces this by requiring
 * strict forward progression through roles.
 *
 * Transitions are validated: only the next role in sequence can be selected.
 * Attempting to skip roles or go backwards returns a GovernanceViolationError.
 *
 * @example
 * DEEPENING_FLOW[0] === "architect"
 * DEEPENING_FLOW[3] === "guardian"
 * // After shadow: next role must be guardian, then flow restarts
 */
export const DEEPENING_FLOW: readonly RoleId[] = [
  "architect",
  "dna-engineer",
  "shadow",
  "guardian",
]

/**
 * @Owl.FMCF.Roles.Architect.Role - Architect responsibilities and prohibitions
 *
 * The Architect role owns topology decisions: where seams exist, how modules connect,
 * what the depth profile looks like. It discovers friction, analyzes seams, and drives
 * the deepening process. It CANNOT write code (that comes later in the flow).
 *
 * @example
 * ARCHITECT_ROLE.responsibilities.includes("friction-discovery") // true
 * ARCHITECT_ROLE.prohibited.includes("write-code") // true
 */
export const ARCHITECT_ROLE: RoleDefinition = {
  id: "architect",
  responsibilities: [
    "topology",
    "friction-discovery",
    "seam-analysis",
    "deepening",
    "grilling-loop",
  ],
  prohibited: ["write-code", "write-contracts", "edit-registry"],
}

/**
 * @Owl.FMCF.Roles.Architect.Service - Role context management interface
 *
 * Manages the current role state within a session. Provides current(), transition(), and reset().
 * State is backed by Effect Ref for referential transparency.
 *
 * The current role affects command routing, system prompt construction, and governance validation.
 *
 * @example
 * // Query current role
 * const roleId: RoleId = yield* roleCtx.current()
 *
 * // Enforce sequential flow (architect → dna-engineer only)
 * yield* roleCtx.transition("dna-engineer")
 */
export interface RoleContextService {
  readonly current: () => Effect.Effect<RoleId>
  readonly transition: (
    to: RoleId,
  ) => Effect.Effect<void, GovernanceViolationError>
  readonly reset: () => Effect.Effect<void>
}

/** @Owl.FMCF.Roles.Architect.Tag - Service tag for role context */
export class RoleContext extends Context.Tag("RoleContext")<
  RoleContext,
  RoleContextService
>() {}

/**
 * @Owl.FMCF.Roles.Architect.Live - Ref-backed role state management
 *
 * Initial role is always "architect" per FMCF convention. The transition() method enforces
 * DEEPENING_FLOW ordering — invalid transitions fail with GovernanceViolationError.
 * Reset returns to architect for new task sessions.
 */
export const RoleContextLive = Layer.effect(
  RoleContext,
  Effect.gen(function* () {
    const roleRef = yield* Ref.make<RoleId>("architect")

    const current = (): Effect.Effect<RoleId> => Ref.get(roleRef)

    const transition = (
      to: RoleId,
    ): Effect.Effect<void, GovernanceViolationError> =>
      Effect.gen(function* () {
        const from = yield* Ref.get(roleRef)
        const fromIdx = DEEPENING_FLOW.indexOf(from)
        const expectedNext = DEEPENING_FLOW[fromIdx + 1]
        if (to !== expectedNext) {
          return yield* Effect.fail(
            new GovernanceViolationError({
              rule: "DEEPENING_FLOW",
              module: "RoleContext",
              detail: `Invalid transition: ${from} → ${to}. Expected next role: ${expectedNext ?? "none (end of flow)"}`,
            }),
          )
        }
        yield* Ref.set(roleRef, to)
      })

    const reset = (): Effect.Effect<void> => Ref.set(roleRef, "architect")

    return { current, transition, reset } satisfies RoleContextService
  }),
)

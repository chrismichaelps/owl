/** @Owl.FMCF.Roles.Architect - RoleContext service, Deepening Flow, Architect role definition */
import { Context, Effect, Layer, Ref } from "effect"
import { GovernanceViolationError } from "../../core/errors/index.js"

export type RoleId = "architect" | "dna-engineer" | "shadow" | "guardian"

export interface RoleDefinition {
  readonly id: RoleId
  readonly responsibilities: readonly string[]
  readonly prohibited: readonly string[]
}

export const DEEPENING_FLOW: readonly RoleId[] = [
  "architect",
  "dna-engineer",
  "shadow",
  "guardian",
]

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

export interface RoleContextService {
  readonly current: () => Effect.Effect<RoleId>
  readonly transition: (
    to: RoleId,
  ) => Effect.Effect<void, GovernanceViolationError>
  readonly reset: () => Effect.Effect<void>
}

export class RoleContext extends Context.Tag("RoleContext")<
  RoleContext,
  RoleContextService
>() {}

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

/** @Owl.Tokens.Budget - Runtime token budget enforcement with Effect Ref */
import { Context, Effect, Layer, Ref } from "effect"
import { TokenBudgetExceededError } from "../../core/errors/index.js"
import { MODE_TOKEN_BUDGETS } from "../../core/constants/index.js"

/** @Owl.Tokens.Budget.State - Mutable runtime state (private) */
interface BudgetState {
  readonly sessionBudget: number
  readonly consumed: number
  readonly mode: string
}

/** @Owl.Tokens.Budget.Service - Effect service interface */
export interface TokenBudgetService {
  readonly initSession: (mode: string, budget?: number) => Effect.Effect<void>
  readonly consume: (
    taskId: string,
    tokens: number,
  ) => Effect.Effect<void, TokenBudgetExceededError>
  readonly remaining: () => Effect.Effect<number>
  readonly totalConsumed: () => Effect.Effect<number>
  readonly reset: () => Effect.Effect<void>
}

export class TokenBudget extends Context.Tag("TokenBudget")<
  TokenBudget,
  TokenBudgetService
>() {}

/** @Owl.Tokens.Budget.Live - Ref-backed session budget with mode-aware limits */
export const TokenBudgetLive = Layer.effect(
  TokenBudget,
  Effect.gen(function* () {
    const stateRef = yield* Ref.make<BudgetState>({
      sessionBudget: MODE_TOKEN_BUDGETS.standard ?? 32000,
      consumed: 0,
      mode: "standard",
    })

    const initSession = (mode: string, budget?: number): Effect.Effect<void> =>
      Ref.set(stateRef, {
        sessionBudget: budget ?? MODE_TOKEN_BUDGETS[mode] ?? 32000,
        consumed: 0,
        mode,
      })

    const consume = (
      _taskId: string,
      tokens: number,
    ): Effect.Effect<void, TokenBudgetExceededError> =>
      Effect.gen(function* () {
        const state = yield* Ref.get(stateRef)
        const next = state.consumed + tokens
        if (next > state.sessionBudget) {
          return yield* Effect.fail(
            new TokenBudgetExceededError({
              budget: state.sessionBudget,
              actual: next,
              mode: state.mode,
            }),
          )
        }
        yield* Ref.set(stateRef, { ...state, consumed: next })
      })

    const remaining = (): Effect.Effect<number> =>
      Ref.get(stateRef).pipe(Effect.map((s) => s.sessionBudget - s.consumed))

    const totalConsumed = (): Effect.Effect<number> =>
      Ref.get(stateRef).pipe(Effect.map((s) => s.consumed))

    const reset = (): Effect.Effect<void> =>
      Ref.update(stateRef, (s) => ({ ...s, consumed: 0 }))

    return {
      initSession,
      consume,
      remaining,
      totalConsumed,
      reset,
    } satisfies TokenBudgetService
  }),
)

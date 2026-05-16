/**
 * @Owl.Tokens.Budget - Runtime token budget enforcement with Effect Ref
 *
 * Tracks token consumption per session. When consumption exceeds the mode-specific
 * budget, operations fail with TokenBudgetExceededError.
 *
 * @example
 * yield* Effect.flatMap(TokenBudget, (b) => b.initSession("deep"))
 * yield* Effect.flatMap(TokenBudget, (b) => b.consume("task-1", 500))
 * const remaining = yield* Effect.flatMap(TokenBudget, (b) => b.remaining())
 */
import { Context, Effect, Layer, Ref } from "effect"
import { TokenBudgetExceededError } from "../../core/errors/index.js"
import {
  TOKEN_LIMITS,
  resolveModeTokenBudget,
} from "../../core/constants/index.js"

/** @Owl.Tokens.Budget.State - Mutable runtime state (private) */
interface BudgetState {
  readonly sessionBudget: number
  readonly consumed: number
  readonly mode: string
}

/**
 * @Owl.Tokens.Budget.Service - Effect service interface
 */
export interface TokenBudgetService {
  /**
   * Initialize session with mode-specific budget
   *
   * @param mode - Operating mode resolved through the budget registry
   * @param budget - Optional override for budget
   */
  readonly initSession: (mode: string, budget?: number) => Effect.Effect<void>
  /**
   * Consume tokens from budget
   *
   * @param taskId - For error reporting
   * @param tokens - Number of tokens to consume
   * @throws TokenBudgetExceededError - If consumption would exceed budget
   */
  readonly consume: (
    taskId: string,
    tokens: number,
  ) => Effect.Effect<void, TokenBudgetExceededError>
  /**
   * Get remaining budget
   */
  readonly remaining: () => Effect.Effect<number>
  /**
   * Get total consumed this session
   */
  readonly totalConsumed: () => Effect.Effect<number>
  /**
   * Reset consumed counter (new session without changing budget)
   */
  readonly reset: () => Effect.Effect<void>
}

export class TokenBudget extends Context.Tag("TokenBudget")<
  TokenBudget,
  TokenBudgetService
>() {}

/**
 * @Owl.Tokens.Budget.Live - Ref-backed session budget with mode-aware limits
 */
export const TokenBudgetLive = Layer.effect(
  TokenBudget,
  Effect.gen(function* () {
    const stateRef = yield* Ref.make<BudgetState>({
      sessionBudget: TOKEN_LIMITS.DEFAULT_SESSION_BUDGET,
      consumed: 0,
      mode: "standard",
    })

    const initSession = (mode: string, budget?: number): Effect.Effect<void> =>
      Ref.set(stateRef, {
        sessionBudget: budget ?? resolveModeTokenBudget(mode),
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

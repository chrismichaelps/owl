import { describe, it, expect } from "vitest"
import { Effect, ConfigProvider, Exit, Cause } from "effect"
import {
  TokenBudget,
  TokenBudgetLive,
} from "../../src/tokens/budget/index.js"
import { TokenBudgetExceededError } from "../../src/core/errors/index.js"

const testLayer = TokenBudgetLive

describe("TokenBudget", () => {
  it("allows consumption under budget", async () => {
    const program = Effect.gen(function* () {
      const budget = yield* TokenBudget
      yield* budget.initSession("standard", 10000)
      yield* budget.consume("t-001", 500)
      return yield* budget.remaining()
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(testLayer)),
    )
    expect(result).toBe(9500)
  })

  it("fails with TokenBudgetExceededError when over budget", async () => {
    const program = Effect.gen(function* () {
      const budget = yield* TokenBudget
      yield* budget.initSession("economy", 2000)
      return yield* budget.consume("t-001", 3000)
    })

    const exit = await Effect.runPromiseExit(
      program.pipe(Effect.provide(testLayer)),
    )
    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const err = Cause.failureOption(exit.cause)
      expect(err._tag).toBe("Some")
      if (err._tag === "Some") {
        expect(err.value._tag).toBe("TokenBudgetExceededError")
      }
    }
  })

  it("tracks total consumed across tasks", async () => {
    const program = Effect.gen(function* () {
      const budget = yield* TokenBudget
      yield* budget.initSession("standard", 50000)
      yield* budget.consume("t-001", 1000)
      yield* budget.consume("t-002", 2000)
      return yield* budget.totalConsumed()
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(testLayer)),
    )
    expect(result).toBe(3000)
  })
})

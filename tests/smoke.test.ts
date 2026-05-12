/** @Owl.Tests.Smoke - System-wide integration smoke tests */
import { describe, it, expect } from "vitest"
import { Effect, Exit } from "effect"

/** @Owl.Tests.Smoke.Bootstrap - Core Effect-TS runtime validation */
describe("bootstrap", () => {
  it("runs an Effect successfully", async () => {
    const program = Effect.succeed(42)
    const result = await Effect.runPromise(program)
    expect(result).toBe(42)
  })

  it("captures tagged errors in Exit", async () => {
    const program = Effect.fail("expected-error" as const)
    const exit = await Effect.runPromiseExit(program)
    expect(Exit.isFailure(exit)).toBe(true)
  })

  it("runs Effect.gen correctly", async () => {
    const program = Effect.gen(function* () {
      const a = yield* Effect.succeed(10)
      const b = yield* Effect.succeed(20)
      return a + b
    })
    const result = await Effect.runPromise(program)
    expect(result).toBe(30)
  })
})

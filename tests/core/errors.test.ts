/** @Owl.Tests.Core.Errors - Core error logic tests */
import { describe, it, expect } from "vitest"
import { Effect, Exit, Cause } from "effect"
import {
  ProviderError,
  ProviderTimeoutError,
  TokenBudgetExceededError,
  GovernanceViolationError,
  ConfigError,
} from "../../src/core/errors/index.js"

/** @Owl.Tests.Core.Errors.Tagged - Structural validation of Effect-TS errors */
describe("tagged errors", () => {
  it("ProviderError is a tagged error", () => {
    const err = new ProviderError({
      provider: "anthropic",
      message: "rate limited",
      statusCode: 429,
    })
    expect(err._tag).toBe("ProviderError")
    expect(err.provider).toBe("anthropic")
  })

  it("ProviderTimeoutError is yieldable in Effect.gen", async () => {
    const program = Effect.gen(function* () {
      return yield* Effect.fail(
        new ProviderTimeoutError({ provider: "openai", timeoutMs: 30000 }),
      )
    })
    const exit = await Effect.runPromiseExit(program)
    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const err = Cause.failureOption(exit.cause)
      expect(err._tag).toBe("Some")
      if (err._tag === "Some") {
        expect(err.value._tag).toBe("ProviderTimeoutError")
      }
    }
  })

  it("TokenBudgetExceededError carries budget metadata", () => {
    const err = new TokenBudgetExceededError({
      budget: 2000,
      actual: 3500,
      mode: "economy",
    })
    expect(err._tag).toBe("TokenBudgetExceededError")
    expect(err.budget).toBe(2000)
    expect(err.actual).toBe(3500)
  })

  it("GovernanceViolationError carries rule metadata", () => {
    const err = new GovernanceViolationError({
      rule: "HASH_FIRST_HARD_LOCK",
      module: "@root/src/providers/anthropic/index.ts",
      detail: "Registry not updated before TLI injection",
    })
    expect(err._tag).toBe("GovernanceViolationError")
    expect(err.rule).toBe("HASH_FIRST_HARD_LOCK")
  })

  it("errors extend Error for stack traces", () => {
    const err = new ConfigError({ key: "ANTHROPIC_API_KEY", reason: "missing" })
    expect(err).toBeInstanceOf(Error)
  })
})

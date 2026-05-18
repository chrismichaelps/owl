/** @Owl.Tests.Commands.Cache - ContextCache management command */
import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { ContextCache, ContextCacheLive } from "../../src/tokens/cache/index.js"
import { makeCacheCommand } from "../../src/commands/management/cache.js"

const run = <A>(effect: Effect.Effect<A, never, ContextCache>) =>
  Effect.runPromise(effect.pipe(Effect.provide(ContextCacheLive)))

describe("makeCacheCommand", () => {
  it("shows saved ContextCache token count", async () => {
    const output = await run(
      Effect.gen(function* () {
        const cache = yield* ContextCache
        yield* cache.store("summary-a", {
          summary: "Reusable summary",
          tokenCount: 120,
          trustScore: 1,
        })
        const command = makeCacheCommand(cache)
        const result = yield* command.execute([])
        return result.output
      }),
    )

    expect(output).toContain("Saved tokens: 120")
  })

  it("clears cached summaries", async () => {
    const output = await run(
      Effect.gen(function* () {
        const cache = yield* ContextCache
        yield* cache.store("summary-a", {
          summary: "Reusable summary",
          tokenCount: 120,
          trustScore: 1,
        })
        const command = makeCacheCommand(cache)
        const clearResult = yield* command.execute(["clear"])
        const savedTokens = yield* cache.totalSavedTokens()
        return { clearResult, savedTokens }
      }),
    )

    expect(output.clearResult.output).toBe("Context cache cleared.")
    expect(output.savedTokens).toBe(0)
  })
})

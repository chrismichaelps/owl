import { describe, it, expect } from "vitest"
import { Effect, Layer } from "effect"
import {
  ContextCache,
  ContextCacheLive,
} from "../../src/tokens/cache/index.js"

describe("ContextCache", () => {
  it("stores and retrieves a summary", async () => {
    const program = Effect.gen(function* () {
      const cache = yield* ContextCache
      yield* cache.store("module-1", {
        summary: "Module handles authentication",
        tokenCount: 150,
        trustScore: 0.9,
      })
      return yield* cache.get("module-1")
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(ContextCacheLive)),
    )
    expect(result?._tag).toBe("Some")
    if (result?._tag === "Some") {
      expect(result.value.summary).toBe("Module handles authentication")
      expect(result.value.trustScore).toBe(0.9)
    }
  })

  it("returns None for unknown keys", async () => {
    const program = Effect.gen(function* () {
      const cache = yield* ContextCache
      return yield* cache.get("nonexistent")
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(ContextCacheLive)),
    )
    expect(result?._tag).toBe("None")
  })

  it("invalidates entries by key", async () => {
    const program = Effect.gen(function* () {
      const cache = yield* ContextCache
      yield* cache.store("module-2", {
        summary: "Old summary",
        tokenCount: 100,
        trustScore: 0.8,
      })
      yield* cache.invalidate("module-2")
      return yield* cache.get("module-2")
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(ContextCacheLive)),
    )
    expect(result?._tag).toBe("None")
  })

  it("reports total saved tokens", async () => {
    const program = Effect.gen(function* () {
      const cache = yield* ContextCache
      yield* cache.store("a", { summary: "A", tokenCount: 500, trustScore: 1.0 })
      yield* cache.store("b", { summary: "B", tokenCount: 300, trustScore: 1.0 })
      return yield* cache.totalSavedTokens()
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(ContextCacheLive)),
    )
    expect(result).toBe(800)
  })
})

import { describe, it, expect } from "vitest"
import { Effect, Cause } from "effect"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { CACHE_CONSTANTS } from "../../src/core/constants/index.js"
import { CacheValidationError } from "../../src/core/errors/index.js"
import {
  ContextCache,
  ContextCacheLive,
  makePersistentContextCacheLive,
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
    expect(result._tag).toBe("Some")
    if (result._tag === "Some") {
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
    expect(result._tag).toBe("None")
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
    expect(result._tag).toBe("None")
  })

  it("reports total saved tokens", async () => {
    const program = Effect.gen(function* () {
      const cache = yield* ContextCache
      yield* cache.store("a", {
        summary: "A",
        tokenCount: 500,
        trustScore: 1.0,
      })
      yield* cache.store("b", {
        summary: "B",
        tokenCount: 300,
        trustScore: 1.0,
      })
      return yield* cache.totalSavedTokens()
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(ContextCacheLive)),
    )
    expect(result).toBe(800)
  })

  it("rejects cache entries with invalid trust scores", async () => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const cache = yield* ContextCache
        yield* cache.store("invalid", {
          summary: "Invalid",
          tokenCount: 100,
          trustScore: CACHE_CONSTANTS.MAX_TRUST_SCORE + 1,
        })
      }).pipe(Effect.provide(ContextCacheLive)),
    )

    expect(exit._tag).toBe("Failure")
    if (exit._tag === "Failure") {
      const failure = Cause.failureOption(exit.cause)
      expect(failure._tag).toBe("Some")
      if (failure._tag === "Some") {
        expect(failure.value).toBeInstanceOf(CacheValidationError)
      }
    }
  })

  it("evicts oldest entries beyond the cache retention bound", async () => {
    const program = Effect.gen(function* () {
      const cache = yield* ContextCache
      for (let i = 0; i <= CACHE_CONSTANTS.MAX_ENTRIES; i += 1) {
        yield* cache.store("entry-" + String(i), {
          summary: "Entry " + String(i),
          tokenCount: i,
          trustScore: CACHE_CONSTANTS.MAX_TRUST_SCORE,
          createdAt: i,
        })
      }
      return {
        oldest: yield* cache.get("entry-0"),
        newest: yield* cache.get("entry-" + String(CACHE_CONSTANTS.MAX_ENTRIES)),
      }
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(ContextCacheLive)),
    )
    expect(result.oldest._tag).toBe("None")
    expect(result.newest._tag).toBe("Some")
  })

  it("persists cache entries across persistent layer re-creation", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "owl-cache-"))
    const storagePath = path.join(dir, "context-cache.json")

    const writeProgram = Effect.gen(function* () {
      const cache = yield* ContextCache
      yield* cache.store("persisted", {
        summary: "Persisted summary",
        tokenCount: 250,
        trustScore: 0.95,
      })
    })

    await Effect.runPromise(
      writeProgram.pipe(
        Effect.provide(makePersistentContextCacheLive(storagePath)),
      ),
    )

    const readProgram = Effect.gen(function* () {
      const cache = yield* ContextCache
      return yield* cache.get("persisted")
    })

    const result = await Effect.runPromise(
      readProgram.pipe(
        Effect.provide(makePersistentContextCacheLive(storagePath)),
      ),
    )

    expect(result._tag).toBe("Some")
    if (result._tag === "Some") {
      expect(result.value.summary).toBe("Persisted summary")
      expect(result.value.tokenCount).toBe(250)
    }
  })
})

/** @Owl.Tests.Core.Config - Core config loader tests */
import { describe, it, expect } from "vitest"
import { Chunk, ConfigProvider, Effect, HashMap, Layer } from "effect"
import { OWL_CONFIG, OWLConfigLive } from "../../src/core/config/index.js"

const configProviderFromEntries = (
  entries: Chunk.Chunk<readonly [string, string]>,
) =>
  Layer.setConfigProvider(
    ConfigProvider.fromMap(
      new Map(HashMap.toEntries(HashMap.fromIterable(entries))),
    ),
  )

/** @Owl.Tests.Core.Config.Resolution - Environment-to-interface mapping tests */
describe("OWL_CONFIG", () => {
  it("reads ANTHROPIC_API_KEY from environment", async () => {
    const configProviderLayer = configProviderFromEntries(
      Chunk.make(
        ["ANTHROPIC_API_KEY", "sk-ant-test-key"],
        ["OWL_MODE", "standard"],
        ["OWL_LOG_LEVEL", "info"],
      ),
    )

    const program = Effect.gen(function* () {
      const config = yield* OWL_CONFIG
      return config.anthropicApiKey
    })

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(OWLConfigLive),
        Effect.provide(configProviderLayer),
      ),
    )
    expect(result).toBe("sk-ant-test-key")
  })

  it("uses defaults when optional vars are absent", async () => {
    const configProviderLayer = configProviderFromEntries(Chunk.empty())

    const program = Effect.gen(function* () {
      const config = yield* OWL_CONFIG
      return { mode: config.defaultMode, logLevel: config.logLevel }
    })

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(OWLConfigLive),
        Effect.provide(configProviderLayer),
      ),
    )
    expect(result.mode).toBe("standard")
    expect(result.logLevel).toBe("info")
  })

  it("allows startup when ANTHROPIC_API_KEY is absent", async () => {
    const configProviderLayer = configProviderFromEntries(Chunk.empty())

    const program = Effect.gen(function* () {
      const config = yield* OWL_CONFIG
      return config.anthropicApiKey
    })

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(OWLConfigLive),
        Effect.provide(configProviderLayer),
      ),
    )
    expect(result).toBeUndefined()
  })
})

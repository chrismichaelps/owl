/** @Owl.Tests.Core.Config - Core config loader tests */
import { describe, it, expect } from "vitest"
import { Effect, ConfigProvider, Layer } from "effect"
import { OWL_CONFIG, OWLConfigLive } from "../../src/core/config/index.js"

/** @Owl.Tests.Core.Config.Resolution - Environment-to-interface mapping tests */
describe("OWL_CONFIG", () => {
  it("reads ANTHROPIC_API_KEY from environment", async () => {
    const configProviderLayer = Layer.setConfigProvider(
      ConfigProvider.fromMap(
        new Map([
          ["ANTHROPIC_API_KEY", "sk-ant-test-key"],
          ["OWL_MODE", "standard"],
          ["OWL_LOG_LEVEL", "info"],
        ]),
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
    const configProviderLayer = Layer.setConfigProvider(
      ConfigProvider.fromMap(new Map([["ANTHROPIC_API_KEY", "sk-ant-test"]])),
    )

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
})

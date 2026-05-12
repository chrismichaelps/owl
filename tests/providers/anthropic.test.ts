import { describe, it, expect } from "vitest"
import { Effect, Layer, ConfigProvider } from "effect"
import {
  AnthropicAdapter,
  AnthropicAdapterLive,
} from "../../src/providers/anthropic/index.js"
import { OWLConfigLive } from "../../src/core/config/index.js"

describe("AnthropicAdapter", () => {
  it("exposes anthropic capabilities", async () => {
    const configLayer = Layer.setConfigProvider(
      ConfigProvider.fromMap(new Map([["ANTHROPIC_API_KEY", "sk-ant-test"]])),
    )

    const program = Effect.gen(function* () {
      const adapter = yield* AnthropicAdapter
      return adapter.capabilities.map((c) => c.modelId)
    })

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(AnthropicAdapterLive),
        Effect.provide(OWLConfigLive),
        Effect.provide(configLayer),
      ),
    )

    expect(result).toContain("claude-opus-4-7")
    expect(result).toContain("claude-sonnet-4-6")
    expect(result).toContain("claude-haiku-4-5-20251001")
  })

  it("adapter id is anthropic", async () => {
    const configLayer = Layer.setConfigProvider(
      ConfigProvider.fromMap(new Map([["ANTHROPIC_API_KEY", "sk-ant-test"]])),
    )

    const program = Effect.gen(function* () {
      const adapter = yield* AnthropicAdapter
      return adapter.id
    })

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(AnthropicAdapterLive),
        Effect.provide(OWLConfigLive),
        Effect.provide(configLayer),
      ),
    )
    expect(result).toBe("anthropic")
  })
})

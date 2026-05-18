/** @Owl.Tests.Providers.Bootstrap - Provider startup registration tests */
import { Chunk, ConfigProvider, Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { OWLConfigLive } from "../../src/core/config/index.js"
import {
  ProviderBootstrap,
  ProviderBootstrapLive,
} from "../../src/providers/bootstrap.js"
import {
  ProviderRouter,
  ProviderRouterLive,
} from "../../src/providers/router/index.js"
import { AnthropicAdapterLive } from "../../src/providers/anthropic/index.js"
import { GoogleAdapterLive } from "../../src/providers/google/index.js"
import { OllamaAdapterLive } from "../../src/providers/ollama/index.js"
import { OpenAIAdapterLive } from "../../src/providers/openai/index.js"
import { XAIAdapterLive } from "../../src/providers/xai/index.js"

const emptyConfigProviderLayer = Layer.setConfigProvider(
  ConfigProvider.fromMap(new Map()),
)

const configLayer = OWLConfigLive.pipe(Layer.provide(emptyConfigProviderLayer))

const adapterLayer = Layer.mergeAll(
  AnthropicAdapterLive,
  OpenAIAdapterLive,
  GoogleAdapterLive,
  XAIAdapterLive,
  OllamaAdapterLive,
).pipe(Layer.provide(configLayer))

const providerLayer = Layer.mergeAll(
  configLayer,
  ProviderRouterLive,
  adapterLayer,
)

const liveLayer = ProviderBootstrapLive.pipe(Layer.provide(providerLayer))

describe("ProviderBootstrapLive", () => {
  it("starts without ANTHROPIC_API_KEY and registers local providers", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const bootstrap = yield* ProviderBootstrap
        const router = yield* ProviderRouter
        const providers = yield* router.listProviders()
        return { bootstrap, providers }
      }).pipe(Effect.provide(Layer.merge(providerLayer, liveLayer))),
    )

    expect(Chunk.toReadonlyArray(result.bootstrap.registeredProviders)).toEqual(
      ["ollama"],
    )
    expect(Chunk.toReadonlyArray(result.providers)).toEqual(["ollama"])
  })
})

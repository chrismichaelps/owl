/**
 * @Owl.Providers.Bootstrap - Provider registration layer
 *
 * Centralizes Provider adapter registration so the runtime starts with a
 * populated ProviderRouter before any Inference reaches the Orchestrator.
 */
import { Context, Effect, Layer } from "effect"
import { OWL_CONFIG } from "../core/config/index.js"
import { AnthropicAdapter } from "./anthropic/index.js"
import { GoogleAdapter } from "./google/index.js"
import { OllamaAdapter } from "./ollama/index.js"
import { OpenAIAdapter } from "./openai/index.js"
import { ProviderRouter, registerProvider } from "./router/index.js"
import { XAIAdapter } from "./xai/index.js"
import type { LLMProviderService } from "./types.js"
import type { ProviderRouterService } from "./router/index.js"

/** @Owl.Providers.Bootstrap.Service - Startup registration evidence */
export interface ProviderBootstrapService {
  readonly registeredProviders: readonly string[]
}

/** @Owl.Providers.Bootstrap.Tag - Marker service for Provider initialization */
export class ProviderBootstrap extends Context.Tag("ProviderBootstrap")<
  ProviderBootstrap,
  ProviderBootstrapService
>() {}

const register = (
  router: ProviderRouterService,
  provider: LLMProviderService,
): Effect.Effect<string> =>
  registerProvider(router, provider).pipe(Effect.as(provider.id))

/** @Owl.Providers.Bootstrap.Live - Runtime Provider registration */
export const ProviderBootstrapLive = Layer.effect(
  ProviderBootstrap,
  Effect.gen(function* () {
    const router = yield* ProviderRouter
    const config = yield* OWL_CONFIG
    const anthropic = yield* AnthropicAdapter
    const openai = yield* OpenAIAdapter
    const google = yield* GoogleAdapter
    const xai = yield* XAIAdapter
    const ollama = yield* OllamaAdapter

    const registeredProviders: string[] = [yield* register(router, anthropic)]

    if (config.openaiApiKey !== undefined) {
      registeredProviders.push(yield* register(router, openai))
    }
    if (config.googleApiKey !== undefined) {
      registeredProviders.push(yield* register(router, google))
    }
    if (config.xaiApiKey !== undefined) {
      registeredProviders.push(yield* register(router, xai))
    }

    registeredProviders.push(yield* register(router, ollama))

    return { registeredProviders } satisfies ProviderBootstrapService
  }),
)

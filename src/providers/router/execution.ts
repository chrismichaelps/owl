/** @Owl.Providers.Router.Execution - Provider request execution helpers */
import { Chunk, Either, Effect, HashMap, Option, Ref } from "effect"
import * as Stream from "effect/Stream"
import { ProviderUnavailableError } from "../../core/errors/index.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"
import { estimateCapabilityCostUsd } from "../cost.js"
import type {
  AnyProviderError,
  LLMProviderService,
  ProviderCapability,
  RoutingContext,
  StreamingCallbackResult,
} from "../types.js"
import { emptyStreamAccumulator, handleStreamChunk } from "./streaming.js"
import { makeNoProviderError } from "./selection.js"

export type ProviderRegistry = HashMap.HashMap<string, LLMProviderService>

export const missingProvider = (providerId: string): ProviderUnavailableError =>
  new ProviderUnavailableError({
    provider: providerId,
    reason: "Provider registered in routing but not in registry",
  })

export const failLast = <E>(
  error: E | undefined,
  ctx: RoutingContext,
): Effect.Effect<never, E | ProviderUnavailableError> =>
  error === undefined
    ? Effect.fail(
        makeNoProviderError(ctx, "No provider attempts were available"),
      )
    : Effect.fail(error)

const withEstimatedCost = (
  capability: ProviderCapability,
  response: InferenceResponse,
): InferenceResponse => ({
  ...response,
  usage: {
    ...response.usage,
    estimatedCostUsd: estimateCapabilityCostUsd(
      capability,
      response.usage.inputTokens,
      response.usage.outputTokens,
    ),
  },
})

export const completeFromRankedProviders = (
  ranked: Chunk.Chunk<ProviderCapability>,
  registry: ProviderRegistry,
  request: Omit<InferenceRequest, "model">,
  ctx: RoutingContext,
): Effect.Effect<
  InferenceResponse,
  AnyProviderError | ProviderUnavailableError
> =>
  Effect.gen(function* () {
    let lastError: AnyProviderError | ProviderUnavailableError | undefined =
      undefined

    for (const capability of ranked) {
      const provider = Option.getOrUndefined(
        HashMap.get(registry, capability.providerId),
      )

      if (provider === undefined) {
        lastError = missingProvider(capability.providerId)
        continue
      }

      const result = yield* provider
        .complete({
          ...request,
          model: capability.modelId,
        })
        .pipe(Effect.either)

      if (Either.isRight(result)) {
        return withEstimatedCost(capability, result.right)
      }

      lastError = result.left
    }

    return yield* failLast(lastError, ctx)
  })

export const streamFromRankedProviders = (
  ranked: Chunk.Chunk<ProviderCapability>,
  registry: ProviderRegistry,
  request: Omit<InferenceRequest, "model">,
  ctx: RoutingContext,
  onChunk: (text: string) => void,
  onLog?: (msg: string) => void,
): Effect.Effect<
  StreamingCallbackResult,
  AnyProviderError | ProviderUnavailableError
> =>
  Effect.gen(function* () {
    const startMs = Date.now()
    let lastError: AnyProviderError | ProviderUnavailableError | undefined =
      undefined

    for (const capability of ranked) {
      const provider = Option.getOrUndefined(
        HashMap.get(registry, capability.providerId),
      )

      if (provider === undefined) {
        lastError = missingProvider(capability.providerId)
        continue
      }

      const accumulatorRef = yield* Ref.make(emptyStreamAccumulator())
      const result = yield* provider
        .stream({ ...request, model: capability.modelId })
        .pipe(
          Stream.mapChunks((streamChunks) => streamChunks),
          Stream.runForEachChunk((streamChunks) =>
            Effect.forEach(
              streamChunks,
              (chunk) =>
                handleStreamChunk(
                  capability.providerId,
                  chunk,
                  accumulatorRef,
                  onChunk,
                  onLog,
                ),
              { discard: true },
            ),
          ),
          Effect.either,
        )

      if (Either.isRight(result)) {
        const accumulator = yield* Ref.get(accumulatorRef)
        const content = Chunk.toReadonlyArray(accumulator.contentChunks).join(
          "",
        )
        return {
          content,
          provider: capability.providerId,
          model: capability.modelId,
          latencyMs: Date.now() - startMs,
          inputTokens: accumulator.usage.inputTokens,
          outputTokens: accumulator.usage.outputTokens,
          cacheReadTokens: accumulator.usage.cacheReadTokens,
          cacheWriteTokens: accumulator.usage.cacheWriteTokens,
          estimatedCostUsd: estimateCapabilityCostUsd(
            capability,
            accumulator.usage.inputTokens,
            accumulator.usage.outputTokens,
          ),
        } satisfies StreamingCallbackResult
      }

      lastError = result.left
      const failedAccumulator = yield* Ref.get(accumulatorRef)
      if (failedAccumulator.emittedChunkCount > 0) {
        return yield* Effect.fail(result.left)
      }
    }

    return yield* failLast(lastError, ctx)
  })

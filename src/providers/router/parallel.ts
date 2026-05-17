import { Chunk, Effect, Either, HashMap, Option } from "effect"
import { ROUTING_LIMITS } from "../../core/constants/index.js"
import type { ProviderUnavailableError } from "../../core/errors/index.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"
import { estimateCapabilityCostUsd } from "../cost.js"
import type {
  AnyProviderError,
  LLMProviderService,
  ProviderCapability,
} from "../types.js"
import type { ProviderAttemptRecorder } from "./execution.js"

export type ParallelAttempt = Either.Either<
  InferenceResponse,
  AnyProviderError | ProviderUnavailableError
>

/** @Owl.Providers.Router.ParallelLimit - Bound fanout concurrency */
export const resolveParallelProviderLimit = (maxProviders: number): number =>
  Math.max(
    ROUTING_LIMITS.MIN_PARALLEL_PROVIDER_LIMIT,
    Math.min(maxProviders, ROUTING_LIMITS.PARALLEL_PROVIDER_LIMIT),
  )

/** @Owl.Providers.Router.ParallelAttempt - Run one provider attempt */
export const attemptParallelComplete = (
  registry: HashMap.HashMap<string, LLMProviderService>,
  capability: ProviderCapability,
  request: Omit<InferenceRequest, "model">,
  missingProvider: (providerId: string) => ProviderUnavailableError,
  recorder?: ProviderAttemptRecorder,
): Effect.Effect<ParallelAttempt> => {
  const provider = Option.getOrUndefined(
    HashMap.get(registry, capability.providerId),
  )

  if (provider === undefined) {
    const error = missingProvider(capability.providerId)
    return (recorder?.onFailure(capability.providerId) ?? Effect.void).pipe(
      Effect.as(Either.left(error)),
    )
  }

  return provider.complete({ ...request, model: capability.modelId }).pipe(
    Effect.map((response) => ({
      ...response,
      usage: {
        ...response.usage,
        estimatedCostUsd: estimateCapabilityCostUsd(
          capability,
          response.usage.inputTokens,
          response.usage.outputTokens,
        ),
      },
    })),
    Effect.either,
    Effect.tap((result) =>
      Either.isRight(result)
        ? (recorder?.onSuccess(capability.providerId) ?? Effect.void)
        : (recorder?.onFailure(capability.providerId) ?? Effect.void),
    ),
  )
}

/** @Owl.Providers.Router.ParallelSuccesses - Keep successful attempts */
export const collectParallelSuccesses = (
  results: readonly ParallelAttempt[],
): Chunk.Chunk<InferenceResponse> =>
  Chunk.filterMap(Chunk.fromIterable(results), (result) =>
    Either.isRight(result) ? Option.some(result.right) : Option.none(),
  )

/** @Owl.Providers.Router.ParallelError - Extract final failed attempt */
export const lastParallelError = (
  results: readonly ParallelAttempt[],
): AnyProviderError | ProviderUnavailableError | undefined =>
  Chunk.reduce(
    Chunk.fromIterable(results),
    undefined as AnyProviderError | ProviderUnavailableError | undefined,
    (_current, result) => (Either.isLeft(result) ? result.left : undefined),
  )

import { Chunk } from "effect"
import { ORCHESTRATOR_CONSTANTS } from "../../core/constants/index.js"
import type { InferenceResponse } from "../../core/schema/index.js"
import type { Option } from "effect"

/** @Owl.Engine.Orchestrator.ParallelContent - Format comparison context */
export const formatParallelContent = (
  responses: Chunk.Chunk<InferenceResponse>,
): string =>
  Chunk.toReadonlyArray(
    Chunk.map(
      responses,
      (response) =>
        "[" +
        response.provider +
        "/" +
        response.model +
        "]\n" +
        response.content,
    ),
  ).join(ORCHESTRATOR_CONSTANTS.PARALLEL_RESPONSE_SEPARATOR)

/** @Owl.Engine.Orchestrator.ParallelTokens - Sum output token usage */
export const sumParallelOutputTokens = (
  responses: Chunk.Chunk<InferenceResponse>,
): number =>
  Chunk.reduce(
    responses,
    0,
    (total, response) => total + response.usage.outputTokens,
  )

/** @Owl.Engine.Orchestrator.ParallelCost - Sum estimated provider costs */
export const sumParallelCostUsd = (
  responses: Chunk.Chunk<InferenceResponse>,
): number =>
  Chunk.reduce(
    responses,
    0,
    (total, response) => total + response.usage.estimatedCostUsd,
  )

/** @Owl.Engine.Orchestrator.ParallelLatency - Max parallel latency */
export const maxParallelLatencyMs = (
  responses: Chunk.Chunk<InferenceResponse>,
): number =>
  Chunk.reduce(responses, 0, (maxLatency, response) =>
    Math.max(maxLatency, response.latencyMs),
  )

/** @Owl.Engine.Orchestrator.ParallelFirst - First ranked response */
export const firstParallelResponse = (
  responses: Chunk.Chunk<InferenceResponse>,
): Option.Option<InferenceResponse> => Chunk.head(responses)

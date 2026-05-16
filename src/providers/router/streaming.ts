/** @Owl.Providers.Router.Streaming - Streaming callback accumulation helpers */
import { Chunk, Data, Effect, Ref } from "effect"
import {
  PROVIDER_STREAM_LOG,
  STREAM_CHUNK_TYPES,
} from "../../core/constants/index.js"
import { ProviderStreamError } from "../../core/errors/index.js"
import type { StreamChunk } from "../types.js"

type StreamUsageAccumulator = Readonly<{
  readonly inputTokens: number
  readonly outputTokens: number
  readonly cacheReadTokens: number
  readonly cacheWriteTokens: number
  readonly estimatedCostUsd: number
}>

export type StreamAccumulator = Readonly<{
  readonly contentChunks: Chunk.Chunk<string>
  readonly emittedChunkCount: number
  readonly usage: StreamUsageAccumulator
}>

const emptyStreamUsage = (): StreamUsageAccumulator =>
  Data.struct({
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    estimatedCostUsd: 0,
  })

/** @Owl.Providers.Router.StreamAccumulator - Empty stream state */
export const emptyStreamAccumulator = (): StreamAccumulator =>
  Data.struct({
    contentChunks: Chunk.empty<string>(),
    emittedChunkCount: 0,
    usage: emptyStreamUsage(),
  })

const appendTextChunk = (
  state: StreamAccumulator,
  content: string,
): StreamAccumulator =>
  Data.struct({
    ...state,
    contentChunks: Chunk.append(state.contentChunks, content),
    emittedChunkCount: state.emittedChunkCount + 1,
  })

const recordUsage = (
  state: StreamAccumulator,
  usage: NonNullable<StreamChunk["usage"]>,
): StreamAccumulator =>
  Data.struct({
    ...state,
    usage: Data.struct({
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cacheReadTokens: usage.cacheReadTokens,
      cacheWriteTokens: usage.cacheWriteTokens,
      estimatedCostUsd: usage.estimatedCostUsd,
    }),
  })

const runStreamCallback = (
  provider: string,
  callback: () => void,
): Effect.Effect<void, ProviderStreamError> =>
  Effect.try({
    try: callback,
    catch: (cause) => new ProviderStreamError({ provider, cause }),
  })

/** @Owl.Providers.Router.StreamLog - Formats non-text stream events for TUI logs */
export function formatStreamEventLog(chunk: StreamChunk): string | null {
  if (chunk.content == null) {
    return null
  }

  const preview =
    chunk.content.length > PROVIDER_STREAM_LOG.PREVIEW_CHARS
      ? chunk.content.slice(0, PROVIDER_STREAM_LOG.PREVIEW_CHARS) + "…"
      : chunk.content

  if (chunk.type === STREAM_CHUNK_TYPES.THINKING) {
    return PROVIDER_STREAM_LOG.THINKING_PREFIX + ": " + preview
  }

  if (chunk.type === STREAM_CHUNK_TYPES.TOOL_USE) {
    return PROVIDER_STREAM_LOG.TOOL_PREFIX + ": " + preview
  }

  return null
}

/** @Owl.Providers.Router.StreamChunk - Accumulate and dispatch stream chunks */
export const handleStreamChunk = (
  provider: string,
  chunk: StreamChunk,
  accumulatorRef: Ref.Ref<StreamAccumulator>,
  onChunk: (text: string) => void,
  onLog?: (msg: string) => void,
): Effect.Effect<void, ProviderStreamError> => {
  if (chunk.type === STREAM_CHUNK_TYPES.TEXT && chunk.content != null) {
    const content = chunk.content
    return Ref.update(accumulatorRef, (state) =>
      appendTextChunk(state, content),
    ).pipe(
      Effect.flatMap(() =>
        runStreamCallback(provider, () => {
          onChunk(content)
        }),
      ),
    )
  }

  if (chunk.type === STREAM_CHUNK_TYPES.USAGE && chunk.usage != null) {
    const usage = chunk.usage
    return Ref.update(accumulatorRef, (state) => recordUsage(state, usage))
  }

  if (onLog == null) {
    return Effect.void
  }

  const logMessage = formatStreamEventLog(chunk)
  return logMessage === null
    ? Effect.void
    : runStreamCallback(provider, () => {
        onLog(logMessage)
      })
}

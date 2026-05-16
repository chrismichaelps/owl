/** @Owl.Providers.Ollama.Stream - Local streaming response reader */
import { Chunk, Data } from "effect"
import * as Stream from "effect/Stream"
import { PROVIDER_CONSTANTS, STREAM_CHUNK_TYPES } from "../../core/constants/index.js"
import { estimateModelCostUsd } from "../cost.js"
import {
  buildPrompt,
  estimateTextTokens,
  ollamaGenerateUrl,
  OLLAMA_CAPABILITIES,
  parseStreamLine,
  providerStreamError,
} from "./runtime.js"
import type { InferenceRequest } from "../../core/schema/index.js"
import type { StreamChunk } from "../types.js"
import type { ProviderStreamError } from "../../core/errors/index.js"

const makeStreamRequest = (
  request: InferenceRequest,
  prompt: string,
): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: request.model,
    prompt,
    stream: true,
  }),
})

/** @Owl.Providers.Ollama.StreamFactory - Create stream from local Ollama */
export const makeOllamaStream =
  (baseUrl: string) =>
  (request: InferenceRequest): Stream.Stream<StreamChunk, ProviderStreamError> =>
    Stream.async<StreamChunk, ProviderStreamError>((emit) => {
      const run = async () => {
        try {
          const prompt = buildPrompt(request)
          const response = await fetch(
            ollamaGenerateUrl(baseUrl),
            makeStreamRequest(request, prompt),
          )
          if (!response.ok) {
            await emit.fail(
              providerStreamError("Ollama stream error: " + response.statusText),
            )
            return
          }
          if (response.body === null) {
            await emit.fail(
              providerStreamError(
                PROVIDER_CONSTANTS.OLLAMA_EMPTY_STREAM_BODY_MESSAGE,
              ),
            )
            return
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let chunks = Chunk.empty<string>()
          let buffer = ""
          let index = 0

          const emitLine = async (line: string): Promise<void> => {
            const trimmed = line.trim()
            if (trimmed.length === 0) return

            const event = parseStreamLine(trimmed)
            if (event.response !== undefined && event.response.length > 0) {
              chunks = Chunk.append(chunks, event.response)
              await emit.single({
                type: STREAM_CHUNK_TYPES.TEXT,
                content: event.response,
                index: index++,
              })
            }
          }

          let streamDone = false
          while (!streamDone) {
            const read = await reader.read()
            streamDone = read.done
            buffer += decoder.decode(read.value, { stream: !read.done })
            const lines = buffer.split(
              PROVIDER_CONSTANTS.OLLAMA_STREAM_DELIMITER,
            )
            buffer = lines.at(-1) ?? ""
            const completedLines = lines.slice(0, -1)

            for (const line of completedLines) {
              await emitLine(line)
            }
          }

          await emitLine(buffer)
          const content = Chunk.toReadonlyArray(chunks).join("")
          const inputTokens = estimateTextTokens(prompt)
          const outputTokens = estimateTextTokens(content)
          await emit.single({
            type: STREAM_CHUNK_TYPES.USAGE,
            index,
            usage: Data.struct({
              inputTokens,
              outputTokens,
              cacheReadTokens: 0,
              cacheWriteTokens: 0,
              estimatedCostUsd: estimateModelCostUsd(
                OLLAMA_CAPABILITIES,
                request.model,
                inputTokens,
                outputTokens,
              ),
            }),
          })
          await emit.end()
        } catch (cause) {
          await emit.fail(providerStreamError(cause))
        }
      }

      void run()
    })

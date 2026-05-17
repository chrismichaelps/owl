/** @Owl.Providers.OpenAI.Stream - OpenAI streaming response adapter */
import { Data } from "effect"
import * as Stream from "effect/Stream"
import { STREAM_CHUNK_TYPES } from "../../core/constants/index.js"
import { ProviderStreamError } from "../../core/errors/index.js"
import { estimateModelCostUsd } from "../cost.js"
import { buildMessages, OPENAI_CAPABILITIES } from "./runtime.js"
import type OpenAI from "openai"
import type { InferenceRequest } from "../../core/schema/index.js"
import type { StreamChunk } from "../types.js"

/** @Owl.Providers.OpenAI.StreamFactory - Create OpenAI stream function */
export const makeOpenAIStream =
  (client: OpenAI) =>
  (
    request: InferenceRequest,
  ): Stream.Stream<StreamChunk, ProviderStreamError> =>
    Stream.async<StreamChunk, ProviderStreamError>((emit) => {
      const run = async () => {
        try {
          const stream = await client.chat.completions.create({
            model: request.model,
            max_completion_tokens: request.maxTokens,
            messages: buildMessages(request),
            stream: true,
            stream_options: { include_usage: true },
          })
          let index = 0
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta.content
            if (content) {
              await emit.single({
                type: STREAM_CHUNK_TYPES.TEXT,
                content,
                index: index++,
              })
            }
            if (chunk.usage != null) {
              const inputTokens = chunk.usage.prompt_tokens
              const outputTokens = chunk.usage.completion_tokens
              await emit.single({
                type: STREAM_CHUNK_TYPES.USAGE,
                index,
                usage: Data.struct({
                  inputTokens,
                  outputTokens,
                  cacheReadTokens: 0,
                  cacheWriteTokens: 0,
                  estimatedCostUsd: estimateModelCostUsd(
                    OPENAI_CAPABILITIES,
                    request.model,
                    inputTokens,
                    outputTokens,
                  ),
                }),
              })
            }
          }
          await emit.end()
        } catch (cause) {
          await emit.fail(
            new ProviderStreamError({ provider: "openai", cause }),
          )
        }
      }

      void run()
    })

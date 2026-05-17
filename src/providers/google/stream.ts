/** @Owl.Providers.Google.Stream - Gemini streaming response adapter */
import { Chunk } from "effect"
import * as Stream from "effect/Stream"
import { STREAM_CHUNK_TYPES } from "../../core/constants/index.js"
import { ProviderStreamError } from "../../core/errors/index.js"
import { buildPrompt, makeModelParams, usageFromResponse } from "./runtime.js"
import type { GoogleGenerativeAI } from "@google/generative-ai"
import type { InferenceRequest } from "../../core/schema/index.js"
import type { StreamChunk } from "../types.js"

/** @Owl.Providers.Google.StreamFactory - Create Gemini stream function */
export const makeGoogleStream =
  (genAI: GoogleGenerativeAI) =>
  (
    request: InferenceRequest,
  ): Stream.Stream<StreamChunk, ProviderStreamError> =>
    Stream.async<StreamChunk, ProviderStreamError>((emit) => {
      const run = async () => {
        try {
          const model = genAI.getGenerativeModel(makeModelParams(request))
          const prompt = buildPrompt(request)
          const result = await model.generateContentStream(prompt)
          let chunks = Chunk.empty<string>()
          let index = 0

          for await (const chunk of result.stream) {
            const content = chunk.text()
            if (content.length > 0) {
              chunks = Chunk.append(chunks, content)
              await emit.single({
                type: STREAM_CHUNK_TYPES.TEXT,
                content,
                index: index++,
              })
            }
          }

          const aggregated = await result.response
          const content = Chunk.toReadonlyArray(chunks).join("")
          await emit.single({
            type: STREAM_CHUNK_TYPES.USAGE,
            index,
            usage: usageFromResponse(request, prompt, content, aggregated),
          })
          await emit.end()
        } catch (cause) {
          await emit.fail(
            new ProviderStreamError({ provider: "google", cause }),
          )
        }
      }

      void run()
    })

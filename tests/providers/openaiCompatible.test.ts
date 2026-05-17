/** @Owl.Tests.Providers.OpenAICompatible - Shared response schema tests */
import { describe, expect, it } from "vitest"
import {
  decodeOpenAICompatibleChatCompletion,
  decodeOpenAICompatibleStreamChunk,
} from "../../src/providers/openaiCompatible/schema.js"

describe("OpenAI-compatible schemas", () => {
  it("validates chat completion responses with nullable content", () => {
    const decoded = decodeOpenAICompatibleChatCompletion({
      choices: [{ message: { content: null } }],
      usage: { prompt_tokens: 10, completion_tokens: 2 },
      model: "model-id",
    })

    expect(decoded.choices[0]?.message.content).toBeNull()
    expect(decoded.usage?.prompt_tokens).toBe(10)
  })

  it("validates streaming usage chunks", () => {
    const decoded = decodeOpenAICompatibleStreamChunk({
      choices: [],
      usage: { prompt_tokens: 10, completion_tokens: 3 },
    })

    expect(decoded.usage?.completion_tokens).toBe(3)
  })

  it("rejects malformed provider responses", () => {
    expect(() =>
      decodeOpenAICompatibleChatCompletion({
        choices: [{ message: { content: "ok" } }],
        usage: { prompt_tokens: "10", completion_tokens: 2 },
        model: "model-id",
      }),
    ).toThrow()
  })
})

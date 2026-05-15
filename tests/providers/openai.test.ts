/** @Owl.Tests.Providers.OpenAI - OpenAI provider adapter tests */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ConfigProvider, Effect, Layer } from "effect"
import * as Stream from "effect/Stream"
import {
  OpenAIAdapter,
  OpenAIAdapterLive,
} from "../../src/providers/openai/index.js"
import { OWLConfigLive } from "../../src/core/config/index.js"
import type { InferenceRequest } from "../../src/core/schema/index.js"
import type { StreamChunk } from "../../src/providers/types.js"

const mockCreate = vi.fn()

interface OpenAIMessageParam {
  readonly role: string
  readonly content: string
}

interface OpenAICreateParams {
  readonly model: string
  readonly max_tokens: number
  readonly messages: readonly OpenAIMessageParam[]
  readonly stream?: boolean
  readonly stream_options?: {
    readonly include_usage?: boolean
  }
}

interface OpenAIStreamChunk {
  readonly choices: readonly {
    readonly delta: {
      readonly content?: string
    }
  }[]
  readonly usage?: {
    readonly prompt_tokens: number
    readonly completion_tokens: number
  } | null
}

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  })),
}))

const makeRequest = (
  overrides: Partial<InferenceRequest> = {},
): InferenceRequest => ({
  taskId: "openai-task",
  messages: [
    {
      role: "user",
      content: "hello",
      timestamp: "2026-05-15T00:00:00.000Z",
    },
  ],
  model: "gpt-4o",
  maxTokens: 256,
  stream: false,
  ...overrides,
})

const makeLayer = () => {
  const configLayer = Layer.setConfigProvider(
    ConfigProvider.fromMap(
      new Map([
        ["ANTHROPIC_API_KEY", "sk-ant-test"],
        ["OPENAI_API_KEY", "sk-openai-test"],
      ]),
    ),
  )
  return OpenAIAdapterLive.pipe(
    Layer.provide(OWLConfigLive),
    Layer.provide(configLayer),
  )
}

async function* makeStream(
  chunks: readonly OpenAIStreamChunk[],
): AsyncGenerator<OpenAIStreamChunk> {
  for (const chunk of chunks) {
    await Promise.resolve()
    yield chunk
  }
}

const getCreateCallArg = (index: number): OpenAICreateParams =>
  mockCreate.mock.calls[index]?.[0] as OpenAICreateParams

beforeEach(() => {
  mockCreate.mockReset()
})

describe("OpenAIAdapter", () => {
  it("stream() includes the system prompt and requests usage", async () => {
    mockCreate.mockResolvedValueOnce(
      makeStream([
        {
          choices: [{ delta: { content: "hi" } }],
        },
      ]),
    )

    await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* OpenAIAdapter
        yield* Stream.runForEach(
          adapter.stream(
            makeRequest({
              stream: true,
              systemPrompt: "You are Owl.",
            }),
          ),
          () => Effect.void,
        )
      }).pipe(Effect.provide(makeLayer())),
    )

    const callArg = getCreateCallArg(0)
    expect(callArg.stream).toBe(true)
    expect(callArg.stream_options).toEqual({ include_usage: true })
    expect(callArg.messages[0]).toEqual({
      role: "system",
      content: "You are Owl.",
    })
  })

  it("stream() emits text chunks and final usage", async () => {
    mockCreate.mockResolvedValueOnce(
      makeStream([
        {
          choices: [{ delta: { content: "Hello " } }],
        },
        {
          choices: [{ delta: { content: "world" } }],
        },
        {
          choices: [],
          usage: { prompt_tokens: 100, completion_tokens: 25 },
        },
      ]),
    )

    const chunks = await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* OpenAIAdapter
        const emitted: StreamChunk[] = []
        yield* Stream.runForEach(
          adapter.stream(makeRequest({ stream: true })),
          (chunk) => Effect.sync(() => emitted.push(chunk)),
        )
        return emitted
      }).pipe(Effect.provide(makeLayer())),
    )

    expect(chunks.filter((chunk) => chunk.type === "text")).toEqual([
      { type: "text", content: "Hello ", index: 0 },
      { type: "text", content: "world", index: 1 },
    ])
    expect(chunks.at(-1)).toEqual({
      type: "usage",
      index: 2,
      usage: {
        inputTokens: 100,
        outputTokens: 25,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        estimatedCostUsd: 0.0005,
      },
    })
  })
})

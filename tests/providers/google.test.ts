/** @Owl.Tests.Providers.Google - Google Gemini provider adapter tests */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ConfigProvider, Effect, Layer } from "effect"
import * as Stream from "effect/Stream"
import { OWLConfigLive } from "../../src/core/config/index.js"
import {
  GoogleAdapter,
  GoogleAdapterLive,
} from "../../src/providers/google/index.js"
import type { InferenceRequest } from "../../src/core/schema/index.js"
import type { StreamChunk } from "../../src/providers/types.js"

const mockGenerateContent = vi.fn()
const mockGenerateContentStream = vi.fn()
const mockGetGenerativeModel = vi.fn()

interface GoogleModelParams {
  readonly model: string
  readonly generationConfig?: {
    readonly maxOutputTokens?: number
  }
  readonly systemInstruction?: string
}

interface GoogleResponseLike {
  readonly text: () => string
  readonly usageMetadata?: {
    readonly promptTokenCount?: number
    readonly candidatesTokenCount?: number
  }
}

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}))

const makeRequest = (
  overrides: Partial<InferenceRequest> = {},
): InferenceRequest => ({
  taskId: "google-task",
  messages: [
    {
      role: "user",
      content: "hello",
      timestamp: "2026-05-15T00:00:00.000Z",
    },
  ],
  model: "gemini-2.5-flash",
  maxTokens: 256,
  stream: false,
  ...overrides,
})

const makeLayer = () => {
  const configLayer = Layer.setConfigProvider(
    ConfigProvider.fromMap(
      new Map([
        ["ANTHROPIC_API_KEY", "sk-ant-test"],
        ["GOOGLE_API_KEY", "google-test-key"],
      ]),
    ),
  )
  return GoogleAdapterLive.pipe(
    Layer.provide(OWLConfigLive),
    Layer.provide(configLayer),
  )
}

async function* makeStream(
  chunks: readonly GoogleResponseLike[],
): AsyncGenerator<GoogleResponseLike> {
  for (const chunk of chunks) {
    await Promise.resolve()
    yield chunk
  }
}

const getModelParams = (index: number): GoogleModelParams =>
  mockGetGenerativeModel.mock.calls[index]?.[0] as GoogleModelParams

beforeEach(() => {
  mockGenerateContent.mockReset()
  mockGenerateContentStream.mockReset()
  mockGetGenerativeModel.mockReset()
  mockGetGenerativeModel.mockReturnValue({
    generateContent: mockGenerateContent,
    generateContentStream: mockGenerateContentStream,
  })
})

describe("GoogleAdapter", () => {
  it("complete() includes systemInstruction and estimates usage from metadata", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "gemini reply",
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 25,
        },
      },
    })

    const response = await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* GoogleAdapter
        return yield* adapter.complete(
          makeRequest({
            systemPrompt: "You are Owl.",
          }),
        )
      }).pipe(Effect.provide(makeLayer())),
    )

    expect(getModelParams(0)).toEqual({
      model: "gemini-2.5-flash",
      generationConfig: { maxOutputTokens: 256 },
      systemInstruction: "You are Owl.",
    })
    expect(response.usage.inputTokens).toBe(100)
    expect(response.usage.outputTokens).toBe(25)
    expect(response.usage.estimatedCostUsd).toBe(0.00003)
  })

  it("complete() falls back to deterministic token estimates for malformed usage metadata", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "ok",
        usageMetadata: {
          promptTokenCount: "not-a-number",
          candidatesTokenCount: 25,
        },
      },
    })

    const response = await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* GoogleAdapter
        return yield* adapter.complete(makeRequest())
      }).pipe(Effect.provide(makeLayer())),
    )

    expect(response.usage.inputTokens).toBe(2)
    expect(response.usage.outputTokens).toBe(1)
  })

  it("stream() emits text chunks and final usage", async () => {
    mockGenerateContentStream.mockResolvedValueOnce({
      stream: makeStream([{ text: () => "Gemini " }, { text: () => "stream" }]),
      response: Promise.resolve({
        text: () => "Gemini stream",
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 25,
        },
      }),
    })

    const chunks = await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* GoogleAdapter
        const emitted: StreamChunk[] = []
        yield* Stream.runForEach(
          adapter.stream(
            makeRequest({
              stream: true,
              systemPrompt: "You are Owl.",
            }),
          ),
          (chunk) => Effect.sync(() => emitted.push(chunk)),
        )
        return emitted
      }).pipe(Effect.provide(makeLayer())),
    )

    expect(getModelParams(0).systemInstruction).toBe("You are Owl.")
    expect(chunks.filter((chunk) => chunk.type === "text")).toEqual([
      { type: "text", content: "Gemini ", index: 0 },
      { type: "text", content: "stream", index: 1 },
    ])
    expect(chunks.at(-1)).toEqual({
      type: "usage",
      index: 2,
      usage: {
        inputTokens: 100,
        outputTokens: 25,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        estimatedCostUsd: 0.00003,
      },
    })
  })
})

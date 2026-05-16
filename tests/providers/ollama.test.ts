/** @Owl.Tests.Providers.Ollama - Local provider adapter tests */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Cause, ConfigProvider, Effect, Layer, Option } from "effect"
import * as Stream from "effect/Stream"
import { OWLConfigLive } from "../../src/core/config/index.js"
import {
  OllamaAdapter,
  OllamaAdapterLive,
} from "../../src/providers/ollama/index.js"
import type {
  InferenceRequest,
  ProviderId,
} from "../../src/core/schema/index.js"
import type { StreamChunk } from "../../src/providers/types.js"

const originalFetch = globalThis.fetch

const makeRequest = (overrides: Partial<InferenceRequest> = {}) => ({
  taskId: "ollama-task",
  messages: [
    {
      role: "user" as const,
      content: "hello local model",
      timestamp: "2026-05-15T00:00:00.000Z",
    },
  ],
  model: "llama3.2",
  maxTokens: 256,
  stream: false,
  ...overrides,
})

const makeLayer = () => {
  const configLayer = Layer.setConfigProvider(
    ConfigProvider.fromMap(
      new Map([
        ["ANTHROPIC_API_KEY", "sk-ant-test"],
        ["OLLAMA_BASE_URL", "http://localhost:11434"],
      ]),
    ),
  )
  return OllamaAdapterLive.pipe(
    Layer.provide(OWLConfigLive),
    Layer.provide(configLayer),
  )
}

interface FetchMockState {
  readonly requestBodies: unknown[]
}

const mockFetch = (response: Response): FetchMockState => {
  const requestBodies: unknown[] = []
  const fetchMock = vi.fn<
    (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  >((_input, init) => {
    requestBodies.push(init?.body)
    return Promise.resolve(response)
  })
  globalThis.fetch = fetchMock
  return { requestBodies }
}

const streamResponse = (lines: readonly string[]): Response => {
  const encoder = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(lines.join("\n")))
      controller.close()
    },
  })
  return new Response(body, { status: 200 })
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe("OllamaAdapter", () => {
  it("complete() parses schema-validated responses and estimates usage", async () => {
    mockFetch(new Response(JSON.stringify({ response: "local reply" })))

    const response = await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* OllamaAdapter
        return yield* adapter.complete(makeRequest())
      }).pipe(Effect.provide(makeLayer())),
    )

    expect(response.provider).toBe<ProviderId>("ollama")
    expect(response.content).toBe("local reply")
    expect(response.usage.inputTokens).toBeGreaterThan(0)
    expect(response.usage.outputTokens).toBeGreaterThan(0)
    expect(response.usage.estimatedCostUsd).toBe(0)
  })

  it("complete() maps HTTP failures to ProviderError", async () => {
    mockFetch(new Response("not found", { status: 404, statusText: "Nope" }))

    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const adapter = yield* OllamaAdapter
        return yield* adapter.complete(makeRequest())
      }).pipe(Effect.provide(makeLayer())),
    )

    expect(exit._tag).toBe("Failure")
    expect(String(exit.cause)).toContain("ProviderError")
    expect(String(exit.cause)).toContain("Ollama error: Nope")
  })

  it("stream() emits text chunks and final usage", async () => {
    const { requestBodies } = mockFetch(
      streamResponse([
        JSON.stringify({ response: "local ", done: false }),
        JSON.stringify({ response: "stream", done: false }),
        JSON.stringify({ done: true }),
      ]),
    )

    const chunks = await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* OllamaAdapter
        const emitted: StreamChunk[] = []
        yield* Stream.runForEach(
          adapter.stream(makeRequest({ stream: true })),
          (chunk) => Effect.sync(() => emitted.push(chunk)),
        )
        return emitted
      }).pipe(Effect.provide(makeLayer())),
    )

    expect(requestBodies[0]).toContain('"stream":true')
    expect(chunks.filter((chunk) => chunk.type === "text")).toEqual([
      { type: "text", content: "local ", index: 0 },
      { type: "text", content: "stream", index: 1 },
    ])
    expect(chunks.at(-1)).toMatchObject({
      type: "usage",
      usage: {
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        estimatedCostUsd: 0,
      },
    })
  })

  it("stream() maps empty response bodies to ProviderStreamError", async () => {
    mockFetch(new Response(null, { status: 200 }))

    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const adapter = yield* OllamaAdapter
        return yield* Stream.runCollect(adapter.stream(makeRequest()))
      }).pipe(Effect.provide(makeLayer())),
    )

    expect(exit._tag).toBe("Failure")
    if (exit._tag === "Success") return
    const failure = Option.getOrThrow(Cause.failureOption(exit.cause))
    expect(failure._tag).toBe("ProviderStreamError")
    expect(failure.cause).toBe("Ollama stream response body is empty")
  })
})

/** @Owl.Tests.Providers.Anthropic - Anthropic adapter specific tests */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { Effect, Layer, ConfigProvider } from "effect"
import * as Stream from "effect/Stream"
import {
  AnthropicAdapter,
  AnthropicAdapterLive,
} from "../../src/providers/anthropic/index.js"
import { OWLConfigLive } from "../../src/core/config/index.js"
import {
  PROVIDER_CONSTANTS,
  TOOL_NAMES,
} from "../../src/core/constants/index.js"
import {
  makeBuiltInToolsLive,
  ToolPermissionStateLive,
} from "../../src/tools/index.js"
import type { StreamChunk } from "../../src/providers/types.js"

const mockCreate = vi.fn()
const mockStream = vi.fn()

interface AnthropicSystemBlock {
  readonly type: string
  readonly text: string
  readonly cache_control?: {
    readonly type: string
  }
}

interface AnthropicCreateParams {
  readonly system?: readonly AnthropicSystemBlock[]
  readonly tools?: readonly {
    readonly name: string
  }[]
}

const getCreateCallArg = (index: number): AnthropicCreateParams =>
  mockCreate.mock.calls[index]?.[0] as AnthropicCreateParams

const getStreamCallArg = (index: number): AnthropicCreateParams =>
  mockStream.mock.calls[index]?.[0] as AnthropicCreateParams

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate, stream: mockStream },
  })),
}))

interface AnthropicStreamEvent {
  readonly type: "content_block_delta"
  readonly delta: {
    readonly type: "text_delta"
    readonly text: string
  }
}

interface AnthropicFinalMessage {
  readonly content: readonly unknown[]
  readonly stop_reason: string
  readonly usage: {
    readonly input_tokens: number
    readonly output_tokens: number
    readonly cache_creation_input_tokens?: number
    readonly cache_read_input_tokens?: number
  }
  readonly model: string
}

const makeStreamResult = (
  events: readonly AnthropicStreamEvent[],
  finalMessage: AnthropicFinalMessage,
) => ({
  async *[Symbol.asyncIterator]() {
    for (const event of events) {
      await Promise.resolve()
      yield event
    }
  },
  finalMessage: () => Promise.resolve(finalMessage),
})

const toolUseFinalMessage = (): AnthropicFinalMessage => ({
  content: [
    {
      type: "tool_use",
      id: "toolu_1",
      name: TOOL_NAMES.READ,
      input: { file_path: "package.json" },
    },
  ],
  stop_reason: "tool_use",
  usage: {
    input_tokens: 10,
    output_tokens: 1,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  },
  model: "claude-sonnet-4-6",
})

/** @Owl.Tests.Providers.Anthropic.Behavior - Specialized adapter logic verification */
describe("AnthropicAdapter", () => {
  it("exposes anthropic capabilities", async () => {
    const configLayer = Layer.setConfigProvider(
      ConfigProvider.fromMap(new Map([["ANTHROPIC_API_KEY", "sk-ant-test"]])),
    )

    const program = Effect.gen(function* () {
      const adapter = yield* AnthropicAdapter
      return adapter.capabilities.map((c) => c.modelId)
    })

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(AnthropicAdapterLive),
        Effect.provide(OWLConfigLive),
        Effect.provide(configLayer),
      ),
    )

    expect(result).toContain("claude-opus-4-7")
    expect(result).toContain("claude-sonnet-4-6")
    expect(result).toContain("claude-haiku-4-5-20251001")
  })

  it("adapter id is anthropic", async () => {
    const configLayer = Layer.setConfigProvider(
      ConfigProvider.fromMap(new Map([["ANTHROPIC_API_KEY", "sk-ant-test"]])),
    )

    const program = Effect.gen(function* () {
      const adapter = yield* AnthropicAdapter
      return adapter.id
    })

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(AnthropicAdapterLive),
        Effect.provide(OWLConfigLive),
        Effect.provide(configLayer),
      ),
    )
    expect(result).toBe("anthropic")
  })
})

describe("AnthropicAdapter — prompt caching", () => {
  beforeEach(() => {
    mockCreate.mockReset()
    mockStream.mockReset()
  })

  const makeTestLayer = () => {
    const configLayer = Layer.setConfigProvider(
      ConfigProvider.fromMap(new Map([["ANTHROPIC_API_KEY", "sk-ant-test"]])),
    )
    return AnthropicAdapterLive.pipe(
      Layer.provide(OWLConfigLive),
      Layer.provide(configLayer),
    )
  }

  const makeToolLayer = () =>
    makeTestLayer().pipe(
      Layer.provide(makeBuiltInToolsLive(process.cwd())),
      Layer.provide(ToolPermissionStateLive),
    )

  it("complete() sends system as a content block array with cache_control when systemPrompt is set", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "hi" }],
      stop_reason: "end_turn",
      usage: {
        input_tokens: 100,
        output_tokens: 10,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      },
      model: "claude-sonnet-4-6",
    })

    await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* AnthropicAdapter
        yield* adapter.complete({
          taskId: "t1",
          messages: [
            {
              role: "user",
              content: "hello",
              timestamp: new Date().toISOString(),
            },
          ],
          maxTokens: 256,
          systemPrompt: "You are a helpful assistant.",
          stream: false,
          model: "claude-sonnet-4-6",
        })
      }).pipe(Effect.provide(makeTestLayer())),
    )

    const callArg = getCreateCallArg(0)
    expect(Array.isArray(callArg.system)).toBe(true)
    expect(callArg.system[0]).toMatchObject({
      type: "text",
      text: "You are a helpful assistant.",
      cache_control: { type: "ephemeral" },
    })
  })

  it("complete() maps cache_creation_input_tokens → cacheWriteTokens and cache_read_input_tokens → cacheReadTokens", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "cached reply" }],
      stop_reason: "end_turn",
      usage: {
        input_tokens: 50,
        output_tokens: 8,
        cache_creation_input_tokens: 180,
        cache_read_input_tokens: 1200,
      },
      model: "claude-sonnet-4-6",
    })

    const response = await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* AnthropicAdapter
        return yield* adapter.complete({
          taskId: "t2",
          messages: [
            {
              role: "user",
              content: "hello",
              timestamp: new Date().toISOString(),
            },
          ],
          maxTokens: 256,
          systemPrompt: "sys",
          stream: false,
          model: "claude-sonnet-4-6",
        })
      }).pipe(Effect.provide(makeTestLayer())),
    )

    expect(response.usage.cacheWriteTokens).toBe(180)
    expect(response.usage.cacheReadTokens).toBe(1200)
    expect(response.usage.inputTokens).toBe(50)
    expect(response.usage.outputTokens).toBe(8)
  })

  it("complete() does not send system field when systemPrompt is absent", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "ok" }],
      stop_reason: "end_turn",
      usage: {
        input_tokens: 10,
        output_tokens: 3,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      },
      model: "claude-sonnet-4-6",
    })

    await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* AnthropicAdapter
        yield* adapter.complete({
          taskId: "t3",
          messages: [
            {
              role: "user",
              content: "hello",
              timestamp: new Date().toISOString(),
            },
          ],
          maxTokens: 256,
          stream: false,
          model: "claude-sonnet-4-6",
        })
      }).pipe(Effect.provide(makeTestLayer())),
    )

    const callArg = getCreateCallArg(mockCreate.mock.calls.length - 1)
    expect(callArg.system).toBeUndefined()
  })

  it("complete() sends built-in tool descriptors when the tool registry is present", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "ok" }],
      stop_reason: "end_turn",
      usage: {
        input_tokens: 10,
        output_tokens: 3,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      },
      model: "claude-sonnet-4-6",
    })

    await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* AnthropicAdapter
        yield* adapter.complete({
          taskId: "t4",
          messages: [
            {
              role: "user",
              content: "hello",
              timestamp: new Date().toISOString(),
            },
          ],
          maxTokens: 256,
          stream: false,
          model: "claude-sonnet-4-6",
        })
      }).pipe(Effect.provide(makeToolLayer())),
    )

    const callArg = getCreateCallArg(mockCreate.mock.calls.length - 1)
    expect(callArg.tools?.map((tool) => tool.name)).toContain(TOOL_NAMES.READ)
    expect(callArg.tools?.map((tool) => tool.name)).toContain(TOOL_NAMES.GREP)
    expect(callArg.tools?.map((tool) => tool.name)).not.toContain(
      TOOL_NAMES.EDIT,
    )
    expect(callArg.tools?.map((tool) => tool.name)).not.toContain(
      TOOL_NAMES.BASH,
    )
  })

  it("complete() fails when the tool loop hits the safety cap", async () => {
    mockCreate.mockResolvedValue(toolUseFinalMessage())

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* AnthropicAdapter
        return yield* adapter
          .complete({
            taskId: "t-tool-limit",
            messages: [
              {
                role: "user",
                content: "read repeatedly",
                timestamp: new Date().toISOString(),
              },
            ],
            maxTokens: 256,
            stream: false,
            model: "claude-sonnet-4-6",
          })
          .pipe(Effect.either)
      }).pipe(Effect.provide(makeToolLayer())),
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left.message).toBe(
        PROVIDER_CONSTANTS.ANTHROPIC_TOOL_ITERATION_LIMIT_MESSAGE,
      )
    }
    expect(mockCreate).toHaveBeenCalledTimes(
      PROVIDER_CONSTANTS.ANTHROPIC_MAX_TOOL_ITERATIONS + 1,
    )
  })

  it("stream() emits final usage after streamed text chunks", async () => {
    mockStream.mockReturnValueOnce(
      makeStreamResult(
        [
          {
            type: "content_block_delta",
            delta: { type: "text_delta", text: "hello" },
          },
        ],
        {
          content: [{ type: "text", text: "hello" }],
          stop_reason: "end_turn",
          usage: {
            input_tokens: 20,
            output_tokens: 5,
            cache_creation_input_tokens: 2,
            cache_read_input_tokens: 10,
          },
          model: "claude-sonnet-4-6",
        },
      ),
    )

    const chunks = await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* AnthropicAdapter
        const emitted: StreamChunk[] = []
        yield* Stream.runForEach(
          adapter.stream({
            taskId: "t-stream",
            messages: [
              {
                role: "user",
                content: "hello",
                timestamp: new Date().toISOString(),
              },
            ],
            maxTokens: 256,
            stream: true,
            model: "claude-sonnet-4-6",
          }),
          (chunk) =>
            Effect.sync(() => {
              emitted.push(chunk)
            }),
        )
        return emitted
      }).pipe(Effect.provide(makeTestLayer())),
    )

    expect(chunks).toEqual([
      { type: "text", content: "hello", index: 0 },
      {
        type: "usage",
        index: 1,
        usage: {
          inputTokens: 20,
          outputTokens: 5,
          cacheReadTokens: 10,
          cacheWriteTokens: 2,
          estimatedCostUsd: 0.000135,
        },
      },
    ])
  })

  it("stream() sends cached system prompt and built-in tool descriptors", async () => {
    mockStream.mockReturnValueOnce(
      makeStreamResult([], {
        content: [{ type: "text", text: "ok" }],
        stop_reason: "end_turn",
        usage: {
          input_tokens: 10,
          output_tokens: 3,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0,
        },
        model: "claude-sonnet-4-6",
      }),
    )

    await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* AnthropicAdapter
        yield* Stream.runDrain(
          adapter.stream({
            taskId: "t-stream-tools",
            messages: [
              {
                role: "user",
                content: "hello",
                timestamp: new Date().toISOString(),
              },
            ],
            maxTokens: 256,
            systemPrompt: "You are Owl.",
            stream: true,
            model: "claude-sonnet-4-6",
          }),
        )
      }).pipe(Effect.provide(makeToolLayer())),
    )

    const callArg = getStreamCallArg(mockStream.mock.calls.length - 1)
    expect(callArg.system?.[0]).toMatchObject({
      type: "text",
      text: "You are Owl.",
      cache_control: { type: "ephemeral" },
    })
    expect(callArg.tools?.map((tool) => tool.name)).toContain(TOOL_NAMES.READ)
    expect(callArg.tools?.map((tool) => tool.name)).toContain(TOOL_NAMES.GREP)
    expect(callArg.tools?.map((tool) => tool.name)).not.toContain(
      TOOL_NAMES.EDIT,
    )
    expect(callArg.tools?.map((tool) => tool.name)).not.toContain(
      TOOL_NAMES.BASH,
    )
  })

  it("stream() fails when the tool loop hits the safety cap", async () => {
    mockStream.mockReturnValue(makeStreamResult([], toolUseFinalMessage()))

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const adapter = yield* AnthropicAdapter
        return yield* Stream.runDrain(
          adapter.stream({
            taskId: "t-stream-tool-limit",
            messages: [
              {
                role: "user",
                content: "read repeatedly",
                timestamp: new Date().toISOString(),
              },
            ],
            maxTokens: 256,
            stream: true,
            model: "claude-sonnet-4-6",
          }),
        ).pipe(Effect.either)
      }).pipe(Effect.provide(makeToolLayer())),
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left.cause).toBe(
        PROVIDER_CONSTANTS.ANTHROPIC_TOOL_ITERATION_LIMIT_MESSAGE,
      )
    }
    expect(mockStream).toHaveBeenCalledTimes(
      PROVIDER_CONSTANTS.ANTHROPIC_MAX_TOOL_ITERATIONS,
    )
  })
})

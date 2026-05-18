/**
 * @Owl.Commands.Compact.Tests - Regression coverage for context compaction
 */
import { Chunk, Effect, Option, Ref } from "effect"
import { describe, expect, it, vi } from "vitest"
import {
  CommandParseError,
  ProviderError,
} from "../../src/core/errors/index.js"
import type { Message } from "../../src/core/schema/index.js"
import type { ContextManagerService } from "../../src/engine/context/index.js"
import type { OrchestratorService } from "../../src/engine/orchestrator/index.js"
import type { ContextCacheService } from "../../src/tokens/cache/index.js"
import { makeCompactCommand } from "../../src/commands/management/compact.js"

const makeMessage = (content: string): Message => ({
  role: "user",
  content,
  timestamp: "2026-05-16T00:00:00.000Z",
})

const makeContext = (): Effect.Effect<ContextManagerService> =>
  Effect.gen(function* () {
    const messagesRef = yield* Ref.make<Chunk.Chunk<Message>>(Chunk.empty())
    const systemPromptRef = yield* Ref.make<string | undefined>("original")

    return {
      addMessage: (msg) =>
        Ref.update(messagesRef, (messages) => Chunk.append(messages, msg)),
      getMessages: () =>
        Ref.get(messagesRef).pipe(Effect.map(Chunk.toReadonlyArray)),
      getWindowedMessages: () =>
        Ref.get(messagesRef).pipe(Effect.map(Chunk.toReadonlyArray)),
      setSystemPrompt: (prompt) => Ref.set(systemPromptRef, prompt),
      getSystemPrompt: () => Ref.get(systemPromptRef),
      estimateTokens: () => Effect.succeed(0),
      clear: () => Ref.set(messagesRef, Chunk.empty()),
    }
  })

const makeResponse = (content: string) => ({
  taskId: "cmd-compact-test",
  content,
  stopReason: "end_turn" as const,
  usage: {
    inputTokens: 1,
    outputTokens: 1,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    estimatedCostUsd: 0,
  },
  model: "test-model",
  provider: "anthropic" as const,
  latencyMs: 1,
})

const makeNoopCache = (): ContextCacheService => ({
  store: () => Effect.void,
  get: () => Effect.succeed(Option.none()),
  invalidate: () => Effect.void,
  invalidateAll: () => Effect.void,
  totalSavedTokens: () => Effect.succeed(0),
})

describe("makeCompactCommand", () => {
  it("skips compaction when the conversation is too short", async () => {
    const run = vi.fn(() => Effect.succeed(makeResponse("unused")))
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const context = yield* makeContext()
        yield* context.addMessage(makeMessage("one"))
        const command = makeCompactCommand(
          {
            run,
            runParallel: () =>
              Effect.succeed(Chunk.make(makeResponse("unused"))),
            runStream: () => Effect.succeed(makeResponse("unused")),
            getSessionSummary: () => Effect.succeed("summary"),
          } satisfies OrchestratorService,
          context,
          makeNoopCache(),
        )
        return yield* command.execute(Chunk.toReadonlyArray(Chunk.empty()))
      }),
    )

    expect(result.output).toContain("Nothing to compact")
    expect(run).not.toHaveBeenCalled()
  })

  it("replaces message history with a compacted context block", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const context = yield* makeContext()
        for (const message of Chunk.make("one", "two", "three", "four")) {
          yield* context.addMessage(makeMessage(message))
        }
        const command = makeCompactCommand(
          {
            run: () =>
              Effect.succeed(makeResponse("## Conversation Summary\nDone")),
            runParallel: () =>
              Effect.succeed(Chunk.make(makeResponse("unused"))),
            runStream: () => Effect.succeed(makeResponse("unused")),
            getSessionSummary: () => Effect.succeed("summary"),
          } satisfies OrchestratorService,
          context,
          makeNoopCache(),
        )
        const output = yield* command.execute(
          Chunk.toReadonlyArray(Chunk.empty()),
        )
        const messages = yield* context.getMessages()
        const systemPrompt = yield* context.getSystemPrompt()
        return { output, messages, systemPrompt }
      }),
    )

    expect(result.output.output).toContain("Compacted: 4 messages")
    expect(result.messages).toHaveLength(1)
    expect(result.messages[0]?.content).toContain("## Compacted Context")
    expect(result.systemPrompt).toBe("original")
  })

  it("restores the original system prompt when summarization fails", async () => {
    const context = await Effect.runPromise(makeContext())
    for (const message of Chunk.make("one", "two", "three", "four")) {
      await Effect.runPromise(context.addMessage(makeMessage(message)))
    }
    const command = makeCompactCommand(
      {
        run: () =>
          Effect.fail(
            new ProviderError({
              provider: "anthropic",
              message: "provider unavailable",
            }),
          ),
        runParallel: () => Effect.succeed(Chunk.make(makeResponse("unused"))),
        runStream: () => Effect.succeed(makeResponse("unused")),
        getSessionSummary: () => Effect.succeed("summary"),
      } satisfies OrchestratorService,
      context,
      makeNoopCache(),
    )
    const error = await Effect.runPromise(
      Effect.flip(command.execute(Chunk.toReadonlyArray(Chunk.empty()))),
    )
    const systemPrompt = await Effect.runPromise(context.getSystemPrompt())

    expect(error).toBeInstanceOf(CommandParseError)
    expect(systemPrompt).toBe("original")
  })

  it("stores compacted summaries in ContextCache", async () => {
    const store = vi.fn<ContextCacheService["store"]>(() => Effect.void)
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const context = yield* makeContext()
        for (const message of Chunk.make("one", "two", "three", "four")) {
          yield* context.addMessage(makeMessage(message))
        }
        const command = makeCompactCommand(
          {
            run: () =>
              Effect.succeed(makeResponse("## Conversation Summary\nDone")),
            runParallel: () =>
              Effect.succeed(Chunk.make(makeResponse("unused"))),
            runStream: () => Effect.succeed(makeResponse("unused")),
            getSessionSummary: () => Effect.succeed("summary"),
          } satisfies OrchestratorService,
          context,
          {
            ...makeNoopCache(),
            store,
          },
        )
        return yield* command.execute([])
      }),
    )

    expect(result.output).toContain("Cached:")
    expect(store).toHaveBeenCalledOnce()
  })
})

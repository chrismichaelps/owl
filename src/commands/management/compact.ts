/**
 * @Owl.Commands.Management.Compact - Summarize and compress conversation context
 *
 * Replaces a long Session message history with one dense summary while restoring
 * the caller's original system prompt even when summarization fails.
 */
import { Chunk, Data, Effect } from "effect"
import { COMPACT_CONSTANTS } from "../../core/constants/index.js"
import { CommandParseError as CommandParseErrorClass } from "../../core/errors/index.js"
import type { CommandParseError } from "../../core/errors/index.js"
import type { Message } from "../../core/schema/index.js"
import type { ContextManagerService } from "../../engine/context/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { ContextCacheService } from "../../tokens/cache/index.js"
import { estimateConversationTokens } from "../../tokens/pruning/index.js"
import { makeCommandTaskId } from "../utils/ids.js"
import type { CommandHandler, CommandResult } from "../types.js"

const makeCompactTaskSeed = (messages: Chunk.Chunk<Message>): string =>
  Chunk.toReadonlyArray(
    Chunk.map(
      messages,
      (message) => `${message.role}:${message.timestamp}:${message.content}`,
    ),
  ).join("\n")

const toCommandParseError = (error: unknown): CommandParseErrorClass =>
  new CommandParseErrorClass({
    input: COMPACT_CONSTANTS.COMMAND_NAME,
    reason:
      "Summarization failed: " +
      (error instanceof Error ? error.message : String(error)),
  })

/**
 * @Owl.Commands.Management.Compact.Factory - Create the /compact command handler
 */
export function makeCompactCommand(
  orchestrator: OrchestratorService,
  contextManager: ContextManagerService,
  contextCache: ContextCacheService,
): CommandHandler {
  return {
    name: COMPACT_CONSTANTS.COMMAND_NAME,
    description:
      "Summarize conversation context to reduce token usage: /compact",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const messages = Chunk.fromIterable(yield* contextManager.getMessages())

        if (Chunk.size(messages) < COMPACT_CONSTANTS.MIN_MESSAGES) {
          return {
            output:
              "Nothing to compact — conversation is too short. Keep going!",
          }
        }

        const messagesArray = Chunk.toReadonlyArray(messages)
        const tokensBefore = estimateConversationTokens(messagesArray)
        const compactedAt = new Date().toISOString()
        const compactTaskId = makeCommandTaskId(
          COMPACT_CONSTANTS.COMMAND_NAME,
          makeCompactTaskSeed(messages),
        )
        const summaryResponse = yield* Effect.acquireUseRelease(
          contextManager
            .getSystemPrompt()
            .pipe(
              Effect.tap(() =>
                contextManager.setSystemPrompt(COMPACT_CONSTANTS.SYSTEM_PROMPT),
              ),
            ),
          () =>
            orchestrator.run({
              id: compactTaskId,
              prompt: COMPACT_CONSTANTS.TASK_PROMPT,
              mode: COMPACT_CONSTANTS.MODE,
              createdAt: compactedAt,
            }),
          (previousSystemPrompt) =>
            contextManager.setSystemPrompt(previousSystemPrompt ?? ""),
        ).pipe(Effect.mapError(toCommandParseError))

        const compactedMessage = Data.struct({
          role: "user" as const,
          content: COMPACT_CONSTANTS.CONTEXT_PREFIX + summaryResponse.content,
          timestamp: compactedAt,
        })

        yield* contextManager.clear()
        yield* contextManager.addMessage(compactedMessage)

        const tokensAfter = estimateConversationTokens(
          Chunk.toReadonlyArray(Chunk.make(compactedMessage)),
        )
        const saved = tokensBefore - tokensAfter
        const cacheResult = yield* contextCache
          .store(compactTaskId, {
            summary: summaryResponse.content,
            tokenCount: Math.max(0, saved),
            trustScore: 1,
          })
          .pipe(Effect.either)
        const cacheLine =
          cacheResult._tag === "Right"
            ? "\n  Cached: " + compactTaskId
            : "\n  Cache warning: " + String(cacheResult.left)

        return {
          output:
            `✓ Compacted: ${String(Chunk.size(messages))} messages → 1 summary\n` +
            `  Tokens: ~${String(tokensBefore)} → ~${String(tokensAfter)} (saved ~${String(Math.max(0, saved))})` +
            cacheLine,
        }
      }),
  }
}

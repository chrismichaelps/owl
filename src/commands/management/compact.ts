/**
 * @Owl.Commands.Management.Compact - Summarize and compress conversation context: /compact
 *
 * When context grows large, /compact asks the LLM to produce a dense summary of
 * the conversation so far, then replaces the full message history with just that
 * summary. This slashes token usage on long sessions while preserving the key
 * facts the model needs.
 *
 * Inspired by ref-cli's compactSummary pattern.
 *
 * @example
 * /compact
 * // ✓ Compacted: 47 messages → 1 summary (saved ~12,400 tokens)
 */
import { Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import { CommandParseError as CommandParseErrorClass } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { ContextManagerService } from "../../engine/context/index.js"
import { estimateConversationTokens } from "../../tokens/pruning/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const COMPACT_SYSTEM_PROMPT = `You are a conversation summarizer. Your task is to produce a dense, structured summary of the conversation so far.

The summary must:
1. Preserve all key decisions, code changes, file paths, and architectural choices discussed
2. Note the current state of any work in progress
3. Capture any open questions or next steps
4. Be written as a self-contained context block the developer can resume from

Format: Start with "## Conversation Summary" then organize by topic. Be dense and precise.`

/**
 * @Owl.Commands.Management.Compact.Factory - Create the /compact command handler
 */
export function makeCompactCommand(
  orchestrator: OrchestratorService,
  contextManager: ContextManagerService,
): CommandHandler {
  return {
    name: "compact",
    description:
      "Summarize conversation context to reduce token usage: /compact",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const messages = yield* contextManager.getMessages()

        if (messages.length < 4) {
          return {
            output:
              "Nothing to compact — conversation is too short. Keep going!",
          }
        }

        const tokensBefore = estimateConversationTokens(messages)

        // Build a summary request by injecting the compaction system prompt
        const currentSystem = yield* contextManager.getSystemPrompt()
        yield* contextManager.setSystemPrompt(COMPACT_SYSTEM_PROMPT)

        const summaryResponse = yield* orchestrator
          .run({
            id: "compact-" + Date.now().toString(36),
            prompt:
              "Please summarize our conversation so far, preserving all important technical context.",
            mode: "standard",
            createdAt: new Date().toISOString(),
          })
          .pipe(
            Effect.mapError(
              (e) =>
                new CommandParseErrorClass({
                  input: "compact",
                  reason:
                    "Summarization failed: " +
                    ("message" in e && typeof e.message === "string"
                      ? e.message
                      : String(e)),
                }),
            ),
          )

        // Restore original system prompt and replace history with just the summary
        yield* contextManager.setSystemPrompt(currentSystem ?? "")
        yield* contextManager.clear()
        yield* contextManager.addMessage({
          role: "user",
          content:
            "## Compacted Context\n\nThe following is a summary of our conversation before compaction:\n\n" +
            summaryResponse.content,
          timestamp: new Date().toISOString(),
        })

        const tokensAfter = estimateConversationTokens([
          {
            role: "user",
            content: summaryResponse.content,
            timestamp: new Date().toISOString(),
          },
        ])
        const saved = tokensBefore - tokensAfter

        return {
          output:
            `✓ Compacted: ${String(messages.length)} messages → 1 summary\n` +
            `  Tokens: ~${String(tokensBefore)} → ~${String(tokensAfter)} (saved ~${String(Math.max(0, saved))})`,
        }
      }),
  }
}

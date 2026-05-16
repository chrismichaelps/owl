/**
 * @Owl.Engine.Context - Pruning-aware conversation context window manager
 *
 * Manages the sliding window of conversation messages. When context exceeds the
 * token budget for a given mode, the context manager prunes messages while
 * preserving the Second-Order Markov invariant.
 *
 * Markov Invariant (Law 1 of FMCF): V_{n+1} = f(V_n, V_{n-1})
 * - State depends only on the last two states
 * - Pruning aggressively removes older context
 * - Keep: last 2 pairs of messages + system prompt
 *
 * Context window strategy:
 * 1. Calculate current token count from all messages
 * 2. If under budget, return all messages unchanged
 * 3. If over budget, extract Markov window (last 4 messages)
 * 4. If still over budget, truncate oldest messages until fit
 *
 * @example
 * yield* Effect.flatMap(ContextManager, (c) => c.addMessage({ role: "user", content: "hi", timestamp: now }))
 * const msgs = yield* Effect.flatMap(ContextManager, (c) => c.getWindowedMessages(32000))
 */
import { Chunk, Context, Data, Effect, Layer, Ref } from "effect"
import {
  estimateConversationTokens,
  shouldPrune,
  pruneMessages,
} from "../../tokens/pruning/index.js"
import type { Message } from "../../core/schema/index.js"

/**
 * @Owl.Engine.Context.Service - Context window management interface
 */
export interface ContextManagerService {
  /**
   * Add a message to the context window
   * @param msg - Message to append (user, assistant, or system)
   */
  readonly addMessage: (msg: Message) => Effect.Effect<void>
  /**
   * Get all messages (unpruned)
   * @returns Complete message history
   */
  readonly getMessages: () => Effect.Effect<readonly Message[]>
  /**
   * Get messages pruned to fit within budget
   *
   * Implements Markov-aware pruning: keeps last 4 messages and
   * system prompt, then truncates oldest first.
   *
   * @param budget - Token budget for this window
   * @returns Messages that fit within budget
   */
  readonly getWindowedMessages: (
    budget: number,
  ) => Effect.Effect<readonly Message[]>
  /**
   * Set the system prompt
   * @param prompt - System prompt content (preserved during pruning)
   */
  readonly setSystemPrompt: (prompt: string) => Effect.Effect<void>
  /**
   * Get current system prompt
   * @returns System prompt or undefined
   */
  readonly getSystemPrompt: () => Effect.Effect<string | undefined>
  /**
   * Estimate total tokens in current context
   * @returns Token count (rough: characters / 4)
   */
  readonly estimateTokens: () => Effect.Effect<number>
  /**
   * Clear all messages (not system prompt)
   */
  readonly clear: () => Effect.Effect<void>
}

/** @Owl.Engine.Context.Tag - Service tag for context management */
export class ContextManager extends Context.Tag("ContextManager")<
  ContextManager,
  ContextManagerService
>() {}

/**
 * @Owl.Engine.Context.Live - Ref-backed pruning-aware context storage
 *
 * Maintains two Refs: messages (conversation history) and systemPrompt.
 * System prompt is preserved during pruning operations.
 */
export const ContextManagerLive = Layer.effect(
  ContextManager,
  Effect.gen(function* () {
    const messagesRef = yield* Ref.make<Chunk.Chunk<Message>>(Chunk.empty())
    const systemPromptRef = yield* Ref.make<string | undefined>(undefined)

    const addMessage = (msg: Message): Effect.Effect<void> =>
      Ref.update(messagesRef, (msgs) => Chunk.append(msgs, Data.struct(msg)))

    const getMessages = (): Effect.Effect<readonly Message[]> =>
      Ref.get(messagesRef).pipe(Effect.map(Chunk.toReadonlyArray))

    const getWindowedMessages = (
      budget: number,
    ): Effect.Effect<readonly Message[]> =>
      Effect.gen(function* () {
        const msgs = Chunk.toReadonlyArray(yield* Ref.get(messagesRef))
        const currentTokens = estimateConversationTokens(msgs)
        if (!shouldPrune(currentTokens, budget)) return msgs
        const result = yield* pruneMessages(msgs, {
          budget,
          preserveSystemPrompt: true,
        })
        return result.messages
      })

    const setSystemPrompt = (prompt: string): Effect.Effect<void> =>
      Ref.set(systemPromptRef, prompt)

    const getSystemPrompt = (): Effect.Effect<string | undefined> =>
      Ref.get(systemPromptRef)

    const estimateTokens = (): Effect.Effect<number> =>
      Ref.get(messagesRef).pipe(
        Effect.map((msgs) =>
          estimateConversationTokens(Chunk.toReadonlyArray(msgs)),
        ),
      )

    const clear = (): Effect.Effect<void> => Ref.set(messagesRef, Chunk.empty())

    return {
      addMessage,
      getMessages,
      getWindowedMessages,
      setSystemPrompt,
      getSystemPrompt,
      estimateTokens,
      clear,
    } satisfies ContextManagerService
  }),
)

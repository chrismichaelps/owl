/** @Owl.Engine.Context - Pruning-aware conversation context window manager */
import { Context, Effect, Layer, Ref } from "effect"
import {
  estimateConversationTokens,
  shouldPrune,
  pruneMessages,
} from "../../tokens/pruning/index.js"
import type { Message } from "../../core/schema/index.js"

export interface ContextManagerService {
  readonly addMessage: (msg: Message) => Effect.Effect<void>
  readonly getMessages: () => Effect.Effect<readonly Message[]>
  readonly getWindowedMessages: (
    budget: number,
  ) => Effect.Effect<readonly Message[]>
  readonly setSystemPrompt: (prompt: string) => Effect.Effect<void>
  readonly getSystemPrompt: () => Effect.Effect<string | undefined>
  readonly estimateTokens: () => Effect.Effect<number>
  readonly clear: () => Effect.Effect<void>
}

export class ContextManager extends Context.Tag("ContextManager")<
  ContextManager,
  ContextManagerService
>() {}

export const ContextManagerLive = Layer.effect(
  ContextManager,
  Effect.gen(function* () {
    const messagesRef = yield* Ref.make<readonly Message[]>([])
    const systemPromptRef = yield* Ref.make<string | undefined>(undefined)

    const addMessage = (msg: Message): Effect.Effect<void> =>
      Ref.update(messagesRef, (msgs) => [...msgs, msg])

    const getMessages = (): Effect.Effect<readonly Message[]> =>
      Ref.get(messagesRef)

    const getWindowedMessages = (
      budget: number,
    ): Effect.Effect<readonly Message[]> =>
      Effect.gen(function* () {
        const msgs = yield* Ref.get(messagesRef)
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
        Effect.map((msgs) => estimateConversationTokens(msgs)),
      )

    const clear = (): Effect.Effect<void> => Ref.set(messagesRef, [])

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

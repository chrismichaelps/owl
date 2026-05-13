/** @Owl.Engine.Memory - In-memory session turn history with session lifecycle management */
import { Context, Effect, Layer, Ref } from "effect"

export interface SessionTurn {
  readonly taskId: string
  readonly prompt: string
  readonly response: string
  readonly tokensUsed: number
  readonly timestamp: string
}

interface MemoryState {
  readonly sessionId: string
  readonly turns: ReadonlyArray<SessionTurn>
}

export interface SessionMemoryService {
  readonly startSession: (sessionId?: string) => Effect.Effect<string>
  readonly getSessionId: () => Effect.Effect<string>
  readonly recordTurn: (turn: SessionTurn) => Effect.Effect<void>
  readonly getTurns: () => Effect.Effect<ReadonlyArray<SessionTurn>>
  readonly summarize: () => Effect.Effect<string>
}

export class SessionMemory extends Context.Tag("SessionMemory")<
  SessionMemory,
  SessionMemoryService
>() {}

const generateSessionId = (): string =>
  `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const SessionMemoryLive = Layer.effect(
  SessionMemory,
  Effect.gen(function* () {
    const stateRef = yield* Ref.make<MemoryState>({
      sessionId: generateSessionId(),
      turns: [],
    })

    const startSession = (sessionId?: string): Effect.Effect<string> => {
      const id = sessionId ?? generateSessionId()
      return Ref.set(stateRef, { sessionId: id, turns: [] }).pipe(
        Effect.as(id),
      )
    }

    const getSessionId = (): Effect.Effect<string> =>
      Ref.get(stateRef).pipe(Effect.map((s) => s.sessionId))

    const recordTurn = (turn: SessionTurn): Effect.Effect<void> =>
      Ref.update(stateRef, (s) => ({
        ...s,
        turns: [...s.turns, turn],
      }))

    const getTurns = (): Effect.Effect<ReadonlyArray<SessionTurn>> =>
      Ref.get(stateRef).pipe(Effect.map((s) => s.turns))

    const summarize = (): Effect.Effect<string> =>
      Ref.get(stateRef).pipe(
        Effect.map((s) => {
          const totalTokens = s.turns.reduce((sum, t) => sum + t.tokensUsed, 0)
          return `Session ${s.sessionId}: ${s.turns.length} turns, ${totalTokens} tokens used`
        }),
      )

    return {
      startSession,
      getSessionId,
      recordTurn,
      getTurns,
      summarize,
    } satisfies SessionMemoryService
  }),
)

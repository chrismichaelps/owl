/** @Owl.Engine.Memory - In-memory session turn history with session lifecycle management */
import { Context, Effect, Layer, Ref } from "effect"

/** @Owl.Engine.Memory.Turn - Immutable session turn record */
export interface SessionTurn {
  readonly taskId: string
  readonly prompt: string
  readonly response: string
  readonly tokensUsed: number
  readonly timestamp: string
}

/** @Owl.Engine.Memory.State - Internal mutable session state */
interface MemoryState {
  readonly sessionId: string
  readonly turns: readonly SessionTurn[]
}

/** @Owl.Engine.Memory.Service - Session memory interface */
export interface SessionMemoryService {
  readonly startSession: (sessionId?: string) => Effect.Effect<string>
  readonly getSessionId: () => Effect.Effect<string>
  readonly recordTurn: (turn: SessionTurn) => Effect.Effect<void>
  readonly getTurns: () => Effect.Effect<readonly SessionTurn[]>
  readonly summarize: () => Effect.Effect<string>
}

/** @Owl.Engine.Memory.Tag - Service tag for session memory */
export class SessionMemory extends Context.Tag("SessionMemory")<
  SessionMemory,
  SessionMemoryService
>() {}

/** @Owl.Engine.Memory.IdGenerator - Session ID factory */
const generateSessionId = (): string =>
  `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

/** @Owl.Engine.Memory.Live - Ref-backed in-memory session storage */
export const SessionMemoryLive = Layer.effect(
  SessionMemory,
  Effect.gen(function* () {
    const stateRef = yield* Ref.make<MemoryState>({
      sessionId: generateSessionId(),
      turns: [],
    })

    const startSession = (sessionId?: string): Effect.Effect<string> => {
      const id = sessionId ?? generateSessionId()
      return Ref.set(stateRef, { sessionId: id, turns: [] }).pipe(Effect.as(id))
    }

    const getSessionId = (): Effect.Effect<string> =>
      Ref.get(stateRef).pipe(Effect.map((s) => s.sessionId))

    const recordTurn = (turn: SessionTurn): Effect.Effect<void> =>
      Ref.update(stateRef, (s) => ({
        ...s,
        turns: [...s.turns, turn],
      }))

    const getTurns = (): Effect.Effect<readonly SessionTurn[]> =>
      Ref.get(stateRef).pipe(Effect.map((s) => s.turns))

    const summarize = (): Effect.Effect<string> =>
      Ref.get(stateRef).pipe(
        Effect.map((s) => {
          const totalTokens = s.turns.reduce((sum, t) => sum + t.tokensUsed, 0)
          return `Session ${s.sessionId}: ${String(s.turns.length)} turns, ${String(
            totalTokens,
          )} tokens used`
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

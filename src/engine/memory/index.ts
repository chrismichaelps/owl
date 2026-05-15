/**
 * @Owl.Engine.Memory - Session Turn history with lifecycle management
 *
 * Tracks Turn history per Session. The default layer is deterministic and
 * process-local; the persistent layer stores the same bounded state to disk.
 */
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import path from "node:path"
import { Context, Effect, Layer, Ref } from "effect"
import { SESSION_MEMORY_CONSTANTS } from "../../core/constants/index.js"
import { SessionMemoryPersistenceError } from "../../core/errors/index.js"
import {
  boundTurns,
  decodePersistedSessionState,
  decodeSessionTurn,
  makeEmptyState,
  type PersistSessionSnapshot,
  type SessionMemoryFailure,
} from "./persistence.js"
export {
  SessionMemoryStateSchema,
  SessionTurnSchema,
  type SessionMemoryState,
  type SessionTurn,
} from "./schema.js"
import type { SessionMemoryState, SessionTurn } from "./schema.js"

/** @Owl.Engine.Memory.Service - Session memory interface */
export interface SessionMemoryService {
  readonly startSession: (
    sessionId?: string,
  ) => Effect.Effect<string, SessionMemoryFailure>
  readonly resumeSession: (
    sessionId?: string,
  ) => Effect.Effect<string, SessionMemoryFailure>
  readonly getSessionId: () => Effect.Effect<string>
  readonly recordTurn: (
    turn: SessionTurn,
  ) => Effect.Effect<void, SessionMemoryFailure>
  readonly getTurns: () => Effect.Effect<readonly SessionTurn[]>
  readonly summarize: () => Effect.Effect<string>
}

/** @Owl.Engine.Memory.Tag - Service tag for session memory */
export class SessionMemory extends Context.Tag("SessionMemory")<
  SessionMemory,
  SessionMemoryService
>() {}

const generateSessionId = (): string =>
  `sess-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(
      SESSION_MEMORY_CONSTANTS.SESSION_ID_RANDOM_SLICE_START,
      SESSION_MEMORY_CONSTANTS.SESSION_ID_RANDOM_SLICE_END,
    )}`

const noPersist: PersistSessionSnapshot = () => Effect.void

const makeService = (
  stateRef: Ref.Ref<SessionMemoryState>,
  persist: PersistSessionSnapshot,
): SessionMemoryService => {
  const persistCurrent = (): Effect.Effect<void, SessionMemoryFailure> =>
    Ref.get(stateRef).pipe(Effect.flatMap(persist))

  const startSession = (
    sessionId?: string,
  ): Effect.Effect<string, SessionMemoryFailure> => {
    const id = sessionId ?? generateSessionId()
    return Ref.set(stateRef, makeEmptyState(id)).pipe(
      Effect.zipRight(persistCurrent()),
      Effect.as(id),
    )
  }

  const resumeSession = (
    sessionId?: string,
  ): Effect.Effect<string, SessionMemoryFailure> =>
    Effect.gen(function* () {
      if (sessionId !== undefined) {
        yield* Ref.update(stateRef, (state) => ({ ...state, sessionId }))
        yield* persistCurrent()
        return sessionId
      }
      const state = yield* Ref.get(stateRef)
      return state.sessionId
    })

  const getSessionId = (): Effect.Effect<string> =>
    Ref.get(stateRef).pipe(Effect.map((state) => state.sessionId))

  const recordTurn = (
    turn: SessionTurn,
  ): Effect.Effect<void, SessionMemoryFailure> =>
    Effect.gen(function* () {
      const decoded = yield* decodeSessionTurn(turn)
      yield* Ref.update(stateRef, (state) => ({
        ...state,
        turns: boundTurns([...state.turns, decoded]),
      }))
      yield* persistCurrent()
    })

  const getTurns = (): Effect.Effect<readonly SessionTurn[]> =>
    Ref.get(stateRef).pipe(Effect.map((state) => state.turns))

  const summarize = (): Effect.Effect<string> =>
    Ref.get(stateRef).pipe(
      Effect.map((state) => {
        const totalTokens = state.turns.reduce(
          (sum, turn) => sum + turn.tokensUsed,
          0,
        )
        return `Session ${state.sessionId}: ${String(state.turns.length)} turns, ${String(
          totalTokens,
        )} tokens used`
      }),
    )

  return {
    startSession,
    resumeSession,
    getSessionId,
    recordTurn,
    getTurns,
    summarize,
  }
}

/** @Owl.Engine.Memory.Live - Ref-backed in-memory Session storage */
export const SessionMemoryLive = Layer.effect(
  SessionMemory,
  Effect.gen(function* () {
    const stateRef = yield* Ref.make<SessionMemoryState>(
      makeEmptyState(generateSessionId()),
    )
    return makeService(stateRef, noPersist)
  }),
)

/** @Owl.Engine.Memory.Persistent - File-backed Session storage */
export const makePersistentSessionMemoryLive = (
  storagePath: string,
): Layer.Layer<SessionMemory, SessionMemoryFailure> =>
  Layer.effect(
    SessionMemory,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const exists = yield* fs.exists(storagePath).pipe(
        Effect.mapError(
          () =>
            new SessionMemoryPersistenceError({
              path: storagePath,
              reason: "Unable to inspect SessionMemory storage path",
            }),
        ),
      )

      const initialState = exists
        ? yield* fs.readFileString(storagePath).pipe(
            Effect.mapError(
              () =>
                new SessionMemoryPersistenceError({
                  path: storagePath,
                  reason: "Unable to read SessionMemory storage",
                }),
            ),
            Effect.flatMap((raw) =>
              decodePersistedSessionState(storagePath, raw),
            ),
          )
        : makeEmptyState(generateSessionId())

      const stateRef = yield* Ref.make<SessionMemoryState>(initialState)
      const persist: PersistSessionSnapshot = (state) =>
        fs.makeDirectory(path.dirname(storagePath), { recursive: true }).pipe(
          Effect.mapError(
            () =>
              new SessionMemoryPersistenceError({
                path: storagePath,
                reason: "Unable to create SessionMemory storage directory",
              }),
          ),
          Effect.zipRight(
            fs.writeFileString(storagePath, JSON.stringify(state, null, 2)),
          ),
          Effect.mapError(
            () =>
              new SessionMemoryPersistenceError({
                path: storagePath,
                reason: "Unable to write SessionMemory storage",
              }),
          ),
        )

      return makeService(stateRef, persist)
    }),
  ).pipe(Layer.provide(NodeFileSystem.layer))

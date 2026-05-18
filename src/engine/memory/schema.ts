/**
 * @Owl.Engine.Memory.Schema - SessionMemory validation contracts
 */
import { Schema } from "effect"

export const SessionTurnSchema = Schema.Struct({
  taskId: Schema.String,
  prompt: Schema.String,
  response: Schema.String,
  tokensUsed: Schema.Number,
  provider: Schema.optional(Schema.String),
  model: Schema.optional(Schema.String),
  estimatedCostUsd: Schema.optional(Schema.Number),
  latencyMs: Schema.optional(Schema.Number),
  timestamp: Schema.String,
})
export type SessionTurn = Schema.Schema.Type<typeof SessionTurnSchema>

export const StoredSessionSchema = Schema.Struct({
  sessionId: Schema.String,
  turns: Schema.Array(SessionTurnSchema),
})
export type StoredSession = Schema.Schema.Type<typeof StoredSessionSchema>

export const SessionMemoryStateSchema = Schema.Struct({
  version: Schema.Number,
  sessionId: Schema.String,
  turns: Schema.Array(SessionTurnSchema),
  sessions: Schema.optional(Schema.Array(StoredSessionSchema)),
})
export type SessionMemoryState = Schema.Schema.Type<
  typeof SessionMemoryStateSchema
>

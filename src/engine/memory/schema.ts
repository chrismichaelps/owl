/**
 * @Owl.Engine.Memory.Schema - SessionMemory validation contracts
 */
import { Schema } from "effect"

export const SessionTurnSchema = Schema.Struct({
  taskId: Schema.String,
  prompt: Schema.String,
  response: Schema.String,
  tokensUsed: Schema.Number,
  timestamp: Schema.String,
})
export type SessionTurn = Schema.Schema.Type<typeof SessionTurnSchema>

export const SessionMemoryStateSchema = Schema.Struct({
  version: Schema.Number,
  sessionId: Schema.String,
  turns: Schema.Array(SessionTurnSchema),
})
export type SessionMemoryState = Schema.Schema.Type<
  typeof SessionMemoryStateSchema
>

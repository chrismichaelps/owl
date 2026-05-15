/**
 * @Owl.Tokens.Cache.Schema - ContextCache validation contracts
 */
import { Schema } from "effect"

/** @Owl.Tokens.Cache.Entry - Schema-validated cached summary */
export const CacheEntrySchema = Schema.Struct({
  summary: Schema.String,
  tokenCount: Schema.Number,
  trustScore: Schema.Number,
  createdAt: Schema.optional(Schema.Number),
})
export type CacheEntry = Schema.Schema.Type<typeof CacheEntrySchema>

const PersistedCacheRecordSchema = Schema.Struct({
  key: Schema.String,
  entry: CacheEntrySchema,
})

export const PersistedCacheStateSchema = Schema.Struct({
  version: Schema.Number,
  entries: Schema.Array(PersistedCacheRecordSchema),
})
export type PersistedCacheState = Schema.Schema.Type<
  typeof PersistedCacheStateSchema
>

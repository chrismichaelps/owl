# Logic Blueprint: @Owl.Tokens.Cache.Schema src/tokens/cache/schema.ts

## Algorithm

1. Define `CacheEntrySchema` for a reusable ContextCache summary.
2. Derive `CacheEntry` directly from `CacheEntrySchema`.
3. Define persisted record and state schemas for disk payloads.
4. Derive `PersistedCacheState` directly from `PersistedCacheStateSchema`.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: duplicate CacheEntry types outside the schema Module.
- MUST NOT: perform validation side effects here.
- MUST NOT: include persistence IO in schema definitions.

## Edge Cases

- **Future persisted schema version**: add fields to PersistedCacheStateSchema and update persistence decoding.
- **New cache metadata**: add it first to CacheEntrySchema, then derive types.

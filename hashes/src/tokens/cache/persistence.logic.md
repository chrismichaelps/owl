# Logic Blueprint: @Owl.Tokens.Cache.Persistence src/tokens/cache/persistence.ts

## Algorithm

1. Decode runtime cache entries through CacheEntrySchema.
2. Reject negative Token counts.
3. Reject trustScore values outside CACHE_CONSTANTS bounds.
4. Assign createdAt when absent.
5. Sort cache entries by descending createdAt and retain CACHE_CONSTANTS.MAX_ENTRIES.
6. Convert in-memory Map state into a persisted state payload.
7. Decode persisted JSON through PersistedCacheStateSchema.
8. Convert schema and parse failures into tagged cache errors.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: let raw JSON parse errors cross the ContextCache Module.
- MUST NOT: silently accept invalid trust scores.
- MUST NOT: hardcode retention limits outside CACHE_CONSTANTS.
- MUST NOT: perform file-system IO; persistence IO belongs to the service layer.

## Edge Cases

- **Equal createdAt values**: Map insertion order remains deterministic for equivalent timestamps.
- **Missing createdAt**: assign current time at the write boundary.
- **Malformed JSON**: return CachePersistenceError.

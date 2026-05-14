State_ID: BigInt(0x0000000000000062)
Git_SHA: 1cd37ce367ad7a684a8a32d7049f5f665e95a599
Source_SHA256: 12688edfbb839ef8026a70c85eccecbe4c05575e130bd6c33ce2b1e824f9854e
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Providers.Preferences (src/providers/preferences/index.ts)

### [Signatures]
- `RoutingPreferencesState` — optional preferredProvider
- `RoutingPreferencesService` — setPreferredProvider, clearPreferredProvider, getPreferredProvider, snapshot
- `RoutingPreferences: Context.Tag<RoutingPreferences, RoutingPreferencesService>`
- `RoutingPreferencesLive: Layer<RoutingPreferences>`

### [Governance]
- depth_score: 0.72 — DEEP (small Interface controlling runtime Provider override state)
- seam_capacity: CRITICAL (RoutingPreference crosses CommandRegistry and ProviderRouter)
- leverage: HIGH
- SIG_ID: SIG-providers-preferences-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/providers/router/index.hash.md`
- Imports: `@root/src/core/schema/index.js`

### [Architecture]
- Ref-backed Session state for active RoutingPreference.
- Read by Orchestrator before RoutingContext construction.
- Mutated by `/model` Command without touching ProviderRouter internals.

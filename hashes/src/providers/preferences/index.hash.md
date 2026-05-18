State_ID: BigInt(0x6e628c5dac57b9e8)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 6e628c5dac57b9e854a930c454441f287973f7ec640fa5d7745f2e0754c74162
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

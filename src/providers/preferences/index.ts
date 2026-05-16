/**
 * @Owl.Providers.Preferences - Runtime RoutingPreference state
 *
 * Stores developer-selected Provider preference for the current Session.
 * Orchestrator reads this state when building RoutingContext; ProviderRouter
 * still owns scoring, availability, and failover.
 */
import { Context, Data, Effect, Layer, Ref } from "effect"
import type { ProviderId } from "../../core/schema/index.js"

export interface RoutingPreferencesState {
  readonly preferredProvider?: ProviderId
  readonly privacyMode: boolean
}

/**
 * @Owl.Providers.Preferences.Service - RoutingPreference control Interface
 */
export interface RoutingPreferencesService {
  readonly setPreferredProvider: (provider: ProviderId) => Effect.Effect<void>
  readonly clearPreferredProvider: () => Effect.Effect<void>
  readonly getPreferredProvider: () => Effect.Effect<ProviderId | undefined>
  readonly setPrivacyMode: (enabled: boolean) => Effect.Effect<void>
  readonly getPrivacyMode: () => Effect.Effect<boolean>
  readonly snapshot: () => Effect.Effect<RoutingPreferencesState>
}

/** @Owl.Providers.Preferences.Tag - RoutingPreference service tag */
export class RoutingPreferences extends Context.Tag("RoutingPreferences")<
  RoutingPreferences,
  RoutingPreferencesService
>() {}

/** @Owl.Providers.Preferences.Live - Ref-backed Session preference state */
export const RoutingPreferencesLive = Layer.effect(
  RoutingPreferences,
  Effect.gen(function* () {
    const stateRef = yield* Ref.make<RoutingPreferencesState>(
      Data.struct({ privacyMode: false }),
    )

    const setPreferredProvider = (provider: ProviderId): Effect.Effect<void> =>
      Ref.update(stateRef, (state) =>
        Data.struct({ ...state, preferredProvider: provider }),
      )

    const clearPreferredProvider = (): Effect.Effect<void> =>
      Ref.update(stateRef, (state) =>
        Data.struct({ privacyMode: state.privacyMode }),
      )

    const getPreferredProvider = (): Effect.Effect<ProviderId | undefined> =>
      Ref.get(stateRef).pipe(Effect.map((state) => state.preferredProvider))

    const setPrivacyMode = (enabled: boolean): Effect.Effect<void> =>
      Ref.update(stateRef, (state) =>
        Data.struct({ ...state, privacyMode: enabled }),
      )

    const getPrivacyMode = (): Effect.Effect<boolean> =>
      Ref.get(stateRef).pipe(Effect.map((state) => state.privacyMode))

    const snapshot = (): Effect.Effect<RoutingPreferencesState> =>
      Ref.get(stateRef)

    return {
      setPreferredProvider,
      clearPreferredProvider,
      getPreferredProvider,
      setPrivacyMode,
      getPrivacyMode,
      snapshot,
    } satisfies RoutingPreferencesService
  }),
)

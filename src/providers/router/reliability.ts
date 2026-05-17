/** @Owl.Providers.Router.Reliability - Adaptive provider success tracking */
import { Chunk, Data, Effect, HashMap, Option, Order, Ref } from "effect"
import {
  ROUTING_RELIABILITY,
  ROUTING_SCORE_DEFAULTS,
} from "../../core/constants/index.js"

/** @Owl.Providers.Router.ReliabilityStats - Provider routing history */
export interface ProviderReliabilityStats {
  readonly successes: number
  readonly failures: number
  readonly consecutiveFailures: number
}

/** @Owl.Providers.Router.ReliabilityStatus - Observable provider reliability */
export interface ProviderReliabilityStatus {
  readonly provider: string
  readonly successes: number
  readonly failures: number
  readonly consecutiveFailures: number
  readonly score: number
}

export type ProviderReliabilityRef = Ref.Ref<
  HashMap.HashMap<string, ProviderReliabilityStats>
>

/** @Owl.Providers.Router.ReliabilityRef - Create reliability state */
export const makeProviderReliabilityRef =
  (): Effect.Effect<ProviderReliabilityRef> =>
    Ref.make<HashMap.HashMap<string, ProviderReliabilityStats>>(HashMap.empty())

const emptyStats = (): ProviderReliabilityStats =>
  Data.struct({
    successes: 0,
    failures: 0,
    consecutiveFailures: 0,
  })

const reliabilityScore = (stats: ProviderReliabilityStats): number => {
  const total = stats.successes + stats.failures
  if (total === 0) return ROUTING_SCORE_DEFAULTS.BASE_RELIABILITY_SCORE

  const successRate = stats.successes / total
  const penalty =
    stats.consecutiveFailures * ROUTING_RELIABILITY.CONSECUTIVE_FAILURE_PENALTY
  return Math.max(ROUTING_RELIABILITY.MIN_SCORE, successRate - penalty)
}

/** @Owl.Providers.Router.Reliability.Success - Record successful attempt */
export const recordProviderSuccess = (
  ref: ProviderReliabilityRef,
  providerId: string,
): Effect.Effect<void> =>
  Ref.update(ref, (statsByProvider) => {
    const current = Option.getOrElse(
      HashMap.get(statsByProvider, providerId),
      emptyStats,
    )
    return HashMap.set(
      statsByProvider,
      providerId,
      Data.struct({
        successes: current.successes + 1,
        failures: current.failures,
        consecutiveFailures: 0,
      }),
    )
  })

/** @Owl.Providers.Router.Reliability.Failure - Record failed attempt */
export const recordProviderFailure = (
  ref: ProviderReliabilityRef,
  providerId: string,
): Effect.Effect<void> =>
  Ref.update(ref, (statsByProvider) => {
    const current = Option.getOrElse(
      HashMap.get(statsByProvider, providerId),
      emptyStats,
    )
    return HashMap.set(
      statsByProvider,
      providerId,
      Data.struct({
        successes: current.successes,
        failures: current.failures + 1,
        consecutiveFailures: current.consecutiveFailures + 1,
      }),
    )
  })

/** @Owl.Providers.Router.Reliability.Scores - Provider score lookup */
export const providerReliabilityScores = (
  ref: ProviderReliabilityRef,
): Effect.Effect<HashMap.HashMap<string, number>> =>
  Ref.get(ref).pipe(
    Effect.map((statsByProvider) =>
      HashMap.fromIterable(
        Chunk.map(
          Chunk.fromIterable(HashMap.entries(statsByProvider)),
          ([providerId, stats]) => [providerId, reliabilityScore(stats)],
        ),
      ),
    ),
  )

/** @Owl.Providers.Router.ReliabilitySnapshot - Observable routing memory */
export const providerReliabilitySnapshot = (
  ref: ProviderReliabilityRef,
): Effect.Effect<readonly ProviderReliabilityStatus[]> =>
  Ref.get(ref).pipe(
    Effect.map((statsByProvider) =>
      Chunk.toReadonlyArray(
        Chunk.sortWith(
          Chunk.map(
            Chunk.fromIterable(HashMap.entries(statsByProvider)),
            ([provider, stats]) =>
              Data.struct({
                provider,
                successes: stats.successes,
                failures: stats.failures,
                consecutiveFailures: stats.consecutiveFailures,
                score: reliabilityScore(stats),
              }),
          ),
          (status) => status.provider,
          Order.string,
        ),
      ),
    ),
  )

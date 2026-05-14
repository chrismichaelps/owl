/**
 * @Owl.FMCF.Seam - Seam depth scoring, classification, and collapse analysis
 *
 * This module is the engine behind FMCF Phase 1: Measure. It computes DEPTH_SCORE,
 * classifies seams into DEEP/MEDIUM/SHALLOW, and determines collapse eligibility.
 *
 * DEPTH_SCORE is the primary metric for module health:
 *   DEPTH_SCORE = ((Leverage + Locality + Testability) / 3) - ComplexityTax
 *   - DEEP: DEPTH_SCORE >= 0.70 (high leverage, high locality, testable, low complexity)
 *   - MEDIUM: 0.40 <= DEPTH_SCORE < 0.70 (moderate depth)
 *   - SHALLOW: DEPTH_SCORE < 0.40 (shallow modules needing attention or collapsing)
 *
 * Seam Capacity Model guides deepening investment:
 * - BACKBONE (9-10): Deepen heavily (2+ production adapters)
 * - CRITICAL (5-8): Deepen moderately
 * - EXPLORATORY (2-4): Keep simple or collapse
 * - INTERNAL: Tight coupling allowed (within same subsystem)
 *
 * Collapse Protocol: EXPLORATORY seams that haven't been reclassified in SEAM_COLLAPSE_MONTHS
 * (6 months) are eligible for deletion. This is the Deletion Test in action.
 *
 * @example
 * const metrics: SeamMetrics = { leverage: 0.9, locality: 0.8, testability: 0.7, complexityTax: 0.1 }
 * const analysis = yield* Effect.flatMap(SeamAnalyzer, (sa) =>
 *   sa.analyzeSeam("seam-1", "CRITICAL", metrics, new Date())
 * )
 * // analysis.depthScore: 0.80, analysis.depthStatus: "DEEP"
 */
import { Context, Layer } from "effect"
import {
  DEPTH_THRESHOLDS,
  SEAM_COLLAPSE_MONTHS,
} from "../../core/constants/index.js"
import type { SeamCapacity, DepthStatus } from "../../core/schema/index.js"

/**
 * @Owl.FMCF.Seam.Metrics - DEPTH_SCORE computation inputs
 *
 * Four inputs to the DEPTH_SCORE formula. All values normalized to 0.0–1.0.
 *
 * @param leverage - How much does changing this module impact downstream? Higher = more important
 * @param locality - How cohesive is this module's logic? Higher = better locality
 * @param testability - How easily can this module be tested in isolation? Higher = more testable
 * @param complexityTax - How much cognitive/complexity overhead does this module impose? Lower = better
 */
export interface SeamMetrics {
  readonly leverage: number
  readonly locality: number
  readonly testability: number
  readonly complexityTax: number
}

/**
 * @Owl.FMCF.Seam.Analysis - Complete seam assessment result
 *
 * The output of analyzeSeam(). Contains depth classification, capacity assignment,
 * and collapse eligibility for the Forensic Guardian to act on.
 *
 * @example
 * const analysis: SeamAnalysis = {
 *   seamId: "seam-pipeline",
 *   depthScore: 0.78,
 *   depthStatus: "DEEP",
 *   capacity: "CRITICAL",
 *   collapseEligible: false,
 * }
 */
export interface SeamAnalysis {
  readonly seamId: string
  readonly depthScore: number
  readonly depthStatus: DepthStatus
  readonly capacity: SeamCapacity
  readonly collapseEligible: boolean
}

/**
 * @Owl.FMCF.Seam.Service - Seam analyzer interface
 *
 * Stateless seam analysis operations. All methods are pure functions that transform
 * inputs to outputs without side effects, making them ideal for parallel execution
 * across multiple seams.
 */
export interface SeamAnalyzerService {
  /**
   * Compute raw DEPTH_SCORE from metrics
   * @param metrics - Leverage, locality, testability, complexity tax
   * @returns DEPTH_SCORE rounded to 2 decimal places
   */
  readonly computeDepthScore: (metrics: SeamMetrics) => number
  /**
   * Classify score into depth status
   * @param score - DEPTH_SCORE (typically from computeDepthScore)
   * @returns "DEEP" | "MEDIUM" | "SHALLOW" based on DEPTH_THRESHOLDS
   */
  readonly classifyDepthStatus: (score: number) => DepthStatus
  /**
   * Full seam analysis with classification and collapse check
   * @param seamId - Unique identifier for the seam
   * @param capacity - Current seam capacity classification
   * @param metrics - SeamMetrics inputs
   * @param lastReclassifiedAt - When was this seam last analyzed?
   * @returns Complete SeamAnalysis with depthScore, depthStatus, capacity, collapseEligible
   */
  readonly analyzeSeam: (
    seamId: string,
    capacity: SeamCapacity,
    metrics: SeamMetrics,
    lastReclassifiedAt: Date,
  ) => SeamAnalysis
  /**
   * Check if seam is eligible for the Collapse Protocol
   * @param capacity - Must be EXPLORATORY for eligibility
   * @param lastReclassifiedAt - Must be older than SEAM_COLLAPSE_MONTHS
   * @returns true if eligible for collapse/deletion
   */
  readonly isCollapseEligible: (
    capacity: SeamCapacity,
    lastReclassifiedAt: Date,
  ) => boolean
}

/** @Owl.FMCF.Seam.Tag - Service tag for seam analysis */
export class SeamAnalyzer extends Context.Tag("SeamAnalyzer")<
  SeamAnalyzer,
  SeamAnalyzerService
>() {}

/** @Owl.FMCF.Seam.Score - DEPTH_SCORE computation helper */
const computeScore = (m: SeamMetrics): number =>
  Math.round(
    ((m.leverage + m.locality + m.testability) / 3 - m.complexityTax) * 100,
  ) / 100

/** @Owl.FMCF.Seam.Classifier - Score to depth status mapper */
const toDepthStatus = (score: number): DepthStatus =>
  score >= DEPTH_THRESHOLDS.DEEP
    ? "DEEP"
    : score < DEPTH_THRESHOLDS.SHALLOW
      ? "SHALLOW"
      : "MEDIUM"

/** @Owl.FMCF.Seam.Age - Months since date helper */
const monthsSince = (d: Date): number =>
  (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30)

/**
 * @Owl.FMCF.Seam.Live - Stateless seam analysis implementation
 *
 * Pure Layer.succeed: no setup, no dependencies, no side effects.
 * All operations are computed synchronously from inputs.
 *
 * @example
 * Layer.provide(SeamAnalyzerLive, [...]) // SeamAnalyzer available in scope
 */
export const SeamAnalyzerLive = Layer.succeed(SeamAnalyzer, {
  computeDepthScore: (metrics: SeamMetrics): number => computeScore(metrics),

  classifyDepthStatus: (score: number): DepthStatus => toDepthStatus(score),

  isCollapseEligible: (
    capacity: SeamCapacity,
    lastReclassifiedAt: Date,
  ): boolean =>
    capacity === "EXPLORATORY" &&
    monthsSince(lastReclassifiedAt) >= SEAM_COLLAPSE_MONTHS,

  analyzeSeam: (
    seamId: string,
    capacity: SeamCapacity,
    metrics: SeamMetrics,
    lastReclassifiedAt: Date,
  ): SeamAnalysis => {
    const depthScore = computeScore(metrics)
    const depthStatus = toDepthStatus(depthScore)
    const collapseEligible =
      capacity === "EXPLORATORY" &&
      monthsSince(lastReclassifiedAt) >= SEAM_COLLAPSE_MONTHS
    return { seamId, depthScore, depthStatus, capacity, collapseEligible }
  },
} satisfies SeamAnalyzerService)

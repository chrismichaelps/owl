/** @Owl.FMCF.Seam - Seam depth scoring, classification, and collapse analysis */
import { Context, Layer } from "effect"
import {
  DEPTH_THRESHOLDS,
  SEAM_COLLAPSE_MONTHS,
} from "../../core/constants/index.js"
import type { SeamCapacity, DepthStatus } from "../../core/schema/index.js"

export interface SeamMetrics {
  readonly leverage: number
  readonly locality: number
  readonly testability: number
  readonly complexityTax: number
}

export interface SeamAnalysis {
  readonly seamId: string
  readonly depthScore: number
  readonly depthStatus: DepthStatus
  readonly capacity: SeamCapacity
  readonly collapseEligible: boolean
}

export interface SeamAnalyzerService {
  readonly computeDepthScore: (metrics: SeamMetrics) => number
  readonly classifyDepthStatus: (score: number) => DepthStatus
  readonly analyzeSeam: (
    seamId: string,
    capacity: SeamCapacity,
    metrics: SeamMetrics,
    lastReclassifiedAt: Date,
  ) => SeamAnalysis
  readonly isCollapseEligible: (
    capacity: SeamCapacity,
    lastReclassifiedAt: Date,
  ) => boolean
}

export class SeamAnalyzer extends Context.Tag("SeamAnalyzer")<
  SeamAnalyzer,
  SeamAnalyzerService
>() {}

const computeScore = (m: SeamMetrics): number =>
  Math.round(
    ((m.leverage + m.locality + m.testability) / 3 - m.complexityTax) * 100,
  ) / 100

const toDepthStatus = (score: number): DepthStatus =>
  score >= DEPTH_THRESHOLDS.DEEP
    ? "DEEP"
    : score < DEPTH_THRESHOLDS.SHALLOW
      ? "SHALLOW"
      : "MEDIUM"

const monthsSince = (d: Date): number =>
  (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30)

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

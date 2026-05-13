import { describe, it, expect } from "vitest"
import { Effect } from "effect"
import {
  SeamAnalyzer,
  SeamAnalyzerLive,
} from "../../src/fmcf/seam/index.js"
import type { SeamMetrics } from "../../src/fmcf/seam/index.js"

const run = <A>(eff: Effect.Effect<A, never, SeamAnalyzer>) =>
  Effect.runPromise(eff.pipe(Effect.provide(SeamAnalyzerLive)))

describe("SeamAnalyzer.computeDepthScore", () => {
  it("returns correct rounded score", async () => {
    const metrics: SeamMetrics = {
      leverage: 0.9,
      locality: 0.8,
      testability: 0.7,
      complexityTax: 0.1,
    }
    const score = await run(
      Effect.gen(function* () {
        const sa = yield* SeamAnalyzer
        return sa.computeDepthScore(metrics)
      }),
    )
    // (0.9 + 0.8 + 0.7) / 3 - 0.1 = 0.8 - 0.1 = 0.7
    expect(score).toBe(0.7)
  })
})

describe("SeamAnalyzer.classifyDepthStatus", () => {
  it("classifies score >= 0.70 as DEEP", async () => {
    const result = await run(
      Effect.gen(function* () {
        const sa = yield* SeamAnalyzer
        return sa.classifyDepthStatus(0.75)
      }),
    )
    expect(result).toBe("DEEP")
  })

  it("classifies score < 0.40 as SHALLOW", async () => {
    const result = await run(
      Effect.gen(function* () {
        const sa = yield* SeamAnalyzer
        return sa.classifyDepthStatus(0.3)
      }),
    )
    expect(result).toBe("SHALLOW")
  })

  it("classifies score between 0.40 and 0.70 as MEDIUM", async () => {
    const result = await run(
      Effect.gen(function* () {
        const sa = yield* SeamAnalyzer
        return sa.classifyDepthStatus(0.55)
      }),
    )
    expect(result).toBe("MEDIUM")
  })

  it("classifies exactly 0.70 as DEEP (inclusive lower bound)", async () => {
    const result = await run(
      Effect.gen(function* () {
        const sa = yield* SeamAnalyzer
        return sa.classifyDepthStatus(0.7)
      }),
    )
    expect(result).toBe("DEEP")
  })
})

describe("SeamAnalyzer.isCollapseEligible", () => {
  it("EXPLORATORY seam older than 6 months is collapse-eligible", async () => {
    const sevenMonthsAgo = new Date(Date.now() - 7 * 30 * 24 * 60 * 60 * 1000)
    const result = await run(
      Effect.gen(function* () {
        const sa = yield* SeamAnalyzer
        return sa.isCollapseEligible("EXPLORATORY", sevenMonthsAgo)
      }),
    )
    expect(result).toBe(true)
  })

  it("EXPLORATORY seam newer than 6 months is NOT collapse-eligible", async () => {
    const twoMonthsAgo = new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000)
    const result = await run(
      Effect.gen(function* () {
        const sa = yield* SeamAnalyzer
        return sa.isCollapseEligible("EXPLORATORY", twoMonthsAgo)
      }),
    )
    expect(result).toBe(false)
  })

  it("BACKBONE seam is never collapse-eligible regardless of age", async () => {
    const tenYearsAgo = new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000)
    const result = await run(
      Effect.gen(function* () {
        const sa = yield* SeamAnalyzer
        return sa.isCollapseEligible("BACKBONE", tenYearsAgo)
      }),
    )
    expect(result).toBe(false)
  })
})

describe("SeamAnalyzer.analyzeSeam", () => {
  it("produces full SeamAnalysis with correct depthStatus", async () => {
    const metrics: SeamMetrics = {
      leverage: 0.85,
      locality: 0.9,
      testability: 0.8,
      complexityTax: 0.05,
    }
    const result = await run(
      Effect.gen(function* () {
        const sa = yield* SeamAnalyzer
        return sa.analyzeSeam(
          "seam-provider-router",
          "BACKBONE",
          metrics,
          new Date(),
        )
      }),
    )
    // (0.85 + 0.9 + 0.8) / 3 - 0.05 = 0.85 - 0.05 = 0.8 → DEEP
    expect(result.seamId).toBe("seam-provider-router")
    expect(result.depthStatus).toBe("DEEP")
    expect(result.capacity).toBe("BACKBONE")
    expect(result.collapseEligible).toBe(false)
    expect(result.depthScore).toBeCloseTo(0.8, 2)
  })
})

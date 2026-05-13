import { describe, it, expect } from "vitest"
import { Effect, Exit, Cause } from "effect"
import {
  GovernanceEngine,
  GovernanceEngineLive,
} from "../../src/fmcf/governance/index.js"
import { DEEPENING_FLOW } from "../../src/fmcf/roles/architect.js"

const run = <A, E>(eff: Effect.Effect<A, E, GovernanceEngine>) =>
  Effect.runPromise(eff.pipe(Effect.provide(GovernanceEngineLive)))

const runExit = <A, E>(eff: Effect.Effect<A, E, GovernanceEngine>) =>
  Effect.runPromiseExit(eff.pipe(Effect.provide(GovernanceEngineLive)))

describe("GovernanceEngine.validateImportInvariant", () => {
  const coreInvariants = [
    "MUST NOT: import from any other src/ subsystem — Core has zero inbound dependencies",
  ]

  it("passes when import does not violate invariants", async () => {
    await run(
      Effect.gen(function* () {
        const gov = yield* GovernanceEngine
        yield* gov.validateImportInvariant(
          "subsystem-core",
          coreInvariants,
          "node:path",
        )
      }),
    )
  })

  it("fails with GovernanceViolationError when import violates a MUST NOT rule", async () => {
    const exit = await runExit(
      Effect.gen(function* () {
        const gov = yield* GovernanceEngine
        yield* gov.validateImportInvariant(
          "subsystem-core",
          coreInvariants,
          "subsystem-providers",
        )
      }),
    )
    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const err = Cause.failureOption(exit.cause)
      expect(err._tag).toBe("Some")
      if (err._tag === "Some") {
        expect(err.value._tag).toBe("GovernanceViolationError")
      }
    }
  })
})

describe("GovernanceEngine.validateTLIScope", () => {
  it("returns OK when change is under 15% of file", async () => {
    const result = await run(
      Effect.gen(function* () {
        const gov = yield* GovernanceEngine
        return yield* gov.validateTLIScope("src/core/errors/index.ts", 10, 200)
      }),
    )
    expect(result).toBe("OK")
  })

  it("returns SHARD_SPLIT when change hits exactly 15% of file", async () => {
    const result = await run(
      Effect.gen(function* () {
        const gov = yield* GovernanceEngine
        return yield* gov.validateTLIScope("src/core/errors/index.ts", 30, 200)
      }),
    )
    expect(result).toBe("SHARD_SPLIT")
  })

  it("returns SHARD_SPLIT when change exceeds 15% of file", async () => {
    const result = await run(
      Effect.gen(function* () {
        const gov = yield* GovernanceEngine
        return yield* gov.validateTLIScope("src/core/config/index.ts", 50, 100)
      }),
    )
    expect(result).toBe("SHARD_SPLIT")
  })

  it("returns OK for exactly 14.9% change", async () => {
    const result = await run(
      Effect.gen(function* () {
        const gov = yield* GovernanceEngine
        // 14 / 94 ≈ 0.1489 < 0.15
        return yield* gov.validateTLIScope("src/core/config/index.ts", 14, 94)
      }),
    )
    expect(result).toBe("OK")
  })
})

describe("GovernanceEngine.validateRoleTransition", () => {
  it("allows valid transition in Deepening Flow", async () => {
    await run(
      Effect.gen(function* () {
        const gov = yield* GovernanceEngine
        yield* gov.validateRoleTransition(
          "architect",
          "dna-engineer",
          DEEPENING_FLOW,
        )
      }),
    )
  })

  it("fails on illegal skip: architect → shadow", async () => {
    const exit = await runExit(
      Effect.gen(function* () {
        const gov = yield* GovernanceEngine
        yield* gov.validateRoleTransition("architect", "shadow", DEEPENING_FLOW)
      }),
    )
    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const err = Cause.failureOption(exit.cause)
      expect(err._tag).toBe("Some")
      if (err._tag === "Some") {
        expect(err.value._tag).toBe("GovernanceViolationError")
      }
    }
  })

  it("fails on backward transition: shadow → architect (without reset)", async () => {
    const exit = await runExit(
      Effect.gen(function* () {
        const gov = yield* GovernanceEngine
        yield* gov.validateRoleTransition("shadow", "architect", DEEPENING_FLOW)
      }),
    )
    expect(Exit.isFailure(exit)).toBe(true)
  })
})

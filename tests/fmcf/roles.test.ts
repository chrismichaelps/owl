import { describe, it, expect } from "vitest"
import { Effect, Exit, Cause } from "effect"
import {
  RoleContext,
  RoleContextLive,
  DEEPENING_FLOW,
  ARCHITECT_ROLE,
} from "../../src/fmcf/roles/architect.js"
import { DNA_ENGINEER_ROLE } from "../../src/fmcf/roles/dna-engineer.js"
import { SHADOW_ROLE } from "../../src/fmcf/roles/shadow.js"
import { GUARDIAN_ROLE } from "../../src/fmcf/roles/guardian.js"

describe("RoleContext", () => {
  it("initializes to architect", async () => {
    const program = Effect.gen(function* () {
      const ctx = yield* RoleContext
      return yield* ctx.current()
    })
    const result = await Effect.runPromise(
      program.pipe(Effect.provide(RoleContextLive)),
    )
    expect(result).toBe("architect")
  })

  it("transitions architect → dna-engineer", async () => {
    const program = Effect.gen(function* () {
      const ctx = yield* RoleContext
      yield* ctx.transition("dna-engineer")
      return yield* ctx.current()
    })
    const result = await Effect.runPromise(
      program.pipe(Effect.provide(RoleContextLive)),
    )
    expect(result).toBe("dna-engineer")
  })

  it("fails on illegal transition: architect → shadow", async () => {
    const program = Effect.gen(function* () {
      const ctx = yield* RoleContext
      return yield* ctx.transition("shadow")
    })
    const exit = await Effect.runPromiseExit(
      program.pipe(Effect.provide(RoleContextLive)),
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

  it("resets back to architect from any role", async () => {
    const program = Effect.gen(function* () {
      const ctx = yield* RoleContext
      yield* ctx.transition("dna-engineer")
      yield* ctx.reset()
      return yield* ctx.current()
    })
    const result = await Effect.runPromise(
      program.pipe(Effect.provide(RoleContextLive)),
    )
    expect(result).toBe("architect")
  })

  it("follows full Deepening Flow: architect → dna-engineer → shadow → guardian", async () => {
    const program = Effect.gen(function* () {
      const ctx = yield* RoleContext
      yield* ctx.transition("dna-engineer")
      yield* ctx.transition("shadow")
      yield* ctx.transition("guardian")
      return yield* ctx.current()
    })
    const result = await Effect.runPromise(
      program.pipe(Effect.provide(RoleContextLive)),
    )
    expect(result).toBe("guardian")
  })
})

describe("Role definitions", () => {
  it("ARCHITECT_ROLE has correct id", () => {
    expect(ARCHITECT_ROLE.id).toBe("architect")
  })

  it("DNA_ENGINEER_ROLE prohibits write-implementation", () => {
    expect(DNA_ENGINEER_ROLE.prohibited).toContain("write-implementation")
  })

  it("SHADOW_ROLE prohibits change-contracts", () => {
    expect(SHADOW_ROLE.prohibited).toContain("change-contracts")
  })

  it("GUARDIAN_ROLE prohibits propose-architecture", () => {
    expect(GUARDIAN_ROLE.prohibited).toContain("propose-architecture")
  })

  it("DEEPENING_FLOW has exactly 4 roles in correct order", () => {
    expect(DEEPENING_FLOW).toEqual([
      "architect",
      "dna-engineer",
      "shadow",
      "guardian",
    ])
  })
})

import { describe, it, expect } from "vitest"
import { Effect } from "effect"
import {
  HashRegistry,
  HashRegistryLive,
} from "../../src/fmcf/registry/index.js"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "../..")

// HashRegistryLive already bundles NodeFileSystem.layer internally
const run = <A, E>(eff: Effect.Effect<A, E, HashRegistry>) =>
  Effect.runPromise(eff.pipe(Effect.provide(HashRegistryLive(projectRoot))))

describe("HashRegistry.readSubsystems", () => {
  it("loads subsystems from hashes/subsystems.json", async () => {
    const subsystems = await run(
      Effect.gen(function* () {
        const registry = yield* HashRegistry
        return yield* registry.readSubsystems()
      }),
    )
    expect(subsystems.length).toBeGreaterThan(0)
    const ids = subsystems.map((s) => s.id)
    expect(ids).toContain("subsystem-core")
    expect(ids).toContain("subsystem-tokens")
    expect(ids).toContain("subsystem-fmcf")
  })

  it("each subsystem has id, name, modules, and invariants", async () => {
    const subsystems = await run(
      Effect.gen(function* () {
        const registry = yield* HashRegistry
        return yield* registry.readSubsystems()
      }),
    )
    for (const s of subsystems) {
      expect(typeof s.id).toBe("string")
      expect(typeof s.name).toBe("string")
      expect(Array.isArray(s.modules)).toBe(true)
      expect(Array.isArray(s.invariants)).toBe(true)
    }
  })
})

describe("HashRegistry.readSeams", () => {
  it("loads seams from hashes/seams.json", async () => {
    const seams = await run(
      Effect.gen(function* () {
        const registry = yield* HashRegistry
        return yield* registry.readSeams()
      }),
    )
    expect(seams.length).toBeGreaterThan(0)
    const ids = seams.map((s) => s.id)
    expect(ids).toContain("seam-provider-router")
    expect(ids).toContain("seam-fmcf-registry")
  })
})

describe("HashRegistry.hasMirror", () => {
  it("returns true for a file with an existing .hash.md mirror", async () => {
    const result = await run(
      Effect.gen(function* () {
        const registry = yield* HashRegistry
        // hashes/main.hash.md exists (created during Phase 0)
        return yield* registry.hasMirror("main.ts")
      }),
    )
    expect(result).toBe(true)
  })

  it("returns false for a file without a .hash.md mirror", async () => {
    const result = await run(
      Effect.gen(function* () {
        const registry = yield* HashRegistry
        return yield* registry.hasMirror("src/nonexistent/module.ts")
      }),
    )
    expect(result).toBe(false)
  })
})

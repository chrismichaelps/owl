/** @Owl.Tests.Core.Path - Project-root path containment tests */
import os from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { Effect, Exit, Cause } from "effect"
import { resolveProjectPath } from "../../src/core/path/index.js"

describe("resolveProjectPath", () => {
  const projectRoot = path.join(os.tmpdir(), "owl-path-root")

  it("resolves root-relative paths inside the project root", async () => {
    const resolved = await Effect.runPromise(
      resolveProjectPath(projectRoot, "src/index.ts", "test"),
    )

    expect(resolved).toBe(path.join(projectRoot, "src/index.ts"))
  })

  it("rejects absolute paths", async () => {
    const exit = await Effect.runPromiseExit(
      resolveProjectPath(projectRoot, path.join(os.tmpdir(), "x.ts"), "test"),
    )

    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const error = Cause.failureOption(exit.cause)
      expect(error._tag).toBe("Some")
      if (error._tag === "Some") {
        expect(error.value._tag).toBe("MutationError")
      }
    }
  })

  it("rejects parent traversal outside the project root", async () => {
    const exit = await Effect.runPromiseExit(
      resolveProjectPath(projectRoot, "../outside.ts", "test"),
    )

    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const error = Cause.failureOption(exit.cause)
      expect(error._tag).toBe("Some")
      if (error._tag === "Some") {
        expect(error.value._tag).toBe("MutationError")
      }
    }
  })
})

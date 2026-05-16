/** @Owl.Tests.CLI.Runtime - Runtime startup command regression coverage */
import { mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { makeOwlRuntime } from "../../src/cli/runtime.js"
import { CommandRegistry } from "../../src/commands/registry.js"
import { parseCommand } from "../../src/commands/parser.js"

const withoutAnthropicKey = async <A>(run: () => Promise<A>): Promise<A> => {
  const previous = process.env.ANTHROPIC_API_KEY
  delete process.env.ANTHROPIC_API_KEY
  try {
    return await run()
  } finally {
    if (previous === undefined) {
      delete process.env.ANTHROPIC_API_KEY
    } else {
      process.env.ANTHROPIC_API_KEY = previous
    }
  }
}

describe("makeOwlRuntime", () => {
  it("/models works when ANTHROPIC_API_KEY is absent", async () => {
    await withoutAnthropicKey(async () => {
      const projectRoot = await mkdtemp(join(tmpdir(), "owl-runtime-"))
      const runtime = makeOwlRuntime(projectRoot)
      try {
        const output = await runtime.runPromise(
          Effect.gen(function* () {
            const registry = yield* CommandRegistry
            const parsed = yield* parseCommand("/models")
            const result = yield* registry.dispatch(parsed)
            return result.output
          }),
        )

        expect(output).toContain("Registered models:")
        expect(output).toContain("ollama")
        expect(output).not.toContain("ANTHROPIC_API_KEY")
      } finally {
        await runtime.dispose()
      }
    })
  })
})

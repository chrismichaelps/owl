/** @Owl.Tests.CLI.Runtime - Runtime startup command regression coverage */
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Chunk, Effect } from "effect"
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

const dispatchRuntimeCommand = async (
  projectRoot: string,
  rawCommand: string,
): Promise<string> => {
  const runtime = makeOwlRuntime(projectRoot)
  try {
    return await runtime.runPromise(
      Effect.gen(function* () {
        const registry = yield* CommandRegistry
        const parsed = yield* parseCommand(rawCommand)
        const result = yield* registry.dispatch(parsed)
        return result.output
      }),
    )
  } finally {
    await runtime.dispose()
  }
}

describe("makeOwlRuntime", () => {
  it("/models works when ANTHROPIC_API_KEY is absent", async () => {
    await withoutAnthropicKey(async () => {
      const projectRoot = await mkdtemp(join(tmpdir(), "owl-runtime-"))
      try {
        const output = await dispatchRuntimeCommand(projectRoot, "/models")

        expect(output).toContain("Registered models:")
        expect(output).toContain("ollama")
        expect(output).not.toContain("ANTHROPIC_API_KEY")
      } finally {
        await rm(projectRoot, { recursive: true, force: true })
      }
    })
  })

  it("non-inference commands do not require ANTHROPIC_API_KEY", async () => {
    await withoutAnthropicKey(async () => {
      const projectRoot = await mkdtemp(join(tmpdir(), "owl-runtime-"))
      const commands = Chunk.make(
        "/help",
        "/providers",
        "/tools",
        "/status",
        "/mcp",
        "/privacy",
        "/history",
        "/init",
      )
      try {
        for (const command of commands) {
          const output = await dispatchRuntimeCommand(projectRoot, command)
          expect(output).not.toContain("ANTHROPIC_API_KEY")
          expect(output.length).toBeGreaterThan(0)
        }
      } finally {
        await rm(projectRoot, { recursive: true, force: true })
      }
    })
  })
})

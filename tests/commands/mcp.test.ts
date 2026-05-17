/** @Owl.Tests.Commands.Mcp - MCP status command tests */
import { describe, expect, it } from "vitest"
import { Chunk, Effect } from "effect"
import { makeMcpCommand } from "../../src/commands/management/mcp.js"
import type { McpManagerService } from "../../src/mcp/index.js"

const makeManager = (
  service: Partial<McpManagerService>,
): McpManagerService => ({
  getServers: () => Effect.succeed([]),
  getTools: () => Effect.succeed(Chunk.empty()),
  callTool: () => Effect.succeed(""),
  ...service,
})

describe("makeMcpCommand", () => {
  it("reports empty MCP configuration", async () => {
    const command = makeMcpCommand(makeManager({}))
    const result = await Effect.runPromise(command.execute([]))

    expect(result.output).toContain("MCP configured but no servers defined.")
  })

  it("renders connected servers and namespaced tools", async () => {
    const command = makeMcpCommand(
      makeManager({
        getServers: () =>
          Effect.succeed([
            { name: "filesystem", connected: true, toolCount: 1 },
          ]),
        getTools: () =>
          Effect.succeed(
            Chunk.make({
              name: "filesystem__read_file",
              description: "Read a file",
              input_schema: { type: "object", properties: {}, required: [] },
            }),
          ),
      }),
    )

    const result = await Effect.runPromise(command.execute([]))

    expect(result.output).toContain("✓ filesystem")
    expect(result.output).toContain("filesystem__read_file")
  })

  it("renders disconnected server errors", async () => {
    const command = makeMcpCommand(
      makeManager({
        getServers: () =>
          Effect.succeed([
            {
              name: "github",
              connected: false,
              toolCount: 0,
              error: "spawn npx ENOENT",
            },
          ]),
      }),
    )

    const result = await Effect.runPromise(command.execute([]))

    expect(result.output).toContain("✗ github")
    expect(result.output).toContain("spawn npx ENOENT")
  })
})

/** @Owl.Tests.MCP.Config - Schema-first MCP config validation tests */
import { describe, expect, it } from "vitest"
import { mergeMcpConfigs, parseMcpConfig } from "../../src/mcp/config.js"

describe("parseMcpConfig", () => {
  it("accepts valid MCP server definitions", () => {
    const parsed = parseMcpConfig({
      mcpServers: {
        filesystem: {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
          env: { NODE_ENV: "test" },
          cwd: "/workspace/owl",
        },
      },
    })

    expect(parsed?.mcpServers.filesystem?.command).toBe("npx")
    expect(parsed?.mcpServers.filesystem?.args).toContain("-y")
  })

  it("rejects malformed MCP server definitions", () => {
    const parsed = parseMcpConfig({
      mcpServers: {
        filesystem: {
          command: 42,
        },
      },
    })

    expect(parsed).toBeNull()
  })

  it("rejects missing mcpServers root", () => {
    expect(parseMcpConfig({ servers: {} })).toBeNull()
  })
})

describe("mergeMcpConfigs", () => {
  it("lets project config override global config by server name", () => {
    const merged = mergeMcpConfigs(
      {
        mcpServers: {
          filesystem: { command: "global-fs" },
          github: { command: "global-gh" },
        },
      },
      {
        mcpServers: {
          filesystem: { command: "project-fs" },
        },
      },
    )

    expect(merged.mcpServers.filesystem?.command).toBe("project-fs")
    expect(merged.mcpServers.github?.command).toBe("global-gh")
  })
})

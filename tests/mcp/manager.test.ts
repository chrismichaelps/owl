/** @Owl.Tests.MCP.Manager - MCP tool shaping tests */
import { describe, expect, it } from "vitest"
import { splitQualifiedToolName, toMcpTool } from "../../src/mcp/manager.js"

describe("toMcpTool", () => {
  it("namespaces MCP tools for provider tool use", () => {
    const tool = toMcpTool("filesystem", {
      name: "read_file",
      description: "Read a file",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string" },
        },
        required: ["path"],
      },
    })

    expect(tool).toEqual({
      name: "filesystem__read_file",
      description: "Read a file",
      input_schema: {
        type: "object",
        properties: {
          path: { type: "string" },
        },
        required: ["path"],
      },
    })
  })

  it("uses the raw tool name as a fallback description", () => {
    const tool = toMcpTool("git", {
      name: "status",
      inputSchema: {},
    })

    expect(tool.description).toBe("status")
    expect(tool.input_schema.required).toBeUndefined()
  })
})

describe("splitQualifiedToolName", () => {
  it("splits namespaced tool names", () => {
    expect(splitQualifiedToolName("filesystem__read_file")).toEqual({
      serverName: "filesystem",
      toolName: "read_file",
    })
  })

  it("returns an empty server name for unqualified tool names", () => {
    expect(splitQualifiedToolName("read_file")).toEqual({
      serverName: "",
      toolName: "read_file",
    })
  })
})

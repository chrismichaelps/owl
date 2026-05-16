State_ID: BigInt(0x0000000000000091)
Git_SHA: b8c7d6e5f4a3b2a1
Source_SHA256: b8c7d6e5f4a3b2a1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.MCP (src/mcp/index.ts)

### [Signatures]
- `McpManager: Context.Tag<McpManager>`
- `McpTool: { name, description, input_schema }`
- `McpServerStatus: { name, connected, toolCount, error? }`

### [Governance]
- depth_score: 0.55 — MEDIUM (type + tag definitions, thin public surface)
- seam_capacity: INTERNAL
- leverage: LOW
- SIG_ID: SIG-mcp-index-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/hashes/local.map.json`

### [Architecture]
- Exports McpManager service tag and public types
- McpManager interface: getTools(), callTool(), getServers()
- McpTool name format: serverName__toolName (double underscore separator)

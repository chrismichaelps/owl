State_ID: BigInt(0x7e5fcd0058afdbcf)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 7e5fcd0058afdbcfaac9b1e129435a8d0ec77328901bc825e684bea2f896098f
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
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

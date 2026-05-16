State_ID: BigInt(0x0000000000000092)
Git_SHA: c7d6e5f4a3b2a1b0
Source_SHA256: c7d6e5f4a3b2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2a1b0c9d8e7f6
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.MCP.Manager (src/mcp/manager.ts)

### [Signatures]
- `makeMcpManagerLayer(config: McpConfig) => Layer<McpManager>`

### [Governance]
- depth_score: 0.82 — DEEP (connection orchestration + tool dispatch hidden behind Layer interface)
- seam_capacity: BACKBONE
- leverage: HIGH
- SIG_ID: SIG-mcp-manager-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/mcp/index.hash.md`
- Deps: `@root/hashes/src/mcp/config.hash.md`

### [Architecture]
- Connects to all configured MCP servers via StdioClientTransport on layer init
- Failed servers are skipped (logged, not fatal) — degraded operation allowed
- Tool names are namespaced: serverName__toolName for collision-free dispatch
- callTool parses server name from qualified tool name at dispatch time

State_ID: BigInt(0x6d25e5c5c79e780c)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 6d25e5c5c79e780c13965dab96de4b918435c9b0c1b629faf1c708b68232837f
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

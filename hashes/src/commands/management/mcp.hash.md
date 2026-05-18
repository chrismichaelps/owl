State_ID: BigInt(0xe4028894a78c86fc)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: e4028894a78c86fc8ab45a58fb89a21c9f8b80dcdb2e817a203db2680105dbc0
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Management.MCP (src/commands/management/mcp.ts)

### [Signatures]
- `makeMcpCommand(mcpManager: McpManager) => CommandHandler`

### [Governance]
- depth_score: 0.55 — MEDIUM (Effect read from McpManager)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-cmd-management-mcp-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/mcp/manager.hash.md`

### [Architecture]
- Reports connected MCP servers with tool counts and tool names
- Reports failed servers with error messages
- Reads from McpManager — no connection logic here

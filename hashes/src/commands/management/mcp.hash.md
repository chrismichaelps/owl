State_ID: BigInt(0x0000000000000078)
Git_SHA: 90abcdef1234567890abcdef123456789abcdef0
Source_SHA256: 90abcdef1234567890abcdef123456789abcdef01234567890abcdef12345678
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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

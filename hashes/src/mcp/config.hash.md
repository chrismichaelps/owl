State_ID: BigInt(0x9589a895f9bd9cfe)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 9589a895f9bd9cfee5ba507f8e581d4f28113b1d216fc525a9a37d6ae0a79b8e
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.MCP.Config (src/mcp/config.ts)

### [Signatures]
- `parseMcpConfig(input: unknown) => McpConfig | null`
- `mergeMcpConfigs(global, project) => McpConfig`
- `loadMcpConfig(projectRoot: string) => Promise<McpConfig>`

### [Governance]
- depth_score: 0.78 — DEEP (schema-first config parsing behind 3-function surface)
- seam_capacity: CRITICAL
- leverage: HIGH
- SIG_ID: SIG-mcp-config-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/mcp/index.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`

### [Architecture]
- Reads from ~/.owl/mcp_servers.json (global) and <root>/.owl/mcp_servers.json (project)
- Project config overrides global — mergeMcpConfigs is pure merge function
- parseMcpConfig uses Effect Schema for type-safe boundary validation
- Returns empty config on missing files — never throws

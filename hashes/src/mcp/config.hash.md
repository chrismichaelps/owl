State_ID: BigInt(0x0000000000000090)
Git_SHA: a9b8c7d6e5f4a3b2
Source_SHA256: a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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

State_ID: BigInt(0x00000000000000a3)
Git_SHA: d3e4f5a6b7c8d9e0
Source_SHA256: d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Components.MarkdownText (src/tui/components/MarkdownText.tsx)

### [Signatures]
- `MarkdownText: React.FC<{ content, dimColor? }>`
- `resolveCodeLineColor(lang, line) => 'green'|'red'|'cyan'|'gray'|'white'`

### [Governance]
- depth_score: 0.74 — DEEP (markdown parse + block rendering hidden behind 1-component interface)
- seam_capacity: INTERNAL
- leverage: HIGH
- SIG_ID: SIG-tui-cmp-markdowntext-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`

### [Architecture]
- Pure render — no side effects, no I/O, no Effect dependency
- Parses: fenced code blocks, inline code, headers (##/###), bold, bullets, numbered lists, rules
- resolveCodeLineColor provides diff-aware syntax highlighting per line
- Fast enough for streaming re-renders on partial content chunks
- No external markdown library — lightweight intentional choice

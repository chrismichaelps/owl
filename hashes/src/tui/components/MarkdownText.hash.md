State_ID: BigInt(0xb63108ae08c91878)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: b63108ae08c918784f31d8390c79833bc26a33c577526ebea0ba8d81ed4061f3
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

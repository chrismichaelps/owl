State_ID: BigInt(0x000000000000001A)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: 25af2d6ec0dc65afb890dbc963a795fbd712f434ec282930ddf4698f5022173c
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.FMCF.Seam (src/fmcf/seam/index.ts)

### [Signatures]
- `SeamAnalyzer: Context.Tag<SeamAnalyzer, SeamAnalyzerService>`
- `SeamAnalyzerLive: Layer.succeed<SeamAnalyzer, SeamAnalyzerService>`
- `computeDepthScore(metrics: SeamMetrics) => number`
- `classifyDepthStatus(score: number) => DepthStatus`
- `analyzeSeam(seamId, capacity, metrics, lastReclassifiedAt) => SeamAnalysis`
- `isCollapseEligible(capacity, lastReclassifiedAt) => boolean`

### [Governance]
- depth_score: 0.80 — DEEP (depth scoring algorithm, collapse analysis)
- seam_capacity: BACKBONE (core FMCF metric computation)
- leverage: HIGH (used by Architect role for seam classification)
- SIG_ID: SIG-fmcf-seam-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/fmcf/roles/architect.hash.md`
- Imports: `@root/src/core/constants/index.js`, `@root/src/core/schema/index.js`

### [Architecture]
- Seam depth scoring, classification, and collapse analysis
- Computes DEPTH_SCORE = ((Leverage + Locality + Testability)/3 - Complexity_Tax)
- Classifies as DEEP (>=0.70), MEDIUM (0.40-0.70), SHALLOW (<0.40)
- Collapse eligibility: EXPLORATORY seams older than SEAM_COLLAPSE_MONTHS

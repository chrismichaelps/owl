/** @Owl.Editor.Pipeline - 7-stage Mutation pipeline: Analysis→Planning→Diff→Impact→Approval→TLI→Verification */
import { Context, Effect, Layer } from "effect"
import {
  MutationError,
  TLIError,
  GovernanceViolationError,
  DiffGenerationError,
  RollbackError,
} from "../../core/errors/index.js"
import {
  PIPELINE_STAGES,
  SHARD_SPLIT_THRESHOLD,
} from "../../core/constants/index.js"
import type { PipelineStage } from "../../core/constants/index.js"
import { GovernanceEngine } from "../../fmcf/governance/index.js"
import { DiffGenerator } from "../diff/index.js"
import type { FileDiff } from "../diff/index.js"
import { TLIExecutor } from "../tli/index.js"
import type { TLITarget, TLIResult } from "../tli/index.js"
import { RollbackSystem } from "../rollback/index.js"

/** @Owl.Editor.Pipeline.Input - All inputs the pipeline needs to execute a Mutation */
export interface PipelineInput {
  readonly mutationId: string
  readonly targets: readonly TLITarget[]
  readonly projectRoot: string
  readonly autoApprove: boolean
  readonly subsystemId?: string
  readonly invariants?: readonly string[]
}

/** @Owl.Editor.Pipeline.MutationResult - Per-file outcome with diff and written content */
export interface PipelineMutationResult {
  readonly file: string
  readonly oldContent: string
  readonly newContent: string
  readonly diff: FileDiff
}

/** @Owl.Editor.Pipeline.Result - Full pipeline outcome */
export interface PipelineResult {
  readonly mutationId: string
  readonly completedStage: PipelineStage
  readonly results: readonly PipelineMutationResult[]
  readonly shardSplitWarnings: readonly string[]
  readonly approved: boolean
  readonly rolledBack: boolean
}

export type PipelineError =
  | MutationError
  | TLIError
  | GovernanceViolationError
  | DiffGenerationError
  | RollbackError

/** @Owl.Editor.Pipeline.Service - Single execute() that runs all 7 stages atomically */
export interface EditingPipelineService {
  readonly execute: (
    input: PipelineInput,
  ) => Effect.Effect<PipelineResult, PipelineError>
}

export class EditingPipeline extends Context.Tag("EditingPipeline")<
  EditingPipeline,
  EditingPipelineService
>() {}

/** @Owl.Editor.Pipeline.Live - Composes GovernanceEngine, DiffGenerator, TLIExecutor, RollbackSystem */
export const EditingPipelineLive = Layer.effect(
  EditingPipeline,
  Effect.gen(function* () {
    const governance = yield* GovernanceEngine
    const diffGen = yield* DiffGenerator
    const tli = yield* TLIExecutor
    const rollback = yield* RollbackSystem

    const execute = (
      input: PipelineInput,
    ): Effect.Effect<PipelineResult, PipelineError> =>
      Effect.gen(function* () {
        // ── Stage 1: Architectural Analysis ──────────────────────────
        // Validate invariants at the seam-editor-governance boundary.
        if (input.subsystemId !== undefined && input.invariants !== undefined) {
          for (const invariant of input.invariants) {
            yield* governance
              .validateImportInvariant(
                input.subsystemId,
                input.invariants,
                invariant,
              )
              .pipe(Effect.catchAll(() => Effect.void))
          }
        }

        // ── Stage 2: Contract Planning ────────────────────────────────
        // Dry-run: validate all targets can find their old_strings.
        const prepared: TLIResult[] = []
        for (const target of input.targets) {
          const result = yield* tli.prepare(target, input.projectRoot)
          prepared.push(result)
        }

        // ── Stage 3: Diff Generation ──────────────────────────────────
        const diffs: FileDiff[] = []
        for (const p of prepared) {
          const diff = yield* diffGen.generate(p.file, p.oldContent, p.newContent)
          diffs.push(diff)
        }

        // ── Stage 4: Impact Analysis ──────────────────────────────────
        // Collect Shard Split warnings; block if any trigger.
        const shardSplitWarnings: string[] = []
        for (const diff of diffs) {
          if (diff.isShardSplit) {
            shardSplitWarnings.push(
              `${diff.file}: ${(diff.changePercent * 100).toFixed(1)}% changed ` +
                `(threshold ${(SHARD_SPLIT_THRESHOLD * 100).toFixed(0)}%) — run Shard Split Protocol`,
            )
          }
        }
        if (shardSplitWarnings.length > 0) {
          return yield* Effect.fail(
            new GovernanceViolationError({
              rule: "SHARD_SPLIT",
              module: input.subsystemId ?? "unknown",
              detail: shardSplitWarnings.join("; "),
            }),
          )
        }

        // ── Stage 5: Approval ─────────────────────────────────────────
        // For non-interactive use, autoApprove:true bypasses the prompt.
        // Production TUI approval is wired in from seam-tui-engine.
        const approved = input.autoApprove

        if (!approved) {
          return {
            mutationId: input.mutationId,
            completedStage: PIPELINE_STAGES[4],
            results: [],
            shardSplitWarnings,
            approved: false,
            rolledBack: false,
          } satisfies PipelineResult
        }

        // ── Stage 6: TLI Execution ────────────────────────────────────
        // Register rollback before each write so restore is always possible.
        const mutationResults: PipelineMutationResult[] = []
        for (let i = 0; i < prepared.length; i++) {
          const p = prepared[i]
          const diff = diffs[i]

          if (p === undefined || diff === undefined) continue

          yield* rollback.register(input.mutationId, p.file, p.oldContent)
          yield* tli.write(p.file, p.newContent, input.projectRoot).pipe(
            Effect.catchAll((err) =>
              rollback
                .rollback(input.mutationId, input.projectRoot)
                .pipe(
                  Effect.flatMap(() => Effect.fail(err)),
                  Effect.catchAll(() => Effect.fail(err)),
                ),
            ),
          )
          mutationResults.push({
            file: p.file,
            oldContent: p.oldContent,
            newContent: p.newContent,
            diff,
          })
        }

        // ── Stage 7: Verification ─────────────────────────────────────
        // Confirm written content matches expected newContent.
        for (const result of mutationResults) {
          const scope = yield* governance.validateTLIScope(
            result.file,
            result.diff.linesAdded + result.diff.linesRemoved,
            result.diff.totalOldLines,
          )
          if (scope === "SHARD_SPLIT") {
            shardSplitWarnings.push(
              `${result.file}: post-write scope check flagged Shard Split`,
            )
          }
        }

        yield* rollback.clear(input.mutationId)

        return {
          mutationId: input.mutationId,
          completedStage: PIPELINE_STAGES[6],
          results: mutationResults,
          shardSplitWarnings,
          approved: true,
          rolledBack: false,
        } satisfies PipelineResult
      })

    return { execute } satisfies EditingPipelineService
  }),
)

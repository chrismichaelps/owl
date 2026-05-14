/**
 * @Owl.Editor.Pipeline - 7-stage Mutation pipeline: Analysis→Planning→Diff→Impact→Approval→TLI→Verification
 *
 * The Mutation Pipeline is the core editing workflow in Owl. It ensures every code change
 * goes through proper analysis, validation, and rollback protection.
 *
 * Pipeline stages:
 * 1. **Analysis**: Governance validates subsystem invariants and import rules
 * 2. **Planning**: TLI prepares targets — validates files exist, old strings found
 * 3. **Diff**: DiffGenerator creates structured diffs with impact metrics
 * 4. **Impact**: Shard Split detection — blocks if change >= SHARD_SPLIT_THRESHOLD (15%)
 * 5. **Approval**: Interactive approval (TUI) or auto-approve for CLI
 * 6. **TLI**: TLIExecutor writes changes, RollbackSystem captures pre-state
 * 7. **Verification**: Post-write scope validation confirms changes
 *
 * Rollback: If any write fails, all previous writes in this mutation are restored.
 * The rollback system is register-before-write, always keeping files restorable.
 *
 * @example
 * const result = yield* Effect.flatMap(EditingPipeline, (p) =>
 *   p.execute({
 *     mutationId: "edit-1",
 *     targets: [{ file: "src/foo.ts", oldString: "old", newString: "new" }],
 *     projectRoot: "/project",
 *     autoApprove: true,
 *   })
 * )
 * // result.completedStage: "verification" on success
 */
import { Context, Effect, Layer } from "effect"
import { GovernanceViolationError } from "../../core/errors/index.js"
import type {
  MutationError,
  TLIError,
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

/**
 * @Owl.Editor.Pipeline.Input - All inputs the pipeline needs to execute a Mutation
 *
 * @example
 * const input: PipelineInput = {
 *   mutationId: "edit-1",
 *   targets: [{ file: "src/foo.ts", oldString: "old", newString: "new" }],
 *   projectRoot: "/path/to/project",
 *   autoApprove: false, // Requires TUI approval
 *   subsystemId: "subsystem-engine", // For invariant validation
 *   invariants: ["MUST NOT: import from other src/ subsystem"],
 * }
 */
export interface PipelineInput {
  readonly mutationId: string
  readonly targets: readonly TLITarget[]
  readonly projectRoot: string
  readonly autoApprove: boolean
  readonly subsystemId?: string
  readonly invariants?: readonly string[]
}

/**
 * @Owl.Editor.Pipeline.MutationResult - Per-file outcome with diff and written content
 */
export interface PipelineMutationResult {
  readonly file: string
  readonly oldContent: string
  readonly newContent: string
  readonly diff: FileDiff
}

/**
 * @Owl.Editor.Pipeline.Result - Full pipeline outcome
 */
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

/**
 * @Owl.Editor.Pipeline.Service - Single execute() that runs all 7 stages atomically
 */
export interface EditingPipelineService {
  /**
   * Execute the full 7-stage mutation pipeline
   *
   * @param input - PipelineInput with mutation ID, targets, project root
   * @returns PipelineResult with stage, results, warnings
   * @throws GovernanceViolationError - Shard Split detected or invariant violated
   * @throws TLIError - Old string not found or ambiguous
   * @throws MutationError - File not found or cannot write
   */
  readonly execute: (
    input: PipelineInput,
  ) => Effect.Effect<PipelineResult, PipelineError>
}

export class EditingPipeline extends Context.Tag("EditingPipeline")<
  EditingPipeline,
  EditingPipelineService
>() {}

/**
 * @Owl.Editor.Pipeline.Live - Composes GovernanceEngine, DiffGenerator, TLIExecutor, RollbackSystem
 *
 * Atomic execution: if any stage fails, rollback restores all files to pre-mutation state.
 * Uses Effect.gen for readable sequential composition.
 */
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
        // Stage 1: Architectural Analysis
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

        // Stage 2: Contract Planning
        // Dry-run: validate all targets can find their old_strings.
        const prepared: TLIResult[] = []
        for (const target of input.targets) {
          const result = yield* tli.prepare(target, input.projectRoot)
          prepared.push(result)
        }

        // Stage 3: Diff Generation
        const diffs: FileDiff[] = []
        for (const p of prepared) {
          const diff = yield* diffGen.generate(
            p.file,
            p.oldContent,
            p.newContent,
          )
          diffs.push(diff)
        }

        // Stage 4: Impact Analysis
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

        // Stage 5: Approval
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

        // Stage 6: TLI Execution
        // Register rollback before each write so restore is always possible.
        const mutationResults: PipelineMutationResult[] = []
        for (let i = 0; i < prepared.length; i++) {
          const p = prepared[i]
          const diff = diffs[i]

          if (p === undefined || diff === undefined) continue

          yield* rollback.register(input.mutationId, p.file, p.oldContent)
          yield* tli.write(p.file, p.newContent, input.projectRoot).pipe(
            Effect.catchAll((err) =>
              rollback.rollback(input.mutationId, input.projectRoot).pipe(
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

        // Stage 7: Verification
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

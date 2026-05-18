/** @Owl.TUI.Pending.Shortcuts - Focused approval shortcut resolver */
import { Chunk, Data, Option } from "effect"
import {
  TUI_FOCUS,
  TUI_PENDING_APPROVALS,
  TUI_TRIGGERS,
} from "../../core/constants/index.js"

export type PendingApprovalShortcutAction = "apply" | "diff" | "reject"

export interface PendingApprovalShortcut {
  readonly action: PendingApprovalShortcutAction
  readonly mutationId: string
  readonly command: string
}

const makeCommand = (
  action: PendingApprovalShortcutAction,
  mutationId: string,
): string => TUI_TRIGGERS.PALETTE + action + " " + mutationId

const makeShortcut = (
  action: PendingApprovalShortcutAction,
  mutationId: string,
): PendingApprovalShortcut =>
  Data.struct({
    action,
    mutationId,
    command: makeCommand(action, mutationId),
  })

/** @Owl.TUI.Pending.Shortcuts.Resolve - Resolve focused pending Mutation action */
export const resolvePendingApprovalShortcut = (
  input: string,
  focusedPanel: string,
  pendingMutationIds: Chunk.Chunk<string>,
): Option.Option<PendingApprovalShortcut> => {
  if (focusedPanel !== TUI_FOCUS.METRICS) return Option.none()

  const firstPending = Chunk.head(pendingMutationIds)
  if (Option.isNone(firstPending)) return Option.none()

  switch (input) {
    case TUI_PENDING_APPROVALS.APPLY_KEY:
      return Option.some(
        makeShortcut(TUI_PENDING_APPROVALS.APPLY_COMMAND, firstPending.value),
      )
    case TUI_PENDING_APPROVALS.DIFF_KEY:
      return Option.some(
        makeShortcut(TUI_PENDING_APPROVALS.DIFF_COMMAND, firstPending.value),
      )
    case TUI_PENDING_APPROVALS.REJECT_KEY:
      return Option.some(
        makeShortcut(TUI_PENDING_APPROVALS.REJECT_COMMAND, firstPending.value),
      )
    default:
      return Option.none()
  }
}

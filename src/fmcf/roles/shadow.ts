/**
 * @Owl.FMCF.Roles.Shadow - Shadow role definition (TLI only)
 *
 * Phase 3 of the Deepening Flow: the Shadow performs Targeted Line Injection (TLI) —
 * surgical, precise code changes based on contracts and blueprints created by DNA Engineer.
 *
 * The Shadow is the ONLY role allowed to modify implementation code. It operates under
 * strict constraints:
 * - Changes must be surgical (TLI principle: minimal scope, maximum precision)
 * - Cannot change contracts, seams, or the registry (those are other roles' domains)
 * - Must immediately hand off to Forensic Guardian for registry updates
 *
 * The Shadow role enforces Law 1 (Second-Order Markov Determinism) by keeping changes small
 * and targeted. If changes exceed SHARD_SPLIT_THRESHOLD, the Shard Split Protocol triggers.
 *
 * @example
 * SHADOW_ROLE.responsibilities.includes("targeted-line-injection") // true
 * SHADOW_ROLE.prohibited.includes("change-contracts") // true
 *
 * @see TLIExecutor - The service that implements TLI logic
 * @see GUARDIAN_ROLE - The role that follows Shadow and handles registry updates
 */
import type { RoleDefinition } from "./architect.js"

/** @Owl.FMCF.Roles.Shadow.Role - Contract for surgical code injection */
export const SHADOW_ROLE: RoleDefinition = {
  id: "shadow",
  responsibilities: ["targeted-line-injection", "surgical-code-changes"],
  prohibited: ["change-contracts", "change-seams", "change-registry"],
}

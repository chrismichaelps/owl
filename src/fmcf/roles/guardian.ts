/**
 * @Owl.FMCF.Roles.Guardian - Forensic Guardian role definition
 *
 * Phase 4 (final) of the Deepening Flow: the Forensic Guardian is the system's historian
 * and integrity enforcer. After every TLI injection by Shadow, the Guardian updates the
 * Dual-Track Hash Registry (Track 2) to maintain the 1:1 mirror relationship.
 *
 * The Guardian owns:
 * - Registry updates: SHA256 hashes, Grammar Shards, grammar drift detection
 * - Chronos tracking: timestamps for every classification, change, and decision
 * - Integrity checks: Cache Trust Protocol, Seam Test Coverage Gate
 * - Traceability: maintaining the chain of custody from Architect through Guardian
 *
 * Prohibited from: proposing architecture or writing implementation.
 * This ensures the Guardian remains an observer/enforcer, not a decision-maker.
 *
 * @example
 * GUARDIAN_ROLE.responsibilities.includes("registry-updates") // true
 * GUARDIAN_ROLE.responsibilities.includes("chronos-tracking") // true
 *
 * @see HashRegistry - The registry the Guardian maintains
 * @see ARCHITECT_ROLE - The flow restarts here after Guardian completes
 */
import type { RoleDefinition } from "./architect.js"

/** @Owl.FMCF.Roles.Guardian.Role - Contract for registry and forensic tracking */
export const GUARDIAN_ROLE: RoleDefinition = {
  id: "guardian",
  responsibilities: [
    "registry-updates",
    "chronos-tracking",
    "integrity-checks",
    "traceability",
  ],
  prohibited: ["propose-architecture", "write-implementation"],
}

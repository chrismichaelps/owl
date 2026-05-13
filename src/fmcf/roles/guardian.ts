/** @Owl.FMCF.Roles.Guardian - Forensic Guardian role definition */
import type { RoleDefinition } from "./architect.js"

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

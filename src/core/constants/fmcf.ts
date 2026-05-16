/** @Owl.Core.Constants.FMCF - Governance and metric thresholds */
export const DEPTH_THRESHOLDS = {
  DEEP: 0.7,
  SHALLOW: 0.4,
} as const

/** @Owl.Core.Constants.ShardSplit - Change threshold that triggers Shard Split Protocol */
export const SHARD_SPLIT_THRESHOLD = 0.15

/** @Owl.Core.Constants.Collapse - Months before EXPLORATORY seam can be collapsed */
export const SEAM_COLLAPSE_MONTHS = 6

/** @Owl.Core.Constants.CapacityScores - Numeric scores for seam capacity levels */
export const SEAM_CAPACITY_SCORES = {
  BACKBONE: 9,
  CRITICAL: 6,
  EXPLORATORY: 3,
  INTERNAL: 0,
} as const

/** @Owl.Core.Constants.Capacity - Literal string capacities */
export const SEAM_CAPACITIES = {
  BACKBONE: "BACKBONE",
  CRITICAL: "CRITICAL",
  EXPLORATORY: "EXPLORATORY",
  INTERNAL: "INTERNAL",
} as const

/** @Owl.Core.Constants.Governance - Governance analysis outcomes */
export const SHARD_SPLIT_STATES = {
  OK: "OK",
  SHARD_SPLIT: "SHARD_SPLIT",
} as const

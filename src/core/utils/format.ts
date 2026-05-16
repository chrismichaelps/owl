/**
 * @Owl.Core.Utils.Format - String and data formatting utilities
 */

/**
 * Truncate a string to a maximum length, appending a marker if truncated.
 * Replaces newlines with spaces for single-line display.
 */
export function truncate(s: string, max: number, marker = "…"): string {
  const single = s.replace(/\n/g, " ").trim()
  return single.length <= max
    ? single
    : single.slice(0, max - marker.length) + marker
}

/**
 * Format a byte count as a human-readable string (e.g., 500b, 1.2kb, 3.4mb)
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)}b`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}kb`
  return `${(bytes / (1024 * 1024)).toFixed(1)}mb`
}

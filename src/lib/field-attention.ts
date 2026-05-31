/**
 * "Review only the uncertain fields" mode (C3) — the filter half.
 *
 * The review board renders every extracted field, but most of them read
 * cleanly and don't need a human. This helper decides, per field, whether a
 * field is one that actually "needs you" so the panel can collapse the
 * confident ones and surface only the few that matter — turning a 14-field
 * invoice into "2 fields need you."
 *
 * Aggregation only, no new model: a field needs attention when
 *   - it came back empty / "not found" (nothing was extracted), or
 *   - it is the flagged total whose line items don't reconcile (the caller
 *     passes the C2/C7 reconciliation copy when that's the case).
 *
 * Everything else is treated as confident and collapsed by default. The
 * voice stays consistent with the C7 anomaly chips — a calm, plain-English
 * reason, never an "accuracy %".
 */

import type { AnomalyCopy } from "@/lib/anomaly-reasons"

export type FieldLike = { label: string; path: string; value: string }

/** A field plus why it needs review (null reason → it reads as confident). */
export type FieldAttention = {
  needsReview: boolean
  /** Shared C7 anomaly copy, when there's a specific "why" to show. */
  reason: AnomalyCopy | null
}

/** Placeholder strings our summaries emit when nothing was extracted. */
const NOT_FOUND = /(not found|^-$|^n\/?a$)/i

function isEmptyValue(value: string): boolean {
  const trimmed = (value || "").trim()
  if (!trimmed) return true
  return NOT_FOUND.test(trimmed)
}

/**
 * Decide whether a single field needs the user. `flaggedTotal` is the
 * reconciliation "why" copy the caller already computes for the total field
 * (null for every other field, or when the totals reconcile).
 */
export function fieldAttention(
  field: FieldLike,
  flaggedTotal?: AnomalyCopy | null,
): FieldAttention {
  if (flaggedTotal) {
    return { needsReview: true, reason: flaggedTotal }
  }
  if (isEmptyValue(field.value)) {
    return {
      needsReview: true,
      reason: {
        tone: "caution",
        title: "Nothing extracted",
        reason: "We couldn't read this field — add the value from the document.",
      },
    }
  }
  return { needsReview: false, reason: null }
}

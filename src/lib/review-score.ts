/**
 * AxLiner Review Score (C1) — the unifying review-risk layer.
 *
 * Composite, aggregation-only indicator per AP invoice. It reads signals we
 * ALREADY store on `AccountsPayableItem` — extraction confidence, duplicate
 * flag, over-PO, missing VAT, new/changed vendor, reconciliation gap — and
 * collapses them into one of three levels:
 *
 *   High    → clean / low-risk  (emerald "good")
 *   Review  → medium-risk        (amber "caution")
 *   Flagged → high-risk          (rose "risk")
 *
 * There is NO new model and NO backend call. Each contributing signal carries
 * the same plain-English "why" copy used by the C7 anomaly chips, so the
 * "Why this needs review" popover and the row badges speak one voice.
 *
 * Mirrors Stripe Radar: a composite score, risk-insights that explain *why*,
 * and a queue sorted so the riskiest land first.
 */

import type { AnomalyTone } from "@/components/dashboard/AnomalyChip"
import type { AnomalyCopy } from "@/lib/anomaly-reasons"
import {
  duplicateCopy,
  missingVatCopy,
  overPoCopy,
} from "@/lib/anomaly-reasons"
import { getConfidenceTier } from "@/lib/handwritten"
import type { AccountsPayableItem } from "@/lib/api-client"

export type ReviewLevel = "high" | "review" | "flagged"

/** A single contributing signal, ready for the "why" popover. */
export type ReviewSignal = AnomalyCopy & { key: string }

export type ReviewScore = {
  level: ReviewLevel
  /** Shared tone so the badge routes through the C7 AnomalyChip palette. */
  tone: AnomalyTone
  /** Short badge label. */
  label: string
  /** Contributing signals, worst-first, for the popover. */
  signals: ReviewSignal[]
}

/** Level → C7 tone, kept consistent with the anomaly palette. */
const LEVEL_TONE: Record<ReviewLevel, AnomalyTone> = {
  high: "good",
  review: "caution",
  flagged: "risk",
}

const LEVEL_LABEL: Record<ReviewLevel, string> = {
  high: "High",
  review: "Review",
  flagged: "Flagged",
}

/** Sort weight so "needs you first" is unambiguous: Flagged → Review → High. */
const LEVEL_WEIGHT: Record<ReviewLevel, number> = {
  flagged: 0,
  review: 1,
  high: 2,
}

/** Pull a 0–1 (or 0–100) extraction confidence off the item if present. */
function readConfidence(item: AccountsPayableItem): number | null {
  const meta = (item.metadata ?? {}) as Record<string, unknown>
  const candidates = [
    meta["confidence_score"],
    meta["confidence"],
    meta["extraction_confidence"],
  ]
  for (const value of candidates) {
    if (typeof value === "number" && !Number.isNaN(value)) return value
  }
  return null
}

/** The active (not-dismissed) duplicate warning, if any. */
function activeDuplicate(item: AccountsPayableItem) {
  return (item.duplicate_warnings || []).find((warning) => !warning.dismissed) || null
}

/**
 * Compute the composite review score for one AP item. Pure aggregation over
 * already-stored signals — the caller passes the item straight from the queue.
 */
export function computeReviewScore(item: AccountsPayableItem): ReviewScore {
  const signals: ReviewSignal[] = []

  // High-risk signals (any one pushes the item toward Flagged).
  const duplicate = activeDuplicate(item)
  if (duplicate) {
    signals.push({ key: "duplicate", ...duplicateCopy(duplicate) })
  }

  if (item.po_match_status === "exceeds" && item.matched_po) {
    signals.push({
      key: "over_po",
      ...overPoCopy({
        po_number: item.matched_po.po_number,
        over_by: item.matched_po.over_by,
        currency: item.matched_po.currency,
      }),
    })
  }

  const confidenceTier = getConfidenceTier(readConfidence(item))
  if (confidenceTier === "low") {
    signals.push({
      key: "confidence_low",
      tone: "risk",
      title: "Low read confidence",
      reason: "The document was hard to read — verify the coded fields against the source.",
    })
  }

  // Medium-risk signals (nudge toward Review).
  if (confidenceTier === "medium") {
    signals.push({
      key: "confidence_medium",
      tone: "caution",
      title: "Medium read confidence",
      reason: "Some fields were hard to read — worth a quick glance before publishing.",
    })
  }

  if (!item.draft_data.tax_code_ref_id) {
    signals.push({ key: "missing_vat", ...missingVatCopy() })
  }

  // New / changed vendor — no QuickBooks vendor mapped yet, so coding still
  // needs a human to confirm who this bill belongs to.
  if (!item.draft_data.vendor_ref_id) {
    signals.push({
      key: "new_vendor",
      tone: "caution",
      title: "Vendor not mapped",
      reason: "This vendor isn't linked to QuickBooks yet — confirm the match before publishing.",
    })
  }

  // Reconciliation gap — line items don't add up to the invoice total. For an
  // AP bill this is the "totals don't line up" check we can run on draft_data.
  if (hasReconciliationGap(item)) {
    signals.push({
      key: "reconciliation_gap",
      tone: "risk",
      title: "Totals don't line up",
      reason: "Line items don't add up to the invoice total — a row may be missing or misread.",
    })
  }

  const level = levelFromSignals(signals)

  return {
    level,
    tone: LEVEL_TONE[level],
    label: LEVEL_LABEL[level],
    signals,
  }
}

/** A "risk" signal forces Flagged; any "caution" signal means Review. */
function levelFromSignals(signals: ReviewSignal[]): ReviewLevel {
  if (signals.some((signal) => signal.tone === "risk")) return "flagged"
  if (signals.some((signal) => signal.tone === "caution")) return "review"
  return "high"
}

function toNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null
  const parsed = Number(String(value).replace(/[^\d.-]/g, ""))
  return Number.isNaN(parsed) ? null : parsed
}

/**
 * Reconciliation gap for an AP bill: when we have a stated total AND line
 * items that carry their own line totals, flag a mismatch beyond rounding.
 * Returns false when either side is missing (can't check ≠ off).
 */
function hasReconciliationGap(item: AccountsPayableItem): boolean {
  const total = toNumber(item.draft_data.total)
  const lines = Array.isArray(item.draft_data.line_items) ? item.draft_data.line_items : []
  if (total === null || lines.length === 0) return false

  let sum = 0
  let counted = 0
  for (const line of lines) {
    const lineTotal = toNumber(
      (line as Record<string, unknown>)["line_total"] ??
        (line as Record<string, unknown>)["total"] ??
        (line as Record<string, unknown>)["amount"],
    )
    if (lineTotal !== null) {
      sum += lineTotal
      counted += 1
    }
  }
  if (counted === 0) return false

  return Math.abs(sum - total) > 0.01
}

/**
 * Sort weight for the "needs you first" queue order: Flagged → Review → High.
 * Exposed so callers sort consistently with the badge tones.
 */
export const REVIEW_LEVEL_WEIGHT: Record<ReviewLevel, number> = LEVEL_WEIGHT

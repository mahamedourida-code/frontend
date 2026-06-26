/**
 * Per-field (per-cell) confidence — the trust moat on the Review board.
 *
 * Row/document-level confidence already lives in `@/lib/handwritten`
 * (`getRowConfidenceTier` + the `ConfidenceDot`). This file adds the *cell*
 * layer: given a single extracted value, decide whether it quietly deserves a
 * second look so the review surface can flag only the few cells that matter and
 * leave confident ones completely clean.
 *
 * It MUST degrade gracefully whether or not the backend sends field-level data.
 * The resolution order, strongest signal first:
 *
 *   1. an explicit per-cell `score` (0–1 or 0–100) → tier it,
 *   2. an explicit `flagged` bit (e.g. `uncertain_cells` from the pipeline),
 *   3. value heuristics — empty/missing-required, money that isn't numeric,
 *      a date that won't parse,
 *   4. the row tier, when that's all that's known (handwritten docs).
 *
 * Everything that survives all four reads as confident. The "why" copy reuses
 * the calm, plain-English `AnomalyCopy` voice — never an "accuracy %".
 */

import type { AnomalyCopy } from "@/lib/anomaly-reasons"
import { getConfidenceTier, type ConfidenceTier } from "@/lib/handwritten"

export type CellConfidence = {
  /** True when the cell deserves a quiet amber affordance + a look. */
  uncertain: boolean
  /** Plain-English "why", for the hover tooltip. Null when confident. */
  reason: AnomalyCopy | null
}

const CLEAN: CellConfidence = { uncertain: false, reason: null }

/** Column field-paths whose values should read as money. */
const MONEY_PATHS = new Set([
  "unit_price",
  "line_total",
  "debit",
  "credit",
  "balance",
  "amount",
])

/** Column field-paths whose values should read as a date. */
const DATE_PATHS = new Set(["date", "due_date", "value_date"])

/** Line-item columns we treat as required — empty there is worth a look. */
const LINE_REQUIRED = new Set(["description", "line_total"])

/** Placeholder strings the extractor emits when nothing was read. */
const NOT_FOUND = /(not found|^-$|^n\/?a$)/i

function isEmpty(value: string): boolean {
  const trimmed = (value || "").trim()
  if (!trimmed) return true
  return NOT_FOUND.test(trimmed)
}

/** Lenient numeric check — tolerates currency symbols, separators, %, (neg). */
function looksNumeric(value: string): boolean {
  const cleaned = value
    .replace(/[$€£¥₹]/g, "")
    .replace(/[\s,()%]/g, "")
    .trim()
  if (!cleaned) return false
  return /^[-+]?\d*\.?\d+$/.test(cleaned)
}

/** Lenient date check — parseable, or a plain dd/mm/yyyy-style triple. */
function looksLikeDate(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (!Number.isNaN(Date.parse(trimmed))) return true
  return /^\d{1,4}[/.\-]\d{1,2}[/.\-]\d{1,4}$/.test(trimmed)
}

const EMPTY_CELL: AnomalyCopy = {
  tone: "caution",
  title: "Nothing extracted",
  reason: "We couldn't read this cell — add the value from the document.",
}

const FORMAT_MONEY: AnomalyCopy = {
  tone: "caution",
  title: "Check this amount",
  reason: "This doesn't read as a number — confirm the figure against the source.",
}

const FORMAT_DATE: AnomalyCopy = {
  tone: "caution",
  title: "Check this date",
  reason: "This date didn't read cleanly — confirm it against the source.",
}

const FLAGGED: AnomalyCopy = {
  tone: "caution",
  title: "Worth a check",
  reason: "This cell was hard to read — confirm it against the source.",
}

/** Caution-toned copy for a row/cell tier (kept amber, never rose, for calm). */
function tierReason(tier: ConfidenceTier): AnomalyCopy {
  if (tier === "low") {
    return {
      tone: "caution",
      title: "Low confidence",
      reason: "This was hard to read — verify it against the source.",
    }
  }
  return {
    tone: "caution",
    title: "Medium confidence",
    reason: "Some characters were hard to read — worth a quick glance.",
  }
}

function tierFallback(rowTier?: ConfidenceTier | null): CellConfidence {
  if (rowTier === "low" || rowTier === "medium") {
    return { uncertain: true, reason: tierReason(rowTier) }
  }
  return CLEAN
}

/**
 * The single resolver. All other helpers are thin wrappers that pre-fill the
 * options for a particular grid.
 */
export function cellConfidence(opts: {
  value: string
  /** Column field-path, when known (drives money/date format checks). */
  path?: string
  /** Empty value in this cell is worth a look. */
  required?: boolean
  /** Row tier fallback (handwritten docs). */
  rowTier?: ConfidenceTier | null
  /** Explicit "uncertain" bit from the pipeline (e.g. `uncertain_cells`). */
  flagged?: boolean
  /** Explicit per-cell confidence score (0–1 or 0–100) when the backend sends one. */
  score?: number | null
}): CellConfidence {
  const { value, path, required, rowTier, flagged, score } = opts

  // 1) Explicit per-cell score wins outright.
  if (score !== undefined && score !== null && !Number.isNaN(score)) {
    const tier = getConfidenceTier(score)
    return tier && tier !== "high" ? { uncertain: true, reason: tierReason(tier) } : CLEAN
  }

  // 2) Explicit "flagged" bit from the pipeline.
  if (flagged) return { uncertain: true, reason: FLAGGED }

  // 3) Value heuristics.
  if (isEmpty(value)) {
    return required ? { uncertain: true, reason: EMPTY_CELL } : tierFallback(rowTier)
  }
  if (path && MONEY_PATHS.has(path) && !looksNumeric(value)) {
    return { uncertain: true, reason: FORMAT_MONEY }
  }
  if (path && DATE_PATHS.has(path) && !looksLikeDate(value)) {
    return { uncertain: true, reason: FORMAT_DATE }
  }

  // 4) Row tier, when that's all we know.
  return tierFallback(rowTier)
}

/** Per-cell confidence for a structured line-item / transaction grid. */
export function lineCellConfidence(
  value: string,
  path: string,
  rowTier?: ConfidenceTier | null,
): CellConfidence {
  return cellConfidence({ value, path, required: LINE_REQUIRED.has(path), rowTier })
}

/**
 * Per-cell confidence for the raw extracted table (arbitrary columns, so no
 * path-driven format checks). Header cells are always clean.
 */
export function rawCellConfidence(
  value: string,
  opts: { flagged?: boolean; rowTier?: ConfidenceTier | null; isHeader?: boolean; score?: number | null },
): CellConfidence {
  if (opts.isHeader) return CLEAN
  return cellConfidence({ value, flagged: opts.flagged, rowTier: opts.rowTier, score: opts.score })
}

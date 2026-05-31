/**
 * Source highlighting (C2) — the cheap 80%.
 *
 * Hovering / clicking an extracted field on the review board should show
 * *where that value came from* on the document. We deliberately do NOT depend
 * on model bounding boxes (a future model-side enhancement). Instead we
 * text-match the extracted value against the document's own OCR text — the
 * plain-text / markdown representation we already render in the "After" text
 * preview — and surface the matched source line as a small excerpt anchored
 * over the document preview.
 *
 * Everything here is pure string work. When there is no source text or no
 * confident match, the helpers return `null` and the UI shows nothing — the
 * feature degrades silently, never with an error or an empty box.
 */

import type { AnomalyCopy } from "@/lib/anomaly-reasons"

/** A located match inside the document's source text. */
export type SourceMatch = {
  /** The source line that contains the value (trimmed, length-capped). */
  line: string
  /** Start offset of the matched value within `line`. */
  matchStart: number
  /** End offset (exclusive) of the matched value within `line`. */
  matchEnd: number
}

/** Collapse whitespace and lowercase for forgiving comparison. */
function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase()
}

/**
 * Strip currency symbols / thousands separators so "$1,240.00" matches a
 * source that reads "1240.00" (and vice-versa). Returns "" when there is no
 * numeric content, so callers fall back to the raw-text path.
 */
function numericKey(value: string): string {
  const digits = value.replace(/[^\d.]/g, "")
  // Drop a trailing ".00" so "1240.00" and "1240" reconcile.
  return digits.replace(/\.0+$/, "")
}

const MAX_LINE = 140

function clampLine(line: string, matchStart: number, matchEnd: number): SourceMatch {
  if (line.length <= MAX_LINE) {
    return { line, matchStart, matchEnd }
  }
  // Keep a window around the match so long lines stay readable.
  const pad = Math.floor((MAX_LINE - (matchEnd - matchStart)) / 2)
  let start = Math.max(0, matchStart - Math.max(pad, 0))
  let end = Math.min(line.length, start + MAX_LINE)
  start = Math.max(0, end - MAX_LINE)
  const prefix = start > 0 ? "…" : ""
  const suffix = end < line.length ? "…" : ""
  return {
    line: `${prefix}${line.slice(start, end)}${suffix}`,
    matchStart: prefix.length + (matchStart - start),
    matchEnd: prefix.length + (matchEnd - start),
  }
}

/**
 * Find where `value` appears in `sourceText`. Tries, in order:
 *   1. a forgiving whitespace-insensitive substring match on the raw value,
 *   2. a numeric match (currency / amounts) on the line's digits.
 *
 * Returns the matched line with offsets, or `null` when nothing lines up.
 */
export function findSourceMatch(value: string, sourceText: string): SourceMatch | null {
  const target = (value ?? "").trim()
  if (!target || !sourceText) return null
  // Very short values (1–2 chars) match noise everywhere — skip them.
  if (normalize(target).replace(/[^\da-z]/gi, "").length < 3) return null

  const lines = sourceText.split(/\r?\n/)
  const needle = normalize(target)
  const numNeedle = numericKey(target)

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    const haystack = normalize(line)

    // 1) Direct (whitespace-insensitive) substring.
    const idx = haystack.indexOf(needle)
    if (idx >= 0) {
      // Map the normalized index back onto the original line approximately by
      // re-finding the first token of the value in the original (case-insens).
      const firstToken = target.trim().split(/\s+/)[0]
      const approx = line.toLowerCase().indexOf(firstToken.toLowerCase())
      const start = approx >= 0 ? approx : 0
      const end = Math.min(line.length, start + target.length)
      return clampLine(line, start, end)
    }

    // 2) Numeric match for amounts / totals.
    if (numNeedle && numNeedle.replace(".", "").length >= 2) {
      const lineNum = numericKey(line)
      if (lineNum && lineNum.includes(numNeedle)) {
        // Locate the first run of digits on the line for the highlight window.
        const digitMatch = line.match(/[\d][\d.,]*/)
        const start = digitMatch?.index ?? 0
        const end = Math.min(line.length, start + (digitMatch?.[0].length ?? target.length))
        return clampLine(line, start, end)
      }
    }
  }

  return null
}

/* --------------------------------------------------- flagged total ("why") */

function asNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null
  const parsed = Number(String(value).replace(/[^\d.-]/g, ""))
  return Number.isNaN(parsed) ? null : parsed
}

/**
 * "Why is this total flagged?" for the review split-pane. Mirrors the C1
 * review-score reconciliation check (line items vs. stated total) but runs on
 * the reviewed-data shape used on the workspace, returning the same plain-
 * English "why" voice as the C7 anomaly chips. Returns `null` when the total
 * reconciles or can't be checked — so the chip only appears when it matters.
 */
export function reconciliationTotalCopy(data: Record<string, unknown>): AnomalyCopy | null {
  const total = asNumber(data.total)
  const lines = Array.isArray(data.line_items) ? data.line_items : []
  if (total === null || lines.length === 0) return null

  let sum = 0
  let counted = 0
  for (const line of lines) {
    const record = line as Record<string, unknown>
    const lineTotal = asNumber(record.line_total ?? record.total ?? record.amount)
    if (lineTotal !== null) {
      sum += lineTotal
      counted += 1
    }
  }
  if (counted === 0) return null
  if (Math.abs(sum - total) <= 0.01) return null

  const gap = Math.abs(sum - total)
  const currency = typeof data.currency === "string" ? `${data.currency} ` : ""
  return {
    tone: "risk",
    title: "Total doesn't line up",
    reason: `Line items add up to ${currency}${sum.toFixed(2)}, but the total reads ${currency}${total.toFixed(2)} — off by ${currency}${gap.toFixed(2)}. A row may be missing or misread.`,
  }
}

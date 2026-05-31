/**
 * One-line invoice summary on queue/review cards (C11).
 *
 * Builds the at-a-glance line every card can show — "Acme Ltd · $1,240 ·
 * due May 30 · Looks clean" — entirely from fields we ALREADY extracted. No
 * new model, no backend call: the caller passes the pieces it has and an
 * already-computed verdict, this just assembles + cleans them.
 *
 * It deliberately does NOT recompute risk. The verdict (tone + label) is the
 * SAME one C1 `computeReviewScore` / C4 `deriveReviewLevel` produce, so the
 * summary line and the badge always agree. Any missing piece is gracefully
 * omitted rather than printed blank — the line never shows "due —" or a bare
 * currency symbol.
 */

import type { AnomalyTone } from "@/components/dashboard/AnomalyChip"

/** Placeholder strings our extractors emit when nothing was read. */
const NOT_FOUND = /(not found|^-$|^n\/?a$|^—$)/i

function clean(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const trimmed = String(value).trim()
  if (!trimmed || NOT_FOUND.test(trimmed)) return null
  return trimmed
}

/** A verdict the line can render — reused straight from the review score. */
export type CardVerdict = { tone: AnomalyTone; label: string }

export type CardSummaryInput = {
  /** Vendor / merchant / account holder — the document's identity. */
  identity?: unknown
  /** Pre-joined amount (e.g. "USD 1,240") OR raw pieces below. */
  amount?: unknown
  /** Currency + total, joined here if `amount` isn't supplied. */
  currency?: unknown
  total?: unknown
  /** Due / payment date when the document carries one. */
  dueDate?: unknown
  /** Verdict from C1 / C4 — never recomputed here. */
  verdict?: CardVerdict
}

export type CardSummaryPart = { key: string; text: string }

export type CardSummary = {
  /** Ordered, present-only parts for ` · `-joined rendering. */
  parts: CardSummaryPart[]
  /** The verdict, surfaced so the caller can tone the last part. */
  verdict: CardVerdict | null
  /** Convenience: the parts (incl. verdict label) joined with " · ". */
  text: string
}

/** Trim an ISO-ish date to its day portion; pass through short forms. */
function shortDate(value: string): string {
  const iso = value.match(/^\d{4}-\d{2}-\d{2}/)
  return iso ? iso[0] : value
}

/**
 * Assemble the summary line from whatever the card already has. Missing
 * pieces drop out; the verdict label is appended last when present so the
 * caller can colour it via `verdict.tone`.
 */
export function buildCardSummary(input: CardSummaryInput): CardSummary {
  const parts: CardSummaryPart[] = []

  const identity = clean(input.identity)
  if (identity) parts.push({ key: "identity", text: identity })

  const amount =
    clean(input.amount) ??
    clean([clean(input.currency), clean(input.total)].filter(Boolean).join(" "))
  if (amount) parts.push({ key: "amount", text: amount })

  const due = clean(input.dueDate)
  if (due) parts.push({ key: "due", text: `due ${shortDate(due)}` })

  const verdict = input.verdict ?? null
  const text = [
    ...parts.map((part) => part.text),
    ...(verdict ? [verdict.label] : []),
  ].join(" · ")

  return { parts, verdict, text }
}

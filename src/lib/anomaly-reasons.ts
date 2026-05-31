/**
 * Centralized, plain-English "why" copy for every confidence dot and anomaly
 * chip on the review board (C7). Keeping the language in one place means the
 * duplicate / over-PO / missing-VAT / reconciliation flags all read in the
 * same calm, human voice — never "97% accuracy", always a field-level reason.
 *
 * Each helper returns a `{ tone, title, reason }` triple the shared
 * `AnomalyChip` / `AnomalyDot` consume directly.
 */

import type { ConfidenceTier } from "@/lib/handwritten"
import type { AnomalyTone } from "@/components/dashboard/AnomalyChip"

export type AnomalyCopy = {
  tone: AnomalyTone
  /** Bold lead line (the "what"). */
  title: string
  /** One-line plain-English explanation (the "why"). */
  reason: string
}

/* ---------------------------------------------------------------- confidence */

const CONFIDENCE_COPY: Record<ConfidenceTier, AnomalyCopy> = {
  high: {
    tone: "good",
    title: "High confidence",
    reason: "The text read cleanly and matched the expected format.",
  },
  medium: {
    tone: "caution",
    title: "Medium confidence",
    reason: "Some characters were hard to read — worth a quick glance.",
  },
  low: {
    tone: "risk",
    title: "Low confidence",
    reason: "This was difficult to read — verify it against the source.",
  },
}

export function confidenceCopy(tier: ConfidenceTier): AnomalyCopy {
  return CONFIDENCE_COPY[tier]
}

/* ----------------------------------------------------------------- duplicate */

type DuplicateLike = {
  matched_filename?: string | null
  matched_created_at?: string | null
  fields?: { vendor?: string; amount?: string; date?: string } | Record<string, unknown> | null
  message?: string | null
}

function shortDate(value?: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

/**
 * "Vendor + amount + date match an invoice from May 3" — built from the
 * matched fields when present, falling back to the backend message.
 */
export function duplicateCopy(warning: DuplicateLike): AnomalyCopy {
  const fields = (warning.fields ?? {}) as { vendor?: string; amount?: string; date?: string }
  const when = shortDate(warning.matched_created_at) || shortDate(fields.date)
  const parts: string[] = []
  if (fields.vendor) parts.push(fields.vendor)
  if (fields.amount) parts.push(fields.amount)

  let reason: string
  if (parts.length) {
    reason = `Vendor + amount + date match ${parts.join(", ")}`
    reason += when ? ` from ${when}.` : " on an earlier invoice."
  } else if (when) {
    reason = `Matches an invoice already captured on ${when}.`
  } else {
    reason = warning.message?.trim() || "Matches an invoice already in this batch."
  }

  return { tone: "caution", title: "Possible duplicate", reason }
}

/* ------------------------------------------------------------------- over-PO */

type OverPoLike = {
  po_number?: string | null
  over_by?: string | null
  currency?: string | null
}

/** "$120 over PO 4471 — confirm the extra was agreed." */
export function overPoCopy(po: OverPoLike): AnomalyCopy {
  const amount = [po.currency, po.over_by].filter(Boolean).join(" ").trim()
  const ref = po.po_number ? `PO ${po.po_number}` : "the matched PO"
  const reason = amount
    ? `${amount} over ${ref} — confirm the extra was agreed.`
    : `This bill exceeds ${ref} — confirm the extra was agreed.`
  return { tone: "caution", title: "Over PO amount", reason }
}

/* --------------------------------------------------------------- missing VAT */

/** "Medium — no clear VAT line found." */
export function missingVatCopy(): AnomalyCopy {
  return {
    tone: "caution",
    title: "No VAT found",
    reason: "No clear VAT line was found — add a tax code if this should be taxed.",
  }
}

/* ------------------------------------------------------------ reconciliation */

type ReconcileTone = "balanced" | "off" | "info"

/**
 * Plain-English copy for the balance check. The panel computes the difference;
 * this just narrates it.
 */
export function reconciliationCopy(
  status: ReconcileTone,
  detail?: { difference?: string | null; missingRows?: number | null },
): AnomalyCopy {
  if (status === "balanced") {
    return {
      tone: "good",
      title: "Balance checks out",
      reason: "Opening balance plus credits minus debits matches the reported closing.",
    }
  }
  if (status === "off") {
    const gap = detail?.difference ? `Off by ${detail.difference}` : "The totals don't line up"
    const tail =
      detail?.missingRows && detail.missingRows > 0
        ? ` — ${detail.missingRows} row${detail.missingRows === 1 ? "" : "s"} may be missing or misread.`
        : " — a transaction may be missing or misread."
    return { tone: "risk", title: "Balance is off", reason: `${gap}${tail}` }
  }
  return {
    tone: "caution",
    title: "Can't check the balance yet",
    reason: "Need an opening balance, closing balance, and at least one row to verify.",
  }
}

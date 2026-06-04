/**
 * Bookkeeper-facing copy + the Net/VAT/Total reconciliation helper.
 *
 * The backend already extracts subtotal (net), tax_vat_amount (VAT) and total
 * (gross) and validates that subtotal + VAT = total. The first review surface
 * never surfaced that arithmetic in bookkeeper terms — so this helper turns the
 * three numbers into a single ✓/✗ verdict the reviewer can trust at a glance.
 */

/** Parse a numeric magnitude out of a display amount like "USD 1,240.50" or "1.240,50". */
export function parseAmount(value: unknown): number | null {
  if (value === undefined || value === null) return null
  let raw = String(value).trim()
  if (!raw) return null
  // Strip currency words/symbols, keep digits, separators and sign.
  raw = raw.replace(/[^\d.,-]/g, "")
  if (!raw) return null
  // If both separators present, the last one is the decimal separator.
  const lastComma = raw.lastIndexOf(",")
  const lastDot = raw.lastIndexOf(".")
  if (lastComma !== -1 && lastDot !== -1) {
    const decimalSep = lastComma > lastDot ? "," : "."
    const thousandSep = decimalSep === "," ? "." : ","
    raw = raw.split(thousandSep).join("")
    if (decimalSep === ",") raw = raw.replace(",", ".")
  } else if (lastComma !== -1) {
    // Only commas — treat as decimal if it looks like one (",dd" at the end).
    raw = /,\d{1,2}$/.test(raw) ? raw.replace(",", ".") : raw.split(",").join("")
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export type VatCheckState = "ok" | "mismatch" | "missing" | "unknown"

export interface VatCheckResult {
  state: VatCheckState
  /** Short chip label, e.g. "Net + VAT = Total". */
  label: string
  /** One-line explanation for a tooltip / helper line. */
  detail: string
  /** Tone aligned with StatusBadge / AnomalyChip tones. */
  tone: "good" | "caution" | "neutral"
  net: number | null
  vat: number | null
  gross: number | null
}

/**
 * Reconcile the three figures. Tolerance is the larger of 0.02 (rounding) or
 * 1% of the gross (handles cents-level extraction noise on big totals).
 */
export function vatCheck(subtotal: unknown, vat: unknown, total: unknown): VatCheckResult {
  const net = parseAmount(subtotal)
  const vatAmount = parseAmount(vat)
  const gross = parseAmount(total)

  if (gross === null && net === null) {
    return { state: "unknown", label: "Amounts unread", detail: "Couldn't read the amounts on this document.", tone: "neutral", net, vat: vatAmount, gross }
  }

  // A total with no VAT line at all — flag it; many invoices should carry VAT.
  if ((vatAmount === null || vatAmount === 0) && gross !== null) {
    return {
      state: "missing",
      label: "No VAT",
      detail: "No VAT amount was found — confirm this supplier is genuinely zero-rated.",
      tone: "caution",
      net,
      vat: vatAmount,
      gross,
    }
  }

  if (net === null || vatAmount === null || gross === null) {
    return { state: "unknown", label: "Amounts incomplete", detail: "Some of Net / VAT / Total is missing.", tone: "neutral", net, vat: vatAmount, gross }
  }

  const tolerance = Math.max(0.02, Math.abs(gross) * 0.01)
  const delta = Math.abs(net + vatAmount - gross)
  if (delta <= tolerance) {
    return { state: "ok", label: "Net + VAT = Total", detail: "Net plus VAT reconciles to the total.", tone: "good", net, vat: vatAmount, gross }
  }
  return {
    state: "mismatch",
    label: "Doesn't add up",
    detail: `Net + VAT is off the total by ${delta.toFixed(2)} — check the figures.`,
    tone: "caution",
    net,
    vat: vatAmount,
    gross,
  }
}

/** Messy-document positioning copy — the brand promise, in-product. */
export const MESSY_DOCS_COPY = {
  uploadTitle: "Throw us the whole folder",
  uploadHint:
    "Handwritten, crumpled receipts, phone photos, multi-page scans, supplier PDFs — from anywhere. We read the mess so you don't have to.",
  uploadHintShort: "Handwritten, photos, scans, PDFs — from anywhere.",
} as const

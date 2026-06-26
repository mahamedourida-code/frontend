/**
 * Pre-publish validation gate for draft bills.
 *
 * Pure functions over the fields we ALREADY store on an AP draft — no new
 * endpoint, no schema change, no model call. The Review board uses these to
 * flag a bill before it's published to QuickBooks or Xero:
 *
 *   - Net + VAT ≈ Total          (catches a mis-read amount or a maths slip)
 *   - required fields present     (supplier, total, invoice date; account for a
 *                                  coded/ready bill)
 *   - currency present
 *   - the existing duplicate flag (passed in — the page already computes it)
 *
 * Errors are hard blockers (a bill with errors is held back from publishing);
 * warnings are amber "worth a glance" hints that never block. The voice stays
 * consistent with the missing-info + anomaly copy: calm, plain-English, never
 * an "accuracy %".
 */

import type { AccountsPayableItem } from "@/lib/api-client"

export type BillIssueCode =
  | "supplier_missing"
  | "invoice_date_missing"
  | "total_missing"
  | "account_missing"
  | "vat_code_missing"
  | "currency_missing"
  | "out_of_balance"

/** A single thing wrong with the bill, ready for a chip / tooltip. */
export type BillIssue = { code: BillIssueCode; label: string }

export type BillValidation = {
  /** True when there are no hard errors — safe to publish. */
  ok: boolean
  /** Hard blockers — the bill is held back from publishing. */
  errors: BillIssue[]
  /** Soft hints — surfaced amber, never block. */
  warnings: BillIssue[]
  /** The duplicate flag the page already derived (exposed, not re-computed). */
  duplicate: boolean
}

export type BillValidationOptions = {
  /** From the page's `hasActiveDuplicate(item)` — kept as the single source. */
  hasDuplicate?: boolean
  /**
   * Force the coded-bill requirements (account + VAT code). Defaults to true for
   * a bill that's been coded / is ready / published, so an uncoded draft isn't
   * nagged about coding it hasn't reached yet.
   */
  enforceCoding?: boolean
}

/** Statuses where a bill is expected to be fully coded. */
const CODED_STATUSES = new Set(["ready_to_publish", "pending_approval", "published"])

/** Placeholder strings our summaries emit when nothing was extracted. */
const NOT_FOUND = /(not found|^-$|^n\/?a$)/i

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true
  const trimmed = String(value).trim()
  if (!trimmed) return true
  return NOT_FOUND.test(trimmed)
}

/** Parse a money-ish value (number or "$1,234.56") to a finite number. */
function parseAmount(value: unknown): number | null {
  if (value === undefined || value === null) return null
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  const cleaned = String(value).replace(/[^\d.-]/g, "")
  if (!cleaned || cleaned === "-" || cleaned === ".") return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Rounding tolerance for the balance check — a couple of cents, scaled gently so
 * large invoices that accumulate per-line rounding aren't false-flagged.
 */
function balanceTolerance(total: number): number {
  return Math.max(0.05, Math.abs(total) * 0.005)
}

/**
 * Validate one AP item from the data already on the page.
 */
export function validateBill(
  item: AccountsPayableItem,
  options: BillValidationOptions = {},
): BillValidation {
  const draft = item.draft_data || {}
  const errors: BillIssue[] = []
  const warnings: BillIssue[] = []
  const enforceCoding = options.enforceCoding ?? CODED_STATUSES.has(item.status)

  // (b) required core fields — can't post a Bill without these.
  if (isBlank(draft.vendor)) errors.push({ code: "supplier_missing", label: "Supplier missing" })
  if (isBlank(draft.invoice_date)) errors.push({ code: "invoice_date_missing", label: "Invoice date missing" })

  const total = parseAmount(draft.total)
  if (isBlank(draft.total) || total === null) {
    errors.push({ code: "total_missing", label: "Total missing" })
  }

  // (c) currency — needed downstream; soft so a default isn't a hard block.
  if (isBlank(draft.currency)) warnings.push({ code: "currency_missing", label: "Currency missing" })

  // (b) coding requirements for a coded/ready bill. An account is a hard block
  // (the spend has nowhere to land); a VAT code stays soft because zero-rated /
  // out-of-scope bills legitimately carry none.
  if (enforceCoding) {
    if (isBlank(draft.account_ref_id) && isBlank(draft.account_category)) {
      errors.push({ code: "account_missing", label: "Account missing" })
    }
    if (isBlank(draft.tax_code_ref_id) && isBlank(draft.tax_code)) {
      warnings.push({ code: "vat_code_missing", label: "VAT code missing" })
    }
  }

  // (a) Net + VAT ≈ Total — only when all three are present to check against.
  const subtotal = parseAmount(draft.subtotal)
  const tax = parseAmount(draft.tax_amount)
  if (subtotal !== null && tax !== null && total !== null) {
    if (Math.abs(subtotal + tax - total) > balanceTolerance(total)) {
      errors.push({ code: "out_of_balance", label: "Net + VAT ≠ Total" })
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    duplicate: Boolean(options.hasDuplicate),
  }
}

/** Short phrase per blocking code for the pre-publish summary line. */
const BLOCKING_PHRASE: Record<BillIssueCode, (count: number) => string> = {
  out_of_balance: (n) => `${n} ${n === 1 ? "bill doesn't" : "bills don't"} balance`,
  supplier_missing: (n) => `${n} missing supplier`,
  total_missing: (n) => `${n} missing total`,
  invoice_date_missing: (n) => `${n} missing invoice date`,
  account_missing: (n) => `${n} missing account`,
  // Soft codes never reach the blocking summary, but the map stays exhaustive.
  vat_code_missing: (n) => `${n} missing VAT code`,
  currency_missing: (n) => `${n} missing currency`,
}

/** Order the summary segments read in. */
const SUMMARY_ORDER: BillIssueCode[] = [
  "out_of_balance",
  "supplier_missing",
  "total_missing",
  "invoice_date_missing",
  "account_missing",
]

/**
 * Roll a set of validations into one calm line, e.g.
 * "2 bills don't balance · 1 missing account". Counts each bill once per code.
 */
export function summarizeBlocking(validations: BillValidation[]): string {
  const counts = new Map<BillIssueCode, number>()
  for (const validation of validations) {
    const seen = new Set<BillIssueCode>()
    for (const issue of validation.errors) {
      if (seen.has(issue.code)) continue
      seen.add(issue.code)
      counts.set(issue.code, (counts.get(issue.code) || 0) + 1)
    }
  }
  return SUMMARY_ORDER.filter((code) => counts.has(code))
    .map((code) => BLOCKING_PHRASE[code](counts.get(code)!))
    .join(" · ")
}

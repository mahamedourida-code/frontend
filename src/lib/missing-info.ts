/**
 * "Missing information" as a first-class queue state (C10).
 *
 * A document qualifies for the Missing-info group when it lacks an *expected*
 * field — no due date, no VAT/tax where expected, no total, or an unreadable /
 * empty field. Pure derivation over the fields we ALREADY store on the AP
 * draft: no new endpoint, no schema change, no model call.
 *
 * The voice and tone stay consistent with the C7 anomaly chips and the C3
 * field-attention helper — calm, plain-English, amber "caution", never an
 * "accuracy %". The result feeds a filter chip + count and a small "Missing
 * info" chip on each qualifying card listing exactly what's absent.
 */

import type { AnomalyCopy } from "@/lib/anomaly-reasons"
import type { AccountsPayableItem } from "@/lib/api-client"

/** Placeholder strings our summaries emit when nothing was extracted. */
const NOT_FOUND = /(not found|^-$|^n\/?a$)/i

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true
  const trimmed = String(value).trim()
  if (!trimmed) return true
  return NOT_FOUND.test(trimmed)
}

/** A single thing the document is missing, ready for the chip tooltip. */
export type MissingField = { key: string; label: string }

export type MissingInfo = {
  /** True when at least one expected field is absent. */
  missing: boolean
  /** Short labels of what's missing, e.g. ["due date", "total"]. */
  fields: MissingField[]
  /** Shared C7 copy for the chip tooltip (null when nothing is missing). */
  copy: AnomalyCopy | null
}

/**
 * Derive what an AP item is missing from already-extracted fields.
 *
 *   - no total      → can't post a Bill amount
 *   - no due date   → payment terms unknown
 *   - no VAT/tax    → tax line absent where one is expected
 *   - unreadable    → a core field (vendor / invoice date) came back empty
 *
 * VAT is only treated as "expected" when there's a total to tax — so a clean
 * zero-rated or total-less stub doesn't get nagged about tax.
 */
export function deriveMissingInfo(item: AccountsPayableItem): MissingInfo {
  const draft = item.draft_data || {}
  const fields: MissingField[] = []

  const hasTotal = !isBlank(draft.total)
  if (!hasTotal) fields.push({ key: "total", label: "total" })
  if (isBlank(draft.due_date)) fields.push({ key: "due_date", label: "due date" })
  if (isBlank(draft.vendor)) fields.push({ key: "vendor", label: "vendor" })
  if (isBlank(draft.invoice_date)) fields.push({ key: "invoice_date", label: "invoice date" })

  // VAT is "expected" once there's an amount to tax but no tax line at all.
  const hasTax = !isBlank(draft.tax_code) || !isBlank(draft.tax_code_ref_id) || !isBlank(draft.tax_amount)
  if (hasTotal && !hasTax) fields.push({ key: "tax", label: "VAT / tax" })

  if (fields.length === 0) {
    return { missing: false, fields: [], copy: null }
  }

  const list = fields.map((f) => f.label)
  const readable =
    list.length === 1
      ? list[0]
      : `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`

  return {
    missing: true,
    fields,
    copy: {
      tone: "caution",
      title: "Missing information",
      reason: `No ${readable} — add ${fields.length === 1 ? "it" : "them"} from the document before publishing.`,
    },
  }
}

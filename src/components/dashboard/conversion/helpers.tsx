import {
  Building2,
  CreditCard,
  DollarSign,
  Percent,
  Tag,
} from "lucide-react"
import { FIELD_LABEL } from "@/lib/review-vocab"
import { columnLabel, fieldLabel, type InvoiceLanguage } from "@/lib/invoice-schema"
import type { AnomalyTone } from "@/components/dashboard/AnomalyChip"
import type { DocumentDuplicateWarning, VendorRuleFields } from "@/lib/api-client"
import { HIGH_VALUE_THRESHOLD } from "./constants"
import type { ResultFile } from "./types"

export function formatBytes(bytes: number) {
  if (!bytes) return "0 MB"
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function getResultKey(file: ResultFile, index: number) {
  return file.file_id || `result-${index}`
}

export function getOutputBadge(file: ResultFile) {
  const rawConfidence =
    file.confidence_score ??
    file.confidence ??
    file.quality_score ??
    file.metadata?.confidence_score ??
    file.metadata?.confidence ??
    null
  const confidence = typeof rawConfidence === "number"
    ? rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence
    : null
  const needsReview =
    file.review_status === "needs_review" ||
    file.status === "failed" ||
    file.requires_review ||
    Boolean(file.review_flags?.length || file.metadata?.review_flags?.length) ||
    (confidence !== null && confidence < 82)

  if (file.status === "failed" || file.review_status === "failed") {
    return { state: "failed" as const, label: "Failed", className: "bg-[var(--status-error-bg)] text-[var(--status-error-fg)] border-[color-mix(in_srgb,var(--status-error-fg)_22%,transparent)]" }
  }

  if (activeDuplicateWarnings(file).length) {
    return { state: "needs_review" as const, label: "Possible duplicate", className: "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)] border-[color-mix(in_srgb,var(--status-warning-fg)_22%,transparent)]" }
  }

  if (file.review_status === "published") {
    return { state: "published" as const, label: "Published", className: "bg-[var(--status-info-bg)] text-[var(--status-info-fg)] border-[color-mix(in_srgb,var(--status-info-fg)_22%,transparent)]" }
  }

  if (file.review_status === "edited") {
    return { state: "edited" as const, label: "Edited", className: "border-[var(--button-warm-ring)] bg-[var(--button-warm)] text-[var(--brand-brown-fg)]" }
  }

  if (file.review_status === "ready") {
    return { state: "ready" as const, label: "Ready", className: "bg-[var(--status-success-bg)] text-[var(--status-success-fg)] border-[color-mix(in_srgb,var(--status-success-fg)_22%,transparent)]" }
  }

  return needsReview
    ? { state: "needs_review" as const, label: "Needs review", className: "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)] border-[color-mix(in_srgb,var(--status-warning-fg)_22%,transparent)]" }
    : { state: "ready" as const, label: "Ready", className: "bg-[var(--status-success-bg)] text-[var(--status-success-fg)] border-[color-mix(in_srgb,var(--status-success-fg)_22%,transparent)]" }
}

export function activeDuplicateWarnings(file: ResultFile) {
  return (file.duplicate_warnings || []).filter(warning => !warning.overridden)
}

/** Parse a numeric magnitude out of a display amount like "USD 1,240.50". */
export function parseAmountValue(amount: unknown): number | null {
  if (amount === undefined || amount === null) return null
  const parsed = Number(String(amount).replace(/[^\d.-]/g, ""))
  return Number.isNaN(parsed) ? null : Math.abs(parsed)
}

/** True when the document's total reads at/above the high-value threshold. */
export function isHighValue(file: ResultFile): boolean {
  const value = parseAmountValue(resultSummary(file).amount)
  return value !== null && value >= HIGH_VALUE_THRESHOLD
}

/**
 * C4 — collapse the review board by risk. Reuses the C1 review-score idea
 * (High / Review / Flagged → success / amber / rose) but reads the signals we
 * already derive for the conversion queue via `getOutputBadge`. A card is
 * "clean" only when nothing asks for your attention: not needs-review, not
 * failed, no live duplicate warning. Clean cards collapse to a quiet one-line
 * summary; risky ones stay expanded with the full evidence. Aggregation only —
 * no new model, no backend call.
 *
 * C14 layers stakes on top: a clean card whose total is high-value (`highValue`)
 * still auto-expands so the reviewer sees the full source evidence — it stays
 * clean in tone (nothing is wrong) but carries a soft amber
 * "high value — worth a double-check" cue rendered alongside.
 */
export function deriveReviewLevel(file: ResultFile, badge: ReturnType<typeof getOutputBadge>): {
  clean: boolean
  tone: AnomalyTone
  summaryLabel: string
  highValue: boolean
} {
  if (badge.state === "failed") {
    return { clean: false, tone: "risk", summaryLabel: "Needs your attention", highValue: false }
  }
  if (badge.state === "needs_review" || activeDuplicateWarnings(file).length) {
    return { clean: false, tone: "caution", summaryLabel: "Needs review", highValue: false }
  }
  // Only the genuinely clean, confident pile collapses. Published / edited
  // cards stay expanded — they carry their own state the reviewer just acted on.
  if (badge.state === "ready") {
    // C14 — a high-value clean invoice stays expanded for a closer look, but
    // remains "clean" in tone; only `clean` (the collapse trigger) flips off.
    const highValue = isHighValue(file)
    return { clean: !highValue, tone: "good", summaryLabel: "Looks clean", highValue }
  }
  return { clean: false, tone: "good", summaryLabel: badge.label, highValue: false }
}

export const vendorRuleInputs: Array<{ key: keyof VendorRuleFields; label: string; placeholder: string; icon: React.ReactNode }> = [
  { key: "category_account", label: "Category / account", placeholder: "Office supplies", icon: <DollarSign /> },
  { key: "tax_code", label: "Tax code", placeholder: "VAT 20%", icon: <Percent /> },
  { key: "currency", label: "Currency", placeholder: "USD", icon: <Tag /> },
  { key: "payment_terms", label: "Payment terms", placeholder: "Net 30", icon: <CreditCard /> },
  { key: "destination_treatment", label: "Destination", placeholder: "Draft bill", icon: <Building2 /> },
]

export function initialVendorRuleDraft(file?: ResultFile | null): VendorRuleFields {
  const remembered = file?.vendor_suggestion?.suggested_fields || {}
  const extracted = file ? reviewData(file) : {}
  return {
    category_account: remembered.category_account || "",
    tax_code: remembered.tax_code || "",
    currency: remembered.currency || String(extracted.currency || ""),
    payment_terms: remembered.payment_terms || "",
    destination_treatment: remembered.destination_treatment || "",
  }
}

export function correctedFilename(filename?: string) {
  return `${(filename || "result").replace("_processed", "").replace(/\.[^/.]+$/, "")}_corrected.xlsx`
}

export function formatDocumentType(type?: string) {
  const labels: Record<string, string> = {
    auto: "Auto-detect",
    table: "Table",
    invoice: "Invoice",
    receipt: "Receipt",
    bank_statement: "Bank statement",
    notes: "Notes",
    needs_manual_selection: "Select type",
  }
  return labels[type || ""] || "Document"
}

export function reviewData(file: ResultFile) {
  return file.reviewed_data && typeof file.reviewed_data === "object" ? file.reviewed_data : {}
}

export function resultSummary(file: ResultFile) {
  const data = reviewData(file)
  const type = file.document_type
  // C11 — a date the at-a-glance summary line can show. Undefined when the
  // document type carries no due/payment date, so the line omits it cleanly.
  // C16 — invoices/receipts carry a Net / VAT / Total breakdown plus a
  // reconciliation verdict so the first review surface speaks bookkeeper.
  if (type === "invoice") {
    return {
      identityLabel: "Vendor",
      identity: String(data.vendor_name || "Vendor not found"),
      amountLabel: "Total",
      amount: [data.currency, data.total].filter(Boolean).join(" ") || "-",
      due: data.due_date,
      bookkeeper: { currency: data.currency, subtotal: data.subtotal, vat: data.tax_vat_amount, total: data.total },
    }
  }
  if (type === "receipt") {
    return {
      identityLabel: "Merchant",
      identity: String(data.merchant || "Merchant not found"),
      amountLabel: "Total",
      amount: [data.currency, data.total].filter(Boolean).join(" ") || "-",
      due: data.date,
      bookkeeper: { currency: data.currency, subtotal: data.subtotal, vat: data.tax_vat_amount, total: data.total },
    }
  }
  if (type === "bank_statement") {
    return {
      identityLabel: "Account",
      identity: String(data.account_holder || data.bank_name || "Account not found"),
      amountLabel: "Closing balance",
      amount: [data.currency, data.closing_balance].filter(Boolean).join(" ") || "-",
      due: undefined,
      bookkeeper: undefined,
    }
  }
  if (type === "notes") {
    const text = String(data.readable_text || "").trim()
    return {
      identityLabel: "Notes",
      identity: text ? `${text.slice(0, 48)}${text.length > 48 ? "..." : ""}` : "Handwritten notes",
      amountLabel: "Tables",
      amount: String(Array.isArray(data.tables) ? data.tables.length : 0),
      due: undefined,
      bookkeeper: undefined,
    }
  }
  return {
    identityLabel: "Output",
    identity: file.filename || "Extracted table",
    amountLabel: "Rows",
    amount: String(Array.isArray(file.review_grid) ? Math.max(file.review_grid.length - 1, 0) : "-"),
    due: undefined,
    bookkeeper: undefined,
  }
}

export function formatCellValue(value: unknown, fallback = "-") {
  if (value === undefined || value === null || value === "") return fallback
  return String(value)
}

export function firstPresentValue(values: unknown[]) {
  const found = values.find(value => value !== undefined && value !== null && value !== "")
  return found === undefined ? "-" : String(found)
}

export function resultReference(file: ResultFile) {
  const data = reviewData(file)
  return firstPresentValue([
    data.invoice_number,
    data.reference,
    data.receipt_number,
    data.payment_reference,
    data.statement_number,
    data.account_number,
    data.document_id,
    file.source_page ? `Page ${file.source_page}${file.source_page_count ? `/${file.source_page_count}` : ""}` : "",
  ])
}

export function resultDate(file: ResultFile) {
  const data = reviewData(file)
  return firstPresentValue([
    data.invoice_date,
    data.date,
    data.receipt_date,
    data.statement_date,
    data.period_start,
    data.start_date,
  ])
}

export function resultDueDate(file: ResultFile, summary: ReturnType<typeof resultSummary>) {
  const data = reviewData(file)
  return firstPresentValue([
    summary.due,
    data.due_date,
    data.payment_due_date,
    data.period_end,
    data.end_date,
  ])
}

export function documentTypeToneClass(_type?: string) {
  return "text-[var(--workspace-muted)]"
}

export function statusChipClass(state: ReturnType<typeof getOutputBadge>["state"]) {
  const classes: Record<ReturnType<typeof getOutputBadge>["state"], string> = {
    failed: "border-red-200 bg-white text-[var(--text-danger)]",
    needs_review: "border-amber-200 bg-white text-[var(--text-attention)]",
    ready: "border-[var(--workspace-selection-border)] bg-white text-[var(--workspace-primary)]",
    published: "border-[var(--workspace-selection-border)] bg-white text-[var(--workspace-primary)]",
    edited: "border-violet-200 bg-white text-[var(--text-review)]",
  }
  return classes[state]
}

export function statusDotClass(state: ReturnType<typeof getOutputBadge>["state"]) {
  const classes: Record<ReturnType<typeof getOutputBadge>["state"], string> = {
    failed: "bg-[var(--text-danger)]",
    needs_review: "bg-[var(--text-attention)]",
    ready: "bg-[var(--workspace-primary)]",
    published: "bg-[var(--workspace-primary)]",
    edited: "bg-[var(--text-review)]",
  }
  return classes[state]
}

export function rowAccentClass(state: ReturnType<typeof getOutputBadge>["state"], duplicateWarning?: DocumentDuplicateWarning) {
  if (duplicateWarning) return "border-l-[var(--text-attention)]"
  const classes: Record<ReturnType<typeof getOutputBadge>["state"], string> = {
    failed: "border-l-[var(--text-danger)]",
    needs_review: "border-l-[var(--text-attention)]",
    ready: "border-l-[var(--workspace-primary)]",
    published: "border-l-[var(--workspace-primary)]",
    edited: "border-l-[var(--text-review)]",
  }
  return classes[state]
}

export function resultIssue(
  file: ResultFile,
  badge: ReturnType<typeof getOutputBadge>,
  reviewLevel: ReturnType<typeof deriveReviewLevel>,
  duplicateWarning?: DocumentDuplicateWarning,
) {
  if (duplicateWarning) return { label: "Duplicate", className: "ax-text-attention" }
  if (badge.state === "failed") return { label: "Failed", className: "ax-text-danger" }
  if (reviewLevel.highValue) return { label: "High value", className: "ax-text-attention" }
  if (badge.state === "needs_review") return { label: "Needs review", className: "ax-text-attention" }
  if (badge.state === "published") return { label: "Published", className: "ax-text-success" }
  if (badge.state === "edited" || file.review_status === "edited") return { label: "Edited", className: "ax-text-review" }
  return { label: "Clean", className: "ax-text-success" }
}

export function structuredRows(file: ResultFile, language: InvoiceLanguage = "en"): { columns: string[]; rows: any[][]; pathRoot?: string } | null {
  const data = reviewData(file)
  if (file.document_type === "invoice" || file.document_type === "receipt") {
    return {
      columns: [
        columnLabel("description", language, "Description"),
        columnLabel("quantity", language, "Quantity"),
        columnLabel("unit_price", language, "Unit price"),
        columnLabel("tax_rate", language, "Tax"),
        columnLabel("line_total", language, "Line total"),
      ],
      rows: Array.isArray(data.line_items)
        ? data.line_items.map((row: Record<string, any>) => [
            row.description || "",
            row.quantity || "",
            row.unit_price || "",
            row.tax_rate || "",
            row.line_total || "",
          ])
        : [],
      pathRoot: "line_items",
    }
  }
  if (file.document_type === "bank_statement") {
    return {
      columns: [
        columnLabel("date", language, "Date"),
        columnLabel("description", language, "Description"),
        columnLabel("reference", language, "Reference"),
        columnLabel("debit", language, "Debit"),
        columnLabel("credit", language, "Credit"),
        columnLabel("balance", language, "Balance"),
      ],
      rows: Array.isArray(data.transactions)
        ? data.transactions.map((row: Record<string, any>) => [
            row.date || "",
            row.description || "",
            row.reference || "",
            row.debit || "",
            row.credit || "",
            row.balance || "",
          ])
        : [],
      pathRoot: "transactions",
    }
  }
  return null
}

export function structuredRowPaths(file: ResultFile) {
  if (file.document_type === "invoice" || file.document_type === "receipt") {
    return ["description", "quantity", "unit_price", "tax_rate", "line_total"]
  }
  if (file.document_type === "bank_statement") {
    return ["date", "description", "reference", "debit", "credit", "balance"]
  }
  return []
}

export function structuredFields(file: ResultFile, language: InvoiceLanguage = "en"): Array<{ label: string; path: string; value: string }> {
  const data = reviewData(file)
  const byMode: Record<string, Array<[string, string]>> = {
    invoice: [
      ["Vendor", "vendor_name"], ["Invoice no.", "invoice_number"], ["Invoice date", "invoice_date"],
      ["Due date", "due_date"], ["Subtotal", "subtotal"], ["Tax / VAT", "tax_vat_amount"],
      ["Total", "total"], ["Currency", "currency"],
    ],
    receipt: [
      ["Merchant", "merchant"], ["Date", "date"], ["Payment method", "payment_method"],
      ["Subtotal", "subtotal"], ["Tax / VAT", "tax_vat_amount"], ["Total", "total"], ["Currency", "currency"],
    ],
    bank_statement: [
      ["Account holder", "account_holder"], ["Bank", "bank_name"], ["Period", "period"],
      ["Opening balance", "opening_balance"], ["Closing balance", "closing_balance"], ["Currency", "currency"],
    ],
  }
  return (byMode[file.document_type || ""] || []).map(([label, path]) => ({
    label: fieldLabel(path, language, label),
    path,
    value: String(data[path] || ""),
  }))
}

export function normalizeRecentFiles(response: any): import("./types").RecentBatchFile[] {
  const rows = Array.isArray(response)
    ? response
    : response?.jobs || response?.history || response?.items || response?.data || []

  return rows.flatMap((item: any) => {
    const id = item.id || item.job_id || item.original_job_id
    const createdAt = item.updated_at || item.saved_at || item.completed_at || item.created_at
    if (!id || !createdAt) return []
    return [{
      id,
      filename: item.filename || item.original_filename || item.output_filename || "Converted batch",
      status: item.status || "completed",
      createdAt,
    }]
  })
}

export function recentStatusChip(status: string): { label: string; chip: string } {
  if (["processing", "pending", "queued"].includes(status))
    return { label: "Reading", chip: "border-blue-200 bg-white text-[var(--text-working)]" }
  if (["failed", "error"].includes(status))
    return { label: "Failed", chip: "border-red-200 bg-white text-[var(--text-danger)]" }
  if (status === "requires_review")
    return { label: "Needs review", chip: "border-amber-200 bg-white text-[var(--text-attention)]" }
  return { label: "Ready", chip: "border-[var(--workspace-selection-border)] bg-white text-[var(--workspace-primary)]" }
}

"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Check,
  Download,
  FileText,
  Loader2,
  Receipt,
  ScanLine,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/DashboardShell"
import { useAuth } from "@/hooks/useAuth"
import { accountsPayableApi, ocrApi, type JobDocumentRecord } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type FieldDef = { label: string; path: string; tone?: string }
type LineItemConfig = {
  root: string
  columns: Array<[string, string]>
  rows: Record<string, any>[]
  numericFrom: number
}

const STATUS_STYLE: Record<string, string> = {
  ready: "border-[#bbf7d0] bg-[#ecfdf3] text-[#166534]",
  published: "border-[#e7d8c6] bg-[#f8f3eb] text-[var(--brand-brown-deep)]",
  edited: "border-[#ddd6fe] bg-[#f5f3ff] text-[#5b21b6]",
  failed: "border-[#fecaca] bg-[#fff1f2] text-[#b42318]",
  needs_review: "border-[#fed7aa] bg-[#fff7ed] text-[#92400e]",
  deleted: "border-[#e8e1d8] bg-white text-[#475467]",
}
const STATUS_LABEL: Record<string, string> = {
  ready: "Ready",
  published: "Published",
  edited: "Edited",
  failed: "Failed",
  needs_review: "Needs review",
  deleted: "Deleted",
}
const TYPE_TONE: Record<string, string> = {
  invoice: "text-[#166534]",
  receipt: "text-[#b45309]",
  bank_statement: "text-[var(--brand-brown-fg)]",
  notes: "text-[#5b21b6]",
  table: "text-[#0f766e]",
}
const TYPE_ACCENT: Record<string, string> = {
  invoice: "#166534",
  receipt: "#b45309",
  bank_statement: "#6b4f2e",
  notes: "#5b21b6",
  table: "#0f766e",
  auto: "#475467",
}
const TYPE_LABEL: Record<string, string> = {
  auto: "Auto-detect",
  table: "Table",
  invoice: "Invoice",
  receipt: "Receipt",
  bank_statement: "Bank statement",
  notes: "Notes",
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function csvToGrid(csvText: unknown): any[][] | null {
  if (typeof csvText !== "string" || !csvText.trim()) return null

  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index]
    const next = csvText[index + 1]

    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === "," && !quoted) {
      row.push(cell.trim())
      cell = ""
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ""
    } else {
      cell += char
    }
  }

  row.push(cell.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows.length ? rows : null
}

function gridFromPayload(payload: unknown): any[][] | null {
  if (!payload || typeof payload !== "object") return null
  const record = payload as Record<string, any>
  if (Array.isArray(record.review_grid)) return record.review_grid
  return csvToGrid(record.csv)
}

function FullLoader({ label = "Opening document" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2 bg-background text-sm font-semibold text-[#475467]">
      <Loader2 className="size-4 animate-spin text-[var(--brand-brown-fg)]" />
      {label}
    </div>
  )
}

function FormField({
  label,
  value,
  onSave,
  saving,
  labelTone,
}: {
  label: string
  value: string
  onSave: (next: string) => void
  saving?: boolean
  labelTone?: string
}) {
  return (
    <label className="block">
      <span className={cn("mb-2 flex items-center gap-1.5 text-[12px] font-bold tracking-tight", labelTone || "text-[#111827]")}>
        {label}
        {saving ? <Loader2 className="size-3 animate-spin text-[var(--brand-brown-fg)]" /> : null}
      </span>
      <input
        key={`${label}-${value}`}
        defaultValue={value}
        onBlur={(event) => {
          if (event.target.value !== value) onSave(event.target.value)
        }}
        className="h-11 w-full rounded-md border border-[#ded6cc] bg-white px-3 text-[14px] font-semibold text-[#111827] outline-none transition focus:border-[var(--brand-brown-fg)] focus:ring-2 focus:ring-[#a98467]/20"
        placeholder="—"
      />
    </label>
  )
}

export default function DocumentReviewPage() {
  return (
    <Suspense fallback={<FullLoader />}>
      <DocumentReviewContent />
    </Suspense>
  )
}

function DocumentReviewContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const jobId = params.get("job") || ""
  const documentId = params.get("doc") || ""

  const [doc, setDoc] = useState<JobDocumentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [savingPath, setSavingPath] = useState<string | null>(null)
  const [markingReady, setMarkingReady] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [sendingBill, setSendingBill] = useState(false)
  const [sentToBills, setSentToBills] = useState(false)

  const load = useCallback(async () => {
    if (!jobId || !documentId) {
      setError("This document link is missing its reference.")
      setLoading(false)
      return
    }
    try {
      // Use the batch documents endpoint (same source as the review board): it
      // returns SIGNED source/preview URLs and the full extraction payload
      // (reviewed_data, line_items, review_grid). The single /review endpoint
      // returns an unsigned, leaner document — which left the preview and line
      // items empty.
      const response = await ocrApi.getJobDocuments(jobId)
      const found = response.documents.find((item) => item.id === documentId) || null
      if (!found) {
        setError("This document is no longer part of the batch.")
        setDoc(null)
      } else {
        setDoc(found)
        setError("")
      }
    } catch (err: any) {
      setError(err?.detail || err?.message || "This document could not be opened.")
    } finally {
      setLoading(false)
    }
  }, [jobId, documentId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/sign-in?next=${encodeURIComponent(`/dashboard/document?job=${jobId}&doc=${documentId}`)}`)
    }
  }, [authLoading, user, router, jobId, documentId])

  if (authLoading || (loading && !doc)) return <FullLoader />

  if (error || !doc) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-base font-bold text-[#111827]">{error || "Document not found"}</p>
        <Button asChild variant="surface" className="h-10 px-4 text-sm">
          <Link href="/dashboard/client">
            <ArrowLeft className="size-4" />
            Back to review
          </Link>
        </Button>
      </div>
    )
  }

  const extraction = doc.extractions?.find((item) => item.reviewed_data || item.raw_structured_data) || doc.extractions?.[0]
  const reviewedPayload = (extraction?.reviewed_data || null) as Record<string, any> | null
  const rawPayload = (extraction?.raw_structured_data || null) as Record<string, any> | null
  const data = (reviewedPayload || rawPayload || {}) as Record<string, any>
  const reviewGrid = gridFromPayload(reviewedPayload) || gridFromPayload(rawPayload)
  const docType = doc.resolved_mode || doc.detected_mode || doc.selected_mode || "auto"
  const status = doc.review_status || extraction?.review_status || "needs_review"
  const sourceUrl = extraction?.source_preview_url || doc.source_access_url || ""
  const processingUnitId = extraction?.processing_unit_id || ""
  const accent = TYPE_ACCENT[docType] || TYPE_ACCENT.auto

  // Only treat `currency` as a real currency token (code/symbol). Bad extractions
  // sometimes dump a list of amounts into this field — never prefix that onto values.
  const currencyLabel =
    typeof data.currency === "string" && data.currency.trim().length > 0 && data.currency.trim().length <= 4
      ? data.currency.trim()
      : ""
  const money = (value: any) => (value === undefined || value === null || value === "" ? "—" : [currencyLabel, value].filter(Boolean).join(" "))

  const persist = async (fieldPath: Array<string | number>, value: string) => {
    if (!processingUnitId) {
      toast.error("This document is missing edit metadata. Reopen the batch and try again.")
      return
    }
    setSavingPath(fieldPath.join("."))
    try {
      await ocrApi.updateDocumentReviewValue(jobId, documentId, {
        processing_unit_id: processingUnitId,
        field_path: fieldPath,
        value,
      })
      await load()
    } catch (err: any) {
      toast.error(err?.detail || err?.message || "Could not save that change.")
    } finally {
      setSavingPath(null)
    }
  }

  const markReady = async () => {
    setMarkingReady(true)
    try {
      await ocrApi.updateDocumentReviewStatus(jobId, documentId, "ready")
      await load()
      toast.success("Document marked ready.")
    } catch (err: any) {
      toast.error(err?.detail || err?.message || "Could not mark this document ready.")
    } finally {
      setMarkingReady(false)
    }
  }

  const download = async () => {
    setDownloading(true)
    try {
      const blob = await ocrApi.downloadReviewedDocument(jobId, documentId, "xlsx")
      const stem = (doc.original_filename || "axliner_document").replace(/\.[^/.]+$/, "")
      downloadBlob(blob, `${stem}_reviewed.xlsx`)
    } catch (err: any) {
      toast.error(err?.detail || err?.message || "Could not download this document.")
    } finally {
      setDownloading(false)
    }
  }

  const sendToBills = async () => {
    setSendingBill(true)
    try {
      await accountsPayableApi.createFromDocument(jobId, documentId)
      setSentToBills(true)
      toast.success("Invoice sent to draft bills.")
    } catch (err: any) {
      toast.error(err?.detail || err?.message || "Could not send this invoice to draft bills.")
    } finally {
      setSendingBill(false)
    }
  }

  const headerFields: FieldDef[] =
    docType === "invoice"
      ? [
          { label: "From", path: "vendor_name" },
          { label: "Invoice no.", path: "invoice_number" },
          { label: "Invoice date", path: "invoice_date" },
          { label: "Due date", path: "due_date" },
        ]
      : docType === "receipt"
        ? [
            { label: "Merchant", path: "merchant" },
            { label: "Date", path: "date" },
            { label: "Payment method", path: "payment_method" },
          ]
        : docType === "bank_statement"
          ? [
              { label: "Account holder", path: "account_holder" },
              { label: "Bank", path: "bank_name" },
              { label: "Period", path: "period" },
            ]
          : []

  const lineItems: LineItemConfig | null =
    docType === "invoice" || docType === "receipt"
      ? {
          root: "line_items",
          columns: [
            ["Description", "description"],
            ["Qty", "quantity"],
            ["Unit price", "unit_price"],
            ["Tax rate", "tax_rate"],
            ["Amount", "line_total"],
          ],
          rows: Array.isArray(data.line_items) ? data.line_items : [],
          numericFrom: 1,
        }
      : docType === "bank_statement"
        ? {
            root: "transactions",
            columns: [
              ["Date", "date"],
              ["Description", "description"],
              ["Reference", "reference"],
              ["Debit", "debit"],
              ["Credit", "credit"],
              ["Balance", "balance"],
            ],
            rows: Array.isArray(data.transactions) ? data.transactions : [],
            numericFrom: 3,
          }
        : null

  const showInvoiceTotals = docType === "invoice" || docType === "receipt"
  const totalDisplay =
    docType === "bank_statement"
      ? money(data.closing_balance)
      : showInvoiceTotals
        ? money(data.total)
        : reviewGrid
          ? String(Math.max(reviewGrid.length - 1, 0))
          : "—"
  const totalLabel = docType === "bank_statement" ? "Closing balance" : showInvoiceTotals ? "Total" : "Rows"

  const canMarkReady = !["ready", "published", "failed", "deleted"].includes(status)
  const canSendToBills = docType === "invoice" && ["ready", "published"].includes(status)

  return (
    <DashboardShell
      activeItem="process"
      title={doc.original_filename || "Review document"}
      eyebrow="Review"
      user={user}
      contentClassName="max-w-none px-3 py-3 sm:px-5 lg:px-6"
      showBack={false}
    >
      <div className="min-h-[calc(100svh-5rem)] bg-background text-[#111827]">
        <header className="mb-6 rounded-lg border border-[#e8e1d8] bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-[1560px] flex-wrap items-center gap-3 px-5 py-3 sm:px-7">
          <Button asChild variant="surface" size="sm" className="h-9 px-3 text-xs">
            <Link href={`/dashboard/client?job_id=${jobId}`}>
              <ArrowLeft className="size-4" />
              Review
            </Link>
          </Button>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accent}14`, color: accent }}
          >
            {docType === "receipt" ? <Receipt className="size-4" /> : docType === "table" ? <ScanLine className="size-4" /> : <FileText className="size-4" />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex h-5 items-center whitespace-nowrap rounded-full border px-2 text-[11px] font-semibold leading-none", STATUS_STYLE[status] || STATUS_STYLE.needs_review)}>
                {STATUS_LABEL[status] || status}
              </span>
              <span className={cn("text-[11px] font-bold uppercase tracking-[0.08em]", TYPE_TONE[docType] || "text-[#475467]")}>
                {TYPE_LABEL[docType] || "Document"}
              </span>
            </div>
            <p className="mt-0.5 max-w-[42ch] truncate text-[15px] font-bold tracking-tight">{doc.original_filename}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="surface"
              onClick={() => void download()}
              disabled={downloading}
              className="h-9 px-3 text-xs"
            >
              {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Download
            </Button>
            {canSendToBills ? (
              <Button
                type="button"
                variant="surface"
                onClick={() => void sendToBills()}
                disabled={sendingBill || sentToBills}
                className="h-9 px-3 text-xs"
              >
                {sendingBill ? <Loader2 className="size-4 animate-spin" /> : null}
                {sentToBills ? "Sent to bills" : "Send to draft bills"}
              </Button>
            ) : null}
            {canMarkReady ? (
              <Button
                type="button"
                variant="glossy"
                onClick={() => void markReady()}
                disabled={markingReady}
                className="h-9 px-4 text-xs"
              >
                {markingReady ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Mark ready
              </Button>
            ) : null}
          </div>
          </div>
        </header>

      <motion.main
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto grid max-w-[1560px] gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]"
      >
        {/* Source preview — sticky on desktop */}
        <div className="lg:sticky lg:top-[84px] lg:self-start">
          <div className="overflow-hidden rounded-lg border border-[#e8e1d8] bg-white shadow-sm">
            <div className="border-b border-[#e8e1d8] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#475467]">
              Source document
            </div>
            <div className="flex max-h-[78vh] items-center justify-center overflow-auto bg-[#faf8f5] p-4">
              {sourceUrl ? (
                <img src={sourceUrl} alt={doc.original_filename} className="max-h-[74vh] w-full rounded-lg object-contain" />
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 text-[13px] font-semibold text-[#475467]">
                  <FileText className="size-6 text-[#94a3b8]" />
                  No preview
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#e8e1d8] bg-white shadow-sm">
          <div className="border-b border-[#eee7de] px-7 py-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-5 gap-y-5 lg:grid-cols-3">
                {headerFields.length ? (
                  headerFields.map((field) => (
                    <FormField
                      key={field.path}
                      label={field.label}
                      value={String(data[field.path] ?? "")}
                      saving={savingPath === field.path}
                      onSave={(next) => void persist([field.path], next)}
                    />
                  ))
                ) : (
                  <div className="col-span-2 lg:col-span-3">
                    <span className="mb-2 block text-[12px] font-bold tracking-tight text-[#475467]">Document</span>
                    <p className="truncate text-[15px] font-bold tracking-tight text-[#111827]">
                      {data.vendor_name || data.merchant || data.account_holder || data.bank_name || doc.original_filename}
                    </p>
                  </div>
                )}
              </div>
              <div className="w-full shrink-0 lg:w-52">
                <p className="text-[12px] font-bold tracking-tight text-[#475467] lg:text-right">{totalLabel}</p>
                <div className="mt-2 flex h-12 items-center justify-end rounded-md border border-[#ded6cc] bg-[#faf8f5] px-3">
                  <span className="truncate text-[20px] font-extrabold tabular-nums text-[#111827]" title={totalDisplay}>{totalDisplay}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line items */}
          {lineItems ? (
            lineItems.rows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#e8e1d8] bg-[#faf8f5]">
                      {lineItems.columns.map(([label], index) => (
                        <th
                          key={label}
                          className={cn(
                            "px-4 py-3 text-[12px] font-bold tracking-tight text-[#475467]",
                            index >= lineItems.numericFrom ? "text-right" : "text-left",
                          )}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-[#eee7de] transition-colors hover:bg-[#faf7f2]">
                        {lineItems.columns.map(([, key], colIndex) => {
                          const numeric = colIndex >= lineItems.numericFrom
                          const isAmount = colIndex === lineItems.columns.length - 1
                          return (
                            <td key={key} className="px-1.5 py-1.5 align-middle">
                              <input
                                key={`${rowIndex}-${key}-${row[key] ?? ""}`}
                                defaultValue={String(row[key] ?? "")}
                                onBlur={(event) => {
                                  if (event.target.value !== String(row[key] ?? "")) {
                                    void persist([lineItems.root, rowIndex, key], event.target.value)
                                  }
                                }}
                                className={cn(
                                  "h-10 w-full min-w-[80px] rounded-md border border-[#eee7de] bg-white px-2.5 text-[14px] text-[#111827] outline-none transition focus:border-[var(--brand-brown-fg)] focus:ring-2 focus:ring-[#a98467]/20",
                                  numeric && "text-right tabular-nums",
                                  isAmount && "font-bold",
                                )}
                              />
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-7 py-8 text-center text-[13px] font-semibold text-[#475467]">No line items.</p>
            )
          ) : null}

          {/* Raw extracted table (table / notes documents) — clean spreadsheet */}
          {!lineItems && reviewGrid ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[13px]">
                <tbody>
                  {reviewGrid.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex === 0 ? "bg-[#faf8f5] font-semibold" : "bg-white transition-colors hover:bg-[#faf7f2]"}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={cn(
                            "border border-[#eee7de] px-2 py-1",
                            rowIndex === 0 && "border-[#e8e1d8]",
                          )}
                        >
                          <input
                            key={`${rowIndex}-${cellIndex}-${cell ?? ""}`}
                            defaultValue={String(cell ?? "")}
                            onBlur={(event) => {
                              if (event.target.value !== String(cell ?? "")) {
                                void persist(["review_grid", rowIndex, cellIndex], event.target.value)
                              }
                            }}
                            className={cn(
                              "h-10 w-full min-w-[110px] rounded-md border border-transparent bg-transparent px-2.5 text-[13px] outline-none transition focus:border-[var(--brand-brown-fg)] focus:bg-white focus:ring-2 focus:ring-[#a98467]/20",
                              rowIndex === 0 ? "text-[12px] font-bold tracking-tight text-[#475467]" : "font-medium text-[#111827]",
                            )}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {/* Totals block */}
          {showInvoiceTotals ? (
            <div className="px-7 py-7">
              <div className="ml-auto w-full max-w-[360px]">
                <div className="flex items-center justify-between gap-4 py-2 text-[14px]">
                  <span className="shrink-0 font-semibold text-[#475467]">Subtotal</span>
                  <span className="min-w-0 truncate text-right font-semibold tabular-nums text-[#111827]" title={money(data.subtotal)}>{money(data.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-[#e8e1d8] py-2 text-[14px]">
                  <span className="shrink-0 font-semibold text-[#475467]">VAT</span>
                  <span className="min-w-0 truncate text-right font-semibold tabular-nums text-[#111827]" title={money(data.tax_vat_amount)}>{money(data.tax_vat_amount)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t-2 border-[#111827] pt-3">
                  <span className="shrink-0 text-[18px] font-extrabold tracking-tight text-[#111827]">TOTAL</span>
                  <span className="min-w-0 truncate text-right text-[22px] font-extrabold tabular-nums text-[#111827]" title={money(data.total)}>{money(data.total)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </motion.main>
      </div>
    </DashboardShell>
  )
}

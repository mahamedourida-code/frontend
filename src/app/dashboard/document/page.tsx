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
  published: "border-[#bfdbfe] bg-[#eff6ff] text-[#0f5fcb]",
  edited: "border-[#ddd6fe] bg-[#f5f3ff] text-[#5b21b6]",
  failed: "border-[#fecaca] bg-[#fff1f2] text-[#b42318]",
  needs_review: "border-[#fed7aa] bg-[#fff7ed] text-[#92400e]",
  deleted: "border-[#e4e7ef] bg-white text-[#475467]",
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
  bank_statement: "text-[#0f5fcb]",
  notes: "text-[#5b21b6]",
  table: "text-[#0f766e]",
}
const TYPE_ACCENT: Record<string, string> = {
  invoice: "#166534",
  receipt: "#b45309",
  bank_statement: "#0f5fcb",
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

function FullLoader({ label = "Opening document" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2 bg-[#f4f6fa] text-sm font-semibold text-[#475467]">
      <Loader2 className="size-4 animate-spin text-[#1877F2]" />
      {label}
    </div>
  )
}

/** A boxed, labelled, editable field — Xero "Contact / Issue date / Reference" style.
 *  Label sits ABOVE the box; box has a clean 1px border and generous height. */
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
        {saving ? <Loader2 className="size-3 animate-spin text-[#1877F2]" /> : null}
      </span>
      <input
        key={`${label}-${value}`}
        defaultValue={value}
        onBlur={(event) => {
          if (event.target.value !== value) onSave(event.target.value)
        }}
        className="h-11 w-full rounded-md border border-[#d7dce3] bg-white px-3 text-[14px] font-semibold text-[#111827] outline-none transition focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20"
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
      const response = await ocrApi.getDocumentReview(jobId, documentId)
      setDoc(response.document)
      setError("")
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f6fa] px-6 text-center">
        <p className="text-base font-bold text-[#111827]">{error || "Document not found"}</p>
        <Link
          href="/dashboard/client"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#cfd4d9] bg-white px-4 text-sm font-semibold text-[#0f5fcb] hover:border-[#1877F2] hover:bg-[#eff6ff]"
        >
          <ArrowLeft className="size-4" />
          Back to review
        </Link>
      </div>
    )
  }

  const extraction = doc.extractions?.find((item) => item.reviewed_data || item.raw_structured_data) || doc.extractions?.[0]
  const data = (extraction?.reviewed_data || extraction?.raw_structured_data || {}) as Record<string, any>
  const reviewGrid = Array.isArray((extraction?.reviewed_data as any)?.review_grid)
    ? ((extraction!.reviewed_data as any).review_grid as any[][])
    : null
  const docType = doc.resolved_mode || doc.detected_mode || doc.selected_mode || "auto"
  const status = doc.review_status || extraction?.review_status || "needs_review"
  const sourceUrl = extraction?.source_preview_url || doc.source_access_url || ""
  const processingUnitId = extraction?.processing_unit_id || ""
  const accent = TYPE_ACCENT[docType] || TYPE_ACCENT.auto

  const money = (value: any) => (value === undefined || value === null || value === "" ? "—" : [data.currency, value].filter(Boolean).join(" "))

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
    <div className="min-h-screen bg-[#f4f6fa] text-[#111827]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-[#e4e7ef] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1560px] flex-wrap items-center gap-3 px-5 py-3 sm:px-7">
          <Link
            href={`/dashboard/client?job_id=${jobId}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#cfd4d9] bg-white px-3 text-xs font-semibold text-[#475467] transition-colors hover:border-[#1877F2] hover:bg-[#eff6ff] hover:text-[#0f5fcb]"
          >
            <ArrowLeft className="size-4" />
            Review
          </Link>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accent}14`, color: accent }}
          >
            {docType === "receipt" ? <Receipt className="size-4" /> : docType === "table" ? <ScanLine className="size-4" /> : <FileText className="size-4" />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-semibold", STATUS_STYLE[status] || STATUS_STYLE.needs_review)}>
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
              className="h-9 gap-2 rounded-full border-[#cfd4d9] bg-white px-3 text-xs text-[#111827] shadow-none hover:border-[#1877F2] hover:bg-[#eff6ff]"
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
                className="h-9 gap-2 rounded-full border-[#cfd4d9] bg-white px-3 text-xs text-[#111827] shadow-none hover:border-[#1877F2] hover:bg-[#eff6ff]"
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
                className="h-9 gap-2 rounded-full border border-[#16a34a] bg-[#16a34a] px-4 text-xs font-semibold text-white shadow-none hover:border-[#15803d] hover:bg-[#15803d]"
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
        className="mx-auto grid max-w-[1560px] gap-6 px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]"
      >
        {/* Source preview — sticky on desktop */}
        <div className="lg:sticky lg:top-[84px] lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-[#e4e7ef] bg-white shadow-sm">
            <div className="border-b border-[#e4e7ef] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#475467]">
              Source document
            </div>
            <div className="flex max-h-[78vh] items-center justify-center overflow-auto bg-[#f8f9fb] p-4">
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

        {/* Extracted form — modelled on Xero "Edit Bill" / "New invoice" */}
        <div className="overflow-hidden rounded-2xl border border-[#e4e7ef] bg-white shadow-sm">
          {/* Status row: plain status word left (Xero "Draft"), light action right */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef1f6] px-7 py-4">
            <span className="text-[13px] font-bold text-[#475467]">{STATUS_LABEL[status] || status}</span>
            <button
              type="button"
              onClick={() => void download()}
              disabled={downloading}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#cfd4d9] bg-white px-3 text-[12px] font-semibold text-[#0f5fcb] transition-colors hover:border-[#1877F2] hover:bg-[#eff6ff] disabled:opacity-60"
            >
              {downloading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
              Export XLSX
            </button>
          </div>

          {/* Header fields row: boxed, labelled fields + LARGE total on the right */}
          <div className="border-b border-[#eef1f6] px-7 py-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid flex-1 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
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
                  <div className="sm:col-span-2 xl:col-span-3">
                    <span className="mb-2 block text-[12px] font-bold tracking-tight text-[#475467]">Document</span>
                    <p className="truncate text-[15px] font-bold tracking-tight text-[#111827]">
                      {data.vendor_name || data.merchant || data.account_holder || data.bank_name || doc.original_filename}
                    </p>
                  </div>
                )}
              </div>
              {/* Big total on the far right (Xero "Total … 0.00") */}
              <div className="shrink-0 lg:pl-6 lg:text-right">
                <p className="text-[12px] font-bold tracking-tight text-[#475467]">{totalLabel}</p>
                <p className="mt-1 text-[32px] font-extrabold leading-none tabular-nums text-[#111827]">{totalDisplay}</p>
              </div>
            </div>
          </div>

          {/* Line items (invoice / receipt / bank) — generous, Xero-style table */}
          {lineItems ? (
            lineItems.rows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#e4e7ef] bg-[#f8f9fb]">
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
                      <tr key={rowIndex} className="border-b border-[#eef1f6] transition-colors hover:bg-[#f8fbff]">
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
                                  "h-10 w-full min-w-[80px] rounded-md border border-[#e7ebf0] bg-white px-2.5 text-[14px] text-[#111827] outline-none transition focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20",
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
                    <tr key={rowIndex} className={rowIndex === 0 ? "bg-[#f8f9fb] font-semibold" : "bg-white transition-colors hover:bg-[#f8fbff]"}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={cn(
                            "border border-[#eef1f6] px-2 py-1",
                            rowIndex === 0 && "border-[#e4e7ef]",
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
                              "h-10 w-full min-w-[110px] rounded-md border border-transparent bg-transparent px-2.5 text-[13px] outline-none transition focus:border-[#1877F2] focus:bg-white focus:ring-2 focus:ring-[#1877F2]/20",
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

          {/* Totals block — Subtotal / VAT / large bold TOTAL with rule lines (Xero) */}
          {showInvoiceTotals ? (
            <div className="px-7 py-7">
              <div className="ml-auto w-full max-w-[360px]">
                <div className="flex items-center justify-between py-2 text-[14px]">
                  <span className="font-semibold text-[#475467]">Subtotal</span>
                  <span className="font-semibold tabular-nums text-[#111827]">{money(data.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#e4e7ef] py-2 text-[14px]">
                  <span className="font-semibold text-[#475467]">VAT</span>
                  <span className="font-semibold tabular-nums text-[#111827]">{money(data.tax_vat_amount)}</span>
                </div>
                <div className="flex items-center justify-between border-t-2 border-[#111827] pt-3">
                  <span className="text-[18px] font-extrabold tracking-tight text-[#111827]">TOTAL</span>
                  <span className="text-[22px] font-extrabold tabular-nums text-[#111827]">{money(data.total)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </motion.main>
    </div>
  )
}

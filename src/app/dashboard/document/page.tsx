"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { DashboardShell } from "@/components/DashboardShell"
import {
  DocumentReviewWorkspace,
  type ReviewField,
  type ReviewTable,
  type ReviewTotal,
} from "@/components/dashboard/document/DocumentReviewWorkspace"
import { WorkspaceActivityIndicator } from "@/components/dashboard/WorkspaceActivityIndicator"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { accountsPayableApi, ocrApi, type JobDocumentRecord } from "@/lib/api-client"

const STATUS_LABEL: Record<string, string> = {
  ready: "Ready",
  published: "Published",
  edited: "Edited",
  failed: "Failed",
  needs_review: "Needs review",
  deleted: "Deleted",
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

function csvToGrid(csvText: unknown): unknown[][] | null {
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

function gridFromPayload(payload: unknown): unknown[][] | null {
  if (!payload || typeof payload !== "object") return null
  const record = payload as Record<string, unknown>
  if (Array.isArray(record.review_grid)) return record.review_grid as unknown[][]
  return csvToGrid(record.csv)
}

function FullLoader({ label = "Opening document" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <WorkspaceActivityIndicator
        title={label === "Opening document" ? "Opening document review" : label}
        detail="Retrieving the source, extracted fields, and review notes."
        scope="page"
        className="max-w-xl"
      />
    </div>
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
  const saveInFlightRef = useRef(false)

  const load = useCallback(async () => {
    if (!jobId || !documentId) {
      setError("This document link is missing its reference.")
      setLoading(false)
      return
    }

    try {
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

  if (authLoading || (loading && !doc) || !user) return <FullLoader />

  if (error || !doc) {
    return (
      <DashboardShell
        activeItem="process"
        title="Review document"
        eyebrow="Review"
        user={user}
        showBack={false}
      >
        <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-[15px] font-medium text-[var(--workspace-ink)]">{error || "Document not found"}</p>
          <Button
            asChild
            variant="surface"
            className="h-9 px-4 text-[13px] shadow-none hover:translate-y-0 hover:shadow-none active:translate-y-0 active:shadow-none"
          >
            <Link href="/dashboard/client">
              <ArrowLeft className="size-4" />
              Back to batch
            </Link>
          </Button>
        </div>
      </DashboardShell>
    )
  }

  const extraction =
    doc.extractions?.find((item) => item.reviewed_data || item.raw_structured_data)
    || doc.extractions?.[0]
  const reviewedPayload = (extraction?.reviewed_data || null) as Record<string, unknown> | null
  const rawPayload = (extraction?.raw_structured_data || null) as Record<string, unknown> | null
  const data = (reviewedPayload || rawPayload || {}) as Record<string, any>
  const reviewGrid = gridFromPayload(reviewedPayload) || gridFromPayload(rawPayload)
  const uncertainCellsRaw = (reviewedPayload?.uncertain_cells || rawPayload?.uncertain_cells) as number[][] | undefined
  const uncertainCells = Array.isArray(uncertainCellsRaw)
    ? uncertainCellsRaw.map(([row, column]) => `${row}:${column}`)
    : []
  const docType = doc.resolved_mode || doc.detected_mode || doc.selected_mode || "auto"
  const status = doc.review_status || extraction?.review_status || "needs_review"
  const sourceUrl = extraction?.source_preview_url || doc.source_access_url || ""
  const sourceContentType = extraction?.source_preview_url ? "image/*" : doc.source_content_type
  const processingUnitId = extraction?.processing_unit_id || ""

  const currencyLabel =
    typeof data.currency === "string"
    && data.currency.trim().length > 0
    && data.currency.trim().length <= 4
      ? data.currency.trim()
      : ""
  const money = (value: unknown) => (
    value === undefined || value === null || value === ""
      ? "-"
      : [currencyLabel, value].filter(Boolean).join(" ")
  )

  const persist = async (fieldPath: Array<string | number>, value: string) => {
    if (!processingUnitId) {
      toast.error("Edit metadata is missing. Reopen the batch and try again.")
      return
    }

    saveInFlightRef.current = true
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
      saveInFlightRef.current = false
      setSavingPath(null)
    }
  }

  const markReady = async () => {
    if (saveInFlightRef.current) return
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
      toast.success("Draft bill created.")
    } catch (err: any) {
      toast.error(err?.detail || err?.message || "Could not create the draft bill.")
    } finally {
      setSendingBill(false)
    }
  }

  const fields: ReviewField[] =
    docType === "invoice"
      ? [
          { label: "From", path: "vendor_name", value: String(data.vendor_name ?? "") },
          { label: "Invoice no.", path: "invoice_number", value: String(data.invoice_number ?? "") },
          { label: "Invoice date", path: "invoice_date", value: String(data.invoice_date ?? "") },
          { label: "Due date", path: "due_date", value: String(data.due_date ?? "") },
        ]
      : docType === "receipt"
        ? [
            { label: "Merchant", path: "merchant", value: String(data.merchant ?? "") },
            { label: "Date", path: "date", value: String(data.date ?? "") },
            { label: "Payment method", path: "payment_method", value: String(data.payment_method ?? "") },
          ]
        : docType === "bank_statement"
          ? [
              { label: "Account holder", path: "account_holder", value: String(data.account_holder ?? "") },
              { label: "Bank", path: "bank_name", value: String(data.bank_name ?? "") },
              { label: "Period", path: "period", value: String(data.period ?? "") },
            ]
          : []

  const lineItems: ReviewTable | null =
    docType === "invoice" || docType === "receipt"
      ? {
          root: "line_items",
          columns: [
            { label: "Description", key: "description" },
            { label: "Qty", key: "quantity", numeric: true },
            { label: "Unit price", key: "unit_price", numeric: true },
            { label: "Tax rate", key: "tax_rate", numeric: true },
            { label: "Amount", key: "line_total", numeric: true, amount: true },
          ],
          rows: Array.isArray(data.line_items) ? data.line_items : [],
        }
      : docType === "bank_statement"
        ? {
            root: "transactions",
            columns: [
              { label: "Date", key: "date" },
              { label: "Description", key: "description" },
              { label: "Reference", key: "reference" },
              { label: "Debit", key: "debit", numeric: true, amount: true },
              { label: "Credit", key: "credit", numeric: true, amount: true },
              { label: "Balance", key: "balance", numeric: true, amount: true },
            ],
            rows: Array.isArray(data.transactions) ? data.transactions : [],
          }
        : null

  const showInvoiceTotals = docType === "invoice" || docType === "receipt"
  const summaryValue =
    docType === "bank_statement"
      ? money(data.closing_balance)
      : showInvoiceTotals
        ? money(data.total)
        : reviewGrid
          ? String(Math.max(reviewGrid.length - 1, 0))
          : "-"
  const summaryLabel =
    docType === "bank_statement"
      ? "Closing balance"
      : showInvoiceTotals
        ? "Total"
        : "Rows"
  const totals: ReviewTotal[] | undefined = showInvoiceTotals
    ? [
        { label: "Subtotal", value: money(data.subtotal) },
        { label: "VAT", value: money(data.tax_vat_amount) },
        { label: "Total", value: money(data.total), emphasis: true },
      ]
    : undefined

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
      <DocumentReviewWorkspace
        backHref={`/dashboard/client?job_id=${jobId}`}
        filename={doc.original_filename || "Review document"}
        documentType={docType}
        documentTypeLabel={TYPE_LABEL[docType] || "Document"}
        status={status}
        statusLabel={STATUS_LABEL[status] || status}
        sourceUrl={sourceUrl}
        sourceContentType={sourceContentType}
        exceptionCount={uncertainCells.length}
        fields={fields}
        identity={
          data.vendor_name
          || data.merchant
          || data.account_holder
          || data.bank_name
          || doc.original_filename
        }
        summaryLabel={summaryLabel}
        summaryValue={summaryValue}
        lineItems={lineItems}
        reviewGrid={reviewGrid}
        uncertainCells={uncertainCells}
        totals={totals}
        savingPath={savingPath}
        downloading={downloading}
        markingReady={markingReady}
        creatingDraftBill={sendingBill}
        draftBillCreated={sentToBills}
        canMarkReady={canMarkReady}
        canCreateDraftBill={canSendToBills}
        onSave={(path, value) => void persist(path, value)}
        onDownload={() => void download()}
        onMarkReady={() => void markReady()}
        onCreateDraftBill={() => void sendToBills()}
      />
    </DashboardShell>
  )
}

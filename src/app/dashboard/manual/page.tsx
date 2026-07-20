"use client"

import { Suspense, useCallback, useEffect, useMemo, useState, type DragEvent, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Check,
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  ReceiptText,
  Save,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Button, buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import {
  companyApi,
  ocrApi,
  type CompanySummary,
  type ResolvedDocumentMode,
} from "@/lib/api-client"
import { cn } from "@/lib/utils"

type ManualRow = Record<string, string>
type FieldDefinition = { key: string; label: string; placeholder?: string; type?: string }
type ColumnDefinition = { key: string; label: string; numeric?: boolean }

const MODE_OPTIONS: Array<{ value: ResolvedDocumentMode; label: string }> = [
  { value: "invoice", label: "Invoice" },
  { value: "receipt", label: "Receipt" },
  { value: "bank_statement", label: "Bank statement" },
  { value: "table", label: "Table" },
  { value: "notes", label: "Notes" },
]

const DETAIL_FIELDS: Partial<Record<ResolvedDocumentMode, FieldDefinition[]>> = {
  invoice: [
    { key: "vendor_name", label: "Vendor", placeholder: "Supplier name" },
    { key: "invoice_number", label: "Invoice no.", placeholder: "INV-1001" },
    { key: "invoice_date", label: "Invoice date", type: "date" },
    { key: "due_date", label: "Due date", type: "date" },
    { key: "subtotal", label: "Subtotal", placeholder: "0.00" },
    { key: "tax_vat_amount", label: "Tax / VAT", placeholder: "0.00" },
    { key: "total", label: "Total", placeholder: "0.00" },
    { key: "currency", label: "Currency", placeholder: "USD" },
  ],
  receipt: [
    { key: "merchant", label: "Merchant", placeholder: "Merchant name" },
    { key: "date", label: "Date", type: "date" },
    { key: "payment_method", label: "Payment method", placeholder: "Card" },
    { key: "subtotal", label: "Subtotal", placeholder: "0.00" },
    { key: "tax_vat_amount", label: "Tax / VAT", placeholder: "0.00" },
    { key: "total", label: "Total", placeholder: "0.00" },
    { key: "currency", label: "Currency", placeholder: "USD" },
  ],
  bank_statement: [
    { key: "account_holder", label: "Account holder", placeholder: "Account holder" },
    { key: "bank_name", label: "Bank", placeholder: "Bank name" },
    { key: "period", label: "Period", placeholder: "01 Jan - 31 Jan 2026" },
    { key: "opening_balance", label: "Opening balance", placeholder: "0.00" },
    { key: "closing_balance", label: "Closing balance", placeholder: "0.00" },
    { key: "currency", label: "Currency", placeholder: "USD" },
  ],
}

const ROW_COLUMNS: Partial<Record<ResolvedDocumentMode, ColumnDefinition[]>> = {
  invoice: [
    { key: "description", label: "Description" },
    { key: "quantity", label: "Qty", numeric: true },
    { key: "unit_price", label: "Unit price", numeric: true },
    { key: "tax_rate", label: "Tax", numeric: true },
    { key: "line_total", label: "Amount", numeric: true },
  ],
  receipt: [
    { key: "description", label: "Description" },
    { key: "quantity", label: "Qty", numeric: true },
    { key: "unit_price", label: "Unit price", numeric: true },
    { key: "tax_rate", label: "Tax", numeric: true },
    { key: "line_total", label: "Amount", numeric: true },
  ],
  bank_statement: [
    { key: "date", label: "Date" },
    { key: "description", label: "Description" },
    { key: "reference", label: "Reference" },
    { key: "debit", label: "Debit", numeric: true },
    { key: "credit", label: "Credit", numeric: true },
    { key: "balance", label: "Balance", numeric: true },
  ],
}

const inputClass = "ax-interactive h-9 w-full rounded-md border border-[var(--workspace-button-border)] bg-white px-3 text-[13px] text-[var(--workspace-ink)] outline-none hover:border-[var(--workspace-muted)] focus:border-[var(--workspace-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--workspace-primary)_18%,transparent)]"

function blankRow(mode: ResolvedDocumentMode): ManualRow {
  return Object.fromEntries((ROW_COLUMNS[mode] || []).map(column => [column.key, ""]))
}

function ManualPageFallback() {
  return <DashboardRouteLoader label="Opening manual entry" />
}

export default function ManualDocumentPage() {
  return (
    <Suspense fallback={<ManualPageFallback />}>
      <ManualDocumentContent />
    </Suspense>
  )
}

function ManualDocumentContent() {
  const { user, loading: authLoading } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedJobId = searchParams.get("job_id") || ""
  const requestedCompanyId = searchParams.get("company_id") || ""

  const [companies, setCompanies] = useState<CompanySummary[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [companiesError, setCompaniesError] = useState("")
  const [selectedCompanyId, setSelectedCompanyId] = useState(requestedCompanyId)
  const [batchCompanyId, setBatchCompanyId] = useState(requestedCompanyId)
  const [newClientName, setNewClientName] = useState("")
  const [creatingClient, setCreatingClient] = useState(false)
  const [appendToCurrentBatch, setAppendToCurrentBatch] = useState(Boolean(requestedJobId))
  const [documentMode, setDocumentMode] = useState<ResolvedDocumentMode>("invoice")
  const [details, setDetails] = useState<Record<string, string>>({})
  const [rows, setRows] = useState<ManualRow[]>([blankRow("invoice")])
  const [reviewGrid, setReviewGrid] = useState<string[][]>([
    ["Column 1", "Column 2", "Column 3"],
    ["", "", ""],
  ])
  const [notes, setNotes] = useState("")
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState("")
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const backHref = requestedJobId
    ? `/dashboard/client?job_id=${encodeURIComponent(requestedJobId)}`
    : "/dashboard/client"

  useEffect(() => {
    if (!authLoading && !user) {
      const next = `/dashboard/manual${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
      router.replace(`/sign-in?next=${encodeURIComponent(next)}`)
    }
  }, [authLoading, router, searchParams, user])

  useEffect(() => {
    if (!activeWorkspace?.id) return
    let cancelled = false
    setCompaniesLoading(true)
    setCompaniesError("")
    companyApi.list(activeWorkspace.id)
      .then(({ companies: records }) => {
        if (cancelled) return
        setCompanies(records)
        setSelectedCompanyId(current => {
          if (current && records.some(company => company.id === current)) return current
          return records.length === 1 ? records[0].id : ""
        })
      })
      .catch(() => {
        if (!cancelled) setCompaniesError("Clients could not be loaded.")
      })
      .finally(() => {
        if (!cancelled) setCompaniesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeWorkspace?.id])

  useEffect(() => {
    if (!requestedJobId || requestedCompanyId) return
    ocrApi.getJobDocuments(requestedJobId)
      .then(response => {
        const companyId = response.documents.find(document => document.company_id)?.company_id
        if (companyId) {
          setBatchCompanyId(companyId)
          setSelectedCompanyId(companyId)
        }
      })
      .catch(() => undefined)
  }, [requestedCompanyId, requestedJobId])

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    }
  }, [sourceUrl])

  const chooseSource = useCallback((file?: File) => {
    if (!file) return
    const extension = file.name.split(".").pop()?.toLowerCase()
    if (!file.type.match(/^(image\/(png|jpeg|jpg|webp)|application\/pdf)$/) && !["png", "jpg", "jpeg", "webp", "pdf"].includes(extension || "")) {
      toast.error("Choose a PNG, JPG, WebP, or PDF source.")
      return
    }
    setSourceFile(file)
    setSourceUrl(URL.createObjectURL(file))
    setSaveError("")
  }, [])

  const changeMode = (mode: ResolvedDocumentMode) => {
    setDocumentMode(mode)
    setDetails({})
    setRows(ROW_COLUMNS[mode]?.length ? [blankRow(mode)] : [])
    setNotes("")
    setSaveError("")
  }

  const updateRow = (rowIndex: number, key: string, value: string) => {
    setRows(current => current.map((row, index) => index === rowIndex ? { ...row, [key]: value } : row))
  }

  const updateGridCell = (rowIndex: number, columnIndex: number, value: string) => {
    setReviewGrid(current => current.map((row, index) => (
      index === rowIndex ? row.map((cell, cellIndex) => cellIndex === columnIndex ? value : cell) : row
    )))
  }

  const createClient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = newClientName.trim()
    if (!activeWorkspace?.id || !name || creatingClient) return
    setCreatingClient(true)
    try {
      const company = await companyApi.create(activeWorkspace.id, { name })
      setCompanies(current => [company, ...current.filter(item => item.id !== company.id)])
      setSelectedCompanyId(company.id)
      setNewClientName("")
      toast.success("Client added.")
    } catch (error: any) {
      toast.error(error?.detail || "Could not add this client.")
    } finally {
      setCreatingClient(false)
    }
  }

  const documentData = useMemo<Record<string, unknown>>(() => {
    if (documentMode === "table") return { review_grid: reviewGrid }
    if (documentMode === "notes") return { readable_text: notes }
    const rowKey = documentMode === "bank_statement" ? "transactions" : "line_items"
    return { ...details, [rowKey]: rows }
  }, [details, documentMode, notes, reviewGrid, rows])

  const hasEnteredData = useMemo(() => {
    if (documentMode === "table") return reviewGrid.slice(1).some(row => row.some(cell => cell.trim()))
    if (documentMode === "notes") return Boolean(notes.trim())
    return Object.values(details).some(value => value.trim()) || rows.some(row => Object.values(row).some(value => value.trim()))
  }, [details, documentMode, notes, reviewGrid, rows])

  const saveManualDocument = async () => {
    if (!activeWorkspace?.id || !selectedCompanyId || !sourceFile || !hasEnteredData || saving) return
    setSaving(true)
    setSaveError("")
    try {
      const response = await ocrApi.createManualDocument(sourceFile, {
        workspace_id: activeWorkspace.id,
        company_id: selectedCompanyId,
        document_mode: documentMode,
        document_data: documentData,
        target_job_id: appendToCurrentBatch && requestedJobId ? requestedJobId : undefined,
      })
      window.dispatchEvent(new Event("axliner:history-changed"))
      toast.success(response.appended_to_existing_batch ? "Document added to this batch." : "Manual batch created.")
      router.push(`/dashboard/document?job=${encodeURIComponent(response.job_id)}&doc=${encodeURIComponent(response.document_id)}`)
    } catch (error: any) {
      setSaveError(error?.detail || error?.message || "The manual document could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user || !activeWorkspace) return <ManualPageFallback />

  const selectedCompany = companies.find(company => company.id === selectedCompanyId)
  const isPdf = sourceFile?.type === "application/pdf" || sourceFile?.name.toLowerCase().endsWith(".pdf")
  const columns = ROW_COLUMNS[documentMode] || []
  const fields = DETAIL_FIELDS[documentMode] || []
  const saveLabel = appendToCurrentBatch && requestedJobId ? "Add to current batch" : "Create manual batch"

  return (
    <DashboardShell
      activeItem="process"
      title="Add document manually"
      eyebrow="Intake"
      user={user}
      contentClassName="max-w-none px-3 py-3 sm:px-5 lg:px-6"
      showBack={false}
    >
      <div className="min-h-[calc(100svh-5rem)] text-[var(--workspace-ink)]">
        <header className="sticky top-14 z-30 -mx-3 mb-3 border-b border-[var(--workspace-border)] bg-white/95 backdrop-blur sm:-mx-5 lg:-mx-6">
          <div className="mx-auto flex min-h-14 max-w-[1560px] items-center gap-2 px-3 py-2 sm:px-5 lg:px-6">
            <Button asChild variant="surface" size="icon" className="size-9 shadow-none hover:shadow-none active:shadow-none">
              <Link href={backHref} aria-label="Back to workspace"><ArrowLeft className="size-4" /></Link>
            </Button>
            <span className="hidden size-9 shrink-0 items-center justify-center rounded-md border border-[var(--workspace-border)] bg-[var(--workspace-soft)] sm:inline-flex">
              <ReceiptText className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[13px] font-medium sm:text-[14px]">{sourceFile?.name || "New manual document"}</p>
                <StatusBadge tone="review" size="sm" showIcon={false} className="hidden shadow-none sm:inline-flex">Manual entry</StatusBadge>
              </div>
              <p className="mt-0.5 truncate text-[11px] text-[var(--workspace-muted)]">
                {selectedCompany?.name || "Choose a client"} / {MODE_OPTIONS.find(option => option.value === documentMode)?.label}
              </p>
            </div>
            <Button
              type="button"
              variant="glossy"
              size="sm"
              onClick={() => void saveManualDocument()}
              disabled={saving || !sourceFile || !selectedCompanyId || !hasEnteredData}
              className="h-9 px-3.5 shadow-none hover:shadow-none active:shadow-none"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span className="hidden sm:inline">{saveLabel}</span>
              <span className="sm:hidden">Save</span>
            </Button>
          </div>
        </header>

        {saveError ? (
          <div className="mx-auto mb-3 max-w-[1560px] rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-[var(--text-danger)]">
            {saveError}
          </div>
        ) : null}

        <div className="mx-auto grid max-w-[1560px] items-start gap-3 lg:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)]">
          <section className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-white lg:sticky lg:top-[8.25rem] lg:h-[calc(100dvh-9.25rem)] lg:min-h-[560px]">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--workspace-border)] px-3.5">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="size-4 shrink-0" />
                <h2 className="truncate text-[13px] font-medium">Source</h2>
              </div>
              {sourceFile ? <span className="text-[11px] text-[var(--workspace-muted)]">{(sourceFile.size / 1024 / 1024).toFixed(1)} MB</span> : null}
            </div>
            <div
              onDragOver={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event: DragEvent<HTMLDivElement>) => {
                event.preventDefault()
                setDragging(false)
                chooseSource(event.dataTransfer.files[0])
              }}
              className={cn(
                "flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 transition-colors",
                dragging ? "bg-[var(--workspace-blue-soft)]" : "bg-[var(--workspace-soft)]",
              )}
            >
              {sourceUrl ? (
                <div className="flex h-full min-h-[360px] w-full flex-col gap-3">
                  <div className="min-h-0 flex-1 overflow-hidden rounded-md bg-white">
                    {isPdf ? (
                      <iframe src={sourceUrl} title={sourceFile?.name || "Source PDF"} className="h-full min-h-[480px] w-full border-0" />
                    ) : (
                      <img src={sourceUrl} alt={sourceFile?.name || "Source preview"} className="h-full max-h-full w-full object-contain" />
                    )}
                  </div>
                  <label className={cn(buttonVariants({ variant: "surface", size: "sm" }), "mx-auto cursor-pointer px-4")}> 
                    <Upload className="size-4" /> Change source
                    <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf,.pdf" onChange={event => chooseSource(event.target.files?.[0])} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="flex max-w-sm flex-col items-center px-6 py-12 text-center">
                  <span className="flex size-12 items-center justify-center rounded-lg border border-[var(--workspace-border)] bg-white">
                    <FileImage className="size-5" />
                  </span>
                  <h2 className="mt-4 text-[15px] font-medium">Add the source document</h2>
                  <p className="mt-1.5 text-[12px] leading-5 text-[var(--workspace-muted)]">Drop a picture or PDF here. It stays beside the cells during review and is attached when publishing.</p>
                  <label className={cn(buttonVariants({ variant: "surface", size: "sm" }), "mt-4 cursor-pointer px-4")}> 
                    <Upload className="size-4" /> Choose source
                    <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf,.pdf" onChange={event => chooseSource(event.target.files?.[0])} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          </section>

          <div className="space-y-3">
            <section className="rounded-lg border border-[var(--workspace-border)] bg-white">
              <div className="flex items-center justify-between border-b border-[var(--workspace-border)] px-4 py-2.5">
                <div className="flex items-center gap-2"><UserRound className="size-4" /><h2 className="text-[13px] font-medium">File under</h2></div>
                <span className="text-[11px] text-[var(--workspace-muted)]">Manual entry uses no OCR credits</span>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-medium text-[var(--workspace-muted)]">Client</span>
                  <select value={selectedCompanyId} onChange={event => setSelectedCompanyId(event.target.value)} disabled={companiesLoading || (appendToCurrentBatch && Boolean(requestedJobId))} className={inputClass}>
                    <option value="">{companiesLoading ? "Loading clients..." : "Select a client"}</option>
                    {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-medium text-[var(--workspace-muted)]">Document type</span>
                  <select value={documentMode} onChange={event => changeMode(event.target.value as ResolvedDocumentMode)} className={inputClass}>
                    {MODE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-medium text-[var(--workspace-muted)]">Destination</span>
                  <select
                    value={appendToCurrentBatch && requestedJobId ? "current" : "new"}
                    onChange={event => {
                      const append = event.target.value === "current"
                      setAppendToCurrentBatch(append)
                      if (append && batchCompanyId) setSelectedCompanyId(batchCompanyId)
                    }}
                    className={inputClass}
                  >
                    {requestedJobId ? <option value="current">Current batch</option> : null}
                    <option value="new">New batch</option>
                  </select>
                </label>
              </div>
              {companiesError ? <p className="px-4 pb-3 text-[12px] font-medium text-[var(--text-danger)]">{companiesError}</p> : null}
              {!companiesLoading && companies.length === 0 ? (
                <form onSubmit={createClient} className="flex gap-2 border-t border-[var(--workspace-border)] p-4">
                  <input value={newClientName} onChange={event => setNewClientName(event.target.value)} placeholder="Client name" className={inputClass} />
                  <Button type="submit" variant="surface" size="sm" disabled={creatingClient || !newClientName.trim()} className="h-9 shrink-0 px-3">
                    {creatingClient ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add client
                  </Button>
                </form>
              ) : null}
            </section>

            {fields.length ? (
              <section className="rounded-lg border border-[var(--workspace-border)] bg-white">
                <div className="flex h-11 items-center gap-2 border-b border-[var(--workspace-border)] px-4"><Check className="size-4" /><h2 className="text-[13px] font-medium">Details</h2></div>
                <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
                  {fields.map(field => (
                    <label key={field.key} className="block min-w-0">
                      <span className="mb-1.5 block text-[12px] font-medium text-[var(--workspace-muted)]">{field.label}</span>
                      <input type={field.type || "text"} value={details[field.key] || ""} onChange={event => setDetails(current => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder || "-"} className={inputClass} />
                    </label>
                  ))}
                </div>
              </section>
            ) : null}

            {documentMode === "notes" ? (
              <section className="overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-white">
                <div className="flex h-11 items-center gap-2 border-b border-[var(--workspace-border)] px-4"><FileText className="size-4" /><h2 className="text-[13px] font-medium">Notes</h2></div>
                <textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Type the document text here..." className="ax-interactive min-h-[420px] w-full resize-y bg-white p-4 text-[13px] leading-6 text-[var(--workspace-ink)] outline-none focus:ring-2 focus:ring-inset focus:ring-[color-mix(in_srgb,var(--workspace-primary)_18%,transparent)]" />
              </section>
            ) : documentMode === "table" ? (
              <section className="overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-white">
                <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-[var(--workspace-border)] px-4 py-2">
                  <div className="flex items-center gap-2"><FileSpreadsheet className="size-4" /><h2 className="text-[13px] font-medium">Cells</h2></div>
                  <div className="flex items-center gap-1.5">
                    <Button type="button" variant="surface" size="sm" onClick={() => setReviewGrid(current => current.map(row => [...row, ""]))} className="h-8 px-3 text-xs"><Plus className="size-3.5" /> Column</Button>
                    <Button type="button" variant="surface" size="sm" onClick={() => setReviewGrid(current => [...current, Array(current[0]?.length || 1).fill("")])} className="h-8 px-3 text-xs"><Plus className="size-3.5" /> Row</Button>
                    <Button type="button" variant="ghost" size="sm" disabled={(reviewGrid[0]?.length || 0) <= 1} onClick={() => setReviewGrid(current => current.map(row => row.slice(0, -1)))} className="h-8 px-2 text-xs">Remove column</Button>
                  </div>
                </div>
                <div className="overflow-auto">
                  <table className="w-full min-w-[640px] border-collapse">
                    <tbody>
                      {reviewGrid.map((row, rowIndex) => (
                        <tr key={rowIndex} className={cn("border-b border-[var(--workspace-border)] last:border-b-0", rowIndex === 0 ? "bg-[var(--workspace-table-header)]" : "hover:bg-[var(--workspace-row-hover)]")}>
                          {row.map((cell, columnIndex) => (
                            <td key={columnIndex} className="h-10 border-e border-[var(--workspace-border)] px-1.5 py-1 last:border-e-0">
                              <input value={cell} onChange={event => updateGridCell(rowIndex, columnIndex, event.target.value)} aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}`} placeholder={rowIndex === 0 ? `Column ${columnIndex + 1}` : ""} className={cn("ax-interactive h-8 w-full min-w-[110px] rounded-md border border-transparent bg-transparent px-2 text-[13px] outline-none focus:border-[var(--workspace-primary)] focus:bg-white focus:ring-2 focus:ring-[color-mix(in_srgb,var(--workspace-primary)_18%,transparent)]", rowIndex === 0 && "font-medium text-[var(--workspace-table-head)]")} />
                            </td>
                          ))}
                          {rowIndex > 0 ? (
                            <td className="w-10 px-1.5"><Button type="button" variant="ghost" size="icon" disabled={reviewGrid.length <= 2} onClick={() => setReviewGrid(current => current.filter((_, index) => index !== rowIndex))} className="!size-7 text-[var(--workspace-muted)] hover:text-[var(--text-danger)]" aria-label={`Remove row ${rowIndex}`}><Trash2 className="size-3.5" /></Button></td>
                          ) : <td className="w-10" />}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : (
              <section className="overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-white">
                <div className="flex h-11 items-center justify-between gap-3 border-b border-[var(--workspace-border)] px-4">
                  <div className="flex items-center gap-2"><FileSpreadsheet className="size-4" /><h2 className="text-[13px] font-medium">{documentMode === "bank_statement" ? "Transactions" : "Line items"}</h2></div>
                  <Button type="button" variant="surface" size="sm" onClick={() => setRows(current => [...current, blankRow(documentMode)])} className="h-8 px-3 text-xs"><Plus className="size-3.5" /> Add row</Button>
                </div>
                <div className="overflow-auto">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead><tr className="border-b border-[var(--workspace-border)] bg-[var(--workspace-table-header)]">{columns.map(column => <th key={column.key} className={cn("h-9 px-3 text-[12px] font-medium text-[var(--workspace-table-head)]", column.numeric ? "text-right" : "text-left", column.key === "description" && "min-w-[240px]")}>{column.label}</th>)}<th className="w-10" /></tr></thead>
                    <tbody>
                      {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-[var(--workspace-border)] last:border-b-0 hover:bg-[var(--workspace-row-hover)]">
                          {columns.map(column => <td key={column.key} className="h-10 px-1.5 py-1"><input value={row[column.key] || ""} onChange={event => updateRow(rowIndex, column.key, event.target.value)} aria-label={`${column.label}, row ${rowIndex + 1}`} className={cn("ax-interactive h-8 w-full min-w-[90px] rounded-md border border-transparent bg-transparent px-2 text-[13px] text-[var(--workspace-ink)] outline-none hover:bg-white focus:border-[var(--workspace-primary)] focus:bg-white focus:ring-2 focus:ring-[color-mix(in_srgb,var(--workspace-primary)_18%,transparent)]", column.numeric && "text-right tabular-nums", column.key === "description" && "min-w-[220px]")} /></td>)}
                          <td className="w-10 px-1.5"><Button type="button" variant="ghost" size="icon" disabled={rows.length <= 1} onClick={() => setRows(current => current.filter((_, index) => index !== rowIndex))} className="!size-7 text-[var(--workspace-muted)] hover:text-[var(--text-danger)]" aria-label={`Remove row ${rowIndex + 1}`}><Trash2 className="size-3.5" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--workspace-border)] bg-white px-4 py-3">
              <p className="text-[12px] text-[var(--workspace-muted)]">The saved document opens in the normal source-and-cells review view.</p>
              <Button type="button" variant="glossy" onClick={() => void saveManualDocument()} disabled={saving || !sourceFile || !selectedCompanyId || !hasEnteredData} className="h-10 px-5">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} {saveLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

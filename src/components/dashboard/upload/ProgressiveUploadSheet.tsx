"use client"

import { useEffect, useState, type ChangeEvent, type DragEvent } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  FileImage,
  FileText,
  FolderUp,
  Inbox,
  Loader2,
  Trash2,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useMotionTokens } from "@/lib/motion"
import { acceptedUploadMimeTypes, isPdfFile } from "@/lib/upload-files"
import { companyApi, type CompanySummary, type DocumentMode } from "@/lib/api-client"

type UploadMode = Exclude<DocumentMode, "invoice_receipt">
type OutputMode = "table" | "text" | "csv"

type ProgressiveUploadSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  uploadedFiles: File[]
  workspaceId?: string
  selectedCompanyId: string
  onSelectedCompanyIdChange: (companyId: string) => void
  pdfPageCounts: Record<number, number>
  isDragging: boolean
  isUploading: boolean
  isProcessing: boolean
  documentMode: DocumentMode
  outputMode: OutputMode
  creditAvailable: number
  creditEstimate: number
  maxUploadFiles: number
  noCredits: boolean
  processLabel: string
  onDocumentModeChange: (mode: UploadMode) => void
  onOutputModeChange: (mode: OutputMode) => void
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onFileInput: (event: ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
  onClearFiles: () => void
  onProcess: () => void
  onCancel: () => void
}

const modeTabs: Array<{ value: UploadMode; label: string }> = [
  { value: "auto", label: "Auto detect" },
  { value: "invoice", label: "Purchases" },
  { value: "receipt", label: "Receipts" },
  { value: "bank_statement", label: "Bank statements" },
  { value: "table", label: "Other" },
]

const workspacePrimaryControlClass =
  "border border-[var(--workspace-primary)] bg-[var(--workspace-primary)] text-white hover:border-[var(--workspace-primary-hover)] hover:bg-[var(--workspace-primary-hover)] focus-visible:ring-[var(--workspace-primary)]/20"
const workspaceNormalControlClass =
  "border border-[var(--workspace-button-border)] bg-white text-[var(--workspace-ink)] hover:border-[var(--workspace-primary)] hover:bg-[var(--workspace-blue-soft)] hover:text-[var(--workspace-primary)] focus-visible:ring-[var(--workspace-primary)]/20"
const workspacePanelSurfaceClass =
  "border-[var(--workspace-border)] bg-[var(--workspace-soft)]"

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function StageLabel({ number, children }: { number: number; children: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
        {number}
      </span>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{children}</p>
    </div>
  )
}

export function ProgressiveUploadSheet({
  open,
  onOpenChange,
  uploadedFiles,
  workspaceId,
  selectedCompanyId,
  onSelectedCompanyIdChange,
  pdfPageCounts,
  isDragging,
  isUploading,
  isProcessing,
  documentMode,
  outputMode,
  creditAvailable,
  creditEstimate,
  maxUploadFiles,
  noCredits,
  processLabel,
  onDocumentModeChange,
  onOutputModeChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInput,
  onRemoveFile,
  onClearFiles,
  onProcess,
  onCancel,
}: ProgressiveUploadSheetProps) {
  const m = useMotionTokens()
  const [companies, setCompanies] = useState<CompanySummary[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [companiesError, setCompaniesError] = useState("")
  const [companiesReloadKey, setCompaniesReloadKey] = useState(0)
  const hasPdfs = uploadedFiles.some(isPdfFile)
  const pdfPages = uploadedFiles.reduce((total, file, index) => (
    total + (isPdfFile(file) ? (pdfPageCounts[index] || 1) : 0)
  ), 0)
  const selectedTab = documentMode === "invoice_receipt"
    ? "invoice"
    : documentMode === "notes"
      ? "table"
      : documentMode
  const busy = isUploading || isProcessing
  const canProcess = Boolean(workspaceId && selectedCompanyId)

  useEffect(() => {
    if (isProcessing) onOpenChange(false)
  }, [isProcessing, onOpenChange])

  useEffect(() => {
    if (!open || !workspaceId) return

    let mounted = true
    setCompaniesLoading(true)
    setCompaniesError("")
    companyApi.list(workspaceId)
      .then(({ companies: records }) => {
        if (!mounted) return
        setCompanies(records)
        const selectedStillExists = records.some(company => company.id === selectedCompanyId)
        if (!selectedStillExists) {
          onSelectedCompanyIdChange(records.find(company => company.is_default)?.id || records[0]?.id || "")
        }
      })
      .catch(() => {
        if (!mounted) return
        setCompanies([])
        setCompaniesError("Companies could not be loaded.")
      })
      .finally(() => {
        if (mounted) setCompaniesLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [companiesReloadKey, onSelectedCompanyIdChange, open, selectedCompanyId, workspaceId])

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => {
      if (!busy) onOpenChange(nextOpen)
    }}>
      <SheetContent className="w-full gap-0 bg-[var(--workspace-popout-bg)] sm:max-w-[560px]">
        <SheetHeader className="border-b border-[var(--workspace-popout-border)] px-5 py-5 pr-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--workspace-primary)]">New batch</p>
          <SheetTitle className="text-xl font-bold tracking-tight">Upload documents</SheetTitle>
          <SheetDescription className="leading-5">
            Choose the batch context, add files, then send them to review.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section className="space-y-3">
            <StageLabel number={1}>Company</StageLabel>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Assign this batch to</span>
              <select
                value={selectedCompanyId}
                onChange={(event) => onSelectedCompanyIdChange(event.target.value)}
                disabled={busy || companiesLoading || !workspaceId}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="">{companiesLoading ? "Loading companies..." : "Select a company"}</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </label>
            {companiesError ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-destructive">{companiesError}</p>
                <Button
                  type="button"
                  variant="surface"
                  size="sm"
                  onClick={() => setCompaniesReloadKey(key => key + 1)}
                  disabled={busy || companiesLoading}
                  className="h-7 px-2 text-xs"
                >
                  Retry
                </Button>
              </div>
            ) : null}
          </section>

          <section className="space-y-3">
            <StageLabel number={2}>Document mode</StageLabel>
            <div className="flex flex-wrap gap-3" role="tablist" aria-label="Document mode">
              {modeTabs.map(mode => (
                <button
                  key={mode.value}
                  type="button"
                  role="tab"
                  aria-selected={selectedTab === mode.value}
                  onClick={() => onDocumentModeChange(mode.value)}
                  disabled={busy}
                  className={cn(
                    "ax-interactive inline-flex h-8 cursor-pointer items-center rounded-md px-3 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    selectedTab === mode.value
                      ? workspacePrimaryControlClass
                      : workspaceNormalControlClass
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {selectedTab === "table" ? (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Other document type</span>
                <select
                  value={documentMode === "notes" ? "notes" : "table"}
                  onChange={(event) => onDocumentModeChange(event.target.value as UploadMode)}
                  disabled={busy}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <option value="table">Tables and forms</option>
                  <option value="notes">Notes and handwriting</option>
                </select>
              </label>
            ) : null}
          </section>

          <section className="space-y-3">
            <StageLabel number={3}>Documents</StageLabel>
            <motion.div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              animate={{
                scale: isDragging ? 1.01 : 1,
                boxShadow: isDragging
                  ? "0 0 0 4px var(--workspace-blue-soft), 0 8px 24px -12px var(--workspace-primary)"
                  : "0 0 0 0 rgba(0,0,0,0)",
              }}
              transition={m.spring}
              className={cn(
                "rounded-lg border border-dashed px-4 py-5 text-center transition-colors",
                isDragging ? "border-[var(--workspace-primary)] bg-[var(--workspace-blue-soft)]" : "border-[var(--workspace-border)] bg-white hover:border-[var(--workspace-primary)]"
              )}
            >
              <FolderUp className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold text-foreground">
                {isDragging ? "Drop documents here" : "Drop a mixed batch here"}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">PDFs, scans, and photographed documents</p>
              <label
                htmlFor="progressive-upload-input"
                className={cn(
                  buttonVariants({ variant: "surface", size: "sm" }),
                  "mt-3 cursor-pointer",
                  busy && "pointer-events-none opacity-50"
                )}
              >
                Browse files
              </label>
              <input
                id="progressive-upload-input"
                type="file"
                multiple
                accept={acceptedUploadMimeTypes}
                onChange={onFileInput}
                disabled={busy}
                className="hidden"
              />
            </motion.div>

            {uploadedFiles.length ? (
              <div className="overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-white">
                <div className="flex items-center justify-between border-b border-[var(--workspace-border)] px-3 py-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {uploadedFiles.length} of {maxUploadFiles} files selected
                  </p>
                  <Button type="button" variant="ghost" size="sm" onClick={onClearFiles} disabled={busy} className="h-7 px-2 text-xs">
                    Clear
                  </Button>
                </div>
                <motion.div
                  variants={m.staggerParent()}
                  initial="hidden"
                  animate="show"
                  className="max-h-48 divide-y divide-border overflow-y-auto"
                >
                  <AnimatePresence initial={false}>
                    {uploadedFiles.map((file, index) => {
                      const pdf = isPdfFile(file)
                      const pageCount = pdfPageCounts[index]
                      return (
                        <motion.div
                          key={`${file.name}-${file.size}-${index}`}
                          layout
                          variants={m.fadeUp}
                          exit="exit"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)]">
                            {pdf ? <FileText className="size-4" /> : <FileImage className="size-4" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-foreground">{file.name}</span>
                            <span className="block truncate text-xs font-medium text-muted-foreground">
                              {pdf ? `${pageCount || 1} page${pageCount === 1 ? "" : "s"}` : "Image"} - {fileSize(file.size)}
                            </span>
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveFile(index)}
                            disabled={busy}
                            className="size-8 text-muted-foreground hover:text-foreground"
                            aria-label={`Remove ${file.name}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </motion.div>
              </div>
            ) : null}
          </section>

          {hasPdfs ? (
            <section className="space-y-3">
              <StageLabel number={4}>PDF segmentation</StageLabel>
              <div className={cn("space-y-2 rounded-lg border p-3", workspacePanelSurfaceClass)}>
                <div className="flex items-start gap-3 rounded-md border border-[var(--workspace-primary)] bg-white p-3">
                  <FileText className="mt-0.5 size-4 shrink-0 text-[var(--workspace-primary)]" />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Separate pages for review</span>
                    <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                      {pdfPages} PDF page{pdfPages === 1 ? "" : "s"} will become individual review items.
                    </span>
                  </span>
                </div>
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <StageLabel number={hasPdfs ? 5 : 4}>Output format</StageLabel>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Download format</span>
              <select
                value={outputMode}
                onChange={(event) => onOutputModeChange(event.target.value as OutputMode)}
                disabled={busy}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/40"
              >
                {documentMode === "notes" ? <option value="text">Readable text</option> : null}
                <option value="table">Excel XLSX</option>
                <option value="csv">CSV</option>
              </select>
            </label>
          </section>
        </div>

        <SheetFooter className="gap-3 border-t border-[var(--workspace-popout-border)] bg-[var(--workspace-popout-bg)] px-5 py-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--workspace-popout-border)] bg-white px-3 py-2.5">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Estimated usage</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                {creditEstimate} page{creditEstimate === 1 ? "" : "s"} / {creditEstimate} credit{creditEstimate === 1 ? "" : "s"}
              </p>
            </div>
            <p className="text-right text-xs font-semibold text-muted-foreground">
              {creditAvailable.toLocaleString()} available
            </p>
          </div>
          <Button
            type="button"
            variant="glossy"
            size="lg"
            onClick={onProcess}
            disabled={!uploadedFiles.length || busy || noCredits || !canProcess}
            className={cn("w-full", workspacePrimaryControlClass)}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={busy ? "busy" : "idle"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={m.tFast}
              >
                {busy ? "Processing documents" : processLabel}
              </motion.span>
            </AnimatePresence>
          </Button>
          {busy ? (
            <Button type="button" variant="surface" onClick={onCancel} className="w-full">
              Cancel processing
            </Button>
          ) : null}
          <Link
            href="/dashboard/inbox"
            className="ax-interactive inline-flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <Inbox className="size-3.5" />
            Prefer email intake? Open inbox
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

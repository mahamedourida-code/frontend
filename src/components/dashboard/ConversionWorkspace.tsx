"use client"

import { useEffect, useState, type ChangeEvent, type DragEvent } from "react"
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderUp,
  Loader2,
  RotateCcw,
  Save,
  Share2,
  Trash2,
  X,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { acceptedUploadMimeTypes, isPdfFile } from "@/lib/upload-files"
import type {
  DocumentDuplicateWarning,
  DocumentMode,
  JobDocumentRecord,
  QuickBooksConnectionStatus,
  QuickBooksReceiptPublication,
  QuickBooksReferenceItem,
  ReceiptPublishingDestination,
  ReceiptQuickBooksPublishRequest,
  ResolvedDocumentMode,
  VendorRule,
  VendorRuleFields,
} from "@/lib/api-client"

export type WorkspaceBanner = {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  tone?: "info" | "warning" | "error"
}

type OutputMode = "table" | "text" | "csv"
type ResultFilter = "all" | "needs_review" | "ready" | "edited" | "failed" | "published"
type WorkspaceMode = DocumentMode | "text"

type ResultFile = {
  file_id?: string
  filename?: string
  size_bytes?: number
  input_preview_url?: string
  document_id?: string
  processing_unit_id?: string
  source_page?: number | null
  source_page_count?: number | null
  confidence_score?: number
  confidence?: number
  quality_score?: number
  requires_review?: boolean
  review_flags?: Array<Record<string, any>>
  status?: string
  review_status?: string
  review_grid?: any[][]
  document_type?: string
  reviewed_data?: Record<string, any>
  duplicate_warnings?: DocumentDuplicateWarning[]
  vendor_suggestion?: VendorRule | null
  quickbooks_receipt_publication?: QuickBooksReceiptPublication | null
  original_image?: string
  metadata?: Record<string, any>
}

type RecoverableJob = {
  processed_images?: number
  total_images?: number
}

type ResultPreview = {
  table: any[][]
  text: string
  loading?: boolean
}

type ConversionWorkspaceProps = {
  banner?: WorkspaceBanner | null
  onDismissBanner?: () => void
  latestRecoverableJob?: RecoverableJob | null
  recoveryLoading?: boolean
  onContinueLatestJob?: () => void
  uploadedFiles: File[]
  filePreviewUrls: Record<number, string>
  pdfPageCounts: Record<number, number>
  isDragging: boolean
  outputMode: OutputMode
  onOutputModeChange: (mode: OutputMode) => void
  documentMode?: DocumentMode
  onDocumentModeChange?: (mode: DocumentMode) => void
  isUploading: boolean
  isProcessing: boolean
  isComplete: boolean
  uploadedSizeMb: number
  creditAvailable: number
  creditEstimate: number
  maxUploadFiles: number
  processLabel: string
  noCredits: boolean
  resultFiles: ResultFile[] | null
  tablePreviewData: any[][]
  textPreview: string
  resultPreviews?: Record<string, ResultPreview>
  firstImageUrl: string
  activePreviewFileId?: string
  isTextOutput: boolean
  isSaving: boolean
  isSaved: boolean
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onFileInput: (event: ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
  onClearFiles: () => void
  onConvert: () => void
  onCancel: () => void
  onReset: () => void
  onSaveToHistory: () => void
  onShareFile: (file: ResultFile) => void
  onShareAll: () => void
  onDownloadFile: (file: ResultFile, index?: number) => void
  onDownloadAll: () => void
  onDownloadReviewedBatch?: (editedTables: Record<string, any[][]>) => void | Promise<void>
  onDeleteDocument?: (file: ResultFile) => void | Promise<void>
  onDeleteBatch?: () => void | Promise<void>
  onEditFile: (file: ResultFile, index?: number) => void
  onPersistCellEdit?: (file: ResultFile, rowIndex: number, cellIndex: number, value: string, baseTable: any[][]) => boolean | Promise<boolean>
  onPersistStructuredEdit?: (file: ResultFile, fieldPath: Array<string | number>, value: string) => boolean | Promise<boolean>
  onMarkDocumentReady?: (file: ResultFile) => void | Promise<void>
  onSendToAccountsPayable?: (file: ResultFile) => void | Promise<void>
  onOverrideDuplicateWarning?: (file: ResultFile, warningId: string) => void | Promise<void>
  onSaveVendorRule?: (file: ResultFile, suggestedFields: VendorRuleFields) => boolean | Promise<boolean>
  quickBooksConnection?: QuickBooksConnectionStatus | null
  quickBooksReferences?: QuickBooksReferenceItem[]
  onRefreshQuickBooksReferences?: () => void | Promise<void>
  onPublishReceipt?: (file: ResultFile, request: ReceiptQuickBooksPublishRequest) => boolean | Promise<boolean>
  classifiedDocuments?: JobDocumentRecord[]
  overridingDocumentId?: string | null
  onOverrideDocumentMode?: (documentId: string, mode: ResolvedDocumentMode) => void | Promise<void>
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 MB"
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function WorkspaceErrorBanner({ banner, onDismiss }: { banner?: WorkspaceBanner | null; onDismiss?: () => void }) {
  if (!banner) return null
  const isUpgradeAction = /upgrade|plans|credits|billing/i.test(banner.actionLabel || "")

  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-md border p-4 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between",
        banner.tone === "error" && "border-rose-200 bg-rose-50/88 text-rose-950",
        banner.tone === "warning" && "border-amber-200 bg-amber-50/88 text-amber-950",
        (!banner.tone || banner.tone === "info") && "border-border bg-card/70 text-foreground"
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{banner.title}</p>
          {banner.description ? <p className="mt-1 text-sm opacity-75">{banner.description}</p> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {banner.actionLabel && banner.onAction ? (
          <Button variant={isUpgradeAction ? "lime" : "outline"} onClick={banner.onAction} className="h-9 rounded-md px-4">
            {banner.actionLabel}
          </Button>
        ) : null}
        {onDismiss ? (
          <Button variant="ghost" size="icon" onClick={onDismiss} className="h-10 w-10 rounded-md">
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function AutoDetectionPanel({
  documents,
  overridingDocumentId,
  onOverrideDocumentMode,
}: {
  documents?: JobDocumentRecord[]
  overridingDocumentId?: string | null
  onOverrideDocumentMode?: (documentId: string, mode: ResolvedDocumentMode) => void | Promise<void>
}) {
  const [choices, setChoices] = useState<Record<string, ResolvedDocumentMode>>({})
  const autoDocuments = documents?.filter(document => document.selected_mode === "auto") || []
  if (!autoDocuments.length) return null

  const labels: Record<ResolvedDocumentMode, string> = {
    table: "Table",
    invoice: "Invoice",
    receipt: "Receipt",
    bank_statement: "Bank statement",
    notes: "Notes",
  }
  const selectableModes = Object.keys(labels) as ResolvedDocumentMode[]

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Detected document types</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Confirm uncertain files before exporting them.</p>
        </div>
      </div>
      <div className="divide-y divide-border rounded-lg border border-border">
        {autoDocuments.map(document => {
          const detected = document.detected_mode
          const needsSelection = !document.resolved_mode
          const manuallySelected = detected === "needs_manual_selection" && Boolean(document.resolved_mode)
          const selectedMode = choices[document.id]
            || document.resolved_mode
            || (detected && detected !== "needs_manual_selection" ? detected : "table")
          const busy = overridingDocumentId === document.id
          const percentage = typeof document.detection_confidence === "number"
            ? `${Math.round(document.detection_confidence * 100)}%`
            : null

          return (
            <div key={document.id} className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{document.original_filename}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className={cn(
                    "rounded-md border px-2 py-0.5 font-medium",
                    needsSelection
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-border bg-muted text-foreground"
                  )}>
                    {needsSelection
                      ? "Needs review"
                      : manuallySelected
                        ? `${labels[document.resolved_mode as ResolvedDocumentMode]} selected`
                        : labels[document.resolved_mode as ResolvedDocumentMode]}
                  </span>
                  {percentage ? <span className="text-muted-foreground">{percentage} detection confidence</span> : null}
                </div>
                {document.detection_review_reason ? (
                  <p className="mt-1.5 text-xs text-muted-foreground">{document.detection_review_reason}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <select
                  value={selectedMode}
                  onChange={event => setChoices(prev => ({
                    ...prev,
                    [document.id]: event.target.value as ResolvedDocumentMode,
                  }))}
                  disabled={busy}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/40"
                  aria-label={`Extraction mode for ${document.original_filename}`}
                >
                  {selectableModes.map(mode => <option key={mode} value={mode}>{labels[mode]}</option>)}
                </select>
                <Button
                  type="button"
                  size="sm"
                  variant={needsSelection ? "default" : "outline"}
                  disabled={busy || (!needsSelection && selectedMode === document.resolved_mode)}
                  onClick={() => onOverrideDocumentMode?.(document.id, selectedMode)}
                  className="h-9 rounded-md px-3"
                >
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {needsSelection ? "Process" : "Apply"}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ResumeBatchBanner({
  latestRecoverableJob,
  recoveryLoading,
  onContinueLatestJob,
}: {
  latestRecoverableJob?: RecoverableJob | null
  recoveryLoading?: boolean
  onContinueLatestJob?: () => void
}) {
  if (!latestRecoverableJob) return null

  return (
    <div className="mb-3 flex flex-col gap-3 rounded-md border border-border bg-card p-3 text-foreground shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold">Return to unfinished batch</p>
          <p className="text-xs text-muted-foreground">
            {latestRecoverableJob.processed_images || 0} of {latestRecoverableJob.total_images || 0} files processed
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={onContinueLatestJob}
        disabled={recoveryLoading}
        className="h-9 rounded-md px-4"
      >
        {recoveryLoading ? "Resuming..." : "Open batch"}
      </Button>
    </div>
  )
}

function ModeGlyph({ mode }: { mode: WorkspaceMode }) {
  if (mode === "auto") {
    return (
      <svg viewBox="0 0 28 28" fill="none" className="size-6" aria-hidden="true">
        <path d="M14 4.5v4M14 19.5v4M4.5 14h4M19.5 14h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M9.25 9.25 7 7m11.75 2.25L21 7M9.25 18.75 7 21m11.75-2.25L21 21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="14" cy="14" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    )
  }

  if (mode === "bank_statement") {
    return (
      <svg viewBox="0 0 28 28" fill="none" className="size-6" aria-hidden="true">
        <path d="M4 10.5 14 5l10 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 12.5h15M8.5 12.5v8m5.5-8v8m5.5-8v8M5.5 22.5h17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }

  if (mode === "invoice" || mode === "receipt" || mode === "invoice_receipt") {
    return (
      <svg viewBox="0 0 28 28" fill="none" className="size-6" aria-hidden="true">
        <path d="M8 4.5h12v19l-3-2-3 2-3-2-3 2v-19Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M11 10h6M11 14h6M11 18h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }

  if (mode === "notes" || mode === "text") {
    return (
      <svg viewBox="0 0 28 28" fill="none" className="size-6" aria-hidden="true">
        <path d="M7 5.5h14v17H7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M10 10h8M10 14h8M10 18h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 28 28" fill="none" className="size-6" aria-hidden="true">
      <rect x="5" y="6" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 11.5h18M11 6v16M17 6v16" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function UploadDropzone({
  uploadedFiles,
  filePreviewUrls,
  pdfPageCounts,
  isDragging,
  isProcessing,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInput,
  onRemoveFile,
  onClearFiles,
}: Pick<
  ConversionWorkspaceProps,
  | "uploadedFiles"
  | "filePreviewUrls"
  | "pdfPageCounts"
  | "isDragging"
  | "isProcessing"
  | "onDragOver"
  | "onDragLeave"
  | "onDrop"
  | "onFileInput"
  | "onRemoveFile"
  | "onClearFiles"
>) {
  const [selectedPreview, setSelectedPreview] = useState<{ url: string; name: string } | null>(null)

  return (
    <>
    <div
      id="upload-files"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative overflow-hidden rounded-md border border-dashed transition-all duration-200",
        isDragging ? "border-primary bg-card/85 scale-[0.997]" : "border-border bg-card/50 hover:border-primary/50"
      )}
    >
      <div className={cn("px-4 py-4 text-center sm:px-5", uploadedFiles.length ? "min-h-[248px]" : "flex min-h-[208px] flex-col items-center justify-center")}>
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card shadow-xs">
          <FolderUp className="h-5 w-5 text-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{isDragging ? "Drop files" : uploadedFiles.length ? "Drop more files" : "Upload files"}</h3>
        <p className="mt-1 text-xs font-medium text-muted-foreground">Handwritten invoices, statements, tables, images, and PDFs</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <label
            htmlFor="workspace-file-upload"
            className={cn(
              buttonVariants({ variant: "surface", size: "default" }),
              "h-9 cursor-pointer px-4 font-medium",
              isProcessing && "pointer-events-none opacity-55"
            )}
          >
            <FileImage className="mr-2 h-4 w-4" />
            Browse files
          </label>
          {uploadedFiles.length ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onClearFiles}
              disabled={isProcessing}
              className="h-9 rounded-md border-border bg-card px-4 text-foreground shadow-sm hover:bg-accent"
            >
              Clear
            </Button>
          ) : null}
        </div>
        <input
          id="workspace-file-upload"
          type="file"
          multiple
          accept={acceptedUploadMimeTypes}
          onChange={onFileInput}
          disabled={isProcessing}
          className="hidden"
        />

        {uploadedFiles.length ? (
          <div className="mt-3 grid grid-cols-3 gap-2 text-left sm:grid-cols-4 xl:grid-cols-6">
            {uploadedFiles.map((file, index) => {
              const pdf = isPdfFile(file)
              const pageCount = pdfPageCounts[index]
              const previewUrl = filePreviewUrls[index]
              return (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (previewUrl) setSelectedPreview({ url: previewUrl, name: file.name })
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      if (previewUrl) setSelectedPreview({ url: previewUrl, name: file.name })
                    }
                  }}
                  className="group cursor-pointer rounded-md border border-border bg-card/70 p-2 outline-none transition hover:-translate-y-0.5 hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-md border border-border bg-white">
                    {previewUrl ? (
                      <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        {pdf ? <FileText className="h-5 w-5 text-primary" /> : <FileImage className="h-5 w-5 text-primary" />}
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation()
                        onRemoveFile(index)
                        setSelectedPreview(null)
                      }}
                      disabled={isProcessing}
                      className="absolute right-1 top-1 h-7 w-7 rounded-md bg-card/88 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-accent group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-foreground">{file.name}</p>
                    <p className="mt-0.5 truncate text-[11px] font-semibold text-muted-foreground">
                      {pdf ? `${pageCount ? `${pageCount} page${pageCount === 1 ? "" : "s"}` : "PDF"}` : "Image"} - {formatBytes(file.size)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
      {selectedPreview ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#111827]/50 p-4 backdrop-blur-xl"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPreview(null)
          }}
        >
          <div className="w-full max-w-4xl overflow-hidden rounded-md border border-border bg-card p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-foreground">{selectedPreview.name}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedPreview(null)}
                className="h-9 rounded-md border-border bg-background px-3 text-foreground"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex max-h-[78vh] items-center justify-center overflow-hidden rounded-lg bg-white">
              <img src={selectedPreview.url} alt={selectedPreview.name} className="max-h-[78vh] w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export function SelectedFilesTray({
  uploadedFiles,
  filePreviewUrls,
  pdfPageCounts,
  isProcessing,
  onRemoveFile,
  onClearFiles,
}: Pick<
  ConversionWorkspaceProps,
  "uploadedFiles" | "filePreviewUrls" | "pdfPageCounts" | "isProcessing" | "onRemoveFile" | "onClearFiles"
>) {
  const [selectedPreview, setSelectedPreview] = useState<{ url: string; name: string } | null>(null)

  if (!uploadedFiles.length) return null

  return (
    <>
    <div className="rounded-md border border-border bg-card/50 p-3 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Selected files</p>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearFiles}
          disabled={isProcessing}
          className="h-8 rounded-md px-3 text-foreground"
        >
          Clear
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {uploadedFiles.map((file, index) => {
          const pdf = isPdfFile(file)
          const pageCount = pdfPageCounts[index]
          const previewUrl = filePreviewUrls[index]
          return (
            <div
              key={`${file.name}-${file.size}-${index}`}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (previewUrl) setSelectedPreview({ url: previewUrl, name: file.name })
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  if (previewUrl) setSelectedPreview({ url: previewUrl, name: file.name })
                }
              }}
              className="group cursor-pointer rounded-lg border border-border bg-card/70 p-2 outline-none transition hover:-translate-y-0.5 hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-lg border border-border bg-white">
                {previewUrl ? (
                  <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {pdf ? <FileText className="h-5 w-5 text-primary" /> : <FileImage className="h-5 w-5 text-primary" />}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemoveFile(index)
                    setSelectedPreview(null)
                  }}
                  disabled={isProcessing}
                  className="absolute right-1 top-1 h-7 w-7 rounded-md bg-card/88 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-accent group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-foreground">{file.name}</p>
                <p className="mt-0.5 truncate text-[11px] font-semibold text-muted-foreground">
                  {pdf ? `${pageCount ? `${pageCount} page${pageCount === 1 ? "" : "s"}` : "PDF"}` : "Image"} - {formatBytes(file.size)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
      {selectedPreview ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#111827]/50 p-4 backdrop-blur-xl"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPreview(null)
          }}
        >
          <div className="w-full max-w-4xl overflow-hidden rounded-md border border-border bg-card p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-foreground">{selectedPreview.name}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedPreview(null)}
                className="h-9 rounded-md border-border bg-background px-3 text-foreground"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex max-h-[78vh] items-center justify-center overflow-hidden rounded-lg bg-white">
              <img src={selectedPreview.url} alt={selectedPreview.name} className="max-h-[78vh] w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export function ResultPreviewPanel({
  isComplete,
  resultFiles,
  tablePreviewData,
  textPreview,
  firstImageUrl,
  isTextOutput,
}: Pick<
  ConversionWorkspaceProps,
  "isComplete" | "resultFiles" | "tablePreviewData" | "textPreview" | "firstImageUrl" | "isTextOutput"
>) {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)

  if (!isComplete || !resultFiles?.length) {
    return (
      <div className="flex min-h-[300px] flex-col justify-between rounded-md border border-border bg-card/50 p-4 backdrop-blur-xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Result</p>
          <p className="mt-2 text-lg font-semibold text-foreground">Review board</p>
        </div>
        <div className="grid gap-2">
          <div className="h-9 rounded-md bg-card/65" />
          <div className="h-9 w-4/5 rounded-md bg-card/60" />
          <div className="h-9 w-3/5 rounded-md bg-card/50" />
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="rounded-md border border-border bg-card/50 p-3 backdrop-blur-xl">
      <div className="grid gap-3 xl:grid-cols-2">
        {firstImageUrl ? (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Before</p>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setImagePreviewOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setImagePreviewOpen(true)
                }
              }}
              className="flex min-h-[260px] cursor-zoom-in items-center justify-center overflow-hidden rounded-lg border border-border bg-card/70 outline-none transition hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary"
            >
              <img src={firstImageUrl} alt="Original uploaded file" className="max-h-[420px] w-full object-contain" />
            </div>
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">After</p>
          <div className="max-h-[420px] min-h-[260px] overflow-auto rounded-lg border border-border bg-white">
            {isTextOutput || textPreview ? (
              <pre className="min-h-[260px] whitespace-pre-wrap p-4 text-sm font-medium leading-6 text-gray-950">
                {textPreview || "Text preview is loading..."}
              </pre>
            ) : tablePreviewData.length ? (
              <table className="w-full border-collapse text-sm text-gray-950">
                <tbody>
                  {tablePreviewData.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex === 0 ? "bg-emerald-50 font-semibold" : "bg-white"}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border border-gray-200 px-3 py-2 text-left text-gray-950">
                          {cell || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex min-h-[260px] items-center justify-center p-4 text-sm font-semibold text-muted-foreground">
                Preview is loading
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      {imagePreviewOpen && firstImageUrl ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#111827]/50 p-4 backdrop-blur-xl"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setImagePreviewOpen(false)
          }}
        >
          <div className="w-full max-w-4xl overflow-hidden rounded-md border border-border bg-card p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-foreground">{resultFiles[0]?.filename || "Input preview"}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setImagePreviewOpen(false)}
                className="h-9 rounded-md border-border bg-background px-3 text-foreground"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex max-h-[78vh] items-center justify-center overflow-hidden rounded-lg bg-white">
              <img src={firstImageUrl} alt="Original uploaded file" className="max-h-[78vh] w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function getResultKey(file: ResultFile, index: number) {
  return file.file_id || `result-${index}`
}

function getOutputBadge(file: ResultFile) {
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
    return { state: "failed" as const, label: "Failed", className: "border-rose-200 bg-rose-50 text-rose-800" }
  }

  if (activeDuplicateWarnings(file).length) {
    return { state: "needs_review" as const, label: "Possible duplicate", className: "border-amber-200 bg-amber-50 text-amber-800" }
  }

  if (file.review_status === "published") {
    return { state: "published" as const, label: "Published", className: "border-sky-200 bg-sky-50 text-sky-800" }
  }

  if (file.review_status === "edited") {
    return { state: "edited" as const, label: "Edited", className: "border-primary/20 bg-primary/10 text-primary" }
  }

  if (file.review_status === "ready") {
    return { state: "ready" as const, label: "Ready", className: "border-emerald-200 bg-emerald-50 text-emerald-800" }
  }

  return needsReview
    ? { state: "needs_review" as const, label: "Needs review", className: "border-amber-200 bg-amber-50 text-amber-800" }
    : { state: "ready" as const, label: "Ready", className: "border-emerald-200 bg-emerald-50 text-emerald-800" }
}

function activeDuplicateWarnings(file: ResultFile) {
  return (file.duplicate_warnings || []).filter(warning => !warning.overridden)
}

const vendorRuleInputs: Array<{ key: keyof VendorRuleFields; label: string; placeholder: string }> = [
  { key: "category_account", label: "Category / account", placeholder: "Office supplies" },
  { key: "tax_code", label: "Tax code", placeholder: "VAT 20%" },
  { key: "currency", label: "Currency", placeholder: "USD" },
  { key: "payment_terms", label: "Payment terms", placeholder: "Net 30" },
  { key: "destination_treatment", label: "Destination", placeholder: "Draft bill" },
]

function initialVendorRuleDraft(file?: ResultFile | null): VendorRuleFields {
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

function correctedFilename(filename?: string) {
  return `${(filename || "result").replace("_processed", "").replace(/\.[^/.]+$/, "")}_corrected.xlsx`
}

function formatDocumentType(type?: string) {
  const labels: Record<string, string> = {
    auto: "Auto detect",
    table: "Table",
    invoice: "Invoice",
    receipt: "Receipt",
    bank_statement: "Bank statement",
    notes: "Notes",
    invoice_receipt: "Invoice / receipt",
    needs_manual_selection: "Select type",
  }
  return labels[type || ""] || "Document"
}

function reviewData(file: ResultFile) {
  return file.reviewed_data && typeof file.reviewed_data === "object" ? file.reviewed_data : {}
}

function resultSummary(file: ResultFile) {
  const data = reviewData(file)
  const type = file.document_type
  if (type === "invoice") {
    return {
      identityLabel: "Vendor",
      identity: String(data.vendor_name || "Vendor not found"),
      amountLabel: "Total",
      amount: [data.currency, data.total].filter(Boolean).join(" ") || "-",
    }
  }
  if (type === "receipt") {
    return {
      identityLabel: "Merchant",
      identity: String(data.merchant || "Merchant not found"),
      amountLabel: "Total",
      amount: [data.currency, data.total].filter(Boolean).join(" ") || "-",
    }
  }
  if (type === "bank_statement") {
    return {
      identityLabel: "Account",
      identity: String(data.account_holder || data.bank_name || "Account not found"),
      amountLabel: "Closing balance",
      amount: [data.currency, data.closing_balance].filter(Boolean).join(" ") || "-",
    }
  }
  if (type === "notes") {
    const text = String(data.readable_text || "").trim()
    return {
      identityLabel: "Notes",
      identity: text ? `${text.slice(0, 48)}${text.length > 48 ? "..." : ""}` : "Handwritten notes",
      amountLabel: "Tables",
      amount: String(Array.isArray(data.tables) ? data.tables.length : 0),
    }
  }
  return {
    identityLabel: "Output",
    identity: file.filename || "Extracted table",
    amountLabel: "Rows",
    amount: String(Array.isArray(file.review_grid) ? Math.max(file.review_grid.length - 1, 0) : "-"),
  }
}

function structuredRows(file: ResultFile): { columns: string[]; rows: any[][]; pathRoot?: string } | null {
  const data = reviewData(file)
  if (file.document_type === "invoice" || file.document_type === "receipt") {
    return {
      columns: ["Description", "Quantity", "Unit price", "Tax", "Line total"],
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
      columns: ["Date", "Description", "Reference", "Debit", "Credit", "Balance"],
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

function structuredRowPaths(file: ResultFile) {
  if (file.document_type === "invoice" || file.document_type === "receipt") {
    return ["description", "quantity", "unit_price", "tax_rate", "line_total"]
  }
  if (file.document_type === "bank_statement") {
    return ["date", "description", "reference", "debit", "credit", "balance"]
  }
  return []
}

function structuredFields(file: ResultFile): Array<{ label: string; path: string; value: string }> {
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
    label,
    path,
    value: String(data[path] || ""),
  }))
}

function ResultThumb({ file, preview, isTextOutput, compact = false }: { file: ResultFile; preview?: ResultPreview; isTextOutput: boolean; compact?: boolean }) {
  const summary = resultSummary(file)
  const structured = structuredRows(file)
  const height = compact ? "min-h-[196px]" : "min-h-[255px]"
  if (preview?.loading) {
    return (
      <div className={cn("flex h-full items-center justify-center rounded-md border border-border bg-background", height)}>
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    )
  }

  if (isTextOutput || preview?.text) {
    const lines = (preview?.text || "").split(/\r?\n/).filter(Boolean).slice(0, 5)
    return (
      <div className={cn("flex h-full flex-col gap-2 overflow-hidden rounded-md border border-border bg-white p-4", height)}>
        {lines.length ? lines.map((line, index) => (
          <span key={index} className="truncate text-xs font-semibold text-gray-700">
            {line}
          </span>
        )) : (
          <span className="text-[10px] font-semibold text-gray-500">Text output</span>
        )}
      </div>
    )
  }

  if (structured) {
    const rows = structured.rows.slice(0, compact ? 3 : 5)
    return (
      <div className={cn("overflow-hidden rounded-md border border-border bg-white", height)}>
        <div className="grid grid-cols-2 border-b border-border bg-muted/35 px-3 py-2 text-[11px] font-medium text-muted-foreground">
          <span className="truncate">{summary.identityLabel}</span>
          <span className="text-right">{summary.amountLabel}</span>
          <span className="truncate text-sm font-semibold text-foreground">{summary.identity}</span>
          <span className="text-right text-sm font-semibold text-foreground">{summary.amount}</span>
        </div>
        <div className="grid grid-cols-3 bg-foreground px-2 py-1.5 text-[10px] font-medium text-background">
          {structured.columns.slice(0, 3).map(column => <span key={column} className="truncate px-1">{column}</span>)}
        </div>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-3 border-b border-border px-2 py-1.5 text-xs text-foreground last:border-b-0">
            {row.slice(0, 3).map((value, cellIndex) => <span key={cellIndex} className="truncate px-1">{value || "-"}</span>)}
          </div>
        ))}
      </div>
    )
  }

  const rows = preview?.table?.length ? preview.table.slice(0, 5) : []

  return (
    <div className={cn("h-full overflow-hidden rounded-md border border-border bg-white", height)}>
      <div className="grid grid-cols-4 bg-primary">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className="h-5 border-r border-white/20 last:border-r-0" />
        ))}
      </div>
      {rows.length ? rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 border-b border-gray-200 last:border-b-0">
          {Array.from({ length: 4 }).map((_, cellIndex) => (
            <span key={cellIndex} className="truncate border-r border-gray-200 px-3 py-2 text-xs font-medium text-gray-800 last:border-r-0">
              {row?.[cellIndex] || " "}
            </span>
          ))}
        </div>
      )) : (
        <div className="grid gap-1.5 p-3">
          <div className="h-2 rounded bg-gray-200" />
          <div className="h-2 w-4/5 rounded bg-gray-200" />
          <div className="h-2 w-3/5 rounded bg-gray-200" />
        </div>
      )}
    </div>
  )
}

export function ResultActions({
  resultFiles,
  isComplete,
  outputMode,
  onOutputModeChange,
  documentMode,
  isTextOutput,
  isSaving,
  isSaved,
  tablePreviewData,
  textPreview,
  resultPreviews,
  firstImageUrl,
  activePreviewFileId,
  onReset,
  onSaveToHistory,
  onShareFile,
  onShareAll,
  onDownloadFile,
  onDownloadAll,
  onDownloadReviewedBatch,
  onDeleteDocument,
  onDeleteBatch,
  onEditFile,
  onPersistCellEdit,
  onPersistStructuredEdit,
  onMarkDocumentReady,
  onSendToAccountsPayable,
  onOverrideDuplicateWarning,
  onSaveVendorRule,
  quickBooksConnection,
  quickBooksReferences = [],
  onRefreshQuickBooksReferences,
  onPublishReceipt,
}: Pick<
  ConversionWorkspaceProps,
  | "resultFiles"
  | "isComplete"
  | "outputMode"
  | "onOutputModeChange"
  | "documentMode"
  | "isTextOutput"
  | "isSaving"
  | "isSaved"
  | "tablePreviewData"
  | "textPreview"
  | "resultPreviews"
  | "firstImageUrl"
  | "activePreviewFileId"
  | "onReset"
  | "onSaveToHistory"
  | "onShareFile"
  | "onShareAll"
  | "onDownloadFile"
  | "onDownloadAll"
  | "onDownloadReviewedBatch"
  | "onDeleteDocument"
  | "onDeleteBatch"
  | "onEditFile"
  | "onPersistCellEdit"
  | "onPersistStructuredEdit"
  | "onMarkDocumentReady"
  | "onSendToAccountsPayable"
  | "onOverrideDuplicateWarning"
  | "onSaveVendorRule"
  | "quickBooksConnection"
  | "quickBooksReferences"
  | "onRefreshQuickBooksReferences"
  | "onPublishReceipt"
>) {
  const [comparisonIndex, setComparisonIndex] = useState<number | null>(null)
  const [editingCell, setEditingCell] = useState<{ fileKey: string; row: number; col: number } | null>(null)
  const [editedTables, setEditedTables] = useState<Record<string, any[][]>>({})
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all")
  const [reviewedDownloadBusy, setReviewedDownloadBusy] = useState(false)
  const [vendorDrafts, setVendorDrafts] = useState<Record<string, VendorRuleFields>>({})
  const [vendorRuleSavingId, setVendorRuleSavingId] = useState<string | null>(null)
  const [receiptDestination, setReceiptDestination] = useState<ReceiptPublishingDestination | "">("")
  const [receiptVendorRefId, setReceiptVendorRefId] = useState("")
  const [receiptAccountRefId, setReceiptAccountRefId] = useState("")
  const [receiptTaxCodeRefId, setReceiptTaxCodeRefId] = useState("")
  const [receiptPaymentAccountRefId, setReceiptPaymentAccountRefId] = useState("")
  const [receiptPaymentType, setReceiptPaymentType] = useState<"Cash" | "Check" | "CreditCard">("CreditCard")
  const [receiptPublishing, setReceiptPublishing] = useState(false)
  const safeResultFiles = (resultFiles || []).filter(file => file.review_status !== "deleted")

  useEffect(() => {
    if (!safeResultFiles.length) return

    const hasReviewFiles = safeResultFiles.some((file) => {
      const badge = getOutputBadge(file)
      return badge.state === "needs_review"
    })
    const hasFailedFiles = safeResultFiles.some((file) => getOutputBadge(file).state === "failed")

    setResultFilter(hasReviewFiles ? "needs_review" : hasFailedFiles ? "failed" : "all")
  }, [safeResultFiles.map((file) => file.file_id || file.filename || "").join("|")])

  useEffect(() => {
    setEditedTables(previous => {
      const next = { ...previous }
      safeResultFiles.forEach((file, index) => {
        if (Array.isArray(file.review_grid) && file.review_grid.length > 0) {
          const key = getResultKey(file, index)
          if (!next[key]) {
            next[key] = file.review_grid.map(row => [...row])
          }
        }
      })
      return next
    })
  }, [safeResultFiles.map((file) => `${file.file_id || file.filename || ""}:${file.review_status || ""}`).join("|")])

  const firstResultFile = safeResultFiles[0]
  const reviewedExportOptions =
    documentMode === "notes"
      ? [
          { value: "text" as OutputMode, label: "Text" },
          { value: "table" as OutputMode, label: "XLSX" },
          { value: "csv" as OutputMode, label: "CSV" },
        ]
      : [
          { value: "table" as OutputMode, label: "XLSX" },
          { value: "csv" as OutputMode, label: "CSV" },
        ]
  const comparisonFile = comparisonIndex !== null ? safeResultFiles[comparisonIndex] : null
  const comparisonKey = comparisonFile && comparisonIndex !== null ? getResultKey(comparisonFile, comparisonIndex) : ""
  const comparisonLoaded = Boolean(
    comparisonFile &&
    (!comparisonFile.file_id || activePreviewFileId === comparisonFile.file_id)
  )
  const comparisonTable = comparisonKey
    ? editedTables[comparisonKey] || (comparisonLoaded ? tablePreviewData : [])
    : []
  const comparisonFields = comparisonFile ? structuredFields(comparisonFile) : []
  const comparisonRows = comparisonFile ? structuredRows(comparisonFile) : null
  const comparisonRowPaths = comparisonFile ? structuredRowPaths(comparisonFile) : []
  const comparisonSummary = comparisonFile ? resultSummary(comparisonFile) : null
  const comparisonText = comparisonLoaded ? textPreview : ""
  const comparisonColumnCount = Math.max(1, ...comparisonTable.map(row => row.length))
  const editedCount = Object.keys(editedTables).length
  const unresolvedDuplicateCount = safeResultFiles.reduce(
    (total, file) => total + activeDuplicateWarnings(file).length,
    0,
  )
  const comparisonDuplicateWarning = comparisonFile ? activeDuplicateWarnings(comparisonFile)[0] : undefined
  const comparisonVendorEligible = comparisonFile?.document_type === "invoice" || comparisonFile?.document_type === "receipt"
  const comparisonCanRememberVendor = Boolean(
    comparisonVendorEligible &&
    comparisonFile?.document_id &&
    ["ready", "published"].includes(comparisonFile.review_status || ""),
  )
  const comparisonVendorDraft = comparisonFile
    ? vendorDrafts[comparisonKey] || initialVendorRuleDraft(comparisonFile)
    : {}
  const visibleVendorRuleInputs = comparisonFile?.document_type === "receipt"
    ? vendorRuleInputs.filter(field => field.key !== "destination_treatment")
    : vendorRuleInputs
  const comparisonImageUrl = comparisonFile?.input_preview_url || (safeResultFiles.length === 1 ? firstImageUrl : "")
  const isReceiptComparison = comparisonFile?.document_type === "receipt"
  const receiptPublication = comparisonFile?.quickbooks_receipt_publication
  const quickBooksVendors = quickBooksReferences.filter(reference => reference.resource_type === "vendor")
  const quickBooksAccounts = quickBooksReferences.filter(reference => reference.resource_type === "account")
  const quickBooksTaxCodes = quickBooksReferences.filter(reference => reference.resource_type === "tax_code")
  const paidFromAccounts = quickBooksAccounts.filter(reference => {
    const accountType = String(reference.details?.account_type || "").replace(/\s/g, "").toLowerCase()
    return accountType === "bank" || accountType === "creditcard"
  })
  const resultEntries = safeResultFiles.map((file, index) => {
    const fileKey = getResultKey(file, index)
    const badge = getOutputBadge(file)
    const edited = Boolean(editedTables[fileKey]) || file.review_status === "edited"
    const duplicateWarning = activeDuplicateWarnings(file)[0]

    return { file, index, fileKey, badge, edited, duplicateWarning }
  })
  const filterCounts = resultEntries.reduce(
    (counts, entry) => {
      counts.all += 1
      counts[entry.badge.state] += 1
      if (entry.edited && entry.badge.state !== "edited") counts.edited += 1
      return counts
    },
    { all: 0, needs_review: 0, ready: 0, edited: 0, failed: 0, published: 0 } as Record<ResultFilter, number>
  )
  const filteredResultEntries = resultEntries.filter((entry) => {
    if (resultFilter === "all") return true
    if (resultFilter === "edited") return entry.edited
    return entry.badge.state === resultFilter
  })
  const navigableResultEntries = resultFilter === "all" ? resultEntries : filteredResultEntries
  const comparisonInCurrentFilter = comparisonIndex === null || navigableResultEntries.some(entry => entry.index === comparisonIndex)
  const canNavigateResults = navigableResultEntries.length > 1 || (!comparisonInCurrentFilter && navigableResultEntries.length > 0)

  const openComparison = (index: number) => {
    const file = safeResultFiles[index]
    if (!file) return
    setComparisonIndex(index)
    setEditingCell(null)
    onEditFile(file, index)
  }

  useEffect(() => {
    setReceiptDestination("")
    setReceiptVendorRefId("")
    setReceiptAccountRefId("")
    setReceiptTaxCodeRefId("")
    setReceiptPaymentAccountRefId("")
    setReceiptPaymentType("CreditCard")
    if (comparisonFile?.document_type !== "receipt") return
    const remembered = comparisonFile.vendor_suggestion?.suggested_fields
    const vendorMatch = quickBooksVendors.find(reference => reference.external_id === remembered?.vendor_ref_id)
    const accountMatch = quickBooksAccounts.find(reference => (
      reference.external_id === remembered?.account_ref_id ||
      reference.display_name === remembered?.category_account
    ))
    const taxMatch = quickBooksTaxCodes.find(reference => (
      reference.external_id === remembered?.tax_code_ref_id ||
      reference.display_name === remembered?.tax_code
    ))
    setReceiptVendorRefId(vendorMatch?.external_id || "")
    setReceiptAccountRefId(accountMatch?.external_id || "")
    setReceiptTaxCodeRefId(taxMatch?.external_id || "")
  }, [comparisonKey, quickBooksReferences])

  useEffect(() => {
    if (comparisonIndex !== null && comparisonIndex >= safeResultFiles.length) {
      setComparisonIndex(null)
      setEditingCell(null)
    }
  }, [comparisonIndex, safeResultFiles.length])

  if (!safeResultFiles.length) return null

  const goToAdjacentResult = (direction: -1 | 1) => {
    if (comparisonIndex === null || !navigableResultEntries.length) return
    const position = navigableResultEntries.findIndex(entry => entry.index === comparisonIndex)
    if (position < 0) {
      openComparison(navigableResultEntries[direction === 1 ? 0 : navigableResultEntries.length - 1].index)
      return
    }
    if (navigableResultEntries.length < 2) return
    const nextPosition = (position + direction + navigableResultEntries.length) % navigableResultEntries.length
    openComparison(navigableResultEntries[nextPosition].index)
  }

  const updateCorrectedCell = async (file: ResultFile, fileKey: string, rowIndex: number, cellIndex: number, value: string) => {
    const baseTable = editedTables[fileKey] || comparisonTable
    if (onPersistCellEdit && !await onPersistCellEdit(file, rowIndex, cellIndex, value, baseTable)) {
      return
    }
    setEditedTables(prev => {
      const source = prev[fileKey] || baseTable
      const nextTable = source.map(row => [...row])
      if (!nextTable[rowIndex]) nextTable[rowIndex] = []
      nextTable[rowIndex][cellIndex] = value
      return { ...prev, [fileKey]: nextTable }
    })
  }

  const updateStructuredValue = async (file: ResultFile, fieldPath: Array<string | number>, value: string) => {
    if (onPersistStructuredEdit) {
      await onPersistStructuredEdit(file, fieldPath, value)
    }
  }

  const downloadCorrectedFiles = async () => {
    const entries = Object.entries(editedTables).filter(([, table]) => table.length > 0)
    if (!entries.length) {
      onDownloadAll()
      return
    }

    const XLSX = await import("xlsx")

    for (const [fileKey, table] of entries) {
      const fileIndex = safeResultFiles.findIndex((file, index) => getResultKey(file, index) === fileKey)
      const file = fileIndex >= 0 ? safeResultFiles[fileIndex] : undefined
      const worksheet = XLSX.utils.aoa_to_sheet(table)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = correctedFilename(file?.filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      await new Promise(resolve => setTimeout(resolve, 180))
    }
  }

  const handleReviewedBatchDownload = async () => {
    setReviewedDownloadBusy(true)
    try {
      if (onDownloadReviewedBatch) {
        await onDownloadReviewedBatch(editedTables)
      } else {
        await downloadCorrectedFiles()
      }
    } finally {
      setReviewedDownloadBusy(false)
    }
  }

  const updateVendorDraft = (key: keyof VendorRuleFields, value: string) => {
    if (!comparisonKey || !comparisonFile) return
    setVendorDrafts(current => ({
      ...current,
      [comparisonKey]: {
        ...(current[comparisonKey] || initialVendorRuleDraft(comparisonFile)),
        [key]: value,
      },
    }))
  }

  const saveVendorRule = async () => {
    if (!comparisonFile?.document_id || !onSaveVendorRule) return
    setVendorRuleSavingId(comparisonFile.document_id)
    try {
      await onSaveVendorRule(
        comparisonFile,
        comparisonFile.document_type === "receipt"
          ? { ...comparisonVendorDraft, destination_treatment: undefined }
          : comparisonVendorDraft
      )
    } finally {
      setVendorRuleSavingId(null)
    }
  }

  const publishReceipt = async () => {
    if (!comparisonFile || !receiptDestination || !receiptAccountRefId || !onPublishReceipt) return
    if (receiptDestination === "bill" && !receiptVendorRefId) return
    if (receiptDestination === "expense" && !receiptPaymentAccountRefId) return
    setReceiptPublishing(true)
    try {
      await onPublishReceipt(comparisonFile, {
        destination: receiptDestination,
        vendor_ref_id: receiptVendorRefId || undefined,
        account_ref_id: receiptAccountRefId,
        tax_code_ref_id: receiptTaxCodeRefId || undefined,
        payment_account_ref_id: receiptDestination === "expense" ? receiptPaymentAccountRefId : undefined,
        payment_type: receiptDestination === "expense" ? receiptPaymentType : undefined,
      })
    } finally {
      setReceiptPublishing(false)
    }
  }

  return (
    <>
    <div className="space-y-2.5">
      {isComplete ? (
        <div className="sticky top-[4.5rem] z-20 flex flex-wrap items-center gap-2 rounded-md border border-border bg-card/95 p-2 shadow-xs backdrop-blur-xl">
          <Button
            variant="outline"
            onClick={() => {
              setEditedTables({})
              setComparisonIndex(null)
              setEditingCell(null)
              onReset()
            }}
            className="h-9 gap-2 rounded-md px-3 shadow-xs"
          >
            <RotateCcw className="h-4 w-4" />
            New batch
          </Button>
          {!isSaved ? (
            <Button
              onClick={onSaveToHistory}
              disabled={isSaving}
              variant="outline"
              className="h-9 gap-2 rounded-md border-border bg-card px-3 text-foreground shadow-xs hover:bg-accent"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={safeResultFiles.length > 1 ? onShareAll : () => firstResultFile && onShareFile(firstResultFile)}
            className="h-9 gap-2 rounded-md border-border bg-card px-3 text-foreground shadow-xs hover:bg-accent"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <div className="flex h-9 items-center overflow-hidden rounded-md border border-border bg-card shadow-xs">
            {reviewedExportOptions.map(format => (
              <button
                key={format.value}
                type="button"
                onClick={() => onOutputModeChange(format.value)}
                className={cn(
                  "h-full border-r border-border px-3 text-xs font-semibold transition last:border-r-0",
                  outputMode === format.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {format.label}
              </button>
            ))}
          </div>
          <Button
            variant="reviewed"
            onClick={handleReviewedBatchDownload}
            disabled={reviewedDownloadBusy || unresolvedDuplicateCount > 0}
            className="h-9 gap-2 rounded-md px-3 shadow-xs"
          >
            {reviewedDownloadBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {unresolvedDuplicateCount > 0 ? "Resolve duplicates to export" : "Download reviewed batch"}
          </Button>
          {onDeleteBatch ? (
            <Button
              variant="outline"
              onClick={() => void onDeleteBatch()}
              className="h-9 gap-2 rounded-md border-rose-200 bg-card px-3 text-rose-700 shadow-xs hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete batch
            </Button>
          ) : null}
          {editedCount > 0 && !isTextOutput ? (
            <span className="inline-flex h-9 items-center rounded-md border border-border bg-muted px-3 text-xs font-semibold text-foreground">
              {editedCount} edited
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="pt-2">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              Review board <span className="text-base font-medium text-muted-foreground">{safeResultFiles.length}</span>
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {([
            ["all", "All"],
            ["needs_review", "Needs review"],
            ["ready", "Ready"],
            ["edited", "Edited"],
            ["failed", "Failed"],
            ["published", "Published"],
          ] as Array<[ResultFilter, string]>).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setResultFilter(value)}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition",
                resultFilter === value
                  ? "border-border bg-accent text-accent-foreground"
                  : "border-border bg-card text-foreground hover:bg-accent"
              )}
            >
              {label}
              <span className={cn("rounded-sm px-1.5 py-0.5 text-[10px]", resultFilter === value ? "bg-card text-foreground" : "bg-muted text-muted-foreground")}>
                {filterCounts[value]}
              </span>
            </button>
          ))}
        </div>

        <div className={cn(
          "grid gap-4",
          safeResultFiles.length > 1 ? "grid-cols-1 2xl:grid-cols-2" : "grid-cols-1"
        )}>
        {filteredResultEntries.length ? filteredResultEntries.map(({ file, index, fileKey, badge, edited, duplicateWarning }) => {
          const preview = file.file_id ? resultPreviews?.[file.file_id] : undefined
          const visiblePreview = edited ? { table: editedTables[fileKey] || [], text: preview?.text || "", loading: false } : preview
          const compact = safeResultFiles.length > 1
          const summary = resultSummary(file)

          return (
            <div
              key={file.file_id || index}
              role="button"
              tabIndex={0}
              onClick={() => openComparison(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  openComparison(index)
                }
              }}
              className={cn(
                "group cursor-pointer rounded-md border border-border bg-card p-3 shadow-sm outline-none transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary",
                compact ? "min-h-[300px]" : "min-h-[375px]"
              )}
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(180px,0.95fr)_minmax(0,1.05fr)]">
                <div className="overflow-hidden rounded-md border border-border bg-white">
                  {file.input_preview_url ? (
                    <img
                      src={file.input_preview_url}
                      alt={`Input file ${index + 1}`}
                      className={cn("h-full w-full object-contain", compact ? "min-h-[196px]" : "min-h-[255px]")}
                    />
                  ) : (
                    <div className={cn("flex h-full items-center justify-center bg-muted", compact ? "min-h-[196px]" : "min-h-[255px]")}>
                      <FileImage className="h-7 w-7 text-primary/65" />
                    </div>
                  )}
                </div>
                <ResultThumb file={file} preview={visiblePreview} isTextOutput={isTextOutput} compact={compact} />
              </div>

              <div className="mt-3 flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background">
                    {index + 1}
                  </span>
                  {isTextOutput ? <FileText className="h-5 w-5 shrink-0 text-primary" /> : <FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" />}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{file.filename || `Result ${index + 1}`}</p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {formatDocumentType(file.document_type)}
                      {file.source_page ? ` - page ${file.source_page}${file.source_page_count ? ` of ${file.source_page_count}` : ""}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold", badge.className)}>
                    {badge.label}
                  </span>
                  {edited && badge.state !== "edited" ? (
                    <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                      Edited
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
                <div className="min-w-0">
                  <p className="text-muted-foreground">{summary.identityLabel}</p>
                  <p className="mt-1 truncate font-semibold text-foreground">{summary.identity}</p>
                </div>
                <div className="min-w-0 text-right">
                  <p className="text-muted-foreground">{summary.amountLabel}</p>
                  <p className="mt-1 truncate font-semibold text-foreground">{summary.amount}</p>
                </div>
              </div>

              {duplicateWarning ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  <span className="font-medium">{duplicateWarning.message}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation()
                      void onOverrideDuplicateWarning?.(file, duplicateWarning.id)
                    }}
                    className="h-7 rounded-md border-amber-300 bg-white px-2.5 text-[11px] text-amber-950 hover:bg-amber-100"
                  >
                    Keep separate
                  </Button>
                </div>
              ) : null}

              <div className="mt-3 flex justify-end gap-2">
                {file.document_id && onDeleteDocument ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation()
                      void onDeleteDocument(file)
                    }}
                    className="h-8 rounded-md border-border bg-card px-2.5 text-xs text-muted-foreground shadow-sm hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    aria-label="Delete stored document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
                {file.document_type === "invoice" && ["ready", "published"].includes(file.review_status || "") ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation()
                      void onSendToAccountsPayable?.(file)
                    }}
                    className="h-8 rounded-md border-border bg-card px-3 text-xs text-foreground shadow-sm hover:bg-accent"
                  >
                    Add to AP
                  </Button>
                ) : null}
                {file.document_id && !["ready", "published", "failed", "deleted"].includes(file.review_status || "") ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation()
                      void onMarkDocumentReady?.(file)
                    }}
                    className="h-8 rounded-md border-border bg-card px-3 text-xs text-foreground shadow-sm hover:bg-accent"
                  >
                    Mark ready
                  </Button>
                ) : null}
                {file.file_id ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation()
                        onShareFile(file)
                      }}
                      className="h-8 rounded-md border-border bg-card px-3 text-xs text-foreground shadow-sm hover:bg-accent"
                    >
                      <Share2 className="mr-1.5 h-3.5 w-3.5" />
                      Share
                    </Button>
                  </>
                ) : null}
                {file.file_id || file.document_id ? (
                  <Button
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDownloadFile(file, index)
                    }}
                    className="h-8 rounded-md px-3 text-xs shadow-sm"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download
                  </Button>
                ) : null}
              </div>
            </div>
          )
        }) : (
          <div className="rounded-md border border-dashed border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">No files in this view</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">The full batch is still available.</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setResultFilter("all")}
              className="mt-3 h-8 rounded-md border-border bg-background px-3 text-xs text-foreground hover:bg-accent"
            >
              Show all files
            </Button>
          </div>
        )}
        </div>
      </div>
    </div>
      {comparisonFile ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#111827]/50 p-3 backdrop-blur-xl sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setComparisonIndex(null)
              setEditingCell(null)
            }
          }}
        >
          <div className="relative w-full max-w-[1240px] rounded-md border border-border bg-card p-3 shadow-xl sm:p-4">
            <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
              {comparisonFile.document_id && onDeleteDocument ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void onDeleteDocument(comparisonFile)}
                  className="h-9 rounded-md border-rose-200 bg-background px-3 text-xs text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              ) : null}
              {comparisonFile.document_type === "invoice" && ["ready", "published"].includes(comparisonFile.review_status || "") ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void onSendToAccountsPayable?.(comparisonFile)}
                  className="h-9 rounded-md border-border bg-background px-3 text-xs text-foreground"
                >
                  Add to Accounts Payable
                </Button>
              ) : null}
              {comparisonFile.document_id && !["ready", "published", "failed", "deleted"].includes(comparisonFile.review_status || "") ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void onMarkDocumentReady?.(comparisonFile)}
                  className="h-9 rounded-md border-border bg-background px-3 text-xs text-foreground"
                >
                  Mark ready
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setComparisonIndex(null)
                  setEditingCell(null)
                }}
                className="h-9 rounded-md border-border bg-background px-3 text-foreground"
                aria-label="Close comparison"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {canNavigateResults ? (
              <>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => goToAdjacentResult(-1)}
                  className="absolute left-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-md border-border bg-background text-foreground"
                  aria-label="Previous result"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => goToAdjacentResult(1)}
                  className="absolute right-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-md border-border bg-background text-foreground"
                  aria-label="Next result"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            ) : null}

            <div className="grid max-h-[84vh] gap-3 overflow-auto pt-12 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-md border border-border bg-white">
                {comparisonImageUrl ? (
                  <img src={comparisonImageUrl} alt="Input preview" className="max-h-[74vh] w-full object-contain" />
                ) : (
                  <div className="text-sm font-semibold text-muted-foreground">Input preview unavailable</div>
                )}
              </div>

              <div key={comparisonKey} className="max-h-[74vh] min-h-[420px] overflow-auto rounded-md border border-border bg-white">
                {comparisonFile && comparisonDuplicateWarning ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                    <span className="font-medium">{comparisonDuplicateWarning.message}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void onOverrideDuplicateWarning?.(comparisonFile, comparisonDuplicateWarning.id)}
                      className="h-7 rounded-md border-amber-300 bg-white px-2.5 text-[11px] text-amber-950 hover:bg-amber-100"
                    >
                      Keep separate
                    </Button>
                  </div>
                ) : null}
                {comparisonFile && comparisonVendorEligible ? (
                  <div className="border-b border-border bg-muted/20 px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Vendor memory</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Saved suggestions stay separate until you choose values during review.
                        </p>
                      </div>
                      {comparisonFile.vendor_suggestion ? (
                        <span className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-semibold text-foreground">
                          Remembered vendor
                        </span>
                      ) : null}
                    </div>
                    {comparisonFile.vendor_suggestion ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {visibleVendorRuleInputs.map(field => {
                          const value = comparisonFile.vendor_suggestion?.suggested_fields[field.key]
                          return value ? (
                            <span key={field.key} className="rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground">
                              <span className="text-muted-foreground">{field.label}: </span>{value}
                            </span>
                          ) : null
                        })}
                      </div>
                    ) : null}
                    {comparisonCanRememberVendor ? (
                      <div className="mt-3">
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {visibleVendorRuleInputs.map(field => (
                            <label key={field.key} className="text-[11px] font-medium text-muted-foreground">
                              {field.label}
                              <input
                                value={comparisonVendorDraft[field.key] || ""}
                                onChange={(event) => updateVendorDraft(field.key, event.target.value)}
                                placeholder={field.placeholder}
                                className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                              />
                            </label>
                          ))}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void saveVendorRule()}
                          disabled={vendorRuleSavingId === comparisonFile.document_id}
                          className="mt-3 h-8 rounded-md px-3 text-xs"
                        >
                          {vendorRuleSavingId === comparisonFile.document_id
                            ? "Saving..."
                            : comparisonFile.vendor_suggestion
                              ? "Update vendor memory"
                              : "Remember this vendor"}
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-3 text-[11px] text-muted-foreground">
                        Confirm this document as Ready to save recurring vendor suggestions.
                      </p>
                    )}
                  </div>
                ) : null}
                {comparisonFile && isReceiptComparison ? (
                  <div className="border-b border-border bg-card px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-foreground">QuickBooks destination</p>
                        <p className="mt-1 max-w-xl text-[11px] text-muted-foreground">
                          Choose how this reviewed receipt is recorded. Expense records an already-paid purchase; Bill records an unpaid payable.
                        </p>
                      </div>
                      {receiptPublication ? (
                        <span className="rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-semibold text-foreground">
                          {receiptPublication.destination === "expense" ? "Expense" : "Bill"} - {receiptPublication.status}
                        </span>
                      ) : null}
                    </div>
                    {receiptPublication?.status === "published" ? (
                      <p className="mt-3 text-xs text-foreground">
                        Published to QuickBooks as {receiptPublication.remote_entity_type}.
                        {receiptPublication.attachment_status === "attached" ? " Source attached." : " Source attachment pending review."}
                      </p>
                    ) : !["ready", "published"].includes(comparisonFile.review_status || "") ? (
                      <p className="mt-3 text-xs text-muted-foreground">Mark this receipt Ready after review to publish it.</p>
                    ) : !quickBooksConnection?.connected ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <p className="text-xs text-muted-foreground">Connect QuickBooks before publishing receipts.</p>
                        <a href="/dashboard/integrations" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 rounded-md px-3 text-xs")}>
                          Open integrations
                        </a>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          {([
                            ["expense", "Expense", "Already paid"],
                            ["bill", "Bill", "Pay later"],
                          ] as Array<[ReceiptPublishingDestination, string, string]>).map(([value, title, subtitle]) => (
                            <button
                              type="button"
                              key={value}
                              onClick={() => setReceiptDestination(value)}
                              className={cn(
                                "rounded-md border p-3 text-left transition",
                                receiptDestination === value
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-background hover:bg-accent"
                              )}
                            >
                              <span className="block text-xs font-semibold text-foreground">{title}</span>
                              <span className="mt-0.5 block text-[11px] text-muted-foreground">{subtitle}</span>
                            </button>
                          ))}
                        </div>
                        {receiptDestination ? (
                          <div className="grid gap-2 sm:grid-cols-2">
                            <label className="text-[11px] font-medium text-muted-foreground">
                              Expense account
                              <select
                                value={receiptAccountRefId}
                                onChange={(event) => setReceiptAccountRefId(event.target.value)}
                                className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
                              >
                                <option value="">Select account</option>
                                {quickBooksAccounts.map(reference => (
                                  <option key={reference.external_id} value={reference.external_id}>{reference.display_name}</option>
                                ))}
                              </select>
                            </label>
                            <label className="text-[11px] font-medium text-muted-foreground">
                              {receiptDestination === "bill" ? "Vendor" : "Vendor (optional)"}
                              <select
                                value={receiptVendorRefId}
                                onChange={(event) => setReceiptVendorRefId(event.target.value)}
                                className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
                              >
                                <option value="">Select vendor</option>
                                {quickBooksVendors.map(reference => (
                                  <option key={reference.external_id} value={reference.external_id}>{reference.display_name}</option>
                                ))}
                              </select>
                            </label>
                            <label className="text-[11px] font-medium text-muted-foreground">
                              Tax code (optional)
                              <select
                                value={receiptTaxCodeRefId}
                                onChange={(event) => setReceiptTaxCodeRefId(event.target.value)}
                                className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
                              >
                                <option value="">No tax code selected</option>
                                {quickBooksTaxCodes.map(reference => (
                                  <option key={reference.external_id} value={reference.external_id}>{reference.display_name}</option>
                                ))}
                              </select>
                            </label>
                            {receiptDestination === "expense" ? (
                              <>
                                <label className="text-[11px] font-medium text-muted-foreground">
                                  Paid from
                                  <select
                                    value={receiptPaymentAccountRefId}
                                    onChange={(event) => setReceiptPaymentAccountRefId(event.target.value)}
                                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
                                  >
                                    <option value="">Select bank or card account</option>
                                    {paidFromAccounts.map(reference => (
                                      <option key={reference.external_id} value={reference.external_id}>{reference.display_name}</option>
                                    ))}
                                  </select>
                                </label>
                                <label className="text-[11px] font-medium text-muted-foreground">
                                  Payment type
                                  <select
                                    value={receiptPaymentType}
                                    onChange={(event) => setReceiptPaymentType(event.target.value as "Cash" | "Check" | "CreditCard")}
                                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
                                  >
                                    <option value="CreditCard">Credit card</option>
                                    <option value="Check">Check</option>
                                    <option value="Cash">Cash</option>
                                  </select>
                                </label>
                              </>
                            ) : null}
                          </div>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void publishReceipt()}
                            disabled={
                              receiptPublishing ||
                              !receiptDestination ||
                              !receiptAccountRefId ||
                              (receiptDestination === "bill" && !receiptVendorRefId) ||
                              (receiptDestination === "expense" && !receiptPaymentAccountRefId)
                            }
                            className="h-9 rounded-md px-4 text-xs"
                          >
                            {receiptPublishing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                            Publish {receiptDestination || "receipt"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void onRefreshQuickBooksReferences?.()}
                            className="h-9 rounded-md px-3 text-xs"
                          >
                            Refresh QuickBooks lists
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
                {comparisonFields.length || comparisonRows ? (
                  <div className="text-gray-950">
                    <div className="sticky top-0 z-[1] flex items-center justify-between gap-4 border-b border-border bg-white px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{comparisonSummary?.identity || comparisonFile.filename || "Document"}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{formatDocumentType(comparisonFile.document_type)}</p>
                      </div>
                      <span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold", getOutputBadge(comparisonFile).className)}>
                        {getOutputBadge(comparisonFile).label}
                      </span>
                    </div>
                    {comparisonFields.length ? (
                      <div className="grid gap-px border-b border-border bg-border sm:grid-cols-2">
                        {comparisonFields.map(field => (
                          <label key={field.path} className="bg-white px-3 py-2.5">
                            <span className="mb-1 block text-[11px] font-medium text-gray-500">{field.label}</span>
                            <input
                              defaultValue={field.value}
                              onBlur={(event) => {
                                if (event.target.value !== field.value) {
                                  void updateStructuredValue(comparisonFile, [field.path], event.target.value)
                                }
                              }}
                              className="h-8 w-full rounded-md border border-transparent bg-gray-50 px-2 text-sm font-medium text-gray-950 outline-none transition focus:border-primary/35 focus:bg-white focus:ring-2 focus:ring-primary/15"
                            />
                          </label>
                        ))}
                      </div>
                    ) : null}
                    {comparisonRows?.rows.length ? (
                      <table className="w-full min-w-[640px] border-collapse text-xs">
                        <thead className="sticky top-[61px] bg-gray-50 text-gray-600">
                          <tr>
                            {comparisonRows.columns.map(column => (
                              <th key={column} className="border-b border-border px-3 py-2 text-left font-medium">{column}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonRows.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="odd:bg-white even:bg-gray-50/70">
                              {row.map((value, cellIndex) => (
                                <td key={cellIndex} className="border-b border-border px-2 py-1.5">
                                  <input
                                    defaultValue={String(value || "")}
                                    onBlur={(event) => {
                                      if (event.target.value !== String(value || "") && comparisonRows.pathRoot && comparisonRowPaths[cellIndex]) {
                                        void updateStructuredValue(
                                          comparisonFile,
                                          [comparisonRows.pathRoot, rowIndex, comparisonRowPaths[cellIndex]],
                                          event.target.value,
                                        )
                                      }
                                    }}
                                    className="h-8 w-full min-w-[90px] rounded-md border border-transparent bg-transparent px-1.5 text-xs text-gray-950 outline-none transition focus:border-primary/35 focus:bg-white focus:ring-2 focus:ring-primary/15"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="p-4 text-sm text-gray-500">No line rows detected.</p>
                    )}
                  </div>
                ) : isTextOutput || comparisonText ? (
                  <pre className="min-h-[420px] whitespace-pre-wrap p-5 text-left text-sm leading-7 text-gray-950">
                    {comparisonText || "Text preview is loading..."}
                  </pre>
                ) : comparisonTable.length ? (
                  <table className="w-full min-w-[680px] border-collapse text-sm text-gray-950">
                    <tbody>
                      {comparisonTable.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex === 0 ? "bg-primary text-primary-foreground" : rowIndex % 2 === 0 ? "bg-emerald-50" : "bg-white"}>
                          {Array.from({ length: comparisonColumnCount }).map((_, cellIndex) => {
                            const isEditing =
                              editingCell !== null &&
                              editingCell.fileKey === comparisonKey &&
                              editingCell.row === rowIndex &&
                              editingCell.col === cellIndex
                            const value = row[cellIndex] || ""

                            return (
                              <td
                                key={cellIndex}
                                onDoubleClick={() => {
                                  if (!isTextOutput && comparisonKey) {
                                    setEditingCell({ fileKey: comparisonKey, row: rowIndex, col: cellIndex })
                                  }
                                }}
                                className={cn(
                                  "min-w-[120px] border border-gray-200 px-3 py-2 text-left font-medium",
                                  rowIndex === 0 ? "border-white/20" : "hover:bg-emerald-50"
                                )}
                              >
                                {isEditing ? (
                                  <input
                                    autoFocus
                                    defaultValue={value}
                                    onBlur={(event) => {
                                      void updateCorrectedCell(comparisonFile, comparisonKey, rowIndex, cellIndex, event.target.value)
                                      setEditingCell(null)
                                    }}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter" || event.key === "Escape") {
                                        event.currentTarget.blur()
                                      }
                                    }}
                                    className="w-full rounded-md border border-primary/30 bg-white px-2 py-1 text-sm text-gray-950 outline-none ring-2 ring-primary/15"
                                  />
                                ) : (
                                  <span className={cn(!value && "text-gray-950/30")}>
                                    {value || " "}
                                  </span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex min-h-[420px] items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Preparing preview
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export function ConversionWorkspace(props: ConversionWorkspaceProps) {
  const {
    banner,
    onDismissBanner,
    latestRecoverableJob,
    recoveryLoading,
    onContinueLatestJob,
    uploadedFiles,
    filePreviewUrls,
    pdfPageCounts,
    isDragging,
    outputMode,
    onOutputModeChange,
    documentMode = "table",
    onDocumentModeChange,
    isUploading,
    isProcessing,
    isComplete,
    uploadedSizeMb,
    creditEstimate,
    processLabel,
    noCredits,
    resultFiles,
    tablePreviewData,
    textPreview,
    resultPreviews,
    firstImageUrl,
    activePreviewFileId,
    isTextOutput,
    isSaving,
    isSaved,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileInput,
    onRemoveFile,
    onClearFiles,
    onConvert,
    onCancel,
    onReset,
    onSaveToHistory,
    onShareFile,
    onShareAll,
    onDownloadFile,
    onDownloadAll,
    onDownloadReviewedBatch,
    onDeleteDocument,
    onDeleteBatch,
    onEditFile,
    onPersistCellEdit,
    onPersistStructuredEdit,
    onMarkDocumentReady,
    onSendToAccountsPayable,
    onOverrideDuplicateWarning,
    onSaveVendorRule,
    quickBooksConnection,
    quickBooksReferences,
    onRefreshQuickBooksReferences,
    onPublishReceipt,
    classifiedDocuments,
    overridingDocumentId,
    onOverrideDocumentMode,
  } = props
  const hasResults = Boolean(isComplete && (
    (resultFiles?.length || 0) > 0 || (classifiedDocuments?.length || 0) > 0
  ))
  const selectedMode =
    documentMode === "invoice_receipt"
      ? "invoice"
      : documentMode
  const expectedOutputs = Math.max(creditEstimate || 0, uploadedFiles.length)
  const modeOptions = [
    {
      value: "auto",
      label: "Auto detect",
      helper: "Classify each file",
      icon: "bg-[#eefaf7] text-[#087a50]",
      selected: "border-[#91dec0] bg-[#f2fff9]",
      hover: "hover:border-[#91dec0] hover:bg-[#f2fff9]",
    },
    {
      value: "table",
      label: "Table",
      helper: "Rows and columns",
      icon: "bg-[#ebfbf3] text-[#098451]",
      selected: "border-[#91dec0] bg-[#f2fff9]",
      hover: "hover:border-[#91dec0] hover:bg-[#f2fff9]",
    },
    {
      value: "invoice",
      label: "Invoice",
      helper: "Bills and line items",
      icon: "bg-[#fff3ea] text-[#dd6d2f]",
      selected: "border-[#f0c09f] bg-[#fff9f4]",
      hover: "hover:border-[#f0c09f] hover:bg-[#fff9f4]",
    },
    {
      value: "receipt",
      label: "Receipt",
      helper: "Merchant and total",
      icon: "bg-[#fff4eb] text-[#c95b1f]",
      selected: "border-[#f0c09f] bg-[#fff9f4]",
      hover: "hover:border-[#f0c09f] hover:bg-[#fff9f4]",
    },
    {
      value: "bank_statement",
      label: "Bank statement",
      helper: "Text + transactions",
      icon: "bg-[#eef5ff] text-[#3275d5]",
      selected: "border-[#a9c9f5] bg-[#f5f9ff]",
      hover: "hover:border-[#a9c9f5] hover:bg-[#f5f9ff]",
    },
    {
      value: "notes",
      label: "Notes",
      helper: "Handwritten pages",
      icon: "bg-[#f4efff] text-[#7755d8]",
      selected: "border-[#c6b5f4] bg-[#faf8ff]",
      hover: "hover:border-[#c6b5f4] hover:bg-[#faf8ff]",
    },
  ] as const

  const handleModeChange = (mode: typeof modeOptions[number]["value"]) => {
    onDocumentModeChange?.(mode)
    onOutputModeChange(mode === "notes" ? "text" : "table")
  }

  return (
    <div className="space-y-4">
      <ResumeBatchBanner
        latestRecoverableJob={latestRecoverableJob}
        recoveryLoading={recoveryLoading}
        onContinueLatestJob={onContinueLatestJob}
      />
      <WorkspaceErrorBanner banner={banner} onDismiss={onDismissBanner} />

      <div className="space-y-3">
        <div className="grid gap-4">
          {!hasResults ? (
            <div className="space-y-5">
              <section>
                <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground">Tools</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {modeOptions.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => handleModeChange(mode.value)}
                      disabled={isProcessing}
                      className={cn(
                        "flex h-[84px] items-center gap-3 rounded-xl border border-border bg-card px-4 text-left shadow-xs transition-colors",
                        mode.hover,
                        selectedMode === mode.value
                          ? mode.selected
                          : "text-foreground",
                        isProcessing && "cursor-not-allowed opacity-60"
                      )}
                    >
                      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", mode.icon)}>
                        <ModeGlyph mode={mode.value} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold">{mode.label}</span>
                        <span className="mt-0.5 block truncate text-[13px] font-medium text-muted-foreground">
                          {mode.helper}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {(documentMode === "notes"
                    ? [
                        { value: "text", label: "Readable text" },
                        { value: "table", label: "Detected table XLSX" },
                        { value: "csv", label: "Detected table CSV" },
                      ]
                    : [
                        { value: "table", label: "Excel XLSX" },
                        { value: "csv", label: "CSV" },
                      ]
                  ).map((format) => (
                    <button
                      key={format.value}
                      type="button"
                      onClick={() => onOutputModeChange(format.value as OutputMode)}
                      disabled={isProcessing}
                      className={cn(
                        "h-9 rounded-md border px-3 text-sm font-medium transition-colors",
                        outputMode === format.value
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                        isProcessing && "cursor-not-allowed opacity-60"
                      )}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </section>

              <UploadDropzone
                uploadedFiles={uploadedFiles}
                filePreviewUrls={filePreviewUrls}
                pdfPageCounts={pdfPageCounts}
                isDragging={isDragging}
                isProcessing={isProcessing}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onFileInput={onFileInput}
                onRemoveFile={onRemoveFile}
                onClearFiles={onClearFiles}
              />

              {uploadedFiles.length || isUploading || isProcessing ? (
                <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
                  {uploadedFiles.length ? (
                    <div>
                      <p className="text-sm font-semibold text-foreground">{uploadedFiles.length} selected</p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {expectedOutputs} expected output{expectedOutputs === 1 ? "" : "s"} - {formatBytes(uploadedSizeMb * 1024 * 1024)}
                      </p>
                    </div>
                  ) : <span />}
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {(isUploading || isProcessing) && !isComplete ? (
                      <Button
                        variant="outline"
                        onClick={onCancel}
                        className="h-10 rounded-md border-border bg-card px-4 text-foreground hover:bg-accent"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    ) : null}
                    <Button
                      variant="glossy"
                      size="lg"
                      onClick={onConvert}
                      disabled={!uploadedFiles.length || isProcessing || noCredits}
                      className="h-11 gap-2 rounded-xl px-6 font-semibold"
                    >
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      {isProcessing ? "Converting" : processLabel}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-4">
            <AutoDetectionPanel
              documents={classifiedDocuments}
              overridingDocumentId={overridingDocumentId}
              onOverrideDocumentMode={onOverrideDocumentMode}
            />
            <ResultActions
              resultFiles={resultFiles}
              isComplete={isComplete}
              outputMode={outputMode}
              onOutputModeChange={onOutputModeChange}
              documentMode={documentMode}
              isTextOutput={isTextOutput}
              isSaving={isSaving}
              isSaved={isSaved}
              tablePreviewData={tablePreviewData}
              textPreview={textPreview}
              resultPreviews={resultPreviews}
              firstImageUrl={firstImageUrl}
              activePreviewFileId={activePreviewFileId}
              onReset={onReset}
              onSaveToHistory={onSaveToHistory}
              onShareFile={onShareFile}
              onShareAll={onShareAll}
              onDownloadFile={onDownloadFile}
              onDownloadAll={onDownloadAll}
              onDownloadReviewedBatch={onDownloadReviewedBatch}
              onDeleteDocument={onDeleteDocument}
              onDeleteBatch={onDeleteBatch}
              onEditFile={onEditFile}
              onPersistCellEdit={onPersistCellEdit}
              onPersistStructuredEdit={onPersistStructuredEdit}
              onMarkDocumentReady={onMarkDocumentReady}
              onSendToAccountsPayable={onSendToAccountsPayable}
              onOverrideDuplicateWarning={onOverrideDuplicateWarning}
              onSaveVendorRule={onSaveVendorRule}
              quickBooksConnection={quickBooksConnection}
              quickBooksReferences={quickBooksReferences}
              onRefreshQuickBooksReferences={onRefreshQuickBooksReferences}
              onPublishReceipt={onPublishReceipt}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

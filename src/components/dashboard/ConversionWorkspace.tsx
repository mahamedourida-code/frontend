"use client"

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent, type MouseEvent as ReactMouseEvent } from "react"
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderUp,
  Hash,
  Inbox,
  Keyboard,
  Landmark,
  Languages,
  Layers,
  ListChecks,
  Loader2,
  Percent,
  ReceiptText,
  RotateCcw,
  Save,
  ScanLine,
  Share2,
  Sparkles,
  Table2,
  Tag,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { InlineAction } from "@/components/ui/inline-action"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BankReconciliationPanel } from "@/components/dashboard/BankReconciliationPanel"
import { ConfidenceDot, ConfidenceLegend } from "@/components/dashboard/ConfidenceDot"
import { AnomalyChip, type AnomalyTone } from "@/components/dashboard/AnomalyChip"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { SegmentedTabs } from "@/components/dashboard/SegmentedTabs"
import { Field } from "@/components/dashboard/Field"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { InboxSummaryStrip } from "@/components/dashboard/InboxSummaryStrip"
import { FIELD_LABEL, workspaceStage } from "@/lib/review-vocab"
import { vatCheck } from "@/lib/bookkeeper-copy"
import { Symbol } from "@/components/dashboard/Symbol"
import { HandwrittenBadge } from "@/components/dashboard/HandwrittenBadge"
import { ProcessingScanOverlay } from "@/components/dashboard/ProcessingScanOverlay"
import { SourceHighlightOverlay } from "@/components/dashboard/SourceHighlightOverlay"
import { ProgressiveUploadSheet } from "@/components/dashboard/upload/ProgressiveUploadSheet"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useMotionTokens } from "@/lib/motion"
import { duplicateCopy } from "@/lib/anomaly-reasons"
import { buildCardSummary } from "@/lib/card-summary"
import { fieldAttention } from "@/lib/field-attention"
import { reconciliationTotalCopy } from "@/lib/source-highlight"
import { getRowConfidenceTier, isHandwrittenDocument } from "@/lib/handwritten"
import {
  columnLabel,
  detectInvoiceLanguage,
  fieldLabel,
  invoiceLanguageName,
  readInvoiceAutoDetect,
  readInvoiceLanguage,
  writeInvoiceLanguage,
  type InvoiceLanguage,
} from "@/lib/invoice-schema"
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
type ResultFile = {
  file_id?: string
  filename?: string
  size_bytes?: number
  input_preview_url?: string
  document_id?: string
  draft_bill_item_id?: string
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

const workspacePrimaryControlClass =
  "border border-[var(--workspace-primary)] bg-[var(--workspace-primary)] text-white hover:border-[var(--workspace-primary-hover)] hover:bg-[var(--workspace-primary-hover)] focus-visible:ring-[var(--workspace-primary)]/20"
const workspaceNormalControlClass =
  "border border-[var(--workspace-button-border)] bg-white text-[var(--workspace-ink)] hover:border-[var(--workspace-primary)] hover:bg-[var(--workspace-blue-soft)] hover:text-[var(--workspace-primary)] focus-visible:ring-[var(--workspace-primary)]/20"
const workspacePanelSurfaceClass =
  "border-[var(--workspace-border)] bg-[var(--workspace-soft)]"

type ConversionWorkspaceProps = {
  banner?: WorkspaceBanner | null
  onDismissBanner?: () => void
  latestRecoverableJob?: RecoverableJob | null
  recoveryLoading?: boolean
  onContinueLatestJob?: () => void
  uploadedFiles: File[]
  workspaceId?: string
  selectedCompanyId: string
  onSelectedCompanyIdChange: (companyId: string) => void
  filePreviewUrls: Record<number, string>
  pdfPageCounts: Record<number, number>
  isDragging: boolean
  outputMode: OutputMode
  onOutputModeChange: (mode: OutputMode) => void
  documentMode?: DocumentMode
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

function InvoiceDraftBillAction({
  file,
  onSendToAccountsPayable,
  stopPropagation = false,
  className,
}: {
  file: ResultFile
  onSendToAccountsPayable?: (file: ResultFile) => void | Promise<void>
  stopPropagation?: boolean
  className?: string
}) {
  if (file.document_type !== "invoice" || !["ready", "published"].includes(file.review_status || "")) return null

  const stopCardClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (stopPropagation) event.stopPropagation()
  }

  if (file.draft_bill_item_id) {
    return (
      <InlineAction asChild className={className}>
        <a href="/dashboard/accounts-payable" onClick={stopCardClick}>
          Open draft bills
        </a>
      </InlineAction>
    )
  }

  if (!onSendToAccountsPayable) return null

  return (
    <InlineAction
      onClick={(event) => {
        stopCardClick(event)
        void onSendToAccountsPayable(file)
      }}
      className={className}
    >
      Send to draft bills
    </InlineAction>
  )
}

function WorkspaceErrorBanner({ banner, onDismiss }: { banner?: WorkspaceBanner | null; onDismiss?: () => void }) {
  if (!banner) return null

  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-md border p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between",
        banner.tone === "error" && "border-rose-200 bg-rose-50/88 text-rose-950",
        banner.tone === "warning" && "border-amber-200 bg-amber-50/88 text-amber-950",
        (!banner.tone || banner.tone === "info") && "border-[var(--button-warm-ring)] bg-[var(--button-warm)] text-foreground"
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
          <Button variant="surface" onClick={banner.onAction} className="h-9 px-4">
            {banner.actionLabel}
          </Button>
        ) : null}
        {onDismiss ? (
          <Button variant="ghost" size="icon" onClick={onDismiss} className="h-10 w-10">
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
    <WorkspaceSection title="Detected document types" icon={<ScanLine />}>
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {autoDocuments.map(document => {
          const detected = document.detected_mode
          const needsSelection = !document.resolved_mode
          const manuallySelected = detected === "needs_manual_selection" && Boolean(document.resolved_mode)
          const selectedMode = choices[document.id]
            || document.resolved_mode
            || (detected && detected !== "needs_manual_selection" ? detected : "table")
          const busy = overridingDocumentId === document.id

          return (
            <div key={document.id} className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{document.original_filename}</p>
                <div className="mt-2">
                  {needsSelection ? (
                    <StatusBadge tone="review">Needs review</StatusBadge>
                  ) : (
                    <StatusBadge tone="success">
                      {labels[document.resolved_mode as ResolvedDocumentMode]}
                      {manuallySelected ? " selected" : ""}
                    </StatusBadge>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
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
                  variant="surface"
                  disabled={busy || (!needsSelection && selectedMode === document.resolved_mode)}
                  onClick={() => onOverrideDocumentMode?.(document.id, selectedMode)}
                  className="h-9 px-3"
                >
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {needsSelection ? "Process" : "Apply"}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </WorkspaceSection>
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
    <div className={cn("mb-3 flex flex-col gap-3 rounded-md border p-3 text-foreground sm:flex-row sm:items-center sm:justify-between", workspacePanelSurfaceClass)}>
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold">Return to unfinished batch</p>
          <p className="text-xs text-muted-foreground">
            {latestRecoverableJob.processed_images || 0} of {latestRecoverableJob.total_images || 0} files processed
          </p>
        </div>
      </div>
      <InlineAction
        onClick={onContinueLatestJob}
        disabled={recoveryLoading}
        className="shrink-0"
      >
        {recoveryLoading ? "Resuming..." : "Open batch"}
      </InlineAction>
    </div>
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
  const m = useMotionTokens()

  return (
    <>
    <motion.div
      id="upload-files"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      animate={
        m.reduced
          ? {}
          : {
              scale: isDragging ? 1.008 : 1,
              boxShadow: isDragging
                ? "0 0 0 4px rgba(6,78,59,0.16), 0 18px 40px -24px rgba(6,78,59,0.45)"
                : "0 0 0 0 rgba(6,78,59,0)",
            }
      }
      transition={m.spring}
      className={cn(
        "relative overflow-hidden rounded-md border border-dashed transition-colors duration-200",
        isDragging ? "border-[var(--brand-brown-fg)] bg-[var(--brand-clay)]" : "border-[var(--button-warm-ring)] bg-[var(--button-warm)] hover:border-black"
      )}
    >
      <div className={cn("px-4 py-5 text-center sm:px-6", uploadedFiles.length ? "min-h-[240px]" : "flex min-h-[420px] flex-col items-center justify-center")}>
        {!uploadedFiles.length ? (
          <Symbol
            name="firstsight-workspace-launcher"
            size="hero"
            className="mx-auto mb-5 h-56 w-56 sm:h-72 sm:w-72"
            alt=""
          />
        ) : (
          <FolderUp className="mx-auto mb-3 h-7 w-7 text-[var(--brand-brown-fg)]" />
        )}
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          {isDragging ? "Drop documents to upload" : uploadedFiles.length ? "Add more documents" : "Upload documents"}
        </h3>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground">
          Drag in a folder, or select scans, photos and PDFs.
        </p>
        {!uploadedFiles.length ? (
          <div className="mt-4 flex flex-col items-center gap-1.5">
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {(["invoice", "receipt", "bank-statement", "spreadsheet", "handwritten-note"] as const).map((n) => (
                <Symbol key={n} name={n} size="medium" className="h-16 w-16 sm:h-20 sm:w-20" alt="" />
              ))}
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Invoices · Receipts · Bank statements · Tables · Handwriting
            </span>
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <label
            htmlFor="workspace-file-upload"
            className={cn(
              buttonVariants({ variant: "glossy", size: "default" }),
              "h-9 cursor-pointer px-4 font-medium",
              workspacePrimaryControlClass,
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
              variant="surface"
              onClick={onClearFiles}
              disabled={isProcessing}
              className="h-9 px-4"
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
          <motion.div
            variants={m.staggerParent()}
            initial="hidden"
            animate="show"
            className="mx-auto mt-5 max-w-3xl divide-y divide-[var(--button-warm-ring)] overflow-hidden rounded-md border border-[var(--button-warm-ring)] bg-white text-left"
          >
            <AnimatePresence initial={false}>
            {uploadedFiles.map((file, index) => {
              const pdf = isPdfFile(file)
              const pageCount = pdfPageCounts[index]
              const previewUrl = filePreviewUrls[index]
              return (
                <motion.div
                  key={`${file.name}-${file.size}-${index}`}
                  layout
                  variants={m.fadeUp}
                  exit="exit"
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (previewUrl) setSelectedPreview({ url: previewUrl, name: file.name })
                    }}
                    disabled={!previewUrl}
                    className="ax-interactive flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--button-warm)] text-[var(--brand-brown-fg)]">
                      {pdf ? <FileText className="h-4 w-4" /> : <FileImage className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">{file.name}</span>
                      <span className="mt-0.5 block truncate text-xs font-medium text-muted-foreground">
                      {pdf ? `${pageCount ? `${pageCount} page${pageCount === 1 ? "" : "s"}` : "PDF"}` : "Image"} - {formatBytes(file.size)}
                      </span>
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onRemoveFile(index)
                      setSelectedPreview(null)
                    }}
                    disabled={isProcessing}
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              )
            })}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
      <AnimatePresence>
      {selectedPreview ? (
        <motion.div
          key="file-preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={m.tFast}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#111827]/50 p-4 backdrop-blur-xl"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPreview(null)
          }}
        >
          <motion.div
            variants={m.fadeScale}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn("w-full max-w-4xl overflow-hidden rounded-md border p-4", workspacePanelSurfaceClass)}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-foreground">{selectedPreview.name}</p>
              <Button
                type="button"
                size="sm"
                variant="surface"
                onClick={() => setSelectedPreview(null)}
                className="h-9 px-3"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex max-h-[78vh] items-center justify-center overflow-hidden rounded-lg bg-white">
              <img src={selectedPreview.url} alt={selectedPreview.name} className="max-h-[78vh] w-full object-contain" />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
      </AnimatePresence>
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
    <div className={cn("rounded-md border p-3 backdrop-blur-xl", workspacePanelSurfaceClass)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Selected files</p>
        <Button
          size="sm"
          variant="surface"
          onClick={onClearFiles}
          disabled={isProcessing}
          className="h-8 px-3"
        >
          Clear
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {uploadedFiles.map((file, index) => {
          const pdf = isPdfFile(file)
          const pageCount = pdfPageCounts[index]
          const previewUrl = filePreviewUrls[index]
          const canPreview = Boolean(previewUrl)
          return (
            <div
              key={`${file.name}-${file.size}-${index}`}
              role={canPreview ? "button" : undefined}
              tabIndex={canPreview ? 0 : undefined}
              onClick={() => {
                if (previewUrl) setSelectedPreview({ url: previewUrl, name: file.name })
              }}
              onKeyDown={(event) => {
                if (!previewUrl) return
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setSelectedPreview({ url: previewUrl, name: file.name })
                }
              }}
              className={cn(
                "group rounded-lg border border-[var(--button-warm-ring)] bg-white p-2 outline-none transition-colors",
                canPreview
                  ? "cursor-pointer hover:border-black hover:bg-[var(--button-warm)] focus-visible:ring-2 focus-visible:ring-black/20"
                  : "cursor-default"
              )}
            >
              <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-lg border border-border bg-white">
                {previewUrl ? (
                  <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {pdf ? <FileText className="h-5 w-5 text-[var(--brand-brown-fg)]" /> : <FileImage className="h-5 w-5 text-[var(--brand-brown-fg)]" />}
                  </div>
                )}
                {isProcessing ? <ProcessingScanOverlay /> : null}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemoveFile(index)
                    setSelectedPreview(null)
                  }}
                  disabled={isProcessing}
                  className="absolute right-1 top-1 h-7 w-7 bg-white/90 text-foreground opacity-0 backdrop-blur transition-opacity hover:bg-black hover:text-white group-hover:opacity-100"
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
          <div className={cn("w-full max-w-4xl overflow-hidden rounded-md border p-4", workspacePanelSurfaceClass)}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-foreground">{selectedPreview.name}</p>
              <Button
                size="sm"
                variant="surface"
                onClick={() => setSelectedPreview(null)}
                className="h-9 px-3"
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
  const [splitRatio, setSplitRatio] = useState(50)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isWideRef = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)")
    isWideRef.current = mq.matches
    const onChange = (e: MediaQueryListEvent) => { isWideRef.current = e.matches }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const onHandleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isWideRef.current) return
    e.preventDefault()
    setIsResizing(true)
    document.body.style.userSelect = "none"
    document.body.style.cursor = "col-resize"

    const container = containerRef.current
    if (!container) return

    const onMouseMove = (ev: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const ratio = ((ev.clientX - rect.left) / rect.width) * 100
      setSplitRatio(Math.min(75, Math.max(25, ratio)))
    }

    const onMouseUp = () => {
      setIsResizing(false)
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }, [])

  if (!isComplete || !resultFiles?.length) {
    return (
      <WorkspaceSection title="Review board" icon={<Eye />}>
        <div className="flex min-h-[200px] flex-col justify-between gap-6">
          <div className="grid gap-2">
            <div className="h-9 rounded-md bg-[var(--workspace-soft)]" />
            <div className="h-9 w-4/5 rounded-md bg-[var(--workspace-soft)]" />
            <div className="h-9 w-3/5 rounded-md bg-[var(--workspace-soft)]" />
          </div>
        </div>
      </WorkspaceSection>
    )
  }

  return (
    <>
    <WorkspaceSection title="Review board" icon={<Eye />} contentClassName="p-3 sm:p-3">
      <div
        ref={containerRef}
        className="flex min-h-[290px] gap-0 xl:gap-0"
      >
        {firstImageUrl ? (
          <>
            {/* Before pane */}
            <div
              className="min-w-0 xl:overflow-hidden"
              style={{
                width: isWideRef.current ? `${splitRatio}%` : "100%",
                transition: isResizing ? "none" : "width 150ms ease",
                flexShrink: 0,
              }}
            >
              <p className="mb-2 text-[13px] font-semibold text-foreground">Before</p>
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
                className="flex min-h-[260px] cursor-zoom-in items-center justify-center overflow-hidden rounded-lg border border-[var(--button-warm-ring)] bg-white outline-none transition hover:border-black hover:bg-[var(--button-warm)] focus-visible:ring-2 focus-visible:ring-black/20"
              >
                <img src={firstImageUrl} alt="Original uploaded file" className="max-h-[420px] w-full object-contain" />
              </div>
            </div>

            {/* Drag handle — only visible on xl+ */}
            <div
              onMouseDown={onHandleMouseDown}
              className="group hidden cursor-col-resize flex-col items-center justify-center px-1 xl:flex"
              aria-hidden
            >
              <div className={cn(
                "flex h-full w-2 flex-col items-center justify-center gap-1 rounded-sm transition-colors duration-150",
                isResizing ? "bg-accent/50" : "hover:bg-accent/30"
              )}>
                <span className="size-0.5 rounded-full bg-muted-foreground/40" />
                <span className="size-0.5 rounded-full bg-muted-foreground/40" />
                <span className="size-0.5 rounded-full bg-muted-foreground/40" />
                <span className="size-0.5 rounded-full bg-muted-foreground/40" />
                <span className="size-0.5 rounded-full bg-muted-foreground/40" />
                <span className="size-0.5 rounded-full bg-muted-foreground/40" />
              </div>
            </div>

            {/* After pane */}
            <div className="hidden min-w-0 flex-1 xl:block">
              <p className="mb-2 text-[13px] font-semibold text-foreground">After</p>
              <div className="max-h-[420px] min-h-[260px] overflow-auto rounded-lg border border-border bg-white">
                {isTextOutput || textPreview ? (
                  <pre className="min-h-[260px] whitespace-pre-wrap p-4 text-sm font-medium leading-6 text-gray-950">
                    {textPreview || "Text preview is loading..."}
                  </pre>
                ) : tablePreviewData.length ? (
                  <table className="w-full border-collapse text-sm text-gray-950">
                    <tbody>
                      {tablePreviewData.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex === 0 ? "bg-[var(--button-warm)] font-semibold text-foreground" : "bg-white"}>
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
          </>
        ) : (
          /* No image — full-width after pane */
          <div className="flex-1">
            <p className="mb-2 text-[13px] font-semibold text-foreground">After</p>
            <div className="max-h-[420px] min-h-[260px] overflow-auto rounded-lg border border-border bg-white">
              {isTextOutput || textPreview ? (
                <pre className="min-h-[260px] whitespace-pre-wrap p-4 text-sm font-medium leading-6 text-gray-950">
                  {textPreview || "Text preview is loading..."}
                </pre>
              ) : tablePreviewData.length ? (
                <table className="w-full border-collapse text-sm text-gray-950">
                  <tbody>
                    {tablePreviewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex === 0 ? "bg-[var(--button-warm)] font-semibold text-foreground" : "bg-white"}>
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
        )}
      </div>

      {/* After pane stacked below Before on small screens */}
      {firstImageUrl && (
        <div className="mt-3 xl:hidden">
          <p className="mb-2 text-[13px] font-semibold text-foreground">After</p>
          <div className="max-h-[420px] min-h-[260px] overflow-auto rounded-lg border border-border bg-white">
            {isTextOutput || textPreview ? (
              <pre className="min-h-[260px] whitespace-pre-wrap p-4 text-sm font-medium leading-6 text-gray-950">
                {textPreview || "Text preview is loading..."}
              </pre>
            ) : tablePreviewData.length ? (
              <table className="w-full border-collapse text-sm text-gray-950">
                <tbody>
                  {tablePreviewData.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex === 0 ? "bg-[var(--button-warm)] font-semibold text-foreground" : "bg-white"}>
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
      )}
    </WorkspaceSection>
      {imagePreviewOpen && firstImageUrl ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#111827]/50 p-4 backdrop-blur-xl"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setImagePreviewOpen(false)
          }}
        >
          <div className={cn("w-full max-w-4xl overflow-hidden rounded-md border p-4", workspacePanelSurfaceClass)}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-foreground">{resultFiles[0]?.filename || "Input preview"}</p>
              <Button
                size="sm"
                variant="surface"
                onClick={() => setImagePreviewOpen(false)}
                className="h-9 px-3"
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

function activeDuplicateWarnings(file: ResultFile) {
  return (file.duplicate_warnings || []).filter(warning => !warning.overridden)
}

/**
 * C14 — scale review depth by stakes. Invoices whose total lands at/above this
 * amount auto-expand with full source evidence and a soft "high value" cue,
 * even when they're otherwise clean; smaller clean ones still collapse to a
 * one-line confirm (C4). Pure presentation over the already-extracted total —
 * no new model, no backend call. Edit this single constant to retune the bar.
 * (Radiology: more depth when the stakes are higher.)
 */
const HIGH_VALUE_THRESHOLD = 5000

/** Parse a numeric magnitude out of a display amount like "USD 1,240.50". */
function parseAmountValue(amount: unknown): number | null {
  if (amount === undefined || amount === null) return null
  const parsed = Number(String(amount).replace(/[^\d.-]/g, ""))
  return Number.isNaN(parsed) ? null : Math.abs(parsed)
}

/** True when the document's total reads at/above the high-value threshold. */
function isHighValue(file: ResultFile): boolean {
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
function deriveReviewLevel(file: ResultFile, badge: ReturnType<typeof getOutputBadge>): {
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

const vendorRuleInputs: Array<{ key: keyof VendorRuleFields; label: string; placeholder: string; icon: React.ReactNode }> = [
  { key: "category_account", label: "Category / account", placeholder: "Office supplies", icon: <DollarSign /> },
  { key: "tax_code", label: "Tax code", placeholder: "VAT 20%", icon: <Percent /> },
  { key: "currency", label: "Currency", placeholder: "USD", icon: <Tag /> },
  { key: "payment_terms", label: "Payment terms", placeholder: "Net 30", icon: <CreditCard /> },
  { key: "destination_treatment", label: "Destination", placeholder: "Draft bill", icon: <Building2 /> },
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

// Maps a detected document type to its raw caricature symbol in /public/symbols.
const DOCUMENT_TYPE_SYMBOL: Record<string, string> = {
  invoice: "invoice",
  receipt: "receipt",
  bank_statement: "bank-statement",
  notes: "handwritten-note",
  table: "spreadsheet",
}
function documentTypeSymbol(type?: string): string | undefined {
  return DOCUMENT_TYPE_SYMBOL[type || ""]
}

function reviewData(file: ResultFile) {
  return file.reviewed_data && typeof file.reviewed_data === "object" ? file.reviewed_data : {}
}

function resultSummary(file: ResultFile) {
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

type BookkeeperFigures = { currency?: any; subtotal?: any; vat?: any; total?: any }

// C16 — the bookkeeper breakdown: Net / VAT / Total surfaced from the extracted
// fields plus a one-glance reconciliation chip (vatCheck). Reuses AnomalyChip so
// it matches the rest of the board; only renders for invoice/receipt docs.
function BookkeeperBreakdown({ figures, layout = "row" }: { figures: BookkeeperFigures; layout?: "row" | "grid" }) {
  const currency = figures.currency ? String(figures.currency) : ""
  const fmt = (value: any) => (value === undefined || value === null || value === "" ? "-" : [currency, value].filter(Boolean).join(" "))
  const check = vatCheck(figures.subtotal, figures.vat, figures.total)
  // vatCheck's "neutral" maps onto AnomalyChip's caution (no plain neutral tone).
  const chipTone: AnomalyTone = check.tone === "good" ? "good" : "caution"
  const cells: Array<[string, string]> = [
    [FIELD_LABEL.net, fmt(figures.subtotal)],
    [FIELD_LABEL.vat, fmt(figures.vat)],
    [FIELD_LABEL.gross, fmt(figures.total)],
  ]
  // The leading symbol speaks the reconciliation verdict at a glance: a
  // balanced "=" when Net+VAT ties to Total, a variance mark when it doesn't,
  // and the plain VAT chip when we can't check (missing figures).
  const verdictSymbol =
    check.state === "ok" ? "code-balanced-equals" : check.state === "mismatch" ? "code-variance" : "code-vat-chip"
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", layout === "grid" && "w-full")}>
      <Symbol name={verdictSymbol} size="inline" className="h-14 w-14 shrink-0" alt="" />
      {cells.map(([label, value]) => (
        <span key={label} className="inline-flex items-baseline gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-foreground">{label}</span>
          <span className="text-[13px] font-semibold tabular-nums text-foreground">{value}</span>
        </span>
      ))}
      <AnomalyChip
        tone={chipTone}
        title={check.label}
        reason={check.detail}
        label={check.state === "ok" ? `✓ ${check.label}` : check.label}
        className="h-5 shrink-0"
      />
    </div>
  )
}

function structuredRows(file: ResultFile, language: InvoiceLanguage = "en"): { columns: string[]; rows: any[][]; pathRoot?: string } | null {
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

function structuredRowPaths(file: ResultFile) {
  if (file.document_type === "invoice" || file.document_type === "receipt") {
    return ["description", "quantity", "unit_price", "tax_rate", "line_total"]
  }
  if (file.document_type === "bank_statement") {
    return ["date", "description", "reference", "debit", "credit", "balance"]
  }
  return []
}

function structuredFields(file: ResultFile, language: InvoiceLanguage = "en"): Array<{ label: string; path: string; value: string }> {
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

function ResultThumb({ file, preview, isTextOutput, compact = false }: { file: ResultFile; preview?: ResultPreview; isTextOutput: boolean; compact?: boolean }) {
  const summary = resultSummary(file)
  const structured = structuredRows(file)
  const height = compact ? "min-h-[196px]" : "min-h-[255px]"
  if (preview?.loading) {
    return (
      <div className={cn("flex h-full items-center justify-center rounded-md border border-[var(--button-warm-ring)] bg-white", height)}>
        <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-brown-fg)]" />
      </div>
    )
  }

  if (isTextOutput || preview?.text) {
    const lines = (preview?.text || "").split(/\r?\n/).filter(Boolean).slice(0, 5)
    return (
      <div className={cn("flex h-full flex-col gap-2 overflow-hidden rounded-md border border-[var(--button-warm-ring)] bg-white p-4", height)}>
        {lines.length ? lines.map((line, index) => (
          <span key={index} className="truncate text-xs font-semibold text-gray-700">
            {line}
          </span>
        )) : (
          <span className="text-[10px] font-semibold text-foreground">Text output</span>
        )}
      </div>
    )
  }

  if (structured) {
    const rows = structured.rows.slice(0, compact ? 3 : 5)
    return (
      <div className={cn("overflow-hidden rounded-md border border-[var(--button-warm-ring)] bg-white", height)}>
        <div className="grid grid-cols-2 border-b border-[var(--button-warm-ring)] bg-[var(--button-warm)] px-3 py-2 text-[11px] font-semibold text-foreground">
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
    <div className={cn("h-full overflow-hidden rounded-md border border-[var(--button-warm-ring)] bg-white", height)}>
      <div className="grid grid-cols-4 bg-[var(--brand-brown-fg)]">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className="h-5 border-r border-white/20 last:border-r-0" />
        ))}
      </div>
      {rows.length ? rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 border-b border-[var(--button-warm-ring)] last:border-b-0">
          {Array.from({ length: 4 }).map((_, cellIndex) => (
            <span key={cellIndex} className="truncate border-r border-[var(--button-warm-ring)] px-3 py-2 text-xs font-medium text-gray-800 last:border-r-0">
              {row?.[cellIndex] || " "}
            </span>
          ))}
        </div>
      )) : (
        <div className="grid gap-1.5 p-3">
          <div className="h-2 rounded bg-[var(--button-warm)]" />
          <div className="h-2 w-4/5 rounded bg-[var(--button-warm)]" />
          <div className="h-2 w-3/5 rounded bg-[var(--button-warm)]" />
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
  // C2 — source highlighting: the field value currently hovered/focused, so we
  // can text-match it against the document and float a source excerpt.
  const [activeSource, setActiveSource] = useState<{ value: string; label: string } | null>(null)
  // C3 — "Review only the uncertain fields": when on, the field grid collapses
  // the confident fields and shows only the few that need the user. null = use
  // the per-document default (on when there ARE uncertain fields). false/true =
  // the user's explicit choice for the currently open document.
  const [onlyUncertain, setOnlyUncertain] = useState<boolean | null>(null)
  // C3 — fields the user has confirmed in-place this session, so a confirmed
  // field drops out of the "needs you" set without waiting on a round-trip.
  const [confirmedFields, setConfirmedFields] = useState<Record<string, true>>({})
  const prefersReducedMotion = useReducedMotion()
  const [editedTables, setEditedTables] = useState<Record<string, any[][]>>({})
  const [resultFilter, setResultFilter] = useState<ResultFilter>("needs_review")
  // C4 — clean/high-confidence cards collapse to a one-line summary; this set
  // holds the keys of clean cards the reviewer has chosen to expand in place.
  const [expandedClean, setExpandedClean] = useState<Record<string, true>>({})
  // C5 — keyboard-first triage: the "?" shortcuts sheet + the "mark all ready"
  // sweep over the collapsed clean pile.
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [bulkReadyBusy, setBulkReadyBusy] = useState(false)
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
  // P10 — invoice schema language (display labels only)
  const [invoiceLanguage, setInvoiceLanguage] = useState<InvoiceLanguage>("en")
  const [dismissedLanguageSuggestion, setDismissedLanguageSuggestion] = useState<InvoiceLanguage | null>(null)
  useEffect(() => {
    setInvoiceLanguage(readInvoiceLanguage())
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent).detail as InvoiceLanguage
      if (detail) setInvoiceLanguage(detail)
    }
    window.addEventListener("invoice-schema-language", onChange)
    return () => window.removeEventListener("invoice-schema-language", onChange)
  }, [])
  const safeResultFiles = (resultFiles || []).filter(file => file.review_status !== "deleted")

  useEffect(() => {
    if (!safeResultFiles.length) return

    const hasReviewFiles = safeResultFiles.some((file) => {
      const badge = getOutputBadge(file)
      return badge.state === "needs_review"
    })
    const hasReadyFiles = safeResultFiles.some((file) => getOutputBadge(file).state === "ready")
    const hasFailedFiles = safeResultFiles.some((file) => getOutputBadge(file).state === "failed")

    setResultFilter(hasReviewFiles ? "needs_review" : hasReadyFiles ? "ready" : hasFailedFiles ? "failed" : "all")
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
  const comparisonFields = comparisonFile ? structuredFields(comparisonFile, invoiceLanguage) : []
  const comparisonRows = comparisonFile ? structuredRows(comparisonFile, invoiceLanguage) : null
  const comparisonHandwritten = comparisonFile ? isHandwrittenDocument(comparisonFile) : false
  const comparisonRowPaths = comparisonFile ? structuredRowPaths(comparisonFile) : []
  const comparisonSummary = comparisonFile ? resultSummary(comparisonFile) : null
  // P10 — suggest a schema language when auto-detect finds non-English tax fields.
  const suggestedLanguage = comparisonFile && readInvoiceAutoDetect()
    ? detectInvoiceLanguage(reviewData(comparisonFile))
    : null
  const showLanguageSuggestion = Boolean(
    suggestedLanguage &&
    suggestedLanguage !== invoiceLanguage &&
    suggestedLanguage !== dismissedLanguageSuggestion,
  )
  const comparisonText = comparisonLoaded ? textPreview : ""
  // C2 — the document's own OCR/markdown text we text-match field values
  // against. Prefer the rendered text preview; fall back to any source text
  // stored on the reviewed data (notes / bank statements). Empty → no boxes.
  const comparisonSourceText = (() => {
    if (!comparisonFile) return ""
    const data = reviewData(comparisonFile)
    const stored = typeof data.readable_text === "string"
      ? data.readable_text
      : typeof data.raw_text === "string"
        ? data.raw_text
        : ""
    return [comparisonText, stored].filter(Boolean).join("\n")
  })()
  // C2 — "why" for a flagged total (line items vs. stated total), reusing the
  // C7 anomaly-chip voice. Null when it reconciles or can't be checked.
  const comparisonTotalCopy = comparisonFile ? reconciliationTotalCopy(reviewData(comparisonFile)) : null
  // C3 — per-field attention: empty / "not found" fields and the flagged total
  // are the ones that "need you". `attention` is keyed by field path so the
  // render can decide visibility, confirm state, and the "why" reason.
  const fieldAttentionByPath: Record<string, ReturnType<typeof fieldAttention>> = {}
  comparisonFields.forEach((field) => {
    const flagged = field.path === "total" ? comparisonTotalCopy : null
    fieldAttentionByPath[field.path] = fieldAttention(field, flagged)
  })
  const uncertainFieldPaths = comparisonFields
    .filter((field) => fieldAttentionByPath[field.path]?.needsReview && !confirmedFields[field.path])
    .map((field) => field.path)
  const uncertainCount = uncertainFieldPaths.length
  // Default the toggle on only when there is something to triage; honour the
  // user's explicit choice once they've made one for this document.
  const collapseConfident = onlyUncertain === null ? uncertainCount > 0 : onlyUncertain
  const comparisonColumnCount = Math.max(1, ...comparisonTable.map(row => row.length))
  const editedCount = Object.keys(editedTables).length
  const unresolvedDuplicateCount = safeResultFiles.reduce(
    (total, file) => total + activeDuplicateWarnings(file).length,
    0,
  )
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
  // C18 — the inbox strip's piles, bucketed by the shared bookkeeper lifecycle
  // so the workspace counts read the same as the AP queue. Processing counts any
  // file still in flight; everything else falls into needs you / ready / published.
  const inboxCounts = resultEntries.reduce(
    (counts, entry) => {
      const raw = entry.file.review_status || entry.file.status
      if (raw === "processing" || raw === "pending" || raw === "queued") {
        counts.processing += 1
        return counts
      }
      const stage = workspaceStage(entry.file.review_status)
      if (stage === "ready") counts.ready += 1
      else if (stage === "published") counts.published += 1
      else if (stage === "needs_you" || stage === "failed") counts.needsYou += 1
      return counts
    },
    { processing: 0, needsYou: 0, ready: 0, published: 0 },
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

  // C2 — clear any source highlight when the comparison closes or switches docs.
  // C3 — also reset the "only uncertain" choice and in-session confirmations so
  // each document starts from its own default.
  useEffect(() => {
    setActiveSource(null)
    setOnlyUncertain(null)
    setConfirmedFields({})
  }, [comparisonIndex])

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

  // C5 — keyboard-first triage. Every shortcut drives an EXISTING handler; no
  // new endpoints. The clean pile is the same set C4 collapses (review level is
  // "clean"); "mark all ready" loops the per-document ready handler we already
  // call from each card.
  const cleanReadyEntries = resultEntries.filter((entry) => {
    if (!deriveReviewLevel(entry.file, entry.badge).clean) return false
    return Boolean(entry.file.document_id) &&
      !["ready", "published", "failed", "deleted"].includes(entry.file.review_status || "")
  })
  const comparisonCanMarkReady = Boolean(
    comparisonFile?.document_id &&
    !["ready", "published", "failed", "deleted"].includes(comparisonFile?.review_status || ""),
  )

  const markAllCleanReady = async () => {
    if (!onMarkDocumentReady || !cleanReadyEntries.length) return
    setBulkReadyBusy(true)
    try {
      for (const entry of cleanReadyEntries) {
        await onMarkDocumentReady(entry.file)
      }
    } finally {
      setBulkReadyBusy(false)
    }
  }

  // E — focus the first field that still "needs you" (C3 attention set), so the
  // reviewer drops straight into the one thing to fix.
  const focusFirstFlaggedField = () => {
    const target = document.querySelector<HTMLInputElement>("[data-flagged-field]")
    if (target) {
      target.focus()
      target.select?.()
    }
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // "?" opens the shortcuts sheet from anywhere in the review board.
      if (event.key === "?" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const tag = (event.target as HTMLElement | null)?.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || (event.target as HTMLElement | null)?.isContentEditable) return
        event.preventDefault()
        setShortcutsOpen((prev) => !prev)
        return
      }

      // ⌘/Ctrl+Enter — confirm: mark the open document ready.
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        if (comparisonCanMarkReady) {
          event.preventDefault()
          void onMarkDocumentReady?.(comparisonFile!)
        }
        return
      }

      // Plain single-key shortcuts ignore typing contexts and modifier combos.
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return

      const key = event.key.toLowerCase()
      if (key === "j") {
        if (comparisonIndex === null) return
        event.preventDefault()
        goToAdjacentResult(1)
      } else if (key === "k") {
        if (comparisonIndex === null) return
        event.preventDefault()
        goToAdjacentResult(-1)
      } else if (key === "a") {
        if (!comparisonCanMarkReady) return
        event.preventDefault()
        void onMarkDocumentReady?.(comparisonFile!)
      } else if (key === "e") {
        if (comparisonIndex === null) return
        event.preventDefault()
        focusFirstFlaggedField()
      } else if (key === "p") {
        // P — publish. Only the receipt → QuickBooks flow can publish from this
        // view; skip gracefully on anything else (no endpoint to call).
        if (!isReceiptComparison || !receiptDestination || !receiptAccountRefId || receiptPublishing) return
        event.preventDefault()
        void publishReceipt()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [
    comparisonIndex,
    comparisonCanMarkReady,
    comparisonFile,
    isReceiptComparison,
    receiptDestination,
    receiptAccountRefId,
    receiptPublishing,
  ])

  // All hooks above must run on every render (Rules of Hooks). Only after the
  // last hook do we bail out to the empty state — during the processing /
  // detecting phase `safeResultFiles` is empty, and returning before the
  // keyboard-shortcut effect above would change the hook count between renders
  // (React #310: "Rendered more hooks than during the previous render").
  if (!safeResultFiles.length) return null

  return (
    <>
    <div className="space-y-2.5">
      {isComplete ? (
        <div className={cn("sticky top-[4.5rem] z-20 flex flex-wrap items-center gap-3 rounded-md border p-2 backdrop-blur-xl", workspacePanelSurfaceClass)}>
          <Button
            variant="ghost"
            onClick={() => {
              setEditedTables({})
              setComparisonIndex(null)
              setEditingCell(null)
              onReset()
            }}
            className="h-9 gap-2 px-3 text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            New batch
          </Button>
          <Button
            variant="glossy"
            onClick={handleReviewedBatchDownload}
            disabled={reviewedDownloadBusy || unresolvedDuplicateCount > 0}
            className={cn("h-9 gap-2 px-3", workspacePrimaryControlClass)}
          >
            {reviewedDownloadBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {unresolvedDuplicateCount > 0 ? "Resolve duplicates to export" : "Download reviewed batch"}
          </Button>
          {editedCount > 0 && !isTextOutput ? (
            <span className="inline-flex h-9 items-center rounded-md border border-[var(--button-warm-ring)] bg-white px-3 text-xs font-semibold text-foreground">
              {editedCount} edited
            </span>
          ) : null}
          <details className="group relative ml-auto">
            <summary className={cn(buttonVariants({ variant: "surface", size: "sm" }), "h-9 cursor-pointer list-none gap-2 px-3 [&::-webkit-details-marker]:hidden")}>
              More actions
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            </summary>
             <div className={cn("absolute right-0 top-11 z-30 w-56 space-y-2 rounded-md border p-2", workspacePanelSurfaceClass)}>
              {!isSaved ? (
                <Button
                  onClick={onSaveToHistory}
                  disabled={isSaving}
                  variant="surface"
                  className="h-9 w-full justify-start gap-2 px-3"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save to history
                </Button>
              ) : null}
              <Button
                variant="surface"
                onClick={safeResultFiles.length > 1 ? onShareAll : () => firstResultFile && onShareFile(firstResultFile)}
                className="h-9 w-full justify-start gap-2 px-3"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <label className="block text-xs font-semibold text-muted-foreground">
                Download format
                <select
                  value={outputMode}
                  onChange={(event) => onOutputModeChange(event.target.value as OutputMode)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-xs font-semibold text-foreground"
                >
                  {reviewedExportOptions.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </label>
              {onDeleteBatch ? (
                <Button
                  variant="destructive"
                  onClick={() => void onDeleteBatch()}
                  className="h-9 w-full justify-start gap-2 px-3"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete batch
                </Button>
              ) : null}
            </div>
          </details>
        </div>
      ) : null}

      <div className="pt-2">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
              {/* P3 — raw symbol + brown step numeral matches the upload/processing
                  boxes so the three phases read as one numbered flow. */}
              <Symbol name="review-magnify" size="badge" className="-my-1" alt="" />
              <span className="font-mono text-sm font-semibold tabular-nums text-[var(--brand-brown-fg)]">3</span>
              Verify extraction <span className="text-base font-medium text-muted-foreground">{safeResultFiles.length}</span>
            </p>
          </div>
        </div>
        {/* C18 — a glanceable inbox strip: processing · needs you · ready ·
            published. Clicking a pile jumps the board filter to match. */}
        <InboxSummaryStrip
          className="mb-4"
          processing={inboxCounts.processing}
          needsYou={inboxCounts.needsYou}
          ready={inboxCounts.ready}
          published={inboxCounts.published}
          onSelect={(pile) => setResultFilter(pile === "needs_you" ? "needs_review" : pile)}
        />

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SegmentedTabs
            aria-label="Filter review board"
            value={resultFilter === "edited" ? "all" : resultFilter}
            onValueChange={(value) => setResultFilter(value as ResultFilter)}
            tabs={[
              { value: "needs_review", label: "Needs review", icon: <Eye />, count: filterCounts.needs_review },
              { value: "ready", label: "Ready", icon: <Check />, count: filterCounts.ready },
              { value: "published", label: "Published", icon: <ArrowRight />, count: filterCounts.published },
              { value: "failed", label: "Failed", icon: <AlertCircle />, count: filterCounts.failed },
              { value: "all", label: "All", icon: <Layers />, count: filterCounts.all },
            ]}
          />
          {filterCounts.edited > 0 ? (
            <button
              type="button"
              onClick={() => setResultFilter(resultFilter === "edited" ? "all" : "edited")}
              className={cn(
                "ax-interactive inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                resultFilter === "edited" ? workspacePrimaryControlClass : workspaceNormalControlClass,
              )}
            >
              Edited
              <span className={cn(
                "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                resultFilter === "edited" ? "bg-white/20 text-white" : "bg-[var(--button-warm)] text-foreground",
              )}>
                {filterCounts.edited}
              </span>
            </button>
          ) : null}
        </div>

        {/* C5 — sweep the clean pile + a hint to the keyboard sheet. */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {cleanReadyEntries.length ? (
            <Button
              type="button"
              size="sm"
              variant="surface"
              onClick={() => void markAllCleanReady()}
              disabled={bulkReadyBusy}
              className="h-8 gap-2 rounded-md px-3.5 text-xs"
            >
              {bulkReadyBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ListChecks className="h-3.5 w-3.5" />}
              Mark {cleanReadyEntries.length} clean ready
            </Button>
          ) : null}
          <button
            type="button"
            onClick={() => setShortcutsOpen(true)}
            className={cn("inline-flex h-8 cursor-pointer items-center gap-2 rounded-md px-3 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background", workspaceNormalControlClass)}
          >
            <Keyboard className="h-3.5 w-3.5" />
            Shortcuts
            <kbd className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md border border-black/15 bg-white px-1 font-sans text-[10px] font-semibold text-foreground">?</kbd>
          </button>
        </div>

        <div className="grid gap-2">
        {filteredResultEntries.length ? filteredResultEntries.map(({ file, index, fileKey, badge, edited, duplicateWarning }) => {
          const preview = file.file_id ? resultPreviews?.[file.file_id] : undefined
          const visiblePreview = edited ? { table: editedTables[fileKey] || [], text: preview?.text || "", loading: false } : preview
          const compact = safeResultFiles.length > 1
          const summary = resultSummary(file)
          // C4 — clean, high-confidence documents collapse to a quiet one-line
          // summary so attention lands on the risky pile. Click (or keyboard)
          // expands the card in place; risky cards never collapse.
          const reviewLevel = deriveReviewLevel(file, badge)
          const collapsed = true
          // C11 — shared at-a-glance line (identity · amount · due), used by both
          // the collapsed clean summary below and the expanded card above so the
          // two never drift. Verdict stays on the chip here for its "why" tooltip.
          const cardLine = buildCardSummary({
            identity: summary.identity,
            amount: summary.amount,
            dueDate: summary.due,
          })
          const cardDue = cardLine.parts.find((part) => part.key === "due")

          if (collapsed) {
            return (
              <motion.div
                key={file.file_id || index}
                layout={prefersReducedMotion ? false : "position"}
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
                  "group flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-[var(--button-warm-ring)] bg-white px-3 py-3 text-sm outline-none transition-colors duration-200 hover:border-black hover:bg-[var(--button-warm)] focus-visible:ring-2 focus-visible:ring-black/20 sm:flex-nowrap",
                  (badge.state === "needs_review" || badge.state === "failed") && "border-l-2 border-l-[var(--brand-brown-fg)]"
                )}
                aria-label={`${summary.identity} — ${reviewLevel.summaryLabel}, open review`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
                  {index + 1}
                </span>
                {documentTypeSymbol(file.document_type) ? (
                  <Symbol name={documentTypeSymbol(file.document_type)!} size="inline" className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" alt="" />
                ) : null}
                <span className="min-w-[180px] flex-1">
                  <span className="block truncate font-semibold text-foreground">{file.filename || summary.identity}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground">{formatDocumentType(file.document_type)}</span>
                    {file.source_page ? (
                      <span className="inline-flex h-[18px] items-center rounded-full border border-[var(--button-warm-ring)] bg-white px-1.5 text-[11px] font-semibold tabular-nums text-foreground">
                        p.{file.source_page}{file.source_page_count ? `/${file.source_page_count}` : ""}
                      </span>
                    ) : null}
                  </span>
                </span>
                {isHandwrittenDocument(file) ? <HandwrittenBadge /> : null}
                <span className="hidden min-w-[120px] shrink-0 truncate text-xs font-semibold text-foreground lg:inline">
                  {summary.identity}
                </span>
                <span className="min-w-[84px] shrink-0 text-right font-semibold tabular-nums text-foreground">
                  {summary.amount}
                </span>
                {/* C16 — a compact Net+VAT=Total reconciliation chip on the collapsed
                    row so a clean/mismatch verdict reads without expanding. */}
                {(() => {
                  const figures = summary.bookkeeper
                  if (!figures) return null
                  const check = vatCheck(figures.subtotal, figures.vat, figures.total)
                  return (
                    <AnomalyChip
                      tone={check.tone === "good" ? "good" : "caution"}
                      title={check.label}
                      reason={check.detail}
                      label={check.state === "ok" ? "✓ Adds up" : check.label}
                      className="hidden h-5 shrink-0 md:inline-flex"
                    />
                  )
                })()}
                {cardDue ? (
                  <span className="hidden min-w-[92px] shrink-0 text-xs text-muted-foreground xl:inline">
                    {cardDue.text}
                  </span>
                ) : null}
                <AnomalyChip
                  tone={reviewLevel.tone}
                  title={reviewLevel.summaryLabel}
                  reason={duplicateWarning?.message || "Open the document to review the extracted fields beside the source."}
                  label={reviewLevel.summaryLabel}
                  className="shrink-0"
                />
                {duplicateWarning ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="surface"
                    onClick={(event) => {
                      event.stopPropagation()
                      void onOverrideDuplicateWarning?.(file, duplicateWarning.id)
                    }}
                    className="h-7 shrink-0 px-2.5 text-[11px]"
                  >
                    Keep separate
                  </Button>
                ) : null}
                <span className="ml-auto inline-flex shrink-0 items-center text-muted-foreground">
                  <span className="sr-only">Open review</span>
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </motion.div>
            )
          }

          return (
            <motion.div
              key={file.file_id || index}
              layout={prefersReducedMotion ? false : "position"}
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
                "group cursor-pointer rounded-md border border-[var(--button-warm-ring)] bg-white p-3 outline-none transition-colors duration-200 hover:border-black hover:bg-[var(--button-warm)] focus-visible:ring-2 focus-visible:ring-black/20",
                compact ? "min-h-[300px]" : "min-h-[375px]",
                // Review-emphasis: a thin brown left rule makes the
                // "needs you" pile lead the board at a glance.
                (badge.state === "needs_review" || badge.state === "failed") &&
                  "border-l-2 border-l-[var(--brand-brown-fg)]"
              )}
            >
              {/* C11 — at-a-glance summary line: vendor · total · due · verdict,
                  derived from already-extracted fields. The verdict reuses C4's
                  review level (tone + label) so the line and badges agree; any
                  missing piece is omitted by buildCardSummary, never blank. */}
              {(() => {
                const line = buildCardSummary({
                  identity: summary.identity,
                  amount: summary.amount,
                  dueDate: summary.due,
                  verdict: { tone: reviewLevel.tone, label: reviewLevel.summaryLabel },
                })
                return (
                  <p className="mb-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted-foreground">
                    {line.parts.map((part, partIndex) => (
                      <span key={part.key} className="inline-flex items-center gap-1.5">
                        {partIndex > 0 ? <span aria-hidden className="text-muted-foreground/40">·</span> : null}
                        <span className={cn(part.key === "identity" && "font-semibold text-foreground")}>
                          {part.text}
                        </span>
                      </span>
                    ))}
                    {line.verdict ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span aria-hidden className="text-muted-foreground/40">·</span>
                        <span
                          className={cn(
                            "font-semibold",
                            line.verdict.tone === "good" && "text-[var(--status-success-fg)]",
                            line.verdict.tone === "caution" && "text-amber-700",
                            line.verdict.tone === "risk" && "text-rose-700",
                          )}
                        >
                          {line.verdict.label}
                        </span>
                      </span>
                    ) : null}
                    {/* C14 — a soft "high value" cue on otherwise-clean invoices
                        whose total clears the threshold. Caution (amber) tone,
                        never rose: nothing is wrong, it just earns a second look. */}
                    {reviewLevel.highValue ? (
                      <AnomalyChip
                        tone="caution"
                        title="High value"
                        reason="This total is high enough to be worth a second look — we've kept the full source evidence open."
                        label="High value — worth a double-check"
                        className="h-5 shrink-0"
                      />
                    ) : null}
                  </p>
                )
              })()}
              <div className="grid gap-3 lg:grid-cols-[minmax(180px,0.95fr)_minmax(0,1.05fr)]">
                <div className="overflow-hidden rounded-md border border-border bg-white">
                  {file.input_preview_url ? (
                    <img
                      src={file.input_preview_url}
                      alt={`Input file ${index + 1}`}
                      className={cn("h-full w-full object-contain", compact ? "min-h-[196px]" : "min-h-[255px]")}
                    />
                  ) : (
                    <div className={cn("flex h-full items-center justify-center bg-[var(--button-warm)]", compact ? "min-h-[196px]" : "min-h-[255px]")}>
                      <FileImage className="h-7 w-7 text-[var(--brand-brown-fg)]" />
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
                  {isTextOutput ? <FileText className="h-5 w-5 shrink-0 text-[var(--brand-brown-fg)]" /> : <FileSpreadsheet className="h-5 w-5 shrink-0 text-[var(--brand-brown-fg)]" />}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{file.filename || `Result ${index + 1}`}</p>
                    <p className="text-[13px] font-medium text-muted-foreground">
                      {formatDocumentType(file.document_type)}
                      {file.source_page ? ` - page ${file.source_page}${file.source_page_count ? ` of ${file.source_page_count}` : ""}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {isHandwrittenDocument(file) ? <HandwrittenBadge /> : null}
                  <span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold", badge.className)}>
                    {badge.label}
                  </span>
                  {edited && badge.state !== "edited" ? (
                    <span className="rounded-md border border-[var(--button-warm-ring)] bg-[var(--button-warm)] px-2 py-1 text-[10px] font-semibold text-[var(--brand-brown-fg)]">
                      Edited
                    </span>
                  ) : null}
                  {reviewLevel.clean ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        setExpandedClean(prev => {
                          const next = { ...prev }
                          delete next[fileKey]
                          return next
                        })
                      }}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-black bg-white text-black transition-colors hover:bg-black hover:text-white"
                      aria-label="Collapse clean summary"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-[13px]">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-muted-foreground">{summary.identityLabel}</p>
                  <p className="mt-1 truncate text-[15px] font-semibold text-foreground">{summary.identity}</p>
                </div>
                <div className="min-w-0 text-right">
                  <p className="text-[13px] font-medium text-muted-foreground">{summary.amountLabel}</p>
                  <p className="mt-1 truncate text-[15px] font-semibold text-foreground">{summary.amount}</p>
                </div>
              </div>
              {/* C16 — Net / VAT / Total + reconciliation verdict for invoices and
                  receipts, so the card speaks bookkeeper before you even open it. */}
              {summary.bookkeeper ? (
                <div className="mt-3 border-t border-border pt-3">
                  <BookkeeperBreakdown figures={summary.bookkeeper} layout="grid" />
                </div>
              ) : null}

              {duplicateWarning ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  <span className="flex min-w-0 items-center gap-2">
                    <Symbol name="duplicate" size="inline" className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" alt="" />
                    <span className="truncate font-medium">{duplicateWarning.message}</span>
                    {(() => {
                      const copy = duplicateCopy(duplicateWarning)
                      return (
                        <AnomalyChip
                          tone={copy.tone}
                          title={copy.title}
                          reason={copy.reason}
                          label="Why"
                          className="h-5 shrink-0 bg-white/70"
                        />
                      )
                    })()}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="surface"
                    onClick={(event) => {
                      event.stopPropagation()
                      void onOverrideDuplicateWarning?.(file, duplicateWarning.id)
                    }}
                    className="h-7 px-2.5 text-[11px]"
                  >
                    Keep separate
                  </Button>
                </div>
              ) : null}

              <div className="mt-3 flex justify-end gap-3">
                {file.document_id && onDeleteDocument ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(event) => {
                      event.stopPropagation()
                      void onDeleteDocument(file)
                    }}
                    className="h-8 px-2.5 text-xs"
                    aria-label="Delete stored document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
                <InvoiceDraftBillAction
                  file={file}
                  onSendToAccountsPayable={onSendToAccountsPayable}
                  stopPropagation
                  className="h-8 px-3 text-xs"
                />
                {file.document_id && !["ready", "published", "failed", "deleted"].includes(file.review_status || "") ? (
                  <Button
                    size="sm"
                    variant="surface"
                    onClick={(event) => {
                      event.stopPropagation()
                      void onMarkDocumentReady?.(file)
                    }}
                    className="h-8 px-3 text-xs"
                    title="Confirms extracted fields only"
                  >
                    Mark ready
                  </Button>
                ) : null}
                {file.file_id ? (
                  <InlineAction
                    onClick={(event) => {
                      event.stopPropagation()
                      onShareFile(file)
                    }}
                    className="h-8 px-1 text-xs"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </InlineAction>
                ) : null}
                {file.file_id || file.document_id ? (
                  <InlineAction
                    onClick={(event) => {
                      event.stopPropagation()
                      onDownloadFile(file, index)
                    }}
                    className="h-8 px-1 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </InlineAction>
                ) : null}
              </div>
            </motion.div>
          )
        }) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
            <Symbol
              name="firstsight-review-empty"
              size="hero"
              className="mx-auto mb-6 h-56 w-56 sm:h-72 sm:w-72"
              alt=""
            />
            <p className="text-lg font-semibold text-foreground">Nothing to review in this view</p>
            <p className="mt-1.5 max-w-sm text-sm font-semibold text-foreground">
              This filter is clear — your full batch is still right here.
            </p>
            <Button
              type="button"
              size="sm"
              variant="surface"
              onClick={() => setResultFilter("all")}
              className="mt-5 h-9 rounded-md px-4 text-xs"
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
          <div className={cn("relative w-full max-w-[1240px] rounded-md border p-3 sm:p-4", workspacePanelSurfaceClass)}>
            <div className="absolute right-4 top-4 z-10 flex items-center gap-3">
              {comparisonFile.file_id || comparisonFile.document_id ? (
                <details className="group relative">
                  <summary className={cn(buttonVariants({ variant: "surface", size: "sm" }), "h-9 cursor-pointer list-none gap-1.5 px-3 text-xs [&::-webkit-details-marker]:hidden")}>
                    Actions
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className={cn("absolute right-0 top-11 z-20 w-44 space-y-2 rounded-md border p-2", workspacePanelSurfaceClass)}>
                    {comparisonFile.file_id ? (
                      <Button
                        size="sm"
                        variant="surface"
                        onClick={() => onShareFile(comparisonFile)}
                        className="h-9 w-full justify-start gap-1.5 px-3 text-xs"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                        variant="surface"
                        onClick={() => onDownloadFile(comparisonFile, comparisonIndex ?? undefined)}
                        className="h-9 w-full justify-start gap-1.5 px-3 text-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                    {comparisonFile.document_id && onDeleteDocument ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => void onDeleteDocument(comparisonFile)}
                        className="h-9 w-full justify-start gap-1.5 px-3 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </details>
              ) : null}
              <InvoiceDraftBillAction
                file={comparisonFile}
                onSendToAccountsPayable={onSendToAccountsPayable}
                className="h-9 px-3 text-xs"
              />
              {comparisonFile.document_id && !["ready", "published", "failed", "deleted"].includes(comparisonFile.review_status || "") ? (
                <Button
                  size="sm"
                  variant="surface"
                  onClick={() => void onMarkDocumentReady?.(comparisonFile)}
                  className="h-9 px-3 text-xs"
                  title="Confirms extracted fields only"
                >
                  Mark ready
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="surface"
                onClick={() => {
                  setComparisonIndex(null)
                  setEditingCell(null)
                }}
                className="h-9 px-3"
                aria-label="Close comparison"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {canNavigateResults ? (
              <>
                <Button
                  size="icon"
                  variant="surface"
                  onClick={() => goToAdjacentResult(-1)}
                  className="absolute left-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2"
                  aria-label="Previous result"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="surface"
                  onClick={() => goToAdjacentResult(1)}
                  className="absolute right-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2"
                  aria-label="Next result"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            ) : null}

            <div className="grid max-h-[84vh] gap-3 overflow-auto pt-12 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-md border border-[var(--button-warm-ring)] bg-white">
                {comparisonImageUrl ? (
                  <img src={comparisonImageUrl} alt="Input preview" className="max-h-[74vh] w-full object-contain" />
                ) : (
                  <div className="text-sm font-semibold text-muted-foreground">Input preview unavailable</div>
                )}
                {/* C2 — source highlight: shows where the hovered field's value
                    appears in the document text, anchored over the preview. */}
                <SourceHighlightOverlay
                  value={activeSource?.value ?? null}
                  label={activeSource?.label ?? null}
                  sourceText={comparisonSourceText}
                />
              </div>

              <div key={comparisonKey} className="max-h-[74vh] min-h-[420px] overflow-auto rounded-md border border-[var(--button-warm-ring)] bg-white">
                {/* C17 — the duplicate banner lives on the expanded card; not
                    re-rendered here to avoid two identical warnings per document. */}
                {comparisonFile && comparisonVendorEligible ? (
                  <div className="border-b border-[var(--button-warm-ring)] bg-[var(--button-warm)] px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="flex items-center gap-2.5">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--workspace-primary)_10%,transparent)] text-[var(--workspace-primary)] [&_svg]:size-[18px]">
                          <ReceiptText />
                        </span>
                        <span className="text-[15px] font-semibold tracking-tight text-foreground">Vendor memory</span>
                      </span>
                      {comparisonFile.vendor_suggestion ? (
                        <StatusBadge tone="info" icon={<Sparkles />}>Remembered</StatusBadge>
                      ) : null}
                    </div>
                    {comparisonFile.vendor_suggestion ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {visibleVendorRuleInputs.map(field => {
                          const value = comparisonFile.vendor_suggestion?.suggested_fields[field.key]
                          return value ? (
                            <span key={field.key} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--button-warm-ring)] bg-white px-2.5 py-1 text-[12px] font-medium text-foreground">
                              <span className="inline-flex shrink-0 text-[var(--workspace-primary)] [&_svg]:size-[14px]">{field.icon}</span>
                              {value}
                            </span>
                          ) : null
                        })}
                      </div>
                    ) : null}
                    {comparisonCanRememberVendor ? (
                      <div className="mt-4">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {visibleVendorRuleInputs.map(field => (
                            <Field key={field.key} label={field.label} icon={field.icon}>
                              <input
                                value={comparisonVendorDraft[field.key] || ""}
                                onChange={(event) => updateVendorDraft(field.key, event.target.value)}
                                placeholder={field.placeholder}
                                className="ax-interactive h-9 w-full rounded-md border border-[var(--button-warm-ring)] bg-white px-2.5 text-sm font-medium text-foreground outline-none focus:border-[var(--workspace-primary)] focus:ring-2 focus:ring-[var(--workspace-primary)]/20"
                              />
                            </Field>
                          ))}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="surface"
                          onClick={() => void saveVendorRule()}
                          disabled={vendorRuleSavingId === comparisonFile.document_id}
                          className="mt-4 h-9 px-4 text-xs"
                        >
                          {vendorRuleSavingId === comparisonFile.document_id
                            ? "Saving..."
                            : comparisonFile.vendor_suggestion
                              ? "Update vendor memory"
                              : "Remember this vendor"}
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <StatusBadge tone="neutral" icon={<Check />}>Mark ready to save</StatusBadge>
                      </div>
                    )}
                  </div>
                ) : null}
                {comparisonFile && isReceiptComparison ? (
                  <div className="border-b border-[var(--button-warm-ring)] bg-[var(--button-warm)] px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-foreground">QuickBooks destination</p>
                        <p className="mt-1 max-w-xl text-[11px] text-muted-foreground">
                          Choose how this reviewed receipt is recorded. Expense records an already-paid purchase; Bill records an unpaid payable.
                        </p>
                      </div>
                      {receiptPublication ? (
                        <span className="rounded-md border border-[var(--button-warm-ring)] bg-white px-2 py-1 text-[10px] font-semibold text-foreground">
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
                        <InlineAction asChild>
                          <a href="/dashboard/integrations">Open integrations</a>
                        </InlineAction>
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
                                "group ax-interactive rounded-md p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                receiptDestination === value
                                  ? "border border-[var(--workspace-primary)] bg-[var(--workspace-primary)] text-white hover:border-[var(--workspace-primary-hover)] hover:bg-[var(--workspace-primary-hover)] focus-visible:ring-[var(--workspace-primary)]/20"
                                  : workspaceNormalControlClass
                              )}
                            >
                              <span className={cn("block text-xs font-semibold", receiptDestination === value ? "text-white group-hover:text-black" : "text-foreground")}>{title}</span>
                              <span className={cn("mt-0.5 block text-[11px]", receiptDestination === value ? "text-white/80 group-hover:text-black/70" : "text-muted-foreground")}>{subtitle}</span>
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
                            variant="glossy"
                            onClick={() => void publishReceipt()}
                            disabled={
                              receiptPublishing ||
                              !receiptDestination ||
                              !receiptAccountRefId ||
                              (receiptDestination === "bill" && !receiptVendorRefId) ||
                              (receiptDestination === "expense" && !receiptPaymentAccountRefId)
                            }
                            className={cn("h-9 px-4 text-xs", workspacePrimaryControlClass)}
                          >
                            {receiptPublishing ? (
                              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Symbol name="sync-publish" size="inline" className="mr-1.5 h-8 w-8" alt="" />
                            )}
                            Publish {receiptDestination || "receipt"}
                          </Button>
                          <InlineAction
                            onClick={() => void onRefreshQuickBooksReferences?.()}
                            className="px-1"
                          >
                            Refresh QuickBooks lists
                          </InlineAction>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
                {comparisonFields.length || comparisonRows ? (
                  <div className="text-gray-950">
                    <div className="sticky top-0 z-[1] flex items-center justify-between gap-4 border-b border-border bg-white px-4 py-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold">{comparisonSummary?.identity || comparisonFile.filename || "Document"}</p>
                          {isHandwrittenDocument(comparisonFile) ? <HandwrittenBadge variant="label" /> : null}
                        </div>
                        <p className="mt-0.5 text-xs text-foreground">{formatDocumentType(comparisonFile.document_type)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {invoiceLanguage !== "en" ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-black bg-white px-2 py-1 text-[10px] font-bold text-black">
                            <Languages className="size-2.5 text-[var(--brand-brown-fg)]" />
                            {invoiceLanguageName(invoiceLanguage)} schema
                          </span>
                        ) : null}
                        <span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold", getOutputBadge(comparisonFile).className)}>
                          {getOutputBadge(comparisonFile).label}
                        </span>
                      </div>
                    </div>
                    {/* P10 — language auto-detection suggestion */}
                    {showLanguageSuggestion && suggestedLanguage ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-300 bg-amber-50 px-4 py-2.5 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          <Languages className="size-3.5 shrink-0" />
                          This looks like a {invoiceLanguageName(suggestedLanguage)} invoice. Switch the field labels?
                        </span>
                        <span className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="surface"
                            className="h-7 px-2.5 text-[11px] font-bold"
                            onClick={() => {
                              writeInvoiceLanguage(suggestedLanguage)
                              setInvoiceLanguage(suggestedLanguage)
                            }}
                          >
                            Switch to {invoiceLanguageName(suggestedLanguage)}
                          </Button>
                          <button
                            type="button"
                            className="text-[11px] font-bold underline-offset-2 hover:underline"
                            onClick={() => setDismissedLanguageSuggestion(suggestedLanguage)}
                          >
                            Dismiss
                          </button>
                        </span>
                      </div>
                    ) : null}
                    {comparisonFields.length ? (
                      <>
                        {/* C3 — "Review only the uncertain fields": a calm summary + toggle.
                            When there's nothing to triage we say so; otherwise we offer the
                            focused view and a way back to the full document. */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--button-warm-ring)] bg-[var(--button-warm)] px-4 py-2.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            {uncertainCount > 0 ? (
                              <>
                                <span className="inline-block size-1.5 shrink-0 rounded-full bg-amber-400" />
                                {uncertainCount} of {comparisonFields.length} field{comparisonFields.length === 1 ? "" : "s"} need{uncertainCount === 1 ? "s" : ""} you
                              </>
                            ) : (
                              <>
                                <Symbol name="success-fields-verified" size="inline" className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" alt="" />
                                Every field reads cleanly
                              </>
                            )}
                          </span>
                          {uncertainCount > 0 || collapseConfident ? (
                            <button
                              type="button"
                              onClick={() => setOnlyUncertain(!collapseConfident)}
                              className={cn("inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-3 text-[11px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background", workspaceNormalControlClass)}
                            >
                              {collapseConfident ? (
                                <>
                                  <Eye className="size-3.5" />
                                  Review full document
                                </>
                              ) : (
                                "Only fields that need you"
                              )}
                            </button>
                          ) : null}
                        </div>
                        <div className="grid gap-px border-b border-border bg-border sm:grid-cols-2">
                          <AnimatePresence initial={false}>
                            {comparisonFields.map(field => {
                              // C2 — flagged total carries a "why" chip (reconciliation gap).
                              const totalCopy = field.path === "total" ? comparisonTotalCopy : null
                              const attention = fieldAttentionByPath[field.path]
                              const needsYou = Boolean(attention?.needsReview) && !confirmedFields[field.path]
                              // When collapsed, only the fields that still need you are shown.
                              if (collapseConfident && !needsYou) return null
                              // C2 — hovering/focusing a field highlights its source on the document.
                              const showSource = () => {
                                if (field.value) setActiveSource({ value: field.value, label: field.label })
                              }
                              return (
                              <motion.label
                                key={field.path}
                                layout={prefersReducedMotion ? false : "position"}
                                initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                                animate={prefersReducedMotion ? {} : { opacity: 1, height: "auto" }}
                                exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                                transition={{ duration: 0.18, ease: [0.04, 0.62, 0.23, 0.98] }}
                                className={cn(
                                  "block overflow-hidden bg-white px-3 py-2.5",
                                  // Review-emphasis: a thin brown left rule
                                  // leads the eye to the fields that still need you.
                                  needsYou && "border-l-2 border-l-[var(--brand-brown-fg)] bg-[var(--button-warm)] pl-[10px]",
                                )}
                                onMouseEnter={showSource}
                                onMouseLeave={() => setActiveSource(null)}
                                onFocus={showSource}
                              >
                                <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                  {field.label}
                                  {totalCopy ? (
                                    <AnomalyChip
                                      tone={totalCopy.tone}
                                      title={totalCopy.title}
                                      reason={totalCopy.reason}
                                      label="Why"
                                      side="top"
                                      className="h-5"
                                    />
                                  ) : needsYou && attention?.reason ? (
                                    <AnomalyChip
                                      tone={attention.reason.tone}
                                      title={attention.reason.title}
                                      reason={attention.reason.reason}
                                      label="Why"
                                      side="top"
                                      className="h-5"
                                    />
                                  ) : null}
                                </span>
                                <div className="flex items-center gap-2">
                                  <input
                                    defaultValue={field.value}
                                    data-flagged-field={needsYou && field.path === uncertainFieldPaths[0] ? "" : undefined}
                                    onBlur={(event) => {
                                      if (event.target.value !== field.value) {
                                        void updateStructuredValue(comparisonFile, [field.path], event.target.value)
                                      }
                                    }}
                                    className="ax-interactive h-8 w-full rounded-md border border-[var(--button-warm-ring)] bg-white px-2 text-sm font-medium text-gray-950 outline-none focus:border-[var(--brand-brown-fg)] focus:ring-2 focus:ring-black/15"
                                  />
                                  {needsYou ? (
                                    <InlineAction
                                      onClick={() => setConfirmedFields(prev => ({ ...prev, [field.path]: true }))}
                                      className="h-8 shrink-0 px-1 text-[11px]"
                                      aria-label={`Confirm ${field.label}`}
                                    >
                                      <Check className="size-3.5" />
                                      Looks right
                                    </InlineAction>
                                  ) : confirmedFields[field.path] ? (
                                    <Symbol name="code-confidence-tick" size="inline" className="h-12 w-12 shrink-0" alt="Confirmed" />
                                  ) : null}
                                </div>
                              </motion.label>
                              )
                            })}
                          </AnimatePresence>
                        </div>
                        {/* C3 — once nothing's left to triage in the collapsed view, offer the
                            existing "mark reviewed" handler as the single next step. */}
                        {collapseConfident && uncertainCount === 0 ? (
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--button-warm-ring)] bg-[var(--button-warm)] px-4 py-2.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                              <Check className="size-3.5 shrink-0 text-[var(--brand-brown-fg)]" />
                              Nothing left to check on this document.
                            </span>
                            {comparisonFile.document_id && !["ready", "published", "failed", "deleted"].includes(comparisonFile.review_status || "") ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="surface"
                                onClick={() => void onMarkDocumentReady?.(comparisonFile)}
                                className="h-8 px-3 text-xs"
                                title="Confirms extracted fields only"
                              >
                                Mark ready
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </>
                    ) : null}
                    {comparisonRows?.rows.length ? (
                      <>
                        {comparisonHandwritten ? (
                          <ConfidenceLegend className="border-b border-[var(--button-warm-ring)] bg-[var(--button-warm)] px-3 py-2" />
                        ) : null}
                        <table className="w-full min-w-[640px] border-collapse text-xs">
                          <thead className="sticky top-[61px] bg-[var(--button-warm)] text-foreground">
                            <tr>
                              {comparisonHandwritten ? (
                                <th className="w-7 border-b border-border px-2 py-2" aria-label="Confidence" />
                              ) : null}
                              {comparisonRows.columns.map(column => (
                                <th key={column} className="border-b border-border px-3 py-2 text-left font-medium">{column}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {comparisonRows.rows.map((row, rowIndex) => (
                              <tr key={rowIndex} className="odd:bg-white even:bg-[var(--button-warm)]">
                                {comparisonHandwritten ? (
                                  <td className="border-b border-border px-2 py-1.5 text-center align-middle">
                                    <ConfidenceDot tier={getRowConfidenceTier(comparisonFile, rowIndex + 1)} size={8} withRing />
                                  </td>
                                ) : null}
                                {row.map((value, cellIndex) => {
                                  const cellText = String(value || "")
                                  const cellLabel = comparisonRows.columns[cellIndex] || "Cell"
                                  const showCellSource = () => {
                                    if (cellText) setActiveSource({ value: cellText, label: cellLabel })
                                  }
                                  return (
                                  <td
                                    key={cellIndex}
                                    className="border-b border-border px-2 py-1.5"
                                    onMouseEnter={showCellSource}
                                    onMouseLeave={() => setActiveSource(null)}
                                    onFocus={showCellSource}
                                  >
                                    <input
                                      defaultValue={cellText}
                                      onBlur={(event) => {
                                        if (event.target.value !== String(value || "") && comparisonRows.pathRoot && comparisonRowPaths[cellIndex]) {
                                          void updateStructuredValue(
                                            comparisonFile,
                                            [comparisonRows.pathRoot, rowIndex, comparisonRowPaths[cellIndex]],
                                            event.target.value,
                                          )
                                        }
                                      }}
                                      className="ax-interactive h-8 w-full min-w-[90px] rounded-md border border-transparent bg-transparent px-1.5 text-xs text-gray-950 outline-none focus:border-[var(--brand-brown-fg)] focus:bg-white focus:ring-2 focus:ring-black/15"
                                    />
                                  </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    ) : (
                      <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
                        <Symbol
                          name="firstsight-tables-empty"
                          size="hero"
                          className="mx-auto mb-6 h-56 w-56 sm:h-72 sm:w-72"
                          alt=""
                        />
                        <p className="text-lg font-semibold text-foreground">No line rows on this document</p>
                        <p className="mt-1.5 max-w-sm text-sm font-semibold text-foreground">
                          The header fields above are still captured — there just weren&apos;t any itemised rows to extract.
                        </p>
                      </div>
                    )}
                    {comparisonFile.document_type === "bank_statement" ? (
                      <BankReconciliationPanel data={reviewData(comparisonFile)} />
                    ) : null}
                  </div>
                ) : isTextOutput || comparisonText ? (
                  <pre className="min-h-[420px] whitespace-pre-wrap p-5 text-left text-sm leading-7 text-gray-950">
                    {comparisonText || "Text preview is loading..."}
                  </pre>
                ) : comparisonTable.length ? (
                  <>
                  {comparisonHandwritten ? (
                    <ConfidenceLegend className="border-b border-[var(--button-warm-ring)] bg-[var(--button-warm)] px-3 py-2" />
                  ) : null}
                  <table className="w-full min-w-[680px] border-collapse text-sm text-gray-950">
                    <tbody>
                      {comparisonTable.map((row, rowIndex) => {
                        const isHandwrittenRow = isHandwrittenDocument(comparisonFile) && rowIndex > 0
                        const rowTier = isHandwrittenRow ? getRowConfidenceTier(comparisonFile, rowIndex) : null
                        return (
                        <tr key={rowIndex} className={rowIndex === 0 ? "bg-[var(--button-warm)] text-foreground" : rowIndex % 2 === 0 ? "bg-[var(--button-warm)]" : "bg-white"}>
                          {isHandwrittenDocument(comparisonFile) ? (
                            <td
                              className={cn(
                                "w-7 border border-gray-200 px-1.5 text-center align-middle",
                                rowIndex === 0 ? "border-slate-200" : "",
                              )}
                              aria-hidden={rowIndex === 0}
                            >
                              {rowIndex === 0 ? (
                                <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400">·</span>
                              ) : (
                                <ConfidenceDot tier={rowTier} size={8} withRing />
                              )}
                            </td>
                          ) : null}
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
                                  rowIndex === 0 ? "border-[var(--button-warm-ring)]" : "hover:bg-[var(--button-warm)]"
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
                                    className="ax-interactive w-full rounded-md border border-[var(--brand-brown-fg)] bg-white px-2 py-1 text-sm text-gray-950 outline-none ring-2 ring-black/15"
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
                        )
                      })}
                    </tbody>
                  </table>
                  </>
                ) : (
                  <div className="flex min-h-[420px] items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-brown-fg)]" />
                    Preparing preview
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* C5 — keyboard shortcuts sheet ("?"). Lists the review-board triage keys
          wired above; reuses the shadcn Dialog + kbd pattern from HelpMenu. */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="size-4 text-muted-foreground" />
              Review shortcuts
            </DialogTitle>
            <DialogDescription>
              Triage the review board without leaving the keyboard.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            {([
              [["J"], "Next document"],
              [["K"], "Previous document"],
              [["A"], "Confirm extraction / mark ready"],
              [["E"], "Edit first flagged field"],
              [["P"], "Publish receipt"],
              [["⌘", "↵"], "Confirm extraction / mark ready"],
              [["?"], "Open this sheet"],
            ] as Array<[string[], string]>).map(([keys, label]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-foreground">{label}</span>
                <span className="flex shrink-0 items-center gap-1">
                  {keys.map((k, i) => (
                    <kbd
                      key={i}
                      className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md border border-[var(--button-warm-ring)] bg-white px-1.5 font-sans text-[11px] font-semibold text-foreground"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
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
    workspaceId,
    selectedCompanyId,
    onSelectedCompanyIdChange,
    filePreviewUrls,
    pdfPageCounts,
    isDragging,
    outputMode,
    onOutputModeChange,
    documentMode = "auto",
    isUploading,
    isProcessing,
    isComplete,
    creditAvailable,
    creditEstimate,
    maxUploadFiles,
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
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false)

  useEffect(() => {
    const syncSheetWithHash = () => {
      if (hasResults) {
        setUploadSheetOpen(false)
        return
      }
      if (window.location.hash === "#upload-files") setUploadSheetOpen(true)
    }

    syncSheetWithHash()
    window.addEventListener("hashchange", syncSheetWithHash)
    return () => window.removeEventListener("hashchange", syncSheetWithHash)
  }, [hasResults])

  return (
    <div className="space-y-4">
      <ResumeBatchBanner
        latestRecoverableJob={latestRecoverableJob}
        recoveryLoading={recoveryLoading}
        onContinueLatestJob={onContinueLatestJob}
      />
      <WorkspaceErrorBanner banner={banner} onDismiss={onDismissBanner} />
      <ProgressiveUploadSheet
        open={uploadSheetOpen}
        onOpenChange={setUploadSheetOpen}
        uploadedFiles={uploadedFiles}
        workspaceId={workspaceId}
        selectedCompanyId={selectedCompanyId}
        onSelectedCompanyIdChange={onSelectedCompanyIdChange}
        pdfPageCounts={pdfPageCounts}
        isDragging={isDragging}
        isUploading={isUploading}
        isProcessing={isProcessing}
        outputMode={outputMode}
        creditAvailable={creditAvailable}
        creditEstimate={creditEstimate}
        maxUploadFiles={maxUploadFiles}
        noCredits={noCredits}
        processLabel={processLabel}
        onOutputModeChange={onOutputModeChange}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onFileInput={onFileInput}
        onRemoveFile={onRemoveFile}
        onClearFiles={onClearFiles}
        onProcess={onConvert}
        onCancel={onCancel}
      />

      <div className="space-y-3">
        <div className="grid gap-4">
          {!hasResults ? (
            <div className="space-y-4">
              {/* P1 — step 1: the upload box. */}
              <WorkspaceSection
                id="upload-files"
                step="1"
                symbol="upload-tray"
                tone={isProcessing ? "muted" : "active"}
                title="Auto-detect documents"
                hint="Invoices, receipts, bank statements and tables — PDF or image, scanned or photographed."
                contentClassName="space-y-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="glossy"
                    onClick={() => setUploadSheetOpen(true)}
                    disabled={isUploading || isProcessing}
                    className="gap-2 px-5"
                  >
                    <FolderUp className="size-4" />
                    Auto-detect documents
                  </Button>
                  <Button asChild variant="surface">
                    <a href="/dashboard/inbox">
                      <Inbox className="size-4" />
                      Open inbox
                    </a>
                  </Button>
                  <Button asChild variant="ghost">
                    <a href="/dashboard/guide">
                      <BookOpen className="size-4" />
                      Guide
                    </a>
                  </Button>
                </div>

                {uploadedFiles.length ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-sm">
                    <p className="font-medium text-foreground">
                      {uploadedFiles.length} file{uploadedFiles.length === 1 ? "" : "s"} staged. Review usage before processing.
                    </p>
                    <Button type="button" size="sm" variant="surface" onClick={() => setUploadSheetOpen(true)} className="h-8 px-3 text-xs">
                      Review upload
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                ) : null}

                {uploadedFiles.length ? (
                  <SelectedFilesTray
                    uploadedFiles={uploadedFiles}
                    filePreviewUrls={filePreviewUrls}
                    pdfPageCounts={pdfPageCounts}
                    isProcessing={isProcessing}
                    onRemoveFile={onRemoveFile}
                    onClearFiles={onClearFiles}
                  />
                ) : null}
              </WorkspaceSection>

              {/* P2 — step 2: a calm "we're reading the batch" box, only while a
                  batch is in flight, so processing reads as its own step. */}
              {isProcessing ? (
                <WorkspaceSection
                  step="2"
                  symbol="processing-gears"
                  tone="active"
                  title="Reading your documents"
                >
                  <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-[var(--brand-brown-fg)]" />
                    {processLabel || "Processing documents..."}
                  </div>
                </WorkspaceSection>
              ) : null}
            </div>
          ) : null}

          {/* P3 — step 3: the verify-extraction board. ResultActions carries its
              own "Verify extraction" header, so this wrapper stays header-light. */}
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

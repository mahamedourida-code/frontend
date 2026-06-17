"use client"

import { useCallback, useEffect, useReducer, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileImage,
  FileText,
  FolderUp,
  Hash,
  Inbox,
  Landmark,
  Languages,
  ListChecks,
  Loader2,
  ReceiptText,
  RotateCcw,
  Save,
  Send,
  Share2,
  Sparkles,
  Table2,
  Trash2,
  Upload,
  User,
  Wallet,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import { InlineAction } from "@/components/ui/inline-action"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { BankReconciliationPanel } from "@/components/dashboard/BankReconciliationPanel"
import { ConfidenceDot, ConfidenceLegend } from "@/components/dashboard/ConfidenceDot"
import { AnomalyChip } from "@/components/dashboard/AnomalyChip"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { Field } from "@/components/dashboard/Field"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Symbol } from "@/components/dashboard/Symbol"
import { HandwrittenBadge } from "@/components/dashboard/HandwrittenBadge"
import { ProcessingScanOverlay } from "@/components/dashboard/ProcessingScanOverlay"
import { SourceHighlightOverlay } from "@/components/dashboard/SourceHighlightOverlay"
import { ProgressiveUploadSheet } from "@/components/dashboard/upload/ProgressiveUploadSheet"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useMotionTokens } from "@/lib/motion"
import { fieldAttention } from "@/lib/field-attention"
import { reconciliationTotalCopy } from "@/lib/source-highlight"
import { getRowConfidenceTier, isHandwrittenDocument } from "@/lib/handwritten"
import {
  detectInvoiceLanguage,
  invoiceLanguageName,
  readInvoiceAutoDetect,
  readInvoiceLanguage,
  writeInvoiceLanguage,
  type InvoiceLanguage,
} from "@/lib/invoice-schema"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { format } from "date-fns"
import { ocrApi } from "@/lib/api-client"
import { isHistoryItemDeleted, subscribeHistoryDeletions } from "@/lib/recent-files-store"
import { acceptedUploadMimeTypes, isPdfFile } from "@/lib/upload-files"
import type {
  DocumentMode,
  JobDocumentRecord,
  QuickBooksConnectionStatus,
  QuickBooksReferenceItem,
  ReceiptPublishingDestination,
  ReceiptQuickBooksPublishRequest,
  ResolvedDocumentMode,
  VendorRuleFields,
} from "@/lib/api-client"
import {
  workspaceNormalControlClass,
  workspacePanelSurfaceClass,
  workspacePrimaryControlClass,
} from "@/components/dashboard/conversion/constants"
import type {
  OutputMode,
  RecentBatchFile,
  RecoverableJob,
  ResultFile,
  ResultFilter,
  ResultPreview,
  WorkspaceBanner,
} from "@/components/dashboard/conversion/types"
import {
  activeDuplicateWarnings,
  correctedFilename,
  deriveReviewLevel,
  documentTypeToneClass,
  formatBytes,
  formatCellValue,
  formatDocumentType,
  getOutputBadge,
  getResultKey,
  initialVendorRuleDraft,
  normalizeRecentFiles,
  recentStatusChip,
  resultDate,
  resultDueDate,
  resultIssue,
  resultReference,
  resultSummary,
  reviewData,
  rowAccentClass,
  statusChipClass,
  statusDotClass,
  structuredFields,
  structuredRowPaths,
  structuredRows,
  vendorRuleInputs,
} from "@/components/dashboard/conversion/helpers"
import {
  InvoiceDraftBillAction,
  ResumeBatchBanner,
  WorkspaceErrorBanner,
} from "@/components/dashboard/conversion/presentational"

export type { WorkspaceBanner }

type ConversionWorkspaceProps = {
  banner?: WorkspaceBanner | null
  onDismissBanner?: () => void
  latestRecoverableJob?: RecoverableJob | null
  recoveryLoading?: boolean
  onContinueLatestJob?: () => void
  uploadedFiles: File[]
  workspaceId?: string
  jobId?: string
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
          <FolderUp className="mx-auto mb-3 h-7 w-7 text-[var(--workspace-primary)]" />
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

export function ResultActions({
  jobId,
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
  | "jobId"
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
  const resultFilterTabs = ([
    { value: "all", label: "All", count: filterCounts.all },
    { value: "needs_review", label: "Needs review", count: filterCounts.needs_review },
    { value: "ready", label: "Ready", count: filterCounts.ready },
    { value: "edited", label: "Edited", count: filterCounts.edited },
    { value: "published", label: "Published", count: filterCounts.published },
    { value: "failed", label: "Failed", count: filterCounts.failed },
  ] as Array<{ value: ResultFilter; label: string; count: number }>).filter((tab) => (
    tab.value === "all" || tab.count > 0 || tab.value === resultFilter
  ))
  const filteredResultEntries = resultEntries.filter((entry) => {
    if (resultFilter === "all") return true
    if (resultFilter === "edited") return entry.edited
    return entry.badge.state === resultFilter
  })
  useEffect(() => {
    if (!safeResultFiles.length || resultFilter === "all" || filteredResultEntries.length > 0) return
    setResultFilter("all")
  }, [filteredResultEntries.length, resultFilter, safeResultFiles.length])
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
        <div className="flex flex-wrap items-center gap-2 rounded-[4px] border border-[#c8ced6] bg-white px-3 py-2 shadow-none">
          <Button
            variant="surface"
            onClick={() => {
              setEditedTables({})
              setComparisonIndex(null)
              setEditingCell(null)
              onReset()
            }}
            className={cn("h-9 gap-2 px-3 text-xs", workspaceNormalControlClass)}
          >
            <RotateCcw className="h-4 w-4" />
            New batch
          </Button>
          <Button
            variant="glossy"
            onClick={handleReviewedBatchDownload}
            disabled={reviewedDownloadBusy || unresolvedDuplicateCount > 0}
            className="h-9 gap-2 px-3 rounded-full border border-[#A98467] bg-[#A98467] text-white shadow-none transition-colors hover:border-[#A98467] hover:bg-white hover:text-[#A98467] hover:no-underline focus-visible:ring-[#A98467]/30"
          >
            {reviewedDownloadBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {unresolvedDuplicateCount > 0 ? "Resolve duplicates to export" : "Download reviewed batch"}
          </Button>
          <Button
            variant="glossy"
            onClick={() => toast.success("Batch published to your accounting software")}
            className="h-9 gap-2 px-3 rounded-full border border-emerald-600 bg-emerald-600 text-white shadow-none transition-colors hover:border-emerald-700 hover:bg-white hover:text-emerald-700 hover:no-underline focus-visible:ring-emerald-600/30"
          >
            <Send className="h-4 w-4" />
            Publish batch
          </Button>
          {editedCount > 0 && !isTextOutput ? (
            <span className="inline-flex h-9 items-center rounded-full border border-[#cfd4d9] bg-white px-3 text-xs font-semibold text-[#475467] shadow-none">
              {editedCount} edited
            </span>
          ) : null}
          <details className="group relative ml-auto">
            <summary className={cn(buttonVariants({ variant: "surface", size: "sm" }), "h-9 cursor-pointer list-none gap-2 px-3 text-xs [&::-webkit-details-marker]:hidden", workspaceNormalControlClass)}>
              More actions
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            </summary>
             <div className="absolute right-0 top-11 z-30 w-56 space-y-2 rounded-[4px] border border-[#c8ced6] bg-white p-2 shadow-none">
              {!isSaved ? (
                <Button
                  onClick={onSaveToHistory}
                  disabled={isSaving}
                  variant="surface"
                  className={cn("h-9 w-full justify-start gap-2 px-3 text-xs", workspaceNormalControlClass)}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save to history
                </Button>
              ) : null}
              <Button
                variant="surface"
                onClick={safeResultFiles.length > 1 ? onShareAll : () => firstResultFile && onShareFile(firstResultFile)}
                className={cn("h-9 w-full justify-start gap-2 px-3 text-xs", workspaceNormalControlClass)}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <label className="block text-xs font-semibold text-muted-foreground">
                Download format
                <select
                  value={outputMode}
                  onChange={(event) => onOutputModeChange(event.target.value as OutputMode)}
                  className="mt-1 h-9 w-full rounded-full border border-[#cfd4d9] bg-white px-3 text-xs font-semibold text-[#111827] shadow-none outline-none focus:border-[#A98467] focus:ring-2 focus:ring-[#A98467]/20"
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
                  className="h-9 w-full justify-start gap-2 rounded-full border border-red-300 bg-white px-3 text-xs text-red-600 shadow-none hover:border-red-600 hover:bg-red-600 hover:text-white"
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
        <div className="overflow-hidden rounded-[4px] border border-[#c8ced6] bg-white shadow-none">
          <div className="flex min-h-12 flex-col gap-2 border-b border-[#cfd4da] bg-white px-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-h-12 flex-wrap items-stretch gap-4">
              {resultFilterTabs.map((tab) => {
                const active = resultFilter === tab.value
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setResultFilter(tab.value)}
                    className={cn(
                      "ax-interactive relative inline-flex h-12 items-center gap-1.5 border-b-2 px-0 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]/20",
                      active
                        ? "border-[var(--workspace-primary)] text-[var(--workspace-primary)]"
                        : "border-transparent text-[#475467] hover:text-[#111827]",
                    )}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 ? <span className="tabular-nums text-[#667085]">{tab.count}</span> : null}
                  </button>
                )
              })}
            </div>
            {cleanReadyEntries.length ? (
              <Button
                type="button"
                size="sm"
                variant="surface"
                onClick={() => void markAllCleanReady()}
                disabled={bulkReadyBusy}
                className={cn("h-8 gap-1.5 px-3 text-xs", workspaceNormalControlClass)}
              >
                {bulkReadyBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ListChecks className="h-3.5 w-3.5" />}
                Mark clean ready
              </Button>
            ) : null}
          </div>

          <div className="flex min-h-10 items-center justify-between gap-3 border-b border-[#d9dde3] bg-[#f6f7fb] px-4 py-2 text-[12px] text-[#475467]">
            <span className="font-semibold text-[#344054]">Review results</span>
            <span className="tabular-nums">
              {filteredResultEntries.length}/{filterCounts.all} shown
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-separate border-spacing-0 text-left text-[13px] text-[#111827]">
              <thead className="bg-[#f8f9fa] text-[11px] font-semibold uppercase text-[#475467]">
                <tr>
                  <th className="w-14 border-b border-[#cfd4d9] px-3 py-2.5">View</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Document</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Type</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Status</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">From</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Reference</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Date</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Due date</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5 text-right">Total</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Issue</th>
                  <th className="w-28 border-b border-[#cfd4d9] px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredResultEntries.length ? filteredResultEntries.map(({ file, index, fileKey, badge, edited, duplicateWarning }) => {
                  const summary = resultSummary(file)
                  const displayState = edited && !["failed", "published"].includes(badge.state) ? "edited" as const : badge.state
                  const statusLabel = displayState === "edited" ? "Edited" : badge.label
                  const reviewLevel = deriveReviewLevel(file, badge)
                  const issue = resultIssue(file, badge, reviewLevel, duplicateWarning)
                  const canMarkReady = Boolean(
                    file.document_id &&
                    !["ready", "published", "failed", "deleted"].includes(file.review_status || "")
                  )
                  const isReadyToPublish = ["ready", "published"].includes(file.review_status || "")
                  // Clicking a document opens the full-page review route. Falls
                  // back to the modal only when durable ids are unavailable.
                  const docHref = jobId && file.document_id
                    ? `/dashboard/document?job=${jobId}&doc=${file.document_id}`
                    : null

                  return (
                    <tr
                      key={fileKey}
                      className="group h-12 bg-white transition-colors hover:bg-[#faf6f0]"
                    >
                      <td className={cn("border-b border-l-[3px] border-b-[#e4e7ef] px-3 py-2 align-middle", rowAccentClass(displayState, duplicateWarning))}>
                        {docHref ? (
                          <Button asChild variant="surface" size="icon" className={cn("!size-7", workspaceNormalControlClass)}>
                            <Link
                              href={docHref}
                              aria-label={`Open ${file.filename || summary.identity}`}
                            >
                              <Eye className="size-3.5" />
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="surface"
                            size="icon"
                            onClick={() => openComparison(index)}
                            className={cn("!size-7", workspaceNormalControlClass)}
                            aria-label={`Open ${file.filename || summary.identity}`}
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        )}
                      </td>
                      <td className="max-w-[260px] border-b border-[#e4e7ef] px-3 py-2 align-middle">
                        {docHref ? (
                          <Link
                            href={docHref}
                            className="block max-w-full truncate text-left text-[14px] font-semibold text-[#111827] hover:text-[var(--workspace-primary)]"
                          >
                            {file.filename || `Result ${index + 1}`}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openComparison(index)}
                            className="block max-w-full truncate text-left text-[14px] font-semibold text-[#111827] hover:text-[var(--workspace-primary)]"
                          >
                            {file.filename || `Result ${index + 1}`}
                          </button>
                        )}
                        {isHandwrittenDocument(file) ? (
                          <span className="mt-1 inline-flex text-[11px] font-medium text-[#5b21b6]">Handwritten</span>
                        ) : null}
                      </td>
                      <td className={cn("border-b border-[#e4e7ef] px-3 py-2 align-middle font-semibold", documentTypeToneClass(file.document_type))}>
                        {formatDocumentType(file.document_type)}
                      </td>
                      <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">
                        <span className={cn("inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-[11px] font-semibold leading-none", statusChipClass(displayState))}>
                          <span className={cn("size-1.5 rounded-full", statusDotClass(displayState))} />
                          {statusLabel}
                        </span>
                      </td>
                      <td className="max-w-[180px] border-b border-[#e4e7ef] px-3 py-2 align-middle font-semibold text-[var(--data-entity)]">
                        <span className="block truncate">{formatCellValue(summary.identity)}</span>
                      </td>
                      <td className="max-w-[150px] border-b border-[#e4e7ef] px-3 py-2 align-middle font-medium text-[var(--data-reference)]">
                        <span className="block truncate">{resultReference(file)}</span>
                      </td>
                      <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle font-medium text-[var(--data-date)] tabular-nums">
                        {resultDate(file)}
                      </td>
                      <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle font-medium text-[var(--data-due)] tabular-nums">
                        {resultDueDate(file, summary)}
                      </td>
                      <td className="border-b border-[#e4e7ef] px-3 py-2 text-right align-middle font-bold tabular-nums text-[var(--data-money)]">
                        {formatCellValue(summary.amount)}
                      </td>
                      <td className={cn("border-b border-[#e4e7ef] px-3 py-2 align-middle text-[12px] font-semibold", issue.className)}>
                        {issue.label}
                      </td>
                      <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">
                        <div className="flex justify-end gap-1.5">
                          {duplicateWarning ? (
                            <button
                              type="button"
                              onClick={() => void onOverrideDuplicateWarning?.(file, duplicateWarning.id)}
                              className="ax-interactive inline-flex h-7 items-center rounded-full border border-[#fed7aa] bg-[#fff7ed] px-2.5 text-[11px] font-semibold text-[#92400e] shadow-none transition-colors hover:border-[#f59e0b] hover:bg-[#ffedd5] focus-visible:ring-2 focus-visible:ring-[#f59e0b]/20"
                            >
                              Separate
                            </button>
                          ) : canMarkReady ? (
                            <button
                              type="button"
                              onClick={() => void onMarkDocumentReady?.(file)}
                              className="ax-interactive inline-flex h-7 items-center rounded-full border border-[#bbf7d0] bg-[#ecfdf3] px-2.5 text-[11px] font-semibold text-[#166534] shadow-none transition-colors hover:border-[#16a34a] hover:bg-[#dcfce7] focus-visible:ring-2 focus-visible:ring-[#16a34a]/20"
                            >
                              Ready
                            </button>
                          ) : (
                            <>
                              {isReadyToPublish ? (
                                <button
                                  type="button"
                                  onClick={() => toast.success("Published to your accounting software")}
                                  className="ax-interactive inline-flex h-7 items-center rounded-full border border-[#16a34a] bg-[#16a34a] px-2.5 text-[11px] font-semibold text-white shadow-none transition-colors hover:border-[#15803d] hover:bg-[#15803d] focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
                                >
                                  Publish
                                </button>
                              ) : null}
                              {docHref ? (
                                <Link
                                  href={docHref}
                                  className={cn("ax-interactive inline-flex h-7 items-center px-2.5 text-[11px] font-semibold transition-colors", workspaceNormalControlClass)}
                                >
                                  Open
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openComparison(index)}
                                  className={cn("ax-interactive inline-flex h-7 items-center px-2.5 text-[11px] font-semibold transition-colors", workspaceNormalControlClass)}
                                >
                                  Open
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={11} className="border-b border-[#e4e7ef] px-4 py-8 text-center text-[13px] font-medium text-[#475467]">
                      <span>No documents in this view.</span>
                      <button
                        type="button"
                        onClick={() => setResultFilter("all")}
                        className={cn("ml-3 inline-flex h-7 items-center px-3 text-[11px] font-semibold", workspaceNormalControlClass)}
                      >
                        Show all
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
              {comparisonFile.document_id && ["ready", "published"].includes(comparisonFile.review_status || "") ? (
                <Button
                  size="sm"
                  variant="glossy"
                  onClick={() => toast.success("Published to your accounting software")}
                  className="h-9 gap-1.5 px-3 text-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  Publish
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
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--workspace-purple)_10%,transparent)] text-[var(--workspace-purple)] [&_svg]:size-[18px]">
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
                              <span className="inline-flex shrink-0 text-[var(--workspace-purple)] [&_svg]:size-[14px]">{field.icon}</span>
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
                    {/* Xero-style document-form header: status + type on the left,
                        the document total set large on the right. */}
                    <div className="sticky top-0 z-[1] border-b border-[#e4e7ef] bg-white px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn("inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-semibold", getOutputBadge(comparisonFile).className)}>
                              {getOutputBadge(comparisonFile).label}
                            </span>
                            <span className={cn("text-[11px] font-bold uppercase tracking-[0.08em]", documentTypeToneClass(comparisonFile.document_type))}>
                              {formatDocumentType(comparisonFile.document_type)}
                            </span>
                            {isHandwrittenDocument(comparisonFile) ? <HandwrittenBadge variant="label" /> : null}
                            {invoiceLanguage !== "en" ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#ddd6fe] bg-[#f5f3ff] px-2 py-0.5 text-[10px] font-bold text-[#5b21b6]">
                                <Languages className="size-2.5" />
                                {invoiceLanguageName(invoiceLanguage)} schema
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1.5 truncate text-[15px] font-bold tracking-tight text-[var(--data-entity)]">
                            {comparisonSummary?.identity || comparisonFile.filename || "Document"}
                          </p>
                          {comparisonSummary?.identityLabel ? (
                            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#475467]">{comparisonSummary.identityLabel}</p>
                          ) : null}
                        </div>
                        {comparisonSummary?.amount && comparisonSummary.amount !== "-" ? (
                          <div className="shrink-0 text-right">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#475467]">{comparisonSummary.amountLabel || "Total"}</p>
                            <p className="mt-0.5 text-2xl font-bold tabular-nums text-[var(--data-money)]">{comparisonSummary.amount}</p>
                          </div>
                        ) : null}
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
                                      tone="success"
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
                              <Check className="size-3.5 shrink-0 text-[var(--workspace-success)]" />
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
                          <ConfidenceLegend className="border-b border-[#e4e7ef] bg-[#f8f9fa] px-4 py-2" />
                        ) : null}
                        <div className="border-y border-[#e4e7ef] bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#475467]">Line items</div>
                        <table className="w-full min-w-[640px] border-collapse text-[13px]">
                          <thead className="sticky top-[72px] z-[1] bg-[#f8f9fa] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475467]">
                            <tr>
                              {comparisonHandwritten ? (
                                <th className="w-7 border-b border-[#e4e7ef] px-2 py-2.5" aria-label="Confidence" />
                              ) : null}
                              {comparisonRows.columns.map((column, columnIndex) => (
                                <th key={column} className={cn("border-b border-[#e4e7ef] px-3 py-2.5 font-semibold", columnIndex === 0 ? "text-left" : "text-left")}>{column}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {comparisonRows.rows.map((row, rowIndex) => (
                              <tr key={rowIndex} className="bg-white transition-colors hover:bg-[#faf6f0]">
                                {comparisonHandwritten ? (
                                  <td className="border-b border-[#eef1f6] px-2 py-1.5 text-center align-middle">
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
                                    className="border-b border-[#eef1f6] px-2 py-1.5"
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
                                      className="ax-interactive h-8 w-full min-w-[90px] rounded-md border border-transparent bg-transparent px-1.5 text-[13px] text-[#111827] outline-none focus:border-[#A98467] focus:bg-white focus:ring-2 focus:ring-[#A98467]/20"
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
                    {/* Xero-style totals: Subtotal / VAT / Total stacked bottom-right. */}
                    {comparisonSummary?.bookkeeper ? (() => {
                      const bk = comparisonSummary.bookkeeper
                      const money = (value: any) => (value === undefined || value === null || value === "" ? "–" : [bk.currency, value].filter(Boolean).join(" "))
                      return (
                        <div className="border-t border-[#e4e7ef] bg-[#fbfbfd] px-5 py-4">
                          <div className="ml-auto w-full max-w-[280px] space-y-2 text-[13px]">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-[#475467]">Subtotal</span>
                              <span className="font-semibold tabular-nums text-[#111827]">{money(bk.subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-[#475467]">VAT</span>
                              <span className="font-semibold tabular-nums text-[#0f766e]">{money(bk.vat)}</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between border-t-2 border-[#111827] pt-2">
                              <span className="text-[15px] font-bold text-[#111827]">Total</span>
                              <span className="text-[15px] font-bold tabular-nums text-[#111827]">{money(bk.total)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })() : null}
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
                  {/* Xero-style document-form header for extracted tables. */}
                  <div className="sticky top-0 z-[1] border-b border-[#e4e7ef] bg-white px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn("inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-semibold", getOutputBadge(comparisonFile).className)}>
                            {getOutputBadge(comparisonFile).label}
                          </span>
                          <span className={cn("text-[11px] font-bold uppercase tracking-[0.08em]", documentTypeToneClass(comparisonFile.document_type))}>
                            {formatDocumentType(comparisonFile.document_type)}
                          </span>
                          {isHandwrittenDocument(comparisonFile) ? <HandwrittenBadge variant="label" /> : null}
                        </div>
                        <p className="mt-1.5 truncate text-[15px] font-bold tracking-tight text-[var(--data-entity)]">{comparisonFile.filename || "Extracted table"}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#475467]">Rows</p>
                        <p className="mt-0.5 text-2xl font-bold tabular-nums text-[#111827]">{Math.max(comparisonTable.length - 1, 0)}</p>
                      </div>
                    </div>
                  </div>
                  {comparisonHandwritten ? (
                    <ConfidenceLegend className="border-b border-[#e4e7ef] bg-[#f8f9fa] px-4 py-2" />
                  ) : null}
                  <table className="w-full min-w-[680px] border-collapse text-[13px] text-[#111827]">
                    <tbody>
                      {comparisonTable.map((row, rowIndex) => {
                        const isHandwrittenRow = isHandwrittenDocument(comparisonFile) && rowIndex > 0
                        const rowTier = isHandwrittenRow ? getRowConfidenceTier(comparisonFile, rowIndex) : null
                        return (
                        <tr key={rowIndex} className={rowIndex === 0 ? "bg-[#f8f9fa] font-semibold" : "bg-white transition-colors hover:bg-[#faf6f0]"}>
                          {isHandwrittenDocument(comparisonFile) ? (
                            <td
                              className={cn(
                                "w-7 border border-[#eef1f6] px-1.5 text-center align-middle",
                                rowIndex === 0 ? "border-[#e4e7ef]" : "",
                              )}
                              aria-hidden={rowIndex === 0}
                            >
                              {rowIndex === 0 ? (
                                <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#94a3b8]">·</span>
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
                                  "min-w-[120px] border border-[#eef1f6] px-3 py-2 text-left",
                                  rowIndex === 0 ? "border-[#e4e7ef] text-[11px] font-bold uppercase tracking-[0.04em] text-[#475467]" : "font-medium",
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
                                    className="ax-interactive w-full rounded-md border border-[#A98467] bg-white px-2 py-1 text-[13px] text-[#111827] outline-none ring-2 ring-[#A98467]/20"
                                  />
                                ) : (
                                  <span className={cn(!value && "text-[#98a2b3]")}>
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



    </>
  )
}

/**
 * The single table surface that carries the idle, staged, and processing
 * states. It mirrors the result table's chrome (action bar → tabs → "review
 * results" band → table) so every phase of a batch reads as the same board:
 * - idle:        the workspace's recent batches, fetched from history.
 * - staged:      the files just added, ready to send to review.
 * - processing:  those same files, shimmering while the batch runs.
 * When the batch completes, ConversionWorkspace swaps this out for the full
 * ResultActions review board (same chrome, richer columns).
 */
function BatchStagingBoard({
  uploadedFiles,
  pdfPageCounts,
  isProcessing,
  isUploading,
  noCredits,
  onOpenUpload,
  onRemoveFile,
  onClearFiles,
  onConvert,
}: {
  uploadedFiles: File[]
  pdfPageCounts: Record<number, number>
  isProcessing: boolean
  isUploading: boolean
  noCredits: boolean
  onOpenUpload: () => void
  onRemoveFile: (index: number) => void
  onClearFiles: () => void
  onConvert: () => void
}) {
  const m = useMotionTokens()
  const busy = isProcessing || isUploading
  const mode: "idle" | "staged" | "processing" = busy ? "processing" : uploadedFiles.length ? "staged" : "idle"

  const [recentFiles, setRecentFiles] = useState<RecentBatchFile[]>([])
  const [recentLoading, setRecentLoading] = useState(true)
  const [, forceRender] = useReducer((tick: number) => tick + 1, 0)

  const loadRecent = useCallback(async () => {
    setRecentLoading(true)
    try {
      const response = await ocrApi.getHistory(50, 0)
      setRecentFiles(normalizeRecentFiles(response))
    } catch {
      setRecentFiles([])
    } finally {
      setRecentLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mode === "idle") void loadRecent()
  }, [mode, loadRecent])

  useEffect(() => {
    const handleRefresh = () => { if (mode === "idle") void loadRecent() }
    window.addEventListener("axliner:history-changed", handleRefresh)
    const unsubscribe = subscribeHistoryDeletions(forceRender)
    return () => {
      window.removeEventListener("axliner:history-changed", handleRefresh)
      unsubscribe()
    }
  }, [loadRecent, mode])

  const recent = [...recentFiles]
    .filter((file) => !isHistoryItemDeleted(file.id))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 6)

  const stagedCount = uploadedFiles.length
  const rowCount = mode === "idle" ? recent.length : stagedCount
  const tabLabel = mode === "idle" ? "Recent" : mode === "staged" ? "Staged" : "Processing"
  const bandLabel = mode === "idle" ? "Recent files" : mode === "staged" ? "Ready to process" : "Working through this batch"
  const countLabel = mode === "idle" ? `${rowCount} shown` : `${rowCount} file${rowCount === 1 ? "" : "s"}`
  const dash = <span className="text-[#98a2b3]">–</span>

  return (
    <div className="space-y-2.5">
      {mode !== "processing" ? (
      <div className="flex flex-wrap items-center gap-2 rounded-[4px] border border-[#c8ced6] bg-white px-3 py-2 shadow-none">
        {mode === "staged" ? (
          <>
            <Button
              variant="surface"
              onClick={onClearFiles}
              className={cn("h-9 gap-2 px-3 text-xs", workspaceNormalControlClass)}
            >
              <RotateCcw className="h-4 w-4" />
              New batch
            </Button>
            <Button
              variant="glossy"
              onClick={onConvert}
              disabled={noCredits}
              className={cn("h-9 gap-2 px-4", workspacePrimaryControlClass)}
            >
              <ArrowRight className="h-4 w-4" />
              Process {stagedCount} file{stagedCount === 1 ? "" : "s"}
            </Button>
            <span className="inline-flex h-9 items-center rounded-full border border-[#cfd4d9] bg-white px-3 text-xs font-semibold text-[#475467]">
              {stagedCount} staged
            </span>
            <Button
              variant="surface"
              onClick={onOpenUpload}
              className={cn("ml-auto h-9 gap-2 px-3 text-xs", workspaceNormalControlClass)}
            >
              <FolderUp className="h-4 w-4" />
              Add more
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="glossy"
              onClick={onOpenUpload}
              className={cn("h-9 gap-2 px-5", workspacePrimaryControlClass)}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button asChild variant="surface" className={cn("h-9 gap-2 px-3 text-xs", workspaceNormalControlClass)}>
              <a href="/dashboard/inbox">
                <Inbox className="h-4 w-4" />
                Open inbox
              </a>
            </Button>
            <Button asChild variant="ghost" className="ml-auto h-9 gap-2 px-3 text-xs text-[#475467] hover:text-[#111827]">
              <a href="/dashboard/guide">
                <BookOpen className="h-4 w-4" />
                Guide
              </a>
            </Button>
          </>
        )}
      </div>
      ) : null}

      <div className="pt-2">
        <div className="overflow-hidden rounded-[4px] border border-[#c8ced6] bg-white shadow-none">
          <div className="flex min-h-12 flex-col gap-2 border-b border-[#cfd4da] bg-white px-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-h-12 flex-wrap items-stretch gap-4">
              <span className="relative inline-flex h-12 items-center gap-1.5 border-b-2 border-[var(--workspace-primary)] px-0 text-[13px] font-semibold text-[var(--workspace-primary)]">
                <span>{tabLabel}</span>
                {rowCount > 0 ? <span className="tabular-nums text-[#667085]">{rowCount}</span> : null}
              </span>
            </div>
          </div>

          <div className="flex min-h-10 items-center justify-between gap-3 border-b border-[#d9dde3] bg-[#f6f7fb] px-4 py-2 text-[12px] text-[#475467]">
            <span className="font-semibold text-[#344054]">{bandLabel}</span>
            <span className="tabular-nums">{countLabel}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-separate border-spacing-0 text-left text-[13px] text-[#111827]">
              <thead className="bg-[#f8f9fa] text-[11px] font-semibold uppercase text-[#475467]">
                <tr>
                  <th className="w-14 border-b border-[#cfd4d9] px-3 py-2.5">View</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Document</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Type</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Status</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">From</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Reference</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Date</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Due date</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5 text-right">Total</th>
                  <th className="border-b border-[#cfd4d9] px-3 py-2.5">Issue</th>
                  <th className="w-28 border-b border-[#cfd4d9] px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {mode === "idle" ? (
                  recentLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="h-12 bg-white">
                        <td colSpan={11} className="border-b border-[#e4e7ef] px-3 py-3"><span className="block h-3 w-2/3 rounded-md ax-skeleton" /></td>
                      </tr>
                    ))
                  ) : recent.length ? (
                    recent.map((file) => {
                      const st = recentStatusChip(file.status)
                      return (
                        <tr key={file.id} className="group h-12 bg-white transition-colors hover:bg-[#faf6f0]">
                          <td className="border-b border-l-[3px] border-b-[#e4e7ef] border-l-transparent px-3 py-2 align-middle">
                            <Link
                              href={`/dashboard/client?job_id=${file.id}`}
                              className={cn("ax-interactive inline-flex size-7 items-center justify-center transition-colors", workspaceNormalControlClass)}
                              aria-label={`Open ${file.filename}`}
                            >
                              <Eye className="size-3.5" />
                            </Link>
                          </td>
                          <td className="max-w-[260px] border-b border-[#e4e7ef] px-3 py-2 align-middle">
                            <Link
                              href={`/dashboard/client?job_id=${file.id}`}
                              className="block max-w-full truncate text-left text-[14px] font-semibold text-[#111827] hover:text-[var(--workspace-primary)]"
                            >
                              {file.filename}
                            </Link>
                          </td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle font-semibold text-[#0f766e]">Batch</td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">
                            <span className={cn("inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-[11px] font-semibold leading-none", st.chip)}>
                              <span className={cn("size-1.5 rounded-full", st.dot)} />
                              {st.label}
                            </span>
                          </td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">{dash}</td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">{dash}</td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle text-[#475467] tabular-nums">
                            {format(new Date(file.createdAt), "MMM d, yyyy")}
                          </td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">{dash}</td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 text-right align-middle">{dash}</td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">{dash}</td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">
                            <div className="flex justify-end">
                              <Link
                                href={`/dashboard/client?job_id=${file.id}`}
                                className={cn("ax-interactive inline-flex h-7 items-center px-2.5 text-[11px] font-semibold transition-colors", workspaceNormalControlClass)}
                              >
                                Open
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={11} className="border-b border-[#e4e7ef] px-4 py-12 text-center text-[13px] font-medium text-[#475467]">
                        <span>No documents yet — your processed batches will land here.</span>
                        <button
                          type="button"
                          onClick={onOpenUpload}
                          className={cn("ml-3 inline-flex h-7 items-center px-3 text-[11px] font-semibold", workspaceNormalControlClass)}
                        >
                          Upload your first batch
                        </button>
                      </td>
                    </tr>
                  )
                ) : (
                  <AnimatePresence initial={false}>
                    {uploadedFiles.map((file, index) => {
                      const pdf = isPdfFile(file)
                      const pageCount = pdfPageCounts[index]
                      const processing = mode === "processing"
                      return (
                        <motion.tr
                          key={`${file.name}-${file.size}-${index}`}
                          layout
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={m.tFast}
                          className="group h-12 bg-white transition-colors hover:bg-[#faf6f0]"
                        >
                          <td className={cn("border-b border-l-[3px] border-b-[#e4e7ef] px-3 py-2 align-middle", processing ? "border-l-[#A98467]" : "border-l-transparent")}>
                            <span className="inline-flex size-7 items-center justify-center rounded-full border border-[#cfd4d9] bg-white text-[#94a3b8]">
                              {processing ? <Loader2 className="size-3.5 animate-spin text-[#A98467]" /> : pdf ? <FileText className="size-3.5" /> : <FileImage className="size-3.5" />}
                            </span>
                          </td>
                          <td className="max-w-[260px] border-b border-[#e4e7ef] px-3 py-2 align-middle">
                            <span className="block max-w-full truncate text-[14px] font-semibold text-[#111827]">{file.name}</span>
                            <span className="mt-0.5 block truncate text-[11px] font-medium text-[#475467]">
                              {pdf ? `${pageCount ? `${pageCount} page${pageCount === 1 ? "" : "s"}` : "PDF"} · ` : ""}{formatBytes(file.size)}
                            </span>
                          </td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle font-semibold text-[#8a6a52]">Auto-detect</td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">
                            {processing ? (
                              <span className="inline-flex h-5 items-center gap-1.5 rounded-full border border-[#e3d4c2] bg-[#f3ece2] px-2 text-[11px] font-semibold text-[#8a6a52]">
                                <span className="size-1.5 animate-pulse rounded-full bg-[#A98467]" />
                                Processing
                              </span>
                            ) : (
                              <span className="inline-flex h-5 items-center gap-1.5 rounded-full border border-[#cfd4d9] bg-white px-2 text-[11px] font-semibold text-[#475467]">
                                <span className="size-1.5 rounded-full bg-[#94a3b8]" />
                                Staged
                              </span>
                            )}
                          </td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">{dash}</td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">{dash}</td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">{dash}</td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">{dash}</td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 text-right align-middle">{dash}</td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">
                            {processing ? (
                              <span className="text-[12px] font-semibold text-[#8a6a52]">Reading…</span>
                            ) : (
                              dash
                            )}
                          </td>
                          <td className="border-b border-[#e4e7ef] px-3 py-2 align-middle">
                            <div className="flex justify-end">
                              {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin text-[#A98467]" />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onRemoveFile(index)}
                                  className="ax-interactive inline-flex size-7 items-center justify-center rounded-full border border-[#cfd4d9] bg-white text-[#475467] shadow-none transition-colors hover:border-[#ef4444] hover:bg-[#fff1f2] hover:text-[#b42318] focus-visible:ring-2 focus-visible:ring-[#ef4444]/20"
                                  aria-label={`Remove ${file.name}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
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
    jobId,
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

  // The upload sheet is the single entry point for a new batch. Opening it from
  // a finished batch starts fresh; from idle/staged it just adds to the staged
  // set. Both the #upload-files hash (cross-page nav) and the
  // `axliner:open-upload` event (top-nav Upload, same page) funnel through here
  // so "Upload" always pops the sheet directly instead of changing the view.
  const openFreshUpload = useCallback(() => {
    if (hasResults) onReset()
    setUploadSheetOpen(true)
  }, [hasResults, onReset])

  useEffect(() => {
    const consumeHash = () => {
      if (window.location.hash !== "#upload-files") return
      openFreshUpload()
      history.replaceState(null, "", window.location.pathname + window.location.search)
    }

    consumeHash()
    window.addEventListener("hashchange", consumeHash)
    window.addEventListener("axliner:open-upload", openFreshUpload)
    return () => {
      window.removeEventListener("hashchange", consumeHash)
      window.removeEventListener("axliner:open-upload", openFreshUpload)
    }
  }, [openFreshUpload])

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
            <BatchStagingBoard
              uploadedFiles={uploadedFiles}
              pdfPageCounts={pdfPageCounts}
              isProcessing={isProcessing}
              isUploading={isUploading}
              noCredits={noCredits}
              onOpenUpload={() => setUploadSheetOpen(true)}
              onRemoveFile={onRemoveFile}
              onClearFiles={onClearFiles}
              onConvert={onConvert}
            />
          ) : null}

          {/* P3 — the verify-extraction board. It only mounts once the batch has
              review content, so idle / staged / processing show the single
              BatchStagingBoard table above and never a second table beneath it. */}
          <div className={cn("space-y-4", hasResults ? "" : "hidden")}>
            <ResultActions
              jobId={jobId}
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

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

export type WorkspaceBanner = {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  tone?: "info" | "warning" | "error"
}

type OutputMode = "table" | "text"
type DocumentMode = "table" | "bank_statement" | "invoice_receipt"
type ResultFilter = "all" | "ready" | "review" | "edited" | "failed"
type WorkspaceMode = "table" | "bank_statement" | "invoice_receipt" | "text"

type ResultFile = {
  file_id?: string
  filename?: string
  size_bytes?: number
  input_preview_url?: string
  confidence_score?: number
  confidence?: number
  quality_score?: number
  requires_review?: boolean
  review_flags?: Array<Record<string, any>>
  status?: string
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
  onEditFile: (file: ResultFile, index?: number) => void
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
  if (mode === "bank_statement") {
    return (
      <svg viewBox="0 0 28 28" fill="none" className="size-6" aria-hidden="true">
        <path d="M4 10.5 14 5l10 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 12.5h15M8.5 12.5v8m5.5-8v8m5.5-8v8M5.5 22.5h17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }

  if (mode === "invoice_receipt") {
    return (
      <svg viewBox="0 0 28 28" fill="none" className="size-6" aria-hidden="true">
        <path d="M8 4.5h12v19l-3-2-3 2-3-2-3 2v-19Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M11 10h6M11 14h6M11 18h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }

  if (mode === "text") {
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
              buttonVariants({ variant: "outline", size: "default" }),
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
    file.status === "failed" ||
    file.requires_review ||
    Boolean(file.review_flags?.length || file.metadata?.review_flags?.length) ||
    (confidence !== null && confidence < 82)

  if (file.status === "failed") {
    return { state: "failed" as const, label: "Failed", className: "border-rose-200 bg-rose-50 text-rose-800" }
  }

  return needsReview
    ? { state: "review" as const, label: "Needs review", className: "border-amber-200 bg-amber-50 text-amber-800" }
    : { state: "ready" as const, label: "Ready", className: "border-emerald-200 bg-emerald-50 text-emerald-800" }
}

function correctedFilename(filename?: string) {
  return `${(filename || "result").replace("_processed", "").replace(/\.[^/.]+$/, "")}_corrected.xlsx`
}

function ResultThumb({ preview, isTextOutput }: { preview?: ResultPreview; isTextOutput: boolean }) {
  if (preview?.loading) {
    return (
      <div className="flex h-full min-h-[310px] items-center justify-center rounded-md border border-border bg-background">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    )
  }

  if (isTextOutput || preview?.text) {
    const lines = (preview?.text || "").split(/\r?\n/).filter(Boolean).slice(0, 5)
    return (
      <div className="flex h-full min-h-[310px] flex-col gap-2 overflow-hidden rounded-md border border-border bg-white p-4">
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

  const rows = preview?.table?.length ? preview.table.slice(0, 5) : []

  return (
    <div className="h-full min-h-[310px] overflow-hidden rounded-md border border-border bg-white">
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
  onEditFile,
}: Pick<
  ConversionWorkspaceProps,
  | "resultFiles"
  | "isComplete"
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
  | "onEditFile"
>) {
  const [comparisonIndex, setComparisonIndex] = useState<number | null>(null)
  const [editingCell, setEditingCell] = useState<{ fileKey: string; row: number; col: number } | null>(null)
  const [editedTables, setEditedTables] = useState<Record<string, any[][]>>({})
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all")
  const [reviewedDownloadBusy, setReviewedDownloadBusy] = useState(false)
  const safeResultFiles = resultFiles || []

  useEffect(() => {
    if (!safeResultFiles.length) return

    const hasReviewFiles = safeResultFiles.some((file) => {
      const badge = getOutputBadge(file)
      return badge.state === "review"
    })
    const hasFailedFiles = safeResultFiles.some((file) => getOutputBadge(file).state === "failed")

    setResultFilter(hasReviewFiles ? "review" : hasFailedFiles ? "failed" : "all")
  }, [safeResultFiles.map((file) => file.file_id || file.filename || "").join("|")])

  if (!safeResultFiles.length) return null

  const firstResultFile = safeResultFiles[0]
  const comparisonFile = comparisonIndex !== null ? safeResultFiles[comparisonIndex] : null
  const comparisonKey = comparisonFile && comparisonIndex !== null ? getResultKey(comparisonFile, comparisonIndex) : ""
  const comparisonLoaded = Boolean(
    comparisonFile &&
    (!comparisonFile.file_id || activePreviewFileId === comparisonFile.file_id)
  )
  const comparisonTable = comparisonKey
    ? editedTables[comparisonKey] || (comparisonLoaded ? tablePreviewData : [])
    : []
  const comparisonText = comparisonLoaded ? textPreview : ""
  const comparisonColumnCount = Math.max(1, ...comparisonTable.map(row => row.length))
  const editedCount = Object.keys(editedTables).length
  const comparisonImageUrl = comparisonFile?.input_preview_url || firstImageUrl
  const resultEntries = safeResultFiles.map((file, index) => {
    const fileKey = getResultKey(file, index)
    const badge = getOutputBadge(file)
    const edited = Boolean(editedTables[fileKey])

    return { file, index, fileKey, badge, edited }
  })
  const filterCounts = resultEntries.reduce(
    (counts, entry) => {
      counts.all += 1
      counts[entry.badge.state] += 1
      if (entry.edited) counts.edited += 1
      return counts
    },
    { all: 0, ready: 0, review: 0, edited: 0, failed: 0 } as Record<ResultFilter, number>
  )
  const filteredResultEntries = resultEntries.filter((entry) => {
    if (resultFilter === "all") return true
    if (resultFilter === "edited") return entry.edited
    return entry.badge.state === resultFilter
  })

  const openComparison = (index: number) => {
    const file = safeResultFiles[index]
    if (!file) return
    setComparisonIndex(index)
    setEditingCell(null)
    onEditFile(file, index)
  }

  const goToAdjacentResult = (direction: -1 | 1) => {
    if (comparisonIndex === null || safeResultFiles.length < 2) return
    openComparison((comparisonIndex + direction + safeResultFiles.length) % safeResultFiles.length)
  }

  const updateCorrectedCell = (fileKey: string, rowIndex: number, cellIndex: number, value: string) => {
    setEditedTables(prev => {
      const source = prev[fileKey] || comparisonTable
      const nextTable = source.map(row => [...row])
      if (!nextTable[rowIndex]) nextTable[rowIndex] = []
      nextTable[rowIndex][cellIndex] = value
      return { ...prev, [fileKey]: nextTable }
    })
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
          <Button
            variant="outline"
            onClick={onDownloadAll}
            className="h-9 gap-2 rounded-md border-border bg-card px-3 text-foreground shadow-xs hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Download all
          </Button>
          <Button
            onClick={handleReviewedBatchDownload}
            disabled={reviewedDownloadBusy}
            className="h-9 gap-2 rounded-md px-3 shadow-xs"
          >
            {reviewedDownloadBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download reviewed batch
          </Button>
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
              Results <span className="text-base font-medium text-muted-foreground">{safeResultFiles.length}</span>
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {([
            ["all", "All"],
            ["ready", "Ready"],
            ["review", "Needs review"],
            ["edited", "Edited"],
            ["failed", "Failed"],
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
          safeResultFiles.length > 8
            ? "grid-cols-1 xl:grid-cols-2"
            : "grid-cols-1"
        )}>
        {filteredResultEntries.length ? filteredResultEntries.map(({ file, index, fileKey, badge, edited }) => {
          const preview = file.file_id ? resultPreviews?.[file.file_id] : undefined
          const visiblePreview = edited ? { table: editedTables[fileKey] || [], text: preview?.text || "", loading: false } : preview
          const compact = safeResultFiles.length > 8

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
                compact ? "min-h-[390px]" : "min-h-[470px]"
              )}
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(180px,0.95fr)_minmax(0,1.05fr)]">
                <div className="overflow-hidden rounded-md border border-border bg-white">
                  {file.input_preview_url ? (
                    <img
                      src={file.input_preview_url}
                      alt={`Input file ${index + 1}`}
                      className="h-full min-h-[310px] w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full min-h-[310px] items-center justify-center bg-muted">
                      <FileImage className="h-7 w-7 text-primary/65" />
                    </div>
                  )}
                </div>
                <ResultThumb preview={visiblePreview} isTextOutput={isTextOutput} />
              </div>

              <div className="mt-3 flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background">
                    {index + 1}
                  </span>
                  {isTextOutput ? <FileText className="h-5 w-5 shrink-0 text-primary" /> : <FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" />}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{file.filename || `Result ${index + 1}`}</p>
                    {file.size_bytes ? <p className="text-xs font-semibold text-muted-foreground">{formatBytes(file.size_bytes)}</p> : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold", badge.className)}>
                    {badge.label}
                  </span>
                  {edited ? (
                    <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                      Edited
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2">
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setComparisonIndex(null)
                setEditingCell(null)
              }}
              className="absolute right-4 top-4 z-10 h-9 rounded-md border-border bg-background px-3 text-foreground"
              aria-label="Close comparison"
            >
              <X className="h-4 w-4" />
            </Button>
            {safeResultFiles.length > 1 ? (
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

            <div className="grid max-h-[84vh] gap-3 overflow-auto lg:grid-cols-[0.92fr_1.08fr]">
              <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-md border border-border bg-white">
                {comparisonImageUrl ? (
                  <img src={comparisonImageUrl} alt="Input preview" className="max-h-[74vh] w-full object-contain" />
                ) : (
                  <div className="text-sm font-semibold text-muted-foreground">Input preview unavailable</div>
                )}
              </div>

              <div className="max-h-[74vh] min-h-[420px] overflow-auto rounded-md border border-border bg-white">
                {isTextOutput || comparisonText ? (
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
                                      updateCorrectedCell(comparisonKey, rowIndex, cellIndex, event.target.value)
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
    onEditFile,
  } = props
  const hasResults = Boolean(isComplete && (resultFiles?.length || 0) > 0)
  const isBankStatementMode = documentMode === "bank_statement"
  const isInvoiceReceiptMode = documentMode === "invoice_receipt"
  const selectedMode = isBankStatementMode
    ? "bank_statement"
    : isInvoiceReceiptMode
      ? "invoice_receipt"
      : outputMode === "text"
        ? "text"
        : "table"
  const expectedOutputs = Math.max(creditEstimate || 0, uploadedFiles.length)
  const modeOptions = [
    {
      value: "table",
      label: "Table",
      helper: "Rows and columns",
      icon: "bg-[#ebfbf3] text-[#098451]",
      selected: "border-[#91dec0] bg-[#f2fff9]",
      hover: "hover:border-[#91dec0] hover:bg-[#f2fff9]",
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
      value: "invoice_receipt",
      label: "Invoice/receipt",
      helper: "Totals, dates, line items",
      icon: "bg-[#fff3ea] text-[#dd6d2f]",
      selected: "border-[#f0c09f] bg-[#fff9f4]",
      hover: "hover:border-[#f0c09f] hover:bg-[#fff9f4]",
    },
    {
      value: "text",
      label: "Text extraction",
      helper: "Readable text",
      icon: "bg-[#f4efff] text-[#7755d8]",
      selected: "border-[#c6b5f4] bg-[#faf8ff]",
      hover: "hover:border-[#c6b5f4] hover:bg-[#faf8ff]",
    },
  ] as const

  const handleModeChange = (mode: typeof modeOptions[number]["value"]) => {
    if (mode === "text") {
      onDocumentModeChange?.("table")
      onOutputModeChange("text")
      return
    }

    onDocumentModeChange?.(mode)
    onOutputModeChange("table")
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
            <ResultActions
              resultFiles={resultFiles}
              isComplete={isComplete}
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
              onEditFile={onEditFile}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, type ChangeEvent, type DragEvent } from "react"
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
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
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { acceptedUploadMimeTypes, isPdfFile } from "@/lib/upload-files"

export type WorkspaceStage = "Added" | "Uploading" | "Queued" | "Processing" | "Ready" | "Failed"

export type WorkspaceBanner = {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  tone?: "info" | "warning" | "error"
}

type OutputMode = "table" | "text"

type ResultFile = {
  file_id?: string
  filename?: string
  size_bytes?: number
  confidence_score?: number
  confidence?: number
  quality_score?: number
  requires_review?: boolean
  status?: string
  metadata?: Record<string, any>
}

type RecoverableJob = {
  processed_images?: number
  total_images?: number
}

type ConversionWorkspaceProps = {
  stage: WorkspaceStage
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
  isUploading: boolean
  isProcessing: boolean
  isComplete: boolean
  uploadProgress: number
  progress?: { total_images?: number; processed_images?: number; percentage?: number } | null
  processingTime: number
  uploadedSizeMb: number
  creditAvailable: number
  creditEstimate: number
  maxUploadFiles: number
  processLabel: string
  noCredits: boolean
  resultFiles: ResultFile[] | null
  tablePreviewData: any[][]
  textPreview: string
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
  onDownloadFile: (file: ResultFile) => void
  onDownloadAll: () => void
  onEditFile: (file: ResultFile, index?: number) => void
}

const stages: WorkspaceStage[] = ["Added", "Queued", "Processing", "Ready"]

function formatBytes(bytes: number) {
  if (!bytes) return "0 MB"
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function StageRail({ stage }: { stage: WorkspaceStage }) {
  return (
    <div className="flex flex-wrap gap-2">
      {stages.map((item) => {
        const active = item === stage
        const done = stages.indexOf(item) < stages.indexOf(stage) && stage !== "Failed"
        return (
          <span
            key={item}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-bold",
              active && "border-primary bg-primary text-primary-foreground",
              done && "border-border bg-card/70 text-primary",
              !active && !done && "border-border bg-card/50 text-muted-foreground",
              stage === "Failed" && item === "Added" && "border-rose-200 bg-rose-50 text-rose-700"
            )}
          >
            {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
            {active && stage !== "Ready" && stage !== "Failed" ? <Clock3 className="h-3.5 w-3.5" /> : null}
            {item}
          </span>
        )
      })}
      {stage === "Failed" && (
        <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700">
          <AlertCircle className="h-3.5 w-3.5" />
          Failed
        </span>
      )}
    </div>
  )
}

function WorkspaceErrorBanner({ banner, onDismiss }: { banner?: WorkspaceBanner | null; onDismiss?: () => void }) {
  if (!banner) return null

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
          <Button onClick={banner.onAction} className="h-10 rounded-md bg-primary px-4 text-primary-foreground hover:bg-primary/90">
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
    <div className="mb-4 flex flex-col gap-3 rounded-md border border-primary bg-primary p-4 text-primary-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 text-primary-foreground" />
        <div>
          <p className="text-sm font-semibold">Continue latest batch</p>
          <p className="text-xs text-primary-foreground/70">
            {latestRecoverableJob.processed_images || 0} of {latestRecoverableJob.total_images || 0} files processed
          </p>
        </div>
      </div>
      <Button
        onClick={onContinueLatestJob}
        disabled={recoveryLoading}
        className="h-10 rounded-md border border-white/20 bg-background px-4 text-primary hover:bg-card/90"
      >
        {recoveryLoading ? "Resuming..." : "Continue latest job"}
      </Button>
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

  return (
    <>
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative overflow-hidden rounded-md border border-dashed transition-all duration-200",
        isDragging ? "border-primary bg-card/85 scale-[0.997]" : "border-border bg-card/50 hover:border-primary/50"
      )}
    >
      <div className={cn("px-6 py-6 text-center", uploadedFiles.length ? "min-h-[330px]" : "flex min-h-[270px] flex-col items-center justify-center")}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-card/75 shadow-[0_18px_45px_rgb(0 0 0 / 0.10)]">
          <FolderUp className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">{isDragging ? "Drop files" : uploadedFiles.length ? "Drop more files" : "Upload files"}</h3>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">Images and PDFs</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <label
            htmlFor="workspace-file-upload"
            className={cn(
              "inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90",
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
              className="h-11 rounded-md border-border bg-card px-4 text-primary shadow-sm hover:bg-accent"
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
          <div className="mt-5 grid grid-cols-2 gap-2 text-left sm:grid-cols-3 xl:grid-cols-4">
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
                      className="absolute right-1 top-1 h-7 w-7 rounded-md bg-card/88 text-primary opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-accent group-hover:opacity-100"
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
                className="h-9 rounded-md border-border bg-background px-3 text-primary"
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
          className="h-8 rounded-md px-3 text-primary"
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
                  className="absolute right-1 top-1 h-7 w-7 rounded-md bg-card/88 text-primary opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-accent group-hover:opacity-100"
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
                className="h-9 rounded-md border-border bg-background px-3 text-primary"
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

export function JobProgressPanel({
  stage,
  isUploading,
  isProcessing,
  isComplete,
  uploadProgress,
  progress,
  processingTime,
}: Pick<
  ConversionWorkspaceProps,
  "stage" | "isUploading" | "isProcessing" | "isComplete" | "uploadProgress" | "progress" | "processingTime"
>) {
  const progressValue = isUploading ? uploadProgress : progress?.percentage ?? (stage === "Queued" ? 12 : stage === "Processing" ? 48 : isComplete ? 100 : 0)
  const active = isUploading || isProcessing || isComplete || stage === "Failed"

  return (
    <div className="rounded-md border border-border bg-card/50 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Status</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{stage}</p>
        </div>
        {active ? (
          <div className="rounded-md border border-border bg-card/70 px-3 py-1 text-xs font-bold text-primary">
            {processingTime}s
          </div>
        ) : null}
      </div>

      {active ? (
        <div className="mt-4 space-y-3">
          <Progress value={progressValue} className="h-2" />
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{isComplete ? "Ready" : stage === "Failed" ? "Failed" : "Converting"}</span>
            {progress?.total_images ? <span>{progress.processed_images || 0}/{progress.total_images} files</span> : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 h-2 rounded-md bg-muted" />
      )}
    </div>
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
          <p className="mt-2 text-lg font-semibold text-foreground">Preview appears here</p>
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
                className="h-9 rounded-md border-border bg-background px-3 text-primary"
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
    (confidence !== null && confidence < 82)

  return needsReview
    ? { label: "Needs review", className: "border-amber-200 bg-amber-50 text-amber-800" }
    : { label: "Ready", className: "border-emerald-200 bg-emerald-50 text-emerald-800" }
}

function correctedFilename(filename?: string) {
  return `${(filename || "result").replace("_processed", "").replace(/\.[^/.]+$/, "")}_corrected.xlsx`
}

export function ResultActions({
  resultFiles,
  isComplete,
  isTextOutput,
  isSaving,
  isSaved,
  tablePreviewData,
  textPreview,
  firstImageUrl,
  activePreviewFileId,
  onReset,
  onSaveToHistory,
  onShareFile,
  onShareAll,
  onDownloadFile,
  onDownloadAll,
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
  | "firstImageUrl"
  | "activePreviewFileId"
  | "onReset"
  | "onSaveToHistory"
  | "onShareFile"
  | "onShareAll"
  | "onDownloadFile"
  | "onDownloadAll"
  | "onEditFile"
>) {
  const [comparisonIndex, setComparisonIndex] = useState<number | null>(null)
  const [editingCell, setEditingCell] = useState<{ fileKey: string; row: number; col: number } | null>(null)
  const [editedTables, setEditedTables] = useState<Record<string, any[][]>>({})
  if (!resultFiles?.length) return null

  const comparisonFile = comparisonIndex !== null ? resultFiles[comparisonIndex] : null
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

  const openComparison = (index: number) => {
    const file = resultFiles[index]
    if (!file) return
    setComparisonIndex(index)
    setEditingCell(null)
    onEditFile(file, index)
  }

  const goToAdjacentResult = (direction: -1 | 1) => {
    if (comparisonIndex === null || resultFiles.length < 2) return
    openComparison((comparisonIndex + direction + resultFiles.length) % resultFiles.length)
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
    if (!entries.length) return

    const XLSX = await import("xlsx")

    for (const [fileKey, table] of entries) {
      const fileIndex = resultFiles.findIndex((file, index) => getResultKey(file, index) === fileKey)
      const file = fileIndex >= 0 ? resultFiles[fileIndex] : undefined
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

  return (
    <>
    <div className="space-y-3">
      {isComplete ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              setEditedTables({})
              setComparisonIndex(null)
              setEditingCell(null)
              onReset()
            }}
            className="h-10 gap-2 rounded-md bg-primary px-4 text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" />
            New batch
          </Button>
          {!isSaved ? (
            <Button
              onClick={onSaveToHistory}
              disabled={isSaving}
              variant="outline"
              className="h-10 gap-2 rounded-md border-border bg-card px-4 text-primary shadow-sm hover:bg-accent"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={resultFiles.length > 1 ? onShareAll : () => onShareFile(resultFiles[0])}
            className="h-10 gap-2 rounded-md border-border bg-card px-4 text-primary shadow-sm hover:bg-accent"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={onDownloadAll}
            className="h-10 gap-2 rounded-md border-border bg-card px-4 text-primary shadow-sm hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Download all
          </Button>
          {editedCount > 0 && !isTextOutput ? (
            <Button
              onClick={downloadCorrectedFiles}
              className="h-10 gap-2 rounded-md bg-primary px-4 text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Download corrected files
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-2">
        {resultFiles.map((file, index) => {
          const fileKey = getResultKey(file, index)
          const badge = getOutputBadge(file)
          const edited = Boolean(editedTables[fileKey])

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
              className="grid cursor-pointer gap-3 rounded-md border border-border bg-card/60 p-3 outline-none transition hover:border-primary/30 hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-primary sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                {isTextOutput ? <FileText className="h-5 w-5 shrink-0 text-primary" /> : <FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" />}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{file.filename || `Result ${index + 1}`}</p>
                  {file.size_bytes ? <p className="text-xs font-semibold text-muted-foreground">{formatBytes(file.size_bytes)}</p> : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold", badge.className)}>
                  {badge.label}
                </span>
                {edited ? (
                  <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                    Edited
                  </span>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(event) => {
                    event.stopPropagation()
                    onShareFile(file)
                  }}
                  className="h-9 rounded-md border-border bg-card text-primary shadow-sm hover:bg-accent"
                >
                  <Share2 className="mr-1.5 h-4 w-4" />
                  Share
                </Button>
                <Button
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDownloadFile(file)
                  }}
                  className="h-9 rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )
        })}
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
              className="absolute right-4 top-4 z-10 h-9 rounded-md border-border bg-background px-3 text-primary"
              aria-label="Close comparison"
            >
              <X className="h-4 w-4" />
            </Button>
            {resultFiles.length > 1 ? (
              <>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => goToAdjacentResult(-1)}
                  className="absolute left-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-md border-border bg-background text-primary"
                  aria-label="Previous result"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => goToAdjacentResult(1)}
                  className="absolute right-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-md border-border bg-background text-primary"
                  aria-label="Next result"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            ) : null}

            <div className="grid max-h-[84vh] gap-3 overflow-auto lg:grid-cols-[0.92fr_1.08fr]">
              <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-md border border-border bg-white">
                {firstImageUrl ? (
                  <img src={firstImageUrl} alt="Input preview" className="max-h-[74vh] w-full object-contain" />
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
                              editingCell?.fileKey === comparisonKey &&
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
    stage,
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
    isUploading,
    isProcessing,
    isComplete,
    uploadProgress,
    progress,
    processingTime,
    uploadedSizeMb,
    creditAvailable,
    creditEstimate,
    maxUploadFiles,
    processLabel,
    noCredits,
    resultFiles,
    tablePreviewData,
    textPreview,
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
    onEditFile,
  } = props

  return (
    <div className="space-y-4">
      <ResumeBatchBanner
        latestRecoverableJob={latestRecoverableJob}
        recoveryLoading={recoveryLoading}
        onContinueLatestJob={onContinueLatestJob}
      />
      <WorkspaceErrorBanner banner={banner} onDismiss={onDismissBanner} />

      <Card className="overflow-hidden rounded-md border-border bg-card shadow-sm">
        <CardContent className="p-4 lg:p-5">
          <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <StageRail stage={stage} />
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Credits</p>
                <p className="text-base font-semibold text-primary">{creditAvailable}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Estimate</p>
                <p className="text-base font-semibold text-foreground">{creditEstimate || 0}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Limit</p>
                <p className="text-base font-semibold text-foreground">{maxUploadFiles}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.98fr)_minmax(420px,1fr)]">
            <div className="space-y-4">
              <div className="flex w-fit rounded-md border border-border bg-card p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => onOutputModeChange("table")}
                  disabled={isProcessing}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                    outputMode === "table" ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-card/60",
                    isProcessing && "cursor-not-allowed opacity-60"
                  )}
                >
                  Table output
                </button>
                <button
                  type="button"
                  onClick={() => onOutputModeChange("text")}
                  disabled={isProcessing}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                    outputMode === "text" ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-card/60",
                    isProcessing && "cursor-not-allowed opacity-60"
                  )}
                >
                  Text output
                </button>
              </div>

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

              <div className="flex flex-col gap-3 rounded-md border border-border bg-card/50 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {uploadedFiles.length ? `${uploadedFiles.length} selected` : "No files selected"}
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {uploadedFiles.length ? `${formatBytes(uploadedSizeMb * 1024 * 1024)} - ${creditEstimate || uploadedFiles.length} estimated credits` : "Add images or PDFs to start."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {(isUploading || isProcessing) && !isComplete ? (
                    <Button
                      variant="outline"
                      onClick={onCancel}
                      className="h-11 rounded-md border-border bg-card/70 px-5 text-primary hover:bg-accent"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  ) : null}
                  <Button
                    size="lg"
                    onClick={onConvert}
                    disabled={!uploadedFiles.length || isProcessing || noCredits}
                    className="h-12 gap-2 rounded-md bg-primary px-6 text-primary-foreground shadow-sm hover:bg-primary/90"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {isProcessing ? "Converting" : processLabel}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <JobProgressPanel
                stage={stage}
                isUploading={isUploading}
                isProcessing={isProcessing}
                isComplete={isComplete}
                uploadProgress={uploadProgress}
                progress={progress}
                processingTime={processingTime}
              />
              <ResultPreviewPanel
                isComplete={isComplete}
                resultFiles={resultFiles}
                tablePreviewData={tablePreviewData}
                textPreview={textPreview}
                firstImageUrl={firstImageUrl}
                isTextOutput={isTextOutput}
              />
              <ResultActions
                resultFiles={resultFiles}
                isComplete={isComplete}
                isTextOutput={isTextOutput}
                isSaving={isSaving}
                isSaved={isSaved}
                tablePreviewData={tablePreviewData}
                textPreview={textPreview}
                firstImageUrl={firstImageUrl}
                activePreviewFileId={activePreviewFileId}
                onReset={onReset}
                onSaveToHistory={onSaveToHistory}
                onShareFile={onShareFile}
                onShareAll={onShareAll}
                onDownloadFile={onDownloadFile}
                onDownloadAll={onDownloadAll}
                onEditFile={onEditFile}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

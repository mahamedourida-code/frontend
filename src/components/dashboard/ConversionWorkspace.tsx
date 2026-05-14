"use client"

import { useState, type ChangeEvent, type DragEvent } from "react"
import {
  AlertCircle,
  ArrowRight,
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
  onEditFile: (file: ResultFile) => void
}

const stages: WorkspaceStage[] = ["Added", "Uploading", "Queued", "Processing", "Ready"]

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
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-bold",
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
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700">
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
        "mb-4 flex flex-col gap-3 rounded-xl border p-4 shadow-[0_16px_42px_rgb(0 0 0 / 0.08)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between",
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
          <Button onClick={banner.onAction} className="h-10 rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/90">
            {banner.actionLabel}
          </Button>
        ) : null}
        {onDismiss ? (
          <Button variant="ghost" size="icon" onClick={onDismiss} className="h-10 w-10 rounded-full">
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
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-primary bg-primary p-4 text-primary-foreground shadow-[0_16px_42px_rgb(0 0 0 / 0.14)] sm:flex-row sm:items-center sm:justify-between">
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
        className="h-10 rounded-full border border-white/20 bg-background px-4 text-primary hover:bg-card/90"
      >
        {recoveryLoading ? "Resuming..." : "Continue latest job"}
      </Button>
    </div>
  )
}

export function UploadDropzone({
  uploadedFiles,
  isDragging,
  isProcessing,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInput,
}: Pick<
  ConversionWorkspaceProps,
  "uploadedFiles" | "isDragging" | "isProcessing" | "onDragOver" | "onDragLeave" | "onDrop" | "onFileInput"
>) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative overflow-hidden rounded-xl border border-dashed transition-all duration-200",
        isDragging ? "border-primary bg-card/85 scale-[0.997]" : "border-border bg-card/50 hover:border-primary/50"
      )}
    >
      <div className={cn("flex flex-col items-center justify-center px-6 py-8 text-center", uploadedFiles.length ? "min-h-[170px]" : "min-h-[270px]")}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-card/75 shadow-[0_18px_45px_rgb(0 0 0 / 0.10)]">
          <FolderUp className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">{isDragging ? "Drop files" : uploadedFiles.length ? "Drop more files" : "Upload files"}</h3>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">Images and PDFs</p>
        <label
          htmlFor="workspace-file-upload"
          className={cn(
            "mt-5 inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-[0_16px_36px_rgb(0 0 0 / 0.14)] transition hover:bg-primary/90",
            isProcessing && "pointer-events-none opacity-55"
          )}
        >
          <FileImage className="mr-2 h-4 w-4" />
          Browse files
        </label>
        <input
          id="workspace-file-upload"
          type="file"
          multiple
          accept={acceptedUploadMimeTypes}
          onChange={onFileInput}
          disabled={isProcessing}
          className="hidden"
        />
      </div>
    </div>
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
    <div className="rounded-xl border border-border bg-card/50 p-3 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Selected files</p>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearFiles}
          disabled={isProcessing}
          className="h-8 rounded-full px-3 text-primary"
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
                  className="absolute right-1 top-1 h-7 w-7 rounded-full bg-card/88 text-primary opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-accent group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-foreground">{file.name}</p>
                <p className="mt-0.5 truncate text-[11px] font-semibold text-muted-foreground">
                  {pdf ? `${pageCount ? `${pageCount} page${pageCount === 1 ? "" : "s"}` : "PDF"}` : "Image"} · {formatBytes(file.size)}
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
          <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-white/60 bg-card/88 p-4 shadow-[0_36px_110px_rgba(17,24,39,0.34)] backdrop-blur-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-foreground">{selectedPreview.name}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedPreview(null)}
                className="h-9 rounded-full border-primary/20 bg-card/75 px-3 text-primary"
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
    <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Status</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{stage}</p>
        </div>
        {active ? (
          <div className="rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-bold text-primary">
            {processingTime}s
          </div>
        ) : null}
      </div>

      {active ? (
        <div className="mt-4 space-y-3">
          <Progress value={progressValue} className="h-2" />
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{isUploading ? "Uploading" : isComplete ? "Ready" : stage === "Failed" ? "Failed" : "Processing"}</span>
            {progress?.total_images ? <span>{progress.processed_images || 0}/{progress.total_images} files</span> : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 h-2 rounded-full bg-muted" />
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
      <div className="flex min-h-[300px] flex-col justify-between rounded-xl border border-border bg-card/50 p-4 backdrop-blur-xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Result</p>
          <p className="mt-2 text-lg font-semibold text-foreground">Preview appears here</p>
        </div>
        <div className="grid gap-2">
          <div className="h-9 rounded-xl bg-card/65" />
          <div className="h-9 w-4/5 rounded-xl bg-card/60" />
          <div className="h-9 w-3/5 rounded-xl bg-card/50" />
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="rounded-xl border border-border bg-card/50 p-3 backdrop-blur-xl">
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
          <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-white/60 bg-card/88 p-4 shadow-[0_36px_110px_rgba(17,24,39,0.34)] backdrop-blur-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-foreground">{resultFiles[0]?.filename || "Input preview"}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setImagePreviewOpen(false)}
                className="h-9 rounded-full border-primary/20 bg-card/75 px-3 text-primary"
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
  resultFiles,
  isComplete,
  isTextOutput,
  isSaving,
  isSaved,
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
  | "onReset"
  | "onSaveToHistory"
  | "onShareFile"
  | "onShareAll"
  | "onDownloadFile"
  | "onDownloadAll"
  | "onEditFile"
>) {
  if (!resultFiles?.length) return null

  return (
    <div className="space-y-3">
      {isComplete ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onReset} className="h-10 gap-2 rounded-full bg-primary px-4 text-primary-foreground shadow-sm hover:bg-primary/90">
            <RotateCcw className="h-4 w-4" />
            New batch
          </Button>
          {!isSaved ? (
            <Button
              onClick={onSaveToHistory}
              disabled={isSaving}
              variant="outline"
              className="h-10 gap-2 rounded-full border-primary/20 bg-card/72 px-4 text-primary shadow-sm hover:bg-accent"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={resultFiles.length > 1 ? onShareAll : () => onShareFile(resultFiles[0])}
            className="h-10 gap-2 rounded-full border-primary/20 bg-card/72 px-4 text-primary shadow-sm hover:bg-accent"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={onDownloadAll}
            className="h-10 gap-2 rounded-full border-primary/20 bg-card/72 px-4 text-primary shadow-sm hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Download all
          </Button>
        </div>
      ) : null}

      <div className="grid gap-2">
        {resultFiles.map((file, index) => (
          <div key={file.file_id || index} className="grid gap-3 rounded-lg border border-border bg-card/60 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {index + 1}
              </div>
              {isTextOutput ? <FileText className="h-5 w-5 shrink-0 text-primary" /> : <FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" />}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{file.filename || `Result ${index + 1}`}</p>
                {file.size_bytes ? <p className="text-xs font-semibold text-muted-foreground">{formatBytes(file.size_bytes)}</p> : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShareFile(file)}
                className="h-9 rounded-full border-primary/20 bg-card/72 text-primary shadow-sm hover:bg-accent"
              >
                <Share2 className="mr-1.5 h-4 w-4" />
                Share
              </Button>
              <Button size="sm" onClick={() => onDownloadFile(file)} className="h-9 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                <Download className="mr-1.5 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
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

      <Card className="ax-glass-card overflow-hidden rounded-xl">
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
              <div className="flex w-fit rounded-full border border-white/60 bg-white/44 p-1 shadow-[0_16px_40px_rgba(42,35,64,0.08)] backdrop-blur-2xl">
                <button
                  type="button"
                  onClick={() => onOutputModeChange("table")}
                  disabled={isProcessing}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
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
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    outputMode === "text" ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-card/60",
                    isProcessing && "cursor-not-allowed opacity-60"
                  )}
                >
                  Text output
                </button>
              </div>

              <UploadDropzone
                uploadedFiles={uploadedFiles}
                isDragging={isDragging}
                isProcessing={isProcessing}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onFileInput={onFileInput}
              />

              <SelectedFilesTray
                uploadedFiles={uploadedFiles}
                filePreviewUrls={filePreviewUrls}
                pdfPageCounts={pdfPageCounts}
                isProcessing={isProcessing}
                onRemoveFile={onRemoveFile}
                onClearFiles={onClearFiles}
              />

              <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {uploadedFiles.length ? `${uploadedFiles.length} selected` : "No files selected"}
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {uploadedFiles.length ? `${formatBytes(uploadedSizeMb * 1024 * 1024)} · ${creditEstimate || uploadedFiles.length} estimated credits` : "Add images or PDFs to start."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {(isUploading || isProcessing) && !isComplete ? (
                    <Button
                      variant="outline"
                      onClick={onCancel}
                      className="h-11 rounded-full border-border bg-card/70 px-5 text-primary hover:bg-accent"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  ) : null}
                  <Button
                    size="lg"
                    onClick={onConvert}
                    disabled={!uploadedFiles.length || isProcessing || noCredits}
                    className="h-12 gap-2 rounded-full bg-primary px-6 text-primary-foreground shadow-[0_16px_36px_rgb(0 0 0 / 0.14)] hover:bg-primary/90"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {isProcessing ? "Working" : processLabel}
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

"use client"

import { useEffect, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react"
import {
  ArrowRight,
  FileImage,
  FileText,
  FolderUp,
  Loader2,
  PencilLine,
  Plus,
  Trash2,
  X,
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
import { acceptedUploadMimeTypes, isPdfFile } from "@/lib/upload-files"
import { companyApi, type CompanySummary } from "@/lib/api-client"
import { Symbol } from "@/components/dashboard/Symbol"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type OutputMode = "table" | "text" | "csv"

type ProgressiveUploadSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  uploadedFiles: File[]
  workspaceId?: string
  selectedCompanyId: string
  onSelectedCompanyIdChange: (companyId: string) => void
  filePreviewUrls: Record<number, string>
  pdfPageCounts: Record<number, number>
  isDragging: boolean
  isUploading: boolean
  isProcessing: boolean
  outputMode: OutputMode
  creditAvailable: number
  creditEstimate: number
  maxUploadFiles: number
  noCredits: boolean
  processLabel: string
  onOutputModeChange: (mode: OutputMode) => void
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onFileInput: (event: ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
  onClearFiles: () => void
  onProcess: () => void
  onCancel: () => void
  onOpenManual: () => void
}

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function ProgressiveUploadSheet({
  open,
  onOpenChange,
  uploadedFiles,
  workspaceId,
  selectedCompanyId,
  onSelectedCompanyIdChange,
  filePreviewUrls,
  pdfPageCounts,
  isDragging,
  isUploading,
  isProcessing,
  outputMode,
  creditAvailable,
  creditEstimate,
  maxUploadFiles,
  noCredits,
  processLabel,
  onOutputModeChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInput,
  onRemoveFile,
  onClearFiles,
  onProcess,
  onCancel,
  onOpenManual,
}: ProgressiveUploadSheetProps) {
  const [companies, setCompanies] = useState<CompanySummary[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [companiesError, setCompaniesError] = useState("")
  const [newClientName, setNewClientName] = useState("")
  const [creatingClient, setCreatingClient] = useState(false)
  const [createClientError, setCreateClientError] = useState("")
  const [companiesReloadKey, setCompaniesReloadKey] = useState(0)
  const hasPdfs = uploadedFiles.some(isPdfFile)
  const pdfPages = uploadedFiles.reduce((total, file, index) => (
    total + (isPdfFile(file) ? (pdfPageCounts[index] || 1) : 0)
  ), 0)
  const busy = isUploading || isProcessing
  const selectedCompany = companies.find(company => company.id === selectedCompanyId)
  const needsClientChoice = !selectedCompanyId && companies.length > 1
  const canProcess = Boolean(workspaceId && selectedCompanyId)
  const processButtonLabel = busy
    ? "Reading..."
    : !selectedCompanyId
      ? "Choose a client"
      : uploadedFiles.length
        ? `Read ${uploadedFiles.length} document${uploadedFiles.length === 1 ? "" : "s"}`
        : processLabel

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
          // Only auto-pick when there is a single client; with more than one,
          // leave it empty to force an explicit choice so a batch is never
          // silently filed under the default client.
          onSelectedCompanyIdChange(records.length === 1 ? records[0].id : "")
        }
      })
      .catch(() => {
        if (!mounted) return
        setCompanies([])
        setCompaniesError("Clients could not be loaded.")
      })
      .finally(() => {
        if (mounted) setCompaniesLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [companiesReloadKey, onSelectedCompanyIdChange, open, selectedCompanyId, workspaceId])

  const createClient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanName = newClientName.trim()
    if (!workspaceId || !cleanName || busy || creatingClient) return

    setCreatingClient(true)
    setCreateClientError("")
    try {
      const client = await companyApi.create(workspaceId, { name: cleanName })
      setCompanies(current => [client, ...current.filter(item => item.id !== client.id)])
      onSelectedCompanyIdChange(client.id)
      setNewClientName("")
    } catch {
      setCreateClientError("Could not add this client.")
    } finally {
      setCreatingClient(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => {
      if (!busy) onOpenChange(nextOpen)
    }}>
      <SheetContent className="w-full gap-0 bg-[var(--workspace-popout-bg)] sm:max-w-[640px]">
        <SheetHeader className="border-b border-[var(--workspace-popout-border)] px-5 py-4 pr-12">
          <div className="flex items-center gap-3">
            <Symbol name="upload-tray" size="inline" className="h-9 w-9 rounded-lg" alt="" />
            <div className="min-w-0">
              <SheetTitle className="truncate text-lg font-bold tracking-normal">Upload documents</SheetTitle>
              <SheetDescription className="mt-0.5 truncate text-xs font-medium text-[var(--workspace-muted)]">
                {selectedCompany ? selectedCompany.name : "Choose a client to continue"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">Client</span>
              <select
                value={selectedCompanyId}
                onChange={(event) => onSelectedCompanyIdChange(event.target.value)}
                disabled={busy || companiesLoading || !workspaceId}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus-visible:border-[var(--workspace-primary)] focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]/20"
              >
                <option value="">{companiesLoading ? "Loading..." : "Select a client"}</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
              {needsClientChoice ? (
                <span className="mt-1 block text-xs font-semibold text-[var(--text-attention)]">
                  Client required
                </span>
              ) : null}
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">Output</span>
              <select
                value={outputMode}
                onChange={(event) => onOutputModeChange(event.target.value as OutputMode)}
                disabled={busy}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus-visible:border-[var(--workspace-primary)] focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]/20"
              >
                <option value="table">Excel (XLSX)</option>
                <option value="csv">CSV</option>
                <option value="text">Text</option>
              </select>
            </label>
          </div>
          <details className="group rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-popout-bg)]">
            <summary className="ax-interactive flex h-9 cursor-pointer list-none items-center gap-2 rounded-lg px-3 text-xs font-semibold text-[var(--workspace-ink)] hover:bg-[var(--workspace-soft)] [&::-webkit-details-marker]:hidden">
              <Plus className="size-3.5" />
              Add client
            </summary>
            <form className="border-t border-[var(--workspace-border)] p-3" onSubmit={createClient}>
              <div className="flex gap-2">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Client name</span>
                  <input
                    value={newClientName}
                    onChange={(event) => {
                      setNewClientName(event.target.value)
                      if (createClientError) setCreateClientError("")
                    }}
                    disabled={busy || creatingClient || !workspaceId}
                    placeholder="Client name"
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus-visible:border-[var(--workspace-primary)] focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]/20"
                  />
                </label>
                <Button
                  type="submit"
                  variant="surface"
                  size="sm"
                  disabled={busy || creatingClient || !workspaceId || !newClientName.trim()}
                  className="h-9 shrink-0 px-3"
                >
                  {creatingClient ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  Add
                </Button>
              </div>
              {createClientError ? <p className="mt-2 text-xs font-semibold text-destructive">{createClientError}</p> : null}
            </form>
          </details>
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

          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
              "relative overflow-hidden rounded-lg border border-dashed px-4 py-6 text-center transition-colors",
              isDragging
                ? "border-[var(--workspace-primary)] bg-[var(--workspace-blue-soft)]"
                : "border-[var(--workspace-border)] bg-[var(--workspace-popout-bg)] hover:border-[var(--workspace-primary)]"
            )}
          >
            <span className="mx-auto flex size-9 items-center justify-center rounded-lg bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)]">
              <FolderUp className="size-4" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-bold text-foreground">
              {isDragging ? "Drop documents" : "Add documents"}
            </p>
            <p className="mt-1 text-xs font-medium text-[var(--workspace-muted)]">
              PDF, JPG or PNG / up to {maxUploadFiles} files
            </p>
            <label
              htmlFor="progressive-upload-input"
              className={cn(
                buttonVariants({ variant: "surface", size: "sm" }),
                "mt-3 cursor-pointer",
                busy && "pointer-events-none opacity-50"
              )}
            >
              <FolderUp className="size-4" />
              Choose files
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
          </div>

          {uploadedFiles.length ? (
            <div className="overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-popout-bg)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--workspace-border)] bg-[var(--workspace-table-header)] px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-7 items-center rounded-full border border-[var(--workspace-border)] bg-[var(--workspace-popout-bg)] px-2.5 text-[11px] font-semibold text-[var(--workspace-ink)]">
                    {uploadedFiles.length}/{maxUploadFiles} files
                  </span>
                  {hasPdfs ? (
                    <span className="inline-flex h-7 items-center rounded-full border border-[var(--workspace-border)] bg-[var(--workspace-popout-bg)] px-2.5 text-[11px] font-semibold text-[var(--workspace-muted)]">
                      {pdfPages} PDF page{pdfPages === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={onClearFiles}
                      disabled={busy}
                      className="size-8 text-[var(--workspace-muted)] hover:bg-[var(--workspace-soft)] hover:text-[var(--workspace-ink)]"
                      aria-label="Clear files"
                    >
                      <X className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Clear files</TooltipContent>
                </Tooltip>
              </div>
              <div className="max-h-48 divide-y divide-border overflow-y-auto">
                  {uploadedFiles.map((file, index) => {
                    const pdf = isPdfFile(file)
                    const pageCount = pdfPageCounts[index]
                    const previewUrl = filePreviewUrls[index]
                    return (
                      <div
                        key={`${file.name}-${file.size}-${index}`}
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-[var(--workspace-ink)]">
                          {previewUrl ? (
                            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                          ) : pdf ? (
                            <FileText className="size-5" />
                          ) : (
                            <FileImage className="size-5" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">{file.name}</span>
                          <span className="mt-0.5 block truncate text-xs font-medium text-foreground/70">
                            {pdf ? `${pageCount || 1} page${pageCount === 1 ? "" : "s"}` : "Image"} - {fileSize(file.size)}
                          </span>
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveFile(index)}
                              disabled={busy}
                              className="size-8 text-[var(--workspace-muted)] hover:bg-[var(--workspace-soft)] hover:text-[var(--workspace-danger)]"
                              aria-label={`Remove ${file.name}`}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">Remove</TooltipContent>
                        </Tooltip>
                      </div>
                    )
                  })}
              </div>
            </div>
          ) : null}
        </div>

        <SheetFooter className="gap-2 border-t border-[var(--workspace-popout-border)] bg-[var(--workspace-popout-bg)] px-5 py-3">
          <div className="flex items-center justify-between gap-4 px-1">
            <p className="text-xs font-semibold text-foreground">
              {creditEstimate} page{creditEstimate === 1 ? "" : "s"} / {creditEstimate} credit{creditEstimate === 1 ? "" : "s"}
            </p>
            <p className="text-right text-xs font-semibold text-foreground/70">
              {creditAvailable.toLocaleString()} available
            </p>
          </div>
          <Button
            type="button"
            variant="glossy"
            size="lg"
            onClick={onProcess}
            disabled={!uploadedFiles.length || busy || noCredits || !canProcess}
            className="w-full"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            <span>{processButtonLabel}</span>
          </Button>
          {!busy ? (
            <Button
              type="button"
              variant="surface"
              onClick={onOpenManual}
              className="w-full"
            >
              <PencilLine className="size-4" />
              Enter a document manually
            </Button>
          ) : null}
          {busy ? (
            <Button type="button" variant="surface" onClick={onCancel} className="w-full">
              Cancel reading
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

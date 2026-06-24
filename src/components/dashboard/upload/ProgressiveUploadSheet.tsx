"use client"

import { useEffect, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  FileImage,
  FileText,
  FolderUp,
  Loader2,
  Plus,
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
import { companyApi, type CompanySummary } from "@/lib/api-client"

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
}

const workspacePrimaryControlClass =
  "border border-[var(--workspace-primary)] bg-[var(--workspace-primary)] text-white hover:border-[var(--workspace-primary-hover)] hover:bg-[var(--workspace-primary-hover)] focus-visible:ring-[var(--workspace-primary)]/30"

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
}: ProgressiveUploadSheetProps) {
  const m = useMotionTokens()
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
    ? "Reading documents…"
    : !selectedCompanyId
      ? "Select client first"
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
      <SheetContent className="w-full gap-0 bg-[var(--workspace-popout-bg)] sm:max-w-[760px]">
        <SheetHeader className="border-b border-[var(--workspace-popout-border)] px-6 py-5 pr-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--workspace-primary)]">New stack</p>
          <SheetTitle className="text-xl font-bold tracking-tight">
            {selectedCompany ? `Upload to ${selectedCompany.name}` : "Upload documents"}
          </SheetTitle>
          <SheetDescription className="sr-only">Upload documents for review.</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-foreground">Client</span>
              <select
                value={selectedCompanyId}
                onChange={(event) => onSelectedCompanyIdChange(event.target.value)}
                disabled={busy || companiesLoading || !workspaceId}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="">{companiesLoading ? "Loading..." : "Select a client"}</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
              {needsClientChoice ? (
                <span className="mt-1.5 block text-xs font-semibold text-amber-700">
                  Pick a client
                </span>
              ) : null}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-foreground">Format</span>
              <select
                value={outputMode}
                onChange={(event) => onOutputModeChange(event.target.value as OutputMode)}
                disabled={busy}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="table">Excel (XLSX)</option>
                <option value="csv">CSV</option>
              </select>
            </label>
          </div>
          <form
            className="rounded-lg border border-[var(--workspace-border)] bg-white p-3"
            onSubmit={createClient}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="min-w-0 flex-1">
                <span className="mb-1.5 block text-xs font-semibold text-foreground">Add client</span>
                <input
                  value={newClientName}
                  onChange={(event) => {
                    setNewClientName(event.target.value)
                    if (createClientError) setCreateClientError("")
                  }}
                  disabled={busy || creatingClient || !workspaceId}
                  placeholder="Client name"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/40"
                />
              </label>
              <Button
                type="submit"
                variant="surface"
                size="sm"
                disabled={busy || creatingClient || !workspaceId || !newClientName.trim()}
                className="h-10 shrink-0 px-4"
              >
                {creatingClient ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Add
              </Button>
            </div>
            {createClientError ? (
              <p className="mt-2 text-xs font-semibold text-destructive">{createClientError}</p>
            ) : null}
          </form>
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
              "rounded-lg border border-dashed px-4 py-10 text-center transition-colors",
              isDragging ? "border-[var(--workspace-primary)] bg-[var(--workspace-blue-soft)]" : "border-[var(--workspace-border)] bg-white hover:border-[var(--workspace-primary)]"
            )}
          >
            <FolderUp className="mx-auto size-7 text-[var(--workspace-blue)]" />
            <p className="mt-2 text-sm font-bold text-foreground">
              {isDragging ? "Drop documents here" : "Drop files here"}
            </p>
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
                <p className="text-xs font-semibold text-foreground">
                  {uploadedFiles.length} of {maxUploadFiles} files
                  {hasPdfs ? ` · ${pdfPages} PDF page${pdfPages === 1 ? "" : "s"} split for review` : ""}
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={onClearFiles} disabled={busy} className="h-7 px-2 text-xs">
                  Clear
                </Button>
              </div>
              <motion.div
                variants={m.staggerParent()}
                initial="hidden"
                animate="show"
                className="max-h-56 divide-y divide-border overflow-y-auto"
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
                          <span className="block truncate text-xs font-medium text-foreground/70">
                            {pdf ? `${pageCount || 1} page${pageCount === 1 ? "" : "s"}` : "Image"} · {fileSize(file.size)}
                          </span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveFile(index)}
                          disabled={busy}
                          className="size-8 text-foreground/70 hover:text-foreground"
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
        </div>

        <SheetFooter className="gap-3 border-t border-[var(--workspace-popout-border)] bg-[var(--workspace-popout-bg)] px-6 py-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--workspace-popout-border)] bg-white px-3 py-2.5">
            <p className="text-xs font-semibold text-foreground">
              {creditEstimate} page{creditEstimate === 1 ? "" : "s"} · {creditEstimate} credit{creditEstimate === 1 ? "" : "s"}
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
            className={cn("w-full", workspacePrimaryControlClass)}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={processButtonLabel}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={m.tFast}
              >
                {processButtonLabel}
              </motion.span>
            </AnimatePresence>
          </Button>
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

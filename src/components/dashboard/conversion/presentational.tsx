"use client"

import { useState, type MouseEvent as ReactMouseEvent } from "react"
import {
  AlertCircle,
  Loader2,
  Percent,
  RotateCcw,
  Scale,
  ScanLine,
  TriangleAlert,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { InlineAction } from "@/components/ui/inline-action"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { FIELD_LABEL } from "@/lib/review-vocab"
import { vatCheck } from "@/lib/bookkeeper-copy"
import { cn } from "@/lib/utils"
import type { JobDocumentRecord, ResolvedDocumentMode } from "@/lib/api-client"
import { resultSummary, structuredRows } from "./helpers"
import type { BookkeeperFigures, RecoverableJob, ResultFile, ResultPreview, WorkspaceBanner } from "./types"

export function InvoiceDraftBillAction({
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

export function WorkspaceErrorBanner({ banner, onDismiss }: { banner?: WorkspaceBanner | null; onDismiss?: () => void }) {
  if (!banner) return null

  return (
    <div
      role={banner.tone === "error" ? "alert" : "status"}
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between",
        banner.tone === "error" && "border-[color-mix(in_srgb,var(--workspace-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--workspace-danger)_7%,var(--workspace-popout-bg))] text-[var(--workspace-danger)]",
        banner.tone === "warning" && "border-[color-mix(in_srgb,var(--workspace-warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--workspace-warning)_7%,var(--workspace-popout-bg))] text-[var(--workspace-warning)]",
        (!banner.tone || banner.tone === "info") && "border-[var(--workspace-selection-border)] bg-[var(--workspace-blue-soft)] text-[var(--workspace-ink)]"
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="size-8 hover:bg-[var(--workspace-soft)]"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function AutoDetectionPanel({
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
    <WorkspaceSection title="Document types" icon={<ScanLine />} compact>
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-[var(--workspace-border)]">
        {autoDocuments.map(document => {
          const detected = document.detected_mode
          const needsSelection = !document.resolved_mode
          const manuallySelected = detected === "needs_manual_selection" && Boolean(document.resolved_mode)
          const selectedMode = choices[document.id]
            || document.resolved_mode
            || (detected && detected !== "needs_manual_selection" ? detected : "table")
          const busy = overridingDocumentId === document.id

          return (
            <div key={document.id} className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{document.original_filename}</p>
                <div className="mt-1.5">
                  {needsSelection ? (
                    <StatusBadge tone="review" size="sm">Choose type</StatusBadge>
                  ) : (
                    <StatusBadge tone="info" size="sm">
                      {labels[document.resolved_mode as ResolvedDocumentMode]}
                      {manuallySelected ? " selected" : ""}
                    </StatusBadge>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <select
                  value={selectedMode}
                  onChange={event => setChoices(prev => ({
                    ...prev,
                    [document.id]: event.target.value as ResolvedDocumentMode,
                  }))}
                  disabled={busy}
                  className="h-9 min-w-40 rounded-lg border border-[var(--workspace-button-border)] bg-background px-3 text-sm font-medium text-foreground outline-none focus:border-[var(--workspace-primary)] focus:ring-2 focus:ring-[var(--workspace-primary)]/20"
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
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {needsSelection ? "Read" : "Update"}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </WorkspaceSection>
  )
}

export function ResumeBatchBanner({
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
    <div className="mb-3 flex flex-col gap-3 rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-popout-bg)] p-3 text-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)]">
          <RotateCcw className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">Unfinished batch</p>
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
        {recoveryLoading ? "Resuming..." : "Resume"}
      </InlineAction>
    </div>
  )
}

export function BookkeeperBreakdown({ figures, layout = "row" }: { figures: BookkeeperFigures; layout?: "row" | "grid" }) {
  const currency = figures.currency ? String(figures.currency) : ""
  const fmt = (value: any) => (value === undefined || value === null || value === "" ? "-" : [currency, value].filter(Boolean).join(" "))
  const check = vatCheck(figures.subtotal, figures.vat, figures.total)
  const cells: Array<[string, string]> = [
    [FIELD_LABEL.net, fmt(figures.subtotal)],
    [FIELD_LABEL.vat, fmt(figures.vat)],
    [FIELD_LABEL.gross, fmt(figures.total)],
  ]
  const VerdictIcon = check.state === "ok" ? Scale : check.state === "mismatch" ? TriangleAlert : Percent
  const badgeTone = check.state === "mismatch" ? "warning" : check.state === "ok" ? "info" : "neutral"
  const badgeLabel = check.state === "ok" ? "Balanced" : check.state === "mismatch" ? "Check totals" : "VAT check"

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-popout-bg)] p-3",
        layout === "grid" && "w-full",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)]">
        <VerdictIcon className="size-4" aria-hidden="true" />
      </span>
      <dl className="grid min-w-0 flex-1 grid-cols-3 gap-x-4">
        {cells.map(([label, value], index) => (
          <div key={label} className="min-w-0">
            <dt className="truncate text-[10px] font-semibold uppercase text-[var(--workspace-muted)]">{label}</dt>
            <dd
              className={cn(
                "truncate text-[13px] font-semibold tabular-nums text-[var(--workspace-ink)]",
                index === cells.length - 1 && "text-[var(--workspace-primary)]",
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="cursor-help rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]/30">
            <StatusBadge tone={badgeTone} size="sm">{badgeLabel}</StatusBadge>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-64">
          <span className="block font-semibold">{check.label}</span>
          <span className="mt-0.5 block text-background/80">{check.detail}</span>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export function ResultThumb({ file, preview, isTextOutput, compact = false }: { file: ResultFile; preview?: ResultPreview; isTextOutput: boolean; compact?: boolean }) {
  const summary = resultSummary(file)
  const structured = structuredRows(file)
  const height = compact ? "min-h-[184px]" : "min-h-[232px]"
  if (preview?.loading) {
    return (
      <div className={cn("flex h-full items-center justify-center rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-popout-bg)]", height)}>
        <Loader2 className="h-4 w-4 animate-spin text-[var(--workspace-primary)]" />
      </div>
    )
  }

  if (isTextOutput || preview?.text) {
    const lines = (preview?.text || "").split(/\r?\n/).filter(Boolean).slice(0, 5)
    return (
      <div className={cn("flex h-full flex-col gap-2 overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-popout-bg)] p-4", height)}>
        {lines.length ? lines.map((line, index) => (
          <span key={index} className="truncate text-xs font-medium text-[var(--workspace-ink)]">
            {line}
          </span>
        )) : (
          <span className="text-xs font-medium text-[var(--workspace-muted)]">Text output</span>
        )}
      </div>
    )
  }

  if (structured) {
    const rows = structured.rows.slice(0, compact ? 3 : 5)
    return (
      <div className={cn("overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-popout-bg)]", height)}>
        <div className="grid grid-cols-2 border-b border-[var(--workspace-selection-border)] bg-[var(--workspace-blue-soft)] px-3 py-2 text-[11px] font-semibold text-[var(--workspace-muted)]">
          <span className="truncate">{summary.identityLabel}</span>
          <span className="text-right">{summary.amountLabel}</span>
          <span className="truncate text-sm font-semibold text-[var(--workspace-ink)]">{summary.identity}</span>
          <span className="text-right text-sm font-bold text-[var(--workspace-primary)]">{summary.amount}</span>
        </div>
        <div className="grid grid-cols-3 border-b border-[var(--workspace-border)] bg-[var(--workspace-table-header)] px-2 py-1.5 text-[10px] font-semibold text-[var(--workspace-table-head)]">
          {structured.columns.slice(0, 3).map(column => <span key={column} className="truncate px-1">{column}</span>)}
        </div>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-3 border-b border-[var(--workspace-border)] px-2 py-1.5 text-xs text-[var(--workspace-ink)] last:border-b-0">
            {row.slice(0, 3).map((value, cellIndex) => <span key={cellIndex} className="truncate px-1">{value || "-"}</span>)}
          </div>
        ))}
      </div>
    )
  }

  const rows = preview?.table?.length ? preview.table.slice(0, 5) : []

  return (
    <div className={cn("h-full overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-popout-bg)]", height)}>
      <div className="grid grid-cols-4 bg-[var(--workspace-primary)]">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className="h-5 border-r border-[color-mix(in_srgb,var(--workspace-popout-bg)_28%,transparent)] last:border-r-0" />
        ))}
      </div>
      {rows.length ? rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 border-b border-[var(--workspace-border)] last:border-b-0">
          {Array.from({ length: 4 }).map((_, cellIndex) => (
            <span key={cellIndex} className="truncate border-r border-[var(--workspace-border)] px-3 py-2 text-xs font-medium text-[var(--workspace-ink)] last:border-r-0">
              {row?.[cellIndex] || " "}
            </span>
          ))}
        </div>
      )) : (
        <div className="grid gap-1.5 p-3">
          <div className="h-2 rounded bg-[var(--workspace-blue-soft)]" />
          <div className="h-2 w-4/5 rounded bg-[var(--workspace-blue-soft)]" />
          <div className="h-2 w-3/5 rounded bg-[var(--workspace-blue-soft)]" />
        </div>
      )}
    </div>
  )
}

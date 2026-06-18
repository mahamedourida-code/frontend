"use client"

import { useState, type MouseEvent as ReactMouseEvent } from "react"
import { AlertCircle, Loader2, ScanLine, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InlineAction } from "@/components/ui/inline-action"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { AnomalyChip, type AnomalyTone } from "@/components/dashboard/AnomalyChip"
import { Symbol } from "@/components/dashboard/Symbol"
import { FIELD_LABEL } from "@/lib/review-vocab"
import { vatCheck } from "@/lib/bookkeeper-copy"
import { cn } from "@/lib/utils"
import type { JobDocumentRecord, ResolvedDocumentMode } from "@/lib/api-client"
import { workspacePanelSurfaceClass } from "./constants"
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
      tone="success"
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
    <div className={cn("mb-3 flex flex-col gap-3 rounded-md border p-3 text-foreground sm:flex-row sm:items-center sm:justify-between", workspacePanelSurfaceClass)}>
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold">Return to unfinished stack</p>
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
        {recoveryLoading ? "Resuming..." : "Open stack"}
      </InlineAction>
    </div>
  )
}

// C16 — the bookkeeper breakdown: Net / VAT / Total surfaced from the extracted
// fields plus a one-glance reconciliation chip (vatCheck). Reuses AnomalyChip so
// it matches the rest of the board; only renders for invoice/receipt docs.
export function BookkeeperBreakdown({ figures, layout = "row" }: { figures: BookkeeperFigures; layout?: "row" | "grid" }) {
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

export function ResultThumb({ file, preview, isTextOutput, compact = false }: { file: ResultFile; preview?: ResultPreview; isTextOutput: boolean; compact?: boolean }) {
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
          <span className="truncate text-sm font-semibold text-[var(--data-entity)]">{summary.identity}</span>
          <span className="text-right text-sm font-bold text-[var(--data-money)]">{summary.amount}</span>
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

"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Landmark,
  ListChecks,
  Loader2,
  Receipt,
  ScanLine,
} from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

import { SegmentedTabs } from "@/components/dashboard/SegmentedTabs"
import { StatusBadge, type StatusTone } from "@/components/dashboard/StatusBadge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type ReviewFieldPath = Array<string | number>

export type ReviewField = {
  label: string
  path: string
  value: string
}

export type ReviewTableColumn = {
  label: string
  key: string
  numeric?: boolean
  amount?: boolean
}

export type ReviewTable = {
  root: string
  columns: ReviewTableColumn[]
  rows: Record<string, unknown>[]
}

export type ReviewTotal = {
  label: string
  value: string
  emphasis?: boolean
}

export interface DocumentReviewWorkspaceProps {
  backHref: string
  filename: string
  documentType: string
  documentTypeLabel: string
  status: string
  statusLabel: string
  sourceUrl?: string
  sourceContentType?: string | null
  exceptionCount: number
  fields: ReviewField[]
  identity?: string
  summaryLabel: string
  summaryValue: string
  lineItems?: ReviewTable | null
  reviewGrid?: unknown[][] | null
  uncertainCells?: string[]
  totals?: ReviewTotal[]
  savingPath?: string | null
  downloading?: boolean
  markingReady?: boolean
  creatingDraftBill?: boolean
  draftBillCreated?: boolean
  canMarkReady?: boolean
  canCreateDraftBill?: boolean
  onSave: (fieldPath: ReviewFieldPath, value: string) => void
  onDownload: () => void
  onMarkReady: () => void
  onCreateDraftBill: () => void
}

const STATUS_TONES: Record<string, StatusTone> = {
  ready: "success",
  published: "success",
  edited: "review",
  failed: "error",
  needs_review: "warning",
  deleted: "neutral",
}

function documentIcon(documentType: string) {
  if (documentType === "receipt") return Receipt
  if (documentType === "bank_statement") return Landmark
  if (documentType === "table") return FileSpreadsheet
  if (documentType === "notes") return ScanLine
  return FileText
}

function fieldValueClass(label: string) {
  const normalized = label.toLowerCase()
  if (normalized.includes("due")) return "ax-data-due"
  if (normalized.includes("date") || normalized.includes("period")) return "ax-data-date"
  if (normalized.includes("number") || normalized.includes("reference") || normalized.includes("ref")) return "ax-data-reference"
  if (normalized.includes("total") || normalized.includes("amount") || normalized.includes("balance") || normalized.includes("price")) return "ax-data-money"
  if (normalized.includes("vendor") || normalized.includes("supplier") || normalized.includes("merchant") || normalized.includes("account holder") || normalized === "from") return "ax-data-entity"
  return "text-[var(--workspace-ink)]"
}

function IconAction({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip delayDuration={350}>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="surface"
          size="icon"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          className="size-9 shadow-none hover:translate-y-0 hover:shadow-none active:translate-y-0 active:shadow-none"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={7}>{label}</TooltipContent>
    </Tooltip>
  )
}

function ReviewInput({
  label,
  value,
  path,
  savingPath,
  onSave,
}: {
  label: string
  value: string
  path: string
  savingPath?: string | null
  onSave: DocumentReviewWorkspaceProps["onSave"]
}) {
  const saving = savingPath === path

  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-[var(--workspace-muted)]">
        {label}
        {saving ? <Loader2 className="size-3 animate-spin" aria-label="Saving" /> : null}
      </span>
      <input
        key={`${path}-${value}`}
        defaultValue={value}
        onBlur={(event) => {
          if (event.target.value !== value) onSave([path], event.target.value)
        }}
        className={cn(
          "ax-interactive h-9 w-full rounded-md border border-[var(--workspace-button-border)] bg-white px-3 text-[13px] outline-none",
          "hover:border-[var(--workspace-muted)] focus:border-[var(--workspace-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--workspace-primary)_18%,transparent)]",
          fieldValueClass(label),
        )}
        placeholder="-"
      />
    </label>
  )
}

function ExceptionMark() {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          aria-label="Check extracted value"
          className="inline-flex size-5 shrink-0 cursor-help items-center justify-center rounded-full text-[var(--text-attention)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-attention)]/25"
        >
          <AlertCircle className="size-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">Check against the source</TooltipContent>
    </Tooltip>
  )
}

function SourcePanel({
  filename,
  sourceUrl,
  sourceContentType,
}: Pick<DocumentReviewWorkspaceProps, "filename" | "sourceUrl" | "sourceContentType">) {
  const isPdf = Boolean(sourceContentType?.toLowerCase().includes("pdf"))

  return (
    <section className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-white lg:h-[calc(100dvh-9.25rem)] lg:min-h-[560px]">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--workspace-border)] px-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="size-4 shrink-0" />
          <h2 className="truncate text-[13px] font-medium">Source</h2>
        </div>
        {sourceUrl ? (
          <Tooltip delayDuration={350}>
            <TooltipTrigger asChild>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open source"
                className="ax-interactive inline-flex size-8 items-center justify-center rounded-full text-[var(--workspace-muted)] outline-none hover:bg-[var(--workspace-soft)] hover:text-[var(--workspace-ink)] focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]/25"
              >
                <ExternalLink className="size-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">Open source</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[var(--workspace-soft)] p-3">
        {sourceUrl ? (
          isPdf ? (
            <iframe
              src={sourceUrl}
              title={filename}
              className="h-full min-h-[520px] w-full border-0 bg-white"
            />
          ) : (
            <img
              src={sourceUrl}
              alt={filename}
              className="max-h-full w-full object-contain"
            />
          )
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center gap-2 text-center text-[13px] text-[var(--workspace-muted)]">
            <FileText className="size-6" />
            <span>No source preview</span>
          </div>
        )}
      </div>
    </section>
  )
}

function EditableTable({
  table,
  uncertain,
  savingPath,
  onSave,
}: {
  table: ReviewTable
  uncertain: Set<string>
  savingPath?: string | null
  onSave: DocumentReviewWorkspaceProps["onSave"]
}) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead className="sticky top-0 z-[2]">
          <tr className="border-b border-[var(--workspace-border)] bg-[var(--workspace-table-header)]">
            {table.columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "h-9 px-3 text-[12px] font-medium text-[var(--workspace-table-head)]",
                  column.numeric ? "text-right" : "text-left",
                  column.key === "description" && "min-w-[260px] w-[34%]",
                  column.numeric && "min-w-[108px]",
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-[var(--workspace-border)] last:border-b-0 hover:bg-[var(--workspace-row-hover)]"
            >
              {table.columns.map((column, columnIndex) => {
                const current = String(row[column.key] ?? "")
                const path = `${table.root}.${rowIndex}.${column.key}`
                const isUncertain = uncertain.has(`${rowIndex + 1}:${columnIndex}`)
                const saving = savingPath === path

                return (
                  <td
                    key={column.key}
                    className={cn(
                      "h-10 px-1.5 py-1 align-middle",
                      column.key === "description" && "min-w-[260px] w-[34%]",
                      column.numeric && "min-w-[108px]",
                    )}
                  >
                    <div className="relative flex min-w-0 items-center">
                      <input
                        key={`${path}-${current}`}
                        defaultValue={current}
                        aria-label={`${column.label}, row ${rowIndex + 1}`}
                        onBlur={(event) => {
                          if (event.target.value !== current) {
                            onSave([table.root, rowIndex, column.key], event.target.value)
                          }
                        }}
                        className={cn(
                          "ax-interactive h-8 w-full min-w-[80px] rounded-md border border-transparent bg-transparent px-2 text-[13px] text-[var(--workspace-ink)] outline-none",
                          "hover:bg-white focus:border-[var(--workspace-primary)] focus:bg-white focus:ring-2 focus:ring-[color-mix(in_srgb,var(--workspace-primary)_18%,transparent)]",
                          isUncertain && "border-[color-mix(in_srgb,var(--text-attention)_45%,transparent)] bg-[color-mix(in_srgb,var(--text-attention)_6%,white)] pe-7",
                          column.numeric && "text-right tabular-nums",
                          column.amount && "ax-data-money",
                        )}
                      />
                      <span className="absolute end-1.5 flex items-center">
                        {saving ? <Loader2 className="size-3 animate-spin" aria-label="Saving" /> : isUncertain ? <ExceptionMark /> : null}
                      </span>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EditableGrid({
  grid,
  uncertain,
  savingPath,
  onSave,
}: {
  grid: unknown[][]
  uncertain: Set<string>
  savingPath?: string | null
  onSave: DocumentReviewWorkspaceProps["onSave"]
}) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <tbody>
          {grid.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                "border-b border-[var(--workspace-border)] last:border-b-0",
                rowIndex === 0
                  ? "sticky top-0 z-[2] bg-[var(--workspace-table-header)]"
                  : "hover:bg-[var(--workspace-row-hover)]",
              )}
            >
              {row.map((cell, cellIndex) => {
                const current = String(cell ?? "")
                const path = `review_grid.${rowIndex}.${cellIndex}`
                const isUncertain = rowIndex !== 0 && uncertain.has(`${rowIndex}:${cellIndex}`)
                const saving = savingPath === path

                return (
                  <td key={cellIndex} className="h-10 border-e border-[var(--workspace-border)] px-1.5 py-1 last:border-e-0">
                    <div className="relative flex min-w-0 items-center">
                      <input
                        key={`${path}-${current}`}
                        defaultValue={current}
                        aria-label={rowIndex === 0 ? `Column ${cellIndex + 1}` : `Row ${rowIndex}, column ${cellIndex + 1}`}
                        onBlur={(event) => {
                          if (event.target.value !== current) {
                            onSave(["review_grid", rowIndex, cellIndex], event.target.value)
                          }
                        }}
                        className={cn(
                          "ax-interactive h-8 w-full min-w-[110px] rounded-md border border-transparent bg-transparent px-2 text-[13px] outline-none",
                          "focus:border-[var(--workspace-primary)] focus:bg-white focus:ring-2 focus:ring-[color-mix(in_srgb,var(--workspace-primary)_18%,transparent)]",
                          rowIndex === 0 ? "font-medium text-[var(--workspace-table-head)]" : "text-[var(--workspace-ink)] hover:bg-white",
                          isUncertain && "border-[color-mix(in_srgb,var(--text-attention)_45%,transparent)] bg-[color-mix(in_srgb,var(--text-attention)_6%,white)] pe-7",
                        )}
                      />
                      <span className="absolute end-1.5 flex items-center">
                        {saving ? <Loader2 className="size-3 animate-spin" aria-label="Saving" /> : isUncertain ? <ExceptionMark /> : null}
                      </span>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FieldsPanel({
  fields,
  identity,
  summaryLabel,
  summaryValue,
  lineItems,
  reviewGrid,
  uncertain,
  totals,
  savingPath,
  onSave,
}: Pick<
  DocumentReviewWorkspaceProps,
  "fields" | "identity" | "summaryLabel" | "summaryValue" | "lineItems" | "reviewGrid" | "totals" | "savingPath" | "onSave"
> & { uncertain: Set<string> }) {
  const rowCount = lineItems?.rows.length ?? Math.max((reviewGrid?.length || 1) - 1, 0)

  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-[var(--workspace-border)] bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--workspace-border)] px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <ListChecks className="size-4 shrink-0" />
            <h2 className="text-[13px] font-medium">Details</h2>
          </div>
          <div className="min-w-0 text-right">
            <span className="block text-[11px] text-[var(--workspace-muted)]">{summaryLabel}</span>
            <span className="ax-data-money block max-w-48 truncate text-[15px]" title={summaryValue}>{summaryValue}</span>
          </div>
        </div>
        <div className="p-4">
          {fields.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {fields.map((field) => (
                <ReviewInput
                  key={field.path}
                  {...field}
                  savingPath={savingPath}
                  onSave={onSave}
                />
              ))}
            </div>
          ) : (
            <p className="ax-data-entity truncate text-[14px] font-medium">
              {identity || "Extracted document"}
            </p>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-white">
        <div className="flex h-11 items-center justify-between gap-3 border-b border-[var(--workspace-border)] px-4">
          <div className="flex min-w-0 items-center gap-2">
            <FileSpreadsheet className="size-4 shrink-0" />
            <h2 className="text-[13px] font-medium">{lineItems ? "Line items" : "Extracted rows"}</h2>
          </div>
          <span className="text-[12px] tabular-nums text-[var(--workspace-muted)]">
            {rowCount} {rowCount === 1 ? "row" : "rows"}
          </span>
        </div>

        {lineItems ? (
          lineItems.rows.length ? (
            <EditableTable
              table={lineItems}
              uncertain={uncertain}
              savingPath={savingPath}
              onSave={onSave}
            />
          ) : (
            <p className="px-4 py-10 text-center text-[13px] text-[var(--workspace-muted)]">No line items found.</p>
          )
        ) : reviewGrid?.length ? (
          <EditableGrid
            grid={reviewGrid}
            uncertain={uncertain}
            savingPath={savingPath}
            onSave={onSave}
          />
        ) : (
          <p className="px-4 py-10 text-center text-[13px] text-[var(--workspace-muted)]">No extracted rows.</p>
        )}

        {totals?.length ? (
          <dl className="ms-auto w-full max-w-sm border-t border-[var(--workspace-border)] px-4 py-3">
            {totals.map((total) => (
              <div
                key={total.label}
                className={cn(
                  "flex items-center justify-between gap-4 py-1.5 text-[13px]",
                  total.emphasis && "mt-1 border-t border-[var(--workspace-ink)] pt-3 text-[15px]",
                )}
              >
                <dt className={cn("text-[var(--workspace-muted)]", total.emphasis && "font-medium text-[var(--workspace-ink)]")}>
                  {total.label}
                </dt>
                <dd className={cn("ax-data-money min-w-0 truncate text-right", total.emphasis && "text-[18px]")} title={total.value}>
                  {total.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>
    </div>
  )
}

export function DocumentReviewWorkspace({
  backHref,
  filename,
  documentType,
  documentTypeLabel,
  status,
  statusLabel,
  sourceUrl,
  sourceContentType,
  exceptionCount,
  fields,
  identity,
  summaryLabel,
  summaryValue,
  lineItems,
  reviewGrid,
  uncertainCells = [],
  totals,
  savingPath,
  downloading = false,
  markingReady = false,
  creatingDraftBill = false,
  draftBillCreated = false,
  canMarkReady = false,
  canCreateDraftBill = false,
  onSave,
  onDownload,
  onMarkReady,
  onCreateDraftBill,
}: DocumentReviewWorkspaceProps) {
  const [mobileView, setMobileView] = useState<"fields" | "source">("fields")
  const reduceMotion = useReducedMotion()
  const uncertain = useMemo(() => new Set(uncertainCells), [uncertainCells])
  const DocumentIcon = documentIcon(documentType)
  const primaryAction = canMarkReady ? "ready" : canCreateDraftBill ? "bill" : null

  const fieldsPanel = (
    <FieldsPanel
      fields={fields}
      identity={identity}
      summaryLabel={summaryLabel}
      summaryValue={summaryValue}
      lineItems={lineItems}
      reviewGrid={reviewGrid}
      uncertain={uncertain}
      totals={totals}
      savingPath={savingPath}
      onSave={onSave}
    />
  )

  const sourcePanel = (
    <SourcePanel
      filename={filename}
      sourceUrl={sourceUrl}
      sourceContentType={sourceContentType}
    />
  )

  return (
    <div className="min-h-[calc(100svh-5rem)] text-[var(--workspace-ink)]">
      <header className="sticky top-14 z-30 -mx-3 mb-3 border-b border-[var(--workspace-border)] bg-white/95 backdrop-blur sm:-mx-5 lg:-mx-6">
        <div className="mx-auto flex min-h-14 max-w-[1560px] items-center gap-2 px-3 py-2 sm:px-5 lg:px-6">
          <Tooltip delayDuration={350}>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="surface"
                size="icon"
                className="size-9 shadow-none hover:translate-y-0 hover:shadow-none active:translate-y-0 active:shadow-none"
              >
                <Link href={backHref} aria-label="Back to batch">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={7}>Back to batch</TooltipContent>
          </Tooltip>

          <span className="hidden size-9 shrink-0 items-center justify-center rounded-md border border-[var(--workspace-border)] bg-[var(--workspace-soft)] sm:inline-flex">
            <DocumentIcon className="size-4" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-[13px] font-medium sm:text-[14px]">{filename}</p>
              <StatusBadge
                tone={STATUS_TONES[status] || "warning"}
                size="sm"
                showIcon={false}
                className="hidden shadow-none sm:inline-flex"
              >
                {statusLabel}
              </StatusBadge>
            </div>
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] text-[var(--workspace-muted)]">
              {exceptionCount === 0 ? <span className="truncate sm:hidden">{statusLabel}</span> : null}
              <span className="hidden truncate sm:inline">{documentTypeLabel}</span>
              {exceptionCount > 0 ? (
                <>
                  <span className="hidden sm:inline" aria-hidden="true">/</span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[var(--text-attention)]">
                    <AlertCircle className="size-3" />
                    <span className="sm:hidden">{exceptionCount} checks</span>
                    <span className="hidden sm:inline">{exceptionCount} to check</span>
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div className="ms-auto flex shrink-0 items-center gap-1.5">
            <IconAction label="Download XLSX" disabled={downloading} onClick={onDownload}>
              {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            </IconAction>

            {primaryAction === "ready" ? (
              <Button
                type="button"
                variant="glossy"
                size="sm"
                onClick={onMarkReady}
                disabled={markingReady || Boolean(savingPath)}
                className="h-9 px-3.5 shadow-none hover:shadow-none active:shadow-none"
              >
                {markingReady ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                <span className="sm:hidden">Ready</span>
                <span className="hidden sm:inline">Mark ready</span>
              </Button>
            ) : primaryAction === "bill" ? (
              <Button
                type="button"
                variant="glossy"
                size="sm"
                onClick={onCreateDraftBill}
                disabled={creatingDraftBill || draftBillCreated}
                className="h-9 px-3.5 shadow-none hover:shadow-none active:shadow-none"
              >
                {creatingDraftBill ? <Loader2 className="size-4 animate-spin" /> : draftBillCreated ? <Check className="size-4" /> : <Receipt className="size-4" />}
                <span className="sm:hidden">{draftBillCreated ? "Created" : "Draft bill"}</span>
                <span className="hidden sm:inline">{draftBillCreated ? "Draft bill created" : "Create draft bill"}</span>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1560px]">
        <div className="mb-3 flex justify-center lg:hidden">
          <SegmentedTabs
            value={mobileView}
            onValueChange={(value) => setMobileView(value as "fields" | "source")}
            size="sm"
            aria-label="Document review view"
            tabs={[
              { value: "fields", label: "Fields", icon: <ListChecks /> },
              { value: "source", label: "Source", icon: <FileText /> },
            ]}
          />
        </div>

        <div className="hidden items-start gap-3 lg:grid lg:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)]">
          <div className="sticky top-[8.25rem]">{sourcePanel}</div>
          {fieldsPanel}
        </div>

        <div className="lg:hidden">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={mobileView}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: reduceMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              {mobileView === "fields" ? fieldsPanel : sourcePanel}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

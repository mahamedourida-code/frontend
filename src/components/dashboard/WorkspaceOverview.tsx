"use client"

import type { CompanySummary } from "@/components/dashboard/companies/company-types"
import { cn } from "@/lib/utils"

type OverviewCell = {
  key: string
  label: string
  value: number
  dotClass: string
  valueClass: string
  href?: string
  accent?: boolean
}

/**
 * Practice-level triage band for the dashboard home — answers "what needs me
 * now?" in one glance, the way Dext's overview does, but in AxLiner's colour
 * grammar. "To review" is the amber hero (the magnet for the eye); everything
 * else stays quiet. Counts are aggregated from the client list already loaded
 * by CompaniesTable, so there's no extra request.
 */
export function WorkspaceOverview({
  companies,
  className,
}: {
  companies: CompanySummary[]
  className?: string
}) {
  if (companies.length === 0) return null

  const needsReview = companies.reduce((sum, company) => sum + company.needsReview, 0)
  const draftBills = companies.reduce((sum, company) => sum + company.bills, 0)
  const documents = companies.reduce(
    (sum, company) => sum + company.purchases + company.receipts + company.bankStatements + company.other,
    0,
  )
  const connected = companies.filter((company) => company.accountingConnected).length

  const cells: OverviewCell[] = [
    {
      key: "review",
      label: "To review",
      value: needsReview,
      dotClass: "bg-amber-400",
      valueClass: needsReview ? "text-[var(--text-attention)]" : "text-foreground",
      href: "#clients",
      accent: needsReview > 0,
    },
    {
      key: "drafts",
      label: "Draft bills",
      value: draftBills,
      dotClass: "bg-emerald-500",
      valueClass: draftBills ? "text-[var(--data-money)]" : "text-foreground",
      href: "#clients",
    },
    {
      key: "documents",
      label: "Documents",
      value: documents,
      dotClass: "bg-sky-500",
      valueClass: "text-foreground",
    },
    {
      key: "clients",
      label: connected ? `Clients · ${connected} connected` : "Clients",
      value: companies.length,
      dotClass: "bg-[var(--workspace-primary)]",
      valueClass: "text-foreground",
    },
  ]

  return (
    <div
      className={cn(
        "ax-fade-in grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[var(--workspace-border)] bg-[var(--workspace-border)] sm:grid-cols-4",
        className,
      )}
    >
      {cells.map((cell) => {
        const body = (
          <>
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  cell.dotClass,
                  cell.accent && "ring-2 ring-amber-300/50",
                )}
              />
              <span className="truncate text-xs font-semibold text-foreground">{cell.label}</span>
            </span>
            <span className={cn("mt-2 block text-2xl font-semibold tabular-nums", cell.valueClass)}>
              {formatCount(cell.value)}
            </span>
          </>
        )

        const cellClass = cn(
          "block px-4 py-3.5",
          cell.accent
            ? "bg-[color-mix(in_srgb,var(--text-attention)_5%,white)]"
            : "bg-white",
        )

        if (cell.href) {
          return (
            <a
              key={cell.key}
              href={cell.href}
              className={cn(
                cellClass,
                "ax-interactive outline-none hover:bg-[var(--workspace-row-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--workspace-primary)]",
              )}
            >
              {body}
            </a>
          )
        }

        return (
          <div key={cell.key} className={cellClass}>
            {body}
          </div>
        )
      })}
    </div>
  )
}

function formatCount(count: number) {
  return new Intl.NumberFormat().format(count)
}

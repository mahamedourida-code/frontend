"use client"

import type { ReactNode } from "react"
import { Building2, Files, ReceiptText, ScanSearch } from "lucide-react"

import type { CompanySummary } from "@/components/dashboard/companies/company-types"
import { cn } from "@/lib/utils"

type OverviewCell = {
  key: string
  label: string
  value: number
  icon: ReactNode
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
 *
 * Each card carries a caricature visual in the black / slate-footer / landing-
 * blue palette. The lucide glyphs below are placeholders — swap them for the
 * generated art in `/public/workspace-art/*` (specs in `pp.md`) when ready.
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
      icon: <ScanSearch className="size-5" strokeWidth={1.75} />,
      valueClass: needsReview ? "text-[var(--text-attention)]" : "text-foreground",
      href: "#clients",
      accent: needsReview > 0,
    },
    {
      key: "drafts",
      label: "Draft bills",
      value: draftBills,
      icon: <ReceiptText className="size-5" strokeWidth={1.75} />,
      valueClass: draftBills ? "text-[var(--data-money)]" : "text-foreground",
      href: "#clients",
    },
    {
      key: "documents",
      label: "Documents",
      value: documents,
      icon: <Files className="size-5" strokeWidth={1.75} />,
      valueClass: "text-foreground",
    },
    {
      key: "clients",
      label: connected ? `Clients · ${connected} connected` : "Clients",
      value: companies.length,
      icon: <Building2 className="size-5" strokeWidth={1.75} />,
      valueClass: "text-foreground",
    },
  ]

  return (
    <div
      className={cn(
        "ax-fade-in grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-border)] sm:grid-cols-4",
        className,
      )}
    >
      {cells.map((cell) => {
        const body = (
          <>
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0 truncate pt-1 text-xs font-semibold text-foreground">{cell.label}</span>
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  cell.accent
                    ? "bg-[color-mix(in_srgb,var(--text-attention)_12%,white)] text-[var(--text-attention)]"
                    : "bg-[var(--workspace-soft)] text-[var(--workspace-topbar)]",
                )}
              >
                {cell.icon}
              </span>
            </div>
            <span className={cn("mt-3 block text-3xl font-semibold tabular-nums", cell.valueClass)}>
              {formatCount(cell.value)}
            </span>
          </>
        )

        const cellClass = cn(
          "block px-4 py-4 sm:px-5",
          cell.accent ? "bg-[color-mix(in_srgb,var(--text-attention)_5%,white)]" : "bg-white",
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

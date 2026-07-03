"use client"

import type { CompanySummary } from "@/components/dashboard/companies/company-types"
import { cn } from "@/lib/utils"

type Kpi = {
  key: string
  label: string
  value: number
  meta?: string
}

export function WorkspaceOverview({
  companies,
  className,
}: {
  companies: CompanySummary[]
  className?: string
}) {
  if (companies.length === 0) return null

  const documents = companies.reduce(
    (sum, company) => sum + company.purchases + company.receipts + company.bankStatements + company.other,
    0,
  )
  const needsReview = companies.reduce((sum, company) => sum + company.needsReview, 0)
  const draftBills = companies.reduce((sum, company) => sum + company.bills, 0)
  const connected = companies.filter((company) => company.accountingConnected).length

  const kpis: Kpi[] = [
    {
      key: "clients",
      label: "Clients",
      value: companies.length,
      meta: connected > 0 ? `${formatCount(connected)} linked` : "No links",
    },
    {
      key: "documents",
      label: "Docs",
      value: documents,
      meta: "Total",
    },
    {
      key: "review",
      label: "To review",
      value: needsReview,
      meta: "Exceptions",
    },
    {
      key: "bills",
      label: "Draft bills",
      value: draftBills,
      meta: "Ready drafts",
    },
  ]

  return (
    <section
      className={cn(
        "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
      aria-label="Client workspace overview"
    >
      {kpis.map((kpi) => (
        <article
          key={kpi.key}
          className="rounded-lg border border-[var(--workspace-border)] bg-white px-4 py-3 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]"
        >
          <p className="truncate text-[12px] font-semibold text-[var(--workspace-muted)]">{kpi.label}</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold leading-none tracking-normal text-[var(--workspace-ink)] tabular-nums">
              {formatCount(kpi.value)}
            </p>
            {kpi.meta ? (
              <p className="truncate text-[12px] font-semibold text-[var(--workspace-muted)]">{kpi.meta}</p>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  )
}

function formatCount(count: number) {
  return new Intl.NumberFormat().format(count)
}

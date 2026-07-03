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

  const purchases = companies.reduce((sum, company) => sum + company.purchases, 0)
  const receipts = companies.reduce((sum, company) => sum + company.receipts, 0)
  const bankStatements = companies.reduce((sum, company) => sum + company.bankStatements, 0)
  const other = companies.reduce((sum, company) => sum + company.other, 0)
  const needsReview = companies.reduce((sum, company) => sum + company.needsReview, 0)
  const draftBills = companies.reduce((sum, company) => sum + company.bills, 0)
  const documents = purchases + receipts + bankStatements + other
  const connected = companies.filter((company) => company.accountingConnected).length

  const kpis: Kpi[] = [
    {
      key: "clients",
      label: "Clients",
      value: companies.length,
      meta: connected > 0 ? `${formatCount(connected)} linked` : "No links",
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

  const segments = [
    { key: "purchases", label: "Purchases", value: purchases, className: "bg-[var(--data-reference)]" },
    { key: "receipts", label: "Receipts", value: receipts, className: "bg-[var(--data-money)]" },
    { key: "bank", label: "Bank", value: bankStatements, className: "bg-[var(--data-date)]" },
    { key: "other", label: "Other", value: other, className: "bg-slate-300" },
  ]
  const activeSegments = segments.filter((segment) => segment.value > 0)

  return (
    <section
      className={cn(
        "grid gap-3 sm:grid-cols-3 xl:grid-cols-[repeat(3,minmax(0,0.72fr))_minmax(280px,1.35fr)]",
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

      <article className="rounded-lg border border-[var(--workspace-border)] bg-white px-4 py-3 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] sm:col-span-3 xl:col-span-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-[12px] font-semibold text-[var(--workspace-muted)]">Document mix</p>
          <p className="shrink-0 text-[12px] font-semibold text-[var(--workspace-ink)] tabular-nums">
            {formatCount(documents)}
          </p>
        </div>
        <div
          className="mt-3 flex h-2 overflow-hidden rounded-full bg-[var(--workspace-soft)]"
          role="img"
          aria-label={`Document mix: ${formatCount(purchases)} purchases, ${formatCount(receipts)} receipts, ${formatCount(bankStatements)} bank, ${formatCount(other)} other`}
        >
          {activeSegments.length > 0 ? (
            activeSegments.map((segment) => (
              <span
                key={segment.key}
                className={cn("h-full min-w-[4px]", segment.className)}
                style={{ flexGrow: segment.value, flexBasis: 0 }}
              />
            ))
          ) : (
            <span className="h-full w-full bg-slate-200" />
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
          {segments.map((segment) => (
            <span
              key={segment.key}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--workspace-muted)]"
            >
              <span className={cn("size-1.5 rounded-full", segment.className)} aria-hidden="true" />
              {segment.label}
            </span>
          ))}
        </div>
      </article>
    </section>
  )
}

function formatCount(count: number) {
  return new Intl.NumberFormat().format(count)
}

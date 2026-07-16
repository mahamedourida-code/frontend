"use client"

import Link from "next/link"
import { Building2, Files, PlugZap, ReceiptText } from "lucide-react"

import type { CompanySummary } from "@/components/dashboard/companies/company-types"
import { cn } from "@/lib/utils"

type QueueMetric = {
  key: string
  label: string
  value: number
  context: string
  href: string
  icon: typeof Building2
  attention?: boolean
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

  const metrics: QueueMetric[] = [
    {
      key: "review",
      label: "Review queue",
      value: needsReview,
      context: needsReview ? "Exceptions waiting" : "No exceptions",
      href: "/dashboard/client",
      icon: Files,
      attention: needsReview > 0,
    },
    {
      key: "bills",
      label: "Draft bills",
      value: draftBills,
      context: draftBills ? "Before publish" : "Queue is clear",
      href: "/dashboard/accounts-payable",
      icon: ReceiptText,
      attention: draftBills > 0,
    },
    {
      key: "documents",
      label: "Filed documents",
      value: documents,
      context: `${formatCount(companies.length)} client${companies.length === 1 ? "" : "s"}`,
      href: "/dashboard/batches",
      icon: Building2,
    },
    {
      key: "connections",
      label: "Accounting linked",
      value: connected,
      context: `of ${formatCount(companies.length)} clients`,
      href: "/dashboard/integrations",
      icon: PlugZap,
      attention: connected < companies.length,
    },
  ]

  return (
    <section
      className={cn(
        "grid overflow-hidden rounded-md border border-[var(--workspace-border)] bg-white sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
      aria-label="Current workspace queues"
    >
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Link
            key={metric.key}
            href={metric.href}
            className={cn(
              "ax-interactive group flex min-w-0 items-center gap-3 px-3.5 py-3 hover:bg-[var(--workspace-row-hover)]",
              index > 0 && "border-t border-[var(--workspace-border)] sm:border-l",
              index === 1 && "sm:border-t-0",
              index === 2 && "sm:border-l-0 xl:border-l",
              index > 1 && "xl:border-t-0",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--workspace-soft)]">
              <Icon className="size-4 text-black" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-medium text-[var(--workspace-muted)]">{metric.label}</span>
              <span className="mt-0.5 flex items-baseline gap-2">
                <span className="text-[19px] font-semibold leading-6 tabular-nums text-[var(--workspace-ink)]">
                  {formatCount(metric.value)}
                </span>
                <span
                  className={cn(
                    "truncate text-[11px] font-medium",
                    metric.attention ? "text-[var(--text-attention)]" : "text-[var(--workspace-muted)]",
                  )}
                >
                  {metric.context}
                </span>
              </span>
            </span>
          </Link>
        )
      })}
    </section>
  )
}

function formatCount(count: number) {
  return new Intl.NumberFormat().format(count)
}

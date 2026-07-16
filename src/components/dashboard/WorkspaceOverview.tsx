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

type ClientWorkload = {
  name: string
  review: number
  bills: number
}

export type ActivityPoint = {
  date: string
  label: string
  count: number
}

type PlotPoint = ActivityPoint & {
  x: number
  y: number
}

function curvePath(points: PlotPoint[]) {
  if (points.length === 0) return ""
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index]
    const current = points[index]
    const next = points[index + 1]
    const after = points[index + 2] ?? next
    const controlOneX = current.x + (next.x - previous.x) / 6
    const controlOneY = current.y + (next.y - previous.y) / 6
    const controlTwoX = next.x - (after.x - current.x) / 6
    const controlTwoY = next.y - (after.y - current.y) / 6
    path += ` C ${controlOneX} ${controlOneY}, ${controlTwoX} ${controlTwoY}, ${next.x} ${next.y}`
  }
  return path
}

function ActivityCurve({ data }: { data: ActivityPoint[] }) {
  const width = 600
  const top = 12
  const bottom = 100
  const maxCount = Math.max(...data.map((point) => point.count), 1)
  const points: PlotPoint[] = data.map((point, index) => ({
    ...point,
    x: data.length === 1 ? width / 2 : (index / (data.length - 1)) * width,
    y: bottom - (point.count / maxCount) * (bottom - top),
  }))
  const line = curvePath(points)
  const area = points.length > 0
    ? `${line} L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`
    : ""
  const total = data.reduce((sum, point) => sum + point.count, 0)

  return (
    <section className="overflow-hidden rounded-md border border-[var(--workspace-border)] bg-white" aria-labelledby="activity-curve-title">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--workspace-border)] px-4 py-3">
        <div>
          <h2 id="activity-curve-title" className="text-sm font-semibold text-[var(--workspace-ink)]">Document activity</h2>
          <p className="mt-0.5 text-xs text-[var(--workspace-muted)]">Processed documents, last {data.length} days.</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold leading-5 tabular-nums text-[var(--workspace-ink)]">{formatCount(total)}</p>
          <p className="mt-0.5 text-[11px] text-[var(--workspace-muted)]">documents</p>
        </div>
      </div>
      <div className="px-4 pb-3 pt-4" role="img" aria-label={`Curved document activity graph with ${formatCount(total)} processed documents over ${data.length} days`}>
        <svg viewBox={`0 0 ${width} 124`} className="h-[132px] w-full overflow-visible" aria-hidden="true" preserveAspectRatio="none">
          {[34, 67, 100].map((y) => (
            <line key={y} x1="0" x2={width} y1={y} y2={y} stroke="#e4e7ef" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={area} fill="var(--landing-blue)" opacity="0.08" />
          <path d={line} fill="none" stroke="var(--landing-blue)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {points.length > 0 ? (
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="white" stroke="var(--landing-blue)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          ) : null}
          {data.length > 0 ? (
            <>
              <text x="0" y="121" fill="#475467" fontSize="11">{data[0].label}</text>
              <text x={width} y="121" fill="#475467" fontSize="11" textAnchor="end">{data[data.length - 1].label}</text>
            </>
          ) : null}
        </svg>
        <ul className="sr-only">
          {data.map((point) => <li key={point.date}>{point.label}: {formatCount(point.count)} documents</li>)}
        </ul>
      </div>
    </section>
  )
}

function WorkloadGraph({ data }: { data: ClientWorkload[] }) {
  const maxOpen = Math.max(...data.map((client) => client.review + client.bills), 1)

  return (
    <section className="overflow-hidden rounded-md border border-[var(--workspace-border)] bg-white" aria-labelledby="client-workload-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--workspace-border)] px-4 py-3">
        <div>
          <h2 id="client-workload-title" className="text-sm font-semibold text-[var(--workspace-ink)]">Open work by client</h2>
          <p className="mt-0.5 text-xs text-[var(--workspace-muted)]">Fields to review and draft bills awaiting publish.</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium text-[var(--workspace-muted)]" aria-hidden="true">
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[var(--landing-blue)]" />Review</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[#171717]" />Draft bills</span>
        </div>
      </div>
      <div className="space-y-3 px-4 py-4" role="img" aria-label="Horizontal bar graph of review fields and draft bills by client">
        {data.map((client) => {
          const reviewWidth = (client.review / maxOpen) * 100
          const billsWidth = (client.bills / maxOpen) * 100
          return (
            <div key={client.name} className="grid grid-cols-[minmax(5.5rem,7rem)_minmax(0,1fr)_2rem] items-center gap-3">
              <span className="truncate text-[11px] font-medium text-[var(--workspace-muted)]" title={client.name}>{client.name}</span>
              <span className="flex h-2.5 min-w-0 overflow-hidden rounded-full bg-[var(--workspace-soft)]">
                <span className="h-full bg-[var(--landing-blue)]" style={{ width: `${reviewWidth}%` }} title={`${formatCount(client.review)} fields to review`} />
                <span className="h-full bg-[#171717]" style={{ width: `${billsWidth}%` }} title={`${formatCount(client.bills)} draft bills`} />
              </span>
              <span className="text-right text-[11px] font-semibold tabular-nums text-[var(--workspace-ink)]">
                {formatCount(client.review + client.bills)}
                <span className="sr-only"> open items: {formatCount(client.review)} fields to review and {formatCount(client.bills)} draft bills</span>
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function WorkspaceOverview({
  companies,
  activity = [],
  className,
}: {
  companies: CompanySummary[]
  activity?: ActivityPoint[]
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
  const workload = companies
    .map((company) => ({ name: company.name, review: company.needsReview, bills: company.bills }))
    .filter((company) => company.review + company.bills > 0)
    .sort((left, right) => (right.review + right.bills) - (left.review + left.bills))
    .slice(0, 6)

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
    <div className={cn("space-y-4", className)}>
      <section
        className="grid overflow-hidden rounded-md border border-[var(--workspace-border)] bg-white sm:grid-cols-2 xl:grid-cols-4"
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
      {workload.length > 0 || activity.length > 1 ? (
        <div className={cn("grid gap-4", workload.length > 0 && activity.length > 1 && "lg:grid-cols-2")}>
          {workload.length > 0 ? <WorkloadGraph data={workload} /> : null}
          {activity.length > 1 ? <ActivityCurve data={activity} /> : null}
        </div>
      ) : null}
    </div>
  )
}

function formatCount(count: number) {
  return new Intl.NumberFormat().format(count)
}

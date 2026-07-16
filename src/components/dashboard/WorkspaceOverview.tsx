"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookCheck,
  ChevronDown,
  Link2,
  PlugZap,
  ReceiptText,
  Upload,
} from "lucide-react"

import type { CompanySummary } from "@/components/dashboard/companies/company-types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ClientWorkload = {
  id: string
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

type DetailView = "activity" | "workload"

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

function plotActivity(data: ActivityPoint[], width: number, top: number, bottom: number) {
  const maxCount = Math.max(...data.map((point) => point.count), 1)
  return data.map((point, index) => ({
    ...point,
    x: data.length === 1 ? width / 2 : (index / (data.length - 1)) * width,
    y: bottom - (point.count / maxCount) * (bottom - top),
  }))
}

function MiniCurve({ data }: { data: ActivityPoint[] }) {
  const width = 92
  const bottom = 25
  const points = plotActivity(data, width, 3, bottom)

  return (
    <svg
      viewBox={`0 0 ${width} 28`}
      className="h-7 w-[92px]"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={curvePath(points)}
        fill="none"
        stroke="var(--landing-blue)"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function ActivityDetail({ data }: { data: ActivityPoint[] }) {
  const width = 760
  const bottom = 104
  const points = plotActivity(data, width, 12, bottom)
  const line = curvePath(points)
  const area = points.length
    ? `${line} L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`
    : ""
  const total = data.reduce((sum, point) => sum + point.count, 0)

  return (
    <div className="grid gap-4 px-4 py-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:px-5">
      <div>
        <p className="text-[11px] font-medium text-[var(--workspace-muted)]">30 days</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--workspace-ink)]">
          {formatCount(total)}
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--workspace-muted)]">documents</p>
      </div>
      <div
        className="min-w-0"
        role="img"
        aria-label={`${formatCount(total)} documents processed over ${data.length} days`}
      >
        <svg viewBox={`0 0 ${width} 124`} className="h-[116px] w-full" aria-hidden="true" preserveAspectRatio="none">
          {[42, 73, 104].map((y) => (
            <line
              key={y}
              x1="0"
              x2={width}
              y1={y}
              y2={y}
              stroke="#e4e7ef"
              strokeDasharray="3 6"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={area} fill="var(--landing-blue)" opacity="0.07" />
          <path
            d={line}
            fill="none"
            stroke="var(--landing-blue)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {points.length ? (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="3.5"
              fill="white"
              stroke="var(--landing-blue)"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          {data.length ? (
            <>
              <text x="0" y="122" fill="#475467" fontSize="10">{data[0].label}</text>
              <text x={width} y="122" fill="#475467" fontSize="10" textAnchor="end">{data[data.length - 1].label}</text>
            </>
          ) : null}
        </svg>
      </div>
    </div>
  )
}

function WorkloadDetail({ data }: { data: ClientWorkload[] }) {
  const maxOpen = Math.max(...data.map((client) => client.review + client.bills), 1)

  return (
    <div className="space-y-3 px-4 py-4 sm:px-5" aria-label="Open work by client">
      {data.map((client) => {
        const reviewWidth = (client.review / maxOpen) * 100
        const billsWidth = (client.bills / maxOpen) * 100
        return (
          <Link
            key={client.id}
            href={`/dashboard/companies/${encodeURIComponent(client.id)}`}
            className="ax-interactive grid grid-cols-[minmax(6rem,10rem)_minmax(0,1fr)_2.5rem] items-center gap-3 rounded-md outline-none hover:text-[var(--workspace-primary)] focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]/25"
          >
            <span className="truncate text-[12px] font-medium" title={client.name}>{client.name}</span>
            <span className="flex h-2 min-w-0 overflow-hidden rounded-full bg-[var(--workspace-soft)]">
              <span
                className="h-full bg-[var(--landing-blue)]"
                style={{ width: `${reviewWidth}%` }}
                title={`${formatCount(client.review)} review flags`}
              />
              <span
                className="h-full bg-[#171717]"
                style={{ width: `${billsWidth}%` }}
                title={`${formatCount(client.bills)} draft bills`}
              />
            </span>
            <span className="text-right text-[11px] font-semibold tabular-nums text-[var(--workspace-ink)]">
              {formatCount(client.review + client.bills)}
            </span>
          </Link>
        )
      })}
      <div className="flex items-center gap-4 pt-1 text-[10px] font-medium text-[var(--workspace-muted)]">
        <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[var(--landing-blue)]" />Review</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#171717]" />Drafts</span>
      </div>
    </div>
  )
}

function nextAction(companies: CompanySummary[]) {
  const reviewClient = [...companies].sort((left, right) => right.needsReview - left.needsReview)[0]
  if (reviewClient?.needsReview > 0) {
    return {
      icon: BookCheck,
      title: `Review ${reviewClient.name}`,
      detail: `${formatCount(reviewClient.needsReview)} flag${reviewClient.needsReview === 1 ? "" : "s"} waiting`,
      label: "Review",
      href: `/dashboard/client?company_id=${encodeURIComponent(reviewClient.id)}`,
    }
  }

  const billsClient = [...companies].sort((left, right) => right.bills - left.bills)[0]
  if (billsClient?.bills > 0) {
    return {
      icon: ReceiptText,
      title: `Publish ${billsClient.name}`,
      detail: `${formatCount(billsClient.bills)} draft bill${billsClient.bills === 1 ? "" : "s"}`,
      label: "Open drafts",
      href: `/dashboard/accounts-payable?company_id=${encodeURIComponent(billsClient.id)}`,
    }
  }

  const unlinkedClient = companies.find((company) => !company.accountingConnected)
  if (unlinkedClient) {
    return {
      icon: PlugZap,
      title: `Connect ${unlinkedClient.name}`,
      detail: "QuickBooks or Xero",
      label: "Connect",
      href: "/dashboard/integrations",
    }
  }

  return {
    icon: Upload,
    title: "Upload client files",
    detail: "Start the next batch",
    label: "Upload",
    href: "/dashboard/client#upload-files",
  }
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
  const shouldReduceMotion = useReducedMotion()
  const [detailView, setDetailView] = useState<DetailView | null>(null)

  if (companies.length === 0) return null

  const needsReview = companies.reduce((sum, company) => sum + company.needsReview, 0)
  const draftBills = companies.reduce((sum, company) => sum + company.bills, 0)
  const connected = companies.filter((company) => company.accountingConnected).length
  const workload = companies
    .map((company) => ({
      id: company.id,
      name: company.name,
      review: company.needsReview,
      bills: company.bills,
    }))
    .filter((company) => company.review + company.bills > 0)
    .sort((left, right) => (right.review + right.bills) - (left.review + left.bills))
    .slice(0, 5)
  const action = nextAction(companies)
  const ActionIcon = action.icon

  const toggleDetail = (view: DetailView) => {
    setDetailView((current) => current === view ? null : view)
  }

  return (
    <section className={cn("overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-white", className)}>
      <div className="grid items-center gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)]">
            <ActionIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[var(--workspace-primary)]">Up next</p>
            <h2 className="truncate text-[18px] font-semibold leading-6 text-[var(--workspace-ink)]">
              {action.title}
            </h2>
            <p className="text-[12px] text-[var(--workspace-muted)]">{action.detail}</p>
          </div>
        </div>
        <Button asChild variant="blue" size="sm" className="w-full sm:w-fit">
          <Link href={action.href}>
            {action.label}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col border-t border-[var(--workspace-border)] sm:flex-row sm:items-stretch sm:justify-between">
        <nav className="grid flex-1 grid-cols-3 divide-x divide-[var(--workspace-border)]" aria-label="Workspace queues">
          <Link href="/dashboard/client" className="ax-interactive flex items-center justify-center gap-2 px-3 py-3 hover:bg-[var(--workspace-row-hover)]">
            <BookCheck className="size-3.5 text-black" />
            <strong className="text-[13px] tabular-nums">{formatCount(needsReview)}</strong>
            <span className="hidden text-[11px] text-[var(--workspace-muted)] md:inline">Review</span>
          </Link>
          <Link href="/dashboard/accounts-payable" className="ax-interactive flex items-center justify-center gap-2 px-3 py-3 hover:bg-[var(--workspace-row-hover)]">
            <ReceiptText className="size-3.5 text-black" />
            <strong className="text-[13px] tabular-nums">{formatCount(draftBills)}</strong>
            <span className="hidden text-[11px] text-[var(--workspace-muted)] md:inline">Drafts</span>
          </Link>
          <Link href="/dashboard/integrations" className="ax-interactive flex items-center justify-center gap-2 px-3 py-3 hover:bg-[var(--workspace-row-hover)]">
            <Link2 className="size-3.5 text-black" />
            <strong className="text-[13px] tabular-nums">{connected}/{companies.length}</strong>
            <span className="hidden text-[11px] text-[var(--workspace-muted)] md:inline">Linked</span>
          </Link>
        </nav>

        <div className="flex items-center justify-center gap-1 border-t border-[var(--workspace-border)] p-1.5 sm:border-l sm:border-t-0">
          {activity.length > 1 ? (
            <button
              type="button"
              onClick={() => toggleDetail("activity")}
              aria-expanded={detailView === "activity"}
              title="Document activity"
              className={cn(
                "ax-interactive flex h-9 items-center gap-2 rounded-full px-2.5 outline-none hover:bg-[var(--workspace-row-hover)] focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]/25",
                detailView === "activity" && "bg-[var(--workspace-blue-soft)]",
              )}
            >
              <Activity className="size-3.5 text-black" />
              <MiniCurve data={activity} />
              <ChevronDown className={cn("size-3.5 text-black transition-transform duration-150", detailView === "activity" && "rotate-180")} />
              <span className="sr-only">Activity</span>
            </button>
          ) : null}
          {workload.length ? (
            <button
              type="button"
              onClick={() => toggleDetail("workload")}
              aria-expanded={detailView === "workload"}
              title="Client workload"
              className={cn(
                "ax-interactive flex size-9 items-center justify-center rounded-full outline-none hover:bg-[var(--workspace-row-hover)] focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]/25",
                detailView === "workload" && "bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)]",
              )}
            >
              <BarChart3 className="size-4" />
              <span className="sr-only">Client workload</span>
            </button>
          ) : null}
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {detailView ? (
          <motion.div
            key={detailView}
            initial={shouldReduceMotion ? false : { opacity: 0, transform: "translateY(-4px)" }}
            animate={{ opacity: 1, transform: "translateY(0)" }}
            exit={{ opacity: 0, transform: shouldReduceMotion ? "translateY(0)" : "translateY(-3px)" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: [0.23, 1, 0.32, 1] }}
            className="border-t border-[var(--workspace-border)] bg-[var(--workspace-soft)]/45"
          >
            {detailView === "activity"
              ? <ActivityDetail data={activity} />
              : <WorkloadDetail data={workload} />}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

function formatCount(count: number) {
  return new Intl.NumberFormat().format(count)
}

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowUpRight,
  BookCheck,
  ChartSpline,
  CircleCheckBig,
  Link2,
  LoaderCircle,
  ReceiptText,
  RefreshCw,
  Upload,
} from "lucide-react"

import { SegmentedTabs } from "@/components/dashboard/SegmentedTabs"
import { Button } from "@/components/ui/button"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import {
  accountsPayableApi,
  companyApi,
  ocrApi,
  type AccountsPayableItem,
  type AccountsPayableStatus,
  type CompanySummary,
  type DashboardRange,
  type DashboardSummaryResponse,
} from "@/lib/api-client"
import { cn } from "@/lib/utils"

type OverviewRange = Exclude<DashboardRange, "1d">
type DocumentView = "daily" | "running"
type BillSeries = "drafted" | "published"

type FlowPoint = {
  timestamp: string
  label: string
  documents: number
  documentValue: number
  drafted: number
  published: number
}

type ChartPayload = {
  payload?: FlowPoint
  value?: number | string
  dataKey?: string | number
  color?: string
}

type NextAction = {
  title: string
  detail: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const DAY_MS = 24 * 60 * 60 * 1000
const OPEN_BILL_STATUSES = new Set<AccountsPayableStatus>([
  "needs_coding",
  "needs_review",
  "pending_approval",
  "ready_to_publish",
  "failed",
])

const RANGE_TABS = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "3m", label: "3M" },
]

const DOCUMENT_VIEW_TABS = [
  { value: "daily", label: "Daily" },
  { value: "running", label: "Running" },
]

const DOCUMENT_CHART_CONFIG = {
  documentValue: {
    label: "Documents",
    color: "var(--landing-blue)",
  },
} satisfies ChartConfig

const BILL_CHART_CONFIG = {
  drafted: {
    label: "Drafted",
    color: "var(--workspace-indicator)",
  },
  published: {
    label: "Published",
    color: "var(--landing-blue)",
  },
} satisfies ChartConfig

const countFormatter = new Intl.NumberFormat()
const tooltipDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})
const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})
const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  timeZone: "UTC",
})

function parseApiTime(value?: string | null) {
  if (!value) return null
  const normalized = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`
  const timestamp = Date.parse(normalized)
  return Number.isFinite(timestamp) ? timestamp : null
}

function dateFromTimestamp(value: string) {
  const timestamp = parseApiTime(value)
  return timestamp === null ? null : new Date(timestamp)
}

function formatTooltipDate(value: string) {
  const date = dateFromTimestamp(value)
  return date ? tooltipDateFormatter.format(date) : value
}

function formatAxisDate(value: string, range: OverviewRange) {
  const date = dateFromTimestamp(value)
  if (!date) return value
  return range === "7d" ? weekdayFormatter.format(date) : shortDateFormatter.format(date)
}

function rangeLabel(range: OverviewRange) {
  if (range === "7d") return "last 7 days"
  if (range === "3m") return "last 3 months"
  return "last 30 days"
}

function findBucketIndex(starts: number[], eventTime: number) {
  let low = 0
  let high = starts.length - 1
  let match = -1

  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    if (starts[middle] <= eventTime) {
      match = middle
      low = middle + 1
    } else {
      high = middle - 1
    }
  }

  if (match < 0) return -1
  const bucketEnd = starts[match + 1] ?? starts[match] + DAY_MS
  return eventTime < bucketEnd ? match : -1
}

function buildFlowSeries(
  summary: DashboardSummaryResponse,
  bills: AccountsPayableItem[],
): FlowPoint[] {
  const points = summary.chart.map((point) => ({
    timestamp: point.timestamp,
    label: point.formattedDate || point.formattedTime || point.timestamp,
    documents: point.count,
    documentValue: point.count,
    drafted: 0,
    published: 0,
  }))
  const starts = points.map((point) => parseApiTime(point.timestamp) ?? 0)

  for (const bill of bills) {
    const createdAt = parseApiTime(bill.created_at)
    if (createdAt !== null) {
      const createdBucket = findBucketIndex(starts, createdAt)
      if (createdBucket >= 0) points[createdBucket].drafted += 1
    }

    if (bill.status === "published") {
      const publishedAt = parseApiTime(bill.published_at)
      if (publishedAt !== null) {
        const publishedBucket = findBucketIndex(starts, publishedAt)
        if (publishedBucket >= 0) points[publishedBucket].published += 1
      }
    }
  }

  return points
}

function withDocumentView(points: FlowPoint[], view: DocumentView) {
  if (view === "daily") return points

  let running = 0
  return points.map((point) => {
    running += point.documents
    return { ...point, documentValue: running }
  })
}

function companyNeedsReview(company: CompanySummary) {
  return company.document_counts?.needs_review ?? 0
}

function companyIsConnected(company: CompanySummary) {
  return Boolean(company.accounting_connected ?? company.quickbooks_connected)
}

function buildNextAction(
  companies: CompanySummary[],
  bills: AccountsPayableItem[],
): NextAction {
  const openByCompany = new Map<string, number>()
  for (const bill of bills) {
    if (!bill.company_id || !OPEN_BILL_STATUSES.has(bill.status)) continue
    openByCompany.set(bill.company_id, (openByCompany.get(bill.company_id) ?? 0) + 1)
  }

  const busiest = [...companies]
    .map((company) => ({
      company,
      review: companyNeedsReview(company),
      bills: openByCompany.get(company.id) ?? 0,
    }))
    .sort((left, right) => (right.review + right.bills) - (left.review + left.bills))[0]

  if (busiest?.review > 0) {
    return {
      title: `Review ${busiest.company.name}`,
      detail: `${countFormatter.format(busiest.review)} flag${busiest.review === 1 ? "" : "s"}`,
      href: `/dashboard/client?company_id=${encodeURIComponent(busiest.company.id)}`,
      icon: BookCheck,
    }
  }

  if (busiest?.bills > 0) {
    return {
      title: `Finish ${busiest.company.name}`,
      detail: `${countFormatter.format(busiest.bills)} bill${busiest.bills === 1 ? "" : "s"} open`,
      href: `/dashboard/accounts-payable?company_id=${encodeURIComponent(busiest.company.id)}`,
      icon: ReceiptText,
    }
  }

  const unlinked = companies.find((company) => !companyIsConnected(company))
  if (unlinked) {
    return {
      title: `Connect ${unlinked.name}`,
      detail: "QuickBooks or Xero",
      href: "/dashboard/integrations",
      icon: Link2,
    }
  }

  return {
    title: "Upload documents",
    detail: "Start the next batch",
    href: "/dashboard/client#upload-files",
    icon: Upload,
  }
}

function DocumentTooltip({
  active,
  payload,
  view,
}: {
  active?: boolean
  payload?: ChartPayload[]
  view: DocumentView
}) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null

  return (
    <div className="min-w-[148px] rounded-md border border-[var(--workspace-border)] bg-white px-3 py-2 shadow-none">
      <p className="text-[11px] font-medium text-[var(--workspace-muted)]">
        {formatTooltipDate(point.timestamp)}
      </p>
      <div className="mt-1 flex items-baseline justify-between gap-5">
        <span className="text-[12px] font-medium text-[var(--workspace-ink)]">
          {view === "running" ? "Running total" : "Documents"}
        </span>
        <strong className="text-[14px] font-semibold tabular-nums text-[var(--workspace-ink)]">
          {countFormatter.format(point.documentValue)}
        </strong>
      </div>
      {view === "running" ? (
        <div className="mt-1 flex items-baseline justify-between gap-5 border-t border-[var(--workspace-border)] pt-1.5">
          <span className="text-[11px] text-[var(--workspace-muted)]">That day</span>
          <span className="text-[12px] font-semibold tabular-nums text-[var(--workspace-ink)]">
            {countFormatter.format(point.documents)}
          </span>
        </div>
      ) : null}
    </div>
  )
}

function BillTooltip({
  active,
  payload,
  visible,
}: {
  active?: boolean
  payload?: ChartPayload[]
  visible: Record<BillSeries, boolean>
}) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null

  return (
    <div className="min-w-[156px] rounded-md border border-[var(--workspace-border)] bg-white px-3 py-2 shadow-none">
      <p className="text-[11px] font-medium text-[var(--workspace-muted)]">
        {formatTooltipDate(point.timestamp)}
      </p>
      <div className="mt-1.5 space-y-1.5">
        {visible.drafted ? (
          <div className="flex items-center justify-between gap-5">
            <span className="inline-flex items-center gap-2 text-[12px] text-[var(--workspace-muted)]">
              <span className="h-0.5 w-4 rounded-full bg-[var(--workspace-indicator)]" />
              Drafted
            </span>
            <strong className="text-[12px] font-semibold tabular-nums text-[var(--workspace-ink)]">
              {countFormatter.format(point.drafted)}
            </strong>
          </div>
        ) : null}
        {visible.published ? (
          <div className="flex items-center justify-between gap-5">
            <span className="inline-flex items-center gap-2 text-[12px] text-[var(--workspace-muted)]">
              <span className="h-0.5 w-4 rounded-full bg-[var(--landing-blue)]" />
              Published
            </span>
            <strong className="text-[12px] font-semibold tabular-nums text-[var(--workspace-ink)]">
              {countFormatter.format(point.published)}
            </strong>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function SeriesToggle({
  label,
  color,
  active,
  onClick,
}: {
  label: string
  color: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "ax-interactive inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-[12px] font-medium outline-none transition-[color,background-color,border-color,opacity] duration-150 focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]/25",
        active
          ? "border-[var(--workspace-border)] bg-white text-[var(--workspace-ink)]"
          : "border-transparent bg-transparent text-[var(--workspace-muted)] opacity-55 hover:opacity-100",
      )}
    >
      <span
        className="h-0.5 w-5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </button>
  )
}

function QueueLink({
  href,
  label,
  value,
  icon: Icon,
}: {
  href: string
  label: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Link
      href={href}
      className="ax-interactive group flex min-h-16 items-center gap-3 px-4 py-3 outline-none hover:bg-[var(--workspace-row-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--workspace-primary)]/25 sm:px-5"
    >
      <Icon className="size-4 shrink-0 text-[var(--workspace-icon)] group-hover:text-[var(--workspace-primary)]" />
      <span className="min-w-0">
        <strong className="block text-[15px] font-semibold leading-5 tabular-nums text-[var(--workspace-ink)]">
          {typeof value === "number" ? countFormatter.format(value) : value}
        </strong>
        <span className="block truncate text-[11px] font-medium text-[var(--workspace-muted)]">
          {label}
        </span>
      </span>
    </Link>
  )
}

function ChartLoading({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-[12px] font-medium text-[var(--workspace-muted)]">
      <LoaderCircle className="size-4 animate-spin text-[var(--workspace-primary)]" />
      {label}
    </div>
  )
}

export function AccountingOverview({
  workspaceId,
}: {
  workspaceId: string
}) {
  const [range, setRange] = React.useState<OverviewRange>("30d")
  const [documentView, setDocumentView] = React.useState<DocumentView>("daily")
  const [visibleBills, setVisibleBills] = React.useState<Record<BillSeries, boolean>>({
    drafted: true,
    published: true,
  })
  const [summary, setSummary] = React.useState<DashboardSummaryResponse | null>(null)
  const [bills, setBills] = React.useState<AccountsPayableItem[]>([])
  const [companies, setCompanies] = React.useState<CompanySummary[]>([])
  const [rangeLoading, setRangeLoading] = React.useState(true)
  const [supportLoading, setSupportLoading] = React.useState(true)
  const [rangeError, setRangeError] = React.useState(false)
  const [reloadToken, setReloadToken] = React.useState(0)
  const requestId = React.useRef(0)

  React.useEffect(() => {
    let mounted = true
    setSupportLoading(true)
    setBills([])
    setCompanies([])

    Promise.all([
      accountsPayableApi.list(undefined, { workspaceId }),
      companyApi.list(workspaceId),
    ])
      .then(([billResponse, companyResponse]) => {
        if (!mounted) return
        setBills(billResponse.items)
        setCompanies(companyResponse.companies)
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setSupportLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [workspaceId])

  React.useEffect(() => {
    const currentRequest = ++requestId.current
    setRangeLoading(true)
    setRangeError(false)

    ocrApi.getDashboard(range, workspaceId)
      .then((response) => {
        if (requestId.current !== currentRequest) return
        setSummary(response)
      })
      .catch(() => {
        if (requestId.current === currentRequest) setRangeError(true)
      })
      .finally(() => {
        if (requestId.current === currentRequest) setRangeLoading(false)
      })
  }, [range, reloadToken, workspaceId])

  const baseSeries = React.useMemo(
    () => summary ? buildFlowSeries(summary, bills) : [],
    [bills, summary],
  )
  const documentSeries = React.useMemo(
    () => withDocumentView(baseSeries, documentView),
    [baseSeries, documentView],
  )

  const visibleRange = (summary?.range === "7d" || summary?.range === "30d" || summary?.range === "3m")
    ? summary.range
    : range
  const totalDocuments = baseSeries.reduce((sum, point) => sum + point.documents, 0)
  const activeDays = baseSeries.filter((point) => point.documents > 0).length
  const activeDayAverage = activeDays ? Math.round(totalDocuments / activeDays) : 0
  const peakDay = baseSeries.reduce<FlowPoint | null>(
    (peak, point) => !peak || point.documents > peak.documents ? point : peak,
    null,
  )
  const draftedInRange = baseSeries.reduce((sum, point) => sum + point.drafted, 0)
  const publishedInRange = baseSeries.reduce((sum, point) => sum + point.published, 0)
  const hasDocumentData = totalDocuments > 0
  const hasBillData = draftedInRange + publishedInRange > 0

  const reviewFlags = companies.reduce((sum, company) => sum + companyNeedsReview(company), 0)
  const openBills = bills.filter((bill) => OPEN_BILL_STATUSES.has(bill.status)).length
  const readyBills = bills.filter((bill) => bill.status === "ready_to_publish").length
  const linkedClients = companies.filter(companyIsConnected).length
  const nextAction = React.useMemo(
    () => buildNextAction(companies, bills),
    [bills, companies],
  )
  const NextIcon = nextAction.icon

  const toggleBillSeries = (series: BillSeries) => {
    setVisibleBills((current) => {
      const other = series === "drafted" ? "published" : "drafted"
      if (current[series] && !current[other]) return current
      return { ...current, [series]: !current[series] }
    })
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-white shadow-none">
        <header className="flex flex-col gap-3 border-b border-[var(--workspace-border)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[var(--workspace-muted)]">Documents</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <strong className="text-[30px] font-semibold leading-none tabular-nums text-[var(--workspace-ink)] sm:text-[34px]">
                {summary ? countFormatter.format(totalDocuments) : "—"}
              </strong>
              <span className="text-[12px] font-medium text-[var(--workspace-muted)]">
                {rangeLabel(visibleRange)}
              </span>
              {rangeLoading && summary ? (
                <LoaderCircle className="size-3.5 animate-spin text-[var(--workspace-primary)]" aria-label="Updating chart" />
              ) : null}
            </div>
          </div>

          <div className="flex max-w-full flex-wrap items-center gap-2">
            <SegmentedTabs
              tabs={RANGE_TABS}
              value={range}
              onValueChange={(value) => setRange(value as OverviewRange)}
              size="sm"
              aria-label="Overview range"
            />
            <SegmentedTabs
              tabs={DOCUMENT_VIEW_TABS}
              value={documentView}
              onValueChange={(value) => setDocumentView(value as DocumentView)}
              size="sm"
              aria-label="Document chart view"
            />
          </div>
        </header>

        <div className="relative px-2 pb-1 pt-4 sm:px-4 sm:pt-5">
          {!summary && rangeLoading ? (
            <div className="h-[260px] sm:h-[340px] xl:h-[380px]">
              <ChartLoading label="Loading document flow" />
            </div>
          ) : !summary && rangeError ? (
            <div className="flex h-[260px] flex-col items-center justify-center gap-3 text-center sm:h-[340px] xl:h-[380px]">
              <ChartSpline className="size-6 text-[var(--workspace-icon)]" />
              <p className="text-[13px] font-medium text-[var(--workspace-ink)]">Document flow is unavailable.</p>
              <Button variant="surface" size="sm" onClick={() => setReloadToken((value) => value + 1)}>
                <RefreshCw className="size-3.5" />
                Retry
              </Button>
            </div>
          ) : (
            <>
              <ChartContainer
                config={DOCUMENT_CHART_CONFIG}
                className={cn(
                  "aspect-auto h-[260px] w-full transition-opacity duration-150 sm:h-[340px] xl:h-[380px]",
                  rangeLoading && "opacity-55",
                )}
                role="img"
                aria-label={`${countFormatter.format(totalDocuments)} documents across the ${rangeLabel(visibleRange)}`}
              >
                <AreaChart data={documentSeries} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="overviewDocumentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--landing-blue)" stopOpacity={0.22} />
                      <stop offset="82%" stopColor="var(--landing-blue)" stopOpacity={0.02} />
                      <stop offset="100%" stopColor="var(--landing-blue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--workspace-border)"
                    strokeDasharray="2 7"
                  />
                  <XAxis
                    dataKey="timestamp"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    minTickGap={visibleRange === "3m" ? 56 : 34}
                    tickFormatter={(value) => formatAxisDate(String(value), visibleRange)}
                    fontSize={11}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    width={34}
                    allowDecimals={false}
                    tickCount={4}
                    domain={[0, (maximum: number) => Math.max(1, maximum)]}
                    fontSize={11}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--workspace-selection-border)", strokeDasharray: "3 4" }}
                    content={<DocumentTooltip view={documentView} />}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="documentValue"
                    stroke="var(--landing-blue)"
                    strokeWidth={2.5}
                    fill="url(#overviewDocumentFill)"
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: "white",
                      stroke: "var(--landing-blue)",
                      strokeWidth: 2.5,
                    }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ChartContainer>

              {!rangeLoading && !hasDocumentData ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="pointer-events-auto flex items-center gap-3 rounded-md border border-[var(--workspace-border)] bg-white px-3 py-2">
                    <ChartSpline className="size-4 text-[var(--workspace-primary)]" />
                    <span className="text-[12px] font-medium text-[var(--workspace-muted)]">No documents in this period</span>
                    <Link
                      href="/dashboard/client#upload-files"
                      className="ax-interactive inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--workspace-primary)] hover:text-[var(--workspace-primary-hover)]"
                    >
                      Upload
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="grid grid-cols-3 divide-x divide-[var(--workspace-border)] border-t border-[var(--workspace-border)]">
          <div className="px-3 py-3 sm:px-5">
            <strong className="block text-[14px] font-semibold tabular-nums text-[var(--workspace-ink)]">
              {summary ? countFormatter.format(activeDays) : "—"}
            </strong>
            <span className="text-[10px] font-medium text-[var(--workspace-muted)] sm:text-[11px]">Active days</span>
          </div>
          <div className="px-3 py-3 sm:px-5">
            <strong className="block truncate text-[14px] font-semibold tabular-nums text-[var(--workspace-ink)]">
              {summary ? countFormatter.format(peakDay?.documents ?? 0) : "—"}
            </strong>
            <span className="block truncate text-[10px] font-medium text-[var(--workspace-muted)] sm:text-[11px]">
              Peak{peakDay?.documents ? ` · ${peakDay.label}` : ""}
            </span>
          </div>
          <div className="px-3 py-3 sm:px-5">
            <strong className="block text-[14px] font-semibold tabular-nums text-[var(--workspace-ink)]">
              {summary ? countFormatter.format(activeDayAverage) : "—"}
            </strong>
            <span className="text-[10px] font-medium text-[var(--workspace-muted)] sm:text-[11px]">Per active day</span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-white shadow-none">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_290px]">
          <div className="min-w-0">
            <header className="flex flex-col gap-3 border-b border-[var(--workspace-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <p className="text-[13px] font-semibold text-[var(--workspace-ink)]">Bill handoff</p>
                <p className="mt-0.5 text-[11px] font-medium text-[var(--workspace-muted)]">
                  {countFormatter.format(draftedInRange)} drafted · {countFormatter.format(publishedInRange)} published
                </p>
              </div>
              <div className="flex items-center gap-1" aria-label="Visible bill series">
                <SeriesToggle
                  label="Drafted"
                  color="var(--workspace-indicator)"
                  active={visibleBills.drafted}
                  onClick={() => toggleBillSeries("drafted")}
                />
                <SeriesToggle
                  label="Published"
                  color="var(--landing-blue)"
                  active={visibleBills.published}
                  onClick={() => toggleBillSeries("published")}
                />
              </div>
            </header>

            <div className="relative px-2 py-4 sm:px-4">
              {!summary && rangeLoading ? (
                <div className="h-[190px] sm:h-[210px]">
                  <ChartLoading label="Loading bill handoff" />
                </div>
              ) : (
                <>
                  <ChartContainer
                    config={BILL_CHART_CONFIG}
                    className={cn(
                      "aspect-auto h-[190px] w-full transition-opacity duration-150 sm:h-[210px]",
                      rangeLoading && "opacity-55",
                    )}
                    role="img"
                    aria-label={`${draftedInRange} bills drafted and ${publishedInRange} published across the ${rangeLabel(visibleRange)}`}
                  >
                    <LineChart data={baseSeries} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid
                        vertical={false}
                        stroke="var(--workspace-border)"
                        strokeDasharray="2 7"
                      />
                      <XAxis
                        dataKey="timestamp"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={10}
                        minTickGap={visibleRange === "3m" ? 56 : 34}
                        tickFormatter={(value) => formatAxisDate(String(value), visibleRange)}
                        fontSize={11}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                        width={34}
                        allowDecimals={false}
                        tickCount={3}
                        domain={[0, (maximum: number) => Math.max(1, maximum)]}
                        fontSize={11}
                      />
                      <Tooltip
                        cursor={{ stroke: "var(--workspace-selection-border)", strokeDasharray: "3 4" }}
                        content={<BillTooltip visible={visibleBills} />}
                        isAnimationActive={false}
                      />
                      {visibleBills.drafted ? (
                        <Line
                          type="monotone"
                          dataKey="drafted"
                          stroke="var(--workspace-indicator)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{
                            r: 3.5,
                            fill: "white",
                            stroke: "var(--workspace-indicator)",
                            strokeWidth: 2,
                          }}
                          isAnimationActive={false}
                        />
                      ) : null}
                      {visibleBills.published ? (
                        <Line
                          type="monotone"
                          dataKey="published"
                          stroke="var(--landing-blue)"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{
                            r: 4,
                            fill: "white",
                            stroke: "var(--landing-blue)",
                            strokeWidth: 2.5,
                          }}
                          isAnimationActive={false}
                        />
                      ) : null}
                    </LineChart>
                  </ChartContainer>

                  {!rangeLoading && !hasBillData ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-2 rounded-md border border-[var(--workspace-border)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--workspace-muted)]">
                        <ReceiptText className="size-4 text-[var(--workspace-primary)]" />
                        No bill handoff in this period
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <Link
            href={nextAction.href}
            className="ax-interactive group flex min-h-[180px] flex-col justify-between border-t border-[var(--workspace-border)] bg-[var(--workspace-soft)]/45 p-5 outline-none hover:bg-[var(--workspace-blue-soft)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--workspace-primary)]/25 lg:border-l lg:border-t-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--workspace-primary)]">Next</span>
              <ArrowUpRight className="size-4 text-[var(--workspace-icon)] transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--workspace-primary)]" />
            </div>
            <div>
              <span className="mb-3 flex size-9 items-center justify-center rounded-md bg-white text-[var(--workspace-primary)] ring-1 ring-inset ring-[var(--workspace-selection-border)]">
                <NextIcon className="size-4" />
              </span>
              <h2 className="text-[16px] font-semibold leading-5 text-[var(--workspace-ink)]">
                {nextAction.title}
              </h2>
              <p className="mt-1 text-[12px] font-medium text-[var(--workspace-muted)]">
                {nextAction.detail}
              </p>
            </div>
          </Link>
        </div>

        <nav
          className="grid grid-cols-2 divide-x divide-y divide-[var(--workspace-border)] border-t border-[var(--workspace-border)] sm:grid-cols-4 sm:divide-y-0"
          aria-label="Current workspace queues"
        >
          <QueueLink
            href="/dashboard/client"
            label="Review flags"
            value={supportLoading ? "—" : reviewFlags}
            icon={BookCheck}
          />
          <QueueLink
            href="/dashboard/accounts-payable"
            label="Open bills"
            value={supportLoading ? "—" : openBills}
            icon={ReceiptText}
          />
          <QueueLink
            href="/dashboard/accounts-payable"
            label="Ready"
            value={supportLoading ? "—" : readyBills}
            icon={CircleCheckBig}
          />
          <QueueLink
            href="/dashboard/integrations"
            label="Linked clients"
            value={supportLoading ? "—" : `${linkedClients}/${companies.length}`}
            icon={Link2}
          />
        </nav>
      </section>
    </div>
  )
}

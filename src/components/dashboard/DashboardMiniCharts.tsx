"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
} from "recharts"

import { StatusBadge, type StatusTone } from "@/components/dashboard/StatusBadge"

type ProcessingPoint = {
  timestamp: Date
  count: number
  formattedDate?: string
  formattedTime?: string
}

type DashboardStats = {
  totalProcessed: number
  todayProcessed: number
  thisMonthProcessed: number
  monthProcessed: number
  lastWeekProcessed: number
  averageTime: number
  successRate: number
  selectedPeriodProcessed?: number
  activeJobs?: number
  failedJobs?: number
  successfulJobs?: number
  totalJobs?: number
}

type CardConfig = {
  label: string
  value: number
  delta: string
  accentClass: string
  valueClass?: string
  sparkColor: string
  sparkFillId: string
  chartType: "area" | "bar"
  badge?: { tone: StatusTone; label: string }
}

function Sparkline({
  data,
  color,
  fillId,
  type,
}: {
  data: { count: number }[]
  color: string
  fillId: string
  type: "area" | "bar"
}) {
  if (!data.length || data.every((d) => d.count === 0)) {
    return (
      <div className="flex h-full items-end justify-center">
        <div className="flex h-3/4 w-full items-end gap-0.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-muted"
              style={{ height: `${20 + ((i * 13) % 60)}%` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Bar dataKey="count" fill={color} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${fillId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function StatCard({
  label,
  value,
  delta,
  accentClass,
  valueClass,
  sparkColor,
  sparkFillId,
  chartType,
  badge,
  sparkData,
}: CardConfig & { sparkData: { count: number }[] }) {
  return (
    <div className="group relative flex overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-card shadow-none">
      {/* Left accent bar */}
      <div className={`w-1 shrink-0 self-stretch ${accentClass}`} />

      {/* Card body */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        {/* Label + status badge */}
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-normal text-foreground">
            {label}
          </p>
          {badge ? (
            <StatusBadge tone={badge.tone} className="shrink-0">
              {badge.label}
            </StatusBadge>
          ) : null}
        </div>

        {/* Value + delta paired with sparkline */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-2xl font-semibold leading-none tabular-nums sm:text-3xl ${valueClass ?? "text-foreground"}`}>
              {value.toLocaleString()}
            </p>
            <p className="mt-1.5 text-xs font-medium text-foreground/70">{delta}</p>
          </div>

          {/* Sparkline */}
          <div className="h-12 w-[42%] shrink-0">
            <Sparkline
              data={sparkData}
              color={sparkColor}
              fillId={sparkFillId}
              type={chartType}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardMiniCharts({
  chartData,
  stats,
}: {
  chartData: ProcessingPoint[]
  stats: DashboardStats
}) {
  const sparkData = chartData.slice(-12).map((p) => ({ count: p.count }))

  const successRate = Math.round(stats.successRate || 0)
  const activeJobs = stats.activeJobs ?? 0
  const failedJobs = stats.failedJobs ?? 0
  const successfulJobs = stats.successfulJobs ?? Math.round((stats.totalProcessed * successRate) / 100)
  const totalJobs = stats.totalJobs ?? stats.totalProcessed

  const cards: CardConfig[] = [
    {
      label: "Total processed",
      value: stats.totalProcessed,
      delta: `${stats.todayProcessed.toLocaleString()} files today`,
      accentClass: "bg-primary",
      sparkColor: "var(--primary)",
      sparkFillId: "fill-total",
      chartType: "area",
      badge: { tone: "neutral", label: "All time" },
    },
    {
      label: "Successful",
      value: successfulJobs,
      delta: `${successRate}% success rate`,
      accentClass: "bg-[var(--workspace-primary)]",
      valueClass: "text-[var(--text-success)]",
      sparkColor: "var(--workspace-primary)",
      sparkFillId: "fill-success",
      chartType: "area",
      badge: { tone: "success", label: `${successRate}%` },
    },
    {
      label: "Active batches",
      value: activeJobs,
      delta: "waiting or reading",
      accentClass: "bg-[var(--workspace-warning)]",
      valueClass: activeJobs > 0 ? "text-[var(--text-attention)]" : "text-foreground",
      sparkColor: "var(--workspace-warning)",
      sparkFillId: "fill-active",
      chartType: "bar",
      badge: activeJobs > 0 ? { tone: "processing", label: "Active" } : { tone: "neutral", label: "Idle" },
    },
    {
      label: "Failed",
      value: failedJobs,
      delta: `of ${totalJobs.toLocaleString()} total batches`,
      accentClass: "bg-[var(--workspace-danger)]",
      valueClass: failedJobs > 0 ? "text-[var(--text-danger)]" : "text-foreground",
      sparkColor: "var(--workspace-danger)",
      sparkFillId: "fill-failed",
      chartType: "area",
      badge: failedJobs > 0 ? { tone: "error", label: "Attention" } : { tone: "success", label: "Clean" },
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} sparkData={sparkData} />
      ))}
    </div>
  )
}

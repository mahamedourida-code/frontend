"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
} from "recharts"

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
  sparkColor: string
  sparkFillId: string
  chartType: "area" | "bar"
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
  sparkColor,
  sparkFillId,
  chartType,
  sparkData,
}: CardConfig & { sparkData: { count: number }[] }) {
  return (
    <div className="group relative flex overflow-hidden rounded-[14px] border border-border bg-card shadow-none transition-colors duration-200 hover:border-[var(--workspace-selection-border)]">
      {/* Left accent bar */}
      <div className={`w-1 shrink-0 self-stretch ${accentClass}`} />

      {/* Card body */}
      <div className="flex flex-1 items-center gap-3 p-5">
        {/* Stats column */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums leading-none">
            {value.toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">{delta}</p>
        </div>

        {/* Sparkline — right 40% */}
        <div className="h-16 shrink-0" style={{ width: "40%" }}>
          <Sparkline
            data={sparkData}
            color={sparkColor}
            fillId={sparkFillId}
            type={chartType}
          />
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
    },
    {
      label: "Successful",
      value: successfulJobs,
      delta: `${successRate}% success rate`,
      accentClass: "bg-emerald-500",
      sparkColor: "#10b981",
      sparkFillId: "fill-success",
      chartType: "area",
    },
    {
      label: "Active jobs",
      value: activeJobs,
      delta: "queued or processing",
      accentClass: "bg-amber-400",
      sparkColor: "#f59e0b",
      sparkFillId: "fill-active",
      chartType: "bar",
    },
    {
      label: "Failed",
      value: failedJobs,
      delta: `of ${totalJobs.toLocaleString()} total jobs`,
      accentClass: "bg-rose-500",
      sparkColor: "#f43f5e",
      sparkFillId: "fill-failed",
      chartType: "area",
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

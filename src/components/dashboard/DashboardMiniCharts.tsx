"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
}

function MiniChartIcon({ type }: { type: "line" | "bar" | "donut" | "flow" }) {
  const paths = {
    line: "M4 17l5-5 4 4 7-8M4 19h16",
    bar: "M5 19V9m7 10V5m7 14v-7",
    donut: "M12 3a9 9 0 1 0 9 9h-9zM12 3v9h9",
    flow: "M5 7h6m-6 5h14m-8 5h8",
  }

  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[type]} />
    </svg>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-xs font-medium text-muted-foreground">
      No activity yet
    </div>
  )
}

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
  boxShadow: "var(--shadow-md)",
}

export function DashboardMiniCharts({
  chartData,
  stats,
}: {
  chartData: ProcessingPoint[]
  stats: DashboardStats
}) {
  const compactData = chartData.slice(-10).map((item) => ({
    label: item.formattedTime || item.formattedDate || "",
    count: item.count,
  }))
  const periodTotal = chartData.reduce((sum, item) => sum + item.count, 0)
  const hasActivity = compactData.some((item) => item.count > 0)
  const successValue = Math.round(stats.successRate || 0)
  const completionData = successValue > 0
    ? [
        { name: "Ready", value: successValue, color: "var(--primary)" },
        { name: "Other", value: Math.max(0, 100 - successValue), color: "var(--muted)" },
      ]
    : [{ name: "No runs", value: 100, color: "var(--muted)" }]

  const stageData = [
    { label: "Today", value: stats.todayProcessed },
    { label: "Active", value: stats.activeJobs || 0 },
    { label: "Review", value: stats.failedJobs || 0 },
  ]
  const stageMax = Math.max(...stageData.map((item) => item.value), 1)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processing pace</CardTitle>
          <MiniChartIcon type="line" />
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-2xl font-bold tabular-nums">{periodTotal.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Selected period</p>
            </div>
          </div>
          <div className="mt-3 h-20">
            {hasActivity ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={compactData} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="paceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={tooltipStyle} cursor={false} />
                  <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} fill="url(#paceFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent load</CardTitle>
          <MiniChartIcon type="bar" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums">{stats.todayProcessed.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Files today</p>
          <div className="mt-3 h-20">
            {hasActivity ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compactData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" hide />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion</CardTitle>
          <MiniChartIcon type="donut" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[92px_1fr] items-center gap-3">
            <div className="relative h-[92px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    dataKey="value"
                    innerRadius={30}
                    outerRadius={44}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {completionData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums">
                {successValue ? `${successValue}%` : "-"}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Ready jobs</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Completed output over the selected range.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Workspace flow</CardTitle>
          <MiniChartIcon type="flow" />
        </CardHeader>
        <CardContent className="space-y-3">
          {stageData.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">{item.label}</span>
                <span className="font-semibold tabular-nums">{item.value.toLocaleString()}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(4, (item.value / stageMax) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

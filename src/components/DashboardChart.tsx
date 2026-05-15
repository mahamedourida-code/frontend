"use client"

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { ChartLine } from 'lucide-react'

type TimeRange = "1d" | "7d" | "30d" | "3m"

interface ProcessingData {
  timestamp: Date
  count: number
  formattedTime?: string
  formattedDate?: string
}

interface DashboardChartProps {
  chartData: ProcessingData[]
  timeRange: TimeRange
}

export default function DashboardChart({ chartData, timeRange }: DashboardChartProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-[280px]">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    )
  }
  
  if (chartData.length === 0 || !chartData.some(d => d.count > 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-center">
        <ChartLine className="h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground/30 mb-3" />
        <p className="text-base lg:text-lg font-medium text-muted-foreground">No Activity</p>
        <p className="text-xs lg:text-sm text-muted-foreground/60 mt-1">
          No images processed in this time period
        </p>
      </div>
    )
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.7} />
          <XAxis
            dataKey={timeRange === "1d" ? "formattedTime" : "formattedDate"}
            stroke="var(--muted-foreground)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            domain={[0, 'dataMax + 2']}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-md)',
              fontSize: '12px'
            }}
            labelStyle={{ color: 'var(--muted-foreground)' }}
            formatter={(value: any) => [`${value} files`, 'Processed']}
          />
          <Line
            type="linear"
            dataKey="count"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ fill: 'var(--primary)', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

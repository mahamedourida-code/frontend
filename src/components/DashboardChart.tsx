"use client"

import React, { useEffect, useState } from 'react'
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
    console.log('[DashboardChart] Mounted with data:', { 
      dataLength: chartData.length,
      timeRange,
      sampleData: chartData[0] 
    })
  }, [chartData, timeRange])
  
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
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
        <XAxis
          dataKey={timeRange === "1d" ? "formattedTime" : "formattedDate"}
          stroke="#888888"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          domain={[0, 'dataMax + 2']}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '12px'
          }}
          labelStyle={{ color: '#666' }}
          formatter={(value: any) => [`${value} images`, 'Processed']}
        />
        <Line
          type="linear"
          dataKey="count"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ fill: '#8b5cf6', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

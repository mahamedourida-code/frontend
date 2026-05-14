"use client"

import React, { useEffect, useState, useRef } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
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
  const [dimensions, setDimensions] = useState({ width: 0, height: 280 })
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    setIsMounted(true)
    
    // Set initial dimensions
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect()
      setDimensions({ width, height: 280 })
    }

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height: 280 })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
  }, [chartData, timeRange, dimensions])
  
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

  // Use fixed width if dimensions not yet calculated
  const chartWidth = dimensions.width || 800

  return (
    <div ref={containerRef} style={{ width: '100%', height: 280 }}>
      <LineChart 
        width={chartWidth} 
        height={280} 
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
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px'
          }}
          labelStyle={{ color: 'var(--muted-foreground)' }}
          formatter={(value: any) => [`${value} images`, 'Processed']}
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
    </div>
  )
}

"use client"

import React, { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ComparisonSliderProps {
  leftContent: React.ReactNode
  rightContent: React.ReactNode
  leftLabel?: string
  rightLabel?: string
  className?: string
}

export function ComparisonSlider({
  leftContent,
  rightContent,
  leftLabel = "Before",
  rightLabel = "After",
  className,
}: ComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100))
    setSliderPosition(percent)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    handleMove(e.touches[0].clientX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove)
      document.addEventListener("touchend", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleMouseUp)
      }
    }
  }, [isDragging])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden rounded-2xl border border-border/50 shadow-2xl select-none",
        className
      )}
      onMouseMove={(e) => {
        if (!isDragging) {
          handleMove(e.clientX)
        }
      }}
      onMouseLeave={() => {
        if (!isDragging) {
          setSliderPosition(50)
        }
      }}
    >
      {/* Left side (Before) */}
      <div className="absolute inset-0 w-full h-full">
        <div className="relative w-full h-full">
          {leftContent}
          {leftLabel && (
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-1.5">
                <span className="text-sm font-medium text-muted-foreground">{leftLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side (After) - clipped */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <div className="relative w-full h-full">
          {rightContent}
          {rightLabel && (
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-1.5">
                <span className="text-sm font-medium text-primary">{rightLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slider line and handle */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-primary cursor-ew-resize z-30 transition-opacity"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-card border-2 border-primary rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-primary rounded-full" />
            <div className="w-0.5 h-4 bg-primary rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

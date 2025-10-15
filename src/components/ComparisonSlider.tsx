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
        "relative w-full h-full overflow-hidden select-none",
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

      {/* Right side (After) - with page turning effect */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          transform: `perspective(1500px) rotateY(${(50 - sliderPosition) * 0.3}deg)`,
          transformOrigin: 'left center',
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
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

      {/* Page spine shadow effect */}
      <div
        className="absolute top-0 bottom-0 w-[20px] pointer-events-none z-25"
        style={{ 
          left: `calc(${sliderPosition}% - 10px)`,
          background: `linear-gradient(90deg, transparent, rgba(0,0,0,0.2) 50%, transparent)`,
          opacity: isDragging ? 1 : 0.5,
          transition: 'opacity 0.3s'
        }}
      />

      {/* Slider line and handle with book spine look */}
      <div
        className="absolute top-0 bottom-0 w-[4px] cursor-ew-resize z-30"
        style={{ 
          left: `${sliderPosition}%`,
          background: 'linear-gradient(90deg, #8b7355, #6b5c47, #8b7355)',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-600 rounded-full shadow-xl flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-0.5 h-5 bg-amber-600 rounded-full" />
            <div className="w-0.5 h-5 bg-amber-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

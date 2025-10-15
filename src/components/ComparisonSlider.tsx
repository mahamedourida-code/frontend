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
              <div className="bg-black/80 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-xs font-medium text-white">{leftLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side (After) - clean minimal style */}
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
              <div className="bg-black/80 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-xs font-medium text-white">{rightLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ultra-thin divider line with glow */}
      <div
        className="absolute top-0 bottom-0 w-[1px] cursor-ew-resize z-30"
        style={{ 
          left: `${sliderPosition}%`,
          background: `linear-gradient(to bottom, 
            transparent 0%, 
            rgba(255,255,255,0.2) 10%, 
            rgba(255,255,255,0.4) 50%, 
            rgba(255,255,255,0.2) 90%, 
            transparent 100%)`,
          boxShadow: isDragging 
            ? '0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.1)' 
            : '0 0 10px rgba(0,0,0,0.3)',
          transition: isDragging ? 'none' : 'box-shadow 0.3s ease',
        }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* Invisible wider hit area for easier grabbing */}
        <div className="absolute inset-y-0 -left-3 -right-3 cursor-ew-resize" />
        
        {/* Elegant center handle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {/* Outer ring */}
          <div className={`absolute inset-0 w-12 h-12 rounded-full border border-white/20 transition-all duration-300 ${
            isDragging ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
          }`} />
          
          {/* Main handle button */}
          <div className={`relative w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/30 shadow-lg transition-all duration-200 ${
            isDragging ? 'scale-110 bg-white/20' : 'hover:scale-110'
          }`}>
            {/* Center dot indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-[2px] h-3 bg-white/60 rounded-full" />
                <div className="w-[2px] h-3 bg-white/60 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Ripple effect on drag */}
          {isDragging && (
            <div className="absolute inset-0 w-8 h-8">
              <div className="absolute inset-0 rounded-full border border-white/40 animate-ping" />
              <div className="absolute inset-0 rounded-full border border-white/20 animate-ping animation-delay-200" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

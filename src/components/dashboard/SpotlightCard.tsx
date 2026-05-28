"use client"

import * as React from "react"
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"

import { cn } from "@/lib/utils"

type SpotlightCardProps = {
  children: React.ReactNode
  className?: string
  /** Spotlight radius in pixels. */
  size?: number
  /** Override the gradient color (defaults to primary @ 8% alpha). */
  color?: string
  /** Disable the effect (e.g., for reduced-motion users). */
  disabled?: boolean
}

/**
 * Wraps any card with a cursor-tracked radial highlight. The spotlight
 * fades in on mouseenter and follows the cursor via spring physics for
 * a smooth lag. Designed to be wrapped around a shadcn <Card> or any
 * relatively-positionable element.
 */
export function SpotlightCard({
  children,
  className,
  size = 300,
  color = "hsl(var(--primary) / 0.08)",
  disabled = false,
}: SpotlightCardProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const mouseX = useMotionValue(-9999)
  const mouseY = useMotionValue(-9999)
  const springX = useSpring(mouseX, { stiffness: 200, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 200, damping: 30 })
  const [active, setActive] = React.useState(false)

  const background = useMotionTemplate`radial-gradient(${size}px at ${springX}px ${springY}px, ${color}, transparent 70%)`

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    const node = containerRef.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    mouseX.set(event.clientX - rect.left)
    mouseY.set(event.clientY - rect.top)
  }

  const handleMouseEnter = () => {
    if (disabled) return
    setActive(true)
  }

  const handleMouseLeave = () => {
    setActive(false)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative isolate", className)}
    >
      {children}
      {!disabled ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ background }}
        />
      ) : null}
    </div>
  )
}

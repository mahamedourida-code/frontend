"use client"

import * as React from "react"
import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Renders its children in black with a light sheen sweeping left→right on a
 * loop — identical to a polished skeleton shimmer but applied to real text.
 *
 * Uses the existing `@keyframes shimmer` + `.animate-shimmer` from globals.css
 * (background-position -1000px→1000px over 2s linear infinite). The gradient
 * keeps most of the text at near-black (#0a0a0a) with a narrow brighter band
 * (~#9ca3af) sliding across, so it reads as shimmering black copy.
 *
 * Accessibility: the underlying text remains real DOM content (no aria-hidden),
 * so screen readers see it normally.
 */
export function ShimmerText({
  children,
  className,
  tone = "ink",
}: {
  children: React.ReactNode
  className?: string
  tone?: "ink" | "working"
}) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <span className={cn(tone === "working" ? "text-[var(--text-working)]" : "text-[var(--workspace-ink)]", className)}>
        {children}
      </span>
    )
  }

  return (
    <span
      data-tone={tone}
      className={cn(
        "ax-shimmer-text animate-shimmer bg-clip-text text-transparent [background-size:220%_100%] [animation-duration:3.4s] [animation-timing-function:ease-in-out]",
        className,
      )}
    >
      {children}
    </span>
  )
}

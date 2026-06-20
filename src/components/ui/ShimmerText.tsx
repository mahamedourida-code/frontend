"use client"

import * as React from "react"
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
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "animate-shimmer bg-clip-text text-transparent [background-size:1000px_100%]",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(110deg,#0a0a0a 0%,#0a0a0a 38%,#9ca3af 50%,#0a0a0a 62%,#0a0a0a 100%)",
      }}
    >
      {children}
    </span>
  )
}

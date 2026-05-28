"use client"

import * as React from "react"

import { CONFIDENCE_TIER_LABEL, type ConfidenceTier } from "@/lib/handwritten"
import { cn } from "@/lib/utils"

type ConfidenceDotProps = {
  tier: ConfidenceTier | null
  /** Pixel diameter. Defaults to 8 (the spec calls for a "small colored dot"). */
  size?: number
  className?: string
  withRing?: boolean
}

const TIER_COLOR: Record<ConfidenceTier, string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-400",
  low: "bg-rose-500",
}

/**
 * Per-cell / per-row confidence indicator. Shown only when a tier is
 * available; if `tier` is null the dot is omitted so we don't fabricate
 * confidence where none was computed.
 */
export function ConfidenceDot({
  tier,
  size = 8,
  className,
  withRing = true,
}: ConfidenceDotProps) {
  if (!tier) return null
  return (
    <span
      aria-label={CONFIDENCE_TIER_LABEL[tier]}
      title={CONFIDENCE_TIER_LABEL[tier]}
      style={{ width: size, height: size }}
      className={cn(
        "inline-block shrink-0 rounded-full",
        TIER_COLOR[tier],
        withRing && "shadow-[0_0_0_2px_hsl(var(--background))]",
        className,
      )}
    />
  )
}

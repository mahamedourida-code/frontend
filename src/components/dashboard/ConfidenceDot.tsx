"use client"

import * as React from "react"

import { AnomalyDot } from "@/components/dashboard/AnomalyChip"
import { confidenceCopy } from "@/lib/anomaly-reasons"
import { CONFIDENCE_TIER_LABEL, type ConfidenceTier } from "@/lib/handwritten"
import { cn } from "@/lib/utils"

type ConfidenceDotProps = {
  tier: ConfidenceTier | null
  /** Pixel diameter. Defaults to 8 (the spec calls for a "small colored dot"). */
  size?: number
  className?: string
  withRing?: boolean
  /** Wrap in a hover tooltip explaining the tier. Defaults to true. */
  withTooltip?: boolean
}

const TIER_COLOR: Record<ConfidenceTier, string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-400",
  low: "bg-rose-500",
}

const TIER_SHORT: Record<ConfidenceTier, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
}

/**
 * Per-cell / per-row confidence indicator. Shown only when a tier is
 * available; if `tier` is null the dot is omitted so we don't fabricate
 * confidence where none was computed. On hover it explains the tier via the
 * shared `AnomalyDot` "why" tooltip — a bare colored dot is ambiguous, so the
 * tooltip carries a one-line plain-English reason.
 */
export function ConfidenceDot({
  tier,
  size = 8,
  className,
  withRing = true,
  withTooltip = true,
}: ConfidenceDotProps) {
  if (!tier) return null
  if (!withTooltip) {
    return (
      <span
        aria-label={CONFIDENCE_TIER_LABEL[tier]}
        title={CONFIDENCE_TIER_LABEL[tier]}
        style={{ width: size, height: size }}
        className={cn(
          "inline-block shrink-0 rounded-full",
          TIER_COLOR[tier],
          withRing && "ring-2 ring-background",
          className,
        )}
      />
    )
  }
  const copy = confidenceCopy(tier)
  return (
    <AnomalyDot
      tone={copy.tone}
      title={copy.title}
      reason={copy.reason}
      ariaLabel={CONFIDENCE_TIER_LABEL[tier]}
      size={size}
      withRing={withRing}
      className={className}
    />
  )
}

/**
 * Compact legend explaining the three confidence tiers — shown once above a
 * handwritten document's table so the dots are legible without hovering.
 */
export function ConfidenceLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-[11px] font-medium text-muted-foreground", className)}>
      <span className="uppercase tracking-normal">Confidence</span>
      {(["high", "medium", "low"] as ConfidenceTier[]).map((tier) => (
        <span key={tier} className="inline-flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", TIER_COLOR[tier])} />
          {TIER_SHORT[tier].replace(" confidence", "")}
        </span>
      ))}
    </div>
  )
}

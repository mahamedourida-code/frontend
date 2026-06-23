"use client"

import * as React from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * Shared "why" primitive for the review board.
 *
 * Every confidence dot and anomaly flag (duplicate, over-PO, missing VAT,
 * reconciliation gap) routes through this one component so the tone palette
 * and interaction stay consistent across the workspace and AP queue. Each
 * instance carries a one-line, plain-English `reason` shown on hover/focus —
 * the chip never relies on a bare colour to convey meaning.
 *
 * Tone maps to the brand's three-state palette:
 *   good    → emerald   (clean / high confidence)
 *   caution → amber     (review recommended)
 *   risk    → rose      (flagged / verify before use)
 *
 * Reason strings live in `@/lib/anomaly-reasons` so the language is centralized.
 */

export type AnomalyTone = "good" | "caution" | "risk"

const TONE_DOT: Record<AnomalyTone, string> = {
  good: "bg-emerald-500",
  caution: "bg-amber-400",
  risk: "bg-rose-500",
}

const TONE_PILL: Record<AnomalyTone, string> = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-900",
  caution: "border-amber-200 bg-amber-50 text-amber-900",
  risk: "border-rose-200 bg-rose-50 text-rose-900",
}

type CommonProps = {
  tone: AnomalyTone
  /** One-line, plain-English explanation shown on hover/focus. */
  reason: string
  /** Bold lead line above the reason inside the tooltip. Defaults to `label`. */
  title?: string
  /** Tooltip placement. */
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

/** Wrap any element in the shared "why" tooltip without changing its visuals. */
export function AnomalyReason({
  tone: _tone,
  reason,
  title,
  side = "top",
  children,
}: CommonProps & { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className="max-w-[240px]">
        {title ? <span className="block font-semibold">{title}</span> : null}
        <span className={cn("block", title && "mt-0.5 text-background/80")}>{reason}</span>
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * Small colored dot + "why" tooltip. Use for confidence indicators where a
 * full pill would be too heavy (per-row / per-cell).
 */
export function AnomalyDot({
  tone,
  reason,
  title,
  side = "right",
  size = 8,
  withRing = true,
  ariaLabel,
  className,
}: CommonProps & { size?: number; withRing?: boolean; ariaLabel?: string }) {
  const label = ariaLabel ?? title ?? reason
  return (
    <AnomalyReason tone={tone} reason={reason} title={title} side={side}>
      <button
        type="button"
        aria-label={label}
        className="inline-flex cursor-help items-center"
      >
        <span
          style={{ width: size, height: size }}
          className={cn(
            "inline-block shrink-0 rounded-full",
            TONE_DOT[tone],
            withRing && "ring-2 ring-background",
            className,
          )}
        />
      </button>
    </AnomalyReason>
  )
}

/**
 * Pill-shaped anomaly chip: short label with the full reason on hover.
 * `rounded-full` per the brand pill rule.
 */
export function AnomalyChip({
  tone,
  reason,
  label,
  title,
  side = "top",
  className,
}: CommonProps & { label: React.ReactNode }) {
  return (
    <AnomalyReason tone={tone} reason={reason} title={title ?? (typeof label === "string" ? label : undefined)} side={side}>
      <button
        type="button"
        className={cn(
          "inline-flex h-6 cursor-help items-center rounded-full border px-2.5 text-xs font-medium leading-none whitespace-nowrap",
          TONE_PILL[tone],
          className,
        )}
      >
        {label}
      </button>
    </AnomalyReason>
  )
}

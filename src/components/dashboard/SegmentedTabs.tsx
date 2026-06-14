"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

export interface SegmentedTab {
  value: string
  label: React.ReactNode
  /** Optional leading lucide icon. */
  icon?: React.ReactNode
  /** Optional trailing count, rendered as a tabular-nums chip. */
  count?: number | string
}

interface SegmentedTabsProps {
  tabs: SegmentedTab[]
  value: string
  onValueChange: (value: string) => void
  /** Visual size. */
  size?: "sm" | "md"
  className?: string
  "aria-label"?: string
}

/**
 * Tables-style segmented control: a soft track holding pill tabs, with the
 * active pill sliding between options (shared-layout, framer-motion only). The
 * active tab reads as a white card with a quiet ring; inactive tabs are calm
 * ink. Counts ride along as small tabular chips — no sentences, just numbers.
 *
 * One primitive for every "switch view" surface (AP queue tabs, review filters,
 * settings sections) so they all feel like the same product.
 */
export function SegmentedTabs({
  tabs,
  value,
  onValueChange,
  size = "md",
  className,
  ...rest
}: SegmentedTabsProps) {
  const prefersReducedMotion = useReducedMotion()
  const layoutId = React.useId()

  return (
    <div
      role="tablist"
      aria-label={rest["aria-label"]}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-[var(--workspace-soft)] p-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              "ax-interactive relative inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap",
              size === "sm" ? "h-8 px-3 text-[13px]" : "h-9 px-4 text-sm",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 480, damping: 38 }
                }
                className="absolute inset-0 rounded-full border border-[var(--workspace-border)] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.06)]"
              />
            ) : null}
            {tab.icon ? (
              <span className="relative z-10 inline-flex shrink-0 [&_svg]:size-4">{tab.icon}</span>
            ) : null}
            <span className="relative z-10">{tab.label}</span>
            {tab.count !== undefined && tab.count !== null ? (
              <span
                className={cn(
                  "relative z-10 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                  active
                    ? "bg-[color-mix(in_srgb,var(--workspace-primary)_12%,transparent)] text-[var(--workspace-primary)]"
                    : "bg-[color-mix(in_srgb,var(--workspace-ink)_8%,transparent)] text-foreground",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

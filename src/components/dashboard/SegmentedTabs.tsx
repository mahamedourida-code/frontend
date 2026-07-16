"use client"

import * as React from "react"

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
  tabClassName?: string
  labelClassName?: string
  "aria-label"?: string
}

/** Shared segmented control for workspace filters and view switches. */
export function SegmentedTabs({
  tabs,
  value,
  onValueChange,
  size = "md",
  className,
  tabClassName,
  labelClassName,
  ...rest
}: SegmentedTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={rest["aria-label"]}
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-[var(--workspace-border)] bg-[var(--workspace-soft)] p-0.5",
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
              "ax-interactive relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]/25",
              size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-8 px-3.5 text-[13px]",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              tabClassName,
            )}
          >
            {active ? (
              <span className="absolute inset-0 rounded-full border border-[var(--workspace-border)] bg-white" />
            ) : null}
            {tab.icon ? (
              <span className="relative z-10 inline-flex shrink-0 text-black [&_svg]:size-3.5 [&_svg]:text-black">{tab.icon}</span>
            ) : null}
            <span className={cn("relative z-10", labelClassName)}>{tab.label}</span>
            {tab.count !== undefined && tab.count !== null ? (
              <span
                className={cn(
                  "relative z-10 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full border px-1.5 text-[11px] font-semibold tabular-nums",
                  active
                    ? "border-[color-mix(in_srgb,var(--workspace-primary)_20%,var(--workspace-border))] bg-[color-mix(in_srgb,var(--workspace-primary)_9%,white)] text-[var(--workspace-primary)]"
                    : "border-[var(--workspace-border)] bg-white text-[var(--workspace-ink)]",
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

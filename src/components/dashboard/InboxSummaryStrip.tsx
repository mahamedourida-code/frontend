import * as React from "react"

import { cn } from "@/lib/utils"

interface InboxSummaryStripProps {
  processing: number
  needsYou: number
  ready: number
  published: number
  className?: string
  /** Optional click handlers to jump the underlying view to a pile. */
  onSelect?: (pile: "needs_you" | "ready" | "published") => void
}

type Stat = {
  key: "processing" | "needs_you" | "ready" | "published"
  label: string
  value: number
  selectable?: "needs_you" | "ready" | "published"
}

/**
 * A glanceable "work is already happening" strip for the top of the workspace:
 * processing · needs you · ready · published. Delivers the calm "inbox" feeling
 * whole_point.md asks for without a separate page. Pure presentation over
 * counts the caller already has; brand tokens only, no gradients.
 */
export function InboxSummaryStrip({
  processing,
  needsYou,
  ready,
  published,
  className,
  onSelect,
}: InboxSummaryStripProps) {
  const stats: Stat[] = [
    { key: "processing", label: "Reading", value: processing },
    { key: "needs_you", label: "Needs you", value: needsYou, selectable: "needs_you" },
    { key: "ready", label: "Ready", value: ready, selectable: "ready" },
    { key: "published", label: "Published", value: published, selectable: "published" },
  ]

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4",
        className,
      )}
    >
      {stats.map((stat) => {
        const interactive = Boolean(stat.selectable && onSelect && stat.value > 0)
        const content = (
          <>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {stat.label}
            </span>
            <span className="mt-1 text-xl font-semibold tabular-nums text-foreground">{stat.value}</span>
          </>
        )
        if (interactive) {
          return (
            <button
              key={stat.key}
              type="button"
              onClick={() => stat.selectable && onSelect?.(stat.selectable)}
              className="ax-interactive flex flex-col bg-card px-4 py-3 text-left hover:bg-accent/30"
            >
              {content}
            </button>
          )
        }
        return (
          <div key={stat.key} className="flex flex-col bg-card px-4 py-3">
            {content}
          </div>
        )
      })}
    </div>
  )
}

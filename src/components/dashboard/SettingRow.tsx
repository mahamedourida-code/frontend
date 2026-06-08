import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * One settings line in the Lindy-style stacked layout: a bold black label
 * (with optional black value/hint underneath) on the left, and the action
 * slot — usually an <InlineAction> or a control — pinned to the right.
 *
 * No grey text anywhere: labels and values are both foreground (black on the
 * card). Rows divide with a hairline border via the `divide-*` utility on the
 * parent, or pass `bordered` for a top border per row.
 */
export function SettingRow({
  label,
  value,
  children,
  bordered = false,
  align = "center",
  className,
}: {
  label: React.ReactNode
  /** Optional secondary line under the label (rendered black, never grey). */
  value?: React.ReactNode
  /** Right-aligned action / control slot. */
  children?: React.ReactNode
  bordered?: boolean
  align?: "center" | "start"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4",
        align === "start" && "items-start",
        bordered && "border-t border-border",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight text-foreground">{label}</p>
        {value ? <p className="mt-1 text-sm leading-snug text-foreground">{value}</p> : null}
      </div>
      {children ? <div className="flex shrink-0 items-center gap-5">{children}</div> : null}
    </div>
  )
}

import * as React from "react"

import { cn } from "@/lib/utils"

interface FieldProps {
  /** Field label — always ink, never grey. */
  label: React.ReactNode
  /** Optional leading lucide icon (size-3.5, accent). */
  icon?: React.ReactNode
  /** The control or value (input, select, text). */
  children: React.ReactNode
  /** Optional trailing slot in the label row, e.g. an AnomalyChip or count. */
  trailing?: React.ReactNode
  /** Render the value side-by-side with the label instead of stacked. */
  inline?: boolean
  htmlFor?: string
  className?: string
}

/**
 * One labelled field, used in every detail pane / coding form. The label is a
 * confident ink line (optionally icon-led); the control sits a calm 6px below.
 * Replaces the scattered `text-[11px] text-muted-foreground` labels so forms
 * stop reading as washed-out and start reading as structured.
 */
export function Field({
  label,
  icon,
  children,
  trailing,
  inline = false,
  htmlFor,
  className,
}: FieldProps) {
  return (
    <div
      className={cn(
        inline ? "flex items-center justify-between gap-4" : "flex flex-col gap-1.5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1.5 text-[13px] font-medium text-foreground"
        >
          {icon ? (
            <span className="inline-flex shrink-0 text-[var(--workspace-blue)] [&_svg]:size-[15px]">
              {icon}
            </span>
          ) : null}
          {label}
        </label>
        {trailing ? <span className="shrink-0">{trailing}</span> : null}
      </div>
      <div className={cn(inline && "shrink-0")}>{children}</div>
    </div>
  )
}

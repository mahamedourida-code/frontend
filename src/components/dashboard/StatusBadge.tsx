import * as React from "react"

import { cn } from "@/lib/utils"

type StatusTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "review"
  | "processing"

interface StatusBadgeProps {
  tone: StatusTone
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

const toneClasses: Record<StatusTone, string> = {
  success:
    "bg-[var(--status-success-bg)] text-[var(--status-success-fg)] border-[color-mix(in_srgb,var(--status-success-fg)_22%,transparent)]",
  warning:
    "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)] border-[color-mix(in_srgb,var(--status-warning-fg)_22%,transparent)]",
  error:
    "bg-[var(--status-error-bg)] text-[var(--status-error-fg)] border-[color-mix(in_srgb,var(--status-error-fg)_22%,transparent)]",
  info:
    "bg-[var(--status-info-bg)] text-[var(--status-info-fg)] border-[color-mix(in_srgb,var(--status-info-fg)_22%,transparent)]",
  neutral:
    "bg-[var(--status-neutral-bg)] text-[var(--status-neutral-fg)] border-[color-mix(in_srgb,var(--status-neutral-fg)_18%,transparent)]",
  review:
    "bg-[var(--status-review-bg)] text-[var(--status-review-fg)] border-[color-mix(in_srgb,var(--status-review-fg)_22%,transparent)]",
  processing:
    "bg-[var(--status-processing-bg)] text-[var(--status-processing-fg)] border-[color-mix(in_srgb,var(--status-processing-fg)_22%,transparent)]",
}

function StatusBadge({ tone, children, icon, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium leading-none whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {icon ? <span className="inline-flex shrink-0 [&_svg]:size-3.5">{icon}</span> : null}
      {children}
    </span>
  )
}

export { StatusBadge, type StatusTone }

import * as React from "react"
import { CheckCircle2, CircleAlert, CircleX, Eye, LoaderCircle, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type StatusTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "review"
  | "processing"

const toneIcons: Partial<Record<StatusTone, LucideIcon>> = {
  success: CheckCircle2,
  warning: CircleAlert,
  error: CircleX,
  review: Eye,
  processing: LoaderCircle,
}

interface StatusBadgeProps {
  tone: StatusTone
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

const toneClasses: Record<StatusTone, string> = {
  success:
    "border-[color-mix(in_srgb,var(--text-success)_34%,transparent)] bg-[color-mix(in_srgb,var(--text-success)_8%,white)] text-[var(--text-success)]",
  warning:
    "border-[color-mix(in_srgb,var(--text-attention)_34%,transparent)] bg-[color-mix(in_srgb,var(--text-attention)_9%,white)] text-[var(--text-attention)]",
  error:
    "border-[color-mix(in_srgb,var(--text-danger)_34%,transparent)] bg-[color-mix(in_srgb,var(--text-danger)_8%,white)] text-[var(--text-danger)]",
  info:
    "border-[color-mix(in_srgb,var(--workspace-primary)_28%,transparent)] bg-[color-mix(in_srgb,var(--workspace-primary)_7%,white)] text-[var(--workspace-primary)]",
  neutral:
    "border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-[var(--workspace-muted)]",
  review:
    "border-[color-mix(in_srgb,var(--text-review)_32%,transparent)] bg-[color-mix(in_srgb,var(--text-review)_8%,white)] text-[var(--text-review)]",
  processing:
    "border-[color-mix(in_srgb,var(--text-working)_30%,transparent)] bg-[color-mix(in_srgb,var(--text-working)_7%,white)] text-[var(--text-working)]",
}

function StatusBadge({ tone, children, icon, className }: StatusBadgeProps) {
  const AutoIcon = toneIcons[tone]
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-semibold leading-none whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {icon ? (
        <span className="inline-flex shrink-0 [&_svg]:size-3.5">{icon}</span>
      ) : AutoIcon ? (
        <AutoIcon
          aria-hidden="true"
          className={cn("size-3.5 shrink-0", tone === "processing" && "animate-spin")}
          strokeWidth={2.25}
        />
      ) : null}
      {children}
    </span>
  )
}

export { StatusBadge, type StatusTone }

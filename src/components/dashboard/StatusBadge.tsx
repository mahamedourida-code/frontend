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
    "border-[color-mix(in_srgb,var(--text-success)_44%,transparent)] bg-white text-[var(--text-success)]",
  warning:
    "border-[color-mix(in_srgb,var(--text-attention)_44%,transparent)] bg-white text-[var(--text-attention)]",
  error:
    "border-[color-mix(in_srgb,var(--text-danger)_44%,transparent)] bg-white text-[var(--text-danger)]",
  info:
    "border-[color-mix(in_srgb,var(--workspace-primary)_38%,transparent)] bg-white text-[var(--workspace-primary)]",
  neutral:
    "border-[var(--workspace-border)] bg-white text-[var(--workspace-muted)]",
  review:
    "border-[color-mix(in_srgb,var(--text-review)_42%,transparent)] bg-white text-[var(--text-review)]",
  processing:
    "border-[color-mix(in_srgb,var(--text-working)_38%,transparent)] bg-white text-[var(--text-working)]",
}

function StatusBadge({ tone, children, icon, className }: StatusBadgeProps) {
  const AutoIcon = toneIcons[tone]
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium leading-none whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {icon ? (
        <span className="inline-flex shrink-0 [&_svg]:size-3.5">{icon}</span>
      ) : AutoIcon ? (
        <AutoIcon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2.25} />
      ) : null}
      {children}
    </span>
  )
}

export { StatusBadge, type StatusTone }

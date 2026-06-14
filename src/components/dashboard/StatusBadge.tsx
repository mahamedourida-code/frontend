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
    "border-[color-mix(in_srgb,var(--workspace-success)_44%,transparent)] bg-white text-[var(--workspace-success)]",
  warning:
    "border-[color-mix(in_srgb,var(--workspace-warning)_44%,transparent)] bg-white text-[var(--workspace-warning)]",
  error:
    "border-[color-mix(in_srgb,var(--workspace-danger)_44%,transparent)] bg-white text-[var(--workspace-danger)]",
  info:
    "border-[color-mix(in_srgb,var(--workspace-primary)_38%,transparent)] bg-white text-[var(--workspace-primary)]",
  neutral:
    "border-[var(--workspace-border)] bg-white text-[var(--workspace-muted)]",
  review:
    "border-[color-mix(in_srgb,var(--workspace-purple)_42%,transparent)] bg-white text-[var(--workspace-purple)]",
  processing:
    "border-[color-mix(in_srgb,var(--workspace-primary)_38%,transparent)] bg-white text-[var(--workspace-primary)]",
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

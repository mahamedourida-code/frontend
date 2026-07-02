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
  showIcon?: boolean
  size?: "sm" | "md"
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
    "border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-[var(--workspace-ink)]",
  review:
    "border-[color-mix(in_srgb,var(--text-review)_32%,transparent)] bg-[color-mix(in_srgb,var(--text-review)_8%,white)] text-[var(--text-review)]",
  processing:
    "border-[color-mix(in_srgb,var(--text-working)_30%,transparent)] bg-[color-mix(in_srgb,var(--text-working)_7%,white)] text-[var(--text-working)]",
}

const sizeClasses: Record<NonNullable<StatusBadgeProps["size"]>, string> = {
  sm: "h-5 gap-1 px-2 text-[11px] [&_svg]:size-3",
  md: "h-6 gap-1.5 px-2.5 text-[12px] [&_svg]:size-3.5",
}

function StatusBadge({ tone, children, icon, showIcon = true, size = "md", className }: StatusBadgeProps) {
  const AutoIcon = toneIcons[tone]
  const shouldRenderIcon = showIcon && (icon || AutoIcon)

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold leading-none whitespace-nowrap shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]",
        sizeClasses[size],
        toneClasses[tone],
        className,
      )}
    >
      {shouldRenderIcon && icon ? (
        <span className="inline-flex shrink-0">{icon}</span>
      ) : shouldRenderIcon && AutoIcon ? (
        <AutoIcon
          aria-hidden="true"
          className={cn("shrink-0", tone === "processing" && "animate-spin")}
          strokeWidth={2.25}
        />
      ) : null}
      {children}
    </span>
  )
}

export { StatusBadge, type StatusTone }

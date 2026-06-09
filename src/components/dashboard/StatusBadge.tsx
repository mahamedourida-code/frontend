import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

type StatusTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "review"
  | "processing"

const toneIcons: Partial<Record<StatusTone, string>> = {
  success: "/icons/status/success-check.png",
  warning: "/icons/status/warning-triangle.png",
  error: "/icons/status/error-x.png",
  review: "/icons/status/needs-review-eye.png",
  processing: "/icons/status/processing-ring.png",
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
  const autoIconSrc = toneIcons[tone]
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
      ) : autoIconSrc ? (
        <Image
          src={autoIconSrc}
          alt=""
          width={14}
          height={14}
          className={cn("shrink-0 object-contain", tone === "processing" && "animate-spin")}
          loading="eager"
        />
      ) : null}
      {children}
    </span>
  )
}

export { StatusBadge, type StatusTone }

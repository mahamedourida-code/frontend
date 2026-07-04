import * as React from "react"

import { cn } from "@/lib/utils"

interface SettingRowProps {
  label: React.ReactNode
  /** Optional secondary line under the label. */
  value?: React.ReactNode
  /** Short operational hint under the value. */
  hint?: React.ReactNode
  /** Optional leading icon for scan-friendly settings groups. */
  icon?: React.ReactNode
  /** Right-aligned action / control slot. */
  children?: React.ReactNode
  bordered?: boolean
  align?: "center" | "start"
  compact?: boolean
  className?: string
  labelClassName?: string
  valueClassName?: string
  hintClassName?: string
  childrenClassName?: string
}

/** One settings line with a compact label/value column and an action slot. */
export function SettingRow({
  label,
  value,
  hint,
  icon,
  children,
  bordered = false,
  align = "center",
  compact = false,
  className,
  labelClassName,
  valueClassName,
  hintClassName,
  childrenClassName,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:justify-between",
        compact ? "gap-2.5 py-3 sm:gap-x-4" : "gap-3 py-4 sm:gap-x-6",
        align === "center" ? "sm:items-center" : "sm:items-start",
        bordered && "border-t border-[var(--workspace-border)]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        {icon ? (
          <span
            className={cn(
              "mt-0.5 inline-flex shrink-0 items-center justify-center rounded-lg border border-[var(--workspace-border)] bg-white text-black [&_svg]:text-black",
              compact ? "size-6 [&_svg]:size-3.5" : "size-7 [&_svg]:size-4",
            )}
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className={cn("text-[13px] font-semibold leading-5 text-foreground", labelClassName)}>
            {label}
          </p>
          {value ? (
            <p className={cn("mt-1 max-w-2xl text-[13px] leading-5 text-[var(--workspace-ink)]", valueClassName)}>
              {value}
            </p>
          ) : null}
          {hint ? (
            <p className={cn("mt-1 max-w-xl text-pretty text-[12px] leading-5 text-[var(--workspace-muted)]", hintClassName)}>
              {hint}
            </p>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className={cn("flex w-full items-center gap-3 sm:w-auto sm:shrink-0 sm:justify-end", childrenClassName)}>
          {children}
        </div>
      ) : null}
    </div>
  )
}

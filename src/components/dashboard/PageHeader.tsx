import * as React from "react"

import { AnimatedPageTitle } from "@/components/dashboard/AnimatedPageTitle"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
  className?: string
  descriptionClassName?: string
  actionsClassName?: string
  breadcrumbClassName?: string
  compact?: boolean
}

function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
  descriptionClassName,
  actionsClassName,
  breadcrumbClassName,
  compact = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        compact && "mb-4 gap-2.5",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {breadcrumb ? (
          <div
            className={cn(
              "mb-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--workspace-border)] bg-white px-2.5 py-1 text-[12px] font-medium text-[var(--workspace-muted)] shadow-[0_1px_1px_0_rgba(16,24,40,0.03)]",
              breadcrumbClassName,
            )}
          >
            {breadcrumb}
          </div>
        ) : null}
        <AnimatedPageTitle
          title={title}
          className={compact ? "text-[22px] sm:text-[24px]" : "text-[26px] sm:text-[28px]"}
        />
        {description ? (
          <p
            className={cn(
              "mt-2 max-w-2xl text-pretty text-[14px] leading-5 text-[var(--workspace-muted)]",
              compact && "mt-1.5 max-w-xl text-[13px]",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className={cn("flex flex-wrap items-center gap-2 sm:shrink-0 sm:pt-1", actionsClassName)}>
          {actions}
        </div>
      ) : null}
    </div>
  )
}

export { PageHeader }

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
        "mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        compact && "mb-5 gap-3",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {breadcrumb ? (
          <div
            className={cn(
              "mb-2 flex max-w-full items-center gap-1.5 text-[13px] font-medium text-[var(--workspace-muted)]",
              breadcrumbClassName,
            )}
          >
            {breadcrumb}
          </div>
        ) : null}
        <AnimatedPageTitle
          title={title}
          className={compact ? "text-[21px] sm:text-[23px]" : "text-[24px] sm:text-[26px]"}
        />
        {description ? (
          <p
            className={cn(
              "mt-2 max-w-[56ch] text-pretty text-[13px] leading-5 text-[var(--workspace-muted)]",
              compact && "mt-1.5 max-w-[48ch] text-[12px]",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className={cn("flex flex-wrap items-center gap-2 sm:shrink-0 sm:pt-0.5", actionsClassName)}>
          {actions}
        </div>
      ) : null}
    </div>
  )
}

export { PageHeader }

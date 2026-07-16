import * as React from "react"

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
  /** Keeps action-heavy headers available beneath the workspace bar. */
  stickyActions?: boolean
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
  stickyActions = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        compact && "mb-4 gap-2.5",
        stickyActions && Boolean(actions) && "sticky top-14 z-30 -mx-4 border-b border-[var(--workspace-border)] bg-white/[0.96] px-4 py-3 backdrop-blur-md sm:-mx-5 sm:px-5 lg:-mx-7 lg:px-7 xl:-mx-8 xl:px-8",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {breadcrumb ? (
          <div
            className={cn(
              "mb-1.5 flex max-w-full items-center gap-1.5 text-[12px] font-medium text-[var(--workspace-muted)]",
              breadcrumbClassName,
            )}
          >
            {breadcrumb}
          </div>
        ) : null}
        <h1 className={cn("text-[22px] font-semibold leading-7 text-[var(--workspace-ink)] sm:text-[24px]", compact && "text-[20px] leading-6 sm:text-[21px]")}>{title}</h1>
        {description ? (
          <p
            className={cn(
              "mt-1.5 max-w-[62ch] text-pretty text-[13px] leading-5 text-[var(--workspace-muted)]",
              compact && "mt-1 max-w-[52ch] text-[12px]",
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

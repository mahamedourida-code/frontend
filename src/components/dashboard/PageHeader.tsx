import * as React from "react"

import { AnimatedPageTitle } from "@/components/dashboard/AnimatedPageTitle"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
  className?: string
}

function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0 flex-1">
        {breadcrumb ? (
          <div className="mb-2 text-[13px] font-medium text-[var(--workspace-muted)]">{breadcrumb}</div>
        ) : null}
        <AnimatedPageTitle title={title} />
        {description ? (
          <p className="mt-2 max-w-3xl text-[15px] leading-6 text-[var(--workspace-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0 sm:pt-1">{actions}</div>
      ) : null}
    </div>
  )
}

export { PageHeader }

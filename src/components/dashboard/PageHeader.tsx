import * as React from "react"

import { AnimatedPageTitle } from "@/components/dashboard/AnimatedPageTitle"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
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
    <div className={cn("mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0 flex-1">
        {breadcrumb ? <div className="mb-2 text-xs font-medium text-muted-foreground">{breadcrumb}</div> : null}
        <AnimatedPageTitle title={title} />
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[15px] font-normal leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3 sm:shrink-0">{actions}</div>
      ) : null}
    </div>
  )
}

export { PageHeader }

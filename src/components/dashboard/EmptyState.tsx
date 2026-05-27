import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
  className?: string
  illustration?: string
}

function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className,
  illustration,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-16",
        className,
      )}
    >
      {illustration ? (
        <Image
          src={illustration}
          alt=""
          role="presentation"
          width={compact ? 72 : 96}
          height={compact ? 72 : 96}
          className="object-contain opacity-90"
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted text-muted-foreground",
            compact ? "size-9 [&_svg]:size-4" : "size-10 [&_svg]:size-5",
          )}
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className={cn(compact ? "mt-1" : "mt-2")}>{action}</div> : null}
    </div>
  )
}

export { EmptyState }

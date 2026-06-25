import * as React from "react"

import { WorkspaceArt } from "@/components/dashboard/WorkspaceArt"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
  className?: string
  /**
   * Optional workspace caricature name (from `/public/workspace-art`). When set,
   * a big raw illustration replaces the small `icon` glyph.
   */
  art?: string
  /**
   * Optional small kicker shown above the title (e.g. "Get started"). Renders
   * as a quiet emerald-tinted label so onboarding states feel guided, not bare.
   */
  eyebrow?: string
  /**
   * Optional "how it works" affordance — a short, ordered list of plain-language
   * steps rendered under the description. Reads calmly: each step is numbered in
   * a soft pill. Omit to keep the original three-line layout.
   */
  steps?: React.ReactNode[]
}

function EmptyState({
  icon,
  title,
  action,
  compact = false,
  className,
  eyebrow,
  art,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2.5 px-4 py-8" : "gap-3.5 px-6 py-16",
        className,
      )}
    >
      {art ? (
        <WorkspaceArt name={art} className={compact ? "h-28 w-auto" : "h-36 w-auto"} />
      ) : (
        <div
          className={cn(
            "text-slate-300 dark:text-slate-600",
            compact ? "[&_svg]:size-7" : "[&_svg]:size-9",
          )}
        >
          {icon}
        </div>
      )}
      {eyebrow ? (
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--brand-green-fg)]/70">
          {eyebrow}
        </span>
      ) : null}
      <h3
        className={cn(
          "font-semibold tracking-tight text-foreground",
          compact ? "text-base" : "text-lg",
          eyebrow ? "-mt-1.5" : undefined,
        )}
      >
        {title}
      </h3>
      {action ? <div className={cn(compact ? "mt-1" : "mt-2")}>{action}</div> : null}
    </div>
  )
}

export { EmptyState }

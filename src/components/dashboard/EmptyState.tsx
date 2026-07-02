import * as React from "react"

import { WorkspaceArt } from "@/components/dashboard/WorkspaceArt"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: React.ReactNode
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
  description,
  action,
  compact = false,
  className,
  eyebrow,
  art,
  steps,
}: EmptyStateProps) {
  const hasSteps = Boolean(steps?.length)

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-xl flex-col items-center justify-center text-center",
        compact ? "gap-2.5 px-4 py-8" : "gap-3.5 px-6 py-14",
        className,
      )}
    >
      {art ? (
        <WorkspaceArt name={art} className={compact ? "h-28 w-auto" : "h-36 w-auto"} />
      ) : (
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-full border border-[var(--workspace-border)] bg-white text-[var(--workspace-muted)]",
            compact ? "size-10 [&_svg]:size-5" : "size-12 [&_svg]:size-6",
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
      {description ? (
        <p
          className={cn(
            "max-w-md text-pretty text-[14px] leading-6 text-[var(--workspace-muted)]",
            compact && "text-[13px] leading-5",
          )}
        >
          {description}
        </p>
      ) : null}
      {hasSteps ? (
        <ol
          className={cn(
            "mt-1 grid w-full max-w-md gap-2 text-left",
            compact && "max-w-sm gap-1.5",
          )}
        >
          {steps?.map((step, index) => (
            <li
              key={index}
              className={cn(
                "flex items-start gap-2.5 rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-soft)] px-3 py-2 text-[13px] leading-5 text-[var(--workspace-ink)]",
                compact && "px-2.5 py-1.5 text-[12px] leading-5",
              )}
            >
              <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white font-mono text-[11px] font-semibold tabular-nums text-[var(--workspace-primary)] ring-1 ring-inset ring-[var(--workspace-border)]">
                {index + 1}
              </span>
              <span className="min-w-0">{step}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {action ? <div className={cn(compact || description || hasSteps ? "mt-1" : "mt-2")}>{action}</div> : null}
    </div>
  )
}

export { EmptyState }

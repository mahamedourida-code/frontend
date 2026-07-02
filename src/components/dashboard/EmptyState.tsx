import * as React from "react"

import { WorkspaceArt } from "@/components/dashboard/WorkspaceArt"
import { cn } from "@/lib/utils"

const descriptionLineClasses: Record<1 | 2 | 3, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
}

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  compact?: boolean
  className?: string
  descriptionClassName?: string
  actionClassName?: string
  iconClassName?: string
  artClassName?: string
  align?: "center" | "start"
  descriptionLines?: 1 | 2 | 3
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
   * Optional "how it works" affordance: a short, ordered list of plain-language
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
  descriptionClassName,
  actionClassName,
  iconClassName,
  artClassName,
  align = "center",
  descriptionLines,
  eyebrow,
  art,
  steps,
}: EmptyStateProps) {
  const hasSteps = Boolean(steps?.length)
  const lineClampClass = descriptionLines ? descriptionLineClasses[descriptionLines] : undefined

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col justify-center",
        align === "center" ? "items-center text-center" : "items-start text-left",
        compact ? "max-w-md gap-2.5 px-4 py-8" : "max-w-lg gap-3 px-6 py-12",
        className,
      )}
    >
      {art ? (
        <WorkspaceArt
          name={art}
          className={cn(compact ? "h-24 w-auto" : "h-32 w-auto", artClassName)}
        />
      ) : (
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-lg border border-[var(--workspace-border)] bg-white text-[var(--workspace-ink)] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]",
            compact ? "size-9 [&_svg]:size-[18px]" : "size-10 [&_svg]:size-5",
            iconClassName,
          )}
        >
          {icon}
        </div>
      )}
      {eyebrow ? (
        <span className="inline-flex h-5 items-center rounded-full border border-[var(--workspace-border)] bg-[var(--workspace-soft)] px-2 text-[11px] font-semibold text-[var(--workspace-muted)]">
          {eyebrow}
        </span>
      ) : null}
      <h3
        className={cn(
          "font-semibold tracking-normal text-foreground",
          compact ? "text-[15px]" : "text-base",
          eyebrow ? "-mt-1.5" : undefined,
        )}
      >
        {title}
      </h3>
      {description ? (
        <p
          className={cn(
            "max-w-md text-pretty text-[13px] leading-5 text-[var(--workspace-muted)]",
            compact && "max-w-sm text-[12px]",
            lineClampClass,
            descriptionClassName,
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
                "flex items-start gap-2.5 rounded-lg border border-[var(--workspace-border)] bg-white px-3 py-2 text-[13px] leading-5 text-[var(--workspace-ink)] shadow-[0_1px_1px_0_rgba(16,24,40,0.025)]",
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
      {action ? (
        <div className={cn(compact || description || hasSteps ? "mt-1" : "mt-2", actionClassName)}>
          {action}
        </div>
      ) : null}
    </div>
  )
}

export { EmptyState }

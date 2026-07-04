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
   * steps. Hidden by default so empty states stay quiet; set `showSteps` when a
   * workflow genuinely needs inline guidance.
   */
  steps?: React.ReactNode[]
  showSteps?: boolean
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
  showSteps = false,
}: EmptyStateProps) {
  const hasSteps = Boolean(steps?.length)
  const shouldShowSteps = hasSteps && showSteps
  const lineClampClass = descriptionLines ? descriptionLineClasses[descriptionLines] : undefined

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col justify-center",
        align === "center" ? "items-center text-center" : "items-start text-left",
        compact ? "max-w-sm gap-2 px-4 py-8" : "max-w-md gap-2.5 px-6 py-14",
        className,
      )}
    >
      {art ? (
        <WorkspaceArt
          name={art}
          className={cn(compact ? "h-[5.5rem] w-auto" : "h-[7.5rem] w-auto", artClassName)}
        />
      ) : (
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-[var(--workspace-soft)] text-black ring-1 ring-inset ring-[color-mix(in_srgb,var(--workspace-border)_58%,transparent)] [&_svg]:text-black",
            compact ? "size-9 [&_svg]:size-[18px]" : "size-10 [&_svg]:size-5",
            iconClassName,
          )}
        >
          {icon}
        </div>
      )}
      {eyebrow ? (
        <span className="text-[12px] font-medium text-[var(--workspace-muted)]">
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
            "max-w-[42ch] text-pretty text-[13px] leading-5 text-[var(--workspace-muted)]",
            compact && "max-w-[36ch] text-[12px]",
            lineClampClass,
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
      {shouldShowSteps ? (
        <ol
          className={cn(
            "mt-1 grid w-full max-w-sm gap-1.5 text-left",
            compact && "max-w-xs gap-1",
          )}
        >
          {steps?.map((step, index) => (
            <li
              key={index}
              className={cn(
                "flex items-start gap-2 text-[12px] leading-5 text-[var(--workspace-muted)]",
                compact && "text-[12px] leading-5",
              )}
            >
              <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--workspace-soft)] font-mono text-[10px] font-semibold tabular-nums text-black">
                {index + 1}
              </span>
              <span className="min-w-0">{step}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {action ? (
        <div className={cn(compact || description || shouldShowSteps ? "mt-2" : "mt-2.5", actionClassName)}>
          {action}
        </div>
      ) : null}
    </div>
  )
}

export { EmptyState }

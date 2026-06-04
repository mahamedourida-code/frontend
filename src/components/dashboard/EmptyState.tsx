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
  illustrationSize?: number
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
  illustration,
  illustrationSize,
  eyebrow,
  steps,
}: EmptyStateProps) {
  const resolvedIllustrationSize = illustrationSize ?? (compact ? 72 : 96)

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2.5 px-4 py-8" : "gap-3.5 px-6 py-16",
        className,
      )}
    >
      {illustration ? (
        <Image
          src={illustration}
          alt=""
          role="presentation"
          width={resolvedIllustrationSize}
          height={resolvedIllustrationSize}
          className="object-contain opacity-90"
          loading="lazy"
        />
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
      {description ? (
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {steps && steps.length > 0 ? (
        <ol className="mt-1 flex max-w-sm flex-col gap-2 text-left">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span
                className="mt-px shrink-0 font-mono text-[0.8rem] font-semibold tabular-nums text-emerald-600"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="leading-snug">{step}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {action ? <div className={cn(compact ? "mt-1" : "mt-2")}>{action}</div> : null}
    </div>
  )
}

export { EmptyState }

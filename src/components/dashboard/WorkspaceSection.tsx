import * as React from "react"

import { cn } from "@/lib/utils"
import { Symbol } from "@/components/dashboard/Symbol"

type SectionTone = "default" | "active" | "muted"

const toneAccent: Record<SectionTone, string> = {
  default: "",
  // A quiet emerald left rail marks the step you're on — calm, not loud.
  active: "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-[inherit] before:bg-[var(--brand-green-ring)] before:content-['']",
  muted: "opacity-90",
}

interface WorkspaceSectionProps {
  /** Section heading, e.g. "Verify extraction". */
  title: React.ReactNode
  /** Optional step chip rendered before the title, e.g. "2". */
  step?: React.ReactNode
  /** One calm line under the title. */
  hint?: React.ReactNode
  /** Optional raw caricature symbol (file stem under /public/symbols). */
  symbol?: string
  /** Right-aligned controls in the header. */
  actions?: React.ReactNode
  tone?: SectionTone
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  id?: string
}

/**
 * The shared "box" used across the workspace and the AP queue. A calm,
 * bordered card with a labelled header (optional step number + hint) and a
 * content well. Built only on existing brand tokens (card / border / muted /
 * brand-green) so it never theme-flips and never reads as generic AI-gradient
 * filler. One primitive, used on both review surfaces, so they feel like one
 * product.
 */
export function WorkspaceSection({
  title,
  step,
  hint,
  symbol,
  actions,
  tone = "default",
  children,
  className,
  headerClassName,
  contentClassName,
  id,
}: WorkspaceSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden rounded-md border border-border bg-card shadow-sm",
        toneAccent[tone],
        className,
      )}
    >
      <header
        className={cn(
          "flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5",
          headerClassName,
        )}
      >
        <div className="flex min-w-0 items-start gap-2.5">
          {symbol ? <Symbol name={symbol} size="inline" className="mt-0.5" /> : null}
          {step !== undefined && step !== null ? (
            <span className="mt-px shrink-0 font-mono text-[13px] font-semibold tabular-nums text-emerald-600">
              {step}
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
            {hint ? (
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{hint}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </header>
      <div className={cn("px-4 py-4 sm:px-5", contentClassName)}>{children}</div>
    </section>
  )
}

"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"
import { MESSY_DOCS_COPY } from "@/lib/bookkeeper-copy"

interface OnboardingHintCardProps {
  /** Optional heading override. Defaults to the messy-docs upload title. */
  title?: string
  /** Optional supporting line. Defaults to the messy-docs upload hint. */
  hint?: string
  /** Optional CTA / control slotted at the bottom of the card. */
  action?: React.ReactNode
  className?: string
}

/**
 * A calm, self-contained onboarding card that restates the brand promise —
 * "throw us the whole folder, we read the mess" — as a quiet reassurance the
 * workspace can adopt above an upload zone. Soft brown surface and rounded
 * frame, matching the rest of the dashboard. Honours `prefers-reduced-motion`.
 *
 * Purely presentational: no page imports, no data fetching.
 */
function OnboardingHintCard({ title, hint, action, className }: OnboardingHintCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col items-center gap-3 rounded-3xl border border-[var(--workspace-popout-border)] bg-[var(--workspace-popout-bg)] px-6 py-7 text-center shadow-none",
        className,
      )}
    >
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--brand-brown-fg)]">
        How AxLiner works
      </span>
      <h3 className="text-lg font-semibold tracking-tight text-[var(--brand-brown-deep)]">
        {title ?? MESSY_DOCS_COPY.uploadTitle}
      </h3>
      <p className="max-w-sm text-sm leading-relaxed text-foreground/75">
        {hint ?? MESSY_DOCS_COPY.uploadHint}
      </p>
      {action ? <div className="mt-1">{action}</div> : null}
    </motion.section>
  )
}

export { OnboardingHintCard }

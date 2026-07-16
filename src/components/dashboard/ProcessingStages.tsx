"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

type ProcessingStagesProps = {
  /** 0–100 progress percentage from the job status / processing state. */
  progress: number
  /** Whether the batch has fully completed (forces the final stage). */
  isComplete?: boolean
  className?: string
}

/**
 * Narrated processing stages — replaces a naked "Processing…" spinner with the
 * stages we already move through, derived from the single progress percentage
 * we track (no fabricated per-phase timing). Reading the document → Recognising
 * the supplier → Pulling out the figures → Checking for duplicates → Ready for
 * your review.
 *
 * Calm fintech "labeled loader" treatment: emerald accents, the active stage
 * pulses, done stages check off, with a quiet line of reassurance that the work
 * is already happening. Honours `prefers-reduced-motion`.
 */
const STAGES = [
  "Reading the document",
  "Recognising the supplier",
  "Pulling out the figures",
  "Checking for duplicates",
  "Ready for your review",
] as const

// A short, calm sub-line shown under each stage while it's the active one —
// reassurance that messy input is being handled, not that the user must wait.
const STAGE_HINTS = [
  "Making sense of the layout — handwriting, photos and scans included.",
  "Matching the letterhead against suppliers you've seen before.",
  "Reading dates, line items, VAT and totals off the page.",
  "Comparing against recent documents so nothing gets entered twice.",
  "Everything's extracted — give it a quick look before it's exported.",
] as const

// Percent thresholds at which each stage is considered reached. The active
// stage is the last one whose threshold the progress has crossed.
const THRESHOLDS = [0, 25, 50, 75, 100] as const

export function ProcessingStages({ progress, isComplete, className }: ProcessingStagesProps) {
  const prefersReducedMotion = useReducedMotion()

  const clamped = Math.min(100, Math.max(0, Number.isFinite(progress) ? progress : 0))
  // Index of the active stage: the highest stage whose threshold we've reached.
  let activeIndex = 0
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (clamped >= THRESHOLDS[i]) activeIndex = i
  }
  if (isComplete || clamped >= 100) activeIndex = STAGES.length - 1
  const finished = isComplete || clamped >= 100

  return (
    <ol className={cn("flex flex-col gap-1.5", className)} aria-label="Reading stages">
      {STAGES.map((label, index) => {
        const isDone = index < activeIndex || (finished && index <= activeIndex)
        const isActive = index === activeIndex && !isDone

        return (
          <li
            key={label}
            aria-current={isActive ? "step" : undefined}
            className="flex items-start gap-2.5"
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                isDone
                  ? "border-[var(--workspace-primary)] bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)]"
                  : isActive
                    ? "border-[var(--workspace-selection-border)] text-[var(--workspace-primary)]"
                    : "border-border text-muted-foreground/50",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDone ? (
                  <motion.span
                    key="done"
                    initial={prefersReducedMotion ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="flex"
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </motion.span>
                ) : isActive ? (
                  <motion.span
                    key="active"
                    animate={prefersReducedMotion ? undefined : { rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                    className="flex"
                  >
                    <Loader2 className="size-3" strokeWidth={2.5} />
                  </motion.span>
                ) : (
                  <span
                    key="pending"
                    className="size-1.5 rounded-full bg-current"
                  />
                )}
              </AnimatePresence>
            </span>
            <span className="flex min-w-0 flex-col">
              <motion.span
                animate={
                  isActive && !prefersReducedMotion
                    ? { opacity: [0.6, 1, 0.6] }
                    : { opacity: 1 }
                }
                transition={
                  isActive && !prefersReducedMotion
                    ? { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
                    : { duration: 0.2 }
                }
                className={cn(
                  "text-sm leading-tight",
                  isDone
                    ? "font-medium text-foreground"
                    : isActive
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground/60",
                )}
              >
                {label}
              </motion.span>
              <AnimatePresence initial={false}>
                {isActive ? (
                  <motion.span
                    key="hint"
                    initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-0.5 block overflow-hidden text-xs leading-snug text-muted-foreground/70"
                  >
                    {STAGE_HINTS[index]}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

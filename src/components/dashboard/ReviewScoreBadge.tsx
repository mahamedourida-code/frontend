"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { AnomalyChip, type AnomalyTone } from "@/components/dashboard/AnomalyChip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ReviewScore } from "@/lib/review-score"
import { cn } from "@/lib/utils"

/**
 * AxLiner Review Score badge (C1) — a small High / Review / Flagged pill that
 * sits on every AP/review item. It builds directly on the C7 `AnomalyChip`
 * tone palette (emerald / amber / rose), so the composite indicator reads in
 * the same calm three-state language as the individual anomaly chips.
 *
 * When the score has contributing signals, the badge becomes a popover trigger
 * — clicking opens "Why this needs review," which lists each signal with its
 * centralized plain-English reason. A clean (High) item shows the badge alone
 * with a quiet "looks clean" line; nothing to explain, nothing to open.
 */

const TONE_DOT: Record<AnomalyTone, string> = {
  good: "bg-emerald-500",
  caution: "bg-amber-400",
  risk: "bg-rose-500",
}

export function ReviewScoreBadge({
  score,
  side = "bottom",
  className,
}: {
  score: ReviewScore
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}) {
  // High / clean items have no contributing signals — show the badge without a
  // popover so the calm path stays uncluttered.
  if (score.signals.length === 0) {
    return (
      <AnomalyChip
        tone={score.tone}
        label={score.label}
        title="Looks clean"
        reason="No review signals fired — this invoice is one keystroke from your books."
        side={side}
        className={cn("h-5", className)}
      />
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Review score: ${score.label}. ${score.signals.length} signal${score.signals.length === 1 ? "" : "s"} — why this needs review`}
          className={cn(
            "ax-interactive inline-flex h-5 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium leading-none whitespace-nowrap",
            TONE_PILL[score.tone],
            className,
          )}
        >
          <span className={cn("inline-block size-1.5 shrink-0 rounded-full", TONE_DOT[score.tone])} />
          {score.label}
          <span className="tabular-nums opacity-70">{score.signals.length}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side={side} align="start" className="w-72 p-0">
        <div className="border-b border-border px-3.5 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Why this needs review
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <span className={cn("inline-block size-2 shrink-0 rounded-full", TONE_DOT[score.tone])} />
            {score.label}
            <span className="font-normal text-muted-foreground">
              · {score.signals.length} signal{score.signals.length === 1 ? "" : "s"}
            </span>
          </p>
        </div>
        <ul className="divide-y divide-border/70">
          {score.signals.map((signal, index) => (
            <motion.li
              key={signal.key}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, delay: index * 0.03, ease: "easeOut" }}
              className="flex gap-2.5 px-3.5 py-2.5"
            >
              <span
                className={cn(
                  "mt-1 inline-block size-1.5 shrink-0 rounded-full",
                  TONE_DOT[signal.tone],
                )}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{signal.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{signal.reason}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

const TONE_PILL: Record<AnomalyTone, string> = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-900",
  caution: "border-amber-200 bg-amber-50 text-amber-900",
  risk: "border-rose-200 bg-rose-50 text-rose-900",
}

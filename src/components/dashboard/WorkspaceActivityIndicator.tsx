"use client"

import { motion, useReducedMotion } from "framer-motion"

import { ShimmerText } from "@/components/ui/ShimmerText"
import { cn } from "@/lib/utils"

type WorkspaceActivityIndicatorProps = {
  title: string
  detail?: string
  done?: number
  total?: number
  scope?: "page" | "section"
  className?: string
}

/**
 * Minimal, premium loading state (Linear / Vercel / Stripe style): a single
 * shimmering word with three softly pulsing dots, centered. No box, no icon,
 * no detail line. `detail` is intentionally ignored; `title` is reduced to one
 * word. When `done`/`total` are present, a tiny muted count sits beneath.
 */

// Reduce any caller's phrase down to a single clean verb.
function toSingleWord(title: string): string {
  const first = (title || "").trim().split(/\s+/)[0] ?? ""
  if (!first) return "Loading"
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

function LoadingDots() {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <span aria-hidden="true">…</span>
  }

  return (
    <span aria-hidden="true" className="inline-flex">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
            repeat: Infinity,
            delay: i * 0.18,
          }}
        >
          .
        </motion.span>
      ))}
    </span>
  )
}

export function WorkspaceActivityIndicator({
  title,
  done,
  total,
  scope = "section",
  className,
}: WorkspaceActivityIndicatorProps) {
  const showProgress = typeof done === "number" && typeof total === "number" && total > 0
  const word = toSingleWord(title)

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-1.5 text-center",
        scope === "page" ? "min-h-32 py-7" : "min-h-20 py-4",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-baseline font-medium tracking-normal",
          scope === "page" ? "text-base" : "text-sm",
        )}
      >
        <ShimmerText tone="working">{word}</ShimmerText>
        <span className="ml-px text-[var(--text-working)]">
          <LoadingDots />
        </span>
      </span>
      {showProgress ? (
        <span className="font-mono text-xs tabular-nums text-[color-mix(in_srgb,var(--text-working)_70%,transparent)]">
          {Math.min(done, total)} / {total}
        </span>
      ) : null}
    </div>
  )
}

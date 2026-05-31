"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Quote } from "lucide-react"

import { findSourceMatch } from "@/lib/source-highlight"
import { cn } from "@/lib/utils"

/**
 * Source highlighting on the review split-pane (C2 — the cheap 80%).
 *
 * When a field on the right is hovered / focused, we text-match its value
 * against the document's OCR text (`sourceText`) and float a small emerald
 * "source" excerpt over the document preview, with the matched value
 * highlighted in the line. This is the Microsoft-Dynamics "eyeball → highlight
 * on the document" affordance and the legal-AI "show me where it says that",
 * without depending on model bounding boxes.
 *
 * No match (or no source text) → renders nothing. The overlay is purely
 * additive and never blocks or errors.
 */

type SourceHighlightOverlayProps = {
  /** The active field's extracted value, or null when nothing is hovered. */
  value: string | null
  /** Human label for the active field ("Total", "Vendor", …). */
  label?: string | null
  /** The document's OCR / markdown text to match against. */
  sourceText?: string
  className?: string
}

export function SourceHighlightOverlay({
  value,
  label,
  sourceText,
  className,
}: SourceHighlightOverlayProps) {
  const prefersReducedMotion = useReducedMotion()

  const match = React.useMemo(
    () => (value && sourceText ? findSourceMatch(value, sourceText) : null),
    [value, sourceText],
  )

  return (
    <AnimatePresence>
      {match ? (
        <motion.div
          key="source-highlight"
          aria-hidden="true"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={cn(
            "pointer-events-none absolute inset-x-3 bottom-3 z-[2]",
            className,
          )}
        >
          <div className="rounded-md border border-emerald-300 bg-emerald-50/95 px-3 py-2 shadow-[0_1px_3px_0_rgba(0,0,0,0.12)] backdrop-blur">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
              <Quote className="size-3" />
              {label ? `Found "${label}" here` : "Found on the document"}
            </p>
            <p className="mt-1 text-xs leading-5 text-emerald-950">
              {match.line.slice(0, match.matchStart)}
              <mark className="rounded-[3px] bg-emerald-300/80 px-0.5 font-semibold text-emerald-950">
                {match.line.slice(match.matchStart, match.matchEnd)}
              </mark>
              {match.line.slice(match.matchEnd)}
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

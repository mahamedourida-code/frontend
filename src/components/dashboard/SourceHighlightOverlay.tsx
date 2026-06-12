"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Quote } from "lucide-react"

import { findSourceMatch } from "@/lib/source-highlight"
import { useMotionTokens } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * Source highlighting on the review split-pane (C2 — the cheap 80%).
 *
 * When a field on the right is hovered / focused, we text-match its value
 * against the document's OCR text (`sourceText`) and float a small tinted
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
  const { reduced, dur, ease } = useMotionTokens()

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
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: dur.fast, ease }}
          className={cn(
            "pointer-events-none absolute inset-x-3 bottom-3 z-[2]",
            className,
          )}
        >
          <div className="rounded-md border border-[var(--workspace-popout-border)] bg-[var(--workspace-popout-bg)] px-3 py-2 shadow-none backdrop-blur">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-brown-fg)]">
              <Quote className="size-3" />
              {label ? `Found "${label}" here` : "Found on the document"}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--brand-brown-deep)]">
              {match.line.slice(0, match.matchStart)}
              <motion.mark
                // One-shot attention pulse so the eye lands on the proven value
                // the moment the source match appears — the "show me where it
                // says that" beat the demo videos hang on.
                key={`${match.matchStart}-${match.matchEnd}-${match.line}`}
                initial={false}
                animate={
                  reduced
                    ? {}
                    : {
                        backgroundColor: [
                          "var(--workspace-selection-bg)",
                          "var(--button-warm)",
                          "var(--workspace-selection-bg)",
                        ],
                        boxShadow: [
                          "0 0 0 0 rgba(6,78,59,0)",
                          "0 0 0 3px rgba(6,78,59,0.18)",
                          "0 0 0 0 rgba(6,78,59,0)",
                        ],
                      }
                }
                transition={{ duration: dur.slow, ease, times: [0, 0.4, 1] }}
                className="rounded-[3px] bg-[var(--workspace-selection-bg)] px-0.5 font-semibold text-[var(--brand-brown-deep)]"
              >
                {match.line.slice(match.matchStart, match.matchEnd)}
              </motion.mark>
              {match.line.slice(match.matchEnd)}
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

type ProcessingScanOverlayProps = {
  className?: string
}

function CornerBracket({
  position,
}: {
  position: "tl" | "tr" | "bl" | "br"
}) {
  const transform = {
    tl: "",
    tr: "scaleX(-1)",
    bl: "scaleY(-1)",
    br: "scale(-1, -1)",
  }[position]

  const placement = {
    tl: "top-2 left-2",
    tr: "top-2 right-2",
    bl: "bottom-2 left-2",
    br: "bottom-2 right-2",
  }[position]

  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={cn("absolute text-primary", placement)}
      style={{ transform }}
    >
      <path d="M0 6 L0 0 L6 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Decorative overlay shown over a document preview while processing. Uses
 * a single sweeping scan line, four corner brackets, and a subtle pulse.
 * Honours `prefers-reduced-motion` — animation is dropped, brackets stay
 * for the affordance.
 */
export function ProcessingScanOverlay({ className }: ProcessingScanOverlayProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* Pulse layer */}
      <motion.div
        className="absolute inset-0 bg-primary/[0.03]"
        animate={
          prefersReducedMotion
            ? { opacity: 0.03 }
            : { opacity: [0.03, 0.07, 0.03] }
        }
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
      />

      {/* Sweeping scan line */}
      {!prefersReducedMotion ? (
        <motion.div
          className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          animate={{ y: ["0%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
        />
      ) : null}

      {/* Corner brackets */}
      <CornerBracket position="tl" />
      <CornerBracket position="tr" />
      <CornerBracket position="bl" />
      <CornerBracket position="br" />
    </div>
  )
}

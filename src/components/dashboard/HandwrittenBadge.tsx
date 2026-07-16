"use client"

import * as React from "react"
import { PenLine } from "lucide-react"

import { cn } from "@/lib/utils"

type HandwrittenBadgeProps = {
  /** "pill" = inline coloured chip; "corner" = small dot for thumbnails. */
  variant?: "pill" | "corner" | "label"
  className?: string
  /** Override the visible text on the pill/label variant. */
  text?: string
}

/**
 * Visual marker that flags a document as handwritten. Three variants:
 * - `pill`     : inline badge for document cards / table rows
 * - `corner`   : 12px tinted dot for navigation thumbnails (compact)
 * - `label`    : larger "Handwritten extraction" header for the split pane
 */
export function HandwrittenBadge({ variant = "pill", className, text }: HandwrittenBadgeProps) {
  if (variant === "corner") {
    return (
      <span
        aria-label="Handwritten document"
        title="Handwritten document"
        className={cn(
          "inline-flex size-[14px] items-center justify-center rounded-full border border-white/60 bg-amber-500 text-white shadow-none",
          className,
        )}
      >
        <PenLine className="size-2" />
      </span>
    )
  }

  if (variant === "label") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-amber-300/60 bg-amber-50 px-2 py-1 text-[11px] font-bold uppercase tracking-normal text-amber-900",
          className,
        )}
      >
        <PenLine className="size-3" />
        {text || "Handwritten extraction"}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-amber-300/60 bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-normal text-amber-900",
        className,
      )}
    >
      <PenLine className="size-2.5" />
      {text || "Handwritten"}
    </span>
  )
}

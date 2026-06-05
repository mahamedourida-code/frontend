"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const SIZE = {
  inline: "h-9 w-9 sm:h-10 sm:w-10",
  badge: "h-12 w-12 sm:h-14 sm:w-14",
  medium: "h-20 w-20 sm:h-24 sm:w-24",
  hero: "h-40 w-40 sm:h-56 sm:w-56",
} as const

interface SymbolProps {
  /** File stem under /public/symbols, e.g. "invoice" → /symbols/invoice.png */
  name: string
  size?: keyof typeof SIZE
  className?: string
  /** Accessible label; empty string keeps it decorative (aria-hidden). */
  alt?: string
}

/**
 * A raw, background-free caricature symbol from /public/symbols/<name>.png.
 *
 * The artwork is generated separately (see symbol-prompts.md) and dropped into
 * public/symbols/. Until a given PNG exists this renders NOTHING — it degrades
 * gracefully via onError, so we can dedicate symbol slots throughout the UI
 * now and have them light up the moment the asset lands, with zero broken
 * images shipping to production. Uses a plain <img> (not next/image) precisely
 * so a missing file is a silent no-op rather than a build/runtime error.
 */
export function Symbol({ name, size = "medium", className, alt = "" }: SymbolProps) {
  const [failed, setFailed] = React.useState(false)
  if (failed) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/symbols/${name}.png`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable={false}
      onError={() => setFailed(true)}
      className={cn("shrink-0 select-none object-contain", SIZE[size], className)}
    />
  )
}

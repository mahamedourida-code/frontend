"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const SIZE = {
  inline: "h-12 w-12 sm:h-14 sm:w-14",
  badge: "h-16 w-16 sm:h-20 sm:w-20",
  medium: "h-28 w-28 sm:h-32 sm:w-32",
  hero: "h-56 w-56 sm:h-72 sm:w-72",
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

import React from 'react'
import Image from 'next/image'

interface AppIconProps {
  className?: string
  size?: number
}

// The new symbol is portrait (88 × 208) — keep that ratio so it never distorts.
const SYMBOL_W = 88
const SYMBOL_H = 208

// Apply a sensible default height only when the caller didn't set one,
// so next/image never renders at full intrinsic size.
function withHeight(className: string, fallback: string) {
  return /\bh-/.test(className) ? className : `${fallback} ${className}`.trim()
}

// Symbol mark (the AxLiner glyph) — scales by height, width follows the ratio.
export function AppIcon({ className = '', size = 24 }: AppIconProps) {
  return (
    <Image
      src="/symbol.svg"
      alt="AxLiner"
      width={Math.round((size * SYMBOL_W) / SYMBOL_H)}
      height={size}
      className={className}
      priority
      unoptimized
    />
  )
}

// Alternative minimal version (same symbol)
export function AppIconMinimal({ className = '', size = 24 }: AppIconProps) {
  return (
    <Image
      src="/symbol.svg"
      alt="AxLiner"
      width={Math.round((size * SYMBOL_W) / SYMBOL_H)}
      height={size}
      className={className}
      priority
      unoptimized
    />
  )
}

// Symbol mark for tight slots (e.g. dashboard sidebar) — transparent symbol, no
// white background. Flips to light in dark mode. Sized via className (h-7 w-auto).
export function AxMark({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/symbol.svg"
      alt="Ax"
      width={SYMBOL_W}
      height={SYMBOL_H}
      className={`dark:invert ${withHeight(className, 'h-7 w-auto')}`.trim()}
      priority
      unoptimized
    />
  )
}

// Full brand logo (symbol + "AxLiner" wordmark) — the complete lockup.
// Single source of truth for the logo across every page. Black artwork, so it
// inverts to white in dark mode. Sized via className (h-7 w-auto).
export function AppLogo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/logo-lockup.png"
      alt="AxLiner"
      width={565}
      height={208}
      className={`dark:invert ${withHeight(className, 'h-7 w-auto')}`.trim()}
      priority
      unoptimized
    />
  )
}

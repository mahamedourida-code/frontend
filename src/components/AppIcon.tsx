import React from 'react'
import Image from 'next/image'

interface AppIconProps {
  className?: string
  size?: number
}

// Apply a sensible default height only when the caller didn't set one,
// so next/image never renders at full intrinsic size.
function withHeight(className: string, fallback: string) {
  return /\bh-/.test(className) ? className : `${fallback} ${className}`.trim()
}

// Symbol mark (the "Ax" glyph) — the square app/icon glyph (logo.png, transparent).
export function AppIcon({ className = '', size = 24 }: AppIconProps) {
  return (
    <Image
      src="/logo.png"
      alt="AxLiner"
      width={size}
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
      src="/logo.png"
      alt="AxLiner"
      width={size}
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
      src="/logo.png"
      alt="Ax"
      width={679}
      height={659}
      className={`dark:invert ${withHeight(className, 'h-7 w-auto')}`.trim()}
      priority
      unoptimized
    />
  )
}

// Full brand logo (symbol + "AxLiner" wordmark) — the complete logi.svg lockup.
// Single source of truth for the logo across every page. Black artwork, so it
// inverts to white in dark mode. Sized via className (h-7 w-auto).
export function AppLogo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/logi.svg"
      alt="AxLiner"
      width={605}
      height={148}
      className={`dark:invert ${withHeight(className, 'h-7 w-auto')}`.trim()}
      priority
      unoptimized
    />
  )
}

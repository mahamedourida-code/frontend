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

// Symbol mark (the "Ax" glyph) — used as the square app/icon glyph.
export function AppIcon({ className = '', size = 24 }: AppIconProps) {
  return (
    <Image
      src="/favicon.svg"
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
      src="/favicon.svg"
      alt="AxLiner"
      width={size}
      height={size}
      className={className}
      priority
      unoptimized
    />
  )
}

// Symbol mark for tight slots (e.g. dashboard sidebar). Sized via className (h-7 w-auto).
export function AxMark({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/favicon.svg"
      alt="Ax"
      width={128}
      height={128}
      className={withHeight(className, 'h-7 w-auto')}
      priority
      unoptimized
    />
  )
}

// Full brand logo (symbol + "AxLiner" wordmark) for site chrome on all pages.
// Sized via className (h-8 w-auto).
export function AppLogo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/loga.svg"
      alt="AxLiner"
      width={655}
      height={160}
      className={withHeight(className, 'h-8 w-auto')}
      priority
      unoptimized
    />
  )
}

import React from 'react'
import Image from 'next/image'

interface AppIconProps {
  className?: string
  size?: number
}

// Symbol mark (the "Ax" triangle) — used as the app/icon glyph
export function AppIcon({ className = '', size = 24 }: AppIconProps) {
  return (
    <Image
      src="/logo.png"
      alt="AxLiner"
      width={size}
      height={size}
      className={className}
      priority
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
    />
  )
}

// Apply a sensible default height only when the caller didn't set one,
// so next/image never renders at full intrinsic size.
function withHeight(className: string, fallback: string) {
  return /\bh-/.test(className) ? className : `${fallback} ${className}`.trim()
}

// Symbol mark for tight slots (e.g. dashboard sidebar). Sized via className (h-7 w-auto).
export function AxMark({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Ax"
      width={391}
      height={382}
      className={withHeight(className, 'h-7 w-auto')}
      priority
    />
  )
}

// Full wordmark logo (symbol + "AxLiner"). Sized via className (h-8 w-auto).
export function AppLogo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/loga.png"
      alt="AxLiner"
      width={1238}
      height={309}
      className={withHeight(className, 'h-8 w-auto')}
      priority
    />
  )
}

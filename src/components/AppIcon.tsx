import React from 'react'
import Image from 'next/image'

interface AppIconProps {
  className?: string
  size?: number
}

export function AppIcon({ className = '', size = 24 }: AppIconProps) {
  return (
    <Image
      src="/crop.png"
      alt="AxLiner"
      width={size}
      height={size}
      className={className}
      priority
    />
  )
}

// Alternative minimal version (same as main icon now)
export function AppIconMinimal({ className = '', size = 24 }: AppIconProps) {
  return (
    <Image
      src="/crop.png"
      alt="AxLiner"
      width={size}
      height={size}
      className={className}
      priority
    />
  )
}

// Logo version with app name
export function AppLogo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/loga.svg"
      alt="AxLiner"
      width={196}
      height={44}
      className={`h-8 w-auto ${className}`}
      priority
    />
  )
}

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
      alt="Exceletto"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      priority
    />
  )
}

// Alternative minimal version (same as main icon now)
export function AppIconMinimal({ className = '', size = 24 }: AppIconProps) {
  return (
    <Image
      src="/crop.png"
      alt="Exceletto"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      priority
    />
  )
}

// Logo version with app name
export function AppLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/crop.png"
        alt="Exceletto"
        width={32}
        height={32}
        className="rounded-full"
        priority
      />
      <span className="text-xl font-bold text-white">
        Exceletto
      </span>
    </div>
  )
}

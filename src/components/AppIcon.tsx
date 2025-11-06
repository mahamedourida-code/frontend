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
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/crop.png"
        alt="AxLiner"
        width={32}
        height={32}
        priority
      />
      <span className="text-xl font-bold text-black dark:text-white">
        AxLiner
      </span>
    </div>
  )
}

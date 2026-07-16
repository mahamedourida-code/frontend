import React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

type LogoTone = "auto" | "dark" | "light"

interface AppIconProps {
  className?: string
  size?: number
  tone?: LogoTone
}

const SYMBOL_W = 88
const SYMBOL_H = 208

function withHeight(className: string, fallback: string) {
  return /\bh-/.test(className) ? className : `${fallback} ${className}`.trim()
}

function logoToneClass(tone: LogoTone) {
  if (tone === "light") return "brightness-0 invert"
  if (tone === "dark") return "brightness-0"
  return "dark:invert"
}

export function AppIcon({ className = "", size = 36, tone = "auto" }: AppIconProps) {
  return (
    <Image
      src="/symbol.svg"
      alt="AxLiner"
      width={Math.round((size * SYMBOL_W) / SYMBOL_H)}
      height={size}
      className={cn(logoToneClass(tone), className)}
      priority
      unoptimized
    />
  )
}

export function AppIconMinimal({ className = "", size = 36, tone = "auto" }: AppIconProps) {
  return (
    <Image
      src="/symbol.svg"
      alt="AxLiner"
      width={Math.round((size * SYMBOL_W) / SYMBOL_H)}
      height={size}
      className={cn(logoToneClass(tone), className)}
      priority
      unoptimized
    />
  )
}

export function AxMark({
  className = "",
  tone = "auto",
}: {
  className?: string
  tone?: LogoTone
}) {
  return (
    <Image
      src="/symbol.svg"
      alt="Ax"
      width={SYMBOL_W}
      height={SYMBOL_H}
      className={cn(logoToneClass(tone), withHeight(className, "h-10 w-auto"))}
      priority
      unoptimized
    />
  )
}

export function AppLogo({
  className = "",
  tone = "auto",
}: {
  className?: string
  tone?: LogoTone
}) {
  return (
    <Image
      src="/logo-lockup.png"
      alt="AxLiner"
      width={565}
      height={208}
      className={cn(logoToneClass(tone), withHeight(className, "h-10 w-auto"))}
      priority
      unoptimized
    />
  )
}

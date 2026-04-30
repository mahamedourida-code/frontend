"use client"

import { cn } from "@/lib/utils"

type GlyphProps = {
  className?: string
}

export function BillingSeal({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <path
        d="M24 5.5 38.5 11v11.7c0 9.3-5.8 16.5-14.5 19.8C15.3 39.2 9.5 32 9.5 22.7V11L24 5.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M17 24.4 22 29l9.5-11"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CreditStack({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <path d="M10 16c0-4.2 6.3-7.5 14-7.5S38 11.8 38 16s-6.3 7.5-14 7.5S10 20.2 10 16Z" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M10 16v8c0 4.2 6.3 7.5 14 7.5S38 28.2 38 24v-8" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M10 24v8c0 4.2 6.3 7.5 14 7.5S38 36.2 38 32v-8" fill="none" stroke="currentColor" strokeWidth="3" />
    </svg>
  )
}

export function PlanSwitch({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <path d="M12 15h20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="m28 10 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 33H16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="m20 28-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="4.5" fill="currentColor" />
    </svg>
  )
}


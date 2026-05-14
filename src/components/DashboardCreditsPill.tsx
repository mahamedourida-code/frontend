"use client"

import Link from "next/link"
import { CreditStack } from "@/components/BillingGlyphs"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import { cn } from "@/lib/utils"

type DashboardCreditsPillProps = {
  credits?: number | null
  className?: string
}

export function DashboardCreditsPill({ credits, className }: DashboardCreditsPillProps) {
  const { credits: liveCredits, isLoading } = useBillingStatus({
    enabled: typeof credits !== "number",
    loadStatus: true,
  })
  const availableCredits = typeof credits === "number" ? credits : liveCredits?.available_credits ?? null

  return (
    <Link
      href="/pricing"
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border border-[#dfe8df] bg-white px-4 text-sm font-medium text-[#111827] shadow-sm transition hover:bg-[#f7faf7]",
        className
      )}
    >
      <CreditStack className="h-5 w-5 shrink-0 text-[#166534]" />
      <span className="text-base font-semibold text-[#166534]">
        {typeof availableCredits === "number" ? availableCredits.toLocaleString() : isLoading ? "..." : "-"}
      </span>
      <span className="text-xs font-medium text-[#667085]">credits</span>
    </Link>
  )
}

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
        "inline-flex h-10 items-center gap-2 rounded-full border border-[#eadfff] bg-white/86 px-4 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(47,22,94,0.14)] backdrop-blur-xl transition hover:bg-white",
        className
      )}
    >
      <CreditStack className="h-5 w-5 shrink-0 text-[#2f165e]" />
      <span className="text-base font-black text-[#2f165e]">
        {typeof availableCredits === "number" ? availableCredits.toLocaleString() : isLoading ? "..." : "-"}
      </span>
      <span className="text-xs font-bold text-[#6b7280]">credits</span>
    </Link>
  )
}

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
        "inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      <CreditStack className="size-4 shrink-0 text-foreground" />
      <span className="text-foreground">
        {typeof availableCredits === "number" ? availableCredits.toLocaleString() : isLoading ? "..." : "-"}
      </span>
      <span className="text-xs font-medium text-muted-foreground">credits</span>
    </Link>
  )
}

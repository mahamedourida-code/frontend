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
        "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      <CreditStack className="size-4 shrink-0 text-primary" />
      <span className="font-semibold text-primary">
        {typeof availableCredits === "number" ? availableCredits.toLocaleString() : isLoading ? "..." : "-"}
      </span>
      <span className="text-xs text-muted-foreground">credits</span>
    </Link>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, BookCheck, Building2, Loader2, ReceiptText, Upload } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { companyApi, type CompanySummary } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type HomeOverviewProps = {
  user?: {
    user_metadata?: { full_name?: string | null; name?: string | null } | null
    email?: string | null
  } | null
  workspaceId?: string
  workspaceName?: string
}

function firstName(user: HomeOverviewProps["user"]) {
  const source =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "there"
  return source.trim().split(/\s+/)[0]
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

type Tile = {
  key: string
  label: string
  sub: string
  count: number | null
  href: string
  icon: typeof BookCheck
  chip: string
  hover: string
  emphatic?: boolean
}

export function HomeOverview({ user, workspaceId, workspaceName }: HomeOverviewProps) {
  const prefersReducedMotion = useReducedMotion()
  const [companies, setCompanies] = useState<CompanySummary[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspaceId) return
    let cancelled = false
    setLoading(true)
    companyApi
      .list(workspaceId)
      .then((response) => {
        if (!cancelled) setCompanies(response.companies)
      })
      .catch(() => {
        if (!cancelled) setCompanies([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [workspaceId])

  const { clientCount, toReview, draftBills } = useMemo(() => {
    const list = companies || []
    return {
      clientCount: list.length,
      toReview: list.reduce((sum, company) => sum + (company.document_counts?.needs_review || 0), 0),
      draftBills: list.reduce((sum, company) => sum + (company.bills || 0), 0),
    }
  }, [companies])

  const tiles: Tile[] = [
    {
      key: "review",
      label: "To review",
      sub: toReview > 0 ? "Documents waiting for your eyes" : "Nothing waiting — you're clear",
      count: loading ? null : toReview,
      href: "/dashboard/client",
      icon: BookCheck,
      chip: "bg-[#fef3c7] text-[#b45309]",
      hover: "hover:border-[#fcd34d]",
      emphatic: toReview > 0,
    },
    {
      key: "bills",
      label: "Draft bills",
      sub: "Reviewed bills ready to publish",
      count: loading ? null : draftBills,
      href: "/dashboard/accounts-payable",
      icon: ReceiptText,
      chip: "bg-[#dcfce7] text-[#15803d]",
      hover: "hover:border-[#86efac]",
    },
    {
      key: "clients",
      label: "Clients",
      sub: "Companies in this workspace",
      count: loading ? null : clientCount,
      href: "/dashboard/clients",
      icon: Building2,
      chip: "bg-[var(--workspace-soft)] text-[var(--workspace-primary)]",
      hover: "hover:border-[var(--workspace-primary)]",
    },
  ]

  const summaryLine = loading
    ? "Loading your workspace…"
    : [
        `${clientCount} ${clientCount === 1 ? "client" : "clients"}`,
        `${toReview} to review`,
        `${draftBills} draft ${draftBills === 1 ? "bill" : "bills"}`,
      ].join("  ·  ")

  return (
    <motion.section
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
      className="space-y-5"
    >
      {/* Greeting + primary action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {workspaceName && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--workspace-primary)]">
              {workspaceName}
            </p>
          )}
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--workspace-ink)]">
            {greeting()}, {firstName(user)}
          </h1>
          <p className="mt-1 text-sm text-[var(--workspace-ink)]/75">{summaryLine}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {!loading && toReview > 0 && (
            <Button asChild variant="ink" size="sm">
              <Link href="/dashboard/client">
                <BookCheck className="size-4" />
                Review {toReview}
              </Link>
            </Button>
          )}
          <Button asChild variant="glossy">
            <Link href="/dashboard/client#upload-files">
              <Upload className="size-4" />
              Upload a stack
            </Link>
          </Button>
        </div>
      </div>

      {/* Attention tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => {
          const Icon = tile.icon
          return (
            <Link
              key={tile.key}
              href={tile.href}
              className={cn(
                "ax-interactive group rounded-xl border border-[var(--workspace-border)] bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-16px_rgba(15,23,42,0.4)]",
                tile.hover,
                tile.emphatic && "border-[#fcd34d] bg-[#fffbeb]",
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("flex size-9 items-center justify-center rounded-lg", tile.chip)}>
                  <Icon className="size-[18px]" />
                </span>
                <ArrowUpRight className="size-4 text-[var(--workspace-ink)]/35 transition-colors group-hover:text-[var(--workspace-ink)]" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                {tile.count === null ? (
                  <Loader2 className="size-5 animate-spin text-[var(--workspace-ink)]/40" />
                ) : (
                  <span className="text-3xl font-bold tabular-nums text-[var(--workspace-ink)]">{tile.count}</span>
                )}
              </div>
              <div className="mt-1 text-sm font-semibold text-[var(--workspace-ink)]">{tile.label}</div>
              <div className="text-[13px] text-[var(--workspace-ink)]/70">{tile.sub}</div>
            </Link>
          )
        })}
      </div>
    </motion.section>
  )
}

"use client"

import { motion } from "framer-motion"

import type { CompanySummary } from "@/components/dashboard/companies/company-types"
import { StatusBadge, type StatusTone } from "@/components/dashboard/StatusBadge"
import { WorkspaceArt } from "@/components/dashboard/WorkspaceArt"
import { useMotionTokens } from "@/lib/motion"
import { cn } from "@/lib/utils"

type OverviewCell = {
  key: string
  label: string
  value: number
  art: string
  valueClass: string
  href?: string
  accent?: boolean
  badge?: { tone: StatusTone; label: string }
}

/**
 * Quiet reference counts for the dashboard home. Counts are aggregated from the
 * client list already loaded by CompaniesTable, so there's no extra request.
 *
 * Each card carries a caricature visual in the black / slate-footer / landing-
 * blue palette. The lucide glyphs below are placeholders — swap them for the
 * generated art in `/public/workspace-art/*` (specs in `pp.md`) when ready.
 */
export function WorkspaceOverview({
  companies,
  className,
}: {
  companies: CompanySummary[]
  className?: string
}) {
  const m = useMotionTokens()

  if (companies.length === 0) return null

  const needsReview = companies.reduce((sum, company) => sum + company.needsReview, 0)
  const draftBills = companies.reduce((sum, company) => sum + company.bills, 0)
  const documents = companies.reduce(
    (sum, company) => sum + company.purchases + company.receipts + company.bankStatements + company.other,
    0,
  )
  const connected = companies.filter((company) => company.accountingConnected).length

  const cells: OverviewCell[] = [
    {
      key: "review",
      label: "To review",
      value: needsReview,
      art: "review",
      valueClass: "text-foreground",
      href: "#clients",
    },
    {
      key: "drafts",
      label: "Draft bills",
      value: draftBills,
      art: "draft-bills",
      valueClass: draftBills ? "text-[var(--data-money)]" : "text-foreground",
      href: "#clients",
    },
    {
      key: "documents",
      label: "Documents",
      value: documents,
      art: "documents",
      valueClass: "text-foreground",
    },
    {
      key: "clients",
      label: "Clients",
      value: companies.length,
      art: "clients",
      valueClass: "text-foreground",
      badge: connected > 0 ? { tone: "success", label: `${connected} connected` } : undefined,
    },
  ]

  return (
    <motion.div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4",
        className,
      )}
      variants={m.staggerParent(0.045)}
      initial="hidden"
      animate="show"
    >
      {cells.map((cell) => {
        const body = (
          <>
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0 truncate pt-0.5 text-xs font-semibold text-foreground">{cell.label}</span>
              {cell.badge ? (
                <StatusBadge tone={cell.badge.tone} className="shrink-0">
                  {cell.badge.label}
                </StatusBadge>
              ) : null}
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <span className={cn("block text-2xl font-semibold tabular-nums sm:text-3xl", cell.valueClass)}>
                {formatCount(cell.value)}
              </span>
              <WorkspaceArt name={cell.art} className="size-14 shrink-0" />
            </div>
          </>
        )

        const cardClass = cn(
          "block rounded-xl border border-[var(--workspace-border)] p-4 sm:p-5",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_2px_0_rgba(16,24,40,0.06),0_2px_8px_-2px_rgba(16,24,40,0.10)]",
          cell.accent ? "bg-[color-mix(in_srgb,var(--text-attention)_5%,white)]" : "bg-white",
        )

        if (cell.href) {
          return (
            <motion.a
              key={cell.key}
              href={cell.href}
              variants={m.listItem}
              whileHover={m.reduced ? undefined : { y: -2 }}
              whileTap={m.reduced ? undefined : { scale: 0.99 }}
              transition={m.springSnappy}
              className={cn(
                cardClass,
                "outline-none will-change-transform transition-shadow hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_4px_0_rgba(16,24,40,0.08),0_10px_24px_-6px_rgba(16,24,40,0.18)] focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]",
              )}
            >
              {body}
            </motion.a>
          )
        }

        return (
          <motion.div key={cell.key} variants={m.listItem} className={cardClass}>
            {body}
          </motion.div>
        )
      })}
    </motion.div>
  )
}

function formatCount(count: number) {
  return new Intl.NumberFormat().format(count)
}

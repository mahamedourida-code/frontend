"use client"

import { useMemo, type ReactNode } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

import type { CompanySummary } from "@/components/dashboard/companies/company-types"
import { Button } from "@/components/ui/button"
import { WorkspaceArt } from "@/components/dashboard/WorkspaceArt"
import { useMotionTokens } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * The lead band on the dashboard home — it answers the partner's real first
 * question ("what needs me, and what's aging?") before any vanity totals. The
 * amber attention state is the single hero on the page; everything below it
 * (the WorkspaceOverview cards) stays quiet on purpose.
 *
 * Everything here is DERIVED from the client list already loaded by
 * CompaniesTable — no extra request. There is no per-item submitted-at, so the
 * wait clock uses each client's `lastUploadAt` as an honest proxy: a client
 * that still has items to review and last sent work N days ago has had that
 * work waiting ~N days. When no timestamps exist at all, we fall back to the
 * client with the most waiting and never invent a date.
 */

const DAY_MS = 1000 * 60 * 60 * 24
const AGING_THRESHOLD_DAYS = 3

type Waiting = { company: CompanySummary; days: number }

function daysSince(value: string | null, now: number): number | null {
  if (!value) return null
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return null
  return Math.max(0, Math.floor((now - time) / DAY_MS))
}

function formatWait(days: number) {
  if (days <= 0) return "today"
  if (days === 1) return "1 day"
  return `${days} days`
}

export function HomeAttention({
  companies,
  className,
}: {
  companies: CompanySummary[]
  className?: string
}) {
  const m = useMotionTokens()

  const model = useMemo(() => {
    const now = Date.now()
    const totalNeedsReview = companies.reduce((sum, c) => sum + c.needsReview, 0)
    const totalDrafts = companies.reduce((sum, c) => sum + c.bills, 0)

    const reviewing = companies.filter((c) => c.needsReview > 0)

    // Clients with items to review AND a known last-activity timestamp.
    const waiting: Waiting[] = reviewing
      .map((company) => ({ company, days: daysSince(company.lastUploadAt, now) }))
      .filter((entry): entry is Waiting => entry.days !== null)

    const oldest = waiting.length
      ? waiting.reduce((a, b) => (b.days > a.days ? b : a))
      : null

    const aging = waiting.filter((entry) => entry.days >= AGING_THRESHOLD_DAYS)
    const agingItems = aging.reduce((sum, entry) => sum + entry.company.needsReview, 0)

    // Fallback when no timestamps exist: the client with the most waiting.
    const busiest = reviewing.length
      ? reviewing.reduce((a, b) => (b.needsReview > a.needsReview ? b : a))
      : null

    // The single client a partner should open first.
    const lead = oldest?.company ?? busiest ?? null

    return { totalNeedsReview, totalDrafts, oldest, agingItems, busiest, lead, hasDates: waiting.length > 0 }
  }, [companies])

  if (companies.length === 0) return null

  const { totalNeedsReview, totalDrafts, oldest, agingItems, busiest, lead, hasDates } = model
  const clear = totalNeedsReview === 0

  const shellClass = cn(
    "relative overflow-hidden rounded-xl border p-5 will-change-transform sm:p-6",
    "shadow-[0_1px_2px_0_rgba(16,24,40,0.04),0_1px_3px_0_rgba(16,24,40,0.06)]",
    clear
      ? "border-[color-mix(in_srgb,var(--text-success)_28%,var(--workspace-border))] bg-[color-mix(in_srgb,var(--text-success)_5%,white)]"
      : "border-[color-mix(in_srgb,var(--text-attention)_30%,var(--workspace-border))] bg-[color-mix(in_srgb,var(--text-attention)_6%,white)]",
    className,
  )

  // ---- Clear state -------------------------------------------------------
  if (clear) {
    return (
      <motion.section variants={m.panel} initial="hidden" animate="show" className={shellClass} aria-label="Review status">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow tone="success">All clear</Eyebrow>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Nothing waiting on your review.
            </h2>
            <p className="mt-1 text-sm font-medium text-foreground">
              {totalDrafts > 0 ? (
                <>
                  <span className="tabular-nums text-[var(--data-money)]">{totalDrafts}</span>
                  {` draft ${totalDrafts === 1 ? "bill" : "bills"} ready to publish.`}
                </>
              ) : (
                "Your review queue is empty — send a folder to get started."
              )}
            </p>
          </div>
          <WorkspaceArt name="all-clear" className="hidden size-20 shrink-0 sm:block" />
        </div>
      </motion.section>
    )
  }

  // ---- Attention state ---------------------------------------------------
  const reviewItemWord = totalNeedsReview === 1 ? "item" : "items"

  let context: ReactNode = null
  if (oldest && oldest.days >= 1) {
    context = (
      <>
        <span className="font-semibold text-[var(--data-entity)]">{oldest.company.name}</span>
        {" has waited the longest — "}
        <span className="font-semibold text-[var(--data-due)]">{formatWait(oldest.days)}</span>
        {"."}
      </>
    )
  } else if (oldest && busiest) {
    context = (
      <>
        {"Fresh in today — "}
        <span className="font-semibold text-[var(--data-entity)]">{busiest.name}</span>
        {" leads with "}
        <span className="tabular-nums">{busiest.needsReview}</span>
        {"."}
      </>
    )
  } else if (busiest) {
    context = (
      <>
        <span className="font-semibold text-[var(--data-entity)]">{busiest.name}</span>
        {" has the most waiting — "}
        <span className="tabular-nums">{busiest.needsReview}</span>
        {"."}
      </>
    )
  }

  const facts: { key: string; label: string; node: ReactNode }[] = []
  if (oldest) {
    facts.push({
      key: "oldest",
      label: "Oldest waiting",
      node: <span className="tabular-nums text-[var(--data-due)]">{formatWait(oldest.days)}</span>,
    })
    facts.push({
      key: "aging",
      label: `Aging ${AGING_THRESHOLD_DAYS}d+`,
      node: (
        <span
          className={cn(
            "tabular-nums",
            agingItems > 0 ? "text-[var(--text-attention)]" : "text-foreground",
          )}
        >
          {agingItems}
        </span>
      ),
    })
  }
  if (lead) {
    facts.push({
      key: "longest",
      label: hasDates ? "Longest wait" : "Most waiting",
      node: <span className="truncate text-[var(--data-entity)]">{lead.name}</span>,
    })
  }

  return (
    <motion.section variants={m.panel} initial="hidden" animate="show" className={shellClass} aria-label="Needs attention">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Lead — what needs me */}
        <div className="flex min-w-0 items-start gap-4">
          <WorkspaceArt name="review" className="hidden size-16 shrink-0 sm:block" />
          <div className="min-w-0">
            <Eyebrow tone="attention">Needs attention</Eyebrow>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              <span className="tabular-nums text-[var(--text-attention)]">{totalNeedsReview}</span>
              {` ${reviewItemWord} waiting to review`}
            </h2>
            {context ? <p className="mt-1 text-sm font-medium text-foreground">{context}</p> : null}
            {lead ? (
              <Button
                asChild
                size="sm"
                className="mt-4"
              >
                <Link href={`/dashboard/companies/${encodeURIComponent(lead.id)}`}>
                  Review {lead.name}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        {/* Facts — what's aging */}
        {facts.length ? (
          <motion.div
            variants={m.staggerParent(0.04)}
            initial="hidden"
            animate="show"
            className="grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-border)] lg:w-auto"
          >
            {facts.map((fact) => (
              <motion.div key={fact.key} variants={m.listItem} className="flex min-w-0 flex-col gap-1 bg-white px-4 py-3 sm:px-5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
                  {fact.label}
                </span>
                <span className="block max-w-[8rem] truncate text-lg font-semibold leading-tight sm:text-xl">
                  {fact.node}
                </span>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </div>
    </motion.section>
  )
}

function Eyebrow({ tone, children }: { tone: "attention" | "success"; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide">
      <span
        aria-hidden="true"
        className={cn(
          "inline-block size-2 rounded-full",
          tone === "attention" ? "bg-[var(--text-attention)]" : "bg-[var(--text-success)]",
        )}
      />
      <span className={tone === "attention" ? "text-[var(--text-attention)]" : "text-[var(--text-success)]"}>
        {children}
      </span>
    </span>
  )
}

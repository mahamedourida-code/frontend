"use client"

/**
 * C12 — Monthly value recap ("This month with AxLiner").
 *
 * A calm, premium "Wrapped"-style recap for the accountant. Four metrics are
 * derived HEURISTICALLY from data already available through `api-client.ts`
 * (no new backend, no model):
 *
 *   1. Invoices reviewed   → dashboard `thisMonthProcessed` (30d window).
 *   2. % pre-coded by memory → share of this-month AP items that matched a
 *                              saved vendor rule (`vendor_suggestion`).
 *   3. Duplicates caught   → this-month AP items carrying a duplicate warning.
 *   4. ~Hours saved        → invoices reviewed × MINUTES_SAVED_PER_DOC ÷ 60.
 *
 * Metrics that aren't derivable yet (e.g. no AP items this month) are labelled
 * gracefully rather than fabricated. The "share" affordance copies a clean,
 * brandable text summary the accountant can hand to their own clients.
 */

import * as React from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import {
  Check,
  Copy,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  Timer,
  Wand2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCountUp } from "@/hooks/useCountUp"
import { accountsPayableApi, ocrApi } from "@/lib/api-client"
import { cn } from "@/lib/utils"

/** Conservative estimate of analyst minutes saved per document vs. manual key-in. */
const MINUTES_SAVED_PER_DOC = 3.5

type RecapMetrics = {
  /** Documents reviewed this calendar month. */
  invoicesReviewed: number
  /** 0–100, or null when there's no AP basis to compute it. */
  precodedPct: number | null
  /** Documents this month that matched saved vendor memory. */
  precodedCount: number
  /** Duplicate documents flagged this month, or null when no AP basis. */
  duplicatesCaught: number | null
  /** Rounded hours saved (heuristic). */
  hoursSaved: number
  /** Whether AP data was available to ground metrics 2 & 3. */
  hasApBasis: boolean
}

function startOfThisMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function monthLabel(): string {
  return new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })
}

/**
 * Pulls already-available data and folds it into the four heuristic metrics.
 * Falls back gracefully: dashboard volume always works; the AP-derived metrics
 * (pre-coded %, duplicates) become `null` when there are no AP items this month.
 */
async function computeRecap(): Promise<RecapMetrics> {
  const monthStart = startOfThisMonth()

  const [dashboard, apResult] = await Promise.all([
    ocrApi.getDashboard("30d").catch(() => null),
    accountsPayableApi.list().catch(() => ({ items: [], total: 0 })),
  ])

  const invoicesReviewed = dashboard?.stats?.thisMonthProcessed ?? 0

  const monthItems = (apResult?.items ?? []).filter((item) => {
    const created = item.created_at ? new Date(item.created_at) : null
    return created instanceof Date && !Number.isNaN(created.getTime()) && created >= monthStart
  })

  const hasApBasis = monthItems.length > 0

  const precodedCount = monthItems.filter((item) => Boolean(item.vendor_suggestion)).length
  const precodedPct = hasApBasis
    ? Math.round((precodedCount / monthItems.length) * 100)
    : null

  const duplicatesCaught = hasApBasis
    ? monthItems.filter((item) => (item.duplicate_warnings?.length ?? 0) > 0).length
    : null

  const hoursSaved = Math.round((invoicesReviewed * MINUTES_SAVED_PER_DOC) / 60)

  return {
    invoicesReviewed,
    precodedPct,
    precodedCount,
    duplicatesCaught,
    hoursSaved,
    hasApBasis,
  }
}

/** Plain-text summary the accountant can paste into a client email / message. */
function buildShareText(m: RecapMetrics): string {
  const lines = [
    `This month with AxLiner — ${monthLabel()}`,
    "",
    `• ${m.invoicesReviewed.toLocaleString()} documents reviewed`,
  ]
  if (m.precodedPct !== null) {
    lines.push(`• ${m.precodedPct}% pre-coded automatically from vendor memory`)
  }
  if (m.duplicatesCaught !== null) {
    lines.push(
      `• ${m.duplicatesCaught.toLocaleString()} duplicate ${m.duplicatesCaught === 1 ? "entry" : "entries"} caught before the books`,
    )
  }
  lines.push(`• ~${m.hoursSaved.toLocaleString()} ${m.hoursSaved === 1 ? "hour" : "hours"} of manual entry saved`)
  lines.push("", "Reviewed, never auto-posted. You stayed in control.")
  return lines.join("\n")
}

const CARD_STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const CARD_ITEM: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

function CountValue({
  target,
  prefix = "",
  suffix = "",
  enabled,
}: {
  target: number
  prefix?: string
  suffix?: string
  enabled: boolean
}) {
  const { value, ref } = useCountUp(target, {
    duration: 1.3,
    ease: "easeOut",
    startOnView: true,
    enabled,
  })
  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} className="tabular-nums">
      {prefix}
      {Math.round(value).toLocaleString()}
      {suffix}
    </span>
  )
}

type StatBlock = {
  key: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
  target: number | null
  prefix?: string
  suffix?: string
  /** Shown instead of a number when the metric isn't derivable yet. */
  fallback?: string
  caption: string
  /** Emphasised "hero" block spans the full row. */
  hero?: boolean
}

function RecapStat({ block, animate }: { block: StatBlock; animate: boolean }) {
  const unavailable = block.target === null
  return (
    <motion.div
      variants={CARD_ITEM}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--workspace-popout-border)] bg-card p-5 shadow-none",
        block.hero && "sm:col-span-2",
      )}
    >
      {/* soft brown wash to tie it to the workspace palette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--workspace-popout-bg) 90%, transparent) 0%, transparent 55%)",
        }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--brand-brown-fg)]">
          {block.label}
        </p>
        <span className="flex size-7 items-center justify-center rounded-full border border-[var(--workspace-selection-border)] bg-[var(--workspace-selection-bg)] text-[var(--brand-brown-deep)] shadow-none">
          <block.Icon className="size-3.5" />
        </span>
      </div>
      <div
        className={cn(
          "relative mt-2 font-bold leading-none tracking-tight text-foreground",
          block.hero ? "text-5xl" : "text-3xl",
        )}
      >
        {unavailable ? (
          <span className="text-2xl font-semibold text-muted-foreground">{block.fallback ?? "—"}</span>
        ) : (
          <CountValue
            target={block.target as number}
            prefix={block.prefix}
            suffix={block.suffix}
            enabled={animate}
          />
        )}
      </div>
      <p className="relative mt-2 text-xs font-medium text-muted-foreground">{block.caption}</p>
    </motion.div>
  )
}

function RecapBody({ metrics }: { metrics: RecapMetrics }) {
  const reduceMotion = useReducedMotion()
  const animate = !reduceMotion
  const [copied, setCopied] = React.useState(false)

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildShareText(metrics))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }, [metrics])

  const blocks: StatBlock[] = [
    {
      key: "reviewed",
      label: "Documents reviewed",
      Icon: FileSpreadsheet,
      target: metrics.invoicesReviewed,
      caption: "Read, checked and made ready this month.",
      hero: true,
    },
    {
      key: "precoded",
      label: "Pre-coded by memory",
      Icon: Wand2,
      target: metrics.precodedPct,
      suffix: "%",
      fallback: "Learning",
      caption:
        metrics.precodedPct !== null
          ? `${metrics.precodedCount.toLocaleString()} filled in from saved vendors.`
          : "Vendor memory builds as you review.",
    },
    {
      key: "duplicates",
      label: "Duplicates caught",
      Icon: ShieldCheck,
      target: metrics.duplicatesCaught,
      fallback: "None yet",
      caption:
        metrics.duplicatesCaught !== null
          ? "Flagged before they reached the books."
          : "We watch for repeats automatically.",
    },
    {
      key: "hours",
      label: "Hours saved",
      Icon: Timer,
      target: metrics.hoursSaved,
      prefix: "~",
      caption: "Versus keying every field by hand.",
    },
  ]

  return (
    <div className="overflow-hidden rounded-xl">
      {/* Header band — calm official tint, editorial */}
      <div className="relative overflow-hidden border-b border-[var(--workspace-popout-border)] bg-[var(--workspace-popout-bg)] px-6 pb-6 pt-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand-brown) 28%, transparent), transparent 70%)" }}
        />
        <div className="relative flex items-center gap-2 text-[var(--brand-brown-fg)]">
          <Sparkles className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">This month with AxLiner</span>
        </div>
        <DialogTitle asChild>
          <h2 className="relative mt-2 text-2xl font-bold tracking-tight text-[var(--brand-brown-deep)]">
            {monthLabel()}
          </h2>
        </DialogTitle>
        <p className="relative mt-1 max-w-md text-sm font-medium text-foreground/70">
          A calm recap of the work AxLiner did alongside you — yours to share with your clients.
        </p>
      </div>

      <motion.div
        className="grid gap-3 px-6 py-6 sm:grid-cols-2"
        variants={CARD_STAGGER}
        initial="hidden"
        animate="show"
      >
        {blocks.map((block) => (
          <RecapStat key={block.key} block={block} animate={animate} />
        ))}
      </motion.div>

      {/* Footer — promise line + share */}
      <div className="flex flex-col gap-3 border-t border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Reviewed, never auto-posted.{" "}
          <span className="text-foreground">You stayed in control.</span>
        </p>
        <Button
          variant="glossy"
          size="sm"
          onClick={handleCopy}
          className="self-start sm:self-auto"
          aria-live="polite"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Summary copied" : "Copy summary to share"}
        </Button>
      </div>
    </div>
  )
}

/**
 * Entry-point card for the dashboard overview. Opens the recap in a dialog.
 * Self-contained: fetches its own metrics lazily the first time it's opened.
 */
export function MonthlyRecapCard({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)
  const [metrics, setMetrics] = React.useState<RecapMetrics | null>(null)
  const [loading, setLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      setMetrics(await computeRecap())
    } finally {
      setLoading(false)
    }
  }, [])

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next)
      if (next && !metrics && !loading) {
        void load()
      }
    },
    [load, loading, metrics],
  )

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className={cn(
          "ax-interactive group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-[var(--workspace-popout-border)] bg-[var(--workspace-popout-bg)] p-5 text-left transition-colors hover:bg-[var(--workspace-popout-hover)]",
          className,
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-8 size-32 rounded-full opacity-50 transition-transform duration-500 group-hover:scale-110"
          style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand-brown) 24%, transparent), transparent 70%)" }}
        />
        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--workspace-selection-border)] bg-[var(--workspace-selection-bg)] text-[var(--brand-brown-deep)] shadow-none">
          <Sparkles className="size-5" />
        </span>
        <div className="relative min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--brand-brown-deep)]">
            New
          </p>
          <p className="truncate text-[15px] font-bold text-foreground">This month with AxLiner</p>
          <p className="truncate text-xs font-medium text-muted-foreground">
            Your recap — invoices reviewed, hours saved, ready to share.
          </p>
        </div>
        <span className="relative shrink-0 rounded-full border border-[var(--workspace-selection-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-brown-deep)] shadow-none">
          View recap
        </span>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton
          className="max-w-xl gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          {loading || !metrics ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3 px-6">
              <span className="flex size-10 items-center justify-center rounded-full border border-[var(--workspace-selection-border)] bg-[var(--workspace-selection-bg)] text-[var(--brand-brown-deep)]">
                <Sparkles className="size-5 animate-pulse" />
              </span>
              <DialogTitle className="text-sm font-medium text-muted-foreground">
                Gathering your month…
              </DialogTitle>
            </div>
          ) : (
            <RecapBody metrics={metrics} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MonthlyRecapCard

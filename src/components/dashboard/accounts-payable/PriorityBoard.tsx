"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { AlertTriangle, ArrowRight, CircleCheck, Send } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Topic 8 — the calm priority summary that now LEADS the Draft bills page.
 *
 * Instead of dropping a busy accountant straight into a 12-column table and a
 * power editor, the page opens with three plain-English segments answering
 * "what do I do next":
 *
 *   1. Needs attention  (amber, FIRST + visually distinct) — the count of bills
 *      that still need a human: coding / review, duplicates, missing info, or an
 *      over-PO match. Clicking it focuses the queue on that group.
 *   2. Ready to publish  (emerald, the obvious next action) — coded bills one
 *      keystroke from the books, carrying the one calm primary action.
 *   3. Published          (quiet) — the done pile, for reassurance.
 *
 * Everything here is presentation over data the page ALREADY computes. No API
 * calls, no new derivations — counts and the publish handler are passed in.
 * Reuses the workspace tokens + the page's brown primary so it reads as one
 * product with the queue below it.
 */

export type PrioritySegmentKey = "needs_attention" | "ready_to_publish" | "published"

interface PriorityBoardProps {
  /** Items still needing a human — coding/review, duplicates, missing info, over-PO. */
  needsAttention: number
  /** Coded bills ready to publish to the connected destination. */
  ready: number
  /** Bills already published. */
  published: number
  /** Sub-breakdown of the attention bucket, surfaced as quiet chips. */
  duplicates: number
  missingInfo: number
  /** Which segment the queue is currently focused on (drives the highlight). */
  activeSegment: PrioritySegmentKey | null
  /** Focus the queue on a segment. */
  onSelectSegment: (key: PrioritySegmentKey) => void
  /** How many ready bills the reviewer has selected for the bulk publish. */
  selectedCount: number
  /** Compact connected/destination chip (both QuickBooks AND Xero). */
  destinationChip: React.ReactNode
}

type Segment = {
  key: PrioritySegmentKey
  label: string
  count: number
  caption: string
  icon: React.ReactNode
  /** Lead segment reads in amber; the rest stay calm. */
  tone: "attention" | "ready" | "done"
}

const TONE_RING: Record<Segment["tone"], string> = {
  attention: "border-amber-300 bg-amber-50 hover:border-amber-400",
  ready: "border-emerald-200 bg-emerald-50 hover:border-emerald-300",
  done: "border-[var(--workspace-border)] bg-white hover:border-[var(--workspace-button-border)]",
}

const TONE_ACTIVE: Record<Segment["tone"], string> = {
  attention: "ring-2 ring-amber-400/60",
  ready: "ring-2 ring-emerald-400/60",
  done: "ring-2 ring-[var(--workspace-primary)]/40",
}

const TONE_ICON: Record<Segment["tone"], string> = {
  attention: "bg-amber-100 text-amber-700",
  ready: "bg-emerald-100 text-emerald-700",
  done: "bg-[var(--workspace-soft)] text-[var(--workspace-primary)]",
}

const TONE_COUNT: Record<Segment["tone"], string> = {
  attention: "text-amber-900",
  ready: "text-emerald-900",
  done: "text-foreground",
}

export function PriorityBoard({
  needsAttention,
  ready,
  published,
  duplicates,
  missingInfo,
  activeSegment,
  onSelectSegment,
  selectedCount,
  destinationChip,
}: PriorityBoardProps) {
  const prefersReducedMotion = useReducedMotion()

  const segments: Segment[] = [
    {
      key: "needs_attention",
      label: "Needs attention",
      count: needsAttention,
      caption:
        needsAttention === 0
          ? "Nothing waiting on you"
          : needsAttention === 1
            ? "1 bill needs a human"
            : `${needsAttention} bills need a human`,
      icon: <AlertTriangle aria-hidden="true" />,
      tone: "attention",
    },
    {
      key: "ready_to_publish",
      label: "Ready to publish",
      count: ready,
      caption:
        ready === 0
          ? "Coded bills land here"
          : "Coded — one keystroke from the books",
      icon: <Send aria-hidden="true" />,
      tone: "ready",
    },
    {
      key: "published",
      label: "Published",
      count: published,
      caption: published === 1 ? "1 bill on the books" : `${published} on the books`,
      icon: <CircleCheck aria-hidden="true" />,
      tone: "done",
    },
  ]

  const attentionChips = [
    duplicates > 0 ? { label: duplicates === 1 ? "1 duplicate" : `${duplicates} duplicates`, key: "dup" } : null,
    missingInfo > 0 ? { label: `${missingInfo} missing info`, key: "missing" } : null,
  ].filter(Boolean) as Array<{ label: string; key: string }>

  return (
    <div className="space-y-4">
      {/* Calm header line: what this view is + the compact destination chip
          (QuickBooks OR Xero), never a heavy panel. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-[13px] font-medium text-foreground">
          Start with what needs attention, then publish what&apos;s ready.
        </p>
        <div className="flex shrink-0 items-center gap-2">{destinationChip}</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {segments.map((segment, index) => {
          const active = activeSegment === segment.key
          const lead = segment.tone === "attention" && segment.count > 0
          return (
            <motion.button
              key={segment.key}
              type="button"
              onClick={() => onSelectSegment(segment.key)}
              aria-pressed={active}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
              className={cn(
                "ax-interactive group relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors",
                TONE_RING[segment.tone],
                active && TONE_ACTIVE[segment.tone],
                // The lead segment with work waiting carries a touch more
                // presence so the eye lands on it first.
                lead && "sm:scale-[1.01]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-[18px]",
                    TONE_ICON[segment.tone],
                  )}
                >
                  {segment.icon}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-[28px] font-semibold leading-none tabular-nums", TONE_COUNT[segment.tone])}>
                    {segment.count}
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">{segment.label}</span>
                </div>
                <p className="mt-1.5 text-xs font-medium text-foreground">{segment.caption}</p>
              </div>

              {/* Attention sub-breakdown as quiet chips — duplicates / missing
                  info — only on the lead card and only when they exist. */}
              {segment.tone === "attention" && attentionChips.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {attentionChips.map((chip) => (
                    <span
                      key={chip.key}
                      className="inline-flex items-center rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[11px] font-medium text-amber-900"
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* When ready bills are selected, the Ready card surfaces a quiet
                  "N selected" cue that points at the one primary Publish button
                  in the header — it never becomes a second competing CTA. */}
              {segment.tone === "ready" && selectedCount > 0 ? (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900">
                  <Send aria-hidden="true" className="size-3" />
                  {selectedCount} selected to publish
                </span>
              ) : null}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

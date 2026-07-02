"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { AlertTriangle, ArrowRight, CircleCheck, Clock, Send } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Presentation-only priority summary over counts computed by the AP page.
 */

export type PrioritySegmentKey = "needs_attention" | "pending_approval" | "ready_to_publish" | "published"

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
  /** Bills sitting in the approval gate, awaiting an approver. */
  pendingApproval: number
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
  caption: string
  count: number
  icon: React.ReactNode
  /** Lead segment reads in amber; the rest stay calm. */
  tone: "attention" | "approval" | "ready" | "done"
}

const TONE_RING: Record<Segment["tone"], string> = {
  attention: "border-[color-mix(in_srgb,var(--text-attention)_38%,transparent)] bg-[color-mix(in_srgb,var(--text-attention)_8%,white)] hover:border-[color-mix(in_srgb,var(--text-attention)_58%,transparent)]",
  approval: "border-[color-mix(in_srgb,var(--text-review)_30%,transparent)] bg-[color-mix(in_srgb,var(--text-review)_7%,white)] hover:border-[color-mix(in_srgb,var(--text-review)_48%,transparent)]",
  ready: "border-[color-mix(in_srgb,var(--text-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--text-success)_7%,white)] hover:border-[color-mix(in_srgb,var(--text-success)_48%,transparent)]",
  done: "border-[var(--workspace-border)] bg-card hover:border-[var(--workspace-button-border)]",
}

const TONE_ACTIVE: Record<Segment["tone"], string> = {
  attention: "ring-2 ring-amber-400/60",
  approval: "ring-2 ring-violet-400/50",
  ready: "ring-2 ring-emerald-400/60",
  done: "ring-2 ring-[var(--workspace-primary)]/40",
}

const TONE_ICON: Record<Segment["tone"], string> = {
  attention: "bg-amber-100 text-amber-700",
  approval: "bg-violet-100 text-violet-700",
  ready: "bg-emerald-100 text-emerald-700",
  done: "bg-[var(--workspace-soft)] text-[var(--workspace-primary)]",
}

const TONE_COUNT: Record<Segment["tone"], string> = {
  attention: "text-amber-900",
  approval: "text-violet-900",
  ready: "text-emerald-900",
  done: "text-foreground",
}

export function PriorityBoard({
  needsAttention,
  ready,
  published,
  duplicates,
  missingInfo,
  pendingApproval,
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
      caption: "Code, fix, or return",
      count: needsAttention,
      icon: <AlertTriangle aria-hidden="true" />,
      tone: "attention",
    },
    {
      key: "pending_approval",
      label: "Awaiting approval",
      caption: "Owner review gate",
      count: pendingApproval,
      icon: <Clock aria-hidden="true" />,
      tone: "approval",
    },
    {
      key: "ready_to_publish",
      label: "Ready to publish",
      caption: "Clean drafts for export",
      count: ready,
      icon: <Send aria-hidden="true" />,
      tone: "ready",
    },
    {
      key: "published",
      label: "Published",
      caption: "Sent to accounting",
      count: published,
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
      <div className="flex flex-col gap-3 rounded-lg border border-[var(--workspace-border)] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--workspace-muted)]">
            AP operations
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            Prioritize exceptions, approvals, and publish-ready drafts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">{destinationChip}</div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
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
                "ax-interactive group relative flex min-h-[92px] flex-col gap-2 rounded-md border p-3 text-left transition-colors sm:min-h-0 sm:gap-3 sm:p-4",
                TONE_RING[segment.tone],
                active && TONE_ACTIVE[segment.tone],
                lead && "sm:scale-[1.01]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex size-8 shrink-0 items-center justify-center rounded-md sm:size-9 [&_svg]:size-4 sm:[&_svg]:size-[18px]",
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
                  <span className={cn("text-2xl font-semibold leading-none tabular-nums sm:text-[28px]", TONE_COUNT[segment.tone])}>
                    {segment.count}
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">{segment.label}</span>
                </div>
                <p className="mt-1 truncate text-xs font-medium text-foreground/65">{segment.caption}</p>
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

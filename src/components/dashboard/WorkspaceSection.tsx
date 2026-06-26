"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Symbol } from "@/components/dashboard/Symbol"

type SectionTone = "default" | "active" | "muted"

const toneAccent: Record<SectionTone, string> = {
  default: "",
  // The active step reads via a quiet full emerald-tinted ring (no side stripe).
  active: "ring-1 ring-inset ring-[var(--brand-green-ring)]/30",
  muted: "opacity-90",
}

interface WorkspaceSectionProps {
  /** Section heading, e.g. "Verify extraction". */
  title: React.ReactNode
  /** Optional leading lucide icon, rendered in a soft tinted tile (Tables-style). */
  icon?: React.ReactNode
  /** Optional step chip rendered before the title, e.g. "2". */
  step?: React.ReactNode
  /** One calm line under the title. Use sparingly — most sections need none. */
  hint?: React.ReactNode
  /** Optional shared contextual vector symbol. */
  symbol?: string
  /** Right-aligned controls in the header. */
  actions?: React.ReactNode
  tone?: SectionTone
  /** When true the section collapses to its header; click the header to toggle. */
  collapsible?: boolean
  /** Initial open state for a collapsible section. Defaults to open. */
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  id?: string
}

/**
 * The shared "box" used across the workspace and the AP queue. A calm,
 * bordered card with a labelled header (optional leading icon, step number, or
 * hint) and a roomy content well. Built only on existing brand tokens (card /
 * border / muted / brand-green / workspace-primary) so it never theme-flips and
 * never reads as generic AI-gradient filler. One primitive, used on every
 * review surface, so they feel like one product.
 *
 * Premium structure cues, inspired by Tables: a soft `rounded-xl` shell,
 * generous `px-6` padding, an optional icon tile leading the title, and an
 * optional collapse so secondary density can be tucked away instead of
 * crowding the page.
 */
export function WorkspaceSection({
  title,
  icon,
  step,
  symbol,
  actions,
  tone = "default",
  collapsible = false,
  defaultOpen = true,
  children,
  className,
  headerClassName,
  contentClassName,
  id,
}: WorkspaceSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const [open, setOpen] = React.useState(defaultOpen)
  const isOpen = collapsible ? open : true

  const heading = (
    <div className="flex min-w-0 items-center gap-3">
      {icon ? (
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--workspace-primary)_10%,transparent)] text-[var(--workspace-primary)] [&_svg]:size-[18px]">
          {icon}
        </span>
      ) : null}
      {symbol ? <Symbol name={symbol} size="badge" className="-my-1" /> : null}
      {step !== undefined && step !== null ? (
        <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums text-[var(--workspace-primary)]">
          {step}
        </span>
      ) : null}
      <div className="min-w-0">
        <h2 className="truncate text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      {collapsible ? (
        <ChevronDown
          className={cn(
            "ml-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen ? "rotate-180" : "rotate-0",
          )}
        />
      ) : null}
    </div>
  )

  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_0_rgba(16,24,40,0.04),0_1px_3px_0_rgba(16,24,40,0.06)]",
        toneAccent[tone],
        className,
      )}
    >
      <header
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6",
          isOpen && "border-b border-border",
          headerClassName,
        )}
      >
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={isOpen}
            className="ax-interactive -m-1 flex min-w-0 flex-1 items-center rounded-lg p-1 text-left hover:bg-[var(--workspace-soft)]"
          >
            {heading}
          </button>
        ) : (
          heading
        )}
        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </header>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="content"
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className={cn("px-5 py-5 sm:px-6", contentClassName)}>{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

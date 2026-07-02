"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMotionTokens } from "@/lib/motion"
import { Symbol } from "@/components/dashboard/Symbol"

type SectionTone = "default" | "active" | "muted"

const toneAccent: Record<SectionTone, string> = {
  default: "",
  active: "border-[var(--workspace-selection-border)] bg-[color-mix(in_srgb,var(--workspace-blue-soft)_46%,white)]",
  muted: "bg-[var(--workspace-soft)]",
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
  hint,
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
  const m = useMotionTokens()
  const [open, setOpen] = React.useState(defaultOpen)
  const isOpen = collapsible ? open : true

  const heading = (
    <div className="flex min-w-0 flex-1 items-start gap-3">
      {icon ? (
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-[color-mix(in_srgb,var(--workspace-primary)_16%,var(--workspace-border))] bg-[color-mix(in_srgb,var(--workspace-primary)_7%,white)] text-[var(--workspace-primary)] [&_svg]:size-[17px]">
          {icon}
        </span>
      ) : null}
      {symbol ? <Symbol name={symbol} size="badge" className="-my-1" /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2.5">
          {step !== undefined && step !== null ? (
            <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border border-[var(--workspace-border)] bg-white px-2 font-mono text-[12px] font-semibold tabular-nums text-[var(--workspace-primary)]">
              {step}
            </span>
          ) : null}
          <h2 className="truncate text-[15px] font-semibold tracking-normal text-foreground">{title}</h2>
        </div>
        {hint ? (
          <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[var(--workspace-muted)]">{hint}</p>
        ) : null}
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
        "relative overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-white",
        toneAccent[tone],
        className,
      )}
    >
      <header
        className={cn(
          "flex items-start justify-between gap-3 px-4 py-3.5 sm:px-5",
          isOpen && "border-b border-[var(--workspace-border)]",
          headerClassName,
        )}
      >
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={isOpen}
            className="ax-interactive -m-1 flex min-w-0 flex-1 items-start rounded-md p-1 text-left hover:bg-[var(--workspace-soft)]"
          >
            {heading}
          </button>
        ) : (
          heading
        )}
        {actions ? <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5">{actions}</div> : null}
      </header>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="content"
            initial={m.reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={m.reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={m.reduced ? { duration: 0 } : { duration: m.dur.route, ease: m.ease }}
            className="overflow-hidden"
          >
            <div className={cn("px-4 py-4 sm:px-5", contentClassName)}>{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

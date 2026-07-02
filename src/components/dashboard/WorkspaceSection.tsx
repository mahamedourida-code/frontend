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
  active: "border-[var(--workspace-selection-border)] bg-[color-mix(in_srgb,var(--workspace-blue-soft)_72%,white)]",
  muted: "bg-[var(--workspace-soft)]",
}

interface WorkspaceSectionProps {
  /** Section heading, e.g. "Verify extraction". */
  title: React.ReactNode
  /** Optional leading lucide icon, rendered in a soft tinted tile (Tables-style). */
  icon?: React.ReactNode
  /** Optional step chip rendered before the title, e.g. "2". */
  step?: React.ReactNode
  /** One calm line under the title. Use sparingly; most sections need none. */
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
  actionsClassName?: string
  titleClassName?: string
  hintClassName?: string
  compact?: boolean
  id?: string
}

/**
 * Shared workspace panel: compact header, calm border, optional icon/step/hint,
 * and a content well that callers can tighten with `compact` or class hooks.
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
  actionsClassName,
  titleClassName,
  hintClassName,
  compact = false,
  id,
}: WorkspaceSectionProps) {
  const m = useMotionTokens()
  const [open, setOpen] = React.useState(defaultOpen)
  const isOpen = collapsible ? open : true

  const heading = (
    <div className={cn("flex min-w-0 flex-1 items-start", compact ? "gap-2.5" : "gap-3")}>
      {icon ? (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-[var(--workspace-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
            compact ? "size-7 [&_svg]:size-3.5" : "size-8 [&_svg]:size-4",
          )}
        >
          {icon}
        </span>
      ) : null}
      {symbol ? <Symbol name={symbol} size="badge" className={cn("-my-1", compact && "scale-90")} /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          {step !== undefined && step !== null ? (
            <span
              className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--workspace-border)] bg-white font-mono font-semibold tabular-nums text-[var(--workspace-primary)]",
                compact ? "h-5 min-w-5 px-1.5 text-[11px]" : "h-6 min-w-6 px-2 text-[12px]",
              )}
            >
              {step}
            </span>
          ) : null}
          <h2
            className={cn(
              "truncate font-semibold tracking-normal text-foreground",
              compact ? "text-[13px]" : "text-[14px]",
              titleClassName,
            )}
          >
            {title}
          </h2>
        </div>
        {hint ? (
          <p
            className={cn(
              "mt-1 max-w-2xl text-pretty text-[12px] leading-5 text-[var(--workspace-muted)]",
              compact && "max-w-xl leading-4",
              hintClassName,
            )}
          >
            {hint}
          </p>
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
        "relative overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.035)]",
        toneAccent[tone],
        className,
      )}
    >
      <header
        className={cn(
          "flex items-start justify-between gap-3",
          compact ? "px-3 py-2.5 sm:px-4" : "px-4 py-3 sm:px-5",
          isOpen && "border-b border-[var(--workspace-border)]",
          headerClassName,
        )}
      >
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={isOpen}
            className="ax-interactive -m-1 flex min-w-0 flex-1 items-start rounded-lg p-1 text-left hover:bg-[var(--workspace-soft)]"
          >
            {heading}
          </button>
        ) : (
          heading
        )}
        {actions ? (
          <div className={cn("flex shrink-0 flex-wrap items-center justify-end gap-2", actionsClassName)}>
            {actions}
          </div>
        ) : null}
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
            <div className={cn(compact ? "px-3 py-3 sm:px-4" : "px-4 py-4 sm:px-5", contentClassName)}>
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

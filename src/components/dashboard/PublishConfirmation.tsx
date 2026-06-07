"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { Check } from "lucide-react"
import { MotionButton } from "@/components/ui/motion-button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PublishSuccessBurst } from "@/components/dashboard/PublishSuccessBurst"

/** What was actually posted, so the wording matches Bill vs Purchase/Expense. */
export type PublishedEntryKind = "bill" | "expense"

export type PublishConfirmationState = {
  /** "bill" → unpaid Bill · "expense" → already-paid Purchase/Expense. */
  kind: PublishedEntryKind
  /** Whether the source document was attached to the QuickBooks entry. */
  attached?: boolean
  /** Viewport-anchored origin for the paired success burst (the Publish button). */
  origin?: { x: number; y: number } | null
}

type PublishConfirmationProps = {
  state: PublishConfirmationState | null
  onClose: () => void
}

const ENTRY_LABEL: Record<PublishedEntryKind, string> = {
  bill: "Bill",
  expense: "Expense",
}

/**
 * C8 — the calm state after a major action. Instead of letting a publish end on
 * a vanishing toast, we hold a brief, deliberate confirmation: "Posted to
 * QuickBooks — entry created, source attached", paired with the existing
 * {@link PublishSuccessBurst}. Reuses the publish result (entry kind +
 * attachment status) for the wording. Honours the human-in-the-loop voice — the
 * reviewer approved it; we simply confirm it landed. No new endpoints.
 */
export function PublishConfirmation({ state, onClose }: PublishConfirmationProps) {
  const prefersReducedMotion = useReducedMotion()
  const open = Boolean(state)
  const kind = state?.kind ?? "bill"
  const entry = ENTRY_LABEL[kind]
  const attached = state?.attached ?? false

  const headline = "Posted to QuickBooks"
  const detail = attached
    ? `${entry} created, source attached.`
    : `${entry} created in QuickBooks.`

  return (
    <>
      <PublishSuccessBurst show={open} origin={state?.origin ?? null} />
      <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
        <DialogContent className="gap-0 rounded-2xl p-0 sm:max-w-sm" showCloseButton={false}>
          <motion.div
            className="flex flex-col items-center px-7 pb-7 pt-9 text-center"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <motion.div
              className="relative mb-5 flex size-14 items-center justify-center rounded-full border border-[var(--workspace-selection-border)] bg-[var(--workspace-selection-bg)] text-[var(--brand-brown-deep)] shadow-none"
              initial={prefersReducedMotion ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.05 }}
            >
              <Check className="size-7" strokeWidth={2.75} />
              <span className="absolute -bottom-1 -right-1 inline-flex size-6 items-center justify-center rounded-full border border-border bg-card shadow-none">
                <Image src="/icons/qb-badge.png" alt="QuickBooks" width={16} height={16} className="object-contain" />
              </span>
            </motion.div>

            <h2 className="text-lg font-semibold text-foreground">{headline}</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{detail}</p>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              You approved it. AxLiner posted it.
            </p>

            <MotionButton variant="glossy" onClick={onClose} className="mt-6 h-10 w-full px-5">
              Done
            </MotionButton>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  )
}

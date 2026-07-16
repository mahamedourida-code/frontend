"use client"

import { Check, Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

/** What was actually posted, so the wording matches Bill vs Purchase/Expense. */
export type PublishedEntryKind = "bill" | "expense"

export type PublishConfirmationState = {
  /** "bill" → unpaid Bill · "expense" → already-paid Purchase/Expense. */
  kind: PublishedEntryKind
  /** Whether the source document was attached to the published entry. */
  attached?: boolean
  /** The provider selected for this publish action. */
  destination?: "QuickBooks" | "Xero"
}

type PublishConfirmationProps = {
  state: PublishConfirmationState | null
  onClose: () => void
}

const ENTRY_LABEL: Record<PublishedEntryKind, string> = {
  bill: "Bill",
  expense: "Expense",
}

/** Holds the accounting result until the reviewer dismisses it. */
export function PublishConfirmation({ state, onClose }: PublishConfirmationProps) {
  const open = Boolean(state)
  const kind = state?.kind ?? "bill"
  const entry = ENTRY_LABEL[kind]
  const attached = state?.attached ?? false

  const headline = state?.destination ? `Published to ${state.destination}` : "Draft published"
  const detail = attached
    ? `${entry} created, source attached.`
    : `${entry} created successfully.`

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <DialogContent className="gap-0 rounded-lg p-0 sm:max-w-sm" showCloseButton={false}>
        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-[var(--workspace-primary)]">
              <Check className="size-7" strokeWidth={2.75} />
              <span className="absolute -bottom-0.5 -right-0.5 inline-flex size-5 items-center justify-center rounded-full border border-white bg-[#171717] text-white">
                <Landmark className="size-3" strokeWidth={2.4} aria-hidden="true" />
              </span>
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 className="text-base font-semibold text-foreground">{headline}</h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">{detail}</p>
            </div>
          </div>
          <Button variant="glossy" onClick={onClose} className="mt-5 h-9 w-full px-5">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

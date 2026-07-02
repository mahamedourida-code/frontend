"use client"

import * as React from "react"
import { CircleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

/** Controlled typed-confirmation modal for irreversible workspace actions. */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  confirmLabel = "Delete",
  busyLabel = "Deleting...",
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  /** When set, the user must type this exact string to enable the confirm button. */
  confirmText?: string
  confirmLabel?: string
  busyLabel?: string
  onConfirm: () => void | Promise<void>
}) {
  const [value, setValue] = React.useState("")
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setValue("")
      setBusy(false)
    }
  }, [open])

  const ready = confirmText ? value.trim() === confirmText : true

  const handleConfirm = async () => {
    if (!ready || busy) return
    setBusy(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[420px]">
        <DialogHeader className="border-b border-[var(--workspace-border)] px-5 pb-4 pr-12 pt-5 text-left">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600">
              <CircleAlert className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-[15px] font-semibold leading-6 text-foreground">
                {title}
              </DialogTitle>
              {description ? (
                <DialogDescription className="mt-1 text-[13px] leading-5 text-[var(--workspace-muted)]">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        {confirmText ? (
          <div className="space-y-2 px-5 py-4">
            <p className="text-[13px] font-semibold leading-5 text-foreground">
              Type <span className="font-bold">{confirmText}</span> to confirm.
            </p>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              placeholder={confirmText}
              className="h-9 rounded-lg border-[var(--workspace-border)] bg-white text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleConfirm()
              }}
            />
          </div>
        ) : null}

        <DialogFooter className="border-t border-[var(--workspace-border)] bg-[var(--workspace-soft)] px-5 py-3">
          <Button variant="surface" size="sm" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => void handleConfirm()}
            disabled={!ready || busy}
          >
            {busy ? busyLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

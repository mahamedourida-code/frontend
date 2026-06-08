"use client"

import * as React from "react"

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

/**
 * Typed-confirmation modal for irreversible actions. The confirm button stays
 * disabled until the user types `confirmText` exactly (when provided), so a
 * "delete account / delete workspace / delete client" can't fire by accident.
 *
 * Controlled: parent owns `open`. `onConfirm` may be async; the button shows a
 * busy state while it resolves and the dialog stays open on throw.
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  confirmLabel = "Delete",
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  /** When set, the user must type this exact string to enable the confirm button. */
  confirmText?: string
  confirmLabel?: string
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-foreground">{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {confirmText ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Type <span className="font-bold">{confirmText}</span> to confirm.
            </p>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              placeholder={confirmText}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleConfirm()
              }}
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="surface" size="sm" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => void handleConfirm()}
            disabled={!ready || busy}
          >
            {busy ? "Deleting…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

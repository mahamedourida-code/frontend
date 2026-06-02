"use client"

import { FormEvent, useState } from "react"
import { Building2, Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { companyApi } from "@/lib/api-client"

type AddCompanyDialogProps = {
  workspaceId?: string
  onCreated: () => void
}

type CompanyApi = {
  create: (workspaceId: string, payload: { name: string }) => Promise<unknown>
}

export function AddCompanyDialog({ workspaceId, onCreated }: AddCompanyDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanName = name.trim()
    if (!workspaceId || !cleanName) return

    setSaving(true)
    setError(null)
    try {
      await (companyApi as CompanyApi).create(workspaceId, { name: cleanName })
      setName("")
      setOpen(false)
      onCreated()
    } catch {
      setError("Could not add this company.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="surface" size="sm" disabled={!workspaceId}>
          <Plus className="size-4" />
          Add company
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Building2 className="size-5" />
          </div>
          <DialogTitle>Add company</DialogTitle>
          <DialogDescription>
            Create a company workspace for its mixed document batches, review queue, and draft bills.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <Input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Company name"
            aria-label="Company name"
          />
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="surface" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glossy" disabled={saving || !name.trim()}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Add company
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

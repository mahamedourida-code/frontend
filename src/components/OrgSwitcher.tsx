"use client"

import { useState } from "react"
import { Building2, Check, ChevronsUpDown, Loader2, Plus } from "lucide-react"

import { useWorkspaces } from "@/hooks/useWorkspaces"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type OrgSwitcherProps = {
  user?: unknown
}

/**
 * Top-bar organisation switcher. One accountant manages many clients across one or
 * more workspaces (organisations); this keeps the org you're working in always visible
 * and one click away — Zoho's "org switcher", re-skinned for AxLiner's dark top bar.
 * Switching persists server-side then reloads the dashboard scoped to the new org.
 *
 * Distinct from the sidebar/mobile `WorkspaceSwitcher` (which bundles account + sign-out).
 */
export function OrgSwitcher({ user }: OrgSwitcherProps) {
  const { workspaces, activeWorkspace, isLoading, createWorkspace, selectWorkspace } =
    useWorkspaces(user as never)
  const [switching, setSwitching] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  const activeName = activeWorkspace?.name || "Workspace"
  const busy = switching || creating

  async function handleSelect(workspaceId: string) {
    if (workspaceId === activeWorkspace?.id) return
    const target = workspaces.find((workspace) => workspace.id === workspaceId)
    if (!target) return
    setSwitching(true)
    try {
      await selectWorkspace(target)
      // Reload home scoped to the freshly-activated org so every panel re-reads it.
      window.location.assign("/dashboard")
    } catch {
      setSwitching(false)
    }
  }

  async function handleCreate() {
    const name = newName.trim()
    if (name.length < 2) return
    setCreating(true)
    const created = await createWorkspace(name)
    if (created) {
      window.location.assign("/dashboard")
      return
    }
    setCreating(false)
  }

  if (isLoading && !activeWorkspace) {
    return (
      <div className="hidden size-9 items-center justify-center rounded-md border border-white/15 bg-white/5 md:flex">
        <Loader2 className="size-4 animate-spin text-white/70" />
        <span className="sr-only">Loading workspace</span>
      </div>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={busy}
            aria-label="Switch workspace"
            title={`Workspace: ${activeName}`}
            className={cn(
              "ax-interactive group hidden size-9 cursor-pointer items-center justify-center rounded-md border border-white/16 bg-white/[0.07] text-white outline-none hover:border-white/30 hover:bg-white/[0.11] focus-visible:ring-2 focus-visible:ring-white/30 md:inline-flex xl:h-9 xl:w-auto xl:max-w-[210px] xl:justify-start xl:gap-2 xl:px-2.5",
            )}
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
              {busy ? <Loader2 className="size-4 animate-spin text-white" /> : <Building2 className="size-4 text-white" />}
            </span>
            <span className="hidden max-w-[142px] truncate text-[13px] font-semibold text-white xl:inline">{activeName}</span>
            <ChevronsUpDown className="ms-auto hidden size-3.5 shrink-0 text-white/60 group-hover:text-white xl:block" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" sideOffset={6} className="w-[248px] rounded-lg">
          <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-normal text-[var(--workspace-muted)]">
            Workspaces
          </DropdownMenuLabel>
          {workspaces.map((workspace) => {
            const isActive = workspace.id === activeWorkspace?.id
            return (
              <DropdownMenuItem
                key={workspace.id}
                onSelect={(event) => {
                  event.preventDefault()
                  void handleSelect(workspace.id)
                }}
                className="gap-2.5 py-2"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md",
                    isActive
                      ? "bg-[var(--workspace-primary)] text-white"
                      : "bg-[var(--workspace-soft)] text-[var(--workspace-icon)]",
                  )}
                >
                  <Building2 className="size-4" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[13px] font-semibold text-[var(--workspace-ink)]">
                    {workspace.name}
                  </span>
                  <span className="text-[11px] capitalize text-[var(--workspace-muted)]">
                    {workspace.role}
                  </span>
                </span>
                {isActive && <Check className="ms-auto size-4 shrink-0 text-[var(--workspace-primary)]" />}
              </DropdownMenuItem>
            )
          })}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              setNewName("")
              setCreateOpen(true)
            }}
            className="gap-2.5 py-2 font-semibold text-[var(--workspace-blue)] focus:text-[var(--workspace-blue)]"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-dashed border-[var(--workspace-button-border)] text-[var(--workspace-primary)]">
              <Plus className="size-4" />
            </span>
            New workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createOpen} onOpenChange={(open) => !creating && setCreateOpen(open)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>New workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="org-ws-name" className="text-sm font-semibold text-[var(--workspace-ink)]">
              Workspace name
            </label>
            <input
              id="org-ws-name"
              autoFocus
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  void handleCreate()
                }
              }}
              placeholder="e.g. Northwind Accounting"
              maxLength={60}
              className="h-10 w-full rounded-md border border-[var(--workspace-button-border)] bg-white px-3 text-sm text-[var(--workspace-ink)] outline-none focus:border-[var(--workspace-primary)] focus:ring-2 focus:ring-[var(--workspace-primary)]/20"
            />
            <p className="text-[13px] text-[var(--workspace-ink)]/70">
              A separate set of clients, documents, and accounting connections.
            </p>
          </div>
          <DialogFooter>
            <Button variant="surface" size="sm" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              variant="glossy"
              size="sm"
              onClick={() => void handleCreate()}
              disabled={creating || newName.trim().length < 2}
            >
              {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Create workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

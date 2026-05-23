"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ChevronsUpDown, LogOut, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { cn } from "@/lib/utils"

type WorkspaceSwitcherProps = {
  user?: {
    id?: string | null
    email?: string | null
    user_metadata?: {
      full_name?: string | null
      name?: string | null
    }
  } | null
  onSignOut: () => void
  menuSide?: "right" | "bottom"
}

export function WorkspaceSwitcher({ user, onSignOut, menuSide = "right" }: WorkspaceSwitcherProps) {
  const { workspaces, activeWorkspace, isLoading, error, createWorkspace, selectWorkspace } = useWorkspaces(user || null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")
  const [creating, setCreating] = useState(false)

  const handleCreateWorkspace = async () => {
    if (workspaceName.trim().length < 2) return
    setCreating(true)
    const workspace = await createWorkspace(workspaceName)
    setCreating(false)
    if (workspace) {
      setWorkspaceName("")
      setDialogOpen(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-11 w-full items-center gap-2 rounded-md px-2 text-start text-foreground transition-colors hover:bg-sidebar-accent">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-card text-xs font-bold text-primary">
              Ax
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">
              {isLoading ? "Loading workspace" : activeWorkspace?.name || "Workspace"}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60 rounded-md" side={menuSide} align="start" sideOffset={6}>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onSelect={() => {
                void selectWorkspace(workspace)
              }}
              className="gap-2"
            >
              <span className="truncate">{workspace.name}</span>
              <Check className={cn("ms-auto size-4", activeWorkspace?.id === workspace.id ? "opacity-100" : "opacity-0")} />
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              setDialogOpen(true)
            }}
          >
            Add workspace
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault()
              onSignOut()
            }}
          >
            <LogOut className="size-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="gap-5 rounded-md sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New workspace</DialogTitle>
            <DialogDescription>Create a separate workspace for another team or workflow.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="workspace-name" className="text-sm font-medium text-foreground">
              Workspace name
            </label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="Finance operations"
              maxLength={60}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleCreateWorkspace()
              }}
            />
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreateWorkspace()} disabled={creating || workspaceName.trim().length < 2}>
              {creating ? "Adding..." : "Add workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

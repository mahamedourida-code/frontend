"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ChevronDown, Headset, LogOut, Settings, UsersRound, Workflow } from "lucide-react"
import { AxMark } from "@/components/AppIcon"
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
          <button className="flex h-14 w-full items-center gap-3 rounded-lg px-2 text-start text-foreground transition-colors hover:bg-sidebar-accent">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md">
              <AxMark className="h-7 w-auto" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight">
              {isLoading ? "Loading workspace" : activeWorkspace?.name || "Workspace"}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[266px] rounded-lg border-border p-1.5 shadow-lg" side={menuSide} align="start" sideOffset={8}>
          <DropdownMenuItem asChild className="h-10 rounded-md px-3 text-[15px] font-semibold">
            <Link href="/dashboard/settings">
              <Settings className="size-[18px] text-muted-foreground" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="h-10 rounded-md px-3 text-[15px] font-semibold">
            <Link href="/dashboard/settings?section=account">
              <UsersRound className="size-[18px] text-muted-foreground" />
              Add &amp; manage members
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="h-10 gap-2 rounded-md px-3 text-[15px] font-semibold">
              <Headset className="me-2 size-[18px] text-muted-foreground" />
              Help &amp; support
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-52 rounded-lg border-border p-1.5 shadow-lg">
              <DropdownMenuItem asChild className="h-9 rounded-md text-sm font-medium">
                <Link href="/contact">Contact support</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="h-9 rounded-md text-sm font-medium">
                <Link href="/security">Security</Link>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="h-10 gap-2 rounded-md px-3 text-[15px] font-semibold">
              <Workflow className="me-2 size-[18px] text-muted-foreground" />
              Workspaces
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-60 rounded-lg border-border p-1.5 shadow-lg">
              <DropdownMenuLabel className="px-2 py-2 text-xs font-medium text-muted-foreground">
                Your workspaces
              </DropdownMenuLabel>
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onSelect={() => {
                    void selectWorkspace(workspace)
                  }}
                  className="h-9 gap-2 rounded-md text-sm font-medium"
                >
                  <span className="truncate">{workspace.name}</span>
                  <Check className={cn("ms-auto size-4", activeWorkspace?.id === workspace.id ? "opacity-100" : "opacity-0")} />
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="h-9 rounded-md text-sm font-medium"
                onSelect={() => {
                  setDialogOpen(true)
                }}
              >
                Add workspace
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem
            variant="destructive"
            className="h-10 rounded-md px-3 text-[15px] font-semibold text-foreground data-[variant=destructive]:text-foreground data-[variant=destructive]:*:[svg]:!text-muted-foreground"
            onSelect={(event) => {
              event.preventDefault()
              onSignOut()
            }}
          >
            <LogOut className="size-[18px] text-muted-foreground" />
            Sign out
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

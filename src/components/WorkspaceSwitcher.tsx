"use client"

import { useState } from "react"
import { CheckCircle2, ChevronDown, LogOut, Plus } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AxMark } from "@/components/AppIcon"
import { Input } from "@/components/ui/input"
import { useWorkspaces, type Workspace } from "@/hooks/useWorkspaces"
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

const TRIGGER_NAME_LIMIT = 14

function truncate(value: string, limit: number) {
  if (value.length <= limit) return value
  return `${value.slice(0, limit - 1).trimEnd()}…`
}

function initialLetter(value: string | null | undefined) {
  if (!value) return "W"
  const trimmed = value.trim()
  return trimmed.length ? trimmed[0]!.toUpperCase() : "W"
}

function WorkspaceAvatar({
  name,
  size = 24,
  className,
}: {
  name: string | null | undefined
  size?: number
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-semibold uppercase leading-none text-primary",
        size >= 28 && "text-[13px]",
        className,
      )}
    >
      {initialLetter(name)}
    </span>
  )
}

function RoleBadge({ role }: { role: Workspace["role"] }) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.04em]",
        role === "owner"
          ? "bg-primary/12 text-primary"
          : "bg-muted text-muted-foreground",
      )}
    >
      {role}
    </span>
  )
}

export function WorkspaceSwitcher({ user, onSignOut, menuSide = "right" }: WorkspaceSwitcherProps) {
  const {
    workspaces,
    activeWorkspace,
    isLoading,
    error,
    createWorkspace,
    selectWorkspace,
  } = useWorkspaces(user || null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")
  const [creating, setCreating] = useState(false)

  const triggerName = activeWorkspace?.name || (isLoading ? "Loading…" : "Workspace")
  const triggerLabel = truncate(triggerName, TRIGGER_NAME_LIMIT)
  const accountEmail = user?.email || ""

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
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="ax-interactive flex h-14 w-full items-center gap-3 rounded-lg px-2 text-start text-foreground hover:bg-sidebar-accent"
          >
            <AxMark className="h-8 w-auto shrink-0" />
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight">
              {triggerLabel}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-black transition-transform duration-[var(--ax-motion-fast,180ms)]",
                menuOpen && "rotate-180",
              )}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="min-w-[220px] rounded-lg border-border p-1.5 shadow-lg"
          side={menuSide}
          align="start"
          sideOffset={8}
        >
          {/* Account header */}
          <div className="px-2 pb-1.5 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Signed in as
            </p>
            <p
              className="mt-0.5 truncate text-xs text-muted-foreground"
              title={accountEmail || undefined}
            >
              {accountEmail || "Unknown account"}
            </p>
          </div>

          <DropdownMenuSeparator />

          {/* Workspaces */}
          <p className="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Workspaces
          </p>

          <AnimatePresence initial={false}>
            {menuOpen && (
              <motion.div
                key="workspace-list"
                className="space-y-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {isLoading && workspaces.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-muted-foreground">Retrieving workspaces…</p>
                ) : workspaces.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-muted-foreground">No workspaces yet.</p>
                ) : (
                  workspaces.map((workspace, index) => {
                    const isActive = activeWorkspace?.id === workspace.id
                    return (
                      <motion.div
                        key={workspace.id}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.15 }}
                      >
                        <DropdownMenuItem
                          onSelect={() => {
                            void selectWorkspace(workspace)
                          }}
                          className={cn(
                            "flex h-10 items-center gap-2.5 rounded-md px-2 text-sm font-medium",
                            isActive && "bg-sidebar-accent/60",
                          )}
                        >
                          <WorkspaceAvatar name={workspace.name} />
                          <span className="min-w-0 flex-1 truncate text-foreground">
                            {workspace.name}
                          </span>
                          <RoleBadge role={workspace.role} />
                          <CheckCircle2
                            className={cn(
                              "size-4 shrink-0 text-black transition-opacity",
                              isActive ? "opacity-100" : "opacity-0",
                            )}
                          />
                        </DropdownMenuItem>
                      </motion.div>
                    )
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="h-9 gap-2 rounded-md px-2 text-sm font-medium"
            onSelect={(event) => {
              event.preventDefault()
              setMenuOpen(false)
              setDialogOpen(true)
            }}
          >
            <span className="inline-flex size-6 items-center justify-center rounded-full border border-dashed border-border text-black">
              <Plus className="size-3.5" />
            </span>
            Create workspace
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            className="h-9 gap-2 rounded-md px-2 text-sm font-medium text-destructive data-[variant=destructive]:text-destructive"
            onSelect={(event) => {
              event.preventDefault()
              setMenuOpen(false)
              onSignOut()
            }}
          >
            <LogOut className="size-4" />
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
              {creating ? "Adding…" : "Add workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

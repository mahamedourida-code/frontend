"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  CheckCircle2,
  CreditCard,
  LifeBuoy,
  LogOut,
  Plus,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BillingSeal, CreditStack } from "@/components/BillingGlyphs"
import { useWorkspaces, type Workspace } from "@/hooks/useWorkspaces"
import { cn } from "@/lib/utils"

type AccountMenuUser = {
  id?: string | null
  email?: string | null
  user_metadata?: {
    avatar_url?: string | null
    full_name?: string | null
    name?: string | null
  }
} | null

type AccountMenuProps = {
  user?: AccountMenuUser
  planLabel: string
  credits: number | null
  billingLoading?: boolean
}

function displayName(user: AccountMenuUser | undefined) {
  return (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Account"
  )
}

function initials(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return "A"
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

function RoleBadge({ role }: { role: Workspace["role"] }) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.04em]",
        role === "owner" ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground",
      )}
    >
      {role}
    </span>
  )
}

export function AccountMenu({ user, planLabel, credits, billingLoading }: AccountMenuProps) {
  const router = useRouter()
  const {
    workspaces,
    activeWorkspace,
    isLoading,
    error,
    createWorkspace,
    selectWorkspace,
  } = useWorkspaces(user || null)

  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")
  const [creating, setCreating] = useState(false)

  const name = displayName(user)
  const email = user?.email || ""
  const avatarUrl = user?.user_metadata?.avatar_url || undefined

  const handleSignOut = async () => {
    const { signOut } = await import("@/lib/auth-helpers")
    try { await signOut() } finally { router.replace("/") }
  }

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
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Account menu"
            className="ax-interactive inline-flex size-10 items-center justify-center rounded-full border border-white/18 bg-white/10 transition-colors hover:bg-white/16 data-[state=open]:ring-2 data-[state=open]:ring-white/35"
          >
            <Avatar className="size-8">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback className="bg-primary/15 text-[13px] font-bold text-primary">
                {initials(name)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-72 rounded-xl border-[var(--workspace-border)] bg-white p-2 text-[var(--workspace-ink)] shadow-[0_16px_44px_rgba(15,23,42,0.14)]"
        >
          {/* Account header */}
          <div className="flex items-center gap-2.5 px-1.5 py-1.5">
            <Avatar className="size-9">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback className="bg-primary/15 text-[13px] font-semibold text-primary">
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-foreground">{name}</p>
              <p className="truncate text-[11px] text-muted-foreground" title={email}>{email}</p>
            </div>
          </div>

          {/* Plan + credits pills (non-button, black glyphs) */}
          <div className="flex items-center gap-2 px-1.5 pb-2 pt-1">
            <span className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card text-[12px] font-semibold text-foreground">
              <BillingSeal className="size-3.5 text-foreground" />
              {billingLoading ? "Plan" : planLabel}
            </span>
            <span className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card text-[12px] font-semibold text-foreground">
              <CreditStack className="size-3.5 text-foreground" />
              {typeof credits === "number" ? credits.toLocaleString() : billingLoading ? "…" : "—"}
              <span className="text-[11px] font-medium text-muted-foreground">credits</span>
            </span>
          </div>

          <DropdownMenuItem asChild className="h-9 gap-2 rounded-lg px-2 text-[13px] font-medium">
            <Link href="/dashboard/settings?section=billing" onClick={() => setOpen(false)}>
              <CreditCard className="size-4 text-[var(--workspace-primary)]" />
              Manage billing
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Workspaces */}
          <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Workspaces
          </p>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="ws-list"
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
                  workspaces.map((workspace) => {
                    const isActive = activeWorkspace?.id === workspace.id
                    return (
                      <DropdownMenuItem
                        key={workspace.id}
                        onSelect={() => void selectWorkspace(workspace)}
                        className={cn(
                          "flex h-9 items-center gap-2 rounded-lg px-2 text-[13px] font-medium",
                          isActive && "bg-[var(--workspace-blue-soft)]",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate text-foreground">{workspace.name}</span>
                        <RoleBadge role={workspace.role} />
                        <CheckCircle2 className={cn("size-4 shrink-0 text-[var(--workspace-success)]", isActive ? "opacity-100" : "opacity-0")} />
                      </DropdownMenuItem>
                    )
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <DropdownMenuItem
            className="h-9 gap-2 rounded-lg px-2 text-[13px] font-medium"
            onSelect={(event) => {
              event.preventDefault()
              setOpen(false)
              setDialogOpen(true)
            }}
          >
            <span className="inline-flex size-5 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
              <Plus className="size-3" />
            </span>
            Create workspace
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Help */}
          <DropdownMenuItem asChild className="h-9 gap-2 rounded-lg px-2 text-[13px] font-medium">
            <Link href="/dashboard/guide" onClick={() => setOpen(false)}>
              <BookOpen className="size-4 text-[var(--workspace-success)]" />
              Docs &amp; guides
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="h-9 gap-2 rounded-lg px-2 text-[13px] font-medium">
            <Link href="/contact" onClick={() => setOpen(false)}>
              <LifeBuoy className="size-4 text-[var(--workspace-warning)]" />
              Contact support
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            className="h-9 gap-2 rounded-lg px-2 text-[13px] font-medium"
            onSelect={(event) => {
              event.preventDefault()
              setOpen(false)
              void handleSignOut()
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="gap-5 rounded-md border-[var(--workspace-border)] bg-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New workspace</DialogTitle>
            <DialogDescription>Create a separate workspace for another team or workflow.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="account-workspace-name" className="text-sm font-medium text-foreground">
              Workspace name
            </label>
            <Input
              id="account-workspace-name"
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => void handleCreateWorkspace()}
              disabled={creating || workspaceName.trim().length < 2}
              className="!border-[var(--workspace-primary)] !bg-[var(--workspace-primary)] !text-white hover:!border-[var(--workspace-primary-hover)] hover:!bg-[var(--workspace-primary-hover)] hover:!text-white"
            >
              {creating ? "Adding…" : "Add workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

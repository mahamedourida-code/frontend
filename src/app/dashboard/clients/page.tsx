"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight, Building2, Loader2, Plus, Trash2 } from "lucide-react"

import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog"
import { InlineAction } from "@/components/ui/inline-action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { companyApi, type CompanySummary } from "@/lib/api-client"

export default function ClientsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeWorkspace, isLoading: workspaceLoading } = useWorkspaces(user)
  const workspaceId = activeWorkspace?.id

  const [clients, setClients] = useState<CompanySummary[]>([])
  const [loading, setLoading] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<CompanySummary | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Fclients")
    }
  }, [authLoading, router, user])

  const loadClients = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    try {
      const response = await companyApi.list(workspaceId)
      setClients(response.companies)
    } catch {
      toast.error("Could not load clients.")
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    void loadClients()
  }, [loadClients])

  const createClient = async () => {
    if (!workspaceId || !newName.trim()) return
    setCreating(true)
    try {
      const company = await companyApi.create(workspaceId, { name: newName.trim() })
      setClients(current => [company, ...current])
      setNewName("")
      setAddOpen(false)
      toast.success(`${company.name} added.`)
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not add this client.")
    } finally {
      setCreating(false)
    }
  }

  const deleteClient = async () => {
    if (!deleteTarget) return
    await companyApi.delete(deleteTarget.id)
    toast.success(`${deleteTarget.name} deleted.`)
    setDeleteTarget(null)
    await loadClients()
  }

  if (authLoading || workspaceLoading || !user) {
    return <DashboardRouteLoader label="Loading clients" />
  }

  return (
    <DashboardShell activeItem="companies" title="Clients" user={user} showBack={false}>
      <div className="max-w-4xl space-y-6">
        <PageHeader
          title="Clients"
          description="Each client is its own workspace, inbox, and accounting connection."
          actions={
            <Button variant="glossy" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Add client
            </Button>
          }
        />

        <WorkspaceSection
          icon={<Building2 />}
          title="Clients"
          actions={
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--workspace-soft)] px-2 text-[13px] font-semibold tabular-nums text-foreground">
              {clients.length}
            </span>
          }
          contentClassName="p-0"
        >
          {loading ? (
            <EmptyState compact icon={<Loader2 className="h-5 w-5 animate-spin" />} title="Loading clients" />
          ) : clients.length === 0 ? (
            <EmptyState
              icon={<Building2 />}
              eyebrow="Clients"
              title="No clients yet"
              description="Add your first client to start collecting their documents."
              action={
                <Button variant="surface" size="sm" onClick={() => setAddOpen(true)}>
                  <Plus className="size-4" />
                  Add client
                </Button>
              }
            />
          ) : (
            <Table className="ax-table">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4">Client</TableHead>
                  <TableHead className="px-4">Accounting</TableHead>
                  <TableHead className="w-px px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map(client => (
                  <TableRow
                    key={client.id}
                    className="ax-interactive cursor-pointer bg-card hover:bg-[var(--workspace-row-hover)]"
                    onClick={() => router.push(`/dashboard/companies/${client.id}`)}
                  >
                    <TableCell className="px-4 py-3">
                      <Link
                        href={`/dashboard/companies/${client.id}`}
                        className="flex items-center gap-3 font-medium text-[var(--workspace-blue)]"
                        onClick={event => event.stopPropagation()}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-[var(--workspace-muted)]">
                          <Building2 className="size-4" />
                        </span>
                        <span className="truncate">{client.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge tone={client.accounting_connected ? "success" : "neutral"}>
                        {client.accounting_connected
                          ? client.accounting_company_name || "Connected"
                          : "Not connected"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/dashboard/companies/${client.id}`}
                              onClick={event => event.stopPropagation()}
                              aria-label={`Open ${client.name}`}
                              className="ax-interactive inline-flex size-8 items-center justify-center rounded-md text-[var(--workspace-blue)] hover:bg-[var(--workspace-blue-soft)]"
                            >
                              <ArrowRight className="size-4" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>Open</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={event => {
                                event.stopPropagation()
                                setDeleteTarget(client)
                              }}
                              aria-label={`Delete ${client.name}`}
                              className="ax-interactive inline-flex size-8 items-center justify-center rounded-md text-[var(--workspace-danger)] hover:bg-red-50"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </WorkspaceSection>
      </div>

      {/* Add client */}
      <Dialog open={addOpen} onOpenChange={open => { if (!creating) setAddOpen(open) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add a client</DialogTitle>
            <DialogDescription className="text-foreground">
              Name this client. You can connect QuickBooks or Xero next.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={event => setNewName(event.target.value)}
            placeholder="Client name"
            autoFocus
            disabled={creating}
            onKeyDown={event => {
              if (event.key === "Enter") void createClient()
            }}
          />
          <DialogFooter className="items-center gap-4">
            <InlineAction onClick={() => setAddOpen(false)} disabled={creating}>
              Cancel
            </InlineAction>
            <Button
              variant="glossy"
              size="sm"
              onClick={() => void createClient()}
              disabled={creating || !newName.trim()}
            >
              {creating ? "Adding…" : "Add client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete client */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={open => { if (!open) setDeleteTarget(null) }}
        title="Delete client"
        description={
          <>
            This removes <span className="font-bold">{deleteTarget?.name}</span> as a client label. Existing documents and bills are kept but detached. This
            cannot be undone.
          </>
        }
        confirmText={deleteTarget?.name}
        confirmLabel="Delete client"
        onConfirm={deleteClient}
      />
    </DashboardShell>
  )
}

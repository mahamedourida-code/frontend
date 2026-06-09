"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Building2, Loader2, Plus } from "lucide-react"

import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { SettingRow } from "@/components/dashboard/SettingRow"
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog"
import { InlineAction } from "@/components/ui/inline-action"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
      <div className="max-w-4xl space-y-5">
        <PageHeader
          title="Clients"
          description="Each client is a company workspace — its own inbox, review board, draft bills, and accounting connection."
          actions={
            <Button variant="glossy" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Add client
            </Button>
          }
        />

        <Card className="ax-workspace-panel rounded-md !shadow-none">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-4">
                <EmptyState compact icon={<Loader2 className="h-5 w-5 animate-spin" />} title="Loading clients" />
              </div>
            ) : clients.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  icon={<Building2 />}
                  eyebrow="Clients"
                  title="No clients yet"
                  description="Add your first client to start collecting and reviewing their documents."
                  action={
                    <Button variant="surface" size="sm" onClick={() => setAddOpen(true)}>
                      <Plus className="size-4" />
                      Add client
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-border px-5">
                {clients.map(client => (
                  <SettingRow
                    key={client.id}
                    label={client.name}
                    value={
                      client.accounting_connected
                        ? `Connected${client.accounting_company_name ? ` to ${client.accounting_company_name}` : ""}`
                        : "No accounting connection"
                    }
                  >
                    <InlineAction asChild>
                      <Link href={`/dashboard/companies/${client.id}`}>Open</Link>
                    </InlineAction>
                    <InlineAction tone="danger" onClick={() => setDeleteTarget(client)}>
                      Delete
                    </InlineAction>
                  </SettingRow>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add client */}
      <Dialog open={addOpen} onOpenChange={open => { if (!creating) setAddOpen(open) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add a client</DialogTitle>
            <DialogDescription className="text-foreground">
              Give this client a name. You can connect their accounting software and collect documents next.
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
            This permanently removes <span className="font-bold">{deleteTarget?.name}</span> and its documents. This
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

"use client"

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { toast } from "sonner"
import { ArrowRight, BookCheck, Building2, Link2, Plus, ReceiptText, Trash2 } from "lucide-react"

import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { SkeletonTable } from "@/components/dashboard/SkeletonTable"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { companyApi, type CompanySummary } from "@/lib/api-client"
import { cn } from "@/lib/utils"

const CARD_DEF_SHADOW =
  "shadow-[0_1px_2px_0_rgba(16,24,40,0.04),0_1px_3px_0_rgba(16,24,40,0.06)]"

function StatCard({
  label,
  value,
  icon: Icon,
  attention = false,
}: {
  label: string
  value: number
  icon: ComponentType<{ className?: string }>
  attention?: boolean
}) {
  const needsAttention = attention && value > 0
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", CARD_DEF_SHADOW)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">{label}</p>
        {attention ? (
          <StatusBadge tone={needsAttention ? "warning" : "success"}>
            {needsAttention ? "Review" : "Clear"}
          </StatusBadge>
        ) : (
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--workspace-primary)_10%,transparent)] text-[var(--workspace-primary)]">
            <Icon className="size-[18px]" />
          </span>
        )}
      </div>
      <p className={cn("mt-3 text-2xl font-semibold tabular-nums text-foreground sm:text-3xl", needsAttention && "text-[var(--text-attention)]")}>
        {value}
      </p>
    </div>
  )
}

export default function ClientsPage() {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const { user, loading: authLoading } = useAuth()
  const { activeWorkspace, isLoading: workspaceLoading } = useWorkspaces(user)
  const workspaceId = activeWorkspace?.id

  const [clients, setClients] = useState<CompanySummary[]>([])
  const [loading, setLoading] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<CompanySummary | null>(null)

  const stats = useMemo(() => {
    const connected = clients.filter(client => client.accounting_connected).length
    const needsReview = clients.reduce((sum, client) => sum + (client.document_counts?.needs_review ?? 0), 0)
    const draftBills = clients.reduce((sum, client) => sum + (client.bills ?? 0), 0)
    return { connected, needsReview, draftBills }
  }, [clients])

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
          actions={
            <Button variant="glossy" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Add client
            </Button>
          }
        />

        {!loading && clients.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {([
              { label: "Clients", value: clients.length, icon: Building2 },
              { label: "Connected", value: stats.connected, icon: Link2 },
              { label: "To review", value: stats.needsReview, icon: BookCheck, attention: true },
              { label: "Draft bills", value: stats.draftBills, icon: ReceiptText },
            ] as Array<{ label: string; value: number; icon: ComponentType<{ className?: string }>; attention?: boolean }>).map((card, index) => (
              <motion.div
                key={card.label}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
              >
                <StatCard label={card.label} value={card.value} icon={card.icon} attention={card.attention} />
              </motion.div>
            ))}
          </div>
        ) : null}

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
            <SkeletonTable
              rows={5}
              columns={[
                { header: "Client", shape: "entity", className: "px-4" },
                { header: "Accounting", shape: "badge", className: "px-4" },
                { header: "Actions", shape: "actions", align: "right", className: "w-px px-4" },
              ]}
            />
          ) : clients.length === 0 ? (
            <EmptyState
              art="bot-add-client"
              icon={<Building2 />}
              title="No clients yet"
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
                {clients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    data-slot="table-row"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.03, 0.3) }}
                    className="ax-interactive cursor-pointer border-b border-[var(--workspace-border)] bg-card transition-colors hover:bg-[var(--workspace-row-hover)]"
                    onClick={() => router.push(`/dashboard/companies/${client.id}`)}
                  >
                    <TableCell className="px-4 py-3">
                      <Link
                        href={`/dashboard/companies/${client.id}`}
                        className="group flex items-center gap-3"
                        onClick={event => event.stopPropagation()}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-[var(--workspace-muted)]">
                          <Building2 className="size-4" />
                        </span>
                        <span className="ax-data-entity truncate group-hover:text-[var(--workspace-blue)]">{client.name}</span>
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
                  </motion.tr>
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
            Removes <span className="font-bold">{deleteTarget?.name}</span> as a client label. Existing documents and bills stay.
          </>
        }
        confirmText={deleteTarget?.name}
        confirmLabel="Delete client"
        onConfirm={deleteClient}
      />
    </DashboardShell>
  )
}

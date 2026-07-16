"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookCheck,
  Building2,
  ChevronRight,
  FileText,
  Landmark,
  Pencil,
  ReceiptText,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

import { DashboardShell } from "@/components/DashboardShell"
import { companyFromResponse, type CompanySummary } from "@/components/dashboard/companies/company-types"
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog"
import { DangerZone } from "@/components/dashboard/DangerZone"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { WorkspaceActivityIndicator } from "@/components/dashboard/WorkspaceActivityIndicator"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InlineAction } from "@/components/ui/inline-action"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { companyApi } from "@/lib/api-client"

type CompanyHubProps = {
  companyId: string
}

type CompanyApi = {
  get: (companyId: string) => Promise<unknown>
}

type QueueRowProps = {
  icon: ReactNode
  label: string
  value: string
  detail: string
  href: string
  status: ReactNode
}

function formatDate(value: string | null) {
  if (!value) return "No intake yet"
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
  } catch {
    return "Date unavailable"
  }
}

function providerLabel(company: CompanySummary) {
  return company.accountingProvider === "xero" ? "Xero" : "QuickBooks Online"
}

function documentTotal(company: CompanySummary) {
  return company.purchases + company.receipts + company.bankStatements + company.other
}

function QueueRow({ icon, label, value, detail, href, status }: QueueRowProps) {
  return (
    <Link
      href={href}
      aria-label={`${label}: ${value}`}
      className="ax-interactive group grid gap-3 border-b border-[var(--workspace-border)] px-4 py-3.5 outline-none last:border-b-0 hover:bg-[var(--workspace-row-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--workspace-primary)]/25 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--workspace-soft)] text-[var(--workspace-ink)] [&_svg]:size-4">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-semibold text-foreground">{label}</p>
            {status}
          </div>
          <p className="mt-0.5 truncate text-[11px] text-[var(--workspace-muted)]">{detail}</p>
        </div>
      </div>
      <p className="text-[13px] font-semibold tabular-nums text-foreground sm:min-w-24 sm:text-right">{value}</p>
      <ChevronRight className="size-4 text-[var(--workspace-muted)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--workspace-ink)]" />
    </Link>
  )
}

function ClientWorkQueue({ company, companyId }: { company: CompanySummary; companyId: string }) {
  const encodedId = encodeURIComponent(companyId)
  const documents = documentTotal(company)
  const booksConnected = company.accountingConnected

  return (
    <WorkspaceSection
      title="Client work queue"
      icon={<Building2 />}
      contentClassName="p-0"
      compact
    >
      <QueueRow
        icon={<BookCheck />}
        label="Review exceptions"
        value={`${company.needsReview} flagged`}
        detail={company.needsReview ? "Correct flagged fields before publishing." : "No documents need attention."}
        href={`/dashboard/client?company_id=${encodedId}`}
        status={<StatusBadge tone={company.needsReview ? "warning" : "info"} size="sm">{company.needsReview ? "Action needed" : "Clear"}</StatusBadge>}
      />
      <QueueRow
        icon={<ReceiptText />}
        label="Draft bills"
        value={`${company.bills} drafts`}
        detail="Reviewed bills waiting to publish."
        href={`/dashboard/accounts-payable?company_id=${encodedId}`}
        status={<StatusBadge tone={company.bills ? "info" : "neutral"} size="sm">{company.bills ? "Pending" : "None"}</StatusBadge>}
      />
      <QueueRow
        icon={<FileText />}
        label="Document intake"
        value={`${documents} filed`}
        detail={`Last intake ${formatDate(company.lastUploadAt)}.`}
        href={`/dashboard/inbox?company_id=${encodedId}`}
        status={<StatusBadge tone={documents ? "info" : "neutral"} size="sm">{documents ? "Active" : "Empty"}</StatusBadge>}
      />
      <QueueRow
        icon={<Landmark />}
        label="Accounting destination"
        value={booksConnected ? providerLabel(company) : "Not connected"}
        detail={booksConnected ? (company.accountingCompanyName || "Ready for reviewed draft bills.") : "Connect QuickBooks Online or Xero before publishing."}
        href={`/dashboard/integrations?company_id=${encodedId}`}
        status={<StatusBadge tone={booksConnected ? "info" : "neutral"} size="sm">{booksConnected ? "Connected" : "Setup"}</StatusBadge>}
      />
    </WorkspaceSection>
  )
}

export function CompanyHub({ companyId }: CompanyHubProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeWorkspace, isLoading: workspaceLoading } = useWorkspaces(user)
  const canManage = !workspaceLoading && activeWorkspace?.role === "owner"
  const [company, setCompany] = useState<CompanySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState("")
  const [renaming, setRenaming] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/sign-in?next=${encodeURIComponent(`/dashboard/companies/${companyId}`)}`)
    }
  }, [authLoading, companyId, router, user])

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setLoadError(false)
    try {
      const response = await (companyApi as CompanyApi).get(companyId)
      setCompany(companyFromResponse(response))
    } catch {
      setCompany(null)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [companyId, user])

  useEffect(() => {
    void load()
  }, [load])

  const openRename = () => {
    setNameDraft(company?.name || "")
    setRenameOpen(true)
  }

  const submitRename = async () => {
    const cleaned = nameDraft.trim()
    if (!cleaned || cleaned === company?.name) {
      setRenameOpen(false)
      return
    }
    setRenaming(true)
    try {
      await companyApi.update(companyId, { name: cleaned })
      toast.success("Client renamed.")
      setRenameOpen(false)
      await load()
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not rename this client.")
    } finally {
      setRenaming(false)
    }
  }

  const deleteClient = async () => {
    await companyApi.delete(companyId)
    toast.success("Client deleted.")
    router.push("/dashboard")
  }

  if (authLoading || !user) {
    return <DashboardRouteLoader label="Loading client" />
  }

  return (
    <DashboardShell activeItem="companies" title={company?.name || "Client"} user={user}>
      <div className="max-w-4xl">
        <PageHeader
          title={company?.name || "Client"}
          description={company ? `Last intake ${formatDate(company.lastUploadAt)}` : undefined}
          breadcrumb={(
            <Link href="/dashboard" className="font-semibold text-foreground hover:underline">
              Clients
            </Link>
          )}
          compact
          actions={company && canManage ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={openRename}
              aria-label="Rename client"
              title="Rename client"
              className="size-8"
            >
              <Pencil className="size-4" />
            </Button>
          ) : undefined}
        />

        {loading ? (
          <WorkspaceActivityIndicator title="Opening client queue" scope="page" />
        ) : loadError || !company ? (
          <div className="rounded-lg border border-[var(--workspace-border)] bg-card">
            <EmptyState
              art="bot-error"
              icon={<Building2 />}
              title="Client unavailable"
              description="The client record could not be loaded."
              action={(
                <InlineAction tone="warning" onClick={() => void load()}>
                  <RefreshCw className="size-4" />
                  Try again
                </InlineAction>
              )}
              compact
            />
          </div>
        ) : (
          <div className="space-y-5">
            <ClientWorkQueue company={company} companyId={companyId} />
            {canManage ? (
              <DangerZone title="Delete client" description="Detach this client label while keeping its documents and bills.">
                <Button variant="dangerOutline" size="sm" onClick={() => setDeleteOpen(true)}>
                  Delete client
                </Button>
              </DangerZone>
            ) : null}
          </div>
        )}
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Rename client</DialogTitle>
          </DialogHeader>
          <Input
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            autoFocus
            placeholder="Client name"
            onKeyDown={(event) => {
              if (event.key === "Enter") void submitRename()
            }}
          />
          <DialogFooter className="items-center gap-4">
            <InlineAction onClick={() => setRenameOpen(false)} disabled={renaming}>Cancel</InlineAction>
            <Button variant="glossy" size="sm" onClick={() => void submitRename()} disabled={renaming}>
              {renaming ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {company ? (
        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete client"
          description="This removes the client label. Documents and bills stay but are detached from it."
          confirmText={company.name}
          confirmLabel="Delete client"
          onConfirm={deleteClient}
        />
      ) : null}
    </DashboardShell>
  )
}

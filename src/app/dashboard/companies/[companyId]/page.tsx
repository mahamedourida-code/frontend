"use client"

import { useCallback, useEffect, useState, type ComponentType } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowRight,
  BookCheck,
  Building2,
  FileText,
  Inbox,
  Loader2,
  PlugZap,
  ReceiptText,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

import { DashboardShell } from "@/components/DashboardShell"
import { companyFromResponse, type CompanySummary } from "@/components/dashboard/companies/company-types"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { DangerZone } from "@/components/dashboard/DangerZone"
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
import { companyApi } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type CompanyApiShape = {
  get: (companyId: string) => Promise<unknown>
}

type WorkflowTab = {
  id: "inbox" | "review" | "bills" | "accounting"
  label: string
  description: string
  action: string
  href: (companyId: string) => string
  icon: ComponentType<{ className?: string }>
}

const WORKFLOW_TABS: WorkflowTab[] = [
  {
    id: "inbox",
    label: "Inbox",
    description: "Open submissions and collected source documents for this company.",
    action: "Open company inbox",
    href: (companyId) => `/dashboard/inbox?company_id=${encodeURIComponent(companyId)}`,
    icon: Inbox,
  },
  {
    id: "review",
    label: "Review",
    description: "Work through mixed batches and correct the exceptions before export.",
    action: "Open review board",
    href: (companyId) => `/dashboard/client?company_id=${encodeURIComponent(companyId)}`,
    icon: BookCheck,
  },
  {
    id: "bills",
    label: "Draft bills",
    description: "Code reviewed supplier invoices, then publish them to your accounting software.",
    action: "Open draft bills",
    href: (companyId) => `/dashboard/accounts-payable?company_id=${encodeURIComponent(companyId)}`,
    icon: ReceiptText,
  },
  {
    id: "accounting",
    label: "Accounting",
    description: "Manage the accounting connection used for this company's reviewed drafts.",
    action: "Open accounting setup",
    href: (companyId) => `/dashboard/integrations?company_id=${encodeURIComponent(companyId)}`,
    icon: PlugZap,
  },
]

const workspacePrimaryButton =
  "border-2 !border-[var(--brand-brown-fg)] !bg-[var(--brand-brown-fg)] !text-white !shadow-none hover:!border-black hover:!bg-white hover:!text-black hover:underline hover:decoration-1 hover:underline-offset-4"

function formatDate(value: string | null) {
  if (!value) return "No uploads yet"
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
  } catch {
    return "-"
  }
}

function SummaryItem({
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
  return (
    <div className="flex min-w-0 items-center gap-3 bg-card px-4 py-3">
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground", attention && value && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200")}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
        <p className={cn("mt-0.5 text-lg font-bold tabular-nums text-foreground", attention && value && "text-amber-700 dark:text-amber-300")}>{value}</p>
      </div>
    </div>
  )
}

function WorkflowRow({ tab, companyId }: { tab: WorkflowTab; companyId: string }) {
  const Icon = tab.icon
  return (
    <div className="flex flex-col items-start gap-3 px-4 py-4 sm:flex-row sm:items-center">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-bold text-foreground">{tab.label}</h2>
        <p className="mt-0.5 max-w-2xl text-sm text-foreground/70">{tab.description}</p>
      </div>
      <InlineAction asChild>
        <Link href={tab.href(companyId)}>
          {tab.action}
          <ArrowRight className="size-4" />
        </Link>
      </InlineAction>
    </div>
  )
}

export default function CompanyPage() {
  const params = useParams<{ companyId: string }>()
  const companyId = params.companyId
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [company, setCompany] = useState<CompanySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState("")
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
      const response = await (companyApi as CompanyApiShape).get(companyId)
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
    setRenameValue(company?.name || "")
    setRenameOpen(true)
  }

  const renameClient = async () => {
    const name = renameValue.trim()
    if (!name || name === company?.name) {
      setRenameOpen(false)
      return
    }
    setRenaming(true)
    try {
      await companyApi.update(companyId, { name })
      setCompany(current => (current ? { ...current, name } : current))
      setRenameOpen(false)
      toast.success("Client renamed.")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not rename this client.")
    } finally {
      setRenaming(false)
    }
  }

  const deleteClient = async () => {
    await companyApi.delete(companyId)
    toast.success(`${company?.name || "Client"} deleted.`)
    router.push("/dashboard/clients")
  }

  if (authLoading || !user) {
    return <DashboardRouteLoader label="Loading company" />
  }

  return (
    <DashboardShell activeItem="companies" title={company?.name || "Company"} user={user}>
      <PageHeader
        title={company?.name || "Company"}
        description={company ? `Last upload: ${formatDate(company.lastUploadAt)}` : "Company workspace"}
        breadcrumb={
          <Link href="/dashboard/clients" className="font-semibold text-foreground hover:underline">
            Clients
          </Link>
        }
        actions={
          company ? (
            <InlineAction onClick={openRename}>Rename</InlineAction>
          ) : undefined
        }
      />

      {loading ? (
        <Card className="rounded-xl">
          <CardContent className="flex items-center gap-2 p-6 text-sm font-medium text-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading company workspace...
          </CardContent>
        </Card>
      ) : loadError || !company ? (
        <Card className="rounded-xl">
          <EmptyState
            icon={<Building2 />}
            title="Company unavailable"
            description="This company could not be loaded."
            action={
              <Button variant="surface" size="sm" onClick={() => void load()}>
                <RefreshCw className="size-4" />
                Try again
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-xl border border-border bg-border">
            <div className="grid gap-px sm:grid-cols-2 xl:grid-cols-4">
              <SummaryItem label="Purchases" value={company.purchases} icon={FileText} />
              <SummaryItem label="Receipts" value={company.receipts} icon={ReceiptText} />
              <SummaryItem label="Needs review" value={company.needsReview} icon={BookCheck} attention />
              <SummaryItem label="Draft bills" value={company.bills} icon={ReceiptText} />
            </div>
          </div>

          <Card className="divide-y divide-border rounded-xl py-0 shadow-none">
            {WORKFLOW_TABS.map((tab) => (
              <WorkflowRow key={tab.id} tab={tab} companyId={companyId} />
            ))}
          </Card>

          <DangerZone description="Deleting a client removes the company and all of its documents. This cannot be undone.">
            <Button variant="dangerOutline" size="sm" onClick={() => setDeleteOpen(true)}>
              Delete client
            </Button>
          </DangerZone>
        </div>
      )}

      {/* Rename client */}
      <Dialog open={renameOpen} onOpenChange={open => { if (!renaming) setRenameOpen(open) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Rename client</DialogTitle>
            <DialogDescription className="text-foreground">
              Update the name shown across this client&apos;s inbox, review board, and draft bills.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={event => setRenameValue(event.target.value)}
            placeholder="Client name"
            autoFocus
            disabled={renaming}
            onKeyDown={event => {
              if (event.key === "Enter") void renameClient()
            }}
          />
          <DialogFooter>
            <Button variant="surface" size="sm" onClick={() => setRenameOpen(false)} disabled={renaming}>
              Cancel
            </Button>
            <Button
              variant="glossy"
              size="sm"
              onClick={() => void renameClient()}
              disabled={renaming || !renameValue.trim()}
              className={workspacePrimaryButton}
            >
              {renaming ? "Saving…" : "Save name"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete client */}
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete client"
        description={
          <>
            This permanently removes <span className="font-bold">{company?.name}</span> and all of its documents. This
            cannot be undone.
          </>
        }
        confirmText={company?.name}
        confirmLabel="Delete client"
        onConfirm={deleteClient}
      />
    </DashboardShell>
  )
}

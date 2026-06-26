"use client"

import { useCallback, useEffect, useState, type ComponentType } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  BookCheck,
  Building2,
  FileText,
  Inbox,
  PlugZap,
  ReceiptText,
  RefreshCw,
  Upload,
} from "lucide-react"
import { toast } from "sonner"

import { DashboardShell } from "@/components/DashboardShell"
import { companyFromResponse, type CompanySummary } from "@/components/dashboard/companies/company-types"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { DangerZone } from "@/components/dashboard/DangerZone"
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { WorkspaceActivityIndicator } from "@/components/dashboard/WorkspaceActivityIndicator"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { companyApi } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type CompanyHubProps = {
  companyId: string
}

type CompanyApi = {
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
    description: "Open submissions and collected source documents for this client.",
    action: "Open client inbox",
    href: (companyId) => `/dashboard/inbox?company_id=${encodeURIComponent(companyId)}`,
    icon: Inbox,
  },
  {
    id: "review",
    label: "Review",
    description: "Work through mixed stacks and correct the exceptions before export.",
    action: "Open review board",
    href: (companyId) => `/dashboard/client?company_id=${encodeURIComponent(companyId)}`,
    icon: BookCheck,
  },
  {
    id: "bills",
    label: "Draft bills",
    description: "Code reviewed supplier invoices, then publish them to QuickBooks or Xero.",
    action: "Open draft bills",
    href: (companyId) => `/dashboard/accounts-payable?company_id=${encodeURIComponent(companyId)}`,
    icon: ReceiptText,
  },
  {
    id: "accounting",
    label: "Accounting",
    description: "Manage the accounting connection used for this client's reviewed drafts.",
    action: "Open accounting setup",
    href: (companyId) => `/dashboard/integrations?company_id=${encodeURIComponent(companyId)}`,
    icon: PlugZap,
  },
]

function formatDate(value: string | null) {
  if (!value) return "No uploads yet"
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
  } catch {
    return "-"
  }
}

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

function WorkflowRow({ tab, companyId }: { tab: WorkflowTab; companyId: string }) {
  const Icon = tab.icon

  return (
    <div className="flex flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--workspace-primary)_10%,transparent)] text-[var(--workspace-primary)]">
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-bold text-foreground">{tab.label}</h2>
        <p className="mt-0.5 max-w-2xl text-sm text-foreground">{tab.description}</p>
      </div>
      <Button asChild variant="surface" size="sm">
        <Link href={tab.href(companyId)}>
          {tab.action}
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </div>
  )
}

export function CompanyHub({ companyId }: CompanyHubProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const { user, loading: authLoading } = useAuth()
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
    router.push("/dashboard/clients")
  }

  if (authLoading || !user) {
    return <DashboardRouteLoader label="Loading client" />
  }

  return (
    <DashboardShell activeItem="companies" title={company?.name || "Client"} user={user}>
      <PageHeader
        title={company?.name || "Client"}
        description={company ? `Last upload: ${formatDate(company.lastUploadAt)}` : "Client workspace"}
        breadcrumb={
          <Link href="/dashboard/clients" className="font-semibold text-foreground hover:underline">
            Clients
          </Link>
        }
        actions={company ? (
          <>
            <Button
              asChild
              variant="glossy"
              size="sm"
              className="!rounded-lg !border-[var(--btn-primary-bg)] !bg-[var(--btn-primary-bg)] !text-[var(--btn-primary-fg)] !shadow-none hover:!bg-[var(--btn-primary-bg-hover)] hover:!text-[var(--btn-primary-fg-hover)]"
            >
              <Link href={`/dashboard/client?company_id=${encodeURIComponent(companyId)}#upload-files`}>
                <Upload className="size-4" />
                Upload documents
              </Link>
            </Button>
            <InlineAction onClick={openRename}>Rename</InlineAction>
          </>
        ) : undefined}
      />

      {loading ? (
        <WorkspaceActivityIndicator
          title="Opening client workspace"
          detail="Retrieving recent documents, review work, and draft bills."
          scope="page"
        />
      ) : loadError || !company ? (
        <Card className="rounded-xl">
          <EmptyState
            art="bot-error"
            icon={<Building2 />}
            title="Client unavailable"
            description="This client could not be loaded."
            action={
              <InlineAction tone="warning" onClick={() => void load()}>
                <RefreshCw className="size-4" />
                Try again
              </InlineAction>
            }
          />
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {([
              { label: "Purchases", value: company.purchases, icon: FileText },
              { label: "Receipts", value: company.receipts, icon: ReceiptText },
              { label: "Needs review", value: company.needsReview, icon: BookCheck, attention: true },
              { label: "Draft bills", value: company.bills, icon: ReceiptText },
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

          <Card className={cn("divide-y divide-border rounded-xl py-0", CARD_DEF_SHADOW)}>
            {WORKFLOW_TABS.map((tab) => (
              <WorkflowRow key={tab.id} tab={tab} companyId={companyId} />
            ))}
          </Card>

          <DangerZone description="Deleting a client removes it as a label. Its documents and bills are kept but detached.">
            <Button variant="dangerOutline" size="sm" onClick={() => setDeleteOpen(true)}>
              Delete client
            </Button>
          </DangerZone>
        </div>
      )}

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Rename client</DialogTitle>
          </DialogHeader>
          <Input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            autoFocus
            placeholder="Client name"
            onKeyDown={(e) => {
              if (e.key === "Enter") void submitRename()
            }}
          />
          <DialogFooter className="items-center gap-4">
            <InlineAction onClick={() => setRenameOpen(false)} disabled={renaming}>
              Cancel
            </InlineAction>
            <Button variant="glossy" size="sm" onClick={() => void submitRename()} disabled={renaming}>
              {renaming ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {company ? (
        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete client"
          description="This removes the client. Its documents and bills are kept but detached from it."
          confirmText={company.name}
          confirmLabel="Delete client"
          onConfirm={deleteClient}
        />
      ) : null}
    </DashboardShell>
  )
}

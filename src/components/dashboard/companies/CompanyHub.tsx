"use client"

import { useCallback, useEffect, useState, type ComponentType, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import {
  BookCheck,
  Building2,
  FileText,
  Inbox,
  Landmark,
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

type HubAction = {
  id: "inbox" | "review" | "bills" | "books"
  label: string
  href: (companyId: string) => string
  icon: ComponentType<{ className?: string }>
}

const HUB_ACTIONS: HubAction[] = [
  {
    id: "inbox",
    label: "Inbox",
    href: (companyId) => `/dashboard/inbox?company_id=${encodeURIComponent(companyId)}`,
    icon: Inbox,
  },
  {
    id: "review",
    label: "Review",
    href: (companyId) => `/dashboard/client?company_id=${encodeURIComponent(companyId)}`,
    icon: BookCheck,
  },
  {
    id: "bills",
    label: "Bills",
    href: (companyId) => `/dashboard/accounts-payable?company_id=${encodeURIComponent(companyId)}`,
    icon: ReceiptText,
  },
  {
    id: "books",
    label: "Books",
    href: (companyId) => `/dashboard/integrations?company_id=${encodeURIComponent(companyId)}`,
    icon: Landmark,
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

function providerLabel(company: CompanySummary) {
  return company.accountingProvider === "xero" ? "Xero" : "QuickBooks"
}

function documentTotal(company: CompanySummary) {
  return company.purchases + company.receipts + company.bankStatements + company.other
}

function SummaryCell({
  label,
  value,
  icon: Icon,
  badge,
  valueClassName,
}: {
  label: string
  value: number | string
  icon: ComponentType<{ className?: string }>
  badge?: ReactNode
  valueClassName?: string
}) {
  return (
    <div className="min-w-0 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">
          <Icon className="size-3.5 shrink-0 text-black" />
          <span className="truncate">{label}</span>
        </span>
        {badge}
      </div>
      <p
        className={cn(
          "mt-4 truncate text-2xl font-semibold leading-none text-foreground sm:text-[28px]",
          typeof value === "number" && "tabular-nums",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  )
}

function HubActionButton({ action, company, companyId }: { action: HubAction; company: CompanySummary; companyId: string }) {
  const Icon = action.icon
  const isReviewAction = action.id === "review"
  const needsReview = isReviewAction && company.needsReview > 0
  const actionLabel = action.id === "books" && !company.accountingConnected ? "Connect" : action.label

  return (
    <Button asChild variant={needsReview ? "glossy" : "surface"} size="sm" className="h-8 justify-start px-3 text-[12px]">
      <Link href={action.href(companyId)}>
        <Icon className="size-3.5" />
        {actionLabel}
      </Link>
    </Button>
  )
}

function ClientSummaryPanel({ company, companyId }: { company: CompanySummary; companyId: string }) {
  const docsTotal = documentTotal(company)
  const reviewClear = company.needsReview === 0

  return (
    <Card className={cn("overflow-hidden rounded-xl border-[var(--workspace-border)] bg-card py-0", CARD_DEF_SHADOW)}>
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid divide-y divide-[var(--workspace-border)] md:grid-cols-4 md:divide-x md:divide-y-0">
          <SummaryCell
            label="Docs"
            value={docsTotal}
            icon={FileText}
            badge={<StatusBadge tone={docsTotal > 0 ? "info" : "neutral"} size="sm">{docsTotal > 0 ? "Filed" : "Empty"}</StatusBadge>}
          />
          <SummaryCell
            label="Review"
            value={company.needsReview}
            icon={BookCheck}
            badge={<StatusBadge tone={reviewClear ? "success" : "warning"} size="sm">{reviewClear ? "Clear" : "Fix"}</StatusBadge>}
            valueClassName={!reviewClear ? "text-[var(--text-attention)]" : undefined}
          />
          <SummaryCell
            label="Bills"
            value={company.bills}
            icon={ReceiptText}
            badge={<StatusBadge tone={company.bills > 0 ? "processing" : "neutral"} size="sm">{company.bills > 0 ? "Drafts" : "None"}</StatusBadge>}
          />
          <SummaryCell
            label="Books"
            value={company.accountingConnected ? "Live" : "Setup"}
            icon={Landmark}
            badge={<StatusBadge tone={company.accountingConnected ? "success" : "neutral"} size="sm">{providerLabel(company)}</StatusBadge>}
          />
        </div>

        <div className="border-t border-[var(--workspace-border)] bg-[var(--workspace-soft)] p-4 sm:p-5 xl:border-l xl:border-t-0">
          <div className="grid grid-cols-2 gap-2">
            {HUB_ACTIONS.map((action) => (
              <HubActionButton key={action.id} action={action} company={company} companyId={companyId} />
            ))}
          </div>
        </div>
      </div>
    </Card>
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
            >
              <Link href={`/dashboard/client?company_id=${encodeURIComponent(companyId)}#upload-files`}>
                <Upload className="size-4" />
                Upload
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
        <div className="space-y-8">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <ClientSummaryPanel company={company} companyId={companyId} />
          </motion.div>

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

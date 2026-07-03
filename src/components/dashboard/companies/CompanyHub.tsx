"use client"

import { useCallback, useEffect, useState, type ComponentType, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  BookCheck,
  Building2,
  CheckCircle2,
  CircleAlert,
  FileText,
  Inbox,
  Landmark,
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
    description: "Client files and source docs.",
    action: "Open",
    href: (companyId) => `/dashboard/inbox?company_id=${encodeURIComponent(companyId)}`,
    icon: Inbox,
  },
  {
    id: "review",
    label: "Review",
    description: "Fix exceptions before export.",
    action: "Review",
    href: (companyId) => `/dashboard/client?company_id=${encodeURIComponent(companyId)}`,
    icon: BookCheck,
  },
  {
    id: "bills",
    label: "Draft bills",
    description: "AP drafts ready for books.",
    action: "Bills",
    href: (companyId) => `/dashboard/accounts-payable?company_id=${encodeURIComponent(companyId)}`,
    icon: ReceiptText,
  },
  {
    id: "accounting",
    label: "Accounting",
    description: "QuickBooks or Xero link.",
    action: "Manage",
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

type MetricTone = "default" | "attention" | "success" | "finance"

const metricToneClasses: Record<MetricTone, string> = {
  default: "border-[var(--workspace-border)] bg-card",
  attention:
    "border-[color-mix(in_srgb,var(--text-attention)_28%,var(--workspace-border))] bg-[color-mix(in_srgb,var(--text-attention)_5%,white)]",
  success:
    "border-[color-mix(in_srgb,var(--text-success)_24%,var(--workspace-border))] bg-[color-mix(in_srgb,var(--text-success)_5%,white)]",
  finance:
    "border-[color-mix(in_srgb,var(--workspace-blue)_24%,var(--workspace-border))] bg-[color-mix(in_srgb,var(--workspace-blue)_5%,white)]",
}

const metricIconClasses: Record<MetricTone, string> = {
  default: "bg-[var(--workspace-soft)] text-[var(--workspace-muted)]",
  attention: "bg-[color-mix(in_srgb,var(--text-attention)_10%,white)] text-[var(--text-attention)]",
  success: "bg-[color-mix(in_srgb,var(--text-success)_10%,white)] text-[var(--text-success)]",
  finance: "bg-[color-mix(in_srgb,var(--workspace-blue)_10%,white)] text-[var(--workspace-blue)]",
}

function providerLabel(company: CompanySummary) {
  return company.accountingProvider === "xero" ? "Xero" : "QuickBooks"
}

function documentTotal(company: CompanySummary) {
  return company.purchases + company.receipts + company.bankStatements + company.other
}

function countLabel(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`
}

function documentMix(company: CompanySummary) {
  if (documentTotal(company) === 0) return "No source docs"

  const parts = [
    company.purchases ? countLabel(company.purchases, "purchase") : null,
    company.receipts ? countLabel(company.receipts, "receipt") : null,
    company.bankStatements ? countLabel(company.bankStatements, "statement") : null,
    company.other ? countLabel(company.other, "other", "other") : null,
  ].filter(Boolean)

  return parts.join(" / ")
}

function accountingDetail(company: CompanySummary) {
  if (!company.accountingConnected) return `Connect ${providerLabel(company)}`
  return company.accountingCompanyName || `${providerLabel(company)} connected`
}

function MetricCard({
  label,
  value,
  icon: Icon,
  detail,
  badge,
  tone = "default",
}: {
  label: string
  value: number | string
  icon: ComponentType<{ className?: string }>
  detail: string
  badge?: ReactNode
  tone?: MetricTone
}) {
  return (
    <div className={cn("min-h-[148px] rounded-xl border p-4", metricToneClasses[tone])}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg", metricIconClasses[tone])}>
          <Icon className="size-[18px]" />
        </span>
        {badge}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 truncate font-semibold text-foreground",
          typeof value === "number" ? "text-2xl tabular-nums sm:text-3xl" : "text-xl",
          tone === "attention" && "text-[var(--text-attention)]",
          tone === "success" && typeof value === "number" && "text-[var(--text-success)]",
        )}
      >
        {value}
      </p>
      <p className="mt-1 truncate text-[13px] text-foreground">{detail}</p>
    </div>
  )
}

function WorkflowBadge({ tab, company }: { tab: WorkflowTab; company: CompanySummary }) {
  if (tab.id === "review") {
    const hasExceptions = company.needsReview > 0
    return (
      <StatusBadge tone={hasExceptions ? "warning" : "success"} size="sm">
        {hasExceptions ? countLabel(company.needsReview, "fix", "fixes") : "Clear"}
      </StatusBadge>
    )
  }

  if (tab.id === "bills") {
    return (
      <StatusBadge tone={company.bills > 0 ? "processing" : "neutral"} size="sm">
        {company.bills > 0 ? countLabel(company.bills, "draft") : "No drafts"}
      </StatusBadge>
    )
  }

  if (tab.id === "accounting") {
    return (
      <StatusBadge tone={company.accountingConnected ? "success" : "neutral"} size="sm">
        {company.accountingConnected ? providerLabel(company) : "Setup"}
      </StatusBadge>
    )
  }

  return (
    <StatusBadge tone={documentTotal(company) > 0 ? "info" : "neutral"} size="sm">
      {countLabel(documentTotal(company), "doc")}
    </StatusBadge>
  )
}

function WorkflowCard({ tab, company, companyId }: { tab: WorkflowTab; company: CompanySummary; companyId: string }) {
  const Icon = tab.icon
  const needsReview = tab.id === "review" && company.needsReview > 0
  const actionLabel = tab.id === "accounting" && !company.accountingConnected ? "Connect" : tab.action

  return (
    <Card className="group h-full gap-0 rounded-xl border-[var(--workspace-border)] bg-card py-0 transition-colors hover:border-[color-mix(in_srgb,var(--workspace-blue)_34%,var(--workspace-border))]">
      <div className="flex h-full flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-[var(--workspace-ink)] transition-colors group-hover:bg-white">
            <Icon className="size-5" />
          </span>
          <WorkflowBadge tab={tab} company={company} />
        </div>
        <div className="mt-5 min-w-0 flex-1">
          <h2 className="text-base font-semibold text-foreground">{tab.label}</h2>
          <p className="mt-1 text-[13px] text-foreground">{tab.description}</p>
        </div>
        <Button asChild variant={needsReview ? "glossy" : "surface"} size="sm" className="mt-5 w-fit">
          <Link href={tab.href(companyId)}>
            {actionLabel}
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  )
}

function CommandCenter({ company, companyId }: { company: CompanySummary; companyId: string }) {
  const docsTotal = documentTotal(company)
  const reviewClear = company.needsReview === 0
  const ProviderIcon = company.accountingConnected ? CheckCircle2 : CircleAlert
  const nextAction = company.needsReview > 0
    ? {
        label: "Review",
        detail: "Clear exceptions.",
        href: `/dashboard/client?company_id=${encodeURIComponent(companyId)}`,
        icon: BookCheck,
        primary: true,
      }
    : company.bills > 0
      ? {
          label: "Bills",
          detail: "Open AP drafts.",
          href: `/dashboard/accounts-payable?company_id=${encodeURIComponent(companyId)}`,
          icon: ReceiptText,
          primary: false,
        }
      : {
          label: "Upload",
          detail: "Add source docs.",
          href: `/dashboard/client?company_id=${encodeURIComponent(companyId)}#upload-files`,
          icon: Upload,
          primary: true,
        }
  const NextIcon = nextAction.icon

  return (
    <Card className={cn("overflow-hidden rounded-xl border-[var(--workspace-border)] bg-card py-0", CARD_DEF_SHADOW)}>
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-[var(--workspace-ink)]">
                <Building2 className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">Client hub</p>
                  <StatusBadge tone={company.accountingConnected ? "success" : "neutral"} size="sm">
                    {company.accountingConnected ? "Books connected" : "Books pending"}
                  </StatusBadge>
                </div>
                <h2 className="mt-1 truncate text-xl font-semibold text-foreground">{company.name}</h2>
                <p className="mt-1 text-[13px] text-foreground">Docs, review, bills, books.</p>
              </div>
            </div>
            <Button asChild variant={nextAction.primary ? "glossy" : "surface"} size="sm" className="w-fit">
              <Link href={nextAction.href}>
                <NextIcon className="size-4" />
                {nextAction.label}
              </Link>
            </Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Docs"
              value={docsTotal}
              icon={FileText}
              detail={documentMix(company) || "No source docs"}
              badge={<StatusBadge tone={docsTotal > 0 ? "info" : "neutral"} size="sm">{docsTotal > 0 ? "Filed" : "Empty"}</StatusBadge>}
              tone="default"
            />
            <MetricCard
              label="Review"
              value={company.needsReview}
              icon={BookCheck}
              detail={reviewClear ? "No exceptions" : "Exceptions queue"}
              badge={<StatusBadge tone={reviewClear ? "success" : "warning"} size="sm">{reviewClear ? "Clear" : "Fix"}</StatusBadge>}
              tone={reviewClear ? "success" : "attention"}
            />
            <MetricCard
              label="Bills"
              value={company.bills}
              icon={ReceiptText}
              detail="AP drafts"
              badge={<StatusBadge tone={company.bills > 0 ? "processing" : "neutral"} size="sm">{company.bills > 0 ? "Drafts" : "None"}</StatusBadge>}
              tone="finance"
            />
            <MetricCard
              label="Books"
              value={providerLabel(company)}
              icon={Landmark}
              detail={accountingDetail(company)}
              badge={<StatusBadge tone={company.accountingConnected ? "success" : "neutral"} size="sm">{company.accountingConnected ? "Live" : "Setup"}</StatusBadge>}
              tone={company.accountingConnected ? "success" : "default"}
            />
          </div>
        </div>

        <div className="border-t border-[var(--workspace-border)] bg-[var(--workspace-soft)] p-5 lg:border-l lg:border-t-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">Next move</p>
          <div className="mt-3 flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--workspace-ink)]">
              <NextIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground">{nextAction.label}</h3>
              <p className="mt-0.5 text-[13px] text-foreground">{nextAction.detail}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-lg border border-[var(--workspace-border)] bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">Last upload</p>
              <p className="mt-1 truncate text-[13px] font-semibold text-foreground">{formatDate(company.lastUploadAt)}</p>
            </div>
            <div className="rounded-lg border border-[var(--workspace-border)] bg-white p-3">
              <div className="flex items-start gap-2">
                <ProviderIcon className={cn("mt-0.5 size-4 shrink-0", company.accountingConnected ? "text-[var(--text-success)]" : "text-[var(--text-attention)]")} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">Destination</p>
                  <p className="mt-1 truncate text-[13px] font-semibold text-foreground">{accountingDetail(company)}</p>
                </div>
              </div>
            </div>
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
        <div className="space-y-5">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <CommandCenter company={company} companyId={companyId} />
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {WORKFLOW_TABS.map((tab, index) => (
              <motion.div
                key={tab.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: 0.05 + index * 0.05 }}
              >
                <WorkflowCard tab={tab} company={company} companyId={companyId} />
              </motion.div>
            ))}
          </div>

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

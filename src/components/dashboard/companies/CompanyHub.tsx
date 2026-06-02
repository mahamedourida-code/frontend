"use client"

import { useCallback, useEffect, useState, type ComponentType } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BookCheck,
  Building2,
  FileText,
  Inbox,
  Landmark,
  Loader2,
  PlugZap,
  ReceiptText,
  RefreshCw,
  Upload,
} from "lucide-react"

import { DashboardShell } from "@/components/DashboardShell"
import { companyFromResponse, type CompanySummary } from "@/components/dashboard/companies/company-types"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { companyApi } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type CompanyHubProps = {
  companyId: string
}

type CompanyApi = {
  get: (companyId: string) => Promise<unknown>
}

type HubTab = "overview" | "inbox" | "review" | "bills" | "accounting"

type WorkflowTab = {
  id: Exclude<HubTab, "overview">
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
    label: "Bills",
    description: "Check draft bills and move reviewed invoices toward QuickBooks Online.",
    action: "Open company bills",
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

function formatDate(value: string | null) {
  if (!value) return "No uploads yet"
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
  } catch {
    return "-"
  }
}

function MetricCard({
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
    <Card className="gap-0 rounded-xl py-0 shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <span className={cn("flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground", attention && value && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200")}>
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          <p className={cn("mt-1 text-2xl font-bold tabular-nums text-foreground", attention && value && "text-amber-700 dark:text-amber-300")}>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function WorkflowPanel({ tab, companyId }: { tab: WorkflowTab; companyId: string }) {
  const Icon = tab.icon

  return (
    <Card className="rounded-xl">
      <CardContent className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-foreground">{tab.label}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{tab.description}</p>
        </div>
        <Button asChild variant="surface" size="sm">
          <Link href={tab.href(companyId)}>
            {tab.action}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function CompanyHub({ companyId }: CompanyHubProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [company, setCompany] = useState<CompanySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

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

  if (authLoading || !user) {
    return <DashboardRouteLoader label="Loading company" />
  }

  const uploadHref = `/dashboard/client?company_id=${encodeURIComponent(companyId)}#upload-files`

  return (
    <DashboardShell activeItem="companies" title={company?.name || "Company"} user={user}>
      <PageHeader
        title={company?.name || "Company"}
        description={company ? `Last upload: ${formatDate(company.lastUploadAt)}` : "Company workspace"}
        breadcrumb={
          <Link href="/dashboard" className="font-semibold text-muted-foreground hover:text-foreground">
            Companies
          </Link>
        }
        actions={
          <Button asChild variant="glossy" size="sm">
            <Link href={uploadHref}>
              <Upload className="size-4" />
              Upload docs
            </Link>
          </Button>
        }
      />

      {loading ? (
        <Card className="rounded-xl">
          <CardContent className="flex items-center gap-2 p-6 text-sm font-medium text-muted-foreground">
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
        <Tabs defaultValue="overview" className="gap-5">
          <div className="overflow-x-auto pb-1">
            <TabsList className="h-auto min-w-max rounded-full bg-muted/70 p-1">
              <TabsTrigger value="overview" className="rounded-full px-4">Overview</TabsTrigger>
              {WORKFLOW_TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="rounded-full px-4">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Purchases" value={company.purchases} icon={FileText} />
              <MetricCard label="Receipts" value={company.receipts} icon={ReceiptText} />
              <MetricCard label="Needs review" value={company.needsReview} icon={BookCheck} attention />
              <MetricCard label="Bills" value={company.bills} icon={Landmark} />
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {WORKFLOW_TABS.map((tab) => (
                <WorkflowPanel key={tab.id} tab={tab} companyId={companyId} />
              ))}
            </div>
          </TabsContent>

          {WORKFLOW_TABS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <WorkflowPanel tab={tab} companyId={companyId} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </DashboardShell>
  )
}

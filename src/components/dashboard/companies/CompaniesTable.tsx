"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookCheck,
  Building2,
  ChevronRight,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Upload,
} from "lucide-react"

import { AddCompanyDialog } from "@/components/dashboard/companies/AddCompanyDialog"
import { companiesFromResponse, type CompanySummary } from "@/components/dashboard/companies/company-types"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { SegmentedTabs } from "@/components/dashboard/SegmentedTabs"
import { SkeletonTable } from "@/components/dashboard/SkeletonTable"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { InlineAction } from "@/components/ui/inline-action"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { companyApi } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type CompaniesTableProps = {
  workspaceId?: string
  refreshKey?: number
  onCompanyCountChange?: (count: number) => void
  onCompaniesLoaded?: (companies: CompanySummary[]) => void
}

type CompanyApi = {
  list: (workspaceId: string) => Promise<unknown>
}

type QueueFilter = "all" | "review" | "bills" | "unconnected" | "inactive"

function formatDate(value: string | null) {
  if (!value) return "No intake"
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
  } catch {
    return "Unknown"
  }
}

function totalDocuments(company: CompanySummary) {
  return company.purchases + company.receipts + company.bankStatements + company.other
}

function documentBreakdown(company: CompanySummary) {
  return [
    company.purchases ? `${company.purchases} purchases` : null,
    company.receipts ? `${company.receipts} receipts` : null,
    company.bankStatements ? `${company.bankStatements} bank` : null,
    company.other ? `${company.other} other` : null,
  ].filter(Boolean).join(" · ") || "No documents"
}

function QueueCell({ company }: { company: CompanySummary }) {
  if (company.needsReview > 0) {
    return (
      <div className="space-y-1">
        <StatusBadge tone="warning" size="sm">Needs review</StatusBadge>
        <p className="text-[11px] text-[var(--workspace-muted)]">{company.needsReview} flagged {company.needsReview === 1 ? "document" : "documents"}</p>
      </div>
    )
  }

  if (company.bills > 0) {
    return (
      <div className="space-y-1">
        <StatusBadge tone="review" size="sm">Draft bills</StatusBadge>
        <p className="text-[11px] text-[var(--workspace-muted)]">{company.bills} awaiting publish</p>
      </div>
    )
  }

  if (totalDocuments(company) > 0) {
    return <StatusBadge tone="success" size="sm">Queue clear</StatusBadge>
  }

  return <StatusBadge tone="neutral" size="sm">Awaiting intake</StatusBadge>
}

function companyMatchesFilter(company: CompanySummary, filter: QueueFilter) {
  if (filter === "review") return company.needsReview > 0
  if (filter === "bills") return company.bills > 0
  if (filter === "unconnected") return !company.accountingConnected
  if (filter === "inactive") return !company.lastUploadAt || totalDocuments(company) === 0
  return true
}

function companyPriority(company: CompanySummary) {
  if (company.needsReview > 0) return 0
  if (company.bills > 0) return 1
  if (!company.accountingConnected) return 2
  if (!company.lastUploadAt) return 4
  return 3
}

function ActionLink({ company }: { company: CompanySummary }) {
  const encodedId = encodeURIComponent(company.id)
  const action = company.needsReview > 0
    ? { href: `/dashboard/client?company_id=${encodedId}`, label: "Review", icon: BookCheck }
    : company.bills > 0
      ? { href: `/dashboard/accounts-payable?company_id=${encodedId}`, label: "Open bills", icon: ReceiptText }
      : { href: `/dashboard/client?company_id=${encodedId}#upload-files`, label: "Upload", icon: Upload }
  const Icon = action.icon

  return (
    <InlineAction asChild>
      <Link href={action.href} onClick={(event) => event.stopPropagation()}>
        <Icon className="size-3.5" />
        {action.label}
      </Link>
    </InlineAction>
  )
}

export function CompaniesTable({ workspaceId, refreshKey = 0, onCompanyCountChange, onCompaniesLoaded }: CompaniesTableProps) {
  const router = useRouter()
  const [companies, setCompanies] = useState<CompanySummary[]>([])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<QueueFilter>("all")
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!workspaceId) {
      setCompanies([])
      onCompanyCountChange?.(0)
      onCompaniesLoaded?.([])
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError(null)
    try {
      const response = await (companyApi as CompanyApi).list(workspaceId)
      const nextCompanies = companiesFromResponse(response)
      setCompanies(nextCompanies)
      onCompanyCountChange?.(nextCompanies.length)
      onCompaniesLoaded?.(nextCompanies)
    } catch {
      setCompanies([])
      onCompaniesLoaded?.([])
      setLoadError("Client work queues are unavailable right now.")
    } finally {
      setLoading(false)
    }
  }, [onCompaniesLoaded, onCompanyCountChange, workspaceId])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  const visibleCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return companies
      .filter((company) => (
        companyMatchesFilter(company, filter) &&
        (!normalizedQuery || company.name.toLowerCase().includes(normalizedQuery))
      ))
      .sort((left, right) => companyPriority(left) - companyPriority(right))
  }, [companies, filter, query])

  const queueFilters = useMemo(() => ([
    { value: "all", label: "All", count: companies.length },
    { value: "review", label: "Review", count: companies.filter((company) => company.needsReview > 0).length },
    { value: "bills", label: "Draft bills", count: companies.filter((company) => company.bills > 0).length },
    { value: "unconnected", label: "No books", count: companies.filter((company) => !company.accountingConnected).length },
    { value: "inactive", label: "No intake", count: companies.filter((company) => !company.lastUploadAt || totalDocuments(company) === 0).length },
  ]), [companies])

  return (
    <Card id="clients" className="ax-workspace-panel scroll-mt-20 overflow-visible rounded-lg py-0">
      <CardContent className="p-0">
        <div className="sticky top-14 z-20 flex flex-col gap-2 rounded-t-lg border-b border-[var(--workspace-border)] bg-[color-mix(in_srgb,white_94%,transparent)] px-3 py-2.5 backdrop-blur-md xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-black" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a client"
                aria-label="Find a client"
                className="h-8 rounded-full bg-white pl-8 text-[12px]"
              />
            </div>
            <SegmentedTabs
              aria-label="Filter client work queues"
              size="sm"
              value={filter}
              onValueChange={(value) => setFilter(value as QueueFilter)}
              tabs={queueFilters}
            />
          </div>
          <div className="flex items-center justify-end gap-4">
            <InlineAction onClick={() => void load()} disabled={loading} aria-label="Refresh clients">
              <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
              Refresh
            </InlineAction>
            <AddCompanyDialog
              workspaceId={workspaceId}
              onCreated={() => void load()}
              trigger={(
                <Button variant="glossy" size="sm" disabled={!workspaceId}>
                  <Plus className="size-3.5" />
                  Add client
                </Button>
              )}
            />
          </div>
        </div>

        {loadError ? (
          <EmptyState
            art="bot-error"
            icon={<RefreshCw />}
            title="Clients unavailable"
            description={loadError}
            action={(
              <InlineAction onClick={() => void load()} disabled={loading}>
                <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
                Retry
              </InlineAction>
            )}
            className="min-h-48"
            compact
          />
        ) : loading ? (
          <SkeletonTable
            rows={6}
            columns={[
              { header: "Client", shape: "entity", className: "min-w-[220px] px-4" },
              { header: "Next action", shape: "badge", className: "min-w-[150px]" },
              { header: "Documents", shape: "text", className: "min-w-[170px]" },
              { header: "Books", shape: "badge", className: "min-w-[160px]" },
              { header: "Last intake", shape: "text", className: "min-w-[120px]" },
              { header: "Action", shape: "pill", align: "right", className: "px-4" },
            ]}
          />
        ) : visibleCompanies.length === 0 ? (
          query || companies.length > 0 ? (
            <EmptyState
              icon={<Building2 />}
              title="No clients in this view"
              description="Clear the search or switch the queue filter."
              className="min-h-48"
              compact
            />
          ) : (
            <EmptyState
              icon={<Building2 />}
              title="Add the first client"
              description="Keep intake, review exceptions, and draft bills separated by client."
              action={<AddCompanyDialog workspaceId={workspaceId} onCreated={() => void load()} />}
              className="min-h-64"
              compact
            />
          )
        ) : (
          <div className="overflow-x-auto rounded-b-lg">
            <Table className="ax-table min-w-[920px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[220px] px-4">Client</TableHead>
                  <TableHead className="min-w-[150px]">Next action</TableHead>
                  <TableHead className="min-w-[170px]">Documents</TableHead>
                  <TableHead className="min-w-[160px]">Books</TableHead>
                  <TableHead className="min-w-[120px]">Last intake</TableHead>
                  <TableHead className="px-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleCompanies.map((company) => (
                  <TableRow
                    key={company.id}
                    className="ax-interactive cursor-pointer bg-white hover:bg-[var(--workspace-row-hover)]"
                    onClick={() => router.push(`/dashboard/companies/${encodeURIComponent(company.id)}`)}
                  >
                    <TableCell className="px-4 py-3">
                      <Link
                        href={`/dashboard/companies/${encodeURIComponent(company.id)}`}
                        className="group flex items-center gap-3"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-black">
                          <Building2 className="size-4" />
                        </span>
                        <span className="ax-data-entity min-w-0 flex-1 truncate group-hover:text-[var(--workspace-blue)]">{company.name}</span>
                        <ChevronRight className="size-4 shrink-0 text-black" />
                      </Link>
                    </TableCell>
                    <TableCell className="py-3"><QueueCell company={company} /></TableCell>
                    <TableCell className="py-3">
                      <p className="text-[13px] font-semibold tabular-nums text-foreground">{totalDocuments(company)} total</p>
                      <p className="mt-0.5 max-w-[210px] truncate text-[11px] text-[var(--workspace-muted)]" title={documentBreakdown(company)}>{documentBreakdown(company)}</p>
                    </TableCell>
                    <TableCell className="py-3">
                      {company.accountingConnected ? (
                        <div className="space-y-1">
                          <StatusBadge tone="info" size="sm">
                            {company.accountingProvider === "xero" ? "Xero" : "QuickBooks Online"}
                          </StatusBadge>
                          {company.accountingCompanyName ? <p className="max-w-[170px] truncate text-[11px] text-[var(--workspace-muted)]">{company.accountingCompanyName}</p> : null}
                        </div>
                      ) : (
                        <StatusBadge tone="neutral" size="sm">Not connected</StatusBadge>
                      )}
                    </TableCell>
                    <TableCell className="ax-data-date py-3">{formatDate(company.lastUploadAt)}</TableCell>
                    <TableCell className="px-4 py-3 text-right"><ActionLink company={company} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

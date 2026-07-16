"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { BookCheck, Building2, ChevronRight, ReceiptText, RefreshCw, Search, Upload } from "lucide-react"

import { AddCompanyDialog } from "@/components/dashboard/companies/AddCompanyDialog"
import { companiesFromResponse, type CompanySummary } from "@/components/dashboard/companies/company-types"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { SkeletonTable } from "@/components/dashboard/SkeletonTable"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
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
  if (!value) return "Never"
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
  } catch {
    return "-"
  }
}

function CountCell({ value, emphasis = false }: { value: number; emphasis?: boolean }) {
  return (
    <TableCell className={cn("px-4 py-3 text-right tabular-nums", value ? "text-foreground" : "text-foreground/35", emphasis && value && "font-semibold text-[var(--workspace-warning)]")}>
      {value}
    </TableCell>
  )
}

function totalDocuments(company: CompanySummary) {
  return company.purchases + company.receipts + company.bankStatements + company.other
}

function WorkCell({ company }: { company: CompanySummary }) {
  if (company.needsReview > 0) {
    return (
      <TableCell>
        <StatusBadge tone="warning" size="sm">Review</StatusBadge>
      </TableCell>
    )
  }

  if (company.bills > 0) {
    return (
      <TableCell>
        <StatusBadge tone="success" size="sm">Bills</StatusBadge>
      </TableCell>
    )
  }

  if (totalDocuments(company) > 0) {
    return (
      <TableCell>
        <StatusBadge tone="neutral" size="sm">Clear</StatusBadge>
      </TableCell>
    )
  }

  return (
    <TableCell>
      <StatusBadge tone="neutral" size="sm">Empty</StatusBadge>
    </TableCell>
  )
}

function companyMatchesFilter(company: CompanySummary, filter: QueueFilter) {
  if (filter === "review") return company.needsReview > 0
  if (filter === "bills") return company.bills > 0
  if (filter === "unconnected") return !company.accountingConnected
  if (filter === "inactive") return !company.lastUploadAt || totalDocuments(company) === 0
  return true
}

function ActionLink({ company }: { company: CompanySummary }) {
  const encodedId = encodeURIComponent(company.id)
  const action = company.needsReview > 0
    ? { href: `/dashboard/client?company_id=${encodedId}`, label: "Review", icon: BookCheck }
    : company.bills > 0
      ? { href: `/dashboard/accounts-payable?company_id=${encodedId}`, label: "Bills", icon: ReceiptText }
      : { href: `/dashboard/client?company_id=${encodedId}#upload-files`, label: "Upload", icon: Upload }
  const Icon = action.icon

  return (
    <InlineAction asChild>
      <Link
        href={action.href}
        onClick={(event) => event.stopPropagation()}
      >
        <Icon className="size-3.5" />
        {action.label}
      </Link>
    </InlineAction>
  )
}

export function CompaniesTable({ workspaceId, refreshKey = 0, onCompanyCountChange, onCompaniesLoaded }: CompaniesTableProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
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
      setLoadError("Clients are unavailable right now.")
    } finally {
      setLoading(false)
    }
  }, [onCompaniesLoaded, onCompanyCountChange, workspaceId])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  const visibleCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return companies.filter((company) => (
      companyMatchesFilter(company, filter) &&
      (!normalizedQuery || company.name.toLowerCase().includes(normalizedQuery))
    ))
  }, [companies, filter, query])

  const queueFilters = useMemo(() => ([
    { value: "all" as const, label: "All", count: companies.length },
    { value: "review" as const, label: "Review", count: companies.filter((company) => company.needsReview > 0).length },
    { value: "bills" as const, label: "Bills", count: companies.filter((company) => company.bills > 0).length },
    { value: "unconnected" as const, label: "No sync", count: companies.filter((company) => !company.accountingConnected).length },
    { value: "inactive" as const, label: "Quiet", count: companies.filter((company) => !company.lastUploadAt || totalDocuments(company) === 0).length },
  ]), [companies])

  return (
    <Card id="clients" className="ax-workspace-panel scroll-mt-20 overflow-hidden rounded-xl py-0">
      <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-b border-[var(--workspace-border)] bg-white px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search clients"
                aria-label="Search clients"
                className="h-9 rounded-md bg-white pl-9"
              />
            </div>
            <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-0.5">
              {queueFilters.map((item) => {
                const active = filter === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={cn(
                      "ax-interactive inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold",
                      active
                        ? "border-[var(--workspace-primary)] bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)]"
                        : "border-[var(--workspace-border)] bg-white text-[var(--workspace-muted)] hover:text-[var(--workspace-ink)]",
                    )}
                  >
                    <span>{item.label}</span>
                    <span className="font-mono tabular-nums opacity-70">{item.count}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <InlineAction onClick={() => void load()} disabled={loading} aria-label="Refresh clients">
              <RefreshCw className="size-3.5" />
              Refresh
            </InlineAction>
            <AddCompanyDialog workspaceId={workspaceId} onCreated={() => void load()} />
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
            className="overflow-x-auto"
            tableClassName="min-w-[1240px]"
            columns={[
              { header: "Client", shape: "entity", className: "min-w-[230px] px-4" },
              { header: "Accounting", shape: "badge" },
              { header: "Work", shape: "badge" },
              { header: "Purchases", shape: "text", width: 28, align: "right" },
              { header: "Receipts", shape: "text", width: 28, align: "right" },
              { header: "Bank", shape: "text", width: 28, align: "right" },
              { header: "Other", shape: "text", width: 28, align: "right" },
              { header: "Review", shape: "text", width: 28, align: "right" },
              { header: "Bills", shape: "text", width: 28, align: "right" },
              { header: "Last", shape: "text", width: 90, className: "min-w-[130px] px-4" },
              { header: "Action", shape: "pill", width: 78, align: "right", className: "px-4" },
            ]}
          />
        ) : visibleCompanies.length === 0 ? (
          query ? (
          <EmptyState
            icon={<Building2 />}
            title="No matching clients"
            description="Try a different search term."
              className="min-h-48"
              compact
            />
          ) : (
            <EmptyState
              icon={<Building2 />}
              title="Add a client"
              description="Keep each client's stacks separate."
              steps={[
                "Add the client name.",
                "Upload their first mixed document stack.",
                "Review exceptions before export or publishing.",
              ]}
              action={<AddCompanyDialog workspaceId={workspaceId} onCreated={() => void load()} />}
              className="min-h-[340px]"
              compact
            />
          )
        ) : (
          <div className="overflow-x-auto">
            <Table className="ax-table min-w-[1240px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[230px] px-4">Client</TableHead>
                  <TableHead>Accounting</TableHead>
                  <TableHead>Work</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead className="text-right">Receipts</TableHead>
                  <TableHead className="text-right">Bank</TableHead>
                  <TableHead className="text-right">Other</TableHead>
                  <TableHead className="text-right">Review</TableHead>
                  <TableHead className="text-right">Bills</TableHead>
                  <TableHead className="min-w-[130px] px-4">Last</TableHead>
                  <TableHead className="px-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleCompanies.map((company, index) => (
                  <motion.tr
                    key={company.id}
                    data-slot="table-row"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.03, 0.3) }}
                    className="ax-interactive cursor-pointer border-b border-[var(--workspace-border)] bg-white transition-colors hover:bg-[var(--workspace-row-hover)]"
                    onClick={() => router.push(`/dashboard/companies/${encodeURIComponent(company.id)}`)}
                  >
                    <TableCell className="px-4">
                      <Link
                        href={`/dashboard/companies/${encodeURIComponent(company.id)}`}
                        className="group flex items-center gap-3"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-black">
                          <Building2 className="size-4 text-black" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="ax-data-entity block truncate group-hover:text-[var(--workspace-blue)]">{company.name}</span>
                        </span>
                        <ChevronRight className="ms-auto size-4 shrink-0 text-black" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      {company.accountingConnected ? (
                        <div className="flex flex-col gap-1">
                          <StatusBadge tone="info" className="w-fit">
                            {company.accountingProvider === "xero" ? "Xero" : "QuickBooks"}
                          </StatusBadge>
                          {company.accountingCompanyName ? (
                            <span className="ax-data-entity max-w-[160px] truncate text-xs">{company.accountingCompanyName}</span>
                          ) : null}
                        </div>
                      ) : (
                        <StatusBadge tone="neutral">Not connected</StatusBadge>
                      )}
                    </TableCell>
                    <WorkCell company={company} />
                    <CountCell value={company.purchases} />
                    <CountCell value={company.receipts} />
                    <CountCell value={company.bankStatements} />
                    <CountCell value={company.other} />
                    <CountCell value={company.needsReview} emphasis />
                    <CountCell value={company.bills} />
                    <TableCell className="ax-data-date px-4">{formatDate(company.lastUploadAt)}</TableCell>
                    <TableCell className="px-4 text-right">
                      <ActionLink company={company} />
                    </TableCell>
                  </motion.tr>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

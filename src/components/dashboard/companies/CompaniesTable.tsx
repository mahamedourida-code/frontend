"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { Building2, ChevronRight, RefreshCw, Search, Upload } from "lucide-react"

import { AddCompanyDialog } from "@/components/dashboard/companies/AddCompanyDialog"
import { companiesFromResponse, type CompanySummary } from "@/components/dashboard/companies/company-types"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { WorkspaceActivityIndicator } from "@/components/dashboard/WorkspaceActivityIndicator"
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

export function CompaniesTable({ workspaceId, refreshKey = 0, onCompanyCountChange, onCompaniesLoaded }: CompaniesTableProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [companies, setCompanies] = useState<CompanySummary[]>([])
  const [query, setQuery] = useState("")
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
    if (!normalizedQuery) return companies
    return companies.filter((company) => company.name.toLowerCase().includes(normalizedQuery))
  }, [companies, query])

  return (
    <Card id="clients" className="ax-workspace-panel scroll-mt-20 overflow-hidden rounded-xl py-0">
      <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-b border-[var(--workspace-border)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search clients"
              aria-label="Search clients"
              className="h-9 rounded-md bg-white pl-9"
            />
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
          <WorkspaceActivityIndicator
            title="Refreshing clients"
            detail="Checking client activity, review work, and draft bill counts."
            className="m-4 w-auto"
          />
        ) : visibleCompanies.length === 0 ? (
          query ? (
            <EmptyState
              art="bot-search-empty"
              icon={<Building2 />}
              title="No matching clients"
              description="Try a different search term."
              className="min-h-48"
              compact
            />
          ) : (
            <EmptyState
              art="bot-add-client"
              icon={<Building2 />}
              title="Add a client"
              action={<AddCompanyDialog workspaceId={workspaceId} onCreated={() => void load()} />}
              className="min-h-[340px]"
              compact
            />
          )
        ) : (
          <div className="overflow-x-auto">
            <Table className="ax-table min-w-[1180px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[230px] px-4">Client</TableHead>
                  <TableHead>Accounting</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead className="text-right">Receipts</TableHead>
                  <TableHead className="text-right">Bank statements</TableHead>
                  <TableHead className="text-right">Other</TableHead>
                  <TableHead className="text-right">Needs review</TableHead>
                  <TableHead className="text-right">Draft bills</TableHead>
                  <TableHead className="min-w-[130px] px-4">Last upload</TableHead>
                  <TableHead className="px-4 text-right">Upload</TableHead>
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
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-[var(--workspace-muted)]">
                          <Building2 className="size-4" />
                        </span>
                        <span className="ax-data-entity truncate group-hover:text-[var(--workspace-blue)]">{company.name}</span>
                        <ChevronRight className="ms-auto size-4 shrink-0 text-muted-foreground" />
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
                    <CountCell value={company.purchases} />
                    <CountCell value={company.receipts} />
                    <CountCell value={company.bankStatements} />
                    <CountCell value={company.other} />
                    <CountCell value={company.needsReview} emphasis />
                    <CountCell value={company.bills} />
                    <TableCell className="ax-data-date px-4">{formatDate(company.lastUploadAt)}</TableCell>
                    <TableCell className="px-4 text-right">
                      <InlineAction asChild>
                        <Link
                          href={`/dashboard/client?company_id=${encodeURIComponent(company.id)}#upload-files`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Upload className="size-3.5" />
                          Upload
                        </Link>
                      </InlineAction>
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

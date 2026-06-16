"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, ChevronRight, RefreshCw, Search, Upload } from "lucide-react"

import { AddCompanyDialog } from "@/components/dashboard/companies/AddCompanyDialog"
import { companiesFromResponse, type CompanySummary } from "@/components/dashboard/companies/company-types"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { SkeletonTableRow } from "@/components/dashboard/SkeletonCard"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
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
    <TableCell className={cn("px-4 py-3 text-right tabular-nums", value ? "text-foreground" : "text-muted-foreground", emphasis && value && "font-semibold text-[var(--workspace-warning)]")}>
      {value}
    </TableCell>
  )
}

export function CompaniesTable({ workspaceId }: CompaniesTableProps) {
  const router = useRouter()
  const [companies, setCompanies] = useState<CompanySummary[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!workspaceId) {
      setCompanies([])
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError(null)
    try {
      const response = await (companyApi as CompanyApi).list(workspaceId)
      setCompanies(companiesFromResponse(response))
    } catch {
      setCompanies([])
      setLoadError("Clients are unavailable right now.")
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    void load()
  }, [load])

  const visibleCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return companies
    return companies.filter((company) => company.name.toLowerCase().includes(normalizedQuery))
  }, [companies, query])

  return (
    <Card className="ax-workspace-panel overflow-hidden rounded-md py-0">
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
              <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
              Refresh
            </InlineAction>
            <AddCompanyDialog workspaceId={workspaceId} onCreated={() => void load()} />
          </div>
        </div>

        {loadError ? (
          <div className="border-b border-[var(--workspace-border)] bg-amber-50 px-4 py-3 text-sm font-normal text-amber-900">
            {loadError}
          </div>
        ) : null}

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
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => <SkeletonTableRow key={`company-skel-${index}`} columns={10} />)
              ) : visibleCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-48">
                    <EmptyState
                      icon={<Building2 />}
                      title={query ? "No matching clients" : "No clients yet"}
                      description={query ? "Try a different search term." : "Add a client to give each batch a clear home."}
                      compact
                    />
                  </TableCell>
                </TableRow>
              ) : (
                visibleCompanies.map((company) => (
                  <TableRow
                    key={company.id}
                    className="ax-interactive cursor-pointer bg-white hover:bg-[var(--workspace-row-hover)]"
                    onClick={() => router.push(`/dashboard/companies/${encodeURIComponent(company.id)}`)}
                  >
                    <TableCell className="px-4">
                      <Link
                        href={`/dashboard/companies/${encodeURIComponent(company.id)}`}
                        className="flex items-center gap-3 font-normal text-[var(--workspace-blue)]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-[var(--workspace-muted)]">
                          <Building2 className="size-4" />
                        </span>
                        <span className="truncate">{company.name}</span>
                        <ChevronRight className="ms-auto size-4 shrink-0 text-muted-foreground" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      {company.accountingConnected ? (
                        <div>
                          <span className="inline-flex rounded-md border border-blue-200 bg-white px-2 py-0.5 text-xs font-medium text-[var(--workspace-primary)]">
                            {company.accountingProvider === "xero" ? "Xero" : "QuickBooks"}
                          </span>
                          {company.accountingCompanyName ? (
                            <p className="mt-1 max-w-[150px] truncate text-xs text-muted-foreground">{company.accountingCompanyName}</p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not connected</span>
                      )}
                    </TableCell>
                    <CountCell value={company.purchases} />
                    <CountCell value={company.receipts} />
                    <CountCell value={company.bankStatements} />
                    <CountCell value={company.other} />
                    <CountCell value={company.needsReview} emphasis />
                    <CountCell value={company.bills} />
                    <TableCell className="px-4 text-muted-foreground">{formatDate(company.lastUploadAt)}</TableCell>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

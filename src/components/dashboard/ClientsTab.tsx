"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ChevronRight, Clock, RefreshCw, Users } from "lucide-react"

import { EmptyState } from "@/components/dashboard/EmptyState"
import { SkeletonTableRow } from "@/components/dashboard/SkeletonCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { clientIntakeApi, type ClientAnalyticsRow } from "@/lib/api-client"
import { cn } from "@/lib/utils"

const LATE_THRESHOLDS = [7, 14, 30]

function relativeDate(value: string | null) {
  if (!value) return "Never"
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
  } catch {
    return "—"
  }
}

function turnaroundLabel(hours: number | null) {
  if (hours === null || hours === undefined) return "—"
  if (hours < 1) return "< 1h"
  if (hours < 24) return `${Math.round(hours)}h`
  return `${(hours / 24).toFixed(1)}d`
}

export function ClientsTab({ workspaceId, compact = false }: { workspaceId?: string; compact?: boolean }) {
  const router = useRouter()
  const [clients, setClients] = useState<ClientAnalyticsRow[]>([])
  const [loading, setLoading] = useState(true)
  const [lateDays, setLateDays] = useState(14)

  const load = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const response = await clientIntakeApi.analytics(workspaceId, lateDays)
      setClients(response.clients)
    } catch {
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [workspaceId, lateDays])

  useEffect(() => {
    void load()
  }, [load])

  const lateCount = clients.filter((c) => c.is_late).length
  const visibleClients = compact ? clients.slice(0, 5) : clients

  return (
    <Card className="overflow-hidden rounded-lg">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Clients</span>
            {lateCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                <AlertTriangle className="size-3" />
                {lateCount} need follow-up
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Late after</span>
            <div className="inline-flex rounded-full border border-border bg-muted/40 p-0.5">
              {LATE_THRESHOLDS.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setLateDays(days)}
                  className={cn(
                    "ax-interactive rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                    lateDays === days
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {days}d
                </button>
              ))}
            </div>
            <Button variant="surface" size="sm" onClick={() => void load()} disabled={loading} className="h-8" aria-label="Refresh clients">
              <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Docs this month</TableHead>
              <TableHead className="text-right">Total docs</TableHead>
              <TableHead className="text-right">Avg turnaround</TableHead>
              <TableHead>Last submission</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <SkeletonTableRow key={`c-skel-${index}`} columns={6} />)
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32">
                  <EmptyState
                    icon={<Users />}
                    title="No clients yet"
                    description="Create a client upload link in the Inbox. Each link becomes a tracked client here."
                    compact
                  />
                </TableCell>
              </TableRow>
            ) : (
              visibleClients.map((client) => (
                <TableRow
                  key={client.link_id}
                  className="ax-interactive cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                  onClick={() => router.push(`/history?client=${encodeURIComponent(client.link_id)}&clientName=${encodeURIComponent(client.name)}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{client.name}</span>
                      {client.is_late ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                          <Clock className="size-2.5" />
                          Late
                        </span>
                      ) : client.never_submitted ? (
                        <span className="rounded-full border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          Awaiting first upload
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{client.documents_this_month}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{client.total_documents}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{turnaroundLabel(client.avg_turnaround_hours)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {relativeDate(client.last_submission_at)}
                    {client.days_since_last !== null && client.days_since_last > 0 ? (
                      <span className="ml-1 text-xs text-muted-foreground/70">({client.days_since_last}d ago)</span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="size-4 text-muted-foreground" />
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

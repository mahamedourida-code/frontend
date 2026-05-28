"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Database } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Button } from "@/components/ui/button"
import { MotionButton } from "@/components/ui/motion-button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { cn } from "@/lib/utils"
import {
  quickBooksApi,
  type QuickBooksConnectionStatus,
  type QuickBooksReferenceItem,
} from "@/lib/api-client"

const emptyConnection: QuickBooksConnectionStatus = {
  connected: false,
  status: "disconnected",
  reference_counts: {},
}

const referenceGroups: Array<{
  key: QuickBooksReferenceItem["resource_type"]
  label: string
}> = [
  { key: "vendor", label: "Vendors" },
  { key: "account", label: "Accounts / categories" },
  { key: "tax_code", label: "Tax references" },
]

function formatSynced(value?: string | null) {
  if (!value) return "Not synced"
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true })
  } catch {
    return "Not synced"
  }
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<DashboardRouteLoader label="Loading integrations" />}>
      <IntegrationsContent />
    </Suspense>
  )
}

function IntegrationsContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)
  const isOwner = !activeWorkspace || activeWorkspace.role === "owner"
  const returnHandled = useRef(false)
  const [connection, setConnection] = useState<QuickBooksConnectionStatus>(emptyConnection)
  const [references, setReferences] = useState<QuickBooksReferenceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<"connect" | "sync" | "disconnect" | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Fintegrations")
    }
  }, [authLoading, router, user])

  const loadStatus = useCallback(async () => {
    const status = await quickBooksApi.status()
    setConnection(status)
    if (status.connected && status.last_synced_at) {
      const data = await quickBooksApi.references()
      setReferences(data.items)
    } else {
      setReferences([])
    }
    return status
  }, [])

  useEffect(() => {
    if (!user) return
    let mounted = true
    setLoading(true)
    loadStatus()
      .catch(() => {
        if (mounted) toast.error("Could not load integrations.")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [loadStatus, user?.id])

  useEffect(() => {
    if (!user || returnHandled.current) return
    const result = params.get("quickbooks")
    if (!result) return
    returnHandled.current = true
    if (result === "connected") {
      setBusy("sync")
      quickBooksApi.sync()
        .then(async () => {
          await loadStatus()
          toast.success("QuickBooks connected.")
        })
        .catch(() => {
          void loadStatus()
          toast.success("QuickBooks connected. Sync reference lists when ready.")
        })
        .finally(() => setBusy(null))
      return
    }
    toast.error(result === "cancelled" ? "QuickBooks connection was cancelled." : "QuickBooks connection failed.")
  }, [loadStatus, params, user])

  const groupedReferences = useMemo(() => Object.fromEntries(
    referenceGroups.map(group => [
      group.key,
      references.filter(item => item.resource_type === group.key).slice(0, 6),
    ]),
  ) as Record<QuickBooksReferenceItem["resource_type"], QuickBooksReferenceItem[]>, [references])

  const connect = async () => {
    setBusy("connect")
    try {
      const response = await quickBooksApi.connect()
      window.location.assign(response.authorization_url)
    } catch {
      setBusy(null)
      toast.error("QuickBooks connection is not available.")
    }
  }

  const sync = async () => {
    setBusy("sync")
    try {
      await quickBooksApi.sync()
      await loadStatus()
      toast.success("QuickBooks lists refreshed.")
    } catch {
      toast.error("Could not refresh QuickBooks lists.")
    } finally {
      setBusy(null)
    }
  }

  const disconnect = async () => {
    if (!window.confirm("Disconnect QuickBooks from this workspace?")) return
    setBusy("disconnect")
    try {
      const next = await quickBooksApi.disconnect()
      setConnection(next)
      setReferences([])
      toast.success("QuickBooks disconnected.")
    } catch {
      toast.error("Could not disconnect QuickBooks.")
    } finally {
      setBusy(null)
    }
  }

  if (authLoading || !user) {
    return <DashboardRouteLoader label="Loading integrations" />
  }

  return (
    <DashboardShell activeItem="integrations" title="Integrations" user={user} showBack={false}>
      <div className="max-w-5xl space-y-5">
        <PageHeader
          title="Integrations"
          description="Connect AxLiner to QuickBooks Online to publish reviewed invoices and receipts"
        />

        {!isOwner && (
          <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">You have read-only access.</span>
            {" "}Ask the workspace owner to manage this connection.
          </div>
        )}

        <Card className={cn("transition-colors", connection.connected && "border-emerald-200 dark:border-emerald-800")}>
          <CardContent className="p-5">
            {connection.connected ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      QB
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold text-foreground">
                          {connection.company_name || "Connected company"}
                        </span>
                        <StatusBadge tone="success">Connected</StatusBadge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">Realm {connection.realm_id}</p>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button variant="surface" onClick={() => void sync()} disabled={Boolean(busy)}>
                        <img src="/site-icons/io/database.svg" className="h-4 w-4" alt="" />
                        {busy === "sync" ? "Syncing..." : "Refresh lists"}
                      </Button>
                      <Button variant="destructive" onClick={() => void disconnect()} disabled={Boolean(busy)}>
                        {busy === "disconnect" ? "Disconnecting..." : "Disconnect"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last sync</p>
                    <p className="mt-1.5 text-sm font-medium text-foreground">{formatSynced(connection.last_synced_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Available references</p>
                    <p className="mt-1.5 text-sm font-medium text-foreground">
                      {(connection.reference_counts.vendor || 0) + (connection.reference_counts.account || 0) + (connection.reference_counts.tax_code || 0)} records
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">About</p>
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                      Only reviewed items published from Accounts Payable create unpaid QuickBooks Bills.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-sm font-bold text-muted-foreground">
                  QB
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-base font-semibold text-foreground">QuickBooks Online</span>
                    <StatusBadge tone="neutral">Not connected</StatusBadge>
                  </div>
                  <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
                    Import vendors, accounts, and tax references for invoice coding. Only reviewed items that you publish from Accounts Payable create unpaid QuickBooks Bills.
                  </p>
                </div>
                {isOwner && (
                  <MotionButton variant="glossy" className="mx-auto w-full max-w-xs" onClick={() => void connect()} disabled={Boolean(busy) || loading}>
                    {busy === "connect" ? "Connecting..." : "Connect QuickBooks"}
                  </MotionButton>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {connection.connected && (
          <div className="grid gap-4 lg:grid-cols-3">
            {referenceGroups.map(group => (
              <Card key={group.key}>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
                    <span className="text-xs text-muted-foreground">{connection.reference_counts[group.key] || 0}</span>
                  </div>
                  {groupedReferences[group.key].length ? (
                    <div className="space-y-0.5">
                      {groupedReferences[group.key].map(item => (
                        <div key={item.external_id} className="ax-interactive flex items-center justify-between rounded-md px-2 py-2 text-sm odd:bg-muted/30 hover:bg-accent/50">
                          <span className="min-w-0 truncate text-foreground">{item.display_name}</span>
                          {!item.active && <span className="ms-2 text-xs text-muted-foreground">Inactive</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Database />}
                      title="No reference data cached"
                      description={isOwner ? "Click Refresh QuickBooks lists to load vendors, accounts, and tax codes" : "Reference data will appear here once the workspace owner syncs QuickBooks"}
                      action={isOwner ? (
                        <Button variant="surface" size="sm" onClick={() => void sync()} disabled={Boolean(busy)}>
                          <img src="/site-icons/io/database.svg" className="h-4 w-4" alt="" />
                          Refresh
                        </Button>
                      ) : undefined}
                      compact
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import {
  quickBooksApi,
  type QuickBooksConnectionStatus,
  type QuickBooksReferenceItem,
} from "@/lib/api-client"
import { cn } from "@/lib/utils"

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

function formatDate(value?: string | null) {
  if (!value) return "Not synced"
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
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
        <div>
          <h1 className="text-xl font-semibold text-foreground">Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect an accounting workspace after your document review is ready.
          </p>
        </div>

        <Card className="gap-0 py-0">
          <CardContent className="px-0">
            <div className="flex flex-col gap-5 border-b border-border px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-foreground">QuickBooks Online</span>
                  <span className={cn(
                    "rounded-md border px-2 py-0.5 text-xs font-medium",
                    connection.connected
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                      : "border-border bg-muted text-muted-foreground",
                  )}>
                    {connection.connected ? "Connected" : "Not connected"}
                  </span>
                </div>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                  Import vendors, accounts, and tax references for later invoice coding. AxLiner does not create or publish QuickBooks bills from this connection.
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {connection.connected ? (
                  <>
                    <Button variant="outline" onClick={() => void sync()} disabled={Boolean(busy)}>
                      {busy === "sync" ? "Syncing..." : "Refresh lists"}
                    </Button>
                    <Button variant="outline" onClick={() => void disconnect()} disabled={Boolean(busy)}>
                      {busy === "disconnect" ? "Disconnecting..." : "Disconnect"}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => void connect()} disabled={Boolean(busy) || loading}>
                    {busy === "connect" ? "Connecting..." : "Connect QuickBooks"}
                  </Button>
                )}
              </div>
            </div>

            {connection.connected && (
              <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="px-5 py-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Company</p>
                  <p className="mt-2 truncate text-sm font-medium text-foreground">{connection.company_name || "Connected company"}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">ID {connection.realm_id}</p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Last sync</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{formatDate(connection.last_synced_at)}</p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Available references</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {(connection.reference_counts.vendor || 0) + (connection.reference_counts.account || 0) + (connection.reference_counts.tax_code || 0)} records
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {connection.connected && (
          <div className="grid gap-4 lg:grid-cols-3">
            {referenceGroups.map(group => (
              <Card key={group.key} className="gap-0 py-0">
                <CardContent className="px-0">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
                    <span className="text-xs text-muted-foreground">{connection.reference_counts[group.key] || 0}</span>
                  </div>
                  <div className="min-h-40 p-2">
                    {groupedReferences[group.key].length ? groupedReferences[group.key].map(item => (
                      <div key={item.external_id} className="flex items-center justify-between rounded-md px-2 py-2 text-sm">
                        <span className="min-w-0 truncate text-foreground">{item.display_name}</span>
                        {!item.active && <span className="ms-2 text-xs text-muted-foreground">Inactive</span>}
                      </div>
                    )) : (
                      <p className="px-2 py-4 text-sm text-muted-foreground">Refresh lists to load records.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Button } from "@/components/ui/button"
import { clayButton } from "@/lib/clay-button"
import {
  accountingDestinationApi,
  quickBooksApi,
  xeroApi,
  type AccountingDestination,
  type QuickBooksConnectionStatus,
} from "@/lib/api-client"
import { cn } from "@/lib/utils"

const emptyConnection: QuickBooksConnectionStatus = {
  connected: false,
  status: "disconnected",
  reference_counts: {},
}

function formatSynced(value?: string | null) {
  if (!value) return "Not synced yet"
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
  } catch {
    return "Not synced yet"
  }
}

type Provider = "quickbooks" | "xero"
type Action = `${Provider}:${"connect" | "sync" | "disconnect"}` | null

export function AccountingConnectionsSection({
  workspaceId,
  isOwner,
}: {
  workspaceId?: string
  isOwner: boolean
}) {
  const params = useSearchParams()
  const callbackHandled = useRef(false)
  const [quickbooks, setQuickbooks] = useState<QuickBooksConnectionStatus>(emptyConnection)
  const [xero, setXero] = useState<QuickBooksConnectionStatus>(emptyConnection)
  const [destination, setDestination] = useState<AccountingDestination>("quickbooks")
  const [destinationBusy, setDestinationBusy] = useState(false)
  const [action, setAction] = useState<Action>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [quickbooksStatus, xeroStatus, currentDestination] = await Promise.all([
        quickBooksApi.status(),
        xeroApi.status(workspaceId).catch(() => emptyConnection),
        accountingDestinationApi.get(workspaceId).catch(() => "quickbooks" as AccountingDestination),
      ])
      setQuickbooks(quickbooksStatus)
      setXero(xeroStatus)
      setDestination(currentDestination)
    } catch {
      toast.error("Could not load accounting connections.")
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (callbackHandled.current) return
    const quickbooksResult = params.get("quickbooks")
    const xeroResult = params.get("xero")
    if (!quickbooksResult && !xeroResult) return
    callbackHandled.current = true

    if (quickbooksResult === "connected") {
      setAction("quickbooks:sync")
      quickBooksApi.sync()
        .then(() => load())
        .then(() => toast.success("QuickBooks connected."))
        .catch(() => {
          void load()
          toast.success("QuickBooks connected. Refresh lists when ready.")
        })
        .finally(() => setAction(null))
      return
    }

    if (xeroResult === "connected") {
      setAction("xero:sync")
      xeroApi.sync(workspaceId)
        .then(async status => {
          setXero(status)
          setDestination(await accountingDestinationApi.set("xero", workspaceId))
          toast.success("Xero connected and set as the accounting destination.")
        })
        .catch(() => {
          void load()
          toast.success("Xero connected. Refresh lists when ready.")
        })
        .finally(() => setAction(null))
      return
    }

    const result = quickbooksResult || xeroResult
    toast.error(result === "cancelled" ? "Connection was cancelled." : "Accounting connection failed.")
  }, [load, params, workspaceId])

  const connect = async (provider: Provider) => {
    setAction(`${provider}:connect`)
    try {
      const response = provider === "quickbooks"
        ? await quickBooksApi.connect()
        : await xeroApi.connect(workspaceId)
      window.location.assign(response.authorization_url)
    } catch {
      setAction(null)
      toast.error(`${provider === "quickbooks" ? "QuickBooks" : "Xero"} connection is not available.`)
    }
  }

  const sync = async (provider: Provider) => {
    setAction(`${provider}:sync`)
    try {
      const status = provider === "quickbooks"
        ? await quickBooksApi.sync()
        : await xeroApi.sync(workspaceId)
      if (provider === "quickbooks") setQuickbooks(status)
      else setXero(status)
      toast.success(`${provider === "quickbooks" ? "QuickBooks" : "Xero"} lists refreshed.`)
    } catch {
      toast.error("Could not refresh accounting lists.")
    } finally {
      setAction(null)
    }
  }

  const disconnect = async (provider: Provider) => {
    const label = provider === "quickbooks" ? "QuickBooks" : "Xero"
    if (!window.confirm(`Disconnect ${label} from this workspace?`)) return
    setAction(`${provider}:disconnect`)
    try {
      const status = provider === "quickbooks"
        ? await quickBooksApi.disconnect()
        : await xeroApi.disconnect()
      if (provider === "quickbooks") setQuickbooks(status)
      else setXero(status)
      toast.success(`${label} disconnected.`)
    } catch {
      toast.error(`Could not disconnect ${label}.`)
    } finally {
      setAction(null)
    }
  }

  const selectDestination = async (next: AccountingDestination) => {
    if (next === destination) return
    setDestinationBusy(true)
    try {
      setDestination(await accountingDestinationApi.set(next, workspaceId))
      toast.success("Accounting destination updated.")
    } catch {
      toast.error("Could not change the accounting destination.")
    } finally {
      setDestinationBusy(false)
    }
  }

  const connections: Array<{ provider: Provider; label: string; connection: QuickBooksConnectionStatus }> = [
    { provider: "quickbooks", label: "QuickBooks Online", connection: quickbooks },
    { provider: "xero", label: "Xero", connection: xero },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Accounting connections</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sync accounting lists and choose where reviewed draft bills are published.
        </p>
      </div>

      {!isOwner ? (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Ask the workspace owner to manage accounting connections.
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Accounting destination</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Sets the coding fields used for reviewed bills.</p>
          </div>
          <div className="inline-flex rounded-full border border-border bg-muted/40 p-0.5">
            {(["quickbooks", "xero"] as AccountingDestination[]).map(option => (
              <button
                key={option}
                type="button"
                disabled={destinationBusy}
                onClick={() => void selectDestination(option)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  destination === option ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option === "quickbooks" ? "QuickBooks" : "Xero"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {connections.map(({ provider, label, connection }, index) => {
          const providerBusy = action?.startsWith(`${provider}:`)
          const recordCount = Object.values(connection.reference_counts || {}).reduce((total, count) => total + Number(count || 0), 0)
          return (
            <div key={provider} className={cn("px-5 py-4", index > 0 && "border-t border-border")}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">{label}</h3>
                    <StatusBadge tone={connection.connected ? "success" : "neutral"}>
                      {connection.connected ? "Connected" : "Not connected"}
                    </StatusBadge>
                    {destination === provider ? <StatusBadge tone="info">Destination</StatusBadge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {connection.connected
                      ? `${recordCount} synced references · Last sync ${formatSynced(connection.last_synced_at)}`
                      : provider === "quickbooks"
                        ? "Publish reviewed draft bills to QuickBooks Online."
                        : "Publish reviewed draft bills to Xero."}
                  </p>
                </div>

                {isOwner ? (
                  <div className="flex flex-wrap gap-2">
                    {connection.connected ? (
                      <>
                        <Button variant="surface" size="sm" onClick={() => void sync(provider)} disabled={providerBusy || loading}>
                          <RefreshCw className={cn("size-4", action === `${provider}:sync` && "animate-spin")} />
                          Refresh lists
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => void disconnect(provider)} disabled={providerBusy}>
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant={provider === "quickbooks" ? "glossy" : "surface"}
                        size="sm"
                        className={provider === "xero" ? clayButton : undefined}
                        onClick={() => void connect(provider)}
                        disabled={providerBusy || loading}
                      >
                        {action === `${provider}:connect` ? "Connecting..." : `Connect ${label}`}
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-sm text-muted-foreground">
        AxLiner only publishes reviewed draft bills. It does not approve or pay bills.
      </p>
    </div>
  )
}

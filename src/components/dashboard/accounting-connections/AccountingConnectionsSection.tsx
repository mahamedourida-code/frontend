"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Button } from "@/components/ui/button"
import { quickBooksApi, type QuickBooksConnectionStatus } from "@/lib/api-client"
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

type Action = "connect" | "sync" | "disconnect" | null

export function AccountingConnectionsSection({ isOwner }: { isOwner: boolean }) {
  const params = useSearchParams()
  const callbackHandled = useRef(false)
  const [quickbooks, setQuickbooks] = useState<QuickBooksConnectionStatus>(emptyConnection)
  const [action, setAction] = useState<Action>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setQuickbooks(await quickBooksApi.status())
    } catch {
      toast.error("Could not load accounting connections.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (callbackHandled.current) return
    const quickbooksResult = params.get("quickbooks")
    if (!quickbooksResult) return
    callbackHandled.current = true

    if (quickbooksResult === "connected") {
      setAction("sync")
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

    toast.error(quickbooksResult === "cancelled" ? "Connection was cancelled." : "Accounting connection failed.")
  }, [load, params])

  const connect = async () => {
    setAction("connect")
    try {
      const response = await quickBooksApi.connect()
      window.location.assign(response.authorization_url)
    } catch {
      setAction(null)
      toast.error("QuickBooks connection is not available.")
    }
  }

  const sync = async () => {
    setAction("sync")
    try {
      setQuickbooks(await quickBooksApi.sync())
      toast.success("QuickBooks lists refreshed.")
    } catch {
      toast.error("Could not refresh accounting lists.")
    } finally {
      setAction(null)
    }
  }

  const disconnect = async () => {
    if (!window.confirm("Disconnect QuickBooks from this workspace?")) return
    setAction("disconnect")
    try {
      setQuickbooks(await quickBooksApi.disconnect())
      toast.success("QuickBooks disconnected.")
    } catch {
      toast.error("Could not disconnect QuickBooks.")
    } finally {
      setAction(null)
    }
  }

  const recordCount = Object.values(quickbooks.reference_counts || {}).reduce(
    (total, count) => total + Number(count || 0),
    0,
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Accounting connection</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sync QuickBooks lists for reviewed draft bills.
        </p>
      </div>

      {!isOwner ? (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Ask the workspace owner to manage this connection.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="px-5 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">QuickBooks Online</h3>
                <StatusBadge tone={quickbooks.connected ? "success" : "neutral"}>
                  {quickbooks.connected ? "Connected" : "Not connected"}
                </StatusBadge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {quickbooks.connected
                  ? `${recordCount} synced references - Last sync ${formatSynced(quickbooks.last_synced_at)}`
                  : "Publish reviewed draft bills to QuickBooks Online."}
              </p>
            </div>

            {isOwner ? (
              <div className="flex flex-wrap gap-2">
                {quickbooks.connected ? (
                  <>
                    <Button variant="surface" size="sm" onClick={() => void sync()} disabled={Boolean(action) || loading}>
                      <RefreshCw className={cn("size-4", action === "sync" && "animate-spin")} />
                      Refresh lists
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => void disconnect()} disabled={Boolean(action)}>
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button variant="glossy" size="sm" onClick={() => void connect()} disabled={Boolean(action) || loading}>
                    {action === "connect" ? "Connecting..." : "Connect QuickBooks"}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        AxLiner only publishes reviewed draft bills. It does not approve or pay bills.
      </p>
    </div>
  )
}

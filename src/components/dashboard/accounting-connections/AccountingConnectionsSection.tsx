"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Building2, RefreshCw, ShieldCheck } from "lucide-react"
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
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
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
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/20 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border bg-white p-2 shadow-xs">
                <Image
                  src="/integrations/quickbooks.png"
                  alt="QuickBooks Online"
                  width={120}
                  height={76}
                  className="h-auto w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">QuickBooks Online</h2>
                  <StatusBadge tone={quickbooks.connected ? "success" : "neutral"}>
                    {loading ? "Checking" : quickbooks.connected ? "Connected" : "Not connected"}
                  </StatusBadge>
                </div>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                  Sync vendors, accounts, and tax codes for review and publishing.
                </p>
              </div>
            </div>

            {isOwner ? (
              <div className="flex shrink-0 flex-wrap gap-2">
                {quickbooks.connected ? (
                  <>
                    <Button variant="surface" size="sm" onClick={() => void sync()} disabled={Boolean(action) || loading}>
                      <RefreshCw className={cn("size-4", action === "sync" && "animate-spin")} />
                      Sync lists
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

        <div className="grid gap-px bg-border sm:grid-cols-2">
          <div className="bg-card px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Building2 className="size-4" />
              Workspace connection
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              {quickbooks.connected
                ? quickbooks.company_name || "QuickBooks company connected"
                : "No company connected"}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              This connection is shared across the current workspace.
            </p>
          </div>

          <div className="bg-card px-5 py-4 sm:px-6">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Reference data
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              {recordCount} synced reference{recordCount === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Last sync {formatSynced(quickbooks.last_synced_at)}
            </p>
          </div>
        </div>

        {!isOwner ? (
          <div className="border-t border-border bg-muted/20 px-5 py-4 text-sm text-muted-foreground sm:px-6">
            Ask the workspace owner to manage this connection.
          </div>
        ) : null}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3.5">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Controlled publishing</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            AxLiner publishes reviewed, unpaid draft bills to QuickBooks Online. It does not approve or pay bills.
          </p>
        </div>
      </div>
    </div>
  )
}

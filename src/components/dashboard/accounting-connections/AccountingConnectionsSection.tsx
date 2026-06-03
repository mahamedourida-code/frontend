"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Building2, Check, RefreshCw, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  accountingDestinationApi,
  quickBooksApi,
  xeroApi,
  type AccountingConnectionStatus,
  type AccountingDestination,
} from "@/lib/api-client"
import { cn } from "@/lib/utils"

type Provider = AccountingDestination
type Action = `${Provider}:${"connect" | "sync" | "disconnect"}` | "destination" | null

const emptyConnection: AccountingConnectionStatus = {
  connected: false,
  status: "disconnected",
  reference_counts: {},
}

const providers: Array<{
  id: Provider
  name: string
  logo: string
  api: typeof quickBooksApi
}> = [
  { id: "quickbooks", name: "QuickBooks Online", logo: "/integrations/quickbooks.png", api: quickBooksApi },
  { id: "xero", name: "Xero", logo: "/integrations/xero.png", api: xeroApi },
]

function formatSynced(value?: string | null) {
  if (!value) return "Not synced yet"
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  } catch {
    return "Not synced yet"
  }
}

function referenceCount(connection: AccountingConnectionStatus) {
  return Object.values(connection.reference_counts || {}).reduce(
    (total, count) => total + Number(count || 0),
    0,
  )
}

export function AccountingConnectionsSection({
  isOwner,
  workspaceId,
}: {
  isOwner: boolean
  workspaceId?: string
}) {
  const params = useSearchParams()
  const callbackHandled = useRef(false)
  const [connections, setConnections] = useState<Record<Provider, AccountingConnectionStatus>>({
    quickbooks: emptyConnection,
    xero: emptyConnection,
  })
  const [destination, setDestination] = useState<AccountingDestination>("quickbooks")
  const [action, setAction] = useState<Action>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [quickbooks, xero, selectedDestination] = await Promise.all([
        quickBooksApi.status(workspaceId),
        xeroApi.status(workspaceId),
        accountingDestinationApi.get(workspaceId),
      ])
      setConnections({ quickbooks, xero })
      setDestination(selectedDestination)
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
    const provider = providers.find(({ id }) => params.get(id))?.id
    if (!provider) return
    callbackHandled.current = true
    const result = params.get(provider)

    if (result === "connected") {
      setAction(`${provider}:sync`)
      const api = providers.find(({ id }) => id === provider)!.api
      api.sync(workspaceId)
        .then(() => load())
        .then(() => toast.success(`${provider === "xero" ? "Xero" : "QuickBooks"} connected.`))
        .catch(() => {
          void load()
          toast.success(`${provider === "xero" ? "Xero" : "QuickBooks"} connected. Refresh lists when ready.`)
        })
        .finally(() => setAction(null))
      return
    }

    toast.error(result === "cancelled" ? "Connection was cancelled." : "Accounting connection failed.")
  }, [load, params, workspaceId])

  const connect = async (provider: Provider) => {
    setAction(`${provider}:connect`)
    try {
      const api = providers.find(({ id }) => id === provider)!.api
      const response = await api.connect(workspaceId)
      window.location.assign(response.authorization_url)
    } catch {
      setAction(null)
      toast.error(`${provider === "xero" ? "Xero" : "QuickBooks"} connection is not available.`)
    }
  }

  const sync = async (provider: Provider) => {
    setAction(`${provider}:sync`)
    try {
      const api = providers.find(({ id }) => id === provider)!.api
      const status = await api.sync(workspaceId)
      setConnections(current => ({ ...current, [provider]: status }))
      toast.success(`${provider === "xero" ? "Xero" : "QuickBooks"} lists refreshed.`)
    } catch {
      toast.error("Could not refresh accounting lists.")
    } finally {
      setAction(null)
    }
  }

  const disconnect = async (provider: Provider) => {
    const name = provider === "xero" ? "Xero" : "QuickBooks"
    if (!window.confirm(`Disconnect ${name} from this workspace?`)) return
    setAction(`${provider}:disconnect`)
    try {
      const api = providers.find(({ id }) => id === provider)!.api
      const status = await api.disconnect(workspaceId)
      setConnections(current => ({ ...current, [provider]: status }))
      toast.success(`${name} disconnected.`)
    } catch {
      toast.error(`Could not disconnect ${name}.`)
    } finally {
      setAction(null)
    }
  }

  const selectDestination = async (provider: Provider) => {
    if (!isOwner || provider === destination) return
    setAction("destination")
    try {
      setDestination(await accountingDestinationApi.set(provider, workspaceId))
      toast.success(`Draft bills will publish to ${provider === "xero" ? "Xero" : "QuickBooks"}.`)
    } catch {
      toast.error("Could not update the publishing destination.")
    } finally {
      setAction(null)
    }
  }

  const hasConnection = providers.some(({ id }) => connections[id].connected)

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
        <div>
          <p className="text-sm font-bold text-foreground">Publishing destination</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Choose where reviewed draft bills are created. You can change this per workspace.
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {providers.map(provider => {
            const selected = destination === provider.id
            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => void selectDestination(provider.id)}
                disabled={!isOwner || Boolean(action)}
                aria-pressed={selected}
                className={cn(
                  "ax-interactive flex min-h-20 items-center gap-3 rounded-xl border px-4 py-3 text-left transition disabled:cursor-default disabled:opacity-70",
                  selected
                    ? "border-[var(--brand-green-ring)] bg-[var(--brand-green)]/55 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.72)]"
                    : "border-border bg-background hover:bg-muted/45",
                )}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-white p-2">
                  <Image src={provider.logo} alt="" width={88} height={54} className="h-auto w-full object-contain" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-foreground">{provider.name}</span>
                  <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                    {selected ? "Selected for draft bills" : "Choose as destination"}
                  </span>
                </span>
                {selected ? <Check className="ms-auto size-4 shrink-0 text-[var(--brand-green-fg)]" /> : null}
              </button>
            )
          })}
        </div>
      </section>

      {!hasConnection ? (
        <div className="rounded-xl border border-[var(--button-warm-ring)] bg-[var(--button-warm)] px-4 py-3.5">
          <p className="text-sm font-bold text-foreground">Connect your accounting software</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect the destination you use, then sync suppliers, accounts, and VAT codes before publishing.
          </p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {providers.map((provider, index) => {
          const connection = connections[provider.id]
          const busy = action?.startsWith(`${provider.id}:`)
          return (
            <div
              key={provider.id}
              className={cn("px-4 py-4 sm:px-5", index > 0 && "border-t border-border")}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-white p-2">
                    <Image src={provider.logo} alt="" width={96} height={60} className="h-auto w-full object-contain" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-foreground">{provider.name}</h2>
                      <StatusBadge tone={connection.connected ? "success" : "neutral"}>
                        {loading ? "Checking" : connection.connected ? "Connected" : "Not connected"}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                      {connection.connected
                        ? `${connection.company_name || "Company connected"} · ${referenceCount(connection)} synced references · ${formatSynced(connection.last_synced_at)}`
                        : "Sync suppliers, accounts, and VAT codes for draft bills."}
                    </p>
                  </div>
                </div>

                {isOwner ? (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {connection.connected ? (
                      <>
                        <Button variant="surface" size="sm" onClick={() => void sync(provider.id)} disabled={Boolean(action) || loading}>
                          <RefreshCw className={cn("size-4", action === `${provider.id}:sync` && "animate-spin")} />
                          Sync lists
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => void disconnect(provider.id)} disabled={Boolean(action)}>
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button variant={destination === provider.id ? "glossy" : "warm"} size="sm" onClick={() => void connect(provider.id)} disabled={Boolean(action) || loading}>
                        {action === `${provider.id}:connect` ? "Connecting..." : `Connect ${provider.id === "xero" ? "Xero" : "QuickBooks"}`}
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3.5">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Controlled publishing</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            AxLiner creates reviewed, unpaid draft bills in your selected accounting software. It does not approve or pay bills.
          </p>
        </div>
      </div>
    </div>
  )
}

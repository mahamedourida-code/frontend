"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Cloud, Landmark, Plug2, RefreshCw, type LucideIcon } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { WorkspaceActivityIndicator } from "@/components/dashboard/WorkspaceActivityIndicator"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { Button } from "@/components/ui/button"
import { InlineAction } from "@/components/ui/inline-action"
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
  Icon: LucideIcon
  api: typeof quickBooksApi
}> = [
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    Icon: Landmark,
    api: quickBooksApi,
  },
  {
    id: "xero",
    name: "Xero",
    Icon: Cloud,
    api: xeroApi,
  },
]

function providerName(provider: Provider) {
  return providers.find(({ id }) => id === provider)?.name || provider
}

function connectedAlternative(
  connections: Record<Provider, AccountingConnectionStatus>,
  current: Provider,
) {
  return providers.find(({ id }) => id !== current && connections[id].connected)?.id
}

function formatSynced(value?: string | null) {
  if (!value) return "Not synced yet"
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  } catch {
    return "Not synced yet"
  }
}

export function AccountingConnectionsSection({
  isOwner,
  workspaceId,
  workspaceName,
}: {
  isOwner: boolean
  workspaceId?: string
  workspaceName?: string
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
  const [disconnectTarget, setDisconnectTarget] = useState<Provider | null>(null)
  const workspaceLabel = workspaceName ? `"${workspaceName}"` : "this workspace"
  const disconnectTargetName = disconnectTarget ? providerName(disconnectTarget) : "accounting software"

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [quickbooks, xero, selectedDestination] = await Promise.all([
        quickBooksApi.status(workspaceId),
        xeroApi.status(workspaceId),
        accountingDestinationApi.get(workspaceId),
      ])
      const nextConnections = { quickbooks, xero }
      let nextDestination = selectedDestination
      const fallback = connectedAlternative(nextConnections, selectedDestination)
      if (isOwner && !nextConnections[selectedDestination].connected && fallback) {
        try {
          nextDestination = await accountingDestinationApi.set(fallback, workspaceId)
        } catch {
          // The connected provider remains available for the owner to select manually.
        }
      }
      setConnections(nextConnections)
      setDestination(nextDestination)
    } catch {
      toast.error("Could not load accounting connections.")
    } finally {
      setLoading(false)
    }
  }, [isOwner, workspaceId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (callbackHandled.current) return
    const provider = providers.find(({ id }) => params.get(id))?.id
    if (!provider) return
    callbackHandled.current = true
    const result = params.get(provider)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.delete(provider)
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`)
    }

    if (result === "connected") {
      setAction(`${provider}:sync`)
      const api = providers.find(({ id }) => id === provider)!.api
      api.sync(workspaceId)
        .then(() => load())
        .then(() => toast.success(`${providerName(provider)} connected to this workspace.`))
        .catch(() => {
          void load()
          toast.success(`${providerName(provider)} connected to this workspace. Refresh lists when ready.`)
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
      toast.error(`${providerName(provider)} connection is not available.`)
    }
  }

  const sync = async (provider: Provider) => {
    setAction(`${provider}:sync`)
    try {
      const api = providers.find(({ id }) => id === provider)!.api
      const status = await api.sync(workspaceId)
      setConnections(current => ({ ...current, [provider]: status }))
      toast.success(`${providerName(provider)} lists refreshed.`)
    } catch {
      toast.error("Could not refresh accounting lists.")
    } finally {
      setAction(null)
    }
  }

  const disconnect = async (provider: Provider) => {
    const name = providerName(provider)
    setAction(`${provider}:disconnect`)
    try {
      const api = providers.find(({ id }) => id === provider)!.api
      const status = await api.disconnect(workspaceId)
      const nextConnections = { ...connections, [provider]: status }
      setConnections(nextConnections)
      if (provider === destination) {
        const fallback = connectedAlternative(nextConnections, provider)
        if (fallback) {
          try {
            setDestination(await accountingDestinationApi.set(fallback, workspaceId))
          } catch {
            // No radio remains selected until the owner chooses a connected destination.
          }
        }
      }
      toast.success(`${name} disconnected.`)
    } catch {
      toast.error(`Could not disconnect ${name}.`)
    } finally {
      setAction(null)
    }
  }

  const selectDestination = async (provider: Provider) => {
    if (!isOwner || provider === destination || !connections[provider].connected) return
    setAction("destination")
    try {
      setDestination(await accountingDestinationApi.set(provider, workspaceId))
      toast.success(`Workspace draft bills will publish to ${providerName(provider)}.`)
    } catch {
      toast.error("Could not update the publishing destination.")
    } finally {
      setAction(null)
    }
  }

  return (
    <WorkspaceSection
      icon={<Plug2 />}
      title="Accounting destinations"
      hint="Choose where reviewed draft bills publish."
      contentClassName="p-0"
      compact
    >
        {loading ? (
          <WorkspaceActivityIndicator
            title="Checking accounting connections"
            className="m-4 w-auto"
          />
        ) : providers.map((provider, index) => {
          const connection = connections[provider.id]
          const ProviderIcon = provider.Icon
          const selected = connection.connected && destination === provider.id
          const destinationDisabled = !isOwner || Boolean(action) || !connection.connected
          return (
            <div
              key={provider.id}
              className={cn("px-4 py-4 sm:px-5", index > 0 && "border-t border-border")}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--workspace-selection-border)] bg-[var(--workspace-blue-soft)]">
                    <ProviderIcon className="size-5 text-[var(--workspace-primary)]" strokeWidth={2.1} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[14px] font-semibold text-foreground">{provider.name}</h2>
                      <StatusBadge tone={connection.connected ? "info" : "neutral"} size="sm">
                        {connection.connected ? "Connected" : "Not connected"}
                      </StatusBadge>
                      {selected ? <StatusBadge tone="info" size="sm">Publishing here</StatusBadge> : null}
                    </div>
                    {connection.connected ? (
                      <p className="mt-1 truncate text-[11px] leading-5 text-[var(--workspace-muted)]">
                        {`${connection.company_name || "Company connected"} · synced ${formatSynced(connection.last_synced_at)}`}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-[var(--workspace-muted)]">OAuth connection required before publishing.</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <label className={cn(
                    "inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border px-3 text-[12px] font-semibold",
                    selected
                      ? "border-[var(--workspace-primary)] bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)]"
                      : "border-[var(--workspace-border)] bg-card text-[var(--workspace-muted)]",
                    destinationDisabled && "cursor-default opacity-65",
                  )}>
                    <input
                      type="radio"
                      name="accounting-destination"
                      value={provider.id}
                      checked={selected}
                      onChange={() => void selectDestination(provider.id)}
                      disabled={destinationDisabled}
                      className="size-3.5 accent-[var(--workspace-primary)]"
                    />
                    Publish here
                  </label>
                  {isOwner ? (
                    <>
                    {connection.connected ? (
                      <>
                        <InlineAction onClick={() => void sync(provider.id)} disabled={Boolean(action) || loading}>
                          <RefreshCw className={cn("size-4", action === `${provider.id}:sync` && "animate-spin")} />
                          Sync lists
                        </InlineAction>
                        <InlineAction tone="danger" onClick={() => setDisconnectTarget(provider.id)} disabled={Boolean(action)}>
                          Disconnect
                        </InlineAction>
                      </>
                    ) : (
                      <Button variant="glossy" size="sm" onClick={() => void connect(provider.id)} disabled={Boolean(action) || loading}>
                        {action === `${provider.id}:connect`
                          ? <RefreshCw className="size-3.5 animate-spin" />
                          : <Plug2 className="size-3.5" />}
                        {action === `${provider.id}:connect` ? "Connecting..." : `Connect ${provider.name}`}
                      </Button>
                    )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}

        {!loading ? (
          <p className="border-t border-border bg-[var(--workspace-soft)] px-4 py-2.5 text-[11px] leading-5 text-[var(--workspace-muted)] sm:px-5">
            AxLiner publishes reviewed drafts only. Payments remain in QuickBooks Online or Xero.
          </p>
        ) : null}

      <ConfirmDeleteDialog
        open={Boolean(disconnectTarget)}
        onOpenChange={(open) => {
          if (!open) setDisconnectTarget(null)
        }}
        title={`Disconnect ${disconnectTargetName}`}
        description={`New draft bills will not publish to ${disconnectTargetName} until an owner reconnects ${workspaceLabel}.`}
        confirmLabel={`Disconnect ${disconnectTargetName}`}
        busyLabel="Disconnecting..."
        onConfirm={async () => {
          if (!disconnectTarget) return
          await disconnect(disconnectTarget)
        }}
      />
    </WorkspaceSection>
  )
}

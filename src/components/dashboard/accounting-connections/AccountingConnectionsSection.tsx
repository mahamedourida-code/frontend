"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Check, Cloud, Landmark, Plug2, RefreshCw, ShieldCheck, Target, type LucideIcon } from "lucide-react"
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
  iconClassName: string
  api: typeof quickBooksApi
}> = [
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    Icon: Landmark,
    iconClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    api: quickBooksApi,
  },
  {
    id: "xero",
    name: "Xero",
    Icon: Cloud,
    iconClassName: "border-sky-200 bg-sky-50 text-sky-700",
    api: xeroApi,
  },
]

const workspacePrimaryButton =
  "!border-[var(--btn-primary-bg)] !bg-[var(--btn-primary-bg)] !text-[var(--btn-primary-fg)] !shadow-none hover:!bg-[var(--btn-primary-bg-hover)] hover:!text-[var(--btn-primary-fg-hover)]"

const workspaceWarmPanel = "border-[var(--workspace-border)] bg-[var(--workspace-soft)]"

function providerName(provider: Provider) {
  return providers.find(({ id }) => id === provider)?.name || provider
}

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
      toast.success(`Workspace draft bills will publish to ${providerName(provider)}.`)
    } catch {
      toast.error("Could not update the publishing destination.")
    } finally {
      setAction(null)
    }
  }

  const hasConnection = providers.some(({ id }) => connections[id].connected)

  return (
    <div className="space-y-5">
      <WorkspaceSection
        icon={<Target />}
        title="Workspace publishing destination"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {providers.map(provider => {
            const selected = destination === provider.id
            const ProviderIcon = provider.Icon
            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => void selectDestination(provider.id)}
                disabled={!isOwner || Boolean(action)}
                aria-pressed={selected}
                className={cn(
                  "ax-interactive flex min-h-20 items-center gap-4 rounded-xl border px-5 py-4 text-left transition disabled:cursor-default disabled:opacity-70",
                  selected
                    ? "border-[var(--workspace-primary)] bg-[var(--workspace-blue-soft)]"
                    : "border-border bg-background hover:border-[var(--workspace-primary)] hover:bg-[var(--workspace-blue-soft)]",
                )}
              >
                <span className={cn("inline-flex size-12 shrink-0 items-center justify-center rounded-xl border", provider.iconClassName)}>
                  <ProviderIcon className="size-6" strokeWidth={2.2} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-foreground">{provider.name}</span>
                  <span className="mt-1 block text-xs font-normal text-foreground">
                    {selected ? "Selected for this workspace" : "Use for this workspace"}
                  </span>
                </span>
                {selected ? <Check className="ms-auto size-4 shrink-0 text-[var(--workspace-success)]" /> : null}
              </button>
            )
          })}
        </div>
      </WorkspaceSection>

      {!hasConnection ? (
        <div className="rounded-xl border border-[var(--workspace-border)] bg-[var(--workspace-soft)] px-5 py-4">
          <p className="text-sm font-bold text-foreground">Connect workspace accounting</p>
          <p className="mt-2 text-sm font-normal text-foreground">
            Connections apply to this workspace. Connect QuickBooks Online or Xero, then sync vendors, accounts, and tax codes before publishing reviewed draft bills.
          </p>
        </div>
      ) : null}

      <WorkspaceSection icon={<Plug2 />} title="Workspace accounting software" contentClassName="p-0">
        {loading ? (
          <WorkspaceActivityIndicator
            title="Checking accounting connections"
            detail="Retrieving QuickBooks and Xero company and reference-list status."
            className="m-4 w-auto"
          />
        ) : providers.map((provider, index) => {
          const connection = connections[provider.id]
          const ProviderIcon = provider.Icon
          return (
            <div
              key={provider.id}
              className={cn("px-5 py-5 sm:px-6 sm:py-6", index > 0 && "border-t border-border")}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <span className={cn("inline-flex size-14 shrink-0 items-center justify-center rounded-xl border", provider.iconClassName)}>
                    <ProviderIcon className="size-7" strokeWidth={2.1} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-foreground">{provider.name}</h2>
                      <StatusBadge tone={connection.connected ? "success" : "neutral"}>
                        {connection.connected ? "Connected" : "Not connected"}
                      </StatusBadge>
                    </div>
                    <p className="mt-1.5 text-xs font-normal leading-5 text-foreground">
                      {connection.connected
                        ? `${connection.company_name || "Company connected"} - workspace connection - ${referenceCount(connection)} synced references - ${formatSynced(connection.last_synced_at)}`
                        : "Connect this workspace before publishing reviewed draft bills."}
                    </p>
                  </div>
                </div>

                {isOwner ? (
                  <div className="flex shrink-0 flex-wrap items-center gap-5">
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
                      <Button variant="glossy" size="sm" className={workspacePrimaryButton} onClick={() => void connect(provider.id)} disabled={Boolean(action) || loading}>
                        {action === `${provider.id}:connect` ? "Connecting..." : `Connect ${provider.name}`}
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </WorkspaceSection>

      <div className={cn("flex items-start gap-3 rounded-xl border px-5 py-4", workspaceWarmPanel)}>
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[var(--workspace-blue)]" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Controlled publishing</h3>
          <p className="mt-1.5 text-sm font-normal leading-6 text-foreground">
            Workspace connections create reviewed, unpaid draft bills in the selected QuickBooks or Xero company. AxLiner does not approve, pay, reconcile, or delete bills.
          </p>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={Boolean(disconnectTarget)}
        onOpenChange={(open) => {
          if (!open) setDisconnectTarget(null)
        }}
        title={`Disconnect ${disconnectTargetName}`}
        description={`This removes the workspace-level ${disconnectTargetName} connection for ${workspaceLabel}. Reviewed data stays in AxLiner, but new draft bills will not publish there until an owner reconnects it.`}
        confirmLabel={`Disconnect ${disconnectTargetName}`}
        busyLabel="Disconnecting..."
        onConfirm={async () => {
          if (!disconnectTarget) return
          await disconnect(disconnectTarget)
        }}
      />
    </div>
  )
}

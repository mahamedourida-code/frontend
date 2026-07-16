"use client"

import * as React from "react"
import Link from "next/link"
import {
  AtSign,
  Check,
  CreditCard,
  ChevronDown,
  ChevronRight,
  FolderSync,
  Link2,
  Plug,
  Receipt,
  SlidersHorizontal,
  Store,
  Users,
} from "lucide-react"

import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { WorkspaceActivityIndicator } from "@/components/dashboard/WorkspaceActivityIndicator"
import { cn } from "@/lib/utils"
import {
  accountsPayableApi,
  billingApi,
  clientIntakeApi,
  connectedSourcesApi,
  emailIntakeApi,
  quickBooksApi,
  vendorMemoryApi,
  workspaceApi,
  xeroApi,
} from "@/lib/api-client"
import type { Workspace } from "@/hooks/useWorkspaces"

/**
 * The completion state of one checklist row.
 * - `done`     → a real API signal confirms the step is configured.
 * - `todo`     → a real API signal confirms it is NOT configured yet.
 * - `neutral`  → no clean completion signal exists; render as a calm "set up"
 *                row that never falsely reads as done.
 */
type ItemState = "done" | "todo" | "neutral"

interface ChecklistItem {
  id: string
  /** Short, calm label. */
  label: string
  icon: React.ReactNode
  href: string
  state: ItemState
  /** Label for the call-to-action on a pending / neutral row. */
  cta: string
  /** Optional value line shown on a done row, e.g. the email address. */
  doneNote?: string
}

/**
 * The setup checklist surface. Loads every important configuration signal in
 * parallel, derives a live done / todo / neutral state per row, and renders a
 * compact action list that mirrors the Inbox / Settings patterns.
 */
export function SetupChecklist({ workspace }: { workspace?: Workspace | null }) {
  const [loading, setLoading] = React.useState(true)
  const [items, setItems] = React.useState<ChecklistItem[]>([])

  const workspaceId = workspace?.id
  const isOwner = !workspace || workspace.role === "owner"

  React.useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)

      // Each probe resolves to its own done/todo signal; failures fall back to
      // a neutral value so a single unavailable endpoint never blocks the page.
      const safe = async <T,>(run: () => Promise<T>, fallback: T): Promise<T> => {
        try {
          return await run()
        } catch {
          return fallback
        }
      }

      const [
        accounting,
        emailAddress,
        clientLinks,
        members,
        sources,
        vendorRules,
        purchaseOrders,
        billing,
      ] = await Promise.all([
        // 1 — Connect accounting (QuickBooks OR Xero, presented neutrally).
        safe(async () => {
          const [qb, xero] = await Promise.all([
            safe(() => quickBooksApi.status(workspaceId), null),
            safe(() => xeroApi.status(workspaceId), null),
          ])
          const connected = Boolean(qb?.connected) || Boolean(xero?.connected)
          const name = qb?.connected ? qb?.company_name : xero?.connected ? xero?.company_name : null
          return { connected, name: name ?? null }
        }, { connected: false, name: null as string | null }),
        // 2 — Email-in address provisioned.
        isOwner
          ? safe(() => emailIntakeApi.getAddress(workspaceId), null)
          : Promise.resolve(null),
        // 3 — Client upload links created.
        workspaceId && isOwner
          ? safe(() => clientIntakeApi.listLinks(workspaceId), { links: [], total: 0 })
          : Promise.resolve({ links: [], total: 0 }),
        // 4 — Reviewer invited.
        workspaceId && isOwner
          ? safe(() => workspaceApi.members(workspaceId), { members: [], total: 0 })
          : Promise.resolve({ members: [], total: 0 }),
        // 5 — Drive / Dropbox connected.
        workspaceId && isOwner
          ? safe(() => connectedSourcesApi.list(workspaceId), {
              sources: [],
              total: 0,
              providers_configured: { google_drive: false, dropbox: false },
            })
          : Promise.resolve({
              sources: [],
              total: 0,
              providers_configured: { google_drive: false, dropbox: false },
            }),
        // 6 — Vendor memory.
        isOwner
          ? safe(() => vendorMemoryApi.list(workspaceId), { rules: [], total: 0 })
          : Promise.resolve({ rules: [], total: 0 }),
        // 7 — Purchase orders imported.
        safe(() => accountsPayableApi.listPurchaseOrders(), { purchase_orders: [], total: 0 }),
        // 8 — Billing / plan.
        safe(() => billingApi.getStatus(), null),
      ])

      if (cancelled) return

      const accountingDone = accounting.connected
      const emailDone = Boolean(emailAddress?.address) && Boolean(emailAddress?.enabled)
      const activeLinks = clientLinks.links.filter((link) => link.enabled)
      const activeReviewers = members.members.filter(
        (member) => member.role === "reviewer" && member.status !== "revoked",
      )
      const sourceDone = sources.sources.some((source) => source.status === "connected")
      const enabledVendorRules = vendorRules.rules.filter((rule) => rule.enabled)
      const poCount = purchaseOrders.purchase_orders.length
      // A paid plan reads as "reviewed"; the free plan stays a calm review row.
      const planPaid = Boolean(billing && billing.plan !== "free")
      const planName =
        billing?.plan && billing.plan !== "free"
          ? `${billing.plan.charAt(0).toUpperCase()}${billing.plan.slice(1)} plan`
          : "Free plan"

      const next: ChecklistItem[] = [
        {
          id: "accounting",
          label: "Connect QuickBooks or Xero",
          icon: <Plug />,
          href: "/dashboard/integrations",
          state: accountingDone ? "done" : "todo",
          cta: "Connect",
          doneNote: accounting.name ? `Connected to ${accounting.name}` : "Connected",
        },
        {
          id: "email",
          label: "Email-in address",
          icon: <AtSign />,
          href: "/dashboard/inbox",
          state: emailDone ? "done" : "todo",
          cta: "Set up",
          doneNote: emailAddress?.address ?? undefined,
        },
        {
          id: "client-links",
          label: "Client upload links",
          icon: <Link2 />,
          href: "/dashboard/inbox",
          state: activeLinks.length > 0 ? "done" : "todo",
          cta: "Create a link",
          doneNote: activeLinks.length > 0 ? `${activeLinks.length} active` : undefined,
        },
        {
          id: "reviewer",
          label: "Invite a reviewer",
          icon: <Users />,
          href: "/dashboard/inbox",
          state: activeReviewers.length > 0 ? "done" : "todo",
          cta: "Invite",
          doneNote:
            activeReviewers.length > 0
              ? `${activeReviewers.length} reviewer${activeReviewers.length === 1 ? "" : "s"}`
              : undefined,
        },
        {
          id: "sources",
          label: "Connect Drive or Dropbox",
          icon: <FolderSync />,
          href: "/dashboard/inbox",
          state: sourceDone ? "done" : "todo",
          cta: "Connect",
        },
        {
          id: "vendor-memory",
          label: "Vendor memory",
          icon: <Store />,
          href: "/dashboard/settings?section=vendors",
          state: enabledVendorRules.length > 0 ? "done" : "todo",
          cta: "Set up",
          doneNote: enabledVendorRules.length > 0 ? `${enabledVendorRules.length} remembered` : undefined,
        },
        {
          id: "purchase-orders",
          label: "Import purchase orders",
          icon: <Receipt />,
          href: "/dashboard/settings?section=accounting",
          state: poCount > 0 ? "done" : "todo",
          cta: "Import",
          doneNote: poCount > 0 ? `${poCount} imported` : undefined,
        },
        {
          id: "billing",
          label: "Billing & plan",
          icon: <CreditCard />,
          href: "/dashboard/settings?section=billing",
          // Free workspaces have nothing "wrong" — this is a calm review row.
          state: planPaid ? "done" : "neutral",
          cta: "Review plan",
          doneNote: planPaid ? planName : undefined,
        },
        {
          id: "preferences",
          label: "Preferences",
          icon: <SlidersHorizontal />,
          href: "/dashboard/settings?section=preferences",
          // No durable server signal — keep this a neutral, optional review.
          state: "neutral",
          cta: "Review",
        },
      ]

      setItems(next)
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [workspaceId, isOwner])

  if (loading) {
    return (
      <WorkspaceSection icon={<Check />} title="Workspace readiness" compact>
        <WorkspaceActivityIndicator title="Checking workspace setup" />
      </WorkspaceSection>
    )
  }

  const coreIds = new Set(["accounting", "email", "client-links", "reviewer"])
  const coreItems = items.filter((item) => coreIds.has(item.id))
  const optionalItems = items.filter((item) => !coreIds.has(item.id))

  return (
    <WorkspaceSection
      icon={<Check />}
      title="Workspace readiness"
      hint="Complete the handoffs your team uses."
      actions={<StatusBadge tone="neutral">{items.filter((item) => item.state === "done").length}/{items.filter((item) => item.state !== "neutral").length} ready</StatusBadge>}
      contentClassName="p-0"
      compact
    >
      <ul className="divide-y divide-border">
        {[...coreItems]
          .sort((left, right) => (left.state === "todo" ? -1 : right.state === "todo" ? 1 : 0))
          .map((item) => <ChecklistRow key={item.id} item={item} />)}
      </ul>
      <details className="group border-t border-border">
        <summary className="ax-interactive flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[12px] font-semibold text-[var(--workspace-muted)] outline-none hover:bg-[var(--workspace-row-hover)] hover:text-[var(--workspace-ink)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--workspace-primary)]/25 [&::-webkit-details-marker]:hidden">
          <span>Optional setup</span>
          <span className="inline-flex items-center gap-2">
            {optionalItems.filter((item) => item.state === "done").length}/{optionalItems.length}
            <ChevronDown className="size-4 transition-transform duration-150 group-open:rotate-180" />
          </span>
        </summary>
        <ul className="divide-y divide-border border-t border-border">
          {optionalItems.map((item) => <ChecklistRow key={item.id} item={item} />)}
        </ul>
      </details>
    </WorkspaceSection>
  )
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const isDone = item.state === "done"

  return (
    <li>
      <Link
        href={item.href}
        className="ax-interactive group flex items-center gap-3 px-4 py-3 outline-none hover:bg-[var(--workspace-row-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--workspace-primary)]/25"
      >
        {/* Status marker — a quietly satisfying check when done. */}
        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-md [&_svg]:size-4",
            isDone
              ? "bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)]"
              : "bg-[var(--workspace-soft)] text-[var(--workspace-ink)]",
          )}
        >
          {isDone ? <Check strokeWidth={2.5} /> : item.icon}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold leading-tight text-foreground">{item.label}</span>
            {isDone ? (
              <StatusBadge tone="info" size="sm">Ready</StatusBadge>
            ) : item.state === "neutral" ? (
              <StatusBadge tone="neutral" size="sm">Optional</StatusBadge>
            ) : null}
          </span>
          {isDone && item.doneNote ? (
            <span className="mt-1 block truncate text-[11px] leading-snug text-[var(--workspace-muted)]">
              {item.doneNote}
            </span>
          ) : null}
        </span>

        <span className="hidden shrink-0 text-[11px] font-semibold text-[var(--workspace-muted)] sm:inline">
          {isDone ? "Manage" : item.cta}
        </span>
        <ChevronRight className="size-4 shrink-0 text-[var(--workspace-muted)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--workspace-ink)]" />
      </Link>
    </li>
  )
}

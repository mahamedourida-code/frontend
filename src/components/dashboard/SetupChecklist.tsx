"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  AtSign,
  Check,
  CreditCard,
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
import { InlineAction } from "@/components/ui/inline-action"
import { useMotionTokens } from "@/lib/motion"
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
  const m = useMotionTokens()
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
      <WorkspaceSection icon={<Check />} title="Setup checklist">
        <WorkspaceActivityIndicator title="Checking workspace setup" />
      </WorkspaceSection>
    )
  }

  return (
    <WorkspaceSection icon={<Check />} title="Setup checklist" contentClassName="p-0">
      <motion.ul
        className="divide-y divide-border"
        variants={m.staggerParent()}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <ChecklistRow key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </motion.ul>
    </WorkspaceSection>
  )
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const m = useMotionTokens()
  const isDone = item.state === "done"

  return (
    <motion.li
      layout
      variants={m.fadeUp}
      exit="exit"
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-4">
        {/* Status marker — a quietly satisfying check when done. */}
        <span
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-full [&_svg]:size-[18px]",
            isDone
              ? "bg-[color-mix(in_srgb,var(--workspace-success)_14%,transparent)] text-[var(--workspace-success)]"
              : "bg-[color-mix(in_srgb,var(--workspace-primary)_10%,transparent)] text-[var(--workspace-blue)]",
          )}
        >
          {isDone ? (
            <motion.span
              initial={m.reduced ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={m.reduced ? { duration: 0.001 } : { type: "spring", stiffness: 360, damping: 22 }}
              className="inline-flex"
            >
              <Check strokeWidth={2.5} />
            </motion.span>
          ) : (
            item.icon
          )}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold leading-tight text-foreground">{item.label}</p>
            {isDone ? (
              <StatusBadge tone="success">Done</StatusBadge>
            ) : item.state === "neutral" ? (
              <StatusBadge tone="neutral">Optional</StatusBadge>
            ) : (
              <StatusBadge tone="info">To do</StatusBadge>
            )}
          </div>
          {isDone && item.doneNote ? (
            <p className="mt-1 truncate text-sm leading-snug text-foreground">
              {item.doneNote}
            </p>
          ) : null}
        </div>
      </div>

      <div className="shrink-0">
        {isDone ? (
          <InlineAction asChild className="text-xs">
            <Link href={item.href}>Manage</Link>
          </InlineAction>
        ) : (
          <Link
            href={item.href}
            className="ax-interactive inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--workspace-primary)] bg-[var(--workspace-primary)] px-4 text-sm font-semibold text-white shadow-none transition-colors hover:border-[var(--workspace-primary-hover)] hover:bg-[var(--workspace-primary-hover)]"
          >
            {item.cta}
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </motion.li>
  )
}

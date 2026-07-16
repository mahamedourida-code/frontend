"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Activity,
  BookCheck,
  Building2,
  Inbox,
  Layers3,
  PanelLeftClose,
  PanelLeftOpen,
  PlugZap,
  Plus,
  ReceiptText,
  Settings,
  type LucideIcon,
} from "lucide-react"

import { AxMark } from "@/components/AppIcon"
import { useProcessingState } from "@/contexts/ProcessingStateContext"
import { useCurrentHash } from "@/hooks/useCurrentHash"
import { cn } from "@/lib/utils"

export type WorkspaceSidebarItemKey =
  | "overview"
  | "clients"
  | "companies"
  | "activity"
  | "inbox"
  | "batches"
  | "review"
  | "accounts_payable"
  | "setup"
  | "settings"
  | "process"
  | "history"
  | "integrations"
  | "guide"
  | "invoices"
  | "receipts"
  | "bank_statements"
  | "notes"
  | "auto_detect"
  | "upload"
  | "exports"
  | "pricing"

interface WorkspaceSidebarProps {
  activeItem: WorkspaceSidebarItemKey
  unreadCount?: number
  notifications?: Partial<Record<WorkspaceSidebarItemKey, boolean>>
  user?: unknown
}

type VisibleItemKey =
  | "companies"
  | "inbox"
  | "review"
  | "accounts_payable"
  | "batches"
  | "activity"
  | "integrations"
  | "settings"

type SidebarItem = {
  key: VisibleItemKey
  label: string
  href: string
  icon: LucideIcon
}

const EXPANDED_W = 224
const COLLAPSED_W = 68
const STORAGE_KEY = "axliner:sidebarCollapsed"

const WORK_ITEMS: SidebarItem[] = [
  { key: "companies", label: "Clients", href: "/dashboard", icon: Building2 },
  { key: "inbox", label: "Inbox", href: "/dashboard/inbox", icon: Inbox },
  { key: "review", label: "Review board", href: "/dashboard/client", icon: BookCheck },
  { key: "accounts_payable", label: "Draft bills", href: "/dashboard/accounts-payable", icon: ReceiptText },
]

const RECORD_ITEMS: SidebarItem[] = [
  { key: "batches", label: "Batches", href: "/dashboard/batches", icon: Layers3 },
  { key: "activity", label: "Activity", href: "/history", icon: Activity },
]

const MANAGE_ITEMS: SidebarItem[] = [
  { key: "integrations", label: "Connections", href: "/dashboard/integrations", icon: PlugZap },
  { key: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
]

const BATCH_ENTRY_ITEMS = new Set<WorkspaceSidebarItemKey>([
  "auto_detect",
  "invoices",
  "receipts",
  "bank_statements",
  "notes",
  "upload",
])

function normalizedActiveItem(activeItem: WorkspaceSidebarItemKey, hash: string): VisibleItemKey | null {
  if (activeItem === "overview" || activeItem === "clients") return "companies"
  if (activeItem === "process") return "review"
  if (activeItem === "history") return "activity"
  if (activeItem === "exports" || hash === "#reviewed-outputs") return "review"
  if (BATCH_ENTRY_ITEMS.has(activeItem) || hash === "#upload-files") return null
  if ([...WORK_ITEMS, ...RECORD_ITEMS, ...MANAGE_ITEMS].some((item) => item.key === activeItem)) {
    return activeItem as VisibleItemKey
  }
  return null
}

export function WorkspaceSidebar({
  activeItem,
  unreadCount = 0,
  notifications,
}: WorkspaceSidebarProps) {
  const { state } = useProcessingState()
  const currentHash = useCurrentHash()
  const [collapsed, setCollapsed] = useState(false)
  const active = normalizedActiveItem(activeItem, currentHash)
  const reviewCount = state.processingComplete && Array.isArray(state.processedFiles)
    ? state.processedFiles.length
    : 0
  const batchEntryActive = BATCH_ENTRY_ITEMS.has(activeItem) || currentHash === "#upload-files"

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1")
    } catch {
      // Local preference is optional.
    }
  }, [])

  useEffect(() => {
    const width = collapsed ? COLLAPSED_W : EXPANDED_W
    document.documentElement.style.setProperty("--sidebar-w", `${width}px`)
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0")
    } catch {
      // Local preference is optional.
    }
    return () => document.documentElement.style.removeProperty("--sidebar-w")
  }, [collapsed])

  const renderItem = (item: SidebarItem) => {
    const Icon = item.icon
    const isActive = active === item.key
    const count = item.key === "review" ? reviewCount : item.key === "inbox" ? unreadCount : 0
    const showDot = Boolean(notifications?.[item.key]) || (collapsed && count > 0)

    return (
      <Link
        key={item.key}
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        data-workspace-tour={
          item.key === "companies" ? "clients" : item.key === "review" ? "review" : undefined
        }
        className={cn(
          "ax-interactive relative flex h-9 items-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]/25",
          collapsed ? "justify-center px-0" : "gap-2.5 px-3 text-[13px]",
          isActive
            ? "border-[var(--workspace-selection-border)] bg-white font-semibold text-[var(--workspace-ink)]"
            : "border-transparent font-medium text-[var(--workspace-muted)] hover:border-[var(--workspace-border)] hover:bg-white hover:text-[var(--workspace-ink)]",
        )}
      >
        {isActive && !collapsed ? (
          <span className="absolute left-1.5 top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--workspace-primary)]" />
        ) : null}
        <span className="relative flex shrink-0 items-center justify-center">
          <Icon className="size-[17px] text-black" />
          {showDot ? (
            <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-[var(--workspace-warning)] ring-2 ring-[var(--workspace-sidebar)]" />
          ) : null}
        </span>
        {!collapsed ? <span className="truncate">{item.label}</span> : null}
        {!collapsed && count > 0 ? (
          <span className="ms-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--workspace-soft)] px-1.5 text-[10px] font-semibold tabular-nums text-[var(--workspace-ink)]">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </Link>
    )
  }

  return (
    <aside
      style={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
      className="fixed inset-y-0 start-0 z-30 hidden overflow-hidden border-r border-[var(--workspace-border)] bg-[var(--workspace-sidebar)] text-[var(--workspace-ink)] transition-[width] duration-150 md:flex md:flex-col"
      aria-label="Workspace navigation"
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-white/10 bg-[var(--workspace-topbar)] px-2.5 text-white",
          collapsed ? "justify-center" : "gap-2",
        )}
      >
        <Link
          href="/dashboard"
          aria-label="AxLiner workspace"
          className={cn(
            "ax-interactive flex min-w-0 items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/30",
            collapsed ? "size-9 justify-center" : "flex-1 gap-2 px-1",
          )}
        >
          <AxMark className="h-8 w-auto shrink-0" />
          {!collapsed ? <span className="truncate text-[17px] font-semibold">AxLiner</span> : null}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse navigation"
            className="ax-interactive flex size-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
          >
            <PanelLeftClose className="size-4" />
          </button>
        ) : null}
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-3" aria-label="Workspace sections">
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand navigation"
            className="ax-interactive mb-2 flex h-9 items-center justify-center rounded-full text-[var(--workspace-muted)] hover:bg-white hover:text-[var(--workspace-ink)]"
          >
            <PanelLeftOpen className="size-[17px]" />
          </button>
        ) : null}

        <Link
          href="/dashboard/client#upload-files"
          data-workspace-tour="upload"
          aria-current={batchEntryActive ? "page" : undefined}
          title={collapsed ? "New batch" : undefined}
          className={cn(
            "ax-interactive mb-4 flex h-9 items-center justify-center rounded-full border border-[var(--brand-green-ring)] bg-[var(--brand-green)] font-semibold text-[var(--brand-green-fg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_1px_2px_rgba(16,24,40,0.08)] hover:bg-[var(--brand-green-hover)]",
            collapsed ? "px-0" : "gap-2 px-3 text-[13px]",
            batchEntryActive && "ring-2 ring-[var(--brand-green-ring)]/20",
          )}
        >
          <Plus className="size-4 text-[var(--brand-green-fg)]" />
          {!collapsed ? <span>New batch</span> : null}
        </Link>

        <div className="space-y-1">
          {!collapsed ? <p className="px-3 pb-1 text-[10px] font-semibold uppercase text-[var(--workspace-muted)]">Work</p> : null}
          {WORK_ITEMS.map(renderItem)}
        </div>

        <div className="mt-4 space-y-1 border-t border-[var(--workspace-border)] pt-3">
          {!collapsed ? <p className="px-3 pb-1 text-[10px] font-semibold uppercase text-[var(--workspace-muted)]">Records</p> : null}
          {RECORD_ITEMS.map(renderItem)}
        </div>

        <div className="mt-auto space-y-1 border-t border-[var(--workspace-border)] pt-3">
          {MANAGE_ITEMS.map(renderItem)}
        </div>
      </nav>
    </aside>
  )
}

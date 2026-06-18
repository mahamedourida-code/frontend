"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Activity, BookCheck, BookOpenText, Building2, Inbox, Layers, ListChecks, PanelLeft, PlugZap, ReceiptText, Settings, type LucideIcon } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { AxMark } from "@/components/AppIcon"
import { useProcessingState } from "@/contexts/ProcessingStateContext"
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
  | "pricing"

interface WorkspaceSidebarProps {
  activeItem: WorkspaceSidebarItemKey
  unreadCount?: number
  notifications?: Partial<Record<WorkspaceSidebarItemKey, boolean>>
  user?: unknown
}

type SidebarItem = {
  key: Extract<
    WorkspaceSidebarItemKey,
    "companies" | "setup" | "activity" | "inbox" | "batches" | "review" | "accounts_payable" | "integrations" | "guide" | "settings"
  >
  label: string
  href: string
  icon: LucideIcon
}

const EXPANDED_W = 220
const COLLAPSED_W = 68
const STORAGE_KEY = "axliner:sidebarCollapsed"

// Top-level home. "Clients" is the one name everywhere (sidebar, mobile, ⌘K).
const PRIMARY_ITEMS: SidebarItem[] = [
  { key: "companies", label: "Clients", href: "/dashboard", icon: Building2 },
]

// The daily flow, flat and in pipeline order: intake → batch → review.
const DOCUMENT_ITEMS: SidebarItem[] = [
  { key: "inbox", label: "Inbox", href: "/dashboard/inbox", icon: Inbox },
  { key: "batches", label: "Stacks", href: "/dashboard/batches", icon: Layers },
  { key: "review", label: "Review board", href: "/dashboard/client", icon: BookCheck },
]

// Accounting: connect first (prerequisite), then the bills you publish.
const ACCOUNTING_ITEMS: SidebarItem[] = [
  { key: "integrations", label: "Integrations", href: "/dashboard/integrations", icon: PlugZap },
  { key: "accounts_payable", label: "Draft bills", href: "/dashboard/accounts-payable", icon: ReceiptText },
]

// Setup, Activity, Guide, Settings — config + reference live together at the bottom.
const SUPPORT_ITEMS: SidebarItem[] = [
  { key: "setup", label: "Setup", href: "/dashboard/setup", icon: ListChecks },
  { key: "activity", label: "Activity", href: "/history", icon: Activity },
  { key: "guide", label: "Guide", href: "/dashboard/guide", icon: BookOpenText },
  { key: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
]

function useReviewCount(): number {
  const { state } = useProcessingState()
  return state.processingComplete && Array.isArray(state.processedFiles) ? state.processedFiles.length : 0
}

function normalizeActiveItem(activeItem: WorkspaceSidebarItemKey): SidebarItem["key"] | null {
  if (activeItem === "overview" || activeItem === "clients") return "companies"
  if (activeItem === "process") return "review"
  if (activeItem === "history") return "activity"
  if (activeItem === "pricing") return null
  return activeItem
}

export function WorkspaceSidebar({ activeItem, unreadCount = 0, notifications }: WorkspaceSidebarProps) {
  const reviewCount = useReviewCount()
  const normalizedActiveItem = normalizeActiveItem(activeItem)
  const prefersReducedMotion = useReducedMotion()
  const [collapsed, setCollapsed] = useState(false)

  // Restore the last-used state before paint so the rail doesn't flash open.
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1")
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const width = collapsed ? COLLAPSED_W : EXPANDED_W
    document.documentElement.style.setProperty("--sidebar-w", `${width}px`)
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0")
    } catch {
      /* ignore */
    }
    return () => {
      document.documentElement.style.removeProperty("--sidebar-w")
    }
  }, [collapsed])

  // Collapsed rail: clicking any empty space (not an icon link) opens it back up,
  // ChatGPT-style. Icon clicks still navigate and keep the rail collapsed.
  const handleRailClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!collapsed) return
      if ((e.target as HTMLElement).closest("a,button")) return
      setCollapsed(false)
    },
    [collapsed],
  )

  const renderItem = (item: SidebarItem) => {
    const Icon = item.icon
    const isActive = normalizedActiveItem === item.key
    const showDot = Boolean(notifications?.[item.key])
    const count = item.key === "review" ? reviewCount : item.key === "inbox" ? unreadCount : 0

    return (
      <Link
        key={item.key}
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        className={cn(
          "ax-interactive relative flex h-[41px] items-center gap-2.5 rounded-md text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#8a6a52]/25",
          collapsed ? "justify-center px-0" : "px-3",
          isActive
            ? "bg-[#efe7db] font-medium text-[#5b4636]"
            : "font-normal text-[var(--workspace-ink)] hover:bg-white hover:text-[#6b4f2e]",
        )}
      >
        {isActive && !collapsed ? <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[#8a6a52]" aria-hidden="true" /> : null}
        <span className="relative flex shrink-0 items-center justify-center">
          <Icon className={cn("size-[17px]", isActive ? "text-[#6b4f2e]" : "text-slate-700")} />
          {(showDot || (collapsed && count > 0)) && (
            <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-amber-400 ring-2 ring-[var(--workspace-sidebar)]" aria-hidden="true" />
          )}
        </span>
        {!collapsed && <span className="truncate">{item.label}</span>}
        {!collapsed && count > 0 && (
          <span
            className={cn(
              "ms-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-medium leading-none",
              isActive ? "bg-[#6b4f2e] text-white" : "bg-[#8a6a52] text-white",
            )}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    )
  }

  const renderSection = (label: string, items: SidebarItem[]) => (
    <div className="space-y-1">
      {collapsed ? (
        <div className="mx-auto my-2 h-px w-6 bg-[var(--workspace-border)]" aria-hidden="true" />
      ) : (
        <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b4f2e]">
          {label}
        </p>
      )}
      {items.map((item) => renderItem(item))}
    </div>
  )

  return (
    <motion.aside
      className="fixed inset-y-0 start-0 z-30 hidden overflow-hidden bg-[var(--workspace-sidebar)] text-[var(--workspace-ink)] md:flex md:flex-col"
      aria-label="Workspace navigation"
      initial={false}
      animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0.2, 0, 0, 1] }}
    >
      <div className="flex h-12 shrink-0 items-center gap-2.5 bg-[var(--workspace-topbar)] px-3 text-white">
        {!collapsed && (
          <Link
            href="/dashboard"
            aria-label="AxLiner home"
            className="ax-interactive flex min-w-0 flex-1 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <AxMark className="h-8 w-auto invert" />
            <span className="truncate text-[18px] font-medium tracking-normal">AxLiner</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "ax-interactive flex size-8 items-center justify-center rounded-md text-white/80 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/30",
            collapsed && "mx-auto",
          )}
        >
          <PanelLeft className="size-[18px]" />
        </button>
      </div>

      <nav
        aria-label="Sections"
        onClick={handleRailClick}
        className={cn("flex flex-1 flex-col gap-1 px-2 py-3", collapsed && "cursor-pointer")}
      >
        {PRIMARY_ITEMS.map((item) => renderItem(item))}
        {renderSection("Documents", DOCUMENT_ITEMS)}
        {renderSection("Accounting", ACCOUNTING_ITEMS)}
        <div className="mt-auto border-t border-[var(--workspace-border)] pt-2">
          {SUPPORT_ITEMS.map((item) => renderItem(item))}
        </div>
      </nav>
    </motion.aside>
  )
}

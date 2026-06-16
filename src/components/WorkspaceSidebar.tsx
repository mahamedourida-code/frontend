"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Activity, BookCheck, BookOpenText, Building2, Inbox, Layers, ListChecks, PlugZap, ReceiptText, Settings, type LucideIcon } from "lucide-react"
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

const SIDEBAR_W = 220

// Top-level home. "Clients" is the one name everywhere (sidebar, mobile, ⌘K).
const PRIMARY_ITEMS: SidebarItem[] = [
  { key: "companies", label: "Clients", href: "/dashboard", icon: Building2 },
]

// The daily flow, flat and in pipeline order: intake → batch → review.
const DOCUMENT_ITEMS: SidebarItem[] = [
  { key: "inbox", label: "Inbox", href: "/dashboard/inbox", icon: Inbox },
  { key: "batches", label: "Batches", href: "/dashboard/batches", icon: Layers },
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

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-w", `${SIDEBAR_W}px`)
    return () => {
      document.documentElement.style.removeProperty("--sidebar-w")
    }
  }, [])

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
        className={cn(
          "ax-interactive relative flex h-[41px] items-center gap-2.5 rounded-md px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#8a6a52]/25",
          isActive
            ? "bg-[#efe7db] font-medium text-[#5b4636]"
            : "font-normal text-[var(--workspace-ink)] hover:bg-white hover:text-[#6b4f2e]",
        )}
      >
        {isActive ? <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[#8a6a52]" aria-hidden="true" /> : null}
        <span className="relative flex shrink-0 items-center justify-center">
          <Icon className={cn("size-[17px]", isActive ? "text-[#6b4f2e]" : "text-slate-700")} />
          {showDot && (
            <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-amber-400 ring-2 ring-[var(--workspace-sidebar)]" aria-hidden="true" />
          )}
        </span>
        <span className="truncate">{item.label}</span>
        {count > 0 && (
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
      <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b4f2e]">
        {label}
      </p>
      {items.map((item) => renderItem(item))}
    </div>
  )

  return (
    <aside
      className="fixed inset-y-0 start-0 z-30 hidden w-[220px] border-r border-[var(--workspace-border)] bg-[var(--workspace-sidebar)] text-[var(--workspace-ink)] md:flex md:flex-col"
      aria-label="Workspace navigation"
    >
      <Link
        href="/dashboard"
        aria-label="AxLiner home"
        className="ax-interactive flex h-12 items-center gap-2.5 border-b border-[#1a2d3d] bg-[var(--workspace-topbar)] px-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      >
        <AxMark className="h-8 w-auto invert" />
        <span className="text-[18px] font-medium tracking-normal">AxLiner</span>
      </Link>

      <nav aria-label="Sections" className="flex flex-1 flex-col gap-1 px-2 py-3">
        {PRIMARY_ITEMS.map((item) => renderItem(item))}
        {renderSection("Documents", DOCUMENT_ITEMS)}
        {renderSection("Accounting", ACCOUNTING_ITEMS)}
        <div className="mt-auto border-t border-[var(--workspace-border)] pt-2">
          {SUPPORT_ITEMS.map((item) => renderItem(item))}
        </div>
      </nav>
    </aside>
  )
}

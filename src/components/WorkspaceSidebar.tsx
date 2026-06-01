"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Activity, BookCheck, Home, Inbox, ReceiptText, Settings, Users, type LucideIcon } from "lucide-react"
import { AxMark } from "@/components/AppIcon"
import { useProcessingState } from "@/contexts/ProcessingStateContext"
import { cn } from "@/lib/utils"

export type WorkspaceSidebarItemKey =
  | "overview"
  | "clients"
  | "activity"
  | "inbox"
  | "review"
  | "accounts_payable"
  | "settings"
  | "process"
  | "history"
  | "integrations"
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
    "overview" | "clients" | "activity" | "inbox" | "review" | "accounts_payable" | "settings"
  >
  label: string
  href: string
  icon: LucideIcon
}

const SIDEBAR_W = 232

const NAV_ITEMS: SidebarItem[] = [
  { key: "overview", label: "Home", href: "/dashboard", icon: Home },
  { key: "clients", label: "Clients", href: "/dashboard/clients", icon: Users },
  { key: "activity", label: "Activity", href: "/history", icon: Activity },
  { key: "inbox", label: "Inbox", href: "/dashboard/inbox", icon: Inbox },
  { key: "review", label: "Review", href: "/dashboard/client", icon: BookCheck },
  { key: "accounts_payable", label: "Accounts payable", href: "/dashboard/accounts-payable", icon: ReceiptText },
  { key: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
]

function useReviewCount(): number {
  const { state } = useProcessingState()
  return state.processingComplete && Array.isArray(state.processedFiles) ? state.processedFiles.length : 0
}

function normalizeActiveItem(activeItem: WorkspaceSidebarItemKey): SidebarItem["key"] | null {
  if (activeItem === "process") return "review"
  if (activeItem === "history") return "activity"
  if (activeItem === "integrations") return "settings"
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

  return (
    <aside
      className="fixed inset-y-0 start-0 z-30 hidden w-[232px] border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col"
      aria-label="Workspace navigation"
    >
      <Link
        href="/dashboard"
        aria-label="AxLiner home"
        className="ax-interactive mx-3 mt-3 flex h-12 items-center gap-2.5 rounded-lg px-2 hover:bg-sidebar-accent/60"
      >
        <AxMark className="h-7 w-auto" />
        <span className="text-[16px] font-bold tracking-tight text-foreground">AxLiner</span>
      </Link>

      <nav aria-label="Sections" className="mt-5 flex flex-1 flex-col px-3 pb-4">
        {NAV_ITEMS.map((item) => {
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
                "ax-interactive relative flex h-11 items-center gap-3 rounded-lg px-3 text-[14px] font-semibold",
                item.key === "settings" && "mt-auto",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              {isActive && <span className="absolute inset-y-2 start-0 w-[3px] rounded-e-full bg-primary" aria-hidden="true" />}
              <span className="relative flex shrink-0 items-center justify-center">
                <Icon className={cn("size-[18px]", isActive && "text-foreground")} />
                {showDot && (
                  <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-amber-400 ring-2 ring-sidebar" aria-hidden="true" />
                )}
              </span>
              <span className="truncate">{item.label}</span>
              {count > 0 && (
                <span className="ms-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold leading-none text-primary-foreground">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

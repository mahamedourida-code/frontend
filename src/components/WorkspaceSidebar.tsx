"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Activity,
  BookCheck,
  BookOpenText,
  Building2,
  ChevronDown,
  FileOutput,
  FileText,
  Inbox,
  Landmark,
  Layers,
  ListChecks,
  NotebookText,
  PanelLeft,
  PlugZap,
  Receipt,
  ReceiptText,
  ScanSearch,
  Settings,
  SlidersHorizontal,
  Upload,
  type LucideIcon,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { AxMark } from "@/components/AppIcon"
import { useProcessingState } from "@/contexts/ProcessingStateContext"
import { useCurrentHash } from "@/hooks/useCurrentHash"
import { useMotionTokens } from "@/lib/motion"
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

type SidebarItem = {
  key: Extract<
    WorkspaceSidebarItemKey,
    | "companies"
    | "setup"
    | "activity"
    | "inbox"
    | "batches"
    | "review"
    | "accounts_payable"
    | "integrations"
    | "guide"
    | "settings"
    | "invoices"
    | "receipts"
    | "bank_statements"
    | "notes"
    | "auto_detect"
    | "upload"
    | "exports"
  >
  label: string
  href: string
  icon: LucideIcon
}

type SidebarGroupKey = "collect" | "review" | "output" | "uploadAs" | "manage"

type SidebarGroup = {
  key: SidebarGroupKey
  label: string
  icon: LucideIcon
  step?: string
  items: SidebarItem[]
}

// framer-motion-wrapped Link so nav items can carry quiet hover micro-motion.
const MotionLink = motion.create(Link)

const EXPANDED_W = 236
const COLLAPSED_W = 72
const STORAGE_KEY = "axliner:sidebarCollapsed"
const CORE_FLOW_GROUPS = new Set<SidebarGroupKey>(["collect", "review", "output"])

// "Clients" is the one name everywhere (sidebar, mobile, command palette).
const PRIMARY_ITEMS: SidebarItem[] = [
  { key: "companies", label: "Clients", href: "/dashboard", icon: Building2 },
  { key: "guide", label: "Guide", href: "/dashboard/guide", icon: BookOpenText },
]

const COLLECT_ITEMS: SidebarItem[] = [
  { key: "inbox", label: "Inbox", href: "/dashboard/inbox", icon: Inbox },
  { key: "upload", label: "Upload", href: "/dashboard/client#upload-files", icon: Upload },
]

const REVIEW_ITEMS: SidebarItem[] = [
  { key: "batches", label: "Stacks", href: "/dashboard/batches", icon: Layers },
  { key: "review", label: "Review", href: "/dashboard/client", icon: BookCheck },
]

const OUTPUT_ITEMS: SidebarItem[] = [
  { key: "exports", label: "Exports", href: "/dashboard/client#reviewed-outputs", icon: FileOutput },
  { key: "accounts_payable", label: "Draft bills", href: "/dashboard/accounts-payable", icon: ReceiptText },
  { key: "integrations", label: "Integrations", href: "/dashboard/integrations", icon: PlugZap },
]

const UPLOAD_AS_ITEMS: SidebarItem[] = [
  { key: "auto_detect", label: "Auto-detect", href: "/dashboard/auto-detect", icon: ScanSearch },
  { key: "invoices", label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { key: "receipts", label: "Receipts", href: "/dashboard/receipts", icon: Receipt },
  { key: "bank_statements", label: "Statements", href: "/dashboard/bank-statements", icon: Landmark },
  { key: "notes", label: "Notes", href: "/dashboard/notes", icon: NotebookText },
]

const MANAGE_ITEMS: SidebarItem[] = [
  { key: "setup", label: "Setup", href: "/dashboard/setup", icon: ListChecks },
  { key: "activity", label: "Activity", href: "/history", icon: Activity },
  { key: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
]

const SIDEBAR_GROUPS: SidebarGroup[] = [
  { key: "collect", label: "Collect", icon: Inbox, step: "1", items: COLLECT_ITEMS },
  { key: "review", label: "Review", icon: BookCheck, step: "2", items: REVIEW_ITEMS },
  { key: "output", label: "Output", icon: ReceiptText, step: "3", items: OUTPUT_ITEMS },
  { key: "uploadAs", label: "Upload as", icon: Upload, items: UPLOAD_AS_ITEMS },
  { key: "manage", label: "Manage", icon: SlidersHorizontal, items: MANAGE_ITEMS },
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
  const currentHash = useCurrentHash()
  const shellActiveItem = normalizeActiveItem(activeItem)
  const normalizedActiveItem = shellActiveItem === "review" && currentHash === "#upload-files"
    ? "upload"
    : shellActiveItem === "review" && currentHash === "#reviewed-outputs"
      ? "exports"
      : shellActiveItem
  const m = useMotionTokens()
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<SidebarGroupKey, boolean>>({
    collect: true,
    review: true,
    output: true,
    uploadAs: false,
    manage: false,
  })

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

  useEffect(() => {
    const activeGroup = SIDEBAR_GROUPS.find((group) =>
      group.items.some((item) => item.key === normalizedActiveItem),
    )
    if (!activeGroup) return

    setOpenGroups((current) =>
      current[activeGroup.key] ? current : { ...current, [activeGroup.key]: true },
    )
  }, [normalizedActiveItem])

  // In the collapsed rail, empty space reopens the full navigation. Icon links
  // still navigate without changing the user's preferred rail width.
  const handleRailClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!collapsed) return
      if ((event.target as HTMLElement).closest("a,button")) return
      setCollapsed(false)
    },
    [collapsed],
  )

  const renderItem = (item: SidebarItem, nested = false) => {
    const Icon = item.icon
    const isActive = normalizedActiveItem === item.key
    const showDot = Boolean(notifications?.[item.key])
    const count = item.key === "review" ? reviewCount : item.key === "inbox" ? unreadCount : 0
    const activeSpring = m.reduced ? { duration: 0 } : m.springSnappy

    return (
      <MotionLink
        key={item.key}
        href={item.href}
        data-workspace-tour={
          item.key === "companies"
            ? "clients"
            : item.key === "upload"
              ? "upload"
              : item.key === "review"
                ? "review"
                : item.key === "exports"
                  ? "outputs"
                  : undefined
        }
        aria-current={isActive ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        whileHover={m.reduced ? undefined : { x: nested ? 1 : 2 }}
        whileTap={m.reduced ? undefined : { scale: 0.985 }}
        transition={m.reduced ? { duration: 0 } : m.springSnappy}
        className={cn(
          "ax-interactive relative flex items-center overflow-hidden rounded-full border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-black/25",
          collapsed
            ? "h-10 justify-center px-0"
            : nested
              ? "h-9 gap-2.5 px-3 text-[14px]"
              : "h-10 gap-2.5 px-3 text-[15px]",
          isActive
            ? "border-[var(--workspace-selection-border)] bg-white font-semibold text-[var(--workspace-ink)] shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
            : "font-medium text-slate-700 hover:border-[var(--workspace-border)] hover:bg-white/80 hover:text-[var(--workspace-primary)]",
        )}
      >
        {isActive ? (
          <motion.span
            layoutId="sidebar-active"
            transition={activeSpring}
            className="absolute inset-0 rounded-full bg-white"
            aria-hidden="true"
          />
        ) : null}
        {isActive && !collapsed ? (
          <motion.span
            layoutId="sidebar-active-bar"
            transition={activeSpring}
            className="absolute left-1.5 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-[var(--workspace-primary)]"
            aria-hidden="true"
          />
        ) : null}
        {isActive && collapsed ? (
          <motion.span
            layoutId="sidebar-active-dot"
            transition={activeSpring}
            className="absolute right-1.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[var(--workspace-primary)]"
            aria-hidden="true"
          />
        ) : null}
        <span className="relative z-10 flex shrink-0 items-center justify-center">
          <Icon
            className={cn(
              nested && !collapsed ? "size-4" : "size-[18px]",
              "text-black",
            )}
          />
          {(showDot || (collapsed && count > 0)) && (
            <span
              className="absolute -right-1 -top-1 size-1.5 rounded-full bg-amber-400 ring-2 ring-[var(--workspace-sidebar)]"
              aria-hidden="true"
            />
          )}
        </span>
        {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
        {!collapsed && count > 0 && (
          <span
            className={cn(
              "relative z-10 ms-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-none",
              isActive ? "bg-[var(--workspace-primary)] text-white" : "bg-[var(--workspace-primary-hover)] text-white",
            )}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </MotionLink>
    )
  }

  const renderGroup = (group: SidebarGroup) => {
    const GroupIcon = group.icon
    const containsActiveItem = group.items.some((item) => item.key === normalizedActiveItem)

    if (collapsed) {
      return (
        <div key={group.key} className="space-y-1.5">
          <div
            className={cn(
              "mx-auto mt-2 flex h-6 w-10 items-center justify-center rounded-full text-[11px] font-semibold",
              group.step
                ? "border border-[var(--workspace-border)] bg-white text-slate-500"
                : "text-slate-500",
            )}
            title={group.label}
            aria-hidden="true"
          >
            {group.step ? group.step : <GroupIcon className="size-3.5 text-black" />}
          </div>
          {group.items.map((item) => renderItem(item))}
        </div>
      )
    }

    if (CORE_FLOW_GROUPS.has(group.key)) {
      return (
        <div key={group.key} className="space-y-1.5">
          <div
            className={cn(
              "flex h-7 items-center gap-2 px-3 pt-1 text-[12px] font-semibold text-slate-500",
              containsActiveItem && "text-[var(--workspace-ink)]",
            )}
          >
            <span
              className={cn(
                "inline-flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] tabular-nums",
                containsActiveItem
                  ? "border-[var(--workspace-selection-border)] bg-white text-black"
                  : "border-[var(--workspace-border)] bg-white/70 text-black",
              )}
            >
              {group.step}
            </span>
            <span>{group.label}</span>
            <span className="h-px flex-1 bg-[var(--workspace-border)]" aria-hidden="true" />
          </div>
          <div className="space-y-0.5">{group.items.map((item) => renderItem(item, true))}</div>
        </div>
      )
    }

    const isOpen = openGroups[group.key]

    return (
      <div key={group.key} className="space-y-1.5">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`sidebar-group-${group.key}`}
          onClick={() => setOpenGroups((current) => ({ ...current, [group.key]: !current[group.key] }))}
          className={cn(
            "ax-interactive flex h-9 w-full items-center gap-2.5 rounded-full border border-transparent px-3 text-[13px] font-semibold text-slate-600 outline-none hover:border-[var(--workspace-border)] hover:bg-white/80 hover:text-[var(--workspace-ink)] focus-visible:ring-2 focus-visible:ring-black/25",
            containsActiveItem && "border-[var(--workspace-selection-border)] bg-white text-[var(--workspace-ink)]",
          )}
        >
          <GroupIcon
            className={cn(
              "size-4 text-black",
            )}
          />
          <span className="flex-1 text-left">{group.label}</span>
          <ChevronDown
            className={cn(
              "size-3.5 text-black transition-transform duration-150 ease-out",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              id={`sidebar-group-${group.key}`}
              key="items"
              initial={m.reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={m.reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={m.reduced ? { duration: 0 } : { duration: m.dur.fast, ease: m.ease }}
              className="ml-4 overflow-hidden border-l border-[var(--workspace-border)] pl-2"
            >
              <div className="space-y-0.5 py-0.5">{group.items.map((item) => renderItem(item, true))}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.aside
      className="fixed inset-y-0 start-0 z-30 hidden overflow-hidden border-r border-[var(--workspace-border)] bg-[var(--workspace-sidebar)] text-[var(--workspace-ink)] md:flex md:flex-col"
      aria-label="Workspace navigation"
      initial={false}
      animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
      transition={m.reduced ? { duration: 0 } : { duration: m.dur.slow, ease: m.ease }}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-white/10 bg-[#213445] px-3 text-white",
          collapsed ? "justify-center gap-1.5 px-2" : "gap-2.5",
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {collapsed ? (
            <motion.div
              key="mark"
              initial={m.reduced ? false : { opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={m.reduced ? { opacity: 0 } : { opacity: 0, x: -4 }}
              transition={m.reduced ? { duration: 0 } : m.tFast}
            >
              <Link
                href="/dashboard"
                aria-label="AxLiner home"
                className="ax-interactive flex size-9 items-center justify-center rounded-full outline-none hover:bg-white/8 focus-visible:ring-2 focus-visible:ring-white/30"
              >
                <AxMark className="h-8 w-auto" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="brand"
              initial={m.reduced ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={m.reduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
              transition={m.reduced ? { duration: 0 } : m.tFast}
              className="min-w-0 flex-1"
            >
              <Link
                href="/dashboard"
                aria-label="AxLiner home"
                className="ax-interactive flex min-w-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                <AxMark className="h-9 w-auto" />
                <span className="truncate text-[19px] font-semibold tracking-normal">AxLiner</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ax-interactive flex size-9 items-center justify-center rounded-full text-white/76 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <PanelLeft className="size-[18px]" />
        </button>
      </div>

      <motion.nav
        aria-label="Sections"
        onClick={handleRailClick}
        initial={m.reduced ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.reduced ? { duration: 0 } : m.tBase}
        className={cn("flex flex-1 flex-col gap-3 overflow-y-auto px-2.5 py-3", collapsed && "cursor-pointer px-2")}
      >
        <div className="space-y-1 border-b border-[var(--workspace-border)] pb-3">
          {PRIMARY_ITEMS.map((item) => renderItem(item))}
        </div>
        <div className="space-y-3">
          {SIDEBAR_GROUPS.slice(0, -1).map((group) => renderGroup(group))}
        </div>
        <div className="mt-auto border-t border-[var(--workspace-border)] pt-3">
          {renderGroup(SIDEBAR_GROUPS[SIDEBAR_GROUPS.length - 1])}
        </div>
      </motion.nav>
    </motion.aside>
  )
}

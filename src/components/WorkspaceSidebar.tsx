"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  BookCheck,
  Building2,
  CalendarRange,
  Cloud,
  FileSpreadsheet,
  FolderInput,
  History,
  Inbox,
  LineChart,
  Link2,
  Mail,
  Receipt,
  ReceiptText,
  ScanLine,
  Settings,
  Sparkles,
  Store,
  Table2,
  Upload,
  Users,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { AxMark } from "@/components/AppIcon"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * Two-tier workspace nav, modeled on SEMRUSH's app shell.
 *
 *  ┌──┐┌──────────────────────┐
 *  │ ▢│  Section title         │   ← thin icon RAIL (always 56px) +
 *  │ ▢│  ── Group header ──     │     a contextual FLYOUT panel that
 *  │ ▢│   • Sub-choice          │     reveals EVERY sub-choice of the
 *  │ ▢│   • Sub-choice          │     hovered / active section, grouped
 *  └──┘└──────────────────────┘     under small section headers.
 *
 * The rail stays at --sidebar-w (56px). The flyout floats over content
 * (absolute) so it does NOT shift the page offset — the layout contract
 * (--sidebar-w = rail width) is preserved.
 */

type SidebarItemKey =
  | "overview"
  | "process"
  | "inbox"
  | "accounts_payable"
  | "integrations"
  | "history"
  | "pricing"
  | "settings"

interface WorkspaceSidebarProps {
  activeItem: SidebarItemKey
  unreadCount?: number
  notifications?: Partial<Record<SidebarItemKey, boolean>>
  user?: {
    id?: string | null
    email?: string | null
    user_metadata?: {
      avatar_url?: string | null
      full_name?: string | null
      name?: string | null
    }
  } | null
}

type SubLink = {
  label: string
  href?: string
  icon: LucideIcon
  soon?: boolean
}

type SubGroup = {
  header: string
  links: SubLink[]
}

type Section = {
  key: SidebarItemKey
  label: string
  icon: LucideIcon
  href: string
  /** Optional grouped sub-choices revealed in the flyout panel. */
  groups?: SubGroup[]
}

const SECTIONS: Section[] = [
  {
    key: "overview",
    label: "Overview",
    icon: Activity,
    href: "/dashboard",
    groups: [
      {
        header: "Workspace",
        links: [
          { label: "Dashboard", href: "/dashboard", icon: Activity },
          { label: "Monthly recap", href: "/dashboard", icon: CalendarRange },
          { label: "Reports", href: "/dashboard", icon: LineChart },
        ],
      },
    ],
  },
  {
    key: "process",
    label: "Convert",
    icon: Upload,
    href: "/dashboard/client",
    groups: [
      {
        header: "Intake",
        links: [
          { label: "Upload files", href: "/dashboard/client#upload-files", icon: Upload },
          { label: "Auto detect", href: "/dashboard/auto-detect", icon: Sparkles },
          { label: "Upload by type", href: "/dashboard/upload-type", icon: FolderInput },
        ],
      },
      {
        header: "Document modes",
        links: [
          { label: "Table", href: "/dashboard/client", icon: Table2 },
          { label: "Invoices", href: "/dashboard/invoices", icon: ReceiptText },
          { label: "Receipts", href: "/dashboard/receipts", icon: Receipt },
          { label: "Invoices + Receipts", href: "/dashboard/invoice-receipts", icon: ScanLine },
          { label: "Bank statements", href: "/dashboard/bank-statements", icon: Building2 },
          { label: "Notes", href: "/dashboard/notes", icon: FileSpreadsheet },
        ],
      },
      {
        header: "Review",
        links: [
          { label: "Review board", href: "/dashboard/client", icon: BookCheck },
        ],
      },
    ],
  },
  {
    key: "accounts_payable",
    label: "Accounts Payable",
    icon: ReceiptText,
    href: "/dashboard/accounts-payable",
    groups: [
      {
        header: "Queue",
        links: [
          { label: "All bills", href: "/dashboard/accounts-payable", icon: ReceiptText },
          { label: "Needs coding", href: "/dashboard/accounts-payable", icon: FileSpreadsheet },
          { label: "Needs review", href: "/dashboard/accounts-payable", icon: BookCheck },
          { label: "Ready to publish", href: "/dashboard/accounts-payable", icon: Wallet },
          { label: "Published", href: "/dashboard/accounts-payable", icon: BookCheck },
          { label: "Failed", href: "/dashboard/accounts-payable", icon: Activity },
        ],
      },
      {
        header: "Coding",
        links: [
          { label: "Vendor rules", href: "/dashboard/settings?section=vendors", icon: Store },
        ],
      },
    ],
  },
  {
    key: "inbox",
    label: "Inbox",
    icon: Inbox,
    href: "/dashboard/inbox",
    groups: [
      {
        header: "Intake",
        links: [
          { label: "Client uploads", href: "/dashboard/inbox", icon: Users },
          { label: "Email intake", href: "/dashboard/inbox", icon: Mail },
          { label: "Upload links", href: "/dashboard/inbox", icon: Link2 },
          { label: "Watch folder", href: "/dashboard/inbox", icon: Cloud },
        ],
      },
    ],
  },
  {
    key: "integrations",
    label: "Integrations",
    icon: Building2,
    href: "/dashboard/integrations",
    groups: [
      {
        header: "Accounting",
        links: [
          { label: "QuickBooks", href: "/dashboard/integrations", icon: BookCheck },
          { label: "Xero", icon: Link2, soon: true },
        ],
      },
      {
        header: "Storage",
        links: [
          { label: "Google Drive", href: "/dashboard/integrations", icon: Cloud },
          { label: "Dropbox", href: "/dashboard/integrations", icon: Cloud },
          { label: "Email forwarding", href: "/dashboard/inbox", icon: Mail },
        ],
      },
      {
        header: "Routing",
        links: [
          { label: "Workflows", icon: Workflow, soon: true },
          { label: "Auto-publish rules", icon: Sparkles, soon: true },
        ],
      },
    ],
  },
  {
    key: "history",
    label: "History",
    icon: History,
    href: "/history",
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    groups: [
      {
        header: "Account",
        links: [
          { label: "Profile", href: "/dashboard/settings?section=account", icon: Users },
          { label: "Preferences", href: "/dashboard/settings?section=preferences", icon: Settings },
          { label: "Notifications", href: "/dashboard/settings?section=preferences", icon: Activity },
        ],
      },
      {
        header: "Coding",
        links: [
          { label: "Vendor memory", href: "/dashboard/settings?section=vendors", icon: Store },
        ],
      },
      {
        header: "Billing",
        links: [
          { label: "Plan & credits", href: "/dashboard/settings?section=billing", icon: Wallet },
          { label: "Manage billing", href: "/dashboard/settings?section=billing", icon: BookCheck },
        ],
      },
    ],
  },
]

const RAIL_W = 56
const LS_KEY = "ax-sidebar-collapsed"

function setSidebarCssVar(px: number) {
  document.documentElement.style.setProperty("--sidebar-w", `${px}px`)
}

export function WorkspaceSidebar({ activeItem, unreadCount = 0, notifications }: WorkspaceSidebarProps) {
  const pathname = usePathname()
  // The rail width is fixed; "collapsed" only controls whether the flyout
  // is allowed to auto-open for the active section (pinned-open) on mount.
  const [pinnedKey, setPinnedKey] = useState<SidebarItemKey | null>(null)
  const [hoverKey, setHoverKey] = useState<SidebarItemKey | null>(null)
  // Current `?query` string, read after mount so render stays SSR-safe.
  const [search, setSearch] = useState("")
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // The rail is always the layout offset — flyout floats over content.
    setSidebarCssVar(RAIL_W)
    try {
      // Restore the user's pin preference for the active section.
      if (localStorage.getItem(LS_KEY) === "0") setPinnedKey(activeItem)
    } catch {}
  }, [activeItem])

  useEffect(() => {
    setSearch(window.location.search)
  }, [pathname])

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const openSection = (key: SidebarItemKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setHoverKey(key)
  }

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setHoverKey(null), 140)
  }

  const togglePin = (key: SidebarItemKey) => {
    setPinnedKey((prev) => {
      const next = prev === key ? null : key
      try { localStorage.setItem(LS_KEY, next ? "0" : "1") } catch {}
      return next
    })
  }

  // Which section's flyout is visible: hover wins, else the pinned one.
  const flyoutKey = hoverKey ?? pinnedKey
  const flyoutSection = SECTIONS.find((s) => s.key === flyoutKey && s.groups?.length)

  return (
    <motion.aside
      className="fixed inset-y-0 start-0 z-30 hidden md:block"
      style={{ width: RAIL_W }}
      onMouseLeave={scheduleClose}
    >
      <div className="flex h-full">
        {/* ── Tier 1: thin ICON RAIL ─────────────────────────────────── */}
        <div className="flex h-full w-14 flex-col items-center border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          {/* Brand mark */}
          <Link
            href="/dashboard"
            aria-label="AxLiner home"
            className="ax-interactive mt-2 flex h-12 w-12 items-center justify-center rounded-lg hover:bg-sidebar-accent/60"
          >
            <AxMark className="h-7 w-auto" />
          </Link>

          {/* Upload button — kept in the left nav */}
          <div className="mb-4 mt-1 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="glossy" size="icon" className="h-10 w-10">
                  <Link href="/dashboard/client#upload-files" aria-label="Upload files">
                    <Upload className="size-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Upload</TooltipContent>
            </Tooltip>
          </div>

          {/* Section icons */}
          <nav aria-label="Sections" className="flex flex-1 flex-col items-center gap-1.5 overflow-y-auto py-1">
            {SECTIONS.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.key
              const showDot = Boolean(notifications?.[item.key])
              const inboxBadgeVisible = item.key === "inbox" && unreadCount > 0
              const inboxBadgeLabel = unreadCount > 99 ? "99+" : String(unreadCount)
              const isOpen = flyoutKey === item.key && Boolean(item.groups?.length)

              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onMouseEnter={() => openSection(item.key)}
                      onFocus={() => openSection(item.key)}
                      onClick={() => item.groups?.length && togglePin(item.key)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "ax-interactive relative flex h-10 w-10 items-center justify-center rounded-lg",
                        isActive || isOpen
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-[2px] bg-primary"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative">
                        <Icon className={cn("size-[18px] shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
                        {showDot && (
                          <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-amber-400 ring-2 ring-sidebar" aria-hidden="true" />
                        )}
                        {inboxBadgeVisible && (
                          <span className="absolute -right-1 -top-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground ring-2 ring-sidebar">
                            {inboxBadgeLabel}
                          </span>
                        )}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                    {inboxBadgeVisible ? ` · ${inboxBadgeLabel}` : ""}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </nav>

          {/* Pricing pinned to the bottom of the rail */}
          <div className="mb-3 mt-1 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/pricing"
                  aria-label="Pricing"
                  className="ax-interactive flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                >
                  <Sparkles className="size-[18px]" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Pricing</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* ── Tier 2: contextual FLYOUT panel (floats over content) ───── */}
        <AnimatePresence>
          {flyoutSection && (
            <motion.div
              key={flyoutSection.key}
              role="navigation"
              aria-label={`${flyoutSection.label} sections`}
              onMouseEnter={() => openSection(flyoutSection.key)}
              onMouseLeave={scheduleClose}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
              className="absolute inset-y-0 left-14 flex w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[8px_0_24px_-16px_rgba(15,23,42,0.35)]"
            >
              <div className="flex h-12 shrink-0 items-center px-4">
                <span className="truncate text-[15px] font-bold text-foreground">{flyoutSection.label}</span>
              </div>

              <div className="flex-1 overflow-y-auto px-2 pb-4">
                {flyoutSection.groups!.map((group, gi) => (
                  <div key={group.header} className={cn(gi > 0 && "mt-4")}>
                    <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {group.header}
                    </p>
                    <div className="space-y-0.5">
                      {group.links.map((link, li) => {
                        const SubIcon = link.icon
                        const selected = Boolean(link.href) && pathname + search === link.href

                        if (link.soon || !link.href) {
                          return (
                            <div
                              key={link.label}
                              aria-disabled="true"
                              className="flex h-9 cursor-default items-center gap-2.5 rounded-md px-2 text-[13px] font-medium opacity-55"
                            >
                              <SubIcon className="size-4 shrink-0 text-muted-foreground" />
                              <span className="truncate text-foreground">{link.label}</span>
                              <span className="ms-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                                Soon
                              </span>
                            </div>
                          )
                        }

                        return (
                          <motion.div
                            key={link.label}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.16, ease: [0.2, 0, 0, 1], delay: (gi * 4 + li) * 0.02 }}
                          >
                            <Link
                              href={link.href}
                              onClick={scheduleClose}
                              className={cn(
                                "ax-interactive flex h-9 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium",
                                selected
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                              )}
                            >
                              <SubIcon className={cn("size-4 shrink-0", selected ? "text-foreground" : "text-muted-foreground")} />
                              <span className="truncate">{link.label}</span>
                            </Link>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}

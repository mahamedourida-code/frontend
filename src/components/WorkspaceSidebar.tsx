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
import { useProcessingState } from "@/contexts/ProcessingStateContext"
import { cn } from "@/lib/utils"

/**
 * Workspace nav — a thin icon RAIL that can expand to icon+label, plus a
 * contextual FLYOUT panel for sections that have sub-choices.
 *
 * The rail is grouped by the DAILY FLOW with two hairline dividers and no text
 * labels (the icons + tooltips carry the meaning):
 *
 *   [Overview]
 *   ───────────── divider
 *   [Convert · Review board ⭐ (the hero — the only colored glyph)]
 *   ───────────── divider
 *   [Accounts Payable · Inbox · Integrations]
 *   ───────────── divider
 *   [History · … Settings (bottom) · Upgrade]
 *
 * Flyout rules (no always-open / no auto-pin):
 *   opens on hover / focus / icon click; closes on (a) sub-choice click,
 *   (b) route change, (c) mouse-leave (140ms grace), (d) outside-click / Esc.
 *
 * Clicking EMPTY rail space toggles icon-only ↔ icon+label (persisted). The
 * rail width drives `--sidebar-w` so the content offset stays correct.
 */

type SidebarItemKey =
  | "overview"
  | "process"
  | "review"
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
  /** Hero (Review board) renders the only colored glyph in the rail. */
  hero?: boolean
  /** Optional grouped sub-choices revealed in the flyout panel. */
  groups?: SubGroup[]
}

/** The rail is rendered in flow-grouped clusters separated by hairline rules. */
const SECTION_GROUPS: Section[][] = [
  // ── 1. Overview ─────────────────────────────────────────────────────────
  [
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
  ],
  // ── 2. Convert + Review board (the hero) ────────────────────────────────
  [
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
      ],
    },
    {
      key: "review",
      label: "Review board",
      icon: BookCheck,
      href: "/dashboard/client",
      hero: true,
    },
  ],
  // ── 3. Accounts Payable · Inbox · Integrations ──────────────────────────
  [
    {
      key: "accounts_payable",
      label: "Accounts Payable",
      icon: ReceiptText,
      href: "/dashboard/accounts-payable",
      groups: [
        {
          header: "Queue",
          links: [
            { label: "All", href: "/dashboard/accounts-payable", icon: ReceiptText },
            { label: "Needs review", href: "/dashboard/accounts-payable?status=needs_review", icon: BookCheck },
            { label: "Ready", href: "/dashboard/accounts-payable?status=ready_to_publish", icon: Wallet },
            { label: "Published", href: "/dashboard/accounts-payable?status=published", icon: BookCheck },
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
  ],
  // ── 4. History (Settings is bottom-pinned, rendered separately) ──────────
  [
    {
      key: "history",
      label: "History",
      icon: History,
      href: "/history",
    },
  ],
]

const SETTINGS_SECTION: Section = {
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
}

const RAIL_W = 56
const RAIL_EXPANDED_W = 224
const LS_COLLAPSED = "ax-sidebar-collapsed" // legacy key (flyout pin) — retired
const LS_EXPANDED = "ax-sidebar-expanded"

function setSidebarCssVar(px: number) {
  document.documentElement.style.setProperty("--sidebar-w", `${px}px`)
}

/**
 * Derive a "to review" count from available client state. We never block on a
 * network call here: if nothing usable is present we render no number.
 */
function useReviewCount(): number {
  const { state } = useProcessingState()
  // Files that finished processing but haven't been reviewed/exported yet are
  // the user's review queue. Fall back to 0 (→ no badge) when absent.
  if (state.processingComplete && Array.isArray(state.processedFiles)) {
    return state.processedFiles.length
  }
  return 0
}

export function WorkspaceSidebar({ activeItem, unreadCount = 0, notifications }: WorkspaceSidebarProps) {
  const pathname = usePathname()
  const reviewCount = useReviewCount()

  // Flyout: which section is open (hover/focus/click). Never auto-pinned.
  const [openKey, setOpenKey] = useState<SidebarItemKey | null>(null)
  // Rail expand-to-labels (persisted). Icon-only is the default.
  const [expanded, setExpanded] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const asideRef = useRef<HTMLElement | null>(null)

  // Badge pulse: fire one scale-pulse only when the count INCREASES.
  const [pulse, setPulse] = useState(0)
  const prevReviewCount = useRef(reviewCount)
  useEffect(() => {
    if (reviewCount > prevReviewCount.current) setPulse((p) => p + 1)
    prevReviewCount.current = reviewCount
  }, [reviewCount])

  // Restore the expand preference, then keep --sidebar-w in sync with width.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_EXPANDED)
      if (saved === "1") setExpanded(true)
      localStorage.removeItem(LS_COLLAPSED)
    } catch {}
  }, [])

  useEffect(() => {
    setSidebarCssVar(expanded ? RAIL_EXPANDED_W : RAIL_W)
  }, [expanded])

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  // (b) Route change closes the flyout.
  useEffect(() => {
    setOpenKey(null)
  }, [pathname])

  // (d) Outside-click + Esc close the flyout.
  useEffect(() => {
    if (!openKey) return
    const onPointerDown = (e: PointerEvent) => {
      if (asideRef.current && !asideRef.current.contains(e.target as Node)) {
        setOpenKey(null)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenKey(null)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [openKey])

  const openSection = (key: SidebarItemKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenKey(key)
  }

  // (c) Mouse-leave with a ~140ms grace so a diagonal trip to the flyout holds.
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenKey(null), 140)
  }

  // (a) Sub-choice click closes immediately.
  const closeNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenKey(null)
  }

  // Expand-to-labels toggle, persisted to localStorage.
  const toggleExpand = () => {
    setExpanded((v) => {
      const next = !v
      try { localStorage.setItem(LS_EXPANDED, next ? "1" : "0") } catch {}
      return next
    })
  }

  const allSections = [...SECTION_GROUPS.flat(), SETTINGS_SECTION]
  const flyoutSection = allSections.find((s) => s.key === openKey && s.groups?.length)
  const railW = expanded ? RAIL_EXPANDED_W : RAIL_W

  const isActiveSection = (item: Section) => {
    if (item.key === activeItem) return true
    // Review shares /dashboard/client with Convert — disambiguate by hash isn't
    // available server-side, so highlight Review when the review board is in view.
    return false
  }

  // ── A single rail icon (optionally with an inline label when expanded) ───
  const renderIcon = (item: Section) => {
    const Icon = item.icon
    const isActive = isActiveSection(item)
    const isOpen = openKey === item.key && Boolean(item.groups?.length)
    const showDot = Boolean(notifications?.[item.key])
    const inboxBadgeVisible = item.key === "inbox" && unreadCount > 0
    const inboxBadgeLabel = unreadCount > 99 ? "99+" : String(unreadCount)
    const reviewBadgeVisible = item.hero && reviewCount > 0
    const reviewBadgeLabel = reviewCount > 99 ? "99+" : String(reviewCount)

    const link = (
      <Link
        href={item.href}
        onMouseEnter={() => item.groups?.length && openSection(item.key)}
        onFocus={() => item.groups?.length && openSection(item.key)}
        onClick={(e) => {
          // Icon click toggles its own flyout (without blocking navigation for
          // leaf items). For sections with a flyout, the click opens/closes it.
          if (item.groups?.length) {
            e.preventDefault()
            setOpenKey((prev) => (prev === item.key ? null : item.key))
          } else {
            closeNow()
          }
        }}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "ax-interactive relative flex h-10 items-center rounded-lg",
          expanded ? "w-full gap-3 px-3" : "w-10 justify-center",
          item.hero
            ? "bg-[var(--brand-green)] text-[var(--brand-green-fg)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_0_1px_var(--brand-green-ring),0_1px_3px_0_rgba(0,0,0,0.12)] hover:bg-[var(--brand-green-hover)]"
            : isActive || isOpen
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        )}
      >
        {isActive && !item.hero && (
          <motion.span
            layoutId="sidebar-active-indicator"
            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-[2px] bg-primary"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        )}
        <span className="relative flex shrink-0 items-center justify-center">
          <Icon
            className={cn(
              "size-[18px] shrink-0",
              item.hero
                ? "text-[var(--brand-green-fg)]"
                : isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
            )}
          />
          {showDot && (
            <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-amber-400 ring-2 ring-sidebar" aria-hidden="true" />
          )}
          {inboxBadgeVisible && (
            <span className="absolute -right-1 -top-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground ring-2 ring-sidebar">
              {inboxBadgeLabel}
            </span>
          )}
          {/* Hero "to review" badge — small emerald count with a one-shot pulse. */}
          {reviewBadgeVisible && !expanded && (
            <motion.span
              key={pulse}
              initial={pulse > 0 ? { scale: 0.6 } : false}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
              className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground ring-2 ring-sidebar"
              aria-label={`${reviewBadgeLabel} to review`}
            >
              {reviewBadgeLabel}
            </motion.span>
          )}
        </span>
        {expanded && (
          <>
            <span className="truncate text-[13px] font-medium">{item.label}</span>
            {reviewBadgeVisible && (
              <motion.span
                key={pulse}
                initial={pulse > 0 ? { scale: 0.6 } : false}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 600, damping: 18 }}
                className="ms-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold leading-none text-primary-foreground"
              >
                {reviewBadgeLabel}
              </motion.span>
            )}
            {inboxBadgeVisible && !reviewBadgeVisible && (
              <span className="ms-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold leading-none text-primary-foreground">
                {inboxBadgeLabel}
              </span>
            )}
          </>
        )}
      </Link>
    )

    if (expanded) return <div key={item.key}>{link}</div>

    return (
      <Tooltip key={item.key}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">
          {item.label}
          {item.hero && reviewBadgeVisible ? ` · ${reviewBadgeLabel} to review` : ""}
          {inboxBadgeVisible ? ` · ${inboxBadgeLabel}` : ""}
        </TooltipContent>
      </Tooltip>
    )
  }

  const Divider = () => (
    <div className={cn("my-2", expanded ? "mx-3" : "mx-2.5")}>
      <div className="h-px bg-border/10" />
    </div>
  )

  return (
    <motion.aside
      ref={asideRef}
      className="fixed inset-y-0 start-0 z-30 hidden md:block"
      style={{ width: railW }}
      animate={{ width: railW }}
      transition={{ type: "spring", stiffness: 420, damping: 38 }}
      onMouseLeave={scheduleClose}
    >
      <div className="flex h-full">
        {/* ── Tier 1: the icon RAIL (expands to icon+label) ──────────────── */}
        <div
          className={cn(
            "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
            expanded ? "w-56 items-stretch px-2" : "w-14 items-center"
          )}
        >
          {/* Brand mark */}
          <Link
            href="/dashboard"
            aria-label="AxLiner home"
            className={cn(
              "ax-interactive mt-2 flex h-12 items-center rounded-lg hover:bg-sidebar-accent/60",
              expanded ? "gap-2 px-2" : "w-12 justify-center"
            )}
          >
            <AxMark className="h-7 w-auto" />
            {expanded && <span className="text-[15px] font-bold tracking-tight text-foreground">AxLiner</span>}
          </Link>

          {/* Upload button — kept in the left nav */}
          <div className={cn("mb-3 mt-1 flex", expanded ? "px-1" : "justify-center")}>
            {expanded ? (
              <Button asChild variant="glossy" className="h-10 w-full justify-start gap-2.5 px-3">
                <Link href="/dashboard/client#upload-files" aria-label="Upload files">
                  <Upload className="size-4" />
                  <span className="text-[13px] font-semibold">Upload files</span>
                </Link>
              </Button>
            ) : (
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
            )}
          </div>

          {/* Section icons — flow-grouped, hairline dividers, no text labels.
              Clicking EMPTY rail space toggles expand ↔ collapse. */}
          <nav
            aria-label="Sections"
            onClick={(e) => {
              // Only toggle when the bare nav background is clicked, never a child.
              if (e.target === e.currentTarget) {
                toggleExpand()
              }
            }}
            className={cn("flex flex-1 flex-col overflow-y-auto py-1", expanded ? "gap-1" : "items-center gap-1.5")}
          >
            {SECTION_GROUPS.map((group, gi) => (
              <div key={gi} className={cn("flex flex-col", expanded ? "gap-1" : "items-center gap-1.5")}>
                {group.map((item) => renderIcon(item))}
                {gi < SECTION_GROUPS.length - 1 && <Divider />}
              </div>
            ))}

            {/* Spacer pushes Settings to the bottom; this large empty area is the
                primary expand/collapse target. */}
            <button
              type="button"
              aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
              onClick={toggleExpand}
              className="ax-interactive flex-1 cursor-pointer"
            />
            <Divider />
            {renderIcon(SETTINGS_SECTION)}
          </nav>

          {/* Upgrade pinned to the bottom of the rail */}
          <div className={cn("mb-3 mt-1 flex", expanded ? "px-1" : "justify-center")}>
            {expanded ? (
              <Link
                href="/pricing"
                aria-label="Upgrade"
                className="ax-interactive flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              >
                <Sparkles className="size-[18px]" />
                <span className="text-[13px] font-medium">Upgrade</span>
              </Link>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/pricing"
                    aria-label="Upgrade"
                    className="ax-interactive flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  >
                    <Sparkles className="size-[18px]" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Upgrade</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* ── Tier 2: contextual FLYOUT panel (floats over content) ───────── */}
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
              style={{ left: railW }}
              className="absolute inset-y-0 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[8px_0_24px_-16px_rgba(15,23,42,0.35)]"
            >
              <div className="flex h-12 shrink-0 items-center px-4">
                <span className="truncate text-[16px] font-bold text-foreground">{flyoutSection.label}</span>
              </div>

              <div className="flex-1 overflow-y-auto px-2 pb-4">
                {flyoutSection.groups!.map((group, gi) => (
                  <div key={group.header} className={cn(gi > 0 && "mt-4")}>
                    <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                      {group.header}
                    </p>
                    <div className="space-y-0.5">
                      {group.links.map((link, li) => {
                        const SubIcon = link.icon
                        const selected = Boolean(link.href) && pathname === link.href?.split("?")[0]?.split("#")[0]

                        if (link.soon || !link.href) {
                          return (
                            <div
                              key={link.label}
                              aria-disabled="true"
                              className="flex h-10 cursor-default items-center gap-2.5 rounded-md px-2 text-[14px] font-medium opacity-55"
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
                              onClick={closeNow}
                              className={cn(
                                "ax-interactive flex h-10 items-center gap-2.5 rounded-md px-2 text-[14px] font-medium",
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

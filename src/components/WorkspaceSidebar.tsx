"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  History,
  Inbox,
  ReceiptText,
  Settings,
  Upload,
} from "lucide-react"
import { motion } from "framer-motion"
import { AxMark } from "@/components/AppIcon"
import { BillingSeal } from "@/components/BillingGlyphs"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher"
import { cn } from "@/lib/utils"

type SidebarItemKey = "overview" | "process" | "inbox" | "accounts_payable" | "integrations" | "history" | "pricing" | "settings"

interface WorkspaceSidebarProps {
  activeItem: SidebarItemKey
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

const sidebarItems = [
  { key: "overview" as const, label: "Overview", icon: Activity, href: "/dashboard" },
  { key: "process" as const, label: "Convert Files", icon: Upload, href: "/dashboard/client" },
  { key: "inbox" as const, label: "Inbox", icon: Inbox, href: "/dashboard/inbox" },
  { key: "accounts_payable" as const, label: "Accounts Payable", icon: ReceiptText, href: "/dashboard/accounts-payable" },
  { key: "integrations" as const, label: "Integrations", icon: Building2, href: "/dashboard/integrations" },
  { key: "history" as const, label: "History", icon: History, href: "/history" },
  { key: "pricing" as const, label: "Pricing", icon: BillingSeal, href: "/pricing" },
  { key: "settings" as const, label: "Settings", icon: Settings, href: "/dashboard/settings" },
]

const processSubItems = [
  { label: "Auto detect", href: "/dashboard/auto-detect", icon: Upload },
  { label: "Table mode", href: "/dashboard/client", icon: FileSpreadsheet },
  { label: "Bank statements", href: "/dashboard/bank-statements", icon: Building2 },
  { label: "Invoices", href: "/dashboard/invoices", icon: ReceiptText },
  { label: "Receipts", href: "/dashboard/receipts", icon: ReceiptText },
  { label: "Notes", href: "/dashboard/notes", icon: FileSpreadsheet },
]

const W_EXPANDED = 252
const W_COLLAPSED = 56
const LS_KEY = "ax-sidebar-collapsed"

function setSidebarCssVar(px: number) {
  document.documentElement.style.setProperty("--sidebar-w", `${px}px`)
}

export function WorkspaceSidebar({ activeItem, user }: WorkspaceSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const didMount = useRef(false)

  useEffect(() => {
    let initial = false
    try { initial = localStorage.getItem(LS_KEY) === "1" } catch {}
    setCollapsed(initial)
    setSidebarCssVar(initial ? W_COLLAPSED : W_EXPANDED)
    didMount.current = true
  }, [])

  useEffect(() => {
    if (!didMount.current) return
    setSidebarCssVar(collapsed ? W_COLLAPSED : W_EXPANDED)
    try { localStorage.setItem(LS_KEY, collapsed ? "1" : "0") } catch {}
  }, [collapsed])

  const handleSignOut = async () => {
    const { signOut } = await import("@/lib/auth-helpers")
    try { await signOut() } finally { window.location.replace("/") }
  }

  return (
    <motion.aside
      className="fixed inset-y-0 start-0 z-30 hidden overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col"
      animate={{ width: collapsed ? W_COLLAPSED : W_EXPANDED }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex h-full flex-col">
        {/* Workspace switcher */}
        <div className="px-2 pb-3 pt-2">
          {collapsed ? (
            <div className="flex h-14 w-full items-center justify-center">
              <AxMark className="h-7 w-auto" />
            </div>
          ) : (
            <WorkspaceSwitcher user={user} onSignOut={() => void handleSignOut()} />
          )}
        </div>

        {/* Upload button */}
        <div className={cn("flex pb-6 pt-1", collapsed ? "justify-center px-1" : "justify-center px-3")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="glossy" size="icon" className="h-10 w-10 rounded-lg">
                  <Link href="/dashboard/client#upload-files" aria-label="Upload files">
                    <Upload className="size-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Upload</TooltipContent>
            </Tooltip>
          ) : (
            <Button asChild variant="glossy" className="h-10 w-[11.25rem] justify-center rounded-lg text-[15px] font-bold">
              <Link href="/dashboard/client#upload-files">
                <Upload className="size-4" />
                Upload
              </Link>
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 pb-3">
          <div className="space-y-1.5">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon
              const isActive = activeItem === item.key
              const isProcess = item.key === "process"

              if (collapsed) {
                return (
                  <Tooltip key={item.key}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "ax-interactive flex h-10 w-full items-center justify-center rounded-lg",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className={cn("size-[18px] shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                )
              }

              if (isProcess) {
                return (
                  <div key={item.key}>
                    <Link
                      href={item.href}
                      className={cn(
                        "ax-interactive group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[15px] font-semibold",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className={cn("size-[18px] shrink-0", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
                      <motion.span
                        className="truncate"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.16, ease: [0.2, 0, 0, 1], delay: index * 0.04 }}
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                    <div className="ms-6 mt-1 space-y-1 border-s border-sidebar-border pb-2 ps-2">
                      {processSubItems.map((sub, subIdx) => {
                        const SubIcon = sub.icon
                        const selected = pathname === sub.href
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              "ax-interactive flex h-8 items-center gap-2 rounded-md px-2 text-[13px] font-medium",
                              selected
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <SubIcon className={cn("size-4 shrink-0", selected ? "text-foreground" : "text-muted-foreground")} />
                            <motion.span
                              className="truncate"
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.16, ease: [0.2, 0, 0, 1], delay: (index + subIdx + 1) * 0.04 }}
                            >
                              {sub.label}
                            </motion.span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "ax-interactive group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[15px] font-semibold",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn("size-[18px] shrink-0", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
                  <motion.span
                    className="truncate"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.16, ease: [0.2, 0, 0, 1], delay: index * 0.04 }}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Credits card — hidden when collapsed */}
        {!collapsed && (
          <div className="px-3 pb-4 pt-3">
            <div className="rounded-xl border border-sidebar-border bg-card px-3.5 pb-3.5 pt-4 shadow-xs">
              <p className="text-[15px] font-bold text-foreground">More batch capacity</p>
              <p className="mt-1.5 text-[13px] leading-[1.45rem] text-muted-foreground">
                Process larger file sets and keep more monthly credits available.
              </p>
              <Button asChild variant="lime" className="mt-4 h-11 w-full justify-center rounded-xl text-[15px] font-bold">
                <Link href="/pricing">Upgrade</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Toggle button */}
        <div className="flex justify-center pb-4 pt-2">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="ax-interactive flex size-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
          </button>
        </div>
      </div>
    </motion.aside>
  )
}

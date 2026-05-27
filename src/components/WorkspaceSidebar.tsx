"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Building2, FileSpreadsheet, History, Inbox, ReceiptText, Settings, Upload } from "lucide-react"
import { BillingSeal } from "@/components/BillingGlyphs"
import { Button } from "@/components/ui/button"
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

export function WorkspaceSidebar({ activeItem, user }: WorkspaceSidebarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    const { signOut } = await import("@/lib/auth-helpers")
    try {
      await signOut()
    } finally {
      window.location.replace("/")
    }
  }

  return (
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-[15.75rem] border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-full flex-col">
        <div className="px-3 pb-3 pt-2">
          <WorkspaceSwitcher user={user} onSignOut={() => void handleSignOut()} />
        </div>

        <div className="flex justify-center px-3 pb-6 pt-1">
          <Button asChild variant="glossy" className="h-10 w-[11.25rem] justify-center rounded-lg text-[15px] font-bold">
            <Link href="/dashboard/client#upload-files">
              <Upload className="size-4" />
              Upload
            </Link>
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="space-y-1.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isProcess = item.key === "process"
              const processSubItems = [
                { label: "Auto detect", href: "/dashboard/auto-detect", icon: Upload },
                { label: "Table mode", href: "/dashboard/client", icon: FileSpreadsheet },
                { label: "Bank statements", href: "/dashboard/bank-statements", icon: Building2 },
                { label: "Invoices", href: "/dashboard/invoices", icon: ReceiptText },
                { label: "Receipts", href: "/dashboard/receipts", icon: ReceiptText },
                { label: "Notes", href: "/dashboard/notes", icon: FileSpreadsheet },
              ]

              if (isProcess) {
                return (
                  <div key={item.key} className="group/process">
                    <Link
                      href={item.href}
                      className={cn(
                        "ax-interactive group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[15px] font-semibold",
                        activeItem === item.key
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[18px] shrink-0",
                          activeItem === item.key ? "text-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                    <div className="ms-6 mt-1 space-y-1 border-s border-sidebar-border pb-2 ps-2">
                      {processSubItems.map((subItem) => {
                        const SubIcon = subItem.icon
                        const selected = pathname === subItem.href
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "ax-interactive flex h-8 items-center gap-2 rounded-md px-2 text-[13px] font-medium",
                              selected
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <SubIcon className={cn("size-4 shrink-0", selected ? "text-foreground" : "text-muted-foreground")} />
                            <span className="truncate">{subItem.label}</span>
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
                    activeItem === item.key
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0",
                      activeItem === item.key ? "text-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="px-3 pb-4 pt-3">
          <div className="rounded-xl border border-sidebar-border bg-card px-3.5 pb-3.5 pt-4 shadow-xs">
            <p className="text-[15px] font-bold text-foreground">More batch capacity</p>
            <p className="mt-1.5 text-[13px] leading-[1.45rem] text-muted-foreground">
              Process larger file sets and keep more monthly credits available.
            </p>
            <Button
              asChild
              variant="lime"
              className="mt-4 h-11 w-full justify-center rounded-xl text-[15px] font-bold"
            >
              <Link href="/pricing">Upgrade</Link>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}

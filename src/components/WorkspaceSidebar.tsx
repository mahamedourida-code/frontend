"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Building2, ChevronsUpDown, FileSpreadsheet, History, LogOut, Settings, Upload } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppLogo } from "@/components/AppIcon"
import { BillingSeal } from "@/components/BillingGlyphs"
import { cn } from "@/lib/utils"

type SidebarItemKey = "overview" | "process" | "history" | "pricing" | "settings"

interface WorkspaceSidebarProps {
  activeItem: SidebarItemKey
  user?: {
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
  { key: "history" as const, label: "History", icon: History, href: "/history" },
  { key: "pricing" as const, label: "Pricing", icon: BillingSeal, href: "/pricing" },
  { key: "settings" as const, label: "Settings", icon: Settings, href: "/dashboard/settings" },
]

export function WorkspaceSidebar({ activeItem, user }: WorkspaceSidebarProps) {
  const pathname = usePathname()
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "User"
  const email = user?.email || ""

  const handleSignOut = async () => {
    const { signOut } = await import("@/lib/auth-helpers")
    try {
      await signOut()
    } finally {
      window.location.replace("/")
    }
  }

  return (
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-56 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-full flex-col">
        <div className="p-2">
          <Link href="/" aria-label="Go to AxLiner homepage">
            <div className="flex h-12 items-center rounded-md px-2 text-start text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <AppLogo className="h-7 w-auto" />
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <div className="space-y-1">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">General</div>
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isProcess = item.key === "process"
              const processSubItems = [
                { label: "Table mode", href: "/dashboard/client", icon: FileSpreadsheet },
                { label: "Bank statements", href: "/dashboard/bank-statements", icon: Building2 },
              ]

              if (isProcess) {
                return (
                  <div key={item.key} className="group/process">
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors",
                        activeItem === item.key
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          activeItem === item.key ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                    <div className={cn("ms-4 mt-1 hidden space-y-1 border-s border-sidebar-border ps-2 group-hover/process:block", activeItem === "process" && "block")}>
                      {processSubItems.map((subItem) => {
                        const SubIcon = subItem.icon
                        const selected = pathname === subItem.href
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex h-7 items-center gap-2 rounded-md px-2 text-xs font-medium transition-colors",
                              selected
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <SubIcon className={cn("size-3.5 shrink-0", selected ? "text-primary" : "text-muted-foreground")} />
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
                    "group flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors",
                    activeItem === item.key
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      activeItem === item.key ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="border-t border-sidebar-border p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-12 w-full items-center gap-2 rounded-md px-2 text-start text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
                  <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    {email.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">{email}</span>
                </div>
                <ChevronsUpDown className="ms-auto size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-lg" side="right" align="end" sideOffset={4}>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
                    <AvatarFallback className="rounded-lg">{email.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-semibold">{displayName}</span>
                    <span className="truncate text-xs">{email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/pricing">
                  <BillingSeal className="size-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onSelect={(event) => {
                  event.preventDefault()
                  void handleSignOut()
                }}
              >
                  <LogOut className="size-4" />
                  Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  )
}

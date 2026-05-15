"use client"

import Link from "next/link"
import { Activity, ChevronsUpDown, History, LogOut, Settings, Upload } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppIcon } from "@/components/AppIcon"
import { BillingSeal } from "@/components/BillingGlyphs"
import { cn } from "@/lib/utils"

type SidebarItemKey = "overview" | "process" | "workflows" | "history" | "pricing" | "settings"

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

function WorkflowGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 7h5m4 0h5M5 17h5m4 0h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 7c2 0 2 10 4 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 17c2 0 2-10 4-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="5" cy="7" r="1.8" fill="currentColor" />
      <circle cx="19" cy="17" r="1.8" fill="currentColor" />
    </svg>
  )
}

const sidebarItems = [
  { key: "overview" as const, label: "Overview", icon: Activity, href: "/dashboard" },
  { key: "process" as const, label: "Convert Files", icon: Upload, href: "/dashboard/client" },
  { key: "workflows" as const, label: "Workflows", icon: WorkflowGlyph, href: "/dashboard/workflows" },
  { key: "history" as const, label: "History", icon: History, href: "/history" },
  { key: "pricing" as const, label: "Pricing", icon: BillingSeal, href: "/pricing" },
  { key: "settings" as const, label: "Settings", icon: Settings, href: "/dashboard/settings" },
]

export function WorkspaceSidebar({ activeItem, user }: WorkspaceSidebarProps) {
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "User"
  const email = user?.email || ""

  return (
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-full flex-col">
        <div className="p-2">
          <Link href="/" aria-label="Go to AxLiner homepage">
            <div className="flex h-12 items-center gap-2 rounded-md px-2 text-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <AppIcon size={28} className="shrink-0" />
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">AxLiner</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <div className="space-y-1">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">General</div>
            {sidebarItems.map((item) => {
              const Icon = item.icon

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
              <DropdownMenuItem asChild className="text-destructive">
                <Link href="/signout">
                  <LogOut className="size-4" />
                  Sign Out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  )
}

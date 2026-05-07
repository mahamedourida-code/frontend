"use client"

import Link from "next/link"
import { Activity, History, LogOut, Settings, Upload } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppIcon } from "@/components/AppIcon"
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
  { key: "process" as const, label: "Process Images", icon: Upload, href: "/dashboard/client" },
  { key: "history" as const, label: "History", icon: History, href: "/history" },
  { key: "pricing" as const, label: "Pricing", icon: BillingSeal, href: "/pricing" },
  { key: "settings" as const, label: "Settings", icon: Settings, href: "/dashboard/settings" },
]

export function WorkspaceSidebar({ activeItem, user }: WorkspaceSidebarProps) {
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "User"
  const email = user?.email || ""

  return (
    <aside className="relative z-10 hidden lg:flex lg:w-[290px] lg:flex-col">
      <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[30px] border border-[#ebe2ff] bg-[#E9ECE4]/90 shadow-[0_24px_80px_rgba(68,31,132,0.10)] backdrop-blur-xl">
        <div className="border-b border-[#efe7ff] px-5 pb-5 pt-6">
          <Link
            href="/"
            className="group flex w-fit items-center gap-3 rounded-full px-1 py-1 transition-opacity hover:opacity-80"
            aria-label="Go to AxLiner homepage"
          >
            <AppIcon size={34} />
            <span className="text-xl font-bold text-black dark:text-white">AxLiner</span>
          </Link>

          <div className="mt-5 rounded-[24px] border border-[#efe7ff] bg-white/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border border-[#eadfff] shadow-sm">
                <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10">
                  {email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{email}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5">
          <div className="mb-3 px-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8d79bb]">Navigation</p>
          </div>
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-[22px] px-3 py-3 text-sm transition-all duration-200",
                  activeItem === item.key
                    ? "bg-[#2f165e] text-white shadow-[0_18px_40px_rgba(68,31,132,0.22)]"
                    : "text-muted-foreground hover:bg-white/55 hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    activeItem === item.key ? "text-white" : "text-[#65479f] group-hover:text-[#2f165e]"
                  )}
                />
                <p className={cn("truncate font-semibold", activeItem === item.key ? "text-white" : "text-foreground")}>
                  {item.label}
                </p>
              </Link>
            ))}

            <Link
              href="/signout"
              className="mt-4 flex w-full items-center gap-3 rounded-[22px] border border-[#f1e9ff] px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-white/55 hover:text-foreground"
            >
              <LogOut className="h-5 w-5 shrink-0 text-[#65479f]" />
              <p className="font-semibold text-foreground">Sign Out</p>
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  )
}

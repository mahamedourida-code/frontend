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
    <aside className="relative z-10 hidden lg:flex lg:w-[280px] lg:flex-col">
      <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl border border-[#dfe8df] bg-white shadow-sm">
        <div className="border-b border-[#e6eee6] px-5 pb-5 pt-6">
          <Link
            href="/"
            className="group flex w-fit items-center gap-3 rounded-full px-1 py-1 transition-opacity hover:opacity-80"
            aria-label="Go to AxLiner homepage"
          >
            <AppIcon size={34} />
            <span className="text-xl font-semibold tracking-tight text-[#111827]">AxLiner</span>
          </Link>

          <div className="mt-5 rounded-xl border border-[#e6eee6] bg-[#f7faf7] p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-[#dfe8df]">
                <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
                <AvatarFallback className="bg-[#e7f3e8] text-[#166534]">
                  {email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#111827]">{displayName}</p>
                <p className="mt-0.5 truncate text-xs text-[#667085]">{email}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5">
          <div className="mb-3 px-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#667085]">Navigation</p>
          </div>
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                    activeItem === item.key
                      ? "bg-[#166534] text-white shadow-sm"
                      : "text-[#667085] hover:bg-[#f4f8f4] hover:text-[#111827]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      activeItem === item.key ? "text-white" : "text-[#15803d] group-hover:text-[#166534]"
                    )}
                  />
                  <p className={cn("truncate font-medium", activeItem === item.key ? "text-white" : "text-[#111827]")}>
                    {item.label}
                  </p>
                </Link>
              )
            })}

            <Link
              href="/signout"
              className="mt-4 flex w-full items-center gap-3 rounded-xl border border-[#e6eee6] px-3 py-2.5 text-sm text-[#667085] transition-colors hover:bg-[#f4f8f4] hover:text-[#111827]"
            >
              <LogOut className="h-5 w-5 shrink-0 text-[#15803d]" />
              <p className="font-medium text-[#111827]">Sign Out</p>
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  )
}

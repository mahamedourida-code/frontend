"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Copy,
  KeyRound,
  Upload,
  ArrowUpRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  useNotifications,
  type AppNotification,
  type NotificationGroup,
} from "@/hooks/useNotifications"
import { cn } from "@/lib/utils"

const GROUP_META: Record<
  NotificationGroup,
  { label: string; icon: typeof Bell; tone: string }
> = {
  job_finished: {
    label: "Job finished",
    icon: CheckCircle2,
    tone: "text-[#16a34a] bg-[#f0fdf4]",
  },
  duplicate_detected: {
    label: "Duplicate detected",
    icon: Copy,
    tone: "text-[#d97706] bg-[#fffbeb]",
  },
  quickbooks_token: {
    label: "QuickBooks",
    icon: KeyRound,
    tone: "text-[#dc2626] bg-[#fef2f2]",
  },
  client_uploaded: {
    label: "Client upload",
    icon: Upload,
    tone: "text-[#1877F2] bg-[#eff6ff]",
  },
}

const GROUP_ORDER: NotificationGroup[] = [
  "job_finished",
  "duplicate_detected",
  "quickbooks_token",
  "client_uploaded",
]

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return "just now"
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function NotificationRow({
  item,
  onJump,
}: {
  item: AppNotification
  onJump: (id: string) => void
}) {
  const meta = GROUP_META[item.group]
  const Icon = meta.icon
  return (
    <Link
      href={item.href}
      onClick={() => onJump(item.id)}
      className={cn(
        "group/row flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--workspace-popout-hover)]",
        !item.read && "bg-[#eff6ff]"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
          meta.tone
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-semibold text-foreground">
            {item.title}
          </span>
          {!item.read && (
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
          )}
        </div>
        <p className="truncate text-[12.5px] text-muted-foreground">{item.preview}</p>
        <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
          {relativeTime(item.createdAt)}
        </span>
      </div>
      <ArrowUpRight className="mt-1 size-3.5 shrink-0 text-muted-foreground/0 transition-colors group-hover/row:text-muted-foreground" />
    </Link>
  )
}

function GroupedList({
  items,
  onJump,
  emptyLabel,
}: {
  items: AppNotification[]
  onJump: (id: string) => void
  emptyLabel: string
}) {
  const grouped = useMemo(() => {
    const map = new Map<NotificationGroup, AppNotification[]>()
    for (const g of GROUP_ORDER) {
      const list = items.filter((n) => n.group === g)
      if (list.length) map.set(g, list)
    }
    return map
  }, [items])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#f0fdf4]">
          <CheckCheck className="size-5 text-[#16a34a]" />
        </span>
        <p className="text-[13px] font-semibold text-foreground">You&apos;re all caught up</p>
        <p className="max-w-[14rem] text-[12px] text-muted-foreground">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-1.5 py-2">
      {GROUP_ORDER.filter((g) => grouped.has(g)).map((g) => (
        <div key={g}>
          <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
            {GROUP_META[g].label}
          </div>
          <div className="flex flex-col gap-0.5">
            {grouped.get(g)!.map((item) => (
              <NotificationRow key={item.id} item={item} onJump={onJump} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const { items, unread, unreadCount, markAllRead, markRead } = useNotifications()

  const handleJump = (id: string) => {
    markRead(id)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
          }
          className="ax-interactive relative inline-flex size-8 items-center justify-center rounded-md border border-white/12 bg-white/6 text-white/80 transition-colors hover:bg-white/14 hover:text-white data-[state=open]:border-white/24 data-[state=open]:bg-[var(--workspace-topbar-hover)] data-[state=open]:text-white"
        >
          <Bell className="size-4" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-[#1877F2] px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-[var(--workspace-topbar)]"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[22rem] overflow-hidden rounded-xl border-[var(--workspace-border)] bg-white p-0 text-[var(--workspace-ink)] shadow-[0_16px_44px_rgba(15,23,42,0.14)]"
      >
        <Tabs defaultValue="all" className="gap-0">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--workspace-border)] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-foreground">Notifications</span>
              <TabsList className="h-7 rounded-full bg-[#f3f6fb] p-0.5">
                <TabsTrigger
                  value="all"
                  className="h-6 rounded-full px-2.5 text-[12px] data-[state=active]:bg-white data-[state=active]:text-[#1877F2]"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="h-6 rounded-full px-2.5 text-[12px] data-[state=active]:bg-white data-[state=active]:text-[#1877F2]"
                >
                  Unread{unreadCount > 0 ? ` · ${unreadCount}` : ""}
                </TabsTrigger>
              </TabsList>
            </div>
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="ax-interactive inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11.5px] font-medium text-[var(--workspace-primary)] transition-colors hover:text-[var(--workspace-primary-hover)] disabled:pointer-events-none disabled:opacity-40"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            <TabsContent value="all" className="m-0">
              <GroupedList
                items={items}
                onJump={handleJump}
                emptyLabel="Finished jobs, duplicate flags and accounting alerts will show up here."
              />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <GroupedList
                items={unread}
                onJump={handleJump}
                emptyLabel="No unread notifications — nice and tidy."
              />
            </TabsContent>
          </div>

          <div className="border-t border-[var(--workspace-border)] px-3 py-2">
            <Link
              href="/history"
              onClick={() => setOpen(false)}
              className="ax-interactive block rounded-full py-1.5 text-center text-[12px] font-medium text-[var(--workspace-primary)] transition-colors hover:text-[var(--workspace-primary-hover)]"
            >
              View activity history
            </Link>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

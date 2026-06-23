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
  { label: string; icon: typeof Bell; iconClass: string; rowClass: string; lineClass: string; activeClass: string }
> = {
  document_ready: {
    label: "Ready to review",
    icon: CheckCircle2,
    iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rowClass: "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50",
    lineClass: "bg-emerald-500",
    activeClass: "text-emerald-700",
  },
  job_finished: {
    label: "Stack finished",
    icon: CheckCheck,
    iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rowClass: "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50",
    lineClass: "bg-emerald-500",
    activeClass: "text-emerald-700",
  },
  duplicate_detected: {
    label: "Duplicate detected",
    icon: Copy,
    iconClass: "bg-orange-50 text-orange-700 ring-orange-200",
    rowClass: "border-orange-200 bg-orange-50/80 hover:bg-orange-50",
    lineClass: "bg-orange-500",
    activeClass: "text-orange-700",
  },
  quickbooks_token: {
    label: "Accounting attention",
    icon: KeyRound,
    iconClass: "bg-rose-50 text-rose-700 ring-rose-200",
    rowClass: "border-rose-200 bg-rose-50/80 hover:bg-rose-50",
    lineClass: "bg-rose-500",
    activeClass: "text-rose-700",
  },
  client_uploaded: {
    label: "Client upload",
    icon: Upload,
    iconClass: "bg-sky-50 text-sky-700 ring-sky-200",
    rowClass: "border-sky-200 bg-sky-50/80 hover:bg-sky-50",
    lineClass: "bg-sky-500",
    activeClass: "text-sky-700",
  },
}

const GROUP_ORDER: NotificationGroup[] = [
  "document_ready",
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
        "group/row relative flex items-start gap-3 overflow-hidden rounded-lg border bg-white px-3.5 py-3.5 transition-colors",
        item.read ? "border-[var(--workspace-border)] hover:bg-[var(--workspace-popout-hover)]" : meta.rowClass,
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", meta.lineClass)} aria-hidden="true" />
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ring-1",
          item.read ? "bg-white text-foreground/60 ring-[var(--workspace-border)]" : meta.iconClass,
        )}
      >
        <Icon className="size-4" strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[14px] font-bold leading-5 text-foreground">
            {item.title}
          </span>
          {!item.read ? (
            <span className={cn("shrink-0 text-[11px] font-bold uppercase tracking-[0.08em]", meta.activeClass)}>
              New
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-5 text-foreground/72">{item.preview}</p>
        <span className="mt-1.5 block text-[12px] font-medium text-foreground/55">
          {relativeTime(item.createdAt)}
        </span>
      </div>
      <ArrowUpRight className="mt-1 size-4 shrink-0 text-foreground/0 transition-colors group-hover/row:text-foreground/60" />
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
      <div className="flex flex-col items-center justify-center gap-2.5 px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
          <CheckCheck className="size-5 text-emerald-700" strokeWidth={2.5} />
        </span>
        <p className="text-[15px] font-bold text-foreground">All caught up</p>
        <p className="max-w-[16rem] text-[13px] font-semibold leading-5 text-foreground/65">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-2.5 py-3">
      {GROUP_ORDER.filter((g) => grouped.has(g)).map((g) => (
        <div key={g}>
          <div className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/55">
            {GROUP_META[g].label}
          </div>
          <div className="flex flex-col gap-2">
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
          className="ax-interactive relative inline-flex size-10 items-center justify-center rounded-full text-white/88 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/35 data-[state=open]:text-white"
        >
          <Bell className="size-6" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0.78, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.78, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                aria-live="polite"
                className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-red-600 text-[11px] font-extrabold leading-none tabular-nums text-white ring-2 ring-[var(--workspace-topbar)]"
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
        className="w-[29rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border-[var(--workspace-border)] bg-white p-0 text-[var(--workspace-ink)] shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
      >
        <Tabs defaultValue="all" className="gap-0">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--workspace-border)] px-4 py-4">
            <div className="min-w-0">
              <span className="block text-[17px] font-bold leading-6 text-foreground">Notifications</span>
              <span className="block text-[12px] font-semibold leading-5 text-foreground/55">
                Review, client, and accounting updates
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <TabsList className="h-8 rounded-full bg-[var(--workspace-soft)] p-0.5">
                <TabsTrigger
                  value="all"
                  className="h-7 rounded-full px-3 text-[12px] font-bold data-[state=active]:bg-white data-[state=active]:text-[var(--workspace-blue)]"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="h-7 rounded-full px-3 text-[12px] font-bold data-[state=active]:bg-white data-[state=active]:text-[var(--workspace-blue)]"
                >
                  Unread{unreadCount > 0 ? ` ${unreadCount}` : ""}
                </TabsTrigger>
              </TabsList>
              <button
                onClick={markAllRead}
                disabled={unreadCount === 0}
                aria-label="Mark all notifications read"
                className="ax-interactive inline-flex size-8 items-center justify-center rounded-full border border-[var(--workspace-border)] bg-white text-emerald-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 disabled:pointer-events-none disabled:opacity-40"
              >
                <CheckCheck className="size-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="max-h-[30rem] overflow-y-auto">
            <TabsContent value="all" className="m-0">
              <GroupedList
                items={items}
                onJump={handleJump}
                emptyLabel="Documents, duplicate flags, and accounting alerts will show up here."
              />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <GroupedList
                items={unread}
                onJump={handleJump}
                emptyLabel="No unread notifications."
              />
            </TabsContent>
          </div>

          <div className="border-t border-[var(--workspace-border)] px-3 py-2.5">
            <Link
              href="/history"
              onClick={() => setOpen(false)}
              className="ax-interactive block rounded-full py-2 text-center text-[13px] font-bold text-[var(--workspace-blue)] transition-colors hover:text-[var(--workspace-blue-hover)]"
            >
              View activity history
            </Link>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

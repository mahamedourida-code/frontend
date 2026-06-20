"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  HelpCircle,
  Keyboard,
  BookOpen,
  LifeBuoy,
  Sparkles,
  ArrowUpRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// ── Keyboard shortcuts ───────────────────────────────────────────────
// No dedicated shortcuts sheet existed in the app (only the ⌘K palette
// and inline kbd hints), so we ship a minimal one here.
type Shortcut = { keys: string[]; label: string }
type ShortcutGroup = { title: string; items: Shortcut[] }

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Global",
    items: [
      { keys: ["⌘", "K"], label: "Open command palette / search" },
      { keys: ["?"], label: "Open this help menu" },
      { keys: ["Esc"], label: "Close any open panel" },
    ],
  },
  {
    title: "Review board",
    items: [
      { keys: ["J"], label: "Next document" },
      { keys: ["K"], label: "Previous document" },
      { keys: ["A"], label: "Approve / mark ready" },
      { keys: ["E"], label: "Edit first flagged field" },
      { keys: ["P"], label: "Publish reviewed draft" },
      { keys: ["⌘", "↵"], label: "Confirm" },
    ],
  },
]

// ── What's new (changelog) ───────────────────────────────────────────
// Inline, no backend. Bump CHANGELOG_VERSION when entries change to
// re-trigger the unseen dot for everyone.
const CHANGELOG_VERSION = "2026-05-31"
const SEEN_STORAGE_KEY = "axliner.whatsnew.seen"

type ChangelogEntry = { date: string; title: string; body: string }

const CHANGELOG: ChangelogEntry[] = [
  {
    date: "May 2026",
    title: "Global top bar",
    body: "Search, topic shortcuts, notifications and this help menu now live in one calm top row.",
  },
  {
    date: "May 2026",
    title: "Review Score",
    body: "Every document now carries a High / Review / Flagged badge so the queue sorts itself — needs-you-first.",
  },
  {
    date: "May 2026",
    title: "Source highlighting",
    body: "Click an extracted field on the review board to see exactly where it came from on the document.",
  },
]

function KeyCap({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md border border-border bg-muted px-1.5 font-sans text-[11px] font-semibold text-foreground">
      {children}
    </kbd>
  )
}

export function HelpMenu() {
  const [open, setOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [whatsNewOpen, setWhatsNewOpen] = useState(false)
  const [seenVersion, setSeenVersion] = useState<string | null>(CHANGELOG_VERSION)

  // Read "last seen" once on mount (default to "seen" to avoid SSR flash).
  useEffect(() => {
    try {
      setSeenVersion(localStorage.getItem(SEEN_STORAGE_KEY))
    } catch {
      setSeenVersion(CHANGELOG_VERSION)
    }
  }, [])

  const hasUnseen = seenVersion !== CHANGELOG_VERSION

  const markChangelogSeen = () => {
    try {
      localStorage.setItem(SEEN_STORAGE_KEY, CHANGELOG_VERSION)
    } catch {
      /* storage unavailable — keep the dot, no crash */
    }
    setSeenVersion(CHANGELOG_VERSION)
  }

  const openShortcuts = () => {
    setOpen(false)
    setShortcutsOpen(true)
  }

  const openWhatsNew = () => {
    setOpen(false)
    markChangelogSeen()
    setWhatsNewOpen(true)
  }

  // "?" anywhere (outside inputs) opens the menu — matches the in-app hint.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "?" || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return
      e.preventDefault()
      setOpen((prev) => !prev)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const items = useMemo(
    () => [
      {
        key: "shortcuts",
        icon: Keyboard,
        label: "Keyboard shortcuts",
        hint: "?",
        onClick: openShortcuts,
      },
      {
        key: "docs",
        icon: BookOpen,
        label: "Docs & guides",
        href: "/dashboard/guide",
      },
      {
        key: "support",
        icon: LifeBuoy,
        label: "Contact support",
        href: "/contact",
      },
    ],
    []
  )

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            aria-label={hasUnseen ? "Help and what's new — new updates" : "Help and what's new"}
            className="ax-interactive relative inline-flex size-8 items-center justify-center rounded-md border border-white/12 bg-white/6 text-white/80 transition-colors hover:bg-white/14 hover:text-white data-[state=open]:border-white/24 data-[state=open]:bg-[var(--workspace-topbar-hover)] data-[state=open]:text-white"
          >
            <HelpCircle className="size-4" />
            <AnimatePresence>
              {hasUnseen && (
                <motion.span
                  key="dot"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className="absolute right-1 top-1 size-2 rounded-full bg-[#d97706] ring-2 ring-[var(--workspace-topbar)]"
                />
              )}
            </AnimatePresence>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-64 overflow-hidden rounded-xl border-[var(--workspace-border)] bg-white p-1.5 text-[var(--workspace-ink)] shadow-[0_16px_44px_rgba(15,23,42,0.14)]"
        >
          <div className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
            Help
          </div>
          <div className="flex flex-col gap-0.5">
            {items.map((item) => {
              const Icon = item.icon
              const inner = (
                <>
                  <span className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
                    item.key === "shortcuts" && "bg-[var(--workspace-blue-soft)] text-[var(--workspace-blue)]",
                    item.key === "docs" && "bg-[#f0fdf4] text-[#16a34a]",
                    item.key === "support" && "bg-[#fffbeb] text-[#d97706]",
                  )}>
                    <Icon className="size-3.5" />
                  </span>
                  <span className="flex-1 truncate text-[13px] font-medium text-foreground">
                    {item.label}
                  </span>
                  {item.hint ? (
                    <kbd className="inline-flex h-5 items-center rounded-md border border-border bg-muted px-1.5 font-sans text-[10px] font-semibold text-muted-foreground">
                      {item.hint}
                    </kbd>
                  ) : (
                    <ArrowUpRight className="size-3.5 text-muted-foreground/0 transition-colors group-hover/help:text-muted-foreground" />
                  )}
                </>
              )
              const rowClass =
                "group/help flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--workspace-popout-hover)]"
              return item.href ? (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn("ax-interactive", rowClass)}
                >
                  {inner}
                </Link>
              ) : (
                <button
                  key={item.key}
                  onClick={item.onClick}
                  className={cn("ax-interactive", rowClass)}
                >
                  {inner}
                </button>
              )
            })}
          </div>

          <div className="-mx-1.5 my-1.5 h-px bg-border" />

          <button
            onClick={openWhatsNew}
            className="ax-interactive group/help flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--workspace-popout-hover)]"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#fff7ed] text-[#f97316]">
              <Sparkles className="size-3.5" />
            </span>
            <span className="flex-1 truncate text-[13px] font-medium text-foreground">
              What&apos;s new
            </span>
            {hasUnseen && (
              <span className="size-1.5 shrink-0 rounded-full bg-[#f97316]" />
            )}
          </button>
        </PopoverContent>
      </Popover>

      {/* Keyboard shortcuts sheet */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="size-4 text-muted-foreground" />
              Keyboard shortcuts
            </DialogTitle>
            <DialogDescription>
              Move through batches and the review board without leaving the keyboard.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                  {group.title}
                </div>
                <div className="flex flex-col gap-1.5">
                  {group.items.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-[13px] text-foreground">{s.label}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        {s.keys.map((k, i) => (
                          <KeyCap key={i}>{k}</KeyCap>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* What's new (changelog) */}
      <Dialog open={whatsNewOpen} onOpenChange={setWhatsNewOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-600" />
              What&apos;s new
            </DialogTitle>
            <DialogDescription>
              Recent improvements to the review and publish flow.
            </DialogDescription>
          </DialogHeader>
          <div className="-mt-1 flex flex-col">
            {CHANGELOG.map((entry, i) => (
              <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500" />
                  {i < CHANGELOG.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                    {entry.date}
                  </div>
                  <div className="text-[13.5px] font-semibold text-foreground">
                    {entry.title}
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                    {entry.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

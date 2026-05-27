"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  Building2,
  History,
  Inbox,
  ReceiptText,
  Search,
  Settings,
  Upload,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

type CommandItem = {
  id: string
  label: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const NAV_ITEMS: CommandItem[] = [
  { id: "convert",      label: "Convert Files",      hint: "/dashboard/client",             icon: Upload,      href: "/dashboard/client" },
  { id: "overview",     label: "Dashboard Overview",  hint: "/dashboard",                    icon: Activity,    href: "/dashboard" },
  { id: "ap",           label: "Accounts Payable",    hint: "/dashboard/accounts-payable",   icon: ReceiptText, href: "/dashboard/accounts-payable" },
  { id: "inbox",        label: "Inbox",               hint: "/dashboard/inbox",              icon: Inbox,       href: "/dashboard/inbox" },
  { id: "history",      label: "History",             hint: "/history",                      icon: History,     href: "/history" },
  { id: "integrations", label: "Integrations",        hint: "/dashboard/integrations",       icon: Building2,   href: "/dashboard/integrations" },
  { id: "settings",     label: "Settings",            hint: "/dashboard/settings",           icon: Settings,    href: "/dashboard/settings" },
]

function fuzzyMatch(label: string, query: string) {
  return label.toLowerCase().includes(query.toLowerCase())
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = query
    ? NAV_ITEMS.filter(item => fuzzyMatch(item.label, query))
    : NAV_ITEMS

  const execute = useCallback((item: CommandItem) => {
    router.push(item.href)
    onOpenChange(false)
  }, [router, onOpenChange])

  useEffect(() => {
    if (open) {
      setQuery("")
      setActiveIndex(0)
      const t = setTimeout(() => inputRef.current?.focus(), 20)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const item = filtered[activeIndex]
        if (item) execute(item)
      } else if (e.key === "Escape") {
        onOpenChange(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, filtered, activeIndex, execute, onOpenChange])

  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cp-root"
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[18vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Panel */}
          <motion.div
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background/95 shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
          >
            {/* Search row */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search pages…"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:block">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[320px] overflow-y-auto py-1.5">
              {filtered.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </p>
              ) : (
                <motion.ul
                  ref={listRef}
                  variants={{ show: { transition: { staggerChildren: 0.03 } } }}
                  initial="hidden"
                  animate="show"
                >
                  {filtered.map((item, index) => {
                    const Icon = item.icon
                    const isActive = index === activeIndex
                    return (
                      <motion.li
                        key={item.id}
                        variants={{
                          hidden: { opacity: 0, y: 4 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.12, ease: [0.2, 0, 0, 1] } },
                        }}
                      >
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => execute(item)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-foreground hover:bg-accent/60"
                          )}
                        >
                          <span className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                            isActive
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-border bg-muted/50 text-muted-foreground"
                          )}>
                            <Icon className="size-4" />
                          </span>
                          <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{item.hint}</span>
                        </button>
                      </motion.li>
                    )
                  })}
                </motion.ul>
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><kbd className="font-sans">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="font-sans">↵</kbd> open</span>
              <span className="flex items-center gap-1"><kbd className="font-sans">esc</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  BookCheck,
  FileSpreadsheet,
  FileText,
  Inbox,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  Upload,
  Users,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useHistory, type HistoryJob } from "@/hooks/useHistory"

type CommandGroup = "navigate" | "act" | "find"

type CommandItem = {
  id: string
  group: CommandGroup
  label: string
  hint: string
  keywords?: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const GROUP_LABELS: Record<CommandGroup, string> = {
  navigate: "Navigate",
  act: "Act",
  find: "Find",
}

const GROUP_ORDER: CommandGroup[] = ["navigate", "act", "find"]

// Navigate — every dashboard route (mirrors WorkspaceSidebar + workflow docs)
const NAVIGATE_ITEMS: CommandItem[] = [
  { id: "nav-home",     group: "navigate", label: "Home",             hint: "Workspace", keywords: "dashboard overview",           icon: Activity,    href: "/dashboard" },
  { id: "nav-clients",  group: "navigate", label: "Clients",          hint: "Workspace", keywords: "companies customers",          icon: Users,       href: "/dashboard?view=clients" },
  { id: "nav-activity", group: "navigate", label: "Activity",         hint: "Workspace", keywords: "history saved jobs results",   icon: Activity,    href: "/history" },
  { id: "nav-inbox",    group: "navigate", label: "Inbox",            hint: "Workspace", keywords: "intake client submissions",    icon: Inbox,       href: "/dashboard/inbox" },
  { id: "nav-review",   group: "navigate", label: "Review batches",   hint: "Workspace", keywords: "documents exceptions results", icon: BookCheck,   href: "/dashboard/client" },
  { id: "nav-ap",       group: "navigate", label: "Accounts payable", hint: "Workspace", keywords: "ap queue draft bills",         icon: ReceiptText, href: "/dashboard/accounts-payable" },
  { id: "nav-settings", group: "navigate", label: "Settings",         hint: "Workspace", keywords: "account billing plan",         icon: Settings,    href: "/dashboard/settings" },
]

// Act — actions that already have a destination (no invented endpoints)
const ACT_ITEMS: CommandItem[] = [
  { id: "act-upload",      group: "act", label: "Upload documents",         hint: "New batch",              keywords: "new add files import scan",     icon: Upload,          href: "/dashboard/client#upload-files" },
  { id: "act-refresh-qbo", group: "act", label: "Refresh QuickBooks lists", hint: "Accounting connection", keywords: "sync vendors accounts tax qbo", icon: RefreshCw,       href: "/dashboard/integrations" },
  { id: "act-import-pos",  group: "act", label: "Import purchase orders",   hint: "Accounts payable",       keywords: "po pos bills coding",           icon: FileSpreadsheet, href: "/dashboard/accounts-payable" },
]

function fuzzyScore(haystack: string, query: string): number {
  // Subsequence fuzzy match; returns -1 for no match, lower = better (tighter span).
  const h = haystack.toLowerCase()
  const q = query.toLowerCase().trim()
  if (!q) return 0
  if (h.includes(q)) return h.indexOf(q) // contiguous substrings rank best
  let hi = 0
  let qi = 0
  let firstHit = -1
  while (hi < h.length && qi < q.length) {
    if (h[hi] === q[qi]) {
      if (firstHit === -1) firstHit = hi
      qi++
    }
    hi++
  }
  return qi === q.length ? 1000 + firstHit : -1
}

function searchText(item: CommandItem): string {
  return `${item.label} ${item.hint} ${item.keywords ?? ""}`
}

function recentJobToItem(job: HistoryJob, index: number): CommandItem {
  const name = job.filename || `Job ${job.original_job_id || job.id || index + 1}`
  return {
    id: `find-${job.original_job_id || job.id || index}`,
    group: "find",
    label: name,
    hint: "Open in History",
    keywords: job.status ?? "",
    icon: FileText,
    href: "/history",
  }
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Outer gate: only mount the body (and the useHistory fetch) while the palette is open,
// so the dashboard never pays for the "Find" source until ⌘K is pressed.
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  return (
    <AnimatePresence>
      {open && <CommandPaletteBody onOpenChange={onOpenChange} />}
    </AnimatePresence>
  )
}

function CommandPaletteBody({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Lazily reads recent saved jobs as the "Find" source (client-side hook, no new backend).
  const { jobs } = useHistory()

  const findItems = useMemo<CommandItem[]>(
    () => (jobs ?? []).slice(0, 20).map(recentJobToItem),
    [jobs]
  )

  // Flat, ordered, fuzzy-filtered list (keeps a single moving selection across groups).
  const results = useMemo(() => {
    const base: CommandItem[] = [...NAVIGATE_ITEMS, ...ACT_ITEMS, ...findItems]
    const q = query.trim()
    const scored = base
      .map(item => ({ item, score: fuzzyScore(searchText(item), q) }))
      .filter(entry => entry.score >= 0)
    if (q) scored.sort((a, b) => a.score - b.score)
    return scored.map(entry => entry.item)
  }, [query, findItems])

  // Group the flat results while preserving the flat index for keyboard nav.
  const grouped = useMemo(() => {
    const map = new Map<CommandGroup, { item: CommandItem; flatIndex: number }[]>()
    results.forEach((item, flatIndex) => {
      const bucket = map.get(item.group) ?? []
      bucket.push({ item, flatIndex })
      map.set(item.group, bucket)
    })
    return GROUP_ORDER.filter(g => map.has(g)).map(g => ({ group: g, rows: map.get(g)! }))
  }, [results])

  const execute = useCallback((item: CommandItem) => {
    router.push(item.href)
    onOpenChange(false)
  }, [router, onOpenChange])

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 20)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, results.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const item = results[activeIndex]
        if (item) execute(item)
      } else if (e.key === "Escape") {
        onOpenChange(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [results, activeIndex, execute, onOpenChange])

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-flat-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  const showFindEmpty =
    grouped.every(g => g.group !== "find") && findItems.length === 0 && !query

  return (
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
                placeholder="Navigate, act, or find a document…"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:block">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[340px] overflow-y-auto py-1.5">
              {results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </p>
              ) : (
                <motion.div
                  variants={{ show: { transition: { staggerChildren: 0.02 } } }}
                  initial="hidden"
                  animate="show"
                >
                  {grouped.map(({ group, rows }) => (
                    <div key={group} className="pb-1">
                      <div className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {GROUP_LABELS[group]}
                      </div>
                      <ul>
                        {rows.map(({ item, flatIndex }) => {
                          const Icon = item.icon
                          const isActive = flatIndex === activeIndex
                          return (
                            <motion.li
                              key={item.id}
                              data-flat-index={flatIndex}
                              variants={{
                                hidden: { opacity: 0, y: 4 },
                                show: { opacity: 1, y: 0, transition: { duration: 0.12, ease: [0.2, 0, 0, 1] } },
                              }}
                            >
                              <button
                                type="button"
                                onMouseEnter={() => setActiveIndex(flatIndex)}
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
                      </ul>
                    </div>
                  ))}

                  {showFindEmpty && (
                    <div className="pb-1">
                      <div className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {GROUP_LABELS.find}
                      </div>
                      <p className="px-4 py-3 text-xs text-muted-foreground">
                        Start typing to search your recent documents.
                      </p>
                    </div>
                  )}
                </motion.div>
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
  )
}

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  BookOpen,
  BookCheck,
  Building2,
  FileSpreadsheet,
  FileText,
  Inbox,
  PlugZap,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  Upload,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useHistory, type HistoryJob } from "@/hooks/useHistory"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { companyApi, type CompanySummary } from "@/lib/api-client"

type CommandGroup = "navigate" | "act" | "clients" | "documents"

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
  clients: "Clients",
  documents: "Documents",
}

const GROUP_ORDER: CommandGroup[] = ["navigate", "act", "clients", "documents"]

// Navigate: every accountant workspace route (mirrors WorkspaceSidebar).
const NAVIGATE_ITEMS: CommandItem[] = [
  { id: "nav-companies", group: "navigate", label: "Clients",          hint: "Workspace", keywords: "companies customers home",      icon: Building2,   href: "/dashboard" },
  { id: "nav-inbox",    group: "navigate", label: "Inbox",            hint: "Workspace", keywords: "intake client submissions",    icon: Inbox,       href: "/dashboard/inbox" },
  { id: "nav-review",   group: "navigate", label: "Review board",     hint: "Workspace", keywords: "batches documents exceptions results", icon: BookCheck,   href: "/dashboard/client" },
  { id: "nav-bills",    group: "navigate", label: "Draft bills",      hint: "Workspace", keywords: "accounts payable ap queue coding", icon: ReceiptText, href: "/dashboard/accounts-payable" },
  { id: "nav-activity", group: "navigate", label: "Activity",         hint: "Workspace", keywords: "history saved jobs results",   icon: Activity,    href: "/history" },
  { id: "nav-integrations", group: "navigate", label: "Integrations", hint: "Workspace", keywords: "quickbooks xero accounting sync", icon: PlugZap,     href: "/dashboard/integrations" },
  { id: "nav-guide",    group: "navigate", label: "Guide",            hint: "Workspace", keywords: "help onboarding workflow docs", icon: BookOpen,    href: "/dashboard/guide" },
  { id: "nav-settings", group: "navigate", label: "Settings",         hint: "Workspace", keywords: "account billing plan",         icon: Settings,    href: "/dashboard/settings" },
]

// Act: actions that already have a destination (no invented endpoints)
const ACT_ITEMS: CommandItem[] = [
  { id: "act-upload",      group: "act", label: "Upload documents",         hint: "New batch",              keywords: "new add files import scan",     icon: Upload,          href: "/dashboard/client#upload-files" },
  { id: "act-refresh-accounting", group: "act", label: "Refresh accounting lists", hint: "Accounting connection", keywords: "sync vendors accounts tax qbo xero", icon: RefreshCw, href: "/dashboard/integrations" },
  { id: "act-import-pos",  group: "act", label: "Import purchase orders",   hint: "Settings",               keywords: "po pos bills coding",           icon: FileSpreadsheet, href: "/dashboard/settings?section=accounting" },
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
    id: `doc-${job.original_job_id || job.id || index}`,
    group: "documents",
    label: name,
    hint: "Open in Activity",
    keywords: job.status ?? "",
    icon: FileText,
    href: "/history",
  }
}

function companyToItem(company: CompanySummary): CommandItem {
  return {
    id: `client-${company.id}`,
    group: "clients",
    label: company.name,
    hint: company.bills ? `${company.bills} draft bills` : "Client",
    keywords: "client company customer vendor",
    icon: Building2,
    href: `/dashboard/companies/${company.id}`,
  }
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Outer gate: only mount the body (and the useHistory fetch) while the palette is open,
// so the dashboard never pays for the "Find" source until the shortcut is pressed.
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

  // Live sources: recent documents (history) + this workspace's clients. Both only
  // load while the palette is mounted (i.e. open), so the dashboard never pays for them.
  const { jobs } = useHistory()
  const { user } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)
  const [companies, setCompanies] = useState<CompanySummary[]>([])

  useEffect(() => {
    const workspaceId = activeWorkspace?.id
    if (!workspaceId) return
    let mounted = true
    companyApi.list(workspaceId)
      .then(data => { if (mounted) setCompanies(data.companies ?? []) })
      .catch(() => undefined)
    return () => { mounted = false }
  }, [activeWorkspace?.id])

  const documentItems = useMemo<CommandItem[]>(
    () => (jobs ?? []).slice(0, 20).map(recentJobToItem),
    [jobs]
  )
  const clientItems = useMemo<CommandItem[]>(
    () => companies.map(companyToItem),
    [companies]
  )

  // Flat, ordered, fuzzy-filtered list (keeps a single moving selection across groups).
  const results = useMemo(() => {
    const q = query.trim()
    const staticItems = [...NAVIGATE_ITEMS, ...ACT_ITEMS]
    if (q) {
      return [...staticItems, ...clientItems, ...documentItems]
        .map(item => ({ item, score: fuzzyScore(searchText(item), q) }))
        .filter(entry => entry.score >= 0)
        .sort((a, b) => a.score - b.score)
        .map(entry => entry.item)
    }
    // Resting state (no query): pages + a few recent clients and documents.
    return [...staticItems, ...clientItems.slice(0, 5), ...documentItems.slice(0, 5)]
  }, [query, clientItems, documentItems])

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
                placeholder="Search clients, documents, or jump to a page..."
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

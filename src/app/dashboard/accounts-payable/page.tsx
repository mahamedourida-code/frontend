"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, FileText, Loader2, Sparkles } from "lucide-react"
import Image from "next/image"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { AnomalyChip } from "@/components/dashboard/AnomalyChip"
import { ReviewScoreBadge } from "@/components/dashboard/ReviewScoreBadge"
import { missingVatCopy, overPoCopy } from "@/lib/anomaly-reasons"
import { computeReviewScore, REVIEW_LEVEL_WEIGHT } from "@/lib/review-score"
import { deriveMissingInfo } from "@/lib/missing-info"
import { Button } from "@/components/ui/button"
import { MotionButton } from "@/components/ui/motion-button"
import { clayButton } from "@/lib/clay-button"
import { CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { PublishSuccessBurst } from "@/components/dashboard/PublishSuccessBurst"
import { PublishConfirmation, type PublishConfirmationState } from "@/components/dashboard/PublishConfirmation"
import { SpotlightCard } from "@/components/dashboard/SpotlightCard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import {
  accountingDestinationApi,
  accountsPayableApi,
  clientIntakeApi,
  quickBooksApi,
  xeroApi,
  type AccountingDestination,
  type AccountsPayableDraftData,
  type AccountsPayableDuplicateWarning,
  type AccountsPayableItem,
  type AccountsPayableStatus,
  type AccountingConnectionStatus,
  type AccountingReferenceItem,
  type PurchaseOrder,
  type XeroBillPublication,
} from "@/lib/api-client"
import { cn } from "@/lib/utils"

type QueueFilter =
  | "needs_attention"
  | "ready_to_publish"
  | "published"
  | "duplicates"
  | "missing_info"
  | "failed"
  | "discarded"

type MoreFilter = Extract<QueueFilter, "duplicates" | "missing_info" | "failed" | "discarded">

const queueStatuses: Array<{ value: AccountsPayableStatus; label: string }> = [
  { value: "needs_coding", label: "Needs coding" },
  { value: "needs_review", label: "Needs review" },
  { value: "ready_to_publish", label: "Ready to publish" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
  { value: "discarded", label: "Discarded" },
]

const statusTone: Record<AccountsPayableStatus, "warning" | "review" | "info" | "success" | "error" | "neutral"> = {
  needs_coding: "warning",
  needs_review: "review",
  ready_to_publish: "info",
  published: "success",
  failed: "error",
  discarded: "neutral",
}

function hasActiveDuplicate(item: AccountsPayableItem) {
  return (item.duplicate_warnings || []).some((warning) => !warning.dismissed)
}

function xeroPublication(item?: AccountsPayableItem | null) {
  return (item as (AccountsPayableItem & { xero_publication?: XeroBillPublication | null }) | null)?.xero_publication || null
}

const dotColor: Record<"warning" | "review" | "info" | "success" | "error" | "neutral", string> = {
  warning: "bg-amber-400",
  review: "bg-violet-400",
  info: "bg-sky-400",
  success: "bg-emerald-500",
  error: "bg-rose-500",
  neutral: "bg-muted-foreground/50",
}

const coreFields: Array<[keyof AccountsPayableDraftData, string, string]> = [
  ["invoice_number", "Bill number", "Enter bill number"],
  ["invoice_date", "Invoice date", "YYYY-MM-DD"],
  ["due_date", "Due date", "YYYY-MM-DD"],
]

const advancedFields: Array<[keyof AccountsPayableDraftData, string, string]> = [
  ["reference", "Reference", "PO or bill reference"],
  ["currency", "Currency", "USD"],
]

const moreFilters: Array<{ value: MoreFilter; label: string }> = [
  { value: "duplicates", label: "Duplicates" },
  { value: "missing_info", label: "Missing info" },
  { value: "failed", label: "Failed" },
  { value: "discarded", label: "Discarded" },
]

// C9 — bookkeeper-friendly words for the fields vendor memory remembers, so the
// pre-fill notice reads as a memory ("category, terms, tax") not raw draft keys.
const MEMORY_FIELD_LABELS: Record<string, string> = {
  account_category: "category",
  account_ref_id: "category",
  tax_code: "tax",
  tax_code_ref_id: "tax",
  payment_terms: "terms",
  due_date: "terms",
  currency: "currency",
  vendor_ref_id: "vendor",
}

const LEARNED_HINT_STORAGE_KEY = "axliner.ap.vendor-memory-learned-seen"

const inlineFieldClass =
  "h-9 rounded-lg transition-[border-color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0"

function FieldLabel({
  htmlFor,
  dirty,
  children,
}: {
  htmlFor?: string
  dirty?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {children}
      </label>
      {dirty ? (
        <span
          aria-label="Unsaved change"
          title="Unsaved change"
          className="size-1.5 shrink-0 rounded-full bg-amber-400 shadow-[0_0_0_2px_hsl(var(--background))]"
        />
      ) : null}
    </div>
  )
}

function valuesDiffer(a: unknown, b: unknown) {
  const normalize = (value: unknown) => {
    if (value === undefined || value === null) return ""
    return String(value)
  }
  return normalize(a) !== normalize(b)
}

function statusLabel(status: AccountsPayableStatus) {
  return queueStatuses.find(item => item.value === status)?.label || status
}

function amountLabel(item: AccountsPayableItem) {
  const total = item.draft_data.total
  if (total === undefined || total === null || total === "") return "-"
  return `${item.draft_data.currency || ""} ${String(total)}`.trim()
}

function ledgerValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "-"
  return String(value)
}

function shortDate(value: unknown) {
  if (value === undefined || value === null || value === "") return "-"
  return String(value).slice(0, 10)
}

function buildDraftUpdate(draft: AccountsPayableDraftData): AccountsPayableDraftData {
  return {
    vendor: draft.vendor,
    vendor_ref_id: draft.vendor_ref_id,
    invoice_number: draft.invoice_number,
    invoice_date: draft.invoice_date,
    due_date: draft.due_date,
    account_category: draft.account_category,
    account_ref_id: draft.account_ref_id,
    tax_code: draft.tax_code,
    tax_code_ref_id: draft.tax_code_ref_id,
    reference: draft.reference,
    currency: draft.currency,
    line_items: draft.line_items,
  }
}

function cloneDraft(item: AccountsPayableItem): AccountsPayableDraftData {
  return {
    ...item.draft_data,
    line_items: (item.draft_data.line_items || []).map(line => ({ ...line })),
  }
}

function AccountsPayableFallback() {
  return <DashboardRouteLoader label="Loading draft bills" />
}

export default function AccountsPayablePage() {
  return (
    <Suspense fallback={<AccountsPayableFallback />}>
      <AccountsPayableContent />
    </Suspense>
  )
}

function AccountsPayableContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)
  const clientId = searchParams.get("client")
  const clientName = searchParams.get("clientName")
  const [clientJobIds, setClientJobIds] = useState<Set<string> | null>(null)
  const [items, setItems] = useState<AccountsPayableItem[]>([])
  const [filter, setFilter] = useState<QueueFilter>("needs_attention")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AccountsPayableDraftData>({})
  const [attachmentVisible, setAttachmentVisible] = useState(true)
  const [selectedReadyIds, setSelectedReadyIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [accountingDestination, setAccountingDestination] = useState<AccountingDestination | null>(null)
  const [accountingConnection, setAccountingConnection] = useState<AccountingConnectionStatus | null>(null)
  const [accountingReferences, setAccountingReferences] = useState<AccountingReferenceItem[]>([])
  const [accountingConnectionLoading, setAccountingConnectionLoading] = useState(true)
  const [poDialogOpen, setPoDialogOpen] = useState(false)
  const [poList, setPoList] = useState<PurchaseOrder[]>([])
  const [poLoading, setPoLoading] = useState(false)
  const [poBusy, setPoBusy] = useState(false)
  const [syncingReferences, setSyncingReferences] = useState(false)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<{ succeeded: number; failed: Array<{ vendor: string; reason?: string }> } | null>(null)
  const [showSuccessBurst, setShowSuccessBurst] = useState(false)
  const [burstOrigin, setBurstOrigin] = useState<{ x: number; y: number } | null>(null)
  const [dismissDraft, setDismissDraft] = useState<{ warningId: string; reason: string } | null>(null)
  const [dismissing, setDismissing] = useState(false)
  const [discarding, setDiscarding] = useState(false)
  // C8 — calm publish moment for the single-Bill flow (the bulk flow already
  // confirms in its own dialog). Holds the entry kind + attachment + burst origin.
  const [publishConfirmation, setPublishConfirmation] = useState<PublishConfirmationState | null>(null)
  // C9 — show the gentle "AxLiner learned this" affordance only the first time a
  // reviewer ever sees a rule auto-apply. Persisted in localStorage so it never nags.
  const [showLearnedHint, setShowLearnedHint] = useState(false)
  const publishTriggerRef = useRef<HTMLButtonElement | null>(null)
  const confirmPublishRef = useRef<HTMLButtonElement | null>(null)
  const activePublishRef = useRef<HTMLButtonElement | null>(null)
  const burstTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (burstTimeoutRef.current) window.clearTimeout(burstTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Faccounts-payable")
    }
  }, [authLoading, user, router])

  const loadQueue = async () => {
    setLoading(true)
    try {
      const response = await accountsPayableApi.list()
      setItems(response.items)
      setActiveId(current => current && response.items.some(item => item.id === current)
        ? current
        : null)
    } catch {
      toast.error("Could not load draft bills.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) void loadQueue()
  }, [user?.id])

  const loadAccountingDestination = async (sync = false) => {
    setAccountingConnectionLoading(true)
    if (!sync) {
      setAccountingDestination(null)
      setAccountingConnection(null)
      setAccountingReferences([])
    }
    try {
      setSyncingReferences(sync)
      const destination = await accountingDestinationApi.get(activeWorkspace?.id)
      const status = destination === "xero"
        ? sync ? await xeroApi.sync(activeWorkspace?.id) : await xeroApi.status(activeWorkspace?.id)
        : sync ? await quickBooksApi.sync(activeWorkspace?.id) : await quickBooksApi.status(activeWorkspace?.id)
      setAccountingDestination(destination)
      setAccountingConnection(status)
      if (status.connected) {
        const response = destination === "xero"
          ? await xeroApi.references(undefined, activeWorkspace?.id)
          : await quickBooksApi.references(undefined, activeWorkspace?.id)
        setAccountingReferences(response.items)
      } else {
        setAccountingReferences([])
      }
    } catch {
      if (sync) toast.error("Could not refresh accounting lists.")
    } finally {
      setSyncingReferences(false)
      setAccountingConnectionLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    void loadAccountingDestination()
  }, [user?.id, activeWorkspace?.id])

  // P9 — purchase order matching
  const openPoDialog = async () => {
    setPoDialogOpen(true)
    setPoLoading(true)
    try {
      const vendorName = String(draft.vendor || "").trim() || undefined
      const response = await accountsPayableApi.listPurchaseOrders(vendorName)
      setPoList(response.purchase_orders)
    } catch {
      toast.error("Could not load purchase orders.")
    } finally {
      setPoLoading(false)
    }
  }

  const matchPo = async (poId: string | null) => {
    if (!activeItem) return
    setPoBusy(true)
    try {
      const response = await accountsPayableApi.matchPurchaseOrder(activeItem.id, poId)
      mergeItem(response.item)
      setPoDialogOpen(false)
      toast.success(poId ? "Purchase order matched." : "Purchase order unlinked.")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not match the purchase order.")
    } finally {
      setPoBusy(false)
    }
  }

  const activeItem = items.find(item => item.id === activeId) || null
  const activeXeroPublication = xeroPublication(activeItem)

  useEffect(() => {
    if (!activeItem) return
    setDraft(cloneDraft(activeItem))
    setAttachmentVisible(activeItem.attachment_visible)
  }, [activeItem?.id, activeItem?.updated_at])

  const counts = useMemo(() => {
    return items.reduce((current, item) => {
      current[item.status] = (current[item.status] || 0) + 1
      return current
    }, {
      needs_coding: 0,
      needs_review: 0,
      ready_to_publish: 0,
      published: 0,
      failed: 0,
      discarded: 0,
    } as Record<AccountsPayableStatus, number>)
  }, [items])

  const duplicateCount = useMemo(
    () => items.filter(item => hasActiveDuplicate(item)).length,
    [items],
  )

  // C10 — "Missing information" derived per item (no due date, no VAT where
  // expected, no total, unreadable field). Pure derivation over draft_data;
  // drives the filter chip count and the per-row "Missing info" chip.
  const missingInfo = useMemo(() => {
    const map = new Map<string, ReturnType<typeof deriveMissingInfo>>()
    for (const item of items) map.set(item.id, deriveMissingInfo(item))
    return map
  }, [items])

  const missingInfoCount = useMemo(
    () => items.filter(item => item.status !== "discarded" && missingInfo.get(item.id)?.missing).length,
    [items, missingInfo],
  )

  // C1 — composite Review Score per item, computed once over the queue.
  // Drives the row badge, the detail badge, and the "needs you first" sort.
  const reviewScores = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeReviewScore>>()
    for (const item of items) map.set(item.id, computeReviewScore(item))
    return map
  }, [items])

  // P11 — resolve a client filter (?client=<linkId>) to its job_ids
  useEffect(() => {
    if (!clientId || !activeWorkspace?.id) {
      setClientJobIds(null)
      return
    }
    void clientIntakeApi.analytics(activeWorkspace.id)
      .then((response) => {
        const match = response.clients.find((c) => c.link_id === clientId)
        setClientJobIds(new Set(match?.job_ids || []))
      })
      .catch(() => setClientJobIds(new Set()))
  }, [clientId, activeWorkspace?.id])

  const visibleItems = useMemo(() => {
    let base: AccountsPayableItem[]
    if (filter === "needs_attention") {
      base = items.filter(item => item.status === "needs_coding" || item.status === "needs_review")
    } else if (filter === "duplicates") {
      base = items.filter(item => hasActiveDuplicate(item))
    } else if (filter === "missing_info") {
      base = items.filter(item => item.status !== "discarded" && missingInfo.get(item.id)?.missing)
    } else {
      base = items.filter(item => item.status === filter)
    }
    if (clientJobIds) {
      base = base.filter(item => clientJobIds.has(String(item.job_id || "")))
    }
    // C1 — "needs you first": stable sort by Review Score (Flagged → Review →
    // High). `.map`+index keeps ties in their original API order.
    return base
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const weight =
          REVIEW_LEVEL_WEIGHT[reviewScores.get(a.item.id)?.level ?? "high"] -
          REVIEW_LEVEL_WEIGHT[reviewScores.get(b.item.id)?.level ?? "high"]
        return weight !== 0 ? weight : a.index - b.index
      })
      .map(({ item }) => item)
  }, [items, filter, clientJobIds, reviewScores, missingInfo])
  const lineItems = Array.isArray(draft.line_items) ? draft.line_items : []
  const lineColumns = (
    Array.from(new Set(lineItems.flatMap(line => Object.keys(line)))).slice(0, 6).length
      ? Array.from(new Set(lineItems.flatMap(line => Object.keys(line)))).slice(0, 6)
      : ["description", "quantity", "unit_price", "line_total"]
  )
  const activeLocked = activeItem?.status === "published" || activeItem?.status === "discarded"
  const vendors = accountingReferences.filter(item => item.resource_type === "vendor" && item.active)
  const accounts = accountingReferences.filter(item => item.resource_type === "account" && item.active)
  const taxCodes = accountingReferences.filter(item => item.resource_type === "tax_code" && item.active)
  const destinationName = accountingDestination === "xero" ? "Xero" : accountingDestination === "quickbooks" ? "QuickBooks" : "accounting destination"
  const isQuickBooks = accountingDestination === "quickbooks"
  const activeAccountingPublication =
    accountingDestination === "xero"
      ? activeXeroPublication
      : isQuickBooks
        ? activeItem?.quickbooks_publication
        : null
  const canRetryAttachment =
    activeItem?.status === "published" &&
    activeAccountingPublication?.attachment_status === "failed"
  const destinationBadgeSrc = accountingDestination === "xero"
    ? "/integrations/xero-mark.jpg"
    : accountingDestination === "quickbooks"
      ? "/icons/qb-badge.png"
      : null

  // Keep coding labels aligned with the selected accounting destination.
  const labels = {
    supplier: "Supplier",
    supplierPlaceholder: "Select supplier",
    supplierRefresh: "Refresh supplier list",
    account: "Account",
    taxCode: "VAT code",
  }

  /** P3 — vendor-rule pre-fill metadata stamped on creation. */
  const autoAppliedRule = (() => {
    const meta = activeItem?.metadata as Record<string, unknown> | undefined
    if (!meta || typeof meta !== "object") return null
    const block = meta["auto_applied_rule"] as Record<string, unknown> | undefined
    if (!block || typeof block !== "object") return null
    const fields = Array.isArray(block.applied_fields)
      ? (block.applied_fields as unknown[]).filter((entry): entry is string => typeof entry === "string")
      : []
    // C9 — translate the raw draft keys into the plain words a bookkeeper would
    // use, so the notice reads as memory ("category, terms, tax") not schema.
    const learnedLabels = Array.from(new Set(fields.map((field) => MEMORY_FIELD_LABELS[field] ?? field.replaceAll("_", " "))))
    return {
      ruleId: typeof block.rule_id === "string" ? block.rule_id : null,
      ruleName: typeof block.rule_name === "string" ? block.rule_name : "Saved vendor",
      mode: (block.mode === "auto_ready" ? "auto_ready" : "auto_fill") as "auto_fill" | "auto_ready",
      appliedFields: fields,
      learnedLabels,
    }
  })()

  // C9 — the very first time a reviewer opens an item where memory auto-applied a
  // rule, reveal the gentle "AxLiner learned this" hint once, then remember we've
  // shown it (localStorage) so it never reappears.
  const hasAutoApplied = Boolean(autoAppliedRule)
  useEffect(() => {
    if (!hasAutoApplied) {
      setShowLearnedHint(false)
      return
    }
    if (typeof window === "undefined") return
    if (window.localStorage.getItem(LEARNED_HINT_STORAGE_KEY)) return
    window.localStorage.setItem(LEARNED_HINT_STORAGE_KEY, "1")
    setShowLearnedHint(true)
  }, [hasAutoApplied, activeId])

  const mergeItem = (item: AccountsPayableItem) => {
    setItems(current => current.map(existing => existing.id === item.id ? item : existing))
    if (item.status !== "ready_to_publish") {
      setSelectedReadyIds(current => current.filter(id => id !== item.id))
    }
  }

  const updateDraftField = (field: keyof AccountsPayableDraftData, value: string) => {
    setDraft(current => ({ ...current, [field]: value }))
  }

  const selectAccountingReference = (
    idField: "vendor_ref_id" | "account_ref_id" | "tax_code_ref_id",
    labelField: "vendor" | "account_category" | "tax_code",
    value: string,
    references: AccountingReferenceItem[],
  ) => {
    const selected = references.find(item => item.external_id === value)
    setDraft(current => ({
      ...current,
      [idField]: value === "none" ? "" : value,
      [labelField]: value === "none" ? "" : selected?.display_name || "",
    }))
  }

  const updateLineCell = (rowIndex: number, key: string, value: string) => {
    setDraft(current => {
      const updated = (current.line_items || []).map((line, index) => (
        index === rowIndex ? { ...line, [key]: value } : line
      ))
      return { ...current, line_items: updated }
    })
  }

  const addLineItem = () => {
    setDraft(current => ({
      ...current,
      line_items: [
        ...(current.line_items || []),
        { description: "", quantity: "", unit_price: "", line_total: "" },
      ],
    }))
  }

  const removeLineItem = (rowIndex: number) => {
    setDraft(current => ({
      ...current,
      line_items: (current.line_items || []).filter((_, index) => index !== rowIndex),
    }))
  }

  const persistDraft = async (status?: AccountsPayableStatus) => {
    if (!activeItem) return
    setSaving(true)
    try {
      const response = await accountsPayableApi.update(activeItem.id, {
        draft_data: buildDraftUpdate(draft),
        attachment_visible: attachmentVisible,
        status,
      })
      mergeItem(response.item)
      toast.success(status === "ready_to_publish" ? "Draft bill saved and marked ready." : status === "needs_coding" ? "Draft bill sent back for coding." : "Draft bill saved.")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not save this draft bill.")
    } finally {
      setSaving(false)
    }
  }

  /**
   * P3 — override the vendor-rule pre-fill. Clears the applied fields in the
   * local draft, persists them as empty strings, and tells the backend to
   * strip the auto_applied_rule metadata so the notice doesn't reappear.
   */
  const overrideAutoFill = async () => {
    if (!activeItem || !autoAppliedRule) return
    const fields = autoAppliedRule.appliedFields as Array<keyof AccountsPayableDraftData>
    if (!fields.length) return
    setSaving(true)
    const clearedDraft: AccountsPayableDraftData = { ...draft }
    for (const field of fields) {
      ;(clearedDraft as Record<string, unknown>)[field as string] = ""
    }
    setDraft(clearedDraft)
    try {
      const response = await accountsPayableApi.update(activeItem.id, {
        draft_data: buildDraftUpdate(clearedDraft),
        attachment_visible: attachmentVisible,
        acknowledge_auto_applied: true,
      })
      mergeItem(response.item)
      toast.success("Vendor rule pre-fill cleared. Code this invoice manually.")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not override the vendor rule.")
    } finally {
      setSaving(false)
    }
  }

  /**
   * P4 — dismiss a single duplicate warning with a reviewer-supplied reason.
   * Keeps the AP item at its current status; clears the banner for that
   * warning_id permanently.
   */
  const dismissDuplicateWarning = async () => {
    if (!activeItem || !dismissDraft) return
    setDismissing(true)
    try {
      const response = await accountsPayableApi.dismissDuplicate(
        activeItem.id,
        dismissDraft.warningId,
        dismissDraft.reason.trim() || undefined,
      )
      mergeItem(response.item)
      toast.success("Duplicate warning dismissed.")
      setDismissDraft(null)
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not dismiss the warning.")
    } finally {
      setDismissing(false)
    }
  }

  /**
   * P4 — discard the AP item (the reviewer confirmed it is a duplicate).
   * Backend marks status='discarded'; we drop it from the active queue UI.
   */
  const discardActive = async () => {
    if (!activeItem) return
    if (!window.confirm("Discard this draft bill? It will be marked as a confirmed duplicate.")) return
    setDiscarding(true)
    try {
      const response = await accountsPayableApi.discard(activeItem.id, "duplicate_confirmed")
      mergeItem(response.item)
      // Move focus to the next non-discarded item.
      setActiveId(current => {
        const remaining = items.filter(item => item.id !== activeItem.id && item.status !== "discarded")
        return remaining[0]?.id || null
      })
      toast.success("Draft bill discarded.")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not discard the item.")
    } finally {
      setDiscarding(false)
    }
  }

  const toggleSelection = (itemId: string, checked: boolean) => {
    setSelectedReadyIds(current => checked
      ? Array.from(new Set([...current, itemId]))
      : current.filter(id => id !== itemId))
  }

  const openPublishDialog = () => {
    if (!selectedReadyIds.length) return
    setPublishResult(null)
    setPublishDialogOpen(true)
  }

  const closePublishDialog = () => {
    if (publishing) return
    setPublishDialogOpen(false)
    setPublishResult(null)
  }

  const confirmPublishSelected = async () => {
    if (!selectedReadyIds.length) return
    setPublishing(true)
    setPublishResult(null)
    try {
      const response = await accountsPayableApi.bulkPublish(selectedReadyIds)
      const failedIds = new Set(response.failures.map(failure => failure.item_id))
      setItems(current => current.map(item => response.items.find(updated => updated.id === item.id) || item))
      const failedRows = response.failures.map(failure => {
        const item = items.find(candidate => candidate.id === failure.item_id)
        return {
          vendor: item?.draft_data.vendor || "Vendor missing",
          reason: failure.detail || undefined,
        }
      })
      setPublishResult({
        succeeded: response.items.length,
        failed: failedRows,
      })
      setSelectedReadyIds(current => current.filter(id => failedIds.has(id)))
      if (response.items.length) {
        toast.success(`${response.items.length} draft bill${response.items.length === 1 ? "" : "s"} published to ${destinationName}.`)
        const anchor = confirmPublishRef.current || publishTriggerRef.current
        if (anchor) {
          const rect = anchor.getBoundingClientRect()
          setBurstOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
          setShowSuccessBurst(true)
          if (burstTimeoutRef.current) window.clearTimeout(burstTimeoutRef.current)
          burstTimeoutRef.current = window.setTimeout(() => setShowSuccessBurst(false), 2500)
        }
      }
      if (response.failures.length) toast.error(`${response.failures.length} item${response.failures.length === 1 ? "" : "s"} could not be published.`)
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not publish selected items.")
      setPublishResult({ succeeded: 0, failed: [{ vendor: "Bulk publish request failed", reason: error?.detail || error?.message }] })
    } finally {
      setPublishing(false)
    }
  }

  const publishActive = async () => {
    if (!activeItem || !["ready_to_publish", "published"].includes(activeItem.status)) return
    // P9 — confirm before publishing an invoice that exceeds its matched PO.
    if (activeItem.po_match_status === "exceeds" && activeItem.matched_po) {
      const over = activeItem.matched_po.over_by ? ` by ${activeItem.matched_po.over_by}` : ""
      if (!window.confirm(`This invoice exceeds PO ${activeItem.matched_po.po_number}${over}. Publish anyway?`)) return
    }
    const retryAttachment = activeItem.status === "published" && activeAccountingPublication?.attachment_status === "failed"
    if (retryAttachment) {
      if (!window.confirm(`Retry attaching the source document to the existing ${destinationName} draft bill?`)) return
    } else if (!window.confirm(`Publish one reviewed draft bill to ${destinationName}?`)) {
      return
    }
    setSaving(true)
    try {
      if (!retryAttachment) {
        await accountsPayableApi.update(activeItem.id, {
          draft_data: buildDraftUpdate(draft),
          attachment_visible: attachmentVisible,
        })
      }
      const response = await accountsPayableApi.publish(activeItem.id)
      mergeItem(response.item)
      // The shared confirmation is QuickBooks-specific. Xero keeps the calm
      // publish result in-page and uses a destination-aware toast here.
      if (!retryAttachment && isQuickBooks) {
        const anchor = activePublishRef.current
        const origin = anchor
          ? (() => { const r = anchor.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()
          : null
        setPublishConfirmation({
          kind: "bill",
          attached: response.item.quickbooks_publication?.attachment_status === "attached",
          origin,
        })
      } else {
        toast.success(retryAttachment ? `Source document attached in ${destinationName}.` : `Draft bill published to ${destinationName}.`)
      }
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not publish this draft bill.")
      await loadQueue()
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) return <DashboardRouteLoader label="Loading draft bills" />

  return (
    <DashboardShell activeItem="accounts_payable" title="Draft bills" user={user} contentClassName="max-w-none px-3 py-4 sm:px-5 lg:px-6">
      <div className="space-y-4">
        <PageHeader
          title="Draft bills"
          description={`Review invoice drafts, code exceptions, and publish approved bills to ${destinationName}.`}
          actions={selectedReadyIds.length ? (
            <MotionButton ref={publishTriggerRef} variant="glossy" onClick={openPublishDialog} disabled={saving || !accountingConnection?.connected} className="h-9 px-4">
              {destinationBadgeSrc ? <Image src={destinationBadgeSrc} alt="" width={16} height={16} className="mr-1 size-4 rounded-sm object-contain" /> : null}
              Publish {selectedReadyIds.length} {selectedReadyIds.length === 1 ? "bill" : "bills"}
            </MotionButton>
          ) : undefined}
        />

        {/* P11 — client filter chip */}
        {clientId ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
            <span className="font-medium text-foreground">
              Filtered to <span className="text-primary">{clientName || "client"}</span>
              {clientJobIds ? ` · ${visibleItems.length} item${visibleItems.length === 1 ? "" : "s"}` : " · loading…"}
            </span>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => router.push("/dashboard/accounts-payable")}>
              Clear filter
            </Button>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs">
          <p className="font-medium text-foreground">
            <span className="font-semibold">{destinationName}</span>
            {accountingConnectionLoading
              ? " connection is being checked."
              : accountingConnection?.connected
                ? ` connected${accountingConnection.company_name ? ` to ${accountingConnection.company_name}` : ""}.`
                : " setup required before publishing draft bills."}
          </p>
          <div className="flex items-center gap-2">
            {accountingConnection?.connected ? (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => void loadAccountingDestination(true)} disabled={syncingReferences}>
                {syncingReferences ? "Refreshing..." : "Refresh lists"}
              </Button>
            ) : null}
            <Button variant="surface" size="sm" className="h-7 px-3 text-xs" onClick={() => router.push("/dashboard/integrations")}>
              Manage integration
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <WorkspaceSection
            step="1"
            symbol="code-extract-field"
            title="Review invoices"
            hint="Confirm the extracted details, then code each draft."
            contentClassName="p-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-3 py-2.5">
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Draft bills queue">
                {[
                  { value: "needs_attention" as const, label: "Needs attention", count: counts.needs_coding + counts.needs_review },
                  { value: "ready_to_publish" as const, label: "Ready to publish", count: counts.ready_to_publish },
                  { value: "published" as const, label: "Published", count: counts.published },
                ].map(tab => (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={filter === tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={cn(
                      "ax-interactive inline-flex h-7 items-center gap-1 rounded-full border px-3 text-xs font-medium",
                      filter === tab.value
                        ? "border-primary/25 bg-primary/10 text-primary"
                        : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {tab.label}
                    <span className="tabular-nums opacity-70">{tab.count}</span>
                  </button>
                ))}
              </div>
              <details className="relative">
                <summary
                  className={cn(
                    "ax-interactive flex h-7 cursor-pointer list-none items-center rounded-full border px-3 text-xs font-medium [&::-webkit-details-marker]:hidden",
                    moreFilters.some(option => option.value === filter)
                      ? "border-primary/25 bg-primary/10 text-primary"
                      : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  More filters
                </summary>
                <div className="absolute right-0 z-20 mt-2 grid min-w-[180px] gap-1 rounded-md border border-border bg-card p-1.5 shadow-lg">
                  {moreFilters.map(option => {
                    const count =
                      option.value === "duplicates" ? duplicateCount :
                      option.value === "missing_info" ? missingInfoCount :
                      counts[option.value]
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFilter(option.value)}
                        className={cn(
                          "ax-interactive flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-medium",
                          filter === option.value
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {option.label}
                        <span className="ml-3 tabular-nums opacity-70">{count}</span>
                      </button>
                    )
                  })}
                </div>
              </details>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px] text-left text-xs">
                <thead className="border-b border-border bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="w-10 px-3 py-2" />
                    <th className="min-w-[180px] px-3 py-2">Supplier</th>
                    <th className="w-[124px] px-3 py-2">Bill number</th>
                    <th className="w-[104px] px-3 py-2">Invoice date</th>
                    <th className="w-[104px] px-3 py-2">Due date</th>
                    <th className="min-w-[150px] px-3 py-2">Account</th>
                    <th className="w-[112px] px-3 py-2">VAT code</th>
                    <th className="w-[56px] px-3 py-2">Cur</th>
                    <th className="w-[92px] px-3 py-2 text-right">Net</th>
                    <th className="w-[92px] px-3 py-2 text-right">VAT</th>
                    <th className="w-[100px] px-3 py-2 text-right">Total</th>
                    <th className="w-[132px] px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`ap-skeleton-${index}`}>
                        <td colSpan={12} className="px-3 py-3">
                          <Skeleton className="h-4 w-full max-w-[920px]" />
                        </td>
                      </tr>
                    ))
                  ) : visibleItems.length === 0 ? (
                    <tr>
                      <td colSpan={12}>
                        <EmptyState
                          illustration="/symbols/firstsight-draft-bills-empty.png"
                          illustrationSize={220}
                          icon={<ChevronLeft />}
                          title={items.length ? "No draft bills in this queue" : "Start your draft-bill workflow"}
                          description={items.length ? "No draft bills match this view." : "Review extracted invoices first, or upload a new folder to prepare draft bills."}
                          action={!items.length ? (
                            <div className="flex flex-col items-center gap-2">
                              <Button asChild variant="glossy" size="sm">
                                <Link href="/dashboard/client?mode=invoice">
                                  Review invoices
                                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Recommended</span>
                                </Link>
                              </Button>
                              <Button asChild variant="surface" size="sm">
                                <Link href="/dashboard/client#upload-files">Upload documents</Link>
                              </Button>
                              <Link href="/blogs" className="ax-interactive text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                                Guide
                              </Link>
                            </div>
                          ) : undefined}
                          compact
                        />
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence initial={false}>
                      {visibleItems.map(item => {
                        const tone = statusTone[item.status]
                        const isActive = activeId === item.id
                        const isReady = item.status === "ready_to_publish"
                        const missing = missingInfo.get(item.id)
                        return (
                          <motion.tr
                            key={item.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.16, ease: "easeOut" }}
                            tabIndex={0}
                            onClick={() => setActiveId(item.id)}
                            onKeyDown={event => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault()
                                setActiveId(item.id)
                              }
                            }}
                            className={cn(
                              "ax-interactive cursor-pointer bg-card text-muted-foreground hover:bg-accent/30",
                              isActive && "bg-accent/50",
                            )}
                          >
                            <td className="px-3 py-2.5" onClick={isReady ? event => event.stopPropagation() : undefined}>
                              {isReady ? (
                                <Checkbox
                                  checked={selectedReadyIds.includes(item.id)}
                                  onCheckedChange={checked => toggleSelection(item.id, checked === true)}
                                  aria-label={`Select ${item.source_filename}`}
                                />
                              ) : (
                                <span className={cn("block size-2 rounded-full", dotColor[tone])} />
                              )}
                            </td>
                            <td className="max-w-[240px] px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-medium text-foreground">{item.draft_data.vendor || "Supplier missing"}</span>
                                {hasActiveDuplicate(item) ? <span className="size-1.5 shrink-0 rounded-full bg-amber-500" title="Possible duplicate" /> : null}
                                {missing?.missing ? <span className="size-1.5 shrink-0 rounded-full bg-rose-500" title="Missing information" /> : null}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 font-mono tabular-nums">{ledgerValue(item.draft_data.invoice_number)}</td>
                            <td className="px-3 py-2.5 tabular-nums">{shortDate(item.draft_data.invoice_date)}</td>
                            <td className="px-3 py-2.5 tabular-nums">{shortDate(item.draft_data.due_date)}</td>
                            <td className="max-w-[200px] truncate px-3 py-2.5">{ledgerValue(item.draft_data.account_category)}</td>
                            <td className="max-w-[132px] truncate px-3 py-2.5">{ledgerValue(item.draft_data.tax_code)}</td>
                            <td className="px-3 py-2.5 font-mono">{ledgerValue(item.draft_data.currency)}</td>
                            <td className="px-3 py-2.5 text-right font-mono tabular-nums">{ledgerValue(item.draft_data.subtotal)}</td>
                            <td className="px-3 py-2.5 text-right font-mono tabular-nums">{ledgerValue(item.draft_data.tax_amount)}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-medium tabular-nums text-foreground">{ledgerValue(item.draft_data.total)}</td>
                            <td className="px-3 py-2.5"><StatusBadge tone={tone}>{statusLabel(item.status)}</StatusBadge></td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </WorkspaceSection>

          {activeItem ? (
          <SpotlightCard className="rounded-md">
            <WorkspaceSection
              tone="active"
              step="2"
              symbol="code-map-to-account"
              title="Prepare draft bill"
              hint={`Code the supplier, account, and VAT, then publish to ${destinationName}.`}
              contentClassName="p-0"
            >
            <CardContent className="p-4 sm:p-5">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                    <div className="min-w-0">
                      <h2 className="text-[19px] font-bold tracking-tight text-foreground">{draft.vendor || "Vendor missing"}</h2>
                      <p className="mt-1 break-all text-[13px] text-muted-foreground">{activeItem.source_filename}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeItem.source_access_url ? (
                        <Button asChild variant="surface" size="sm" className="h-8">
                          <a href={activeItem.source_access_url} target="_blank" rel="noreferrer">View attachment</a>
                        </Button>
                      ) : null}
                      <ReviewScoreBadge
                        score={reviewScores.get(activeItem.id) ?? computeReviewScore(activeItem)}
                        side="bottom"
                      />
                      {(() => {
                        // C10 — derive over the live draft so the chip clears as fields are filled.
                        const missing = deriveMissingInfo({ ...activeItem, draft_data: draft })
                        return missing.missing && missing.copy ? (
                          <AnomalyChip
                            tone={missing.copy.tone}
                            title={missing.copy.title}
                            reason={missing.copy.reason}
                            label="Missing info"
                            side="bottom"
                          />
                        ) : null
                      })()}
                      <StatusBadge tone={statusTone[activeItem.status]}>
                        {statusLabel(activeItem.status)}
                      </StatusBadge>
                    </div>
                  </div>

                  {/* P4 — Cross-batch duplicate banner */}
                  {(activeItem.duplicate_warnings || []).filter(w => !w.dismissed).map((warning) => (
                    <div
                      key={warning.id}
                      className="rounded-md border-2 border-amber-300 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-950/40"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                            Possible duplicate
                          </p>
                          <p className="mt-1 text-sm font-semibold text-amber-950 dark:text-amber-100">
                            {warning.message}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-amber-900/90 dark:text-amber-100/90">
                            Matched draft: <span className="font-semibold">{warning.matched_filename || "earlier invoice"}</span>
                            {warning.fields && typeof warning.fields === "object" ? (
                              <>
                                {" — "}
                                {(warning.fields as { vendor?: string }).vendor || ""}
                                {", "}
                                {(warning.fields as { amount?: string }).amount || ""}
                                {", "}
                                {(warning.fields as { date?: string }).date || ""}
                              </>
                            ) : null}
                            {warning.matched_status ? (
                              <> · Status: <span className="font-semibold">{statusLabel(warning.matched_status)}</span></>
                            ) : null}
                          </p>
                          {warning.matched_item_id ? (
                            <button
                              type="button"
                              onClick={() => setActiveId(warning.matched_item_id || null)}
                              className="ax-interactive mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700 dark:text-amber-200"
                            >
                              Open the original →
                            </button>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                          <Button
                            variant="surface"
                            size="sm"
                            onClick={() => setDismissDraft({ warningId: warning.id, reason: "" })}
                            disabled={dismissing || discarding || activeLocked}
                            className="h-8 px-3 text-xs"
                          >
                            Dismiss…
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => void discardActive()}
                            disabled={dismissing || discarding || activeLocked}
                            className="h-8 px-3 text-xs"
                          >
                            Discard this one
                          </Button>
                        </div>
                      </div>
                      {dismissDraft?.warningId === warning.id ? (
                        <div className="mt-3 flex flex-col gap-2 rounded-md border border-amber-200 bg-white/80 p-2.5 dark:bg-amber-950/60">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                            Reason for dismissal (optional)
                          </p>
                          <Input
                            value={dismissDraft.reason}
                            onChange={(event) => setDismissDraft(current => current ? { ...current, reason: event.target.value } : current)}
                            placeholder="e.g. legitimate second invoice from this vendor"
                            disabled={dismissing}
                            className="h-9 rounded-md"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="surface"
                              size="sm"
                              onClick={() => setDismissDraft(null)}
                              disabled={dismissing}
                              className="h-8 px-3 text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="surface"
                              size="sm"
                              onClick={() => void dismissDuplicateWarning()}
                              disabled={dismissing}
                              className={cn("h-8 px-3 text-xs", clayButton)}
                            >
                              {dismissing ? "Dismissing…" : "Dismiss warning"}
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {autoAppliedRule ? (
                    <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border-2 border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          {autoAppliedRule.mode === "auto_ready" ? "Pre-filled & moved to Ready for your approval" : "Pre-filled from memory"}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                          {autoAppliedRule.ruleName}
                        </p>
                        {autoAppliedRule.learnedLabels.length ? (
                          <>
                            <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-100/80">
                              Remembered from your past invoices — {autoAppliedRule.learnedLabels.join(", ")}.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {autoAppliedRule.learnedLabels.map((label) => (
                                <span
                                  key={label}
                                  className="rounded-full border border-emerald-300/70 bg-white/70 px-2 py-0.5 text-[11px] font-semibold capitalize text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-900/40 dark:text-emerald-200"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </>
                        ) : null}
                        <AnimatePresence>
                          {showLearnedHint ? (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/70 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-900/50 dark:text-emerald-200"
                            >
                              <Sparkles className="size-3" />
                              Saved for this supplier. Future invoices can use the same coding.
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                      <Button
                        variant="surface"
                        size="sm"
                        disabled={saving || activeLocked}
                        onClick={() => void overrideAutoFill()}
                        className="h-8 shrink-0 px-3 text-xs"
                      >
                        Override
                      </Button>
                    </div>
                  ) : activeItem.vendor_suggestion ? (
                    <div className="rounded-md border border-border bg-muted/30 p-3">
                      <p className="text-xs font-semibold text-foreground">Remembered suggestions</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {Object.entries(activeItem.vendor_suggestion.suggested_fields).map(([key, value]) => (
                          <span key={key} className="rounded-md border border-border bg-background px-2 py-1">
                            {key.replaceAll("_", " ")}: <span className="font-medium text-foreground">{value}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <FieldLabel
                          htmlFor="ap-vendor-ref"
                          dirty={valuesDiffer(draft.vendor_ref_id, activeItem.draft_data.vendor_ref_id)}
                        >
                          {labels.supplier}
                        </FieldLabel>
                        {!activeLocked ? (
                          <button
                            type="button"
                            onClick={() => void openPoDialog()}
                            className="ax-interactive inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 underline-offset-2 hover:text-emerald-800 hover:underline"
                          >
                            <FileText className="size-3" />
                            {activeItem.matched_po ? "Change PO" : "Match PO"}
                          </button>
                        ) : null}
                      </div>
                      <Select
                        value={String(draft.vendor_ref_id || "")}
                        onValueChange={value => selectAccountingReference("vendor_ref_id", "vendor", value, vendors)}
                        disabled={activeLocked || !accountingConnection?.connected}
                      >
                        <SelectTrigger id="ap-vendor-ref" className={inlineFieldClass}>
                          <SelectValue placeholder={vendors.length ? labels.supplierPlaceholder : labels.supplierRefresh} />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.map(vendor => (
                            <SelectItem key={vendor.external_id} value={vendor.external_id}>{vendor.display_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {activeItem.matched_po ? (
                        <div className={cn(
                          "mt-1.5 rounded-md border px-2.5 py-1.5 text-[11px]",
                          activeItem.po_match_status === "exceeds"
                            ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
                            : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200",
                        )}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5">
                              <span className="font-semibold">PO {activeItem.matched_po.po_number}</span>
                              {activeItem.po_match_status === "exceeds" ? (() => {
                                const copy = overPoCopy({
                                  po_number: activeItem.matched_po!.po_number,
                                  over_by: activeItem.matched_po!.over_by,
                                  currency: activeItem.matched_po!.currency,
                                })
                                return (
                                  <AnomalyChip
                                    tone={copy.tone}
                                    title={copy.title}
                                    reason={copy.reason}
                                    label="Over PO"
                                    className="h-5"
                                  />
                                )
                              })() : null}
                            </span>
                            <button type="button" onClick={() => void matchPo(null)} className="font-semibold underline-offset-2 hover:underline">
                              Unlink
                            </button>
                          </div>
                          <p className="mt-0.5">
                            PO total {activeItem.matched_po.currency || ""} {Number(activeItem.matched_po.total).toFixed(2)}
                            {activeItem.po_match_status === "exceeds" && activeItem.matched_po.over_by
                              ? ` · Over PO amount by ${activeItem.matched_po.over_by}`
                              : ""}
                          </p>
                        </div>
                      ) : null}
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel
                        htmlFor="ap-account-ref"
                        dirty={valuesDiffer(draft.account_ref_id, activeItem.draft_data.account_ref_id)}
                      >
                        {labels.account}
                      </FieldLabel>
                      <Select
                        value={String(draft.account_ref_id || "")}
                        onValueChange={value => selectAccountingReference("account_ref_id", "account_category", value, accounts)}
                        disabled={activeLocked || !accountingConnection?.connected}
                      >
                        <SelectTrigger id="ap-account-ref" className={inlineFieldClass}>
                          <SelectValue placeholder={accounts.length ? "Select account" : "Refresh account list"} />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.external_id} value={account.external_id}>{account.display_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <FieldLabel
                          htmlFor="ap-tax-ref"
                          dirty={valuesDiffer(draft.tax_code_ref_id, activeItem.draft_data.tax_code_ref_id)}
                        >
                          {labels.taxCode}
                        </FieldLabel>
                        {!draft.tax_code_ref_id ? (() => {
                          const copy = missingVatCopy()
                          return (
                            <AnomalyChip
                              tone={copy.tone}
                              title={copy.title}
                              reason={copy.reason}
                              label="No VAT"
                              className="h-5"
                            />
                          )
                        })() : null}
                      </div>
                      <Select
                        value={String(draft.tax_code_ref_id || "none")}
                        onValueChange={value => selectAccountingReference("tax_code_ref_id", "tax_code", value, taxCodes)}
                        disabled={activeLocked || !accountingConnection?.connected}
                      >
                        <SelectTrigger id="ap-tax-ref" className={inlineFieldClass}>
                          <SelectValue placeholder="No tax code" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No tax code</SelectItem>
                          {taxCodes.map(taxCode => (
                            <SelectItem key={taxCode.external_id} value={taxCode.external_id}>{taxCode.display_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {coreFields.map(([field, label, placeholder]) => (
                      <div key={field} className="space-y-1.5">
                        <FieldLabel
                          htmlFor={`ap-${field}`}
                          dirty={valuesDiffer(draft[field], activeItem.draft_data[field])}
                        >
                          {label}
                        </FieldLabel>
                        <Input
                          id={`ap-${field}`}
                          value={String(draft[field] || "")}
                          onChange={event => updateDraftField(field, event.target.value)}
                          placeholder={placeholder}
                          disabled={activeLocked}
                          className={inlineFieldClass}
                        />
                      </div>
                    ))}
                    <div className="space-y-1.5">
                      <FieldLabel>Invoice total</FieldLabel>
                      <div className="flex h-9 items-center rounded-lg border border-border bg-muted/40 px-3 text-sm font-semibold text-foreground">
                        {amountLabel(activeItem)}
                      </div>
                    </div>
                  </div>

                  <details className="rounded-md border border-border bg-muted/20">
                    <summary className="ax-interactive cursor-pointer list-none px-3 py-2.5 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                      Advanced details
                    </summary>
                    <div className="space-y-3 border-t border-border px-3 py-3">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {advancedFields.map(([field, label, placeholder]) => (
                          <div key={field} className="space-y-1.5">
                            <FieldLabel
                              htmlFor={`ap-${field}`}
                              dirty={valuesDiffer(draft[field], activeItem.draft_data[field])}
                            >
                              {label}
                            </FieldLabel>
                            <Input
                              id={`ap-${field}`}
                              value={String(draft[field] || "")}
                              onChange={event => updateDraftField(field, event.target.value)}
                              placeholder={placeholder}
                              disabled={activeLocked}
                              className={inlineFieldClass}
                            />
                          </div>
                        ))}
                      </div>
                      <label className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground">
                        <Checkbox
                          checked={attachmentVisible}
                          disabled={activeLocked}
                          onCheckedChange={checked => setAttachmentVisible(checked === true)}
                        />
                        Attach source document when publishing to {destinationName}
                      </label>
                      {isQuickBooks && activeItem.quickbooks_publication ? (
                        <div className="rounded-md border border-border bg-card p-3 text-sm">
                          <p className="font-medium text-foreground">
                            QuickBooks publish: {activeItem.quickbooks_publication.status}
                          </p>
                          {activeItem.quickbooks_publication.quickbooks_bill_id ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Bill ID {activeItem.quickbooks_publication.quickbooks_bill_id}
                              {activeItem.quickbooks_publication.attachment_status === "attached" ? " - source attached" : ""}
                            </p>
                          ) : null}
                          {activeItem.quickbooks_publication.attachment_status === "failed" ? (
                            <p className="mt-1 text-xs text-muted-foreground">The Bill exists; publish again to retry only its attachment.</p>
                          ) : null}
                        </div>
                      ) : null}
                      {accountingDestination === "xero" && activeXeroPublication ? (
                        <div className="rounded-md border border-border bg-card p-3 text-sm">
                          <p className="font-medium text-foreground">
                            Xero publish: {activeXeroPublication.status}
                          </p>
                          {activeXeroPublication.xero_invoice_id ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Invoice ID {activeXeroPublication.xero_invoice_id}
                              {activeXeroPublication.attachment_status === "attached" ? " - source attached" : ""}
                            </p>
                          ) : null}
                          {activeXeroPublication.attachment_status === "failed" ? (
                            <p className="mt-1 text-xs text-muted-foreground">The draft bill exists in Xero; publish again to retry only its attachment.</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </details>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">Line items</p>
                      {!activeLocked ? (
                        <Button type="button" variant="surface" size="sm" onClick={addLineItem} className="h-8 text-xs">
                          Add line
                        </Button>
                      ) : null}
                    </div>
                    {lineItems.length ? (
                      <div className="overflow-x-auto rounded-md border border-border">
                        <table className="min-w-full text-xs">
                          <thead className="bg-muted/40">
                            <tr>
                              {lineColumns.map(column => (
                                <th key={column} className="whitespace-nowrap border-b border-border px-2 py-2 text-left font-medium text-muted-foreground">
                                  {column.replaceAll("_", " ")}
                                </th>
                              ))}
                              {!activeLocked ? <th className="w-14 border-b border-border px-2 py-2" /> : null}
                            </tr>
                          </thead>
                          <tbody>
                            {lineItems.map((line, rowIndex) => (
                              <tr key={rowIndex} className="border-b border-border last:border-b-0">
                                {lineColumns.map(column => (
                                  <td key={column} className="p-1.5">
                                    <input
                                      value={String(line[column] ?? "")}
                                      disabled={activeLocked}
                                      onChange={event => updateLineCell(rowIndex, column, event.target.value)}
                                      className="ax-interactive h-8 min-w-[90px] rounded-sm border border-transparent bg-transparent px-2 text-foreground outline-none focus:border-border focus:bg-background"
                                    />
                                  </td>
                                ))}
                                {!activeLocked ? (
                                  <td className="p-1.5">
                                    <Button type="button" size="sm" variant="ghost" onClick={() => removeLineItem(rowIndex)} className="h-8 px-2 text-xs">
                                      Remove
                                    </Button>
                                  </td>
                                ) : null}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">No line items detected.</p>
                    )}
                  </div>

                  <div className="sticky bottom-0 z-10 -mx-4 -mb-4 flex flex-wrap justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:relative sm:bottom-auto sm:mx-0 sm:mb-0 sm:bg-transparent sm:px-0 sm:py-4 sm:backdrop-blur-0 sm:supports-[backdrop-filter]:bg-transparent">
                    {!activeLocked ? (
                      <>
                        <MotionButton variant="surface" onClick={() => void persistDraft()} disabled={saving} className={cn("h-9", clayButton)}>
                          Save changes
                        </MotionButton>
                        {activeItem.status === "ready_to_publish" ? (
                          <>
                            <Button variant="surface" onClick={() => void persistDraft("needs_coding")} disabled={saving} className="h-9">
                              Return to coding
                            </Button>
                            <MotionButton ref={activePublishRef} variant="glossy" onClick={() => void publishActive()} disabled={saving || !accountingConnection?.connected} className="h-9">
                              Publish to {destinationName}
                            </MotionButton>
                          </>
                        ) : (
                          <Button variant="reviewed" onClick={() => void persistDraft("ready_to_publish")} disabled={saving} className="h-9">
                            Mark ready to publish
                          </Button>
                        )}
                      </>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {canRetryAttachment ? (
                        <Button variant="surface" onClick={() => void publishActive()} disabled={saving || !accountingConnection?.connected} className="h-9">
                          Retry attachment
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
            </CardContent>
            </WorkspaceSection>
          </SpotlightCard>
          ) : null}
        </div>
      </div>

      <Dialog
        open={publishDialogOpen}
        onOpenChange={(open) => {
          if (!open) closePublishDialog()
        }}
      >
        <DialogContent className="gap-5 rounded-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base font-semibold">
              {destinationBadgeSrc ? <Image src={destinationBadgeSrc} alt="" width={20} height={20} className="size-5 rounded-sm object-contain" /> : null}
              {publishResult ? "Publish complete" : `Publish ${selectedReadyIds.length} ${selectedReadyIds.length === 1 ? "bill" : "bills"} to ${destinationName}`}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              {publishResult
                ? "The bulk publish finished. Failed items remain in the queue and can be retried."
                : `You are publishing ${selectedReadyIds.length} draft ${selectedReadyIds.length === 1 ? "bill" : "bills"} to ${destinationName}. This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>

          {publishResult ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-sm">
                <StatusBadge tone="success">{publishResult.succeeded} published</StatusBadge>
                {publishResult.failed.length > 0 ? (
                  <StatusBadge tone="error">{publishResult.failed.length} failed</StatusBadge>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">All selected draft bills landed in {destinationName}.</span>
                )}
              </div>
              {publishResult.failed.length > 0 ? (
                <div className="rounded-md border border-border">
                  <p className="border-b border-border bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Failed items
                  </p>
                  <ul className="max-h-[200px] divide-y divide-border overflow-y-auto">
                    {publishResult.failed.map((row, index) => (
                      <li key={`${row.vendor}-${index}`} className="px-3 py-2.5 text-sm">
                        <p className="font-medium text-foreground">{row.vendor}</p>
                        {row.reason ? (
                          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{row.reason}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <p className="border-b border-border bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Selected draft bills
              </p>
              <ul className="max-h-[260px] divide-y divide-border overflow-y-auto">
                {selectedReadyIds.map((id) => {
                  const item = items.find(candidate => candidate.id === id)
                  if (!item) return null
                  return (
                    <li key={id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                      <span className="min-w-0 truncate font-medium text-foreground">
                        {item.draft_data.vendor || "Vendor missing"}
                      </span>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-foreground">
                        {amountLabel(item)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <DialogFooter>
            {publishResult ? (
              <MotionButton variant="glossy" onClick={closePublishDialog} className="h-9 px-4">
                Close
              </MotionButton>
            ) : (
              <>
                <Button variant="surface" onClick={closePublishDialog} disabled={publishing} className="h-9 px-4">
                  Cancel
                </Button>
                <MotionButton
                  ref={confirmPublishRef}
                  variant="glossy"
                  onClick={() => void confirmPublishSelected()}
                  disabled={publishing || !accountingConnection?.connected || !selectedReadyIds.length}
                  className="h-9 px-4"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      {destinationBadgeSrc ? <Image src={destinationBadgeSrc} alt="" width={16} height={16} className="size-4 rounded-sm object-contain" /> : null}
                      Confirm publish
                    </>
                  )}
                </MotionButton>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* P9 — Match PO dialog */}
      <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
        <DialogContent className="gap-4 rounded-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <span className="inline-flex size-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <FileText className="size-3.5" />
              </span>
              Match a purchase order
            </DialogTitle>
            <DialogDescription className="text-sm font-medium leading-6">
              Open POs{draft.vendor ? ` for ${draft.vendor}` : ""}. Selecting one links it to this invoice.
            </DialogDescription>
          </DialogHeader>

          {poLoading ? (
            <div className="flex items-center justify-center py-8 text-sm font-semibold text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading purchase orders…
            </div>
          ) : poList.length === 0 ? (
            <div className="rounded-xl border-2 border-border bg-muted/30 p-5 text-center">
              <p className="text-sm font-bold text-foreground">No open purchase orders</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">No open purchase orders are available for this supplier.</p>
            </div>
          ) : (
            <div className="max-h-[320px] space-y-2 overflow-y-auto">
              {poList.map((po) => {
                const invTotal = Number(String((draft.total ?? "")).replace(/[^\d.-]/g, "")) || 0
                const exceeds = invTotal > Number(po.total)
                return (
                  <button
                    key={po.id}
                    type="button"
                    onClick={() => void matchPo(po.id)}
                    disabled={poBusy}
                    className={cn(
                      "ax-interactive flex w-full items-center justify-between gap-3 rounded-lg border-2 bg-card px-3 py-2.5 text-left transition-colors",
                      exceeds
                        ? "border-amber-200 hover:border-amber-400 hover:bg-amber-50/60 dark:border-amber-900/50"
                        : "border-border hover:border-emerald-700/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">PO {po.po_number}</p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {po.vendor_name || "—"}{po.po_date ? ` · ${po.po_date}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-sm font-semibold tabular-nums text-foreground">{po.currency || ""} {Number(po.total).toFixed(2)}</p>
                      {po.remaining_amount != null ? (
                        <p className="text-[11px] font-medium text-muted-foreground">Remaining {Number(po.remaining_amount).toFixed(2)}</p>
                      ) : null}
                      {exceeds ? <p className="text-[11px] font-bold text-amber-700">Invoice exceeds PO</p> : null}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <DialogFooter>
            <Button variant="surface" size="sm" onClick={() => setPoDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PublishSuccessBurst show={showSuccessBurst} origin={burstOrigin} />

      <PublishConfirmation
        state={publishConfirmation}
        onClose={() => setPublishConfirmation(null)}
      />
    </DashboardShell>
  )
}

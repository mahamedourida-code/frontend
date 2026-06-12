"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, Loader2, Sparkles } from "lucide-react"
import Image from "next/image"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { Symbol } from "@/components/dashboard/Symbol"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { AnomalyChip } from "@/components/dashboard/AnomalyChip"
import { ReviewScoreBadge } from "@/components/dashboard/ReviewScoreBadge"
import { missingVatCopy, overPoCopy } from "@/lib/anomaly-reasons"
import { computeReviewScore, REVIEW_LEVEL_WEIGHT } from "@/lib/review-score"
import { deriveMissingInfo } from "@/lib/missing-info"
import { Button } from "@/components/ui/button"
import { InlineAction } from "@/components/ui/inline-action"
import { MotionButton } from "@/components/ui/motion-button"
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
import { useMotionTokens } from "@/lib/motion"

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

const workspacePrimaryButton =
  "!border-[#1877F2] !bg-[#1877F2] !text-white !shadow-none hover:!border-[#0F5FCB] hover:!bg-[#0F5FCB] hover:!text-white"

const workspaceSurfaceButton =
  "!border-slate-300 !bg-white !text-slate-900 !shadow-none hover:!border-slate-400 hover:!bg-slate-50 hover:!text-slate-900"

const workspacePanel = "ax-workspace-panel border-slate-200 bg-slate-50/70"

const workspaceTable = "ax-table"

const workspaceTextAction = "ax-text-action text-[#1877F2] hover:text-[#0F5FCB]"

const statusTextColor: Record<"warning" | "review" | "info" | "success" | "error" | "neutral", string> = {
  warning: "text-amber-700",
  review: "text-blue-700",
  info: "text-[#1877F2]",
  success: "text-emerald-700",
  error: "text-red-600",
  neutral: "text-slate-500",
}

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
  "h-9 rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0"

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
          className="size-1.5 shrink-0 rounded-full bg-amber-400"
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
  const m = useMotionTokens()
  const clientId = searchParams.get("client")
  const clientName = searchParams.get("clientName")
  const companyId = searchParams.get("company_id")
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
      const response = await accountsPayableApi.list(undefined, companyId ? { companyId } : undefined)
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
  }, [user?.id, companyId])

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
  const activeHasDuplicate = activeItem ? hasActiveDuplicate(activeItem) : false
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
  const selectedReadyItems = useMemo(
    () => items.filter(item => selectedReadyIds.includes(item.id)),
    [items, selectedReadyIds],
  )
  const selectedDuplicateCount = useMemo(
    () => selectedReadyItems.filter(item => hasActiveDuplicate(item)).length,
    [selectedReadyItems],
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
    if (status === "ready_to_publish" && hasActiveDuplicate(activeItem)) {
      toast.error("Resolve or dismiss the duplicate warning before marking this draft ready.")
      return
    }
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
    const item = items.find(candidate => candidate.id === itemId)
    if (checked && item && hasActiveDuplicate(item)) {
      toast.error("Resolve duplicate warnings before selecting this bill for publishing.")
      return
    }
    setSelectedReadyIds(current => checked
      ? Array.from(new Set([...current, itemId]))
      : current.filter(id => id !== itemId))
  }

  const openPublishDialog = () => {
    if (!selectedReadyIds.length) return
    if (selectedDuplicateCount > 0) {
      toast.error("Resolve duplicate warnings before publishing selected bills.")
      return
    }
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
    if (selectedDuplicateCount > 0) {
      toast.error("Resolve duplicate warnings before publishing selected bills.")
      return
    }
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
    if (!retryAttachment && hasActiveDuplicate(activeItem)) {
      toast.error("Resolve or dismiss the duplicate warning before publishing this draft bill.")
      return
    }
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
            <MotionButton
              ref={publishTriggerRef}
              variant="glossy"
              onClick={openPublishDialog}
              disabled={saving || !accountingConnection?.connected || selectedDuplicateCount > 0}
              title={selectedDuplicateCount > 0 ? "Resolve duplicate warnings before publishing" : undefined}
              className={cn("h-9 px-4", workspacePrimaryButton)}
            >
              {destinationBadgeSrc ? <Image src={destinationBadgeSrc} alt="" width={16} height={16} className="mr-1 size-4 rounded-sm object-contain" /> : null}
              Publish {selectedReadyIds.length} {selectedReadyIds.length === 1 ? "bill" : "bills"}
            </MotionButton>
          ) : undefined}
        />

        {/* P11 — client filter chip */}
        {clientId ? (
          <div className={cn("flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm", workspacePanel)}>
            <span className="font-medium text-foreground">
              Filtered to <span className={workspaceTextAction}>{clientName || "client"}</span>
              {clientJobIds ? ` · ${visibleItems.length} item${visibleItems.length === 1 ? "" : "s"}` : " · loading…"}
            </span>
            <InlineAction onClick={() => router.push("/dashboard/accounts-payable")}>
              Clear filter
            </InlineAction>
          </div>
        ) : null}

        <div className={cn("flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs", workspacePanel)}>
          <p className="font-medium text-foreground">
            <span className="font-medium">{destinationName}</span>
            {accountingConnectionLoading
              ? " connection is being checked."
              : accountingConnection?.connected
                ? ` connected${accountingConnection.company_name ? ` to ${accountingConnection.company_name}` : ""}.`
                : " setup required before publishing draft bills."}
          </p>
          <div className="flex items-center gap-4">
            {accountingConnection?.connected ? (
              <InlineAction onClick={() => void loadAccountingDestination(true)} disabled={syncingReferences}>
                {syncingReferences ? "Refreshing..." : "Refresh lists"}
              </InlineAction>
            ) : null}
            <InlineAction onClick={() => router.push("/dashboard/integrations")}>
              Manage integration
            </InlineAction>
          </div>
        </div>

        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-md border border-border bg-card shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-3 py-2.5">
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Draft bills queue">
                {[
                  { value: "needs_attention" as const, label: "Needs attention", count: counts.needs_coding + counts.needs_review },
                  { value: "ready_to_publish" as const, label: "Ready to publish", count: counts.ready_to_publish },
                  { value: "published" as const, label: "Published", count: counts.published },
                ].map(tab => {
                  const isActiveTab = filter === tab.value
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={isActiveTab}
                      onClick={() => setFilter(tab.value)}
                      className={cn(
                        "ax-interactive relative inline-flex h-7 items-center gap-1 rounded-full border px-3 text-xs font-medium",
                        isActiveTab
                          ? "border-[#1877F2] text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-[#1877F2] hover:text-[#1877F2]"
                      )}
                    >
                      {isActiveTab ? (
                        <motion.span
                          layoutId="ap-tab-indicator"
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full bg-[#1877F2]"
                          transition={m.reduced ? { duration: 0 } : m.spring}
                        />
                      ) : null}
                      <span className="relative z-10">{tab.label}</span>
                      <span className="relative z-10 tabular-nums opacity-70">{tab.count}</span>
                    </button>
                  )
                })}
              </div>
              <details className="relative">
                <summary
                  className={cn(
                    "ax-interactive flex h-7 cursor-pointer list-none items-center rounded-full border px-3 text-xs font-medium [&::-webkit-details-marker]:hidden",
                    moreFilters.some(option => option.value === filter)
                      ? "border-[#1877F2] bg-[#1877F2] text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-[#1877F2] hover:text-[#1877F2]",
                  )}
                >
                  More filters
                </summary>
                <div className={cn("absolute right-0 z-20 mt-2 grid min-w-[180px] gap-1 rounded-md border p-1.5 shadow-none", workspacePanel)}>
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
                            ? "bg-[#1877F2] text-white"
                            : "bg-white text-slate-700 hover:bg-slate-100 hover:text-[#1877F2]",
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
              <table className={cn("w-full min-w-[1320px] text-left text-xs", workspaceTable)}>
                <thead className="border-b border-slate-200 bg-slate-100 text-[10px] font-medium uppercase tracking-wider text-slate-500">
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
                <tbody className="divide-y divide-slate-200">
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
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                          <Symbol
                            name="firstsight-draft-bills-empty"
                            size="hero"
                            className="h-56 w-56 sm:h-72 sm:w-72"
                            alt=""
                          />
                          <h3 className="mt-8 text-xl font-medium tracking-tight text-slate-950">
                            {items.length ? "Nothing waiting in this queue" : "Turn that stack of invoices into draft bills"}
                          </h3>
                          <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/70">
                            {items.length
                              ? "No draft bills match this view. Try another filter."
                              : "Review your extracted invoices, then code each one here and publish the approved bills straight to your accounting software."}
                          </p>
                          {!items.length ? (
                            <div className="mt-7 flex flex-col items-center gap-3">
                              <Button asChild variant="glossy" size="sm" className={workspacePrimaryButton}>
                                <Link href="/dashboard/client?mode=invoice">
                                  Review invoices
                                  <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">Recommended</span>
                                </Link>
                              </Button>
                              <Button asChild variant="surface" size="sm" className={workspaceSurfaceButton}>
                                <Link href="/dashboard/client#upload-files">Upload documents</Link>
                              </Button>
                              <InlineAction asChild className="text-xs">
                                <Link href="/blogs">Read the guide</Link>
                              </InlineAction>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence initial={false}>
                      {visibleItems.map(item => {
                        const tone = statusTone[item.status]
                        const isActive = activeId === item.id
                        const isReady = item.status === "ready_to_publish"
                        const hasDuplicate = hasActiveDuplicate(item)
                        const missing = missingInfo.get(item.id)
                        return (
                          <motion.tr
                            key={`${filter}-${item.id}`}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={m.tFast}
                            tabIndex={0}
                            onClick={() => setActiveId(item.id)}
                            onKeyDown={event => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault()
                                setActiveId(item.id)
                              }
                            }}
                            className={cn(
                              "ax-interactive cursor-pointer bg-white font-normal text-slate-900 hover:bg-slate-50",
                              isActive && "bg-blue-50/70",
                            )}
                          >
                            <td className="px-3 py-2.5" onClick={isReady ? event => event.stopPropagation() : undefined}>
                              {isReady ? (
                                <Checkbox
                                  checked={selectedReadyIds.includes(item.id)}
                                  onCheckedChange={checked => toggleSelection(item.id, checked === true)}
                                  disabled={hasDuplicate}
                                  aria-label={`Select ${item.source_filename}`}
                                />
                              ) : (
                                <AnimatePresence mode="popLayout" initial={false}>
                                  <motion.span
                                    key={tone}
                                    initial={m.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={m.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                                    transition={m.tFast}
                                    className={cn("block size-2 rounded-full", dotColor[tone])}
                                  />
                                </AnimatePresence>
                              )}
                            </td>
                            <td className="max-w-[240px] px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-normal text-slate-950">{item.draft_data.vendor || "Supplier missing"}</span>
                                {hasDuplicate ? <span className="size-1.5 shrink-0 rounded-full bg-amber-500" title="Possible duplicate" /> : null}
                                {missing?.missing ? <span className="size-1.5 shrink-0 rounded-full bg-rose-500" title="Missing information" /> : null}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 font-mono tabular-nums text-slate-900">{ledgerValue(item.draft_data.invoice_number)}</td>
                            <td className="px-3 py-2.5 tabular-nums">{shortDate(item.draft_data.invoice_date)}</td>
                            <td className="px-3 py-2.5 tabular-nums">{shortDate(item.draft_data.due_date)}</td>
                            <td className="max-w-[200px] truncate px-3 py-2.5">{ledgerValue(item.draft_data.account_category)}</td>
                            <td className="max-w-[132px] truncate px-3 py-2.5">{ledgerValue(item.draft_data.tax_code)}</td>
                            <td className="px-3 py-2.5 font-mono">{ledgerValue(item.draft_data.currency)}</td>
                            <td className="px-3 py-2.5 text-right font-mono tabular-nums">{ledgerValue(item.draft_data.subtotal)}</td>
                            <td className="px-3 py-2.5 text-right font-mono tabular-nums">{ledgerValue(item.draft_data.tax_amount)}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-normal tabular-nums text-slate-950">{ledgerValue(item.draft_data.total)}</td>
                            <td className="px-3 py-2.5">
                              <AnimatePresence mode="popLayout" initial={false}>
                                <motion.span
                                  key={item.status}
                                  initial={m.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={m.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                                  transition={m.tFast}
                                  className={cn("inline-block text-xs font-medium", statusTextColor[tone])}
                                >
                                  {statusLabel(item.status)}
                                </motion.span>
                              </AnimatePresence>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {activeItem ? (
          <SpotlightCard className="rounded-md">
            <WorkspaceSection
              tone="active"
              symbol="code-map-to-account"
              title="Prepare draft bill"
              hint={`Code the supplier, account, and VAT, then publish to ${destinationName}.`}
              contentClassName="p-0"
            >
            <CardContent className="p-4 sm:p-5">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                    <div className="min-w-0">
                      <h2 className="text-[19px] font-medium tracking-tight text-slate-950">{draft.vendor || "Vendor missing"}</h2>
                      <p className="mt-1 break-all text-[13px] text-foreground">{activeItem.source_filename}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeItem.source_access_url ? (
                        <InlineAction asChild>
                          <a href={activeItem.source_access_url} target="_blank" rel="noreferrer">View attachment</a>
                        </InlineAction>
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
                      <span className={cn("text-xs font-medium", statusTextColor[statusTone[activeItem.status]])}>
                        {statusLabel(activeItem.status)}
                      </span>
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
                          <p className="text-xs font-medium uppercase tracking-wider text-amber-800 dark:text-amber-300">
                            Possible duplicate
                          </p>
                          <p className="mt-1 text-sm font-normal text-amber-950 dark:text-amber-100">
                            {warning.message}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-amber-900/90 dark:text-amber-100/90">
                            Matched draft: <span className="font-medium">{warning.matched_filename || "earlier invoice"}</span>
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
                              <> · Status: <span className="font-medium">{statusLabel(warning.matched_status)}</span></>
                            ) : null}
                          </p>
                          {warning.matched_item_id ? (
                            <button
                              type="button"
                              onClick={() => setActiveId(warning.matched_item_id || null)}
                              className="ax-interactive mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-800 underline underline-offset-2 hover:text-amber-700 dark:text-amber-200"
                            >
                              Open the original →
                            </button>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-4">
                          <InlineAction
                            onClick={() => setDismissDraft({ warningId: warning.id, reason: "" })}
                            disabled={dismissing || discarding || activeLocked}
                          >
                            Dismiss…
                          </InlineAction>
                          <InlineAction
                            tone="danger"
                            onClick={() => void discardActive()}
                            disabled={dismissing || discarding || activeLocked}
                          >
                            Discard this one
                          </InlineAction>
                        </div>
                      </div>
                      {dismissDraft?.warningId === warning.id ? (
                        <div className="mt-3 flex flex-col gap-2 rounded-md border border-amber-200 bg-white/80 p-2.5 dark:bg-amber-950/60">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-amber-800 dark:text-amber-200">
                            Reason for dismissal (optional)
                          </p>
                          <Input
                            value={dismissDraft.reason}
                            onChange={(event) => setDismissDraft(current => current ? { ...current, reason: event.target.value } : current)}
                            placeholder="e.g. legitimate second invoice from this vendor"
                            disabled={dismissing}
                            className="h-9 rounded-md"
                          />
                          <div className="flex items-center justify-end gap-4">
                            <InlineAction
                              onClick={() => setDismissDraft(null)}
                              disabled={dismissing}
                            >
                              Cancel
                            </InlineAction>
                            <Button
                              variant="surface"
                              size="sm"
                              onClick={() => void dismissDuplicateWarning()}
                              disabled={dismissing}
                              className="h-8 px-3 text-xs"
                            >
                              {dismissing ? "Dismissing…" : "Dismiss warning"}
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {autoAppliedRule ? (
                    <div className={cn("flex flex-wrap items-start justify-between gap-3 rounded-md border p-3", workspacePanel)}>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-[#1877F2]">
                          {autoAppliedRule.mode === "auto_ready" ? "Pre-filled & moved to Ready for your approval" : "Pre-filled from memory"}
                        </p>
                        <p className="mt-1 text-sm font-normal text-slate-950">
                          {autoAppliedRule.ruleName}
                        </p>
                        {autoAppliedRule.learnedLabels.length ? (
                          <>
                            <p className="mt-1 text-xs text-foreground/70">
                              Remembered from your past invoices — {autoAppliedRule.learnedLabels.join(", ")}.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {autoAppliedRule.learnedLabels.map((label) => (
                                <span
                                  key={label}
                                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium capitalize text-slate-700"
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
                              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-emerald-700"
                            >
                              <Sparkles className="size-3" />
                              Saved for this supplier. Future invoices can use the same coding.
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                      <InlineAction
                        disabled={saving || activeLocked}
                        onClick={() => void overrideAutoFill()}
                        className="shrink-0"
                      >
                        Override
                      </InlineAction>
                    </div>
                  ) : activeItem.vendor_suggestion ? (
                    <div className={cn("rounded-md border p-3", workspacePanel)}>
                      <p className="text-xs font-medium text-slate-950">Remembered suggestions</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {Object.entries(activeItem.vendor_suggestion.suggested_fields).map(([key, value]) => (
                          <span key={key} className="rounded-md border border-border bg-background px-2 py-1">
                            {key.replaceAll("_", " ")}: <span className="font-medium text-foreground">{value}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {!activeLocked ? (
                    <div className="flex flex-wrap items-center gap-x-9 gap-y-5 py-1">
                      <div className="flex items-center gap-3">
                        <Symbol name="code-account-tag" size="inline" className="h-14 w-14" alt="" />
                        <div>
                          <p className="text-sm font-medium text-slate-950">Pick the account</p>
                          <p className="text-xs text-foreground/70">Where this spend lands in the ledger.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Symbol name="code-coa-tree" size="inline" className="h-14 w-14" alt="" />
                        <div>
                          <p className="text-sm font-medium text-slate-950">Map to your chart</p>
                          <p className="text-xs text-foreground/70">Match it to a GL account number.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Symbol name="code-vat-chip" size="inline" className="h-14 w-14" alt="" />
                        <div>
                          <p className="text-sm font-medium text-slate-950">Set the VAT code</p>
                          <p className="text-xs text-foreground/70">Apply the right tax rate.</p>
                        </div>
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
                          <InlineAction onClick={() => void openPoDialog()} className="text-xs [&_svg]:size-3">
                            <FileText className="size-3" />
                            {activeItem.matched_po ? "Change PO" : "Match PO"}
                          </InlineAction>
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
                            : "border-slate-200 bg-slate-50 text-slate-700",
                        )}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5">
                              <span className="font-medium">PO {activeItem.matched_po.po_number}</span>
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
                            <button type="button" onClick={() => void matchPo(null)} className={cn("font-medium underline-offset-2 hover:underline", workspaceTextAction)}>
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
                      {draft.account_ref_id ? (
                        <div className="flex items-center gap-2 pt-1">
                          <Symbol name="code-4000-chip" size="inline" className="h-12 w-12" alt="" />
                          <span className="text-xs font-normal text-slate-600">Mapped to your chart of accounts.</span>
                        </div>
                      ) : null}
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
                      {draft.tax_code_ref_id ? (
                        <div className="flex items-center gap-2 pt-1">
                          <Symbol name="code-rate-20-tile" size="inline" className="h-12 w-12" alt="" />
                          <span className="text-xs font-normal text-slate-600">Tax rate applied to this bill.</span>
                        </div>
                      ) : null}
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
                      <div className={cn("flex h-9 items-center rounded-lg border px-3 text-sm font-normal text-slate-950", workspacePanel)}>
                        {amountLabel(activeItem)}
                      </div>
                    </div>
                  </div>

                  {draft.due_date ? (
                    <div className="flex items-center gap-4 py-1">
                      <Symbol name="code-aging-timeline" size="medium" className="h-24 w-24 sm:h-28 sm:w-28" alt="" />
                      <div>
                        <p className="text-sm font-medium text-slate-950">Payment due {shortDate(draft.due_date)}</p>
                        <p className="mt-0.5 max-w-sm text-xs leading-relaxed text-foreground/70">
                          This bill carries through to your aging once it&apos;s published — current today, overdue after the due date.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <details className={cn("rounded-md border", workspacePanel)}>
                    <summary className="ax-interactive cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-slate-950 [&::-webkit-details-marker]:hidden">
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
                      <label className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2.5 text-sm text-black">
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
                            <p className="mt-1 text-xs text-foreground">
                              Bill ID {activeItem.quickbooks_publication.quickbooks_bill_id}
                              {activeItem.quickbooks_publication.attachment_status === "attached" ? " - source attached" : ""}
                            </p>
                          ) : null}
                          {activeItem.quickbooks_publication.attachment_status === "failed" ? (
                            <p className="mt-1 text-xs text-foreground">The Bill exists; publish again to retry only its attachment.</p>
                          ) : null}
                        </div>
                      ) : null}
                      {accountingDestination === "xero" && activeXeroPublication ? (
                        <div className="rounded-md border border-border bg-card p-3 text-sm">
                          <p className="font-medium text-foreground">
                            Xero publish: {activeXeroPublication.status}
                          </p>
                          {activeXeroPublication.xero_invoice_id ? (
                            <p className="mt-1 text-xs text-foreground">
                              Invoice ID {activeXeroPublication.xero_invoice_id}
                              {activeXeroPublication.attachment_status === "attached" ? " - source attached" : ""}
                            </p>
                          ) : null}
                          {activeXeroPublication.attachment_status === "failed" ? (
                            <p className="mt-1 text-xs text-foreground">The draft bill exists in Xero; publish again to retry only its attachment.</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </details>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-950">Line items</p>
                      {!activeLocked ? (
                        <InlineAction onClick={addLineItem}>
                          Add line
                        </InlineAction>
                      ) : null}
                    </div>
                    {lineItems.length ? (
                      <div className="overflow-x-auto rounded-md border border-border">
                        <table className={cn("min-w-full text-xs", workspaceTable)}>
                          <thead className="bg-slate-100">
                            <tr>
                              {lineColumns.map(column => (
                                <th key={column} className="whitespace-nowrap border-b border-slate-200 px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-slate-500">
                                  {column.replaceAll("_", " ")}
                                </th>
                              ))}
                              {!activeLocked ? <th className="w-14 border-b border-slate-200 px-2 py-2" /> : null}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {lineItems.map((line, rowIndex) => (
                              <tr key={rowIndex} className="bg-white last:border-b-0">
                                {lineColumns.map(column => (
                                  <td key={column} className="p-1.5">
                                    <input
                                      value={String(line[column] ?? "")}
                                      disabled={activeLocked}
                                      onChange={event => updateLineCell(rowIndex, column, event.target.value)}
                                      className="ax-interactive h-8 min-w-[90px] rounded-sm border border-transparent bg-transparent px-2 font-normal text-slate-950 outline-none focus:border-slate-300 focus:bg-white"
                                    />
                                  </td>
                                ))}
                                {!activeLocked ? (
                                  <td className="p-1.5">
                                    <InlineAction tone="danger" onClick={() => removeLineItem(rowIndex)} className="text-xs">
                                      Remove
                                    </InlineAction>
                                  </td>
                                ) : null}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="rounded-md border border-dashed border-border p-3 text-sm text-foreground">No line items detected.</p>
                    )}
                  </div>

                  {activeItem.status === "ready_to_publish" && !activeLocked ? (
                    <div className="flex items-center gap-4 py-1">
                      <Symbol name="success-bill-ready" size="medium" className="h-28 w-28 sm:h-32 sm:w-32" alt="" />
                      <div>
                        <p className="text-base font-medium text-slate-950">Coded and ready</p>
                        <p className="mt-0.5 max-w-sm text-sm leading-relaxed text-foreground/70">
                          Every field is filled in. Publish it to {destinationName} as a draft bill, or send it back for another look.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className="sticky bottom-0 z-10 -mx-4 -mb-4 flex flex-wrap justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:relative sm:bottom-auto sm:mx-0 sm:mb-0 sm:bg-transparent sm:px-0 sm:py-4 sm:backdrop-blur-0 sm:supports-[backdrop-filter]:bg-transparent">
                    {!activeLocked ? (
                      <>
                        <MotionButton variant="surface" onClick={() => void persistDraft()} disabled={saving} className="h-9">
                          Save changes
                        </MotionButton>
                        {activeItem.status === "ready_to_publish" ? (
                          <>
                            <InlineAction onClick={() => void persistDraft("needs_coding")} disabled={saving} className="px-2">
                              Return to coding
                            </InlineAction>
                            <MotionButton
                              ref={activePublishRef}
                              variant="glossy"
                              onClick={() => void publishActive()}
                              disabled={saving || !accountingConnection?.connected || activeHasDuplicate}
                              title={activeHasDuplicate ? "Resolve duplicate warnings before publishing" : undefined}
                              className={cn("h-9", workspacePrimaryButton)}
                            >
                              Publish to {destinationName}
                            </MotionButton>
                          </>
                        ) : (
                          <Button
                            variant="reviewed"
                            onClick={() => void persistDraft("ready_to_publish")}
                            disabled={saving || activeHasDuplicate}
                            title={activeHasDuplicate ? "Resolve duplicate warnings before marking ready" : undefined}
                            className="h-9"
                          >
                            Mark ready to publish
                          </Button>
                        )}
                      </>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {canRetryAttachment ? (
                        <Button variant="surface" onClick={() => void publishActive()} disabled={saving || !accountingConnection?.connected} className={cn("h-9", workspaceSurfaceButton)}>
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
            <DialogTitle className="flex items-center gap-2.5 text-base font-medium">
              {destinationBadgeSrc ? <Image src={destinationBadgeSrc} alt="" width={20} height={20} className="size-5 rounded-sm object-contain" /> : null}
              {publishResult ? "Publish complete" : `Publish ${selectedReadyIds.length} ${selectedReadyIds.length === 1 ? "bill" : "bills"} to ${destinationName}`}
            </DialogTitle>
            <DialogDescription className="text-sm font-normal leading-6 text-foreground">
              {publishResult
                ? "The bulk publish finished. Failed items remain in the queue and can be retried."
                : `You are publishing ${selectedReadyIds.length} draft ${selectedReadyIds.length === 1 ? "bill" : "bills"} to ${destinationName}. This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>

          {publishResult ? (
            <div className="space-y-3">
              {publishResult.succeeded > 0 && publishResult.failed.length === 0 ? (
                <div className="flex flex-col items-center py-2 text-center">
                  <Symbol name="success-approved" size="hero" className="h-48 w-48 sm:h-56 sm:w-56" alt="" />
                  <p className="mt-4 text-base font-medium text-slate-950">
                    {publishResult.succeeded} {publishResult.succeeded === 1 ? "bill" : "bills"} published to {destinationName}
                  </p>
                </div>
              ) : null}
              <div className={cn("flex flex-wrap items-center gap-2 rounded-md border px-3 py-2.5 text-sm", workspacePanel)}>
                <StatusBadge tone="success">{publishResult.succeeded} published</StatusBadge>
                {publishResult.failed.length > 0 ? (
                  <StatusBadge tone="error">{publishResult.failed.length} failed</StatusBadge>
                ) : (
                  <span className="text-xs font-medium text-foreground">All selected draft bills landed in {destinationName}.</span>
                )}
              </div>
              {publishResult.failed.length > 0 ? (
                <div className="rounded-md border border-border">
                  <p className={cn("border-b px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500", workspacePanel)}>
                    Failed items
                  </p>
                  <ul className="max-h-[200px] divide-y divide-border overflow-y-auto">
                    {publishResult.failed.map((row, index) => (
                      <li key={`${row.vendor}-${index}`} className="px-3 py-2.5 text-sm">
                        <p className="font-medium text-foreground">{row.vendor}</p>
                        {row.reason ? (
                          <p className="mt-0.5 text-xs leading-5 text-foreground">{row.reason}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <p className={cn("border-b px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500", workspacePanel)}>
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
              <MotionButton variant="surface" onClick={closePublishDialog} className="h-9 px-4">
                Close
              </MotionButton>
            ) : (
              <>
                <InlineAction onClick={closePublishDialog} disabled={publishing} className="px-2">
                  Cancel
                </InlineAction>
                <MotionButton
                  ref={confirmPublishRef}
                  variant="glossy"
                  onClick={() => void confirmPublishSelected()}
                  disabled={publishing || !accountingConnection?.connected || !selectedReadyIds.length || selectedDuplicateCount > 0}
                  title={selectedDuplicateCount > 0 ? "Resolve duplicate warnings before publishing" : undefined}
                  className={cn("h-9 px-4", workspacePrimaryButton)}
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
            <DialogTitle className="flex items-center gap-2 text-base font-medium">
              <span className="inline-flex size-6 items-center justify-center rounded-md bg-blue-50 text-[#1877F2]">
                <FileText className="size-3.5" />
              </span>
              Match a purchase order
            </DialogTitle>
            <DialogDescription className="text-sm font-normal leading-6 text-foreground">
              Open POs{draft.vendor ? ` for ${draft.vendor}` : ""}. Selecting one links it to this invoice.
            </DialogDescription>
          </DialogHeader>

          {poLoading ? (
            <div className="flex items-center justify-center py-8 text-sm font-medium text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading purchase orders…
            </div>
          ) : poList.length === 0 ? (
            <div className={cn("rounded-xl border p-5 text-center", workspacePanel)}>
              <p className="text-sm font-medium text-slate-950">No open purchase orders</p>
              <p className="mt-1 text-xs font-normal text-foreground">No open purchase orders are available for this supplier.</p>
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
                      "ax-interactive flex w-full items-center justify-between gap-3 rounded-lg border-2 bg-white px-3 py-2.5 text-left text-black transition-colors",
                      exceeds
                        ? "border-amber-300 hover:border-amber-500 hover:bg-amber-50"
                        : "border-slate-200 hover:border-[#1877F2] hover:bg-blue-50/60",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">PO {po.po_number}</p>
                      <p className="text-xs font-normal text-slate-600">
                        {po.vendor_name || "—"}{po.po_date ? ` · ${po.po_date}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-sm font-normal tabular-nums text-slate-950">{po.currency || ""} {Number(po.total).toFixed(2)}</p>
                      {po.remaining_amount != null ? (
                        <p className="text-[11px] font-medium text-neutral-600">Remaining {Number(po.remaining_amount).toFixed(2)}</p>
                      ) : null}
                      {exceeds ? <p className="text-[11px] font-medium text-amber-700">Invoice exceeds PO</p> : null}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <DialogFooter>
            <InlineAction onClick={() => setPoDialogOpen(false)}>Close</InlineAction>
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

"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCheck,
  CircleCheck,
  Clock,
  Cloud,
  FileText,
  FolderTree,
  Hash,
  Landmark,
  Link2,
  ListChecks,
  Loader2,
  Percent,
  Plus,
  ReceiptText,
  Sparkles,
  SlidersHorizontal,
  Table as TableIcon,
  Tag,
  Trash2,
  Wallet,
} from "lucide-react"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { SegmentedTabs } from "@/components/dashboard/SegmentedTabs"
import { Field } from "@/components/dashboard/Field"
import { Symbol } from "@/components/dashboard/Symbol"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { WorkspaceActivityIndicator } from "@/components/dashboard/WorkspaceActivityIndicator"
import { AnomalyChip } from "@/components/dashboard/AnomalyChip"
import { ReviewScoreBadge } from "@/components/dashboard/ReviewScoreBadge"
import { missingVatCopy, overPoCopy } from "@/lib/anomaly-reasons"
import { computeReviewScore, REVIEW_LEVEL_WEIGHT } from "@/lib/review-score"
import { deriveMissingInfo } from "@/lib/missing-info"
import { validateBill, summarizeBlocking, type BillValidation } from "@/lib/bill-validation"
import { Button } from "@/components/ui/button"
import { InlineAction } from "@/components/ui/inline-action"
import { MotionButton } from "@/components/ui/motion-button"
import { CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { PublishSuccessBurst } from "@/components/dashboard/PublishSuccessBurst"
import { PublishConfirmation, type PublishConfirmationState } from "@/components/dashboard/PublishConfirmation"
import { SpotlightCard } from "@/components/dashboard/SpotlightCard"
import { PriorityBoard, type PrioritySegmentKey } from "@/components/dashboard/accounts-payable/PriorityBoard"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
  | "pending_approval"
  | "ready_to_publish"
  | "published"
  | "duplicates"
  | "missing_info"
  | "failed"
  | "discarded"

type MoreFilter = Extract<QueueFilter, "duplicates" | "missing_info" | "failed" | "discarded">

type PendingConfirmationAction = "discard" | "submit" | "publish" | "publish_over_po" | "retry_attachment"

const queueStatuses: Array<{ value: AccountsPayableStatus; label: string }> = [
  { value: "needs_coding", label: "Needs coding" },
  { value: "needs_review", label: "Needs review" },
  { value: "pending_approval", label: "Awaiting approval" },
  { value: "ready_to_publish", label: "Ready to publish" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
  { value: "discarded", label: "Discarded" },
]

const statusTone: Record<AccountsPayableStatus, "warning" | "review" | "info" | "success" | "error" | "neutral"> = {
  needs_coding: "warning",
  needs_review: "review",
  pending_approval: "review",
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

// Icon-led labels (Tables-style) for the coding form — the icon replaces the
// old descriptive subtext under each field.
const fieldIcons: Partial<Record<keyof AccountsPayableDraftData, React.ReactNode>> = {
  invoice_number: <Hash />,
  invoice_date: <Calendar />,
  due_date: <Clock />,
  reference: <FileText />,
  currency: <Wallet />,
}

// Icon-led labels for the three coding selects — the icon carries the meaning
// the old descriptive subtexts used to ("pick the account", "map to chart",
// "set the VAT code"), so the words can go.
const supplierIcon = <Building2 />
const accountIcon = <FolderTree />
const taxIcon = <Percent />

const moreFilters: Array<{ value: MoreFilter; label: string }> = [
  { value: "duplicates", label: "Duplicates" },
  { value: "missing_info", label: "Missing info" },
  { value: "failed", label: "Failed" },
  { value: "discarded", label: "Discarded" },
]

const workspacePanel = "ax-workspace-panel border-slate-200 bg-slate-50/70"

const workspaceTable = "ax-table"

function AccountingDestinationGlyph({
  destination,
  className,
  iconClassName,
}: {
  destination: AccountingDestination | null
  className?: string
  iconClassName?: string
}) {
  if (destination === "xero") {
    return (
      <span className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700", className)}>
        <Cloud className={cn("size-3.5", iconClassName)} strokeWidth={2.3} aria-hidden="true" />
      </span>
    )
  }

  if (destination === "quickbooks") {
    return (
      <span className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700", className)}>
        <Landmark className={cn("size-3.5", iconClassName)} strokeWidth={2.3} aria-hidden="true" />
      </span>
    )
  }

  return null
}

const statusTextColor: Record<"warning" | "review" | "info" | "success" | "error" | "neutral", string> = {
  warning: "text-[var(--text-attention)]",
  review: "text-[var(--text-review)]",
  info: "text-[var(--text-action)]",
  success: "text-[var(--text-success)]",
  error: "text-[var(--text-danger)]",
  neutral: "text-[var(--workspace-muted)]",
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

// Label content for a coding Field: ink text + an amber dirty dot for unsaved
// changes. Passed as the `label` of the shared <Field>, so the icon/structure
// comes from Field and the dot rides alongside the word.
function FieldLabel({
  dirty,
  children,
}: {
  htmlFor?: string
  dirty?: boolean
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-foreground">
      {children}
      {dirty ? (
        <span
          aria-label="Unsaved change"
          title="Unsaved change"
          className="size-1.5 shrink-0 rounded-full bg-amber-400"
        />
      ) : null}
    </span>
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
    class_ref_id: draft.class_ref_id,
    location_ref_id: draft.location_ref_id,
    tracking_option_ref_ids: draft.tracking_option_ref_ids,
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
  const [pendingConfirmationAction, setPendingConfirmationAction] = useState<PendingConfirmationAction | null>(null)
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
      pending_approval: 0,
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

  // Pre-publish validation — pure checks (balance, required fields, currency)
  // over the data already on the page. Drives the per-row flag and the publish
  // gate; computed once over the whole queue.
  const validations = useMemo(() => {
    const map = new Map<string, BillValidation>()
    for (const item of items) {
      map.set(item.id, validateBill(item, { hasDuplicate: hasActiveDuplicate(item) }))
    }
    return map
  }, [items])

  // Partition the selected (ready) bills into clean vs blocked so the gate can
  // publish the clean ones while holding the broken ones back.
  const selectedValidations = useMemo(
    () => selectedReadyItems.map(item => ({
      id: item.id,
      vendor: item.draft_data.vendor || "Vendor missing",
      validation: validations.get(item.id) ?? validateBill(item, { hasDuplicate: hasActiveDuplicate(item) }),
    })),
    [selectedReadyItems, validations],
  )
  const blockedSelected = useMemo(
    () => selectedValidations.filter(entry => !entry.validation.ok),
    [selectedValidations],
  )
  const cleanSelectedIds = useMemo(
    () => selectedValidations.filter(entry => entry.validation.ok).map(entry => entry.id),
    [selectedValidations],
  )
  const prePublishSummary = useMemo(
    () => summarizeBlocking(blockedSelected.map(entry => entry.validation)),
    [blockedSelected],
  )

  // Topic 8 - which priority segment the queue is currently focused on. The
  // four lead segments map 1:1 to the primary queue filters; "more" filters
  // (duplicates / missing info / failed / discarded) leave no segment lit.
  const activeSegment: PrioritySegmentKey | null =
    filter === "needs_attention" || filter === "pending_approval" || filter === "ready_to_publish" || filter === "published"
      ? filter
      : null

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
  // Per-line coding keys live in their own select columns, not the generic data
  // columns — keep them out of the auto-detected text columns.
  const LINE_CODING_KEYS = new Set(["account_ref_id", "tax_code_ref_id", "class_ref_id", "tracking_option_ref_ids"])
  const lineColumns = (() => {
    const keys = Array.from(new Set(lineItems.flatMap(line => Object.keys(line)))).filter(key => !LINE_CODING_KEYS.has(key))
    return keys.slice(0, 6).length ? keys.slice(0, 6) : ["description", "quantity", "unit_price", "line_total"]
  })()
  const activeLocked = activeItem?.status === "published" || activeItem?.status === "discarded"
  const vendors = accountingReferences.filter(item => item.resource_type === "vendor" && item.active)
  const accounts = accountingReferences.filter(item => item.resource_type === "account" && item.active)
  const taxCodes = accountingReferences.filter(item => item.resource_type === "tax_code" && item.active)
  // Dimensional coding references — Class + Location (QuickBooks) / Tracking (Xero).
  const classes = accountingReferences.filter(item => item.resource_type === "class" && item.active)
  const locations = accountingReferences.filter(item => item.resource_type === "location" && item.active)
  const trackingOptions = accountingReferences.filter(item => item.resource_type === "tracking_option" && item.active)
  // Group tracking options by their category so each category gets its own select.
  const trackingGroups = useMemo(() => {
    const groups = new Map<string, { categoryId: string; categoryName: string; options: AccountingReferenceItem[] }>()
    for (const option of trackingOptions) {
      const details = (option.details || {}) as { category_id?: string; category_name?: string }
      const categoryId = String(details.category_id || "uncategorized")
      const categoryName = String(details.category_name || "Tracking")
      if (!groups.has(categoryId)) groups.set(categoryId, { categoryId, categoryName, options: [] })
      groups.get(categoryId)!.options.push(option)
    }
    return Array.from(groups.values())
  }, [trackingOptions])
  const destinationName = accountingDestination === "xero" ? "Xero" : accountingDestination === "quickbooks" ? "QuickBooks" : "accounting destination"
  const isQuickBooks = accountingDestination === "quickbooks"
  // Approval gate — owner = approver, reviewer = preparer (role rides on the
  // active workspace membership record).
  const isApprover = activeWorkspace?.role === "owner"
  // Line-item splits — only show per-line coding columns when the destination is
  // connected and there's a chart to code against.
  const showLineCoding = Boolean(accountingConnection?.connected) && (accounts.length > 0 || taxCodes.length > 0)
  const activeAccountingPublication =
    accountingDestination === "xero"
      ? activeXeroPublication
      : isQuickBooks
        ? activeItem?.quickbooks_publication
        : null
  const canRetryAttachment =
    activeItem?.status === "published" &&
    activeAccountingPublication?.attachment_status === "failed"
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

  // Dimensional coding — single-value header dimensions (Class / Location).
  const selectDimension = (idField: "class_ref_id" | "location_ref_id", value: string) => {
    setDraft(current => ({ ...current, [idField]: value === "none" ? "" : value }))
  }

  // Xero tracking — one option per category; replace the option for that category
  // within the header's tracking_option_ref_ids list.
  const selectTrackingOption = (categoryOptionIds: string[], value: string) => {
    setDraft(current => {
      const kept = (current.tracking_option_ref_ids || []).filter(id => !categoryOptionIds.includes(id))
      return {
        ...current,
        tracking_option_ref_ids: value === "none" ? kept : [...kept, value],
      }
    })
  }

  const updateLineCell = (rowIndex: number, key: string, value: string) => {
    setDraft(current => {
      const updated = (current.line_items || []).map((line, index) => (
        index === rowIndex ? { ...line, [key]: value } : line
      ))
      return { ...current, line_items: updated }
    })
  }

  // Line-item splits — per-line account / tax (+ class / tracking) coding. "none"
  // clears the ref so the header coding stays the default/fallback.
  const updateLineCoding = (rowIndex: number, key: "account_ref_id" | "tax_code_ref_id" | "class_ref_id", value: string) => {
    setDraft(current => {
      const updated = (current.line_items || []).map((line, index) => (
        index === rowIndex ? { ...line, [key]: value === "none" ? "" : value } : line
      ))
      return { ...current, line_items: updated }
    })
  }

  const updateLineTracking = (rowIndex: number, categoryOptionIds: string[], value: string) => {
    setDraft(current => {
      const updated = (current.line_items || []).map((line, index) => {
        if (index !== rowIndex) return line
        const existing = Array.isArray(line.tracking_option_ref_ids) ? (line.tracking_option_ref_ids as string[]) : []
        const kept = existing.filter(id => !categoryOptionIds.includes(id))
        return { ...line, tracking_option_ref_ids: value === "none" ? kept : [...kept, value] }
      })
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

  const requestDiscardActive = () => {
    if (!activeItem) return
    setPendingConfirmationAction("discard")
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
    // Pre-publish gate — only the clean bills go out; broken ones are held back.
    const publishIds = cleanSelectedIds
    if (!publishIds.length) {
      toast.error("These bills have issues to fix before publishing.")
      return
    }
    const blockedIds = new Set(blockedSelected.map(entry => entry.id))
    setPublishing(true)
    setPublishResult(null)
    try {
      const response = await accountsPayableApi.bulkPublish(publishIds)
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
      // Keep failed and held-back bills selected; drop the ones that published.
      setSelectedReadyIds(current => current.filter(id => failedIds.has(id) || blockedIds.has(id)))
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
    const retryAttachment = activeItem.status === "published" && activeAccountingPublication?.attachment_status === "failed"
    if (!retryAttachment && hasActiveDuplicate(activeItem)) {
      toast.error("Resolve or dismiss the duplicate warning before publishing this draft bill.")
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

  const requestPublishActive = () => {
    if (!activeItem || !["ready_to_publish", "published"].includes(activeItem.status)) return
    const retryAttachment = activeItem.status === "published" && activeAccountingPublication?.attachment_status === "failed"
    // P9 — confirm before publishing an invoice that exceeds its matched PO.
    if (activeItem.po_match_status === "exceeds" && activeItem.matched_po) {
      setPendingConfirmationAction("publish_over_po")
      return
    }
    if (!retryAttachment && hasActiveDuplicate(activeItem)) {
      toast.error("Resolve or dismiss the duplicate warning before publishing this draft bill.")
      return
    }
    setPendingConfirmationAction(retryAttachment ? "retry_attachment" : "publish")
  }

  // Approval gate — preparer submits the coded bill for approval.
  const submitActive = async () => {
    if (!activeItem) return
    if (hasActiveDuplicate(activeItem)) {
      toast.error("Resolve or dismiss the duplicate warning before submitting.")
      return
    }
    setSaving(true)
    try {
      await accountsPayableApi.update(activeItem.id, {
        draft_data: buildDraftUpdate(draft),
        attachment_visible: attachmentVisible,
      })
      const response = await accountsPayableApi.submit(activeItem.id)
      mergeItem(response.item)
      toast.success("Submitted for approval.")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not submit this draft bill.")
    } finally {
      setSaving(false)
    }
  }

  const requestSubmitActive = () => {
    if (!activeItem) return
    if (hasActiveDuplicate(activeItem)) {
      toast.error("Resolve or dismiss the duplicate warning before submitting.")
      return
    }
    setPendingConfirmationAction("submit")
  }

  const confirmPendingAction = async () => {
    if (!pendingConfirmationAction) return
    const action = pendingConfirmationAction

    if (action === "publish_over_po") {
      const retryAttachment = activeItem?.status === "published" && activeAccountingPublication?.attachment_status === "failed"
      if (retryAttachment) {
        setPendingConfirmationAction("retry_attachment")
        return
      }
    }

    setPendingConfirmationAction(null)
    if (action === "discard") {
      await discardActive()
    } else if (action === "submit") {
      await submitActive()
    } else {
      await publishActive()
    }
  }

  // Approval gate — approver approves a pending bill (→ ready_to_publish).
  const approveActive = async () => {
    if (!activeItem) return
    setSaving(true)
    try {
      const response = await accountsPayableApi.approve(activeItem.id)
      mergeItem(response.item)
      toast.success("Approved.")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not approve this draft bill.")
    } finally {
      setSaving(false)
    }
  }

  // Approval gate — approver returns a pending bill for re-coding.
  const returnActive = async () => {
    if (!activeItem) return
    setSaving(true)
    try {
      const response = await accountsPayableApi.returnItem(activeItem.id)
      mergeItem(response.item)
      toast.success("Returned for coding.")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not return this draft bill.")
    } finally {
      setSaving(false)
    }
  }

  const pendingConfirmationBusy = saving || discarding
  const pendingConfirmationDetails = (() => {
    if (!pendingConfirmationAction || !activeItem) return null
    const vendor = activeItem.draft_data.vendor || "this draft bill"
    const amount = amountLabel(activeItem)
    const amountSuffix = amount && amount !== "-" ? ` (${amount})` : ""

    if (pendingConfirmationAction === "discard") {
      return {
        title: "Discard duplicate draft",
        description: `This marks ${vendor} as a confirmed duplicate and removes it from the active review queue.`,
        actionLabel: "Discard draft",
        actionVariant: "destructive" as const,
        icon: <Trash2 className="size-4" aria-hidden="true" />,
      }
    }

    if (pendingConfirmationAction === "submit") {
      return {
        title: "Submit for approval",
        description: `This saves the coded draft bill for ${vendor} and sends it to the approval queue.`,
        actionLabel: "Submit for approval",
        actionVariant: "glossy" as const,
        icon: <CheckCheck className="size-4" aria-hidden="true" />,
      }
    }

    if (pendingConfirmationAction === "publish_over_po" && activeItem.matched_po) {
      const over = activeItem.matched_po.over_by ? ` by ${activeItem.matched_po.over_by}` : ""
      return {
        title: "Invoice exceeds purchase order",
        description: `This invoice exceeds PO ${activeItem.matched_po.po_number}${over}. Publishing will still create a draft bill in ${destinationName}.`,
        actionLabel: "Publish anyway",
        actionVariant: "glossy" as const,
        icon: <AlertTriangle className="size-4" aria-hidden="true" />,
      }
    }

    if (pendingConfirmationAction === "retry_attachment") {
      return {
        title: "Retry source attachment",
        description: `Attach the source document to the existing ${destinationName} draft bill for ${vendor}.`,
        actionLabel: "Retry attachment",
        actionVariant: "surface" as const,
        icon: <AccountingDestinationGlyph destination={accountingDestination} />,
      }
    }

    return {
      title: `Publish draft bill to ${destinationName}`,
      description: `This saves the current coding and publishes ${vendor}${amountSuffix} as a draft bill in ${destinationName}. This cannot be undone.`,
      actionLabel: `Publish to ${destinationName}`,
      actionVariant: "glossy" as const,
      icon: <AccountingDestinationGlyph destination={accountingDestination} />,
    }
  })()

  if (authLoading || !user) return <DashboardRouteLoader label="Loading draft bills" />

  return (
    <DashboardShell activeItem="accounts_payable" title="Draft bills" user={user} contentClassName="max-w-none px-3 py-4 sm:px-5 lg:px-6">
      <div className="space-y-6">
        <PageHeader
          title="Draft bills"
          description="Review exceptions, approve coded bills, and publish clean drafts to QuickBooks or Xero."
          actions={selectedReadyIds.length ? (
            <MotionButton
              ref={publishTriggerRef}
              variant="glossy"
              onClick={openPublishDialog}
              disabled={saving || !accountingConnection?.connected || selectedDuplicateCount > 0}
              title={selectedDuplicateCount > 0 ? "Resolve duplicate warnings before publishing" : undefined}
              className="h-9 px-4"
            >
              <AccountingDestinationGlyph destination={accountingDestination} className="mr-1" />
              Publish {selectedReadyIds.length} {selectedReadyIds.length === 1 ? "bill" : "bills"}
            </MotionButton>
          ) : undefined}
        />

        {/* Priority summary over the counts the page already computes. */}
        <PriorityBoard
          needsAttention={counts.needs_coding + counts.needs_review}
          ready={counts.ready_to_publish}
          published={counts.published}
          duplicates={duplicateCount}
          missingInfo={missingInfoCount}
          pendingApproval={counts.pending_approval}
          activeSegment={activeSegment}
          onSelectSegment={(key) => setFilter(key)}
          selectedCount={selectedReadyIds.length}
          destinationChip={
            <>
              {accountingConnectionLoading ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-900">
                  <AccountingDestinationGlyph destination={accountingDestination} />
                  {destinationName} checking
                  <StatusBadge tone="processing" className="h-5 px-2 text-[11px]">Syncing</StatusBadge>
                </span>
              ) : accountingConnection?.connected ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-950">
                  <AccountingDestinationGlyph destination={accountingDestination} />
                  Connected to {destinationName}
                  <span className="max-w-[220px] truncate text-xs font-medium text-emerald-800">
                    {accountingConnection.company_name || "Ready for draft bills"}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-950">
                  <Link2 className="size-4" aria-hidden="true" />
                  QuickBooks or Xero required
                  <StatusBadge tone="warning" className="h-5 px-2 text-[11px]">Publishing locked</StatusBadge>
                </span>
              )}
              {clientId ? (
                <StatusBadge tone="info">
                  {clientName || "Client"}
                  {clientJobIds ? ` · ${visibleItems.length}` : ""}
                </StatusBadge>
              ) : null}
            </>
          }
        />

        {/* Pre-publish gate — a quiet line when some selected bills won't pass
            validation, so they're not silently dropped at publish time. */}
        {selectedReadyIds.length > 0 && blockedSelected.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2.5 rounded-md border border-[color-mix(in_srgb,var(--text-danger)_30%,transparent)] bg-white px-3 py-2">
            <StatusBadge tone="error">{blockedSelected.length} need a fix</StatusBadge>
            <span className="text-xs font-medium text-[var(--text-danger)]">
              {prePublishSummary} · held back when you publish
            </span>
            {cleanSelectedIds.length > 0 ? (
              <StatusBadge tone="success">{cleanSelectedIds.length} ready to go</StatusBadge>
            ) : null}
          </div>
        ) : null}

        {/* Quieter secondary actions — destination plumbing is reachable but no
            longer competes with the queue. */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          {clientId ? (
            <InlineAction tone="neutral" onClick={() => router.push("/dashboard/accounts-payable")}>
              Clear filter
            </InlineAction>
          ) : null}
          {accountingConnection?.connected ? (
            <InlineAction tone="brand" onClick={() => void loadAccountingDestination(true)} disabled={syncingReferences}>
              {syncingReferences ? "Syncing reference lists" : "Refresh lists"}
            </InlineAction>
          ) : null}
          <InlineAction tone="brand" onClick={() => router.push("/dashboard/integrations")}>
            Manage integration
          </InlineAction>
        </div>

        <div className="space-y-6">
          <WorkspaceSection
            icon={<TableIcon />}
            title="Draft bill queue"
            hint="Open exceptions, approval items, or clean drafts."
            contentClassName="p-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
              <SegmentedTabs
                aria-label="Draft bills queue"
                value={filter}
                onValueChange={(value) => setFilter(value as QueueFilter)}
                size="sm"
                tabs={[
                  { value: "needs_attention", label: "Needs attention", count: counts.needs_coding + counts.needs_review },
                  { value: "pending_approval", label: "Awaiting approval", count: counts.pending_approval },
                  { value: "ready_to_publish", label: "Ready to publish", count: counts.ready_to_publish },
                  { value: "published", label: "Published", count: counts.published },
                ]}
              />
              <details className="relative shrink-0">
                <summary
                  className={cn(
                    "ax-interactive flex h-8 cursor-pointer list-none items-center rounded-full border px-3.5 text-[13px] font-medium [&::-webkit-details-marker]:hidden",
                    moreFilters.some(option => option.value === filter)
                      ? "border-[var(--workspace-primary)] bg-[var(--workspace-primary)] text-white"
                      : "border-slate-300 bg-white text-foreground hover:border-[var(--workspace-primary)] hover:text-[var(--workspace-primary)]",
                  )}
                >
                  More filters
                </summary>
                <div className={cn("absolute right-0 z-20 mt-2 grid min-w-[180px] gap-1 rounded-lg border p-1.5 shadow-none", workspacePanel)}>
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
                          "ax-interactive flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[13px] font-medium",
                          filter === option.value
                            ? "bg-[var(--workspace-primary)] text-white"
                            : "bg-white text-foreground hover:bg-slate-100 hover:text-[var(--workspace-primary)]",
                        )}
                      >
                        {option.label}
                        <span className="ml-3 tabular-nums text-foreground">{count}</span>
                      </button>
                    )
                  })}
                </div>
              </details>
            </div>

            <div className="border-t border-border">
              <div className="lg:hidden">
                {loading ? (
                  <div className="p-4">
                    <WorkspaceActivityIndicator
                      title="Retrieving draft bills"
                      detail="Checking supplier coding, VAT, due dates, and publishing status."
                    />
                  </div>
                ) : visibleItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                    <Symbol
                      name="firstsight-draft-bills-empty"
                      size="hero"
                      className="h-24 w-24"
                      alt=""
                    />
                    <h3 className="mt-4 text-lg font-medium tracking-tight text-slate-950">
                      {items.length ? "Nothing in this view" : "No draft bills yet"}
                    </h3>
                    {!items.length ? (
                      <div className="mt-4 flex w-full max-w-xs flex-col items-stretch gap-2">
                        <Button asChild variant="glossy" size="sm">
                          <Link href="/dashboard/client#upload-files">
                            Upload an invoice batch
                          </Link>
                        </Button>
                        <Button asChild variant="surface" size="sm">
                          <Link href="/dashboard/integrations">Connect QuickBooks or Xero</Link>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    <AnimatePresence initial={false}>
                      {visibleItems.map(item => {
                        const tone = statusTone[item.status]
                        const isActive = activeId === item.id
                        const isReady = item.status === "ready_to_publish"
                        const hasDuplicate = hasActiveDuplicate(item)
                        const missing = missingInfo.get(item.id)
                        const validation = validations.get(item.id)
                        const issueBadges = [
                          hasDuplicate ? { label: "Duplicate", tone: "warning" as const } : null,
                          missing?.missing ? { label: "Missing info", tone: "error" as const } : null,
                          validation?.errors.length ? { label: `${validation.errors.length} issue${validation.errors.length === 1 ? "" : "s"}`, tone: "error" as const } : null,
                          !validation?.errors.length && validation?.warnings.length ? { label: `${validation.warnings.length} to check`, tone: "warning" as const } : null,
                        ].filter(Boolean) as Array<{ label: string; tone: "warning" | "error" }>
                        return (
                          <motion.div
                            key={`mobile-${filter}-${item.id}`}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={m.tFast}
                            role="button"
                            tabIndex={0}
                            aria-label={`Open ${item.draft_data.vendor || item.source_filename || "draft bill"}`}
                            onClick={() => setActiveId(item.id)}
                            onKeyDown={event => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault()
                                setActiveId(item.id)
                              }
                            }}
                            data-state={isActive ? "selected" : undefined}
                            className={cn(
                              "ax-interactive cursor-pointer bg-white p-4 text-left text-sm text-slate-900",
                              isActive && "bg-[var(--workspace-soft)]/70",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="ax-data-entity truncate text-[15px] font-semibold text-slate-950">
                                    {item.draft_data.vendor || "Supplier missing"}
                                  </span>
                                  {hasDuplicate ? <span className="size-1.5 shrink-0 rounded-full bg-amber-500" title="Possible duplicate" /> : null}
                                  {missing?.missing ? <span className="size-1.5 shrink-0 rounded-full bg-rose-500" title="Missing information" /> : null}
                                </div>
                                <p className="mt-1 truncate text-xs font-medium text-foreground/70">{item.source_filename}</p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="font-mono text-sm tabular-nums text-slate-950">{amountLabel(item)}</p>
                                <StatusBadge tone={tone} className="mt-1 h-5 px-2 text-[11px]">
                                  {statusLabel(item.status)}
                                </StatusBadge>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                              <div className="rounded-md border border-border bg-background px-2.5 py-2">
                                <p className="font-medium text-foreground/60">Bill</p>
                                <p className="mt-0.5 truncate font-mono text-slate-950">{ledgerValue(item.draft_data.invoice_number)}</p>
                              </div>
                              <div className="rounded-md border border-border bg-background px-2.5 py-2">
                                <p className="font-medium text-foreground/60">Due</p>
                                <p className="mt-0.5 text-slate-950">{shortDate(item.draft_data.due_date)}</p>
                              </div>
                              <div className="col-span-2 rounded-md border border-border bg-background px-2.5 py-2">
                                <p className="font-medium text-foreground/60">Account</p>
                                <p className="mt-0.5 truncate text-slate-950">{ledgerValue(item.draft_data.account_category)}</p>
                              </div>
                            </div>

                            {issueBadges.length ? (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {issueBadges.map((badge) => (
                                  <StatusBadge key={`${item.id}-${badge.label}`} tone={badge.tone} className="h-5 px-2 text-[11px]">
                                    {badge.label}
                                  </StatusBadge>
                                ))}
                              </div>
                            ) : null}

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              {isReady ? (
                                <div
                                  className="flex min-h-8 items-center gap-2 rounded-full border border-border bg-background px-2.5"
                                  onClick={event => event.stopPropagation()}
                                >
                                  <Checkbox
                                    checked={selectedReadyIds.includes(item.id)}
                                    onCheckedChange={checked => toggleSelection(item.id, checked === true)}
                                    disabled={hasDuplicate}
                                    aria-label={`Select ${item.source_filename}`}
                                  />
                                  <span className="text-xs font-medium text-foreground">Select to publish</span>
                                </div>
                              ) : (
                                <span className="text-xs font-medium text-foreground/70">Tap to open in the editor</span>
                              )}
                              <Button
                                variant="surface"
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setActiveId(item.id)
                                }}
                              >
                                Open
                              </Button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <div className="hidden overflow-x-auto lg:block">
              <table className={cn("w-full min-w-[1320px] text-left text-xs", workspaceTable)}>
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="w-10 px-4 py-3" />
                    <th className="min-w-[180px] px-4 py-3">Supplier</th>
                    <th className="w-[124px] px-4 py-3">Bill number</th>
                    <th className="w-[104px] px-4 py-3">Invoice date</th>
                    <th className="w-[104px] px-4 py-3">Due date</th>
                    <th className="min-w-[150px] px-4 py-3">Account</th>
                    <th className="w-[112px] px-4 py-3">VAT code</th>
                    <th className="w-[56px] px-4 py-3">Cur</th>
                    <th className="w-[92px] px-4 py-3 text-right">Net</th>
                    <th className="w-[92px] px-4 py-3 text-right">VAT</th>
                    <th className="w-[100px] px-4 py-3 text-right">Total</th>
                    <th className="w-[132px] px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="p-4">
                        <WorkspaceActivityIndicator
                          title="Retrieving draft bills"
                          detail="Checking supplier coding, VAT, due dates, and publishing status."
                        />
                      </td>
                    </tr>
                  ) : visibleItems.length === 0 ? (
                    <tr>
                      <td colSpan={12}>
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                          <Symbol
                            name="firstsight-draft-bills-empty"
                            size="hero"
                            className="h-24 w-24 sm:h-28 sm:w-28"
                            alt=""
                          />
                          <h3 className="mt-5 text-xl font-medium tracking-tight text-slate-950">
                            {items.length ? "Nothing in this view" : "No draft bills yet"}
                          </h3>
                          {!items.length ? (
                            <div className="mt-4 flex w-full max-w-2xl flex-col items-center gap-4">
                              <Button asChild variant="glossy" size="sm">
                                <Link href="/dashboard/client#upload-files">
                                  Upload an invoice batch
                                </Link>
                              </Button>
                              <Button asChild variant="surface" size="sm">
                                <Link href="/dashboard/integrations">Connect QuickBooks or Xero</Link>
                              </Button>
                              <InlineAction asChild className="text-xs">
                                <Link href="/dashboard/guide">Read the guide</Link>
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
                        const validation = validations.get(item.id)
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
                            data-state={isActive ? "selected" : undefined}
                            className="ax-interactive cursor-pointer bg-white font-normal text-slate-900"
                          >
                            <td className="px-4 py-3.5" onClick={isReady ? event => event.stopPropagation() : undefined}>
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
                            <td className="max-w-[240px] px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="ax-data-entity truncate">{item.draft_data.vendor || "Supplier missing"}</span>
                                {hasDuplicate ? <span className="size-1.5 shrink-0 rounded-full bg-amber-500" title="Possible duplicate" /> : null}
                                {missing?.missing ? <span className="size-1.5 shrink-0 rounded-full bg-rose-500" title="Missing information" /> : null}
                              </div>
                            </td>
                            <td className="ax-data-reference px-4 py-3.5 font-mono">{ledgerValue(item.draft_data.invoice_number)}</td>
                            <td className="ax-data-date px-4 py-3.5">{shortDate(item.draft_data.invoice_date)}</td>
                            <td className="ax-data-due px-4 py-3.5">{shortDate(item.draft_data.due_date)}</td>
                            <td className="max-w-[200px] truncate px-4 py-3.5">{ledgerValue(item.draft_data.account_category)}</td>
                            <td className="max-w-[132px] truncate px-4 py-3.5">{ledgerValue(item.draft_data.tax_code)}</td>
                            <td className="px-4 py-3.5 font-mono">{ledgerValue(item.draft_data.currency)}</td>
                            <td className="ax-data-money px-4 py-3.5 text-right font-mono tabular-nums">{ledgerValue(item.draft_data.subtotal)}</td>
                            <td className="ax-data-money px-4 py-3.5 text-right font-mono tabular-nums">{ledgerValue(item.draft_data.tax_amount)}</td>
                            <td className="ax-data-money px-4 py-3.5 text-right font-mono tabular-nums">{ledgerValue(item.draft_data.total)}</td>
                            <td className="px-4 py-3.5">
                              <div className="flex flex-col items-start gap-1.5">
                                <AnimatePresence mode="popLayout" initial={false}>
                                  <motion.span
                                    key={item.status}
                                    initial={m.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={m.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                                    transition={m.tFast}
                                    className="inline-flex"
                                  >
                                    <StatusBadge tone={tone}>{statusLabel(item.status)}</StatusBadge>
                                  </motion.span>
                                </AnimatePresence>
                                {/* Pre-publish validation flag — quiet per-row read of
                                    balance + required fields. */}
                                {validation ? (
                                  validation.errors.length ? (
                                    <span title={validation.errors.map(issue => issue.label).join(" · ")}>
                                      <StatusBadge tone="error" className="h-5 px-2 text-[11px]">
                                        {validation.errors.length} issue{validation.errors.length === 1 ? "" : "s"}
                                      </StatusBadge>
                                    </span>
                                  ) : validation.warnings.length ? (
                                    <span title={validation.warnings.map(issue => issue.label).join(" · ")}>
                                      <StatusBadge tone="warning" className="h-5 px-2 text-[11px]">
                                        {validation.warnings.length} to check
                                      </StatusBadge>
                                    </span>
                                  ) : item.status === "ready_to_publish" ? (
                                    <StatusBadge tone="success" className="h-5 px-2 text-[11px]">
                                      Looks good
                                    </StatusBadge>
                                  ) : null
                                ) : null}
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </WorkspaceSection>

          {activeItem ? (
          <SpotlightCard className="rounded-md">
            <WorkspaceSection
              tone="active"
              symbol="code-map-to-account"
              title="Prepare draft bill"
              contentClassName="p-0"
            >
            <CardContent className="p-4 sm:p-5">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                    <div className="min-w-0">
                      <h2 className="ax-data-entity text-[19px] font-semibold tracking-tight">{draft.vendor || "Vendor missing"}</h2>
                      <p className="mt-1 break-all text-[13px] text-foreground">{activeItem.source_filename}</p>
                      {/* Approval gate — terse audit one-liners. */}
                      {activeItem.submitted_by_email ? (
                        <p className="mt-1 text-xs font-medium text-slate-950">Prepared by {activeItem.submitted_by_email}</p>
                      ) : null}
                      {activeItem.approved_by_email ? (
                        <p className="mt-0.5 text-xs font-medium text-slate-950">Approved by {activeItem.approved_by_email}</p>
                      ) : null}
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
                      {(() => {
                        // Pre-publish validation over the LIVE draft so the flag clears
                        // as the reviewer fixes the balance / fills required fields.
                        const live = validateBill({ ...activeItem, draft_data: draft }, { hasDuplicate: activeHasDuplicate })
                        if (live.errors.length) {
                          return (
                            <span title={live.errors.map(issue => issue.label).join(" · ")}>
                              <StatusBadge tone="error">
                                {live.errors.length} issue{live.errors.length === 1 ? "" : "s"}
                              </StatusBadge>
                            </span>
                          )
                        }
                        if (live.warnings.length) {
                          return (
                            <span title={live.warnings.map(issue => issue.label).join(" · ")}>
                              <StatusBadge tone="warning">
                                {live.warnings.length} to check
                              </StatusBadge>
                            </span>
                          )
                        }
                        return activeItem.status === "ready_to_publish"
                          ? <StatusBadge tone="success">Looks good</StatusBadge>
                          : null
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
                            tone="warning"
                            onClick={() => setDismissDraft({ warningId: warning.id, reason: "" })}
                            disabled={dismissing || discarding || activeLocked}
                          >
                            Dismiss…
                          </InlineAction>
                          <InlineAction
                            tone="danger"
                            onClick={requestDiscardActive}
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
                        <p className="text-xs font-medium uppercase tracking-wider text-[var(--workspace-primary)]">
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
                        tone="warning"
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
                            <button type="button" onClick={() => void matchPo(null)} className="ax-text-action font-medium text-[var(--workspace-danger)] underline-offset-2 hover:text-[var(--workspace-danger-hover)] hover:underline">
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

                  {/* Dimensional coding — Class + Location (QuickBooks) / Tracking
                      (Xero). Only render selects that actually have references. */}
                  {(isQuickBooks ? classes.length > 0 || locations.length > 0 : trackingGroups.length > 0) ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {isQuickBooks ? (
                        <>
                          {classes.length ? (
                            <div className="space-y-1.5">
                              <FieldLabel
                                htmlFor="ap-class-ref"
                                dirty={valuesDiffer(draft.class_ref_id, activeItem.draft_data.class_ref_id)}
                              >
                                <Symbol name="code-department" size="inline" className="size-5" alt="" />
                                Class
                              </FieldLabel>
                              <Select
                                value={String(draft.class_ref_id || "none")}
                                onValueChange={value => selectDimension("class_ref_id", value)}
                                disabled={activeLocked || !accountingConnection?.connected}
                              >
                                <SelectTrigger id="ap-class-ref" className={inlineFieldClass}>
                                  <SelectValue placeholder="No class" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No class</SelectItem>
                                  {classes.map(cls => (
                                    <SelectItem key={cls.external_id} value={cls.external_id}>{cls.display_name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : null}
                          {locations.length ? (
                            <div className="space-y-1.5">
                              <FieldLabel
                                htmlFor="ap-location-ref"
                                dirty={valuesDiffer(draft.location_ref_id, activeItem.draft_data.location_ref_id)}
                              >
                                <Symbol name="code-department" size="inline" className="size-5" alt="" />
                                Location
                              </FieldLabel>
                              <Select
                                value={String(draft.location_ref_id || "none")}
                                onValueChange={value => selectDimension("location_ref_id", value)}
                                disabled={activeLocked || !accountingConnection?.connected}
                              >
                                <SelectTrigger id="ap-location-ref" className={inlineFieldClass}>
                                  <SelectValue placeholder="No location" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No location</SelectItem>
                                  {locations.map(loc => (
                                    <SelectItem key={loc.external_id} value={loc.external_id}>{loc.display_name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : null}
                        </>
                      ) : (
                        trackingGroups.map(group => {
                          const groupOptionIds = group.options.map(option => option.external_id)
                          const selectedId = (draft.tracking_option_ref_ids || []).find(id => groupOptionIds.includes(id)) || "none"
                          return (
                            <div key={group.categoryId} className="space-y-1.5">
                              <FieldLabel
                                htmlFor={`ap-tracking-${group.categoryId}`}
                                dirty={valuesDiffer(selectedId === "none" ? "" : selectedId, (activeItem.draft_data.tracking_option_ref_ids || []).find(id => groupOptionIds.includes(id)) || "")}
                              >
                                <Symbol name="code-category-chip" size="inline" className="size-5" alt="" />
                                Tracking
                              </FieldLabel>
                              <Select
                                value={selectedId}
                                onValueChange={value => selectTrackingOption(groupOptionIds, value)}
                                disabled={activeLocked || !accountingConnection?.connected}
                              >
                                <SelectTrigger id={`ap-tracking-${group.categoryId}`} className={inlineFieldClass}>
                                  <SelectValue placeholder={group.categoryName} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No {group.categoryName.toLowerCase()}</SelectItem>
                                  {group.options.map(option => {
                                    const details = (option.details || {}) as { option_name?: string }
                                    return (
                                      <SelectItem key={option.external_id} value={option.external_id}>
                                        {details.option_name || option.display_name}
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          )
                        })
                      )}
                    </div>
                  ) : null}

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
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-950">Line items</p>
                        {/* Line-item splits — per-line coding overrides the header. */}
                        {showLineCoding ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            <Symbol name="code-double-entry" size="inline" className="size-4" alt="" />
                            Split
                          </span>
                        ) : null}
                      </div>
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
                              {showLineCoding ? (
                                <>
                                  <th className="w-[150px] whitespace-nowrap border-b border-slate-200 px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-slate-500">Account</th>
                                  <th className="w-[120px] whitespace-nowrap border-b border-slate-200 px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-slate-500">Tax</th>
                                  {isQuickBooks && classes.length ? (
                                    <th className="w-[120px] whitespace-nowrap border-b border-slate-200 px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-slate-500">Class</th>
                                  ) : null}
                                  {!isQuickBooks && trackingGroups.length ? (
                                    <th className="w-[120px] whitespace-nowrap border-b border-slate-200 px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-slate-500">Tracking</th>
                                  ) : null}
                                </>
                              ) : null}
                              {!activeLocked ? <th className="w-14 border-b border-slate-200 px-2 py-2" /> : null}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {lineItems.map((line, rowIndex) => {
                              const lineTracking = Array.isArray(line.tracking_option_ref_ids) ? (line.tracking_option_ref_ids as string[]) : []
                              return (
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
                                {showLineCoding ? (
                                  <>
                                    <td className="p-1.5">
                                      <Select
                                        value={String(line.account_ref_id || "none")}
                                        onValueChange={value => updateLineCoding(rowIndex, "account_ref_id", value)}
                                        disabled={activeLocked}
                                      >
                                        <SelectTrigger className="h-8 min-w-[140px] rounded-sm text-xs">
                                          <SelectValue placeholder="Header" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="none">Header</SelectItem>
                                          {accounts.map(account => (
                                            <SelectItem key={account.external_id} value={account.external_id}>{account.display_name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </td>
                                    <td className="p-1.5">
                                      <Select
                                        value={String(line.tax_code_ref_id || "none")}
                                        onValueChange={value => updateLineCoding(rowIndex, "tax_code_ref_id", value)}
                                        disabled={activeLocked}
                                      >
                                        <SelectTrigger className="h-8 min-w-[110px] rounded-sm text-xs">
                                          <SelectValue placeholder="Header" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="none">Header</SelectItem>
                                          {taxCodes.map(taxCode => (
                                            <SelectItem key={taxCode.external_id} value={taxCode.external_id}>{taxCode.display_name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </td>
                                    {isQuickBooks && classes.length ? (
                                      <td className="p-1.5">
                                        <Select
                                          value={String(line.class_ref_id || "none")}
                                          onValueChange={value => updateLineCoding(rowIndex, "class_ref_id", value)}
                                          disabled={activeLocked}
                                        >
                                          <SelectTrigger className="h-8 min-w-[110px] rounded-sm text-xs">
                                            <SelectValue placeholder="Header" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="none">Header</SelectItem>
                                            {classes.map(cls => (
                                              <SelectItem key={cls.external_id} value={cls.external_id}>{cls.display_name}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </td>
                                    ) : null}
                                    {!isQuickBooks && trackingGroups.length ? (
                                      <td className="p-1.5">
                                        {trackingGroups.map(group => {
                                          const groupOptionIds = group.options.map(option => option.external_id)
                                          const selectedId = lineTracking.find(id => groupOptionIds.includes(id)) || "none"
                                          return (
                                            <Select
                                              key={group.categoryId}
                                              value={selectedId}
                                              onValueChange={value => updateLineTracking(rowIndex, groupOptionIds, value)}
                                              disabled={activeLocked}
                                            >
                                              <SelectTrigger className="mb-1 h-8 min-w-[110px] rounded-sm text-xs last:mb-0">
                                                <SelectValue placeholder={group.categoryName} />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="none">Header</SelectItem>
                                                {group.options.map(option => {
                                                  const details = (option.details || {}) as { option_name?: string }
                                                  return (
                                                    <SelectItem key={option.external_id} value={option.external_id}>
                                                      {details.option_name || option.display_name}
                                                    </SelectItem>
                                                  )
                                                })}
                                              </SelectContent>
                                            </Select>
                                          )
                                        })}
                                      </td>
                                    ) : null}
                                  </>
                                ) : null}
                                {!activeLocked ? (
                                  <td className="p-1.5">
                                    <InlineAction tone="danger" onClick={() => removeLineItem(rowIndex)} className="text-xs">
                                      Remove
                                    </InlineAction>
                                  </td>
                                ) : null}
                              </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="rounded-md border border-dashed border-border p-3 text-sm text-foreground">No line items detected.</p>
                    )}
                  </div>

                  {/* Approval gate — awaiting-approval state. */}
                  {activeItem.status === "pending_approval" ? (
                    <div className="flex items-center gap-4 py-1">
                      <Symbol name="approved-stamp" size="medium" className="h-24 w-24 sm:h-28 sm:w-28" alt="" />
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-2.5 py-0.5 text-xs font-medium text-violet-700">
                          <Symbol name="code-period-close" size="inline" className="size-4" alt="" />
                          Awaiting approval
                        </span>
                        {activeItem.submitted_by_email ? (
                          <p className="text-xs font-medium text-slate-950">Prepared by {activeItem.submitted_by_email}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {activeItem.status === "ready_to_publish" && !activeLocked ? (
                    <div className="flex items-center gap-4 py-1">
                      <Symbol name="success-bill-ready" size="medium" className="h-28 w-28 sm:h-32 sm:w-32" alt="" />
                      <div className="space-y-1">
                        <p className="text-base font-medium text-slate-950">Coded and ready</p>
                        <p className="max-w-sm text-sm leading-relaxed text-foreground/70">
                          Every field is filled in. Publish it to {destinationName} as a draft bill, or send it back for another look.
                        </p>
                        {activeItem.approved_by_email ? (
                          <p className="text-xs font-medium text-slate-950">Approved by {activeItem.approved_by_email}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="sticky bottom-0 z-10 -mx-4 -mb-4 flex flex-wrap justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:relative sm:bottom-auto sm:mx-0 sm:mb-0 sm:bg-transparent sm:px-0 sm:py-4 sm:backdrop-blur-0 sm:supports-[backdrop-filter]:bg-transparent">
                    {!activeLocked ? (
                      <>
                        {activeItem.status === "pending_approval" ? (
                          // Approval gate — approver acts; preparer just waits.
                          isApprover ? (
                            <>
                              <MotionButton
                                variant="surface"
                                onClick={() => void returnActive()}
                                disabled={saving}
                                className="h-9"
                              >
                                Return
                              </MotionButton>
                              <MotionButton
                                variant="glossy"
                                onClick={() => void approveActive()}
                                disabled={saving}
                                className="h-9"
                              >
                                <Symbol name="approved-stamp" size="inline" className="mr-1 size-4" alt="" />
                                Approve
                              </MotionButton>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-950">
                              <Symbol name="code-period-close" size="inline" className="size-4" alt="" />
                              Awaiting approval
                            </span>
                          )
                        ) : (
                          <>
                            <MotionButton variant="surface" onClick={() => void persistDraft()} disabled={saving} className="h-9">
                              Save changes
                            </MotionButton>
                            {activeItem.status === "ready_to_publish" ? (
                              <>
                                <InlineAction onClick={() => void persistDraft("needs_coding")} disabled={saving} className="px-2">
                                  Return to coding
                                </InlineAction>
                                {isApprover ? (
                                  <MotionButton
                                    ref={activePublishRef}
                                    variant="glossy"
                                    onClick={requestPublishActive}
                                    disabled={saving || !accountingConnection?.connected || activeHasDuplicate}
                                    title={activeHasDuplicate ? "Resolve duplicate warnings before publishing" : undefined}
                                    className="h-9"
                                  >
                                    Publish to {destinationName}
                                  </MotionButton>
                                ) : null}
                              </>
                            ) : isApprover ? (
                              // Owner can approve their own coding straight through.
                              <Button
                                variant="reviewed"
                                onClick={() => void persistDraft("ready_to_publish")}
                                disabled={saving || activeHasDuplicate}
                                title={activeHasDuplicate ? "Resolve duplicate warnings before marking ready" : undefined}
                                className="h-9"
                              >
                                Mark ready to publish
                              </Button>
                            ) : (
                              // Reviewer (preparer) submits into the approval gate.
                              <MotionButton
                                variant="glossy"
                                onClick={requestSubmitActive}
                                disabled={saving || activeHasDuplicate}
                                title={activeHasDuplicate ? "Resolve duplicate warnings before submitting" : undefined}
                                className="h-9"
                              >
                                Submit
                              </MotionButton>
                            )}
                          </>
                        )}
                      </>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {canRetryAttachment ? (
                        <Button variant="surface" onClick={requestPublishActive} disabled={saving || !accountingConnection?.connected} className="h-9">
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
              <AccountingDestinationGlyph destination={accountingDestination} className="size-6" iconClassName="size-4" />
              {publishResult ? "Publish complete" : `Publish ${cleanSelectedIds.length} ${cleanSelectedIds.length === 1 ? "bill" : "bills"} to ${destinationName}`}
            </DialogTitle>
            <DialogDescription className="text-sm font-normal leading-6 text-foreground">
              {publishResult
                ? "The bulk publish finished. Failed items remain in the queue and can be retried."
                : blockedSelected.length > 0
                  ? `${cleanSelectedIds.length} draft ${cleanSelectedIds.length === 1 ? "bill" : "bills"} will publish to ${destinationName}. ${blockedSelected.length} ${blockedSelected.length === 1 ? "is" : "are"} held back to fix first. This cannot be undone.`
                  : `You are publishing ${cleanSelectedIds.length} draft ${cleanSelectedIds.length === 1 ? "bill" : "bills"} to ${destinationName}. This cannot be undone.`}
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
            <div className="space-y-3">
              <div className="rounded-md border border-border">
                <p className={cn("border-b px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500", workspacePanel)}>
                  Will publish ({cleanSelectedIds.length})
                </p>
                {cleanSelectedIds.length ? (
                  <ul className="max-h-[220px] divide-y divide-border overflow-y-auto">
                    {cleanSelectedIds.map((id) => {
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
                ) : (
                  <p className="px-3 py-3 text-sm font-medium text-foreground">
                    Nothing is ready yet — fix the held-back bills below.
                  </p>
                )}
              </div>
              {/* Pre-publish gate — broken bills listed with their reason and held back. */}
              {blockedSelected.length > 0 ? (
                <div className="rounded-md border border-[color-mix(in_srgb,var(--text-danger)_30%,transparent)]">
                  <div className={cn("flex flex-wrap items-center gap-2 border-b px-3 py-2", workspacePanel)}>
                    <StatusBadge tone="error">Held back ({blockedSelected.length})</StatusBadge>
                    <span className="text-xs font-medium text-[var(--text-danger)]">{prePublishSummary}</span>
                  </div>
                  <ul className="max-h-[180px] divide-y divide-border overflow-y-auto">
                    {blockedSelected.map((entry) => (
                      <li key={entry.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                        <span className="min-w-0 truncate font-medium text-foreground">{entry.vendor}</span>
                        <span className="shrink-0 text-xs font-medium text-[var(--text-danger)]">
                          {entry.validation.errors.map(issue => issue.label).join(" · ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
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
                  disabled={publishing || !accountingConnection?.connected || !cleanSelectedIds.length || selectedDuplicateCount > 0}
                  title={selectedDuplicateCount > 0 ? "Resolve duplicate warnings before publishing" : !cleanSelectedIds.length ? "Fix the held-back bills first" : undefined}
                  className="h-9 px-4"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <AccountingDestinationGlyph destination={accountingDestination} />
                      Publish {cleanSelectedIds.length} {cleanSelectedIds.length === 1 ? "bill" : "bills"}
                    </>
                  )}
                </MotionButton>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pendingConfirmationDetails)}
        onOpenChange={(open) => {
          if (!open && !pendingConfirmationBusy) setPendingConfirmationAction(null)
        }}
      >
        {pendingConfirmationDetails ? (
          <DialogContent className="gap-5 rounded-md sm:max-w-md" showCloseButton={!pendingConfirmationBusy}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5 text-base font-medium">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-white text-slate-950">
                  {pendingConfirmationDetails.icon}
                </span>
                {pendingConfirmationDetails.title}
              </DialogTitle>
              <DialogDescription className="text-sm font-normal leading-6 text-foreground">
                {pendingConfirmationDetails.description}
              </DialogDescription>
            </DialogHeader>

            {activeItem ? (
              <div className={cn("flex items-center justify-between gap-3 rounded-md border px-3 py-2.5", workspacePanel)}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-950">{activeItem.draft_data.vendor || "Supplier missing"}</p>
                  <p className="mt-0.5 truncate text-xs font-medium text-foreground/70">{activeItem.source_filename}</p>
                </div>
                <span className="shrink-0 font-mono text-xs tabular-nums text-foreground">
                  {amountLabel(activeItem)}
                </span>
              </div>
            ) : null}

            <DialogFooter>
              <InlineAction
                onClick={() => setPendingConfirmationAction(null)}
                disabled={pendingConfirmationBusy}
                className="px-2"
              >
                Cancel
              </InlineAction>
              <MotionButton
                variant={pendingConfirmationDetails.actionVariant}
                onClick={() => void confirmPendingAction()}
                disabled={pendingConfirmationBusy}
                className="h-9 px-4"
              >
                {pendingConfirmationBusy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Working...
                  </>
                ) : (
                  pendingConfirmationDetails.actionLabel
                )}
              </MotionButton>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>

      {/* P9 — Match PO dialog */}
      <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
        <DialogContent className="gap-4 rounded-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-medium">
              <span className="inline-flex size-6 items-center justify-center rounded-md bg-[var(--workspace-blue-soft)] text-[var(--workspace-blue)]">
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
              <Loader2 className="mr-2 size-4 animate-spin" /> Retrieving open purchase orders…
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
                        : "border-slate-200 hover:border-[var(--workspace-primary)] hover:bg-[var(--workspace-blue-soft)]/60",
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

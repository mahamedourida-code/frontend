"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, FileText, Loader2 } from "lucide-react"
import Image from "next/image"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { AnomalyChip, AnomalyDot } from "@/components/dashboard/AnomalyChip"
import { ReviewScoreBadge } from "@/components/dashboard/ReviewScoreBadge"
import { duplicateCopy, missingVatCopy, overPoCopy } from "@/lib/anomaly-reasons"
import { computeReviewScore, REVIEW_LEVEL_WEIGHT } from "@/lib/review-score"
import { Button } from "@/components/ui/button"
import { MotionButton } from "@/components/ui/motion-button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { PublishSuccessBurst } from "@/components/dashboard/PublishSuccessBurst"
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
  type PurchaseOrder,
  type QuickBooksConnectionStatus,
  type QuickBooksReferenceItem,
} from "@/lib/api-client"
import { cn } from "@/lib/utils"

type QueueFilter = "all" | "duplicates" | AccountsPayableStatus

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

const dotColor: Record<"warning" | "review" | "info" | "success" | "error" | "neutral", string> = {
  warning: "bg-amber-400",
  review: "bg-violet-400",
  info: "bg-sky-400",
  success: "bg-emerald-500",
  error: "bg-rose-500",
  neutral: "bg-muted-foreground/50",
}

const editableFields: Array<[keyof AccountsPayableDraftData, string, string]> = [
  ["invoice_date", "Invoice date", "YYYY-MM-DD"],
  ["due_date", "Due date", "YYYY-MM-DD"],
  ["reference", "Reference", "PO or bill reference"],
  ["currency", "Currency", "USD"],
]

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

function cloneDraft(item: AccountsPayableItem): AccountsPayableDraftData {
  return {
    ...item.draft_data,
    line_items: (item.draft_data.line_items || []).map(line => ({ ...line })),
  }
}

function AccountsPayableFallback() {
  return <DashboardRouteLoader label="Loading Accounts Payable" />
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
  const [filter, setFilter] = useState<QueueFilter>("all")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AccountsPayableDraftData>({})
  const [attachmentVisible, setAttachmentVisible] = useState(true)
  const [nextStatus, setNextStatus] = useState<AccountsPayableStatus>("needs_coding")
  const [selectedReadyIds, setSelectedReadyIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [quickBooksConnection, setQuickBooksConnection] = useState<QuickBooksConnectionStatus | null>(null)
  const [quickBooksReferences, setQuickBooksReferences] = useState<QuickBooksReferenceItem[]>([])
  const [destination, setDestination] = useState<AccountingDestination>("quickbooks")
  const [poDialogOpen, setPoDialogOpen] = useState(false)
  const [poList, setPoList] = useState<PurchaseOrder[]>([])
  const [poLoading, setPoLoading] = useState(false)
  const [poImportOpen, setPoImportOpen] = useState(false)
  const [poCsv, setPoCsv] = useState("")
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
  const publishTriggerRef = useRef<HTMLButtonElement | null>(null)
  const confirmPublishRef = useRef<HTMLButtonElement | null>(null)
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
        : response.items[0]?.id || null)
    } catch {
      toast.error("Could not load Accounts Payable.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) void loadQueue()
  }, [user?.id])

  const loadQuickBooks = async (sync = false, dest: AccountingDestination = destination) => {
    const connector = dest === "xero" ? xeroApi : quickBooksApi
    try {
      setSyncingReferences(sync)
      const status = sync ? await connector.sync() : await connector.status()
      setQuickBooksConnection(status)
      if (status.connected) {
        const response = await connector.references()
        setQuickBooksReferences(response.items)
      } else {
        setQuickBooksReferences([])
      }
    } catch {
      if (sync) toast.error(`Could not refresh ${dest === "xero" ? "Xero" : "QuickBooks"} lists.`)
    } finally {
      setSyncingReferences(false)
    }
  }

  useEffect(() => {
    if (!user) return
    void accountingDestinationApi.get()
      .then((dest) => {
        setDestination(dest)
        void loadQuickBooks(false, dest)
      })
      .catch(() => void loadQuickBooks(false, "quickbooks"))
  }, [user?.id])

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

  const importPos = async () => {
    if (!poCsv.trim()) return
    setPoBusy(true)
    try {
      const result = await accountsPayableApi.importPurchaseOrders(poCsv)
      toast.success(`Imported ${result.imported} purchase order${result.imported === 1 ? "" : "s"}.`)
      setPoCsv("")
      setPoImportOpen(false)
      if (poDialogOpen) await openPoDialog()
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not import purchase orders.")
    } finally {
      setPoBusy(false)
    }
  }

  const activeItem = items.find(item => item.id === activeId) || null

  useEffect(() => {
    if (!activeItem) return
    setDraft(cloneDraft(activeItem))
    setAttachmentVisible(activeItem.attachment_visible)
    setNextStatus(activeItem.status)
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
    if (filter === "all") {
      base = items.filter(item => item.status !== "discarded")
    } else if (filter === "duplicates") {
      base = items.filter(item => hasActiveDuplicate(item))
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
  }, [items, filter, clientJobIds, reviewScores])
  const lineItems = Array.isArray(draft.line_items) ? draft.line_items : []
  const lineColumns = (
    Array.from(new Set(lineItems.flatMap(line => Object.keys(line)))).slice(0, 6).length
      ? Array.from(new Set(lineItems.flatMap(line => Object.keys(line)))).slice(0, 6)
      : ["description", "quantity", "unit_price", "line_total"]
  )
  const activeLocked = activeItem?.status === "published"
  const vendors = quickBooksReferences.filter(item => item.resource_type === "vendor" && item.active)
  const accounts = quickBooksReferences.filter(item => item.resource_type === "account" && item.active)
  const taxCodes = quickBooksReferences.filter(item => item.resource_type === "tax_code" && item.active)

  // P8 — destination-aware copy so the coding form reads correctly for Xero.
  const isXero = destination === "xero"
  const destName = isXero ? "Xero" : "QuickBooks"
  const labels = {
    vendor: isXero ? "Xero contact" : "QuickBooks vendor",
    vendorPlaceholder: isXero ? "Select contact" : "Select vendor",
    vendorRefresh: isXero ? "Refresh contact list" : "Refresh vendor list",
    account: isXero ? "Account" : "Expense account",
    taxCode: isXero ? "Tax rate" : "Tax code",
    publish: isXero ? "Publish to Xero" : "Publish to QuickBooks",
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
    return {
      ruleId: typeof block.rule_id === "string" ? block.rule_id : null,
      ruleName: typeof block.rule_name === "string" ? block.rule_name : "Saved vendor",
      mode: (block.mode === "auto_ready" ? "auto_ready" : "auto_fill") as "auto_fill" | "auto_ready",
      appliedFields: fields,
    }
  })()

  const mergeItem = (item: AccountsPayableItem) => {
    setItems(current => current.map(existing => existing.id === item.id ? item : existing))
    if (item.status !== "ready_to_publish") {
      setSelectedReadyIds(current => current.filter(id => id !== item.id))
    }
  }

  const updateDraftField = (field: keyof AccountsPayableDraftData, value: string) => {
    setDraft(current => ({ ...current, [field]: value }))
  }

  const selectQuickBooksReference = (
    idField: "vendor_ref_id" | "account_ref_id" | "tax_code_ref_id",
    labelField: "vendor" | "account_category" | "tax_code",
    value: string,
    references: QuickBooksReferenceItem[],
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
        draft_data: {
          vendor: draft.vendor,
          vendor_ref_id: draft.vendor_ref_id,
          invoice_date: draft.invoice_date,
          due_date: draft.due_date,
          account_category: draft.account_category,
          account_ref_id: draft.account_ref_id,
          tax_code: draft.tax_code,
          tax_code_ref_id: draft.tax_code_ref_id,
          reference: draft.reference,
          currency: draft.currency,
          line_items: draft.line_items,
        },
        attachment_visible: attachmentVisible,
        status,
      })
      mergeItem(response.item)
      setNextStatus(response.item.status)
      toast.success(status ? "AP status updated." : "Draft bill saved.")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not save this draft bill.")
    } finally {
      setSaving(false)
    }
  }

  const applySelectedStatus = async () => {
    if (!activeItem || nextStatus === activeItem.status) return
    await persistDraft(nextStatus)
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
        draft_data: {
          vendor: clearedDraft.vendor,
          vendor_ref_id: clearedDraft.vendor_ref_id,
          invoice_date: clearedDraft.invoice_date,
          due_date: clearedDraft.due_date,
          account_category: clearedDraft.account_category,
          account_ref_id: clearedDraft.account_ref_id,
          tax_code: clearedDraft.tax_code,
          tax_code_ref_id: clearedDraft.tax_code_ref_id,
          reference: clearedDraft.reference,
          currency: clearedDraft.currency,
          line_items: clearedDraft.line_items,
        },
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
        toast.success(`${response.items.length} unpaid Bill${response.items.length === 1 ? "" : "s"} created in QuickBooks.`)
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
    const retryAttachment = activeItem.status === "published" && activeItem.quickbooks_publication?.attachment_status === "failed"
    if (retryAttachment) {
      if (!window.confirm("Retry attaching the source document to the existing QuickBooks Bill?")) return
    } else if (!window.confirm("Create one unpaid Bill in QuickBooks from this reviewed invoice?")) {
      return
    }
    setSaving(true)
    try {
      if (!retryAttachment) {
        await accountsPayableApi.update(activeItem.id, {
          draft_data: {
            vendor: draft.vendor,
            vendor_ref_id: draft.vendor_ref_id,
            invoice_date: draft.invoice_date,
            due_date: draft.due_date,
            account_category: draft.account_category,
            account_ref_id: draft.account_ref_id,
            tax_code: draft.tax_code,
            tax_code_ref_id: draft.tax_code_ref_id,
            reference: draft.reference,
            currency: draft.currency,
            line_items: draft.line_items,
          },
          attachment_visible: attachmentVisible,
        })
      }
      const response = await accountsPayableApi.publish(activeItem.id)
      mergeItem(response.item)
      toast.success(retryAttachment ? "Source document attached in QuickBooks." : "Unpaid Bill created in QuickBooks.")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not publish this Bill.")
      await loadQueue()
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) return <DashboardRouteLoader label="Loading Accounts Payable" />

  return (
    <DashboardShell activeItem="accounts_payable" title="Accounts Payable" user={user} contentClassName="max-w-none px-3 py-4 sm:px-5 lg:px-6">
      <div className="space-y-4">
        <PageHeader
          title="Accounts Payable"
          description="Reviewed invoices, drafted as QuickBooks Bills. AxLiner prepares it. You approve it."
          actions={selectedReadyIds.length ? (
            <MotionButton ref={publishTriggerRef} variant="glossy" onClick={openPublishDialog} disabled={saving || !quickBooksConnection?.connected} className="h-9 px-4">
              <Image src="/icons/qb-badge.png" alt="" width={16} height={16} className="mr-1 object-contain" />
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

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm">
          <div>
            <p className="font-medium text-foreground">
              {destName} {quickBooksConnection?.connected ? `connected${quickBooksConnection.company_name ? ` to ${quickBooksConnection.company_name}` : ""}` : "not connected"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isXero
                ? "Select synced contacts and accounts before publishing a draft Bill to Xero."
                : "Select synced vendors and expense accounts before publishing an unpaid Bill."}
            </p>
          </div>
          <div className="flex gap-2">
            {quickBooksConnection?.connected ? (
              <Button variant="surface" size="sm" onClick={() => void loadQuickBooks(true)} disabled={syncingReferences}>
                <img src="/site-icons/io/database.svg" className="h-4 w-4" alt="" />
                {syncingReferences ? "Refreshing..." : "Refresh lists"}
              </Button>
            ) : (
              <Button variant="glossy" size="sm" onClick={() => router.push("/dashboard/integrations")}>
                Connect QuickBooks
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(560px,1.2fr)]">
          <Card className="flex max-h-[40vh] xl:max-h-[700px] flex-col overflow-hidden rounded-md border-border shadow-xs">
            {/* Filter pills */}
            <div className="shrink-0 border-b border-border bg-card px-3 py-2.5">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={cn(
                    "ax-interactive inline-flex h-7 items-center gap-1 rounded-full px-3 text-xs font-medium",
                    filter === "all"
                      ? "bg-foreground text-background"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  All
                  <span className="tabular-nums opacity-70">{items.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("duplicates")}
                  className={cn(
                    "ax-interactive inline-flex h-7 items-center gap-1 rounded-full px-3 text-xs font-medium",
                    filter === "duplicates"
                      ? "bg-amber-500 text-white"
                      : duplicateCount > 0
                        ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Duplicates
                  <span className="tabular-nums opacity-80">{duplicateCount}</span>
                </button>
                {[
                  { value: "needs_coding" as const, label: "Needs coding" },
                  { value: "needs_review" as const, label: "Needs review" },
                  { value: "ready_to_publish" as const, label: "Ready" },
                  { value: "published" as const, label: "Published" },
                  { value: "failed" as const, label: "Failed" },
                  { value: "discarded" as const, label: "Discarded" },
                ].map(pill => (
                  <button
                    key={pill.value}
                    type="button"
                    onClick={() => setFilter(pill.value)}
                    className={cn(
                      "ax-interactive inline-flex h-7 items-center gap-1 rounded-full px-3 text-xs font-medium",
                      filter === pill.value
                        ? "bg-foreground text-background"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {pill.label}
                    <span className="tabular-nums opacity-70">{counts[pill.value]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Column header */}
            <div className="shrink-0 border-b border-border bg-card/95">
              <div className="flex items-center gap-3 px-4 py-2">
                <span className="size-4 shrink-0" />
                <span className="flex-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Vendor</span>
                <span className="w-[72px] shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</span>
                <span className="w-[68px] shrink-0 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</span>
                <span className="hidden w-[78px] shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:block">PO</span>
                <span className="w-[84px] shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">Review</span>
                <span className="w-[72px] shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</span>
              </div>
            </div>

            {/* Scrollable rows */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div role="status" aria-label="Loading queue">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`ap-skeleton-${index}`}
                      className="relative flex h-14 w-full items-center gap-3 border-b border-border/50 px-4 last:border-b-0"
                    >
                      <span className="size-4 shrink-0" />
                      <Skeleton className="h-3.5 flex-1 max-w-[180px]" />
                      <Skeleton className="h-3 w-[60px] shrink-0" />
                      <Skeleton className="h-3 w-[52px] shrink-0" />
                      <Skeleton className="h-5 w-[64px] shrink-0 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : visibleItems.length === 0 ? (
                <EmptyState
                  illustration="/illustrations/workspace-v2/empty-history.png"
                  illustrationSize={120}
                  icon={<ChevronLeft />}
                  title="No invoices in this queue"
                  description="Mark a reviewed invoice Ready, then add it from Convert Files."
                  compact
                />
              ) : (
                <AnimatePresence initial={false}>
                  {visibleItems.map(item => {
                    const tone = statusTone[item.status]
                    const isActive = activeId === item.id
                    const isReady = item.status === "ready_to_publish"
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -12, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: "auto" }}
                        exit={{ opacity: 0, x: -10, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveId(item.id)}
                        onKeyDown={event => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            setActiveId(item.id)
                          }
                        }}
                        className={cn(
                          "ax-interactive relative flex h-14 w-full items-center gap-3 border-b border-border/50 px-4 text-left last:border-b-0",
                          !isActive && "hover:bg-accent/30",
                        )}
                      >
                        {/* Sliding highlight — glides between rows like Linear */}
                        {isActive && (
                          <motion.div
                            layoutId="ap-row-highlight"
                            className="absolute inset-0 -z-10 bg-accent/50"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}

                        {/* Left accent bar (kept; sits above the sliding highlight) */}
                        <div className={cn(
                          "absolute inset-y-0 left-0 w-[3px] transition-colors duration-150",
                          isActive ? "bg-primary" : "bg-transparent"
                        )} />

                        {/* Status dot or checkbox for ready items */}
                        <span
                          className="size-4 shrink-0 flex items-center justify-center"
                          onClick={isReady ? (e) => e.stopPropagation() : undefined}
                        >
                          {isReady ? (
                            <Checkbox
                              checked={selectedReadyIds.includes(item.id)}
                              onCheckedChange={checked => toggleSelection(item.id, checked === true)}
                              aria-label={`Select ${item.source_filename}`}
                            />
                          ) : (
                            <span className={cn("block size-2 rounded-full", dotColor[tone])} />
                          )}
                        </span>

                        {/* P4 / C7 — active duplicate flag on the row, with its "why" */}
                        {hasActiveDuplicate(item) ? (() => {
                          const warning = (item.duplicate_warnings || []).find(w => !w.dismissed)!
                          const copy = duplicateCopy(warning)
                          return (
                            <AnomalyDot
                              tone={copy.tone}
                              title={copy.title}
                              reason={copy.reason}
                              ariaLabel="Possible duplicate"
                              size={6}
                            />
                          )
                        })() : null}

                        {/* Vendor name */}
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                          {item.draft_data.vendor || "Vendor missing"}
                        </span>

                        {/* Invoice date */}
                        <span className="w-[72px] shrink-0 text-xs text-muted-foreground">
                          {item.draft_data.invoice_date ? String(item.draft_data.invoice_date).slice(0, 10) : "—"}
                        </span>

                        {/* Amount */}
                        <span className="w-[68px] shrink-0 text-right text-xs font-mono tabular-nums text-foreground">
                          {amountLabel(item)}
                        </span>

                        {/* P9 — PO match status */}
                        <span className="hidden w-[88px] shrink-0 sm:block">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold",
                              item.po_match_status === "exceeds"
                                ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
                                : item.po_match_status === "matched"
                                  ? "border-emerald-700/30 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
                                  : "border-border bg-muted/50 text-muted-foreground",
                            )}
                          >
                            {item.po_match_status !== "unmatched" ? (
                              <span className={cn("size-1.5 rounded-full", item.po_match_status === "exceeds" ? "bg-amber-500" : "bg-emerald-600")} />
                            ) : null}
                            {item.po_match_status === "exceeds" ? "Exceeds" : item.po_match_status === "matched" ? "Matched" : "Unmatched"}
                          </span>
                        </span>

                        {/* C1 — composite Review Score + "why this needs review" */}
                        <span
                          className="w-[84px] shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ReviewScoreBadge score={reviewScores.get(item.id) ?? computeReviewScore(item)} />
                        </span>

                        {/* Status badge */}
                        <span className="w-[72px] shrink-0">
                          <StatusBadge tone={tone}>{statusLabel(item.status)}</StatusBadge>
                        </span>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>
          </Card>

          <SpotlightCard className="rounded-md">
            <Card className="rounded-md border-border shadow-xs">
            <CardContent className="p-5">
              {!activeItem ? (
                <EmptyState
                  icon={<ChevronLeft />}
                  illustration="/illustrations/workspace-v2/select-invoice.png"
                  illustrationSize={160}
                  title="Select an invoice"
                  description="Pick an item from the queue to start coding"
                />
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">{draft.vendor || "Vendor missing"}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">{activeItem.source_filename}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeItem.source_access_url ? (
                        <Button asChild variant="surface" size="sm" className="h-8">
                          <a href={activeItem.source_access_url} target="_blank" rel="noreferrer">View attachment</a>
                        </Button>
                      ) : null}
                      <ReviewScoreBadge
                        score={reviewScores.get(activeItem.id) ?? computeReviewScore(activeItem)}
                        side="bottom"
                      />
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
                              variant="glossy"
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
                    <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border-2 border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          {autoAppliedRule.mode === "auto_ready" ? "Pre-filled & moved to Ready for your approval" : "Pre-filled by vendor rule"}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                          {autoAppliedRule.ruleName}
                        </p>
                        {autoAppliedRule.appliedFields.length ? (
                          <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-100/80">
                            Applied {autoAppliedRule.appliedFields.length} field{autoAppliedRule.appliedFields.length === 1 ? "" : "s"}: {autoAppliedRule.appliedFields.map((field) => field.replaceAll("_", " ")).join(", ")}
                          </p>
                        ) : null}
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
                          {labels.vendor}
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
                        onValueChange={value => selectQuickBooksReference("vendor_ref_id", "vendor", value, vendors)}
                        disabled={activeLocked || !quickBooksConnection?.connected}
                      >
                        <SelectTrigger id="ap-vendor-ref" className={inlineFieldClass}>
                          <SelectValue placeholder={vendors.length ? labels.vendorPlaceholder : labels.vendorRefresh} />
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
                        onValueChange={value => selectQuickBooksReference("account_ref_id", "account_category", value, accounts)}
                        disabled={activeLocked || !quickBooksConnection?.connected}
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
                        onValueChange={value => selectQuickBooksReference("tax_code_ref_id", "tax_code", value, taxCodes)}
                        disabled={activeLocked || !quickBooksConnection?.connected}
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
                    {editableFields.map(([field, label, placeholder]) => (
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

                  <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm text-foreground">
                    <Checkbox
                      checked={attachmentVisible}
                      disabled={activeLocked}
                      onCheckedChange={checked => setAttachmentVisible(checked === true)}
                    />
                    Attach source document to QuickBooks Bill
                  </label>

                  {activeItem.quickbooks_publication ? (
                    <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
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

                  <div className="sticky bottom-0 z-10 -mx-5 -mb-5 flex flex-col gap-3 border-t border-border bg-background/95 px-5 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:relative sm:bottom-auto sm:mx-0 sm:mb-0 sm:flex-row sm:items-end sm:justify-between sm:bg-transparent sm:px-0 sm:py-4 sm:backdrop-blur-0 sm:supports-[backdrop-filter]:bg-transparent">
                    <div className="w-full max-w-[230px] space-y-1.5">
                      <FieldLabel htmlFor="ap-next-status">Status</FieldLabel>
                      {activeLocked ? (
                        <div className="flex h-9 items-center rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground">
                          Published in {destName}
                        </div>
                      ) : (
                        <Select value={nextStatus} onValueChange={value => setNextStatus(value as AccountsPayableStatus)}>
                          <SelectTrigger id="ap-next-status" className={inlineFieldClass}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {queueStatuses.filter(status => status.value !== "published").map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!activeLocked ? (
                        <>
                          <MotionButton variant="glossy" onClick={() => void persistDraft()} disabled={saving} className="h-9">
                            Save draft
                          </MotionButton>
                          <Button variant="reviewed" onClick={() => void applySelectedStatus()} disabled={saving || nextStatus === activeItem.status} className="h-9">
                            Apply status
                          </Button>
                          {activeItem.status === "ready_to_publish" ? (
                            <MotionButton variant="glossy" onClick={() => void publishActive()} disabled={saving || !quickBooksConnection?.connected} className="h-9">
                              {labels.publish}
                            </MotionButton>
                          ) : null}
                        </>
                      ) : null}
                      {activeItem.status === "published" && activeItem.quickbooks_publication?.attachment_status === "failed" ? (
                        <Button variant="surface" onClick={() => void publishActive()} disabled={saving || !quickBooksConnection?.connected} className="h-9">
                          Retry attachment
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </SpotlightCard>
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
              <Image src="/icons/qb-badge.png" alt="" width={20} height={20} className="object-contain" />
              {publishResult ? "Publish complete" : `Publish ${selectedReadyIds.length} ${selectedReadyIds.length === 1 ? "bill" : "bills"} to QuickBooks`}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              {publishResult
                ? "The bulk publish finished. Failed items remain in the queue and can be retried."
                : `You are publishing ${selectedReadyIds.length} draft ${selectedReadyIds.length === 1 ? "bill" : "bills"} to QuickBooks Online. This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>

          {publishResult ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-sm">
                <StatusBadge tone="success">{publishResult.succeeded} published</StatusBadge>
                {publishResult.failed.length > 0 ? (
                  <StatusBadge tone="error">{publishResult.failed.length} failed</StatusBadge>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">All selected bills landed in QuickBooks.</span>
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
                Selected bills
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
                  disabled={publishing || !quickBooksConnection?.connected || !selectedReadyIds.length}
                  className="h-9 px-4"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Image src="/icons/qb-badge.png" alt="" width={16} height={16} className="object-contain" />
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
              <p className="mt-1 text-xs font-semibold text-muted-foreground">Import a CSV of open POs to start matching.</p>
              <Button variant="surface" size="sm" className="mt-3" onClick={() => { setPoDialogOpen(false); setPoImportOpen(true) }}>
                Import POs (CSV)
              </Button>
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

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="ghost" size="sm" onClick={() => { setPoDialogOpen(false); setPoImportOpen(true) }}>
              Import POs (CSV)
            </Button>
            <Button variant="surface" size="sm" onClick={() => setPoDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* P9 — CSV import dialog */}
      <Dialog open={poImportOpen} onOpenChange={setPoImportOpen}>
        <DialogContent className="gap-4 rounded-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <span className="inline-flex size-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <FileText className="size-3.5" />
              </span>
              Import purchase orders
            </DialogTitle>
            <DialogDescription className="text-sm font-medium leading-6">
              Paste CSV with a header row. Columns: <span className="rounded bg-muted px-1 font-mono text-[12px] text-foreground">po_number, vendor, date, total, remaining, currency</span>. Existing PO numbers are updated.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={poCsv}
            onChange={(event) => setPoCsv(event.target.value)}
            placeholder={"po_number,vendor,date,total,remaining,currency\nPO-1001,Acme Ltd,2026-05-01,1200.00,1200.00,USD"}
            rows={8}
            className="w-full rounded-md border border-border bg-background p-3 font-mono text-xs outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
          <DialogFooter>
            <Button variant="surface" onClick={() => setPoImportOpen(false)} disabled={poBusy} className="h-9 px-4">Cancel</Button>
            <MotionButton variant="glossy" onClick={() => void importPos()} disabled={poBusy || !poCsv.trim()} className="h-9 px-4">
              {poBusy ? <Loader2 className="size-4 animate-spin" /> : null}
              Import
            </MotionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PublishSuccessBurst show={showSuccessBurst} origin={burstOrigin} />
    </DashboardShell>
  )
}

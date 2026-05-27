"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronLeft, Loader2 } from "lucide-react"
import Image from "next/image"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import {
  accountsPayableApi,
  quickBooksApi,
  type AccountsPayableDraftData,
  type AccountsPayableItem,
  type AccountsPayableStatus,
  type QuickBooksConnectionStatus,
  type QuickBooksReferenceItem,
} from "@/lib/api-client"
import { cn } from "@/lib/utils"

type QueueFilter = "all" | AccountsPayableStatus

const queueStatuses: Array<{ value: AccountsPayableStatus; label: string }> = [
  { value: "needs_coding", label: "Needs coding" },
  { value: "needs_review", label: "Needs review" },
  { value: "ready_to_publish", label: "Ready to publish" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
]

const statusTone: Record<AccountsPayableStatus, "warning" | "review" | "info" | "success" | "error"> = {
  needs_coding: "warning",
  needs_review: "review",
  ready_to_publish: "info",
  published: "success",
  failed: "error",
}

const dotColor: Record<"warning" | "review" | "info" | "success" | "error", string> = {
  warning: "bg-amber-400",
  review: "bg-violet-400",
  info: "bg-sky-400",
  success: "bg-emerald-500",
  error: "bg-rose-500",
}

const editableFields: Array<[keyof AccountsPayableDraftData, string, string]> = [
  ["invoice_date", "Invoice date", "YYYY-MM-DD"],
  ["due_date", "Due date", "YYYY-MM-DD"],
  ["reference", "Reference", "PO or bill reference"],
  ["currency", "Currency", "USD"],
]

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
  const { user, loading: authLoading } = useAuth()
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
  const [syncingReferences, setSyncingReferences] = useState(false)

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

  const loadQuickBooks = async (sync = false) => {
    try {
      setSyncingReferences(sync)
      const status = sync ? await quickBooksApi.sync() : await quickBooksApi.status()
      setQuickBooksConnection(status)
      if (status.connected) {
        const response = await quickBooksApi.references()
        setQuickBooksReferences(response.items)
      } else {
        setQuickBooksReferences([])
      }
    } catch {
      if (sync) toast.error("Could not refresh QuickBooks lists.")
    } finally {
      setSyncingReferences(false)
    }
  }

  useEffect(() => {
    if (user) void loadQuickBooks()
  }, [user?.id])

  const activeItem = items.find(item => item.id === activeId) || null

  useEffect(() => {
    if (!activeItem) return
    setDraft(cloneDraft(activeItem))
    setAttachmentVisible(activeItem.attachment_visible)
    setNextStatus(activeItem.status)
  }, [activeItem?.id, activeItem?.updated_at])

  const counts = useMemo(() => {
    return items.reduce((current, item) => {
      current[item.status] += 1
      return current
    }, {
      needs_coding: 0,
      needs_review: 0,
      ready_to_publish: 0,
      published: 0,
      failed: 0,
    } as Record<AccountsPayableStatus, number>)
  }, [items])

  const visibleItems = filter === "all" ? items : items.filter(item => item.status === filter)
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

  const toggleSelection = (itemId: string, checked: boolean) => {
    setSelectedReadyIds(current => checked
      ? Array.from(new Set([...current, itemId]))
      : current.filter(id => id !== itemId))
  }

  const publishSelected = async () => {
    if (!selectedReadyIds.length) return
    if (!window.confirm("Create unpaid Bills in QuickBooks for the selected ready invoices?")) return
    setSaving(true)
    try {
      const response = await accountsPayableApi.bulkPublish(selectedReadyIds)
      setItems(current => current.map(item => response.items.find(updated => updated.id === item.id) || item))
      setSelectedReadyIds([])
      if (response.items.length) toast.success(`${response.items.length} unpaid Bill${response.items.length === 1 ? "" : "s"} created in QuickBooks.`)
      if (response.failures.length) toast.error(`${response.failures.length} item${response.failures.length === 1 ? "" : "s"} could not be published.`)
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not publish selected items.")
    } finally {
      setSaving(false)
    }
  }

  const publishActive = async () => {
    if (!activeItem || !["ready_to_publish", "published"].includes(activeItem.status)) return
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
          description="Reviewed invoices ready to publish as QuickBooks Bills"
          actions={selectedReadyIds.length ? (
            <Button variant="glossy" onClick={() => void publishSelected()} disabled={saving || !quickBooksConnection?.connected} className="h-9 rounded-md px-4">
              <Image src="/icons/qb-badge.png" alt="" width={16} height={16} className="mr-1 object-contain" />
              Publish {selectedReadyIds.length} to QuickBooks
            </Button>
          ) : undefined}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm">
          <div>
            <p className="font-medium text-foreground">
              QuickBooks {quickBooksConnection?.connected ? `connected${quickBooksConnection.company_name ? ` to ${quickBooksConnection.company_name}` : ""}` : "not connected"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Select synced vendors and expense accounts before publishing an unpaid Bill.
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
          <Card className="flex max-h-[700px] flex-col overflow-hidden rounded-md border-border shadow-xs">
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
                {[
                  { value: "needs_coding" as const, label: "Needs coding" },
                  { value: "needs_review" as const, label: "Needs review" },
                  { value: "ready_to_publish" as const, label: "Ready" },
                  { value: "published" as const, label: "Published" },
                  { value: "failed" as const, label: "Failed" },
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
                <span className="w-[72px] shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</span>
              </div>
            </div>

            {/* Scrollable rows */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <EmptyState
                  icon={<Loader2 className="animate-spin" />}
                  title="Loading queue"
                  description="Fetching invoices ready to publish"
                  compact
                />
              ) : visibleItems.length === 0 ? (
                <EmptyState
                  icon={<ChevronLeft />}
                  illustration="/illustrations/empty-ap.png"
                  title="No invoices in this queue"
                  description="Mark a reviewed invoice Ready, then add it from Convert Files."
                  compact
                />
              ) : visibleItems.map(item => {
                const tone = statusTone[item.status]
                const isActive = activeId === item.id
                const isReady = item.status === "ready_to_publish"
                return (
                  <div
                    key={item.id}
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
                      isActive ? "bg-accent/50" : "hover:bg-accent/30"
                    )}
                  >
                    {/* Left accent bar */}
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

                    {/* Status badge */}
                    <span className="w-[72px] shrink-0">
                      <StatusBadge tone={tone}>{statusLabel(item.status)}</StatusBadge>
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="rounded-md border-border shadow-xs">
            <CardContent className="p-5">
              {!activeItem ? (
                <EmptyState
                  icon={<ChevronLeft />}
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
                        <Button asChild variant="surface" size="sm" className="h-8 rounded-md">
                          <a href={activeItem.source_access_url} target="_blank" rel="noreferrer">View attachment</a>
                        </Button>
                      ) : null}
                      <StatusBadge tone={statusTone[activeItem.status]}>
                        {statusLabel(activeItem.status)}
                      </StatusBadge>
                    </div>
                  </div>

                  {activeItem.vendor_suggestion ? (
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

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <Label>QuickBooks vendor</Label>
                      <Select
                        value={String(draft.vendor_ref_id || "")}
                        onValueChange={value => selectQuickBooksReference("vendor_ref_id", "vendor", value, vendors)}
                        disabled={activeLocked || !quickBooksConnection?.connected}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={vendors.length ? "Select vendor" : "Refresh vendor list"} />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.map(vendor => (
                            <SelectItem key={vendor.external_id} value={vendor.external_id}>{vendor.display_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="space-y-1.5">
                      <Label>Expense account</Label>
                      <Select
                        value={String(draft.account_ref_id || "")}
                        onValueChange={value => selectQuickBooksReference("account_ref_id", "account_category", value, accounts)}
                        disabled={activeLocked || !quickBooksConnection?.connected}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={accounts.length ? "Select account" : "Refresh account list"} />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.external_id} value={account.external_id}>{account.display_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="space-y-1.5">
                      <Label>Tax code</Label>
                      <Select
                        value={String(draft.tax_code_ref_id || "none")}
                        onValueChange={value => selectQuickBooksReference("tax_code_ref_id", "tax_code", value, taxCodes)}
                        disabled={activeLocked || !quickBooksConnection?.connected}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="No tax code" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No tax code</SelectItem>
                          {taxCodes.map(taxCode => (
                            <SelectItem key={taxCode.external_id} value={taxCode.external_id}>{taxCode.display_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                    {editableFields.map(([field, label, placeholder]) => (
                      <label key={field} className="space-y-1.5">
                        <Label htmlFor={`ap-${field}`}>{label}</Label>
                        <Input
                          id={`ap-${field}`}
                          value={String(draft[field] || "")}
                          onChange={event => updateDraftField(field, event.target.value)}
                          placeholder={placeholder}
                          disabled={activeLocked}
                          className="h-9"
                        />
                      </label>
                    ))}
                    <div className="rounded-md border border-border px-3 py-2.5">
                      <p className="text-xs text-muted-foreground">Invoice total</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{amountLabel(activeItem)}</p>
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
                        <Button type="button" variant="surface" size="sm" onClick={addLineItem} className="h-8 rounded-md text-xs">
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

                  <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="w-full max-w-[230px] space-y-1.5">
                      <Label>Status</Label>
                      {activeLocked ? (
                        <div className="flex h-9 items-center rounded-md border border-border bg-muted/30 px-3 text-sm text-foreground">
                          Published in QuickBooks
                        </div>
                      ) : (
                        <Select value={nextStatus} onValueChange={value => setNextStatus(value as AccountsPayableStatus)}>
                          <SelectTrigger className="h-9">
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
                          <Button variant="surface" onClick={() => void persistDraft()} disabled={saving} className="h-9 rounded-md">
                            Save draft
                          </Button>
                          <Button variant="reviewed" onClick={() => void applySelectedStatus()} disabled={saving || nextStatus === activeItem.status} className="h-9 rounded-md">
                            Apply status
                          </Button>
                          {activeItem.status === "ready_to_publish" ? (
                            <Button variant="glossy" onClick={() => void publishActive()} disabled={saving || !quickBooksConnection?.connected} className="h-9 rounded-md">
                              Publish to QuickBooks
                            </Button>
                          ) : null}
                        </>
                      ) : null}
                      {activeItem.status === "published" && activeItem.quickbooks_publication?.attachment_status === "failed" ? (
                        <Button variant="surface" onClick={() => void publishActive()} disabled={saving || !quickBooksConnection?.connected} className="h-9 rounded-md">
                          Retry attachment
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

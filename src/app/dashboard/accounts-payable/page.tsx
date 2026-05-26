"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import {
  accountsPayableApi,
  type AccountsPayableDraftData,
  type AccountsPayableItem,
  type AccountsPayableStatus,
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

const statusStyles: Record<AccountsPayableStatus, string> = {
  needs_coding: "border-amber-200 bg-amber-50 text-amber-900",
  needs_review: "border-orange-200 bg-orange-50 text-orange-900",
  ready_to_publish: "border-emerald-200 bg-emerald-50 text-emerald-900",
  published: "border-border bg-muted text-foreground",
  failed: "border-rose-200 bg-rose-50 text-rose-900",
}

const editableFields: Array<[keyof AccountsPayableDraftData, string, string]> = [
  ["vendor", "Vendor", "Vendor name"],
  ["due_date", "Due date", "YYYY-MM-DD"],
  ["account_category", "Account / category", "Office supplies"],
  ["tax_code", "Tax code", "VAT 20%"],
  ["reference", "Reference", "PO or bill reference"],
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

  const mergeItem = (item: AccountsPayableItem) => {
    setItems(current => current.map(existing => existing.id === item.id ? item : existing))
    if (item.status !== "ready_to_publish") {
      setSelectedReadyIds(current => current.filter(id => id !== item.id))
    }
  }

  const updateDraftField = (field: keyof AccountsPayableDraftData, value: string) => {
    setDraft(current => ({ ...current, [field]: value }))
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
          due_date: draft.due_date,
          account_category: draft.account_category,
          tax_code: draft.tax_code,
          reference: draft.reference,
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
    setSaving(true)
    try {
      const response = await accountsPayableApi.bulkPublish(selectedReadyIds)
      setItems(current => current.map(item => response.items.find(updated => updated.id === item.id) || item))
      setSelectedReadyIds([])
      toast.success("Selected items marked published.")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not update selected items.")
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) return <DashboardRouteLoader label="Loading Accounts Payable" />

  return (
    <DashboardShell activeItem="accounts_payable" title="Accounts Payable" user={user} contentClassName="max-w-none px-3 py-4 sm:px-5 lg:px-6">
      <div className="space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Accounts Payable</h1>
            <p className="mt-1 text-sm text-muted-foreground">Reviewed invoices prepared as draft bill candidates.</p>
          </div>
          {selectedReadyIds.length ? (
            <Button onClick={() => void publishSelected()} disabled={saving} className="h-9 rounded-md px-4">
              Mark {selectedReadyIds.length} published externally
            </Button>
          ) : null}
        </header>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn("rounded-md border px-3 py-2 text-sm font-medium", filter === "all" ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground")}
          >
            All <span className="ms-1 opacity-70">{items.length}</span>
          </button>
          {queueStatuses.map(item => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn("rounded-md border px-3 py-2 text-sm font-medium", filter === item.value ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground")}
            >
              {item.label} <span className="ms-1 opacity-70">{counts[item.value]}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(560px,1.2fr)]">
          <Card className="rounded-md border-border shadow-xs">
            <CardContent className="p-2">
              {loading ? (
                <p className="p-4 text-sm text-muted-foreground">Loading queue...</p>
              ) : visibleItems.length === 0 ? (
                <div className="p-5">
                  <p className="text-sm font-semibold text-foreground">No invoices in this queue</p>
                  <p className="mt-1 text-sm text-muted-foreground">Mark a reviewed invoice Ready, then add it from Convert Files.</p>
                </div>
              ) : visibleItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      setActiveId(item.id)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "mb-1 flex w-full items-start gap-3 rounded-md border px-3 py-3 text-left transition-colors last:mb-0",
                    activeId === item.id ? "border-border bg-accent" : "border-transparent hover:bg-accent/60"
                  )}
                >
                  <span onClick={(event) => event.stopPropagation()} className="mt-1">
                    <Checkbox
                      checked={selectedReadyIds.includes(item.id)}
                      disabled={item.status !== "ready_to_publish"}
                      onCheckedChange={checked => toggleSelection(item.id, checked === true)}
                      aria-label={`Select ${item.source_filename}`}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">{item.draft_data.vendor || "Vendor missing"}</span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {item.draft_data.invoice_number || item.source_filename}
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className={cn("rounded-md border px-2 py-1 font-medium", statusStyles[item.status])}>{statusLabel(item.status)}</span>
                      <span className="font-semibold text-foreground">{amountLabel(item)}</span>
                    </span>
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-md border-border shadow-xs">
            <CardContent className="p-4 sm:p-5">
              {!activeItem ? (
                <p className="text-sm text-muted-foreground">Choose an invoice to prepare its draft bill fields.</p>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">{draft.vendor || "Vendor missing"}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">{activeItem.source_filename}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeItem.source_access_url ? (
                        <Button asChild variant="outline" size="sm" className="h-8 rounded-md">
                          <a href={activeItem.source_access_url} target="_blank" rel="noreferrer">View attachment</a>
                        </Button>
                      ) : null}
                      <span className={cn("rounded-md border px-2 py-1 text-xs font-medium", statusStyles[activeItem.status])}>
                        {statusLabel(activeItem.status)}
                      </span>
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
                    Show source attachment with draft bill
                  </label>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">Line items</p>
                      {!activeLocked ? (
                        <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="h-8 rounded-md text-xs">
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
                                      className="h-8 min-w-[90px] rounded-sm border border-transparent bg-transparent px-2 text-foreground outline-none focus:border-border focus:bg-background"
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
                      <Select value={nextStatus} onValueChange={value => setNextStatus(value as AccountsPayableStatus)} disabled={activeLocked}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {queueStatuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.value === "published" ? "Published externally" : status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!activeLocked ? (
                        <>
                          <Button variant="outline" onClick={() => void persistDraft()} disabled={saving} className="h-9 rounded-md">
                            Save draft
                          </Button>
                          <Button onClick={() => void applySelectedStatus()} disabled={saving || nextStatus === activeItem.status} className="h-9 rounded-md">
                            Apply status
                          </Button>
                        </>
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

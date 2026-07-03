"use client"

import React, { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { BillingSeal, CreditStack, PlanSwitch } from "@/components/BillingGlyphs"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import { accountApi, accountsPayableApi, billingApi, vendorMemoryApi, workspaceApi, type BillingPlanKey, type VendorRule, type VendorRuleAutoMode, type VendorRuleFields } from "@/lib/api-client"
import { InlineAction } from "@/components/ui/inline-action"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { Field } from "@/components/dashboard/Field"
import { DangerZone } from "@/components/dashboard/DangerZone"
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog"
import {
  INVOICE_LANGUAGES,
  readInvoiceAutoDetect,
  readInvoiceLanguage,
  writeInvoiceAutoDetect,
  writeInvoiceLanguage,
  type InvoiceLanguage,
} from "@/lib/invoice-schema"
import {
  User,
  Globe,
  Languages,
  FileSpreadsheet,
  DownloadCloud,
  ExternalLink,
  Loader2,
  CreditCard,
  Store,
  Plug,
  SlidersHorizontal,
  Settings2,
  Lock,
  Info,
} from "lucide-react"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Symbol } from "@/components/dashboard/Symbol"
import { StatusBadge, type StatusTone } from "@/components/dashboard/StatusBadge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const selfServiceBillingKeys = new Set<string>(["pro_monthly", "pro_yearly", "max_monthly", "max_yearly"])

type SettingsSection = 'account' | 'billing' | 'accounting' | 'vendors' | 'preferences'
type SettingsNavItem = {
  id: SettingsSection
  label: string
  short: string
  icon: React.ComponentType<{ className?: string }>
}

// Soft inset surface for nested stat tiles (credits / limits). Uses workspace
// tokens so it never theme-flips.
const softPanel =
  "rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-soft)] shadow-none"

const accountingTextAction = "ax-text-action"

const accountingPrimaryButton =
  "!border-[var(--btn-primary-bg)] !bg-[var(--btn-primary-bg)] !text-[var(--btn-primary-fg)] !shadow-none hover:!bg-[var(--btn-primary-bg-hover)] hover:!text-[var(--btn-primary-fg-hover)] focus-visible:!ring-[var(--btn-primary-bg)]/30"

function SettingsFallback() {
  return <DashboardRouteLoader label="Loading settings" />
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <SettingsContent />
    </Suspense>
  )
}

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, signOut } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)
  const isOwner = !activeWorkspace || activeWorkspace.role === "owner"
  const supabase = createClient()

  const languageParam = searchParams.get('language') || (typeof window !== 'undefined' ? localStorage.getItem('ocrLanguage') || 'en' : 'en')
  const checkoutStatus = searchParams.get('checkout_status') || searchParams.get('billing')

  const [activeSection, setActiveSection] = useState<SettingsSection>('account')
  const [loading, setLoading] = useState(false)
  const [billingAction, setBillingAction] = useState<string | null>(null)
  const [vendorRules, setVendorRules] = useState<VendorRule[]>([])
  const [vendorDrafts, setVendorDrafts] = useState<Record<string, VendorRuleFields>>({})
  const [vendorRulesLoading, setVendorRulesLoading] = useState(false)
  const [vendorRuleAction, setVendorRuleAction] = useState<string | null>(null)
  const [poCsv, setPoCsv] = useState("")
  const [poImportBusy, setPoImportBusy] = useState(false)
  const {
    billingStatus,
    limits,
    plans: billingPlans,
    isLoading: billingLoading,
    checkoutSyncState,
    setCheckoutSyncState,
    refresh: refreshBilling,
    pollBillingStatus,
  } = useBillingStatus({
    enabled: Boolean(user),
    loadStatus: true,
    loadPlans: true,
    loadLimits: true,
  })

  // Account state
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")

  // Preferences state
  const [language, setLanguage] = useState(languageParam)
  const [autoDownload, setAutoDownload] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoDownload')
      return saved === 'true'
    }
    return false
  })
  const [autoSave, setAutoSave] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoSave')
      return saved === 'true'
    }
    return false
  })
  // P10 — invoice schema language preference
  const [invoiceLanguage, setInvoiceLanguageState] = useState<InvoiceLanguage>('en')
  const [invoiceAutoDetect, setInvoiceAutoDetectState] = useState(true)
  useEffect(() => {
    setInvoiceLanguageState(readInvoiceLanguage())
    setInvoiceAutoDetectState(readInvoiceAutoDetect())
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/sign-in?next=%2Fdashboard%2Fsettings')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    const section = searchParams.get('section')
    if (section === 'account' || section === 'billing' || section === 'accounting' || section === 'vendors' || section === 'preferences') {
      if (section === 'vendors' && !isOwner) return
      setActiveSection(section)
    }
  }, [searchParams, isOwner])

  // Sync language with localStorage and listen for changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('ocrLanguage')
      if (savedLanguage && savedLanguage !== language) {
        setLanguage(savedLanguage)
      }
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ocrLanguage' && e.newValue) {
        setLanguage(e.newValue)
        const params = new URLSearchParams(searchParams.toString())
        params.set('language', e.newValue)
        router.push(`/dashboard/settings?${params.toString()}`)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [searchParams, router])

  // Load user data
  useEffect(() => {
    if (user) {
      setEmail(user.email || "")
      setFullName(user.user_metadata?.full_name || user.user_metadata?.name || "")
    }
  }, [user])

  useEffect(() => {
    if (checkoutStatus === "success") {
      setCheckoutSyncState("pending")
      toast.message("Payment received. Confirming credits...")
      pollBillingStatus().then(({ state }) => {
        if (state === "active") {
          toast.success("Plan active. Credits are ready.")
        } else if (state === "failed") {
          toast.error("Payment needs attention. Open billing or contact support.")
        } else {
          toast.message("Payment is still confirming. Credits will update shortly.")
        }
      })
    } else if (checkoutStatus === "pending") {
      setCheckoutSyncState("pending")
      void refreshBilling({ includeStatus: true, includeLimits: true })
      toast.message("Billing is being confirmed.")
    } else if (checkoutStatus === "cancelled" || checkoutStatus === "canceled") {
      setCheckoutSyncState("cancelled")
      toast.message("Checkout cancelled. No charge was made.")
    }
  }, [checkoutStatus, pollBillingStatus, refreshBilling, setCheckoutSyncState])

  // Update user profile
  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (error) throw error

      toast.success("Profile updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    localStorage.setItem('ocrLanguage', newLanguage)
    const params = new URLSearchParams(searchParams.toString())
    params.set('language', newLanguage)
    router.push(`/dashboard/settings?${params.toString()}`)

    const languageNames: {[key: string]: string} = {
      en: 'English',
      de: 'Deutsch',
      fr: 'Français',
      ar: 'العربية',
      es: 'Español',
      it: 'Italiano',
      pt: 'Português',
      zh: '中文'
    }
    toast.success(`OCR detection language changed to ${languageNames[newLanguage] || newLanguage}`)
  }

  const formatPlan = (plan?: string | null) => {
    if (!plan) return "Free"
    if (plan === "pro") return "Standard"
    if (plan === "max" || plan === "business") return "Pro"
    if (plan === "mega" || plan === "enterprise") return "Enterprise"
    return plan.charAt(0).toUpperCase() + plan.slice(1)
  }

  const formatDate = (dateValue?: string | null) => {
    if (!dateValue) return "Not scheduled"
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateValue))
  }

  const startCheckout = async (planKey: BillingPlanKey) => {
    setBillingAction(planKey)
    try {
      const checkout = await billingApi.createCheckout(planKey)
      if (checkout.checkout_url) window.location.assign(checkout.checkout_url)
    } catch (error: any) {
      toast.error(error?.detail || "Checkout is not available yet")
    } finally {
      setBillingAction(null)
    }
  }

  const openBillingPortal = async () => {
    setBillingAction("portal")
    try {
      const portal = await billingApi.getPortal()
      if (portal.url) window.location.assign(portal.url)
    } catch (error: any) {
      toast.error(error?.detail || "Billing portal is available after your first subscription")
    } finally {
      setBillingAction(null)
    }
  }

  const importPurchaseOrders = async () => {
    if (!poCsv.trim() || !isOwner) return
    setPoImportBusy(true)
    try {
      const result = await accountsPayableApi.importPurchaseOrders(poCsv, activeWorkspace?.id)
      toast.success(`Imported ${result.imported} purchase order${result.imported === 1 ? "" : "s"}.`)
      setPoCsv("")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not import purchase orders.")
    } finally {
      setPoImportBusy(false)
    }
  }

  const loadVendorRules = async () => {
    setVendorRulesLoading(true)
    try {
      const response = await vendorMemoryApi.list()
      setVendorRules(response.rules)
      setVendorDrafts(Object.fromEntries(
        response.rules.map(rule => [rule.id, { ...rule.suggested_fields }])
      ))
    } catch {
      toast.error("Could not load vendor memory.")
    } finally {
      setVendorRulesLoading(false)
    }
  }

  useEffect(() => {
    if (user && activeSection === 'vendors') {
      void loadVendorRules()
    }
  }, [user, activeSection])

  const updateVendorDraft = (ruleId: string, field: keyof VendorRuleFields, value: string) => {
    setVendorDrafts(current => ({
      ...current,
      [ruleId]: {
        ...(current[ruleId] || {}),
        [field]: value,
      },
    }))
  }

  const saveVendorRule = async (rule: VendorRule) => {
    setVendorRuleAction(rule.id)
    try {
      const response = await vendorMemoryApi.update(rule.id, {
        suggested_fields: vendorDrafts[rule.id] || rule.suggested_fields,
      })
      setVendorRules(current => current.map(item => item.id === rule.id ? response.rule : item))
      toast.success("Vendor memory updated.")
    } catch {
      toast.error("Could not update vendor memory.")
    } finally {
      setVendorRuleAction(null)
    }
  }

  const toggleVendorRule = async (rule: VendorRule) => {
    setVendorRuleAction(rule.id)
    try {
      const response = await vendorMemoryApi.update(rule.id, { enabled: !rule.enabled })
      setVendorRules(current => current.map(item => item.id === rule.id ? response.rule : item))
      toast.success(response.rule.enabled ? "Vendor memory enabled." : "Vendor memory disabled.")
    } catch {
      toast.error("Could not change vendor memory status.")
    } finally {
      setVendorRuleAction(null)
    }
  }

  const updateVendorRuleAutoMode = async (rule: VendorRule, autoMode: VendorRuleAutoMode) => {
    if ((rule.auto_mode || "suggest") === autoMode) return
    setVendorRuleAction(rule.id)
    try {
      const response = await vendorMemoryApi.update(rule.id, { auto_mode: autoMode })
      setVendorRules(current => current.map(item => item.id === rule.id ? response.rule : item))
      const successCopy: Record<VendorRuleAutoMode, string> = {
        suggest: "Switched to suggestion only.",
        auto_fill: "Auto-fill on — confirm still required.",
        auto_ready: "Auto-fill on — moved to Ready for your approval.",
      }
      toast.success(successCopy[autoMode])
    } catch {
      toast.error("Could not change auto-apply mode.")
    } finally {
      setVendorRuleAction(null)
    }
  }

  const deleteVendorRule = async (rule: VendorRule) => {
    setVendorRuleAction(rule.id)
    try {
      await vendorMemoryApi.delete(rule.id)
      setVendorRules(current => current.filter(item => item.id !== rule.id))
      setVendorDrafts(current => {
        const next = { ...current }
        delete next[rule.id]
        return next
      })
      toast.success("Vendor memory deleted.")
    } catch {
      toast.error("Could not delete vendor memory.")
    } finally {
      setVendorRuleAction(null)
    }
  }

  // Danger zone state
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [deleteWorkspaceOpen, setDeleteWorkspaceOpen] = useState(false)
  const [leavingWorkspace, setLeavingWorkspace] = useState(false)
  const workspaceId = activeWorkspace?.id
  const workspaceName = activeWorkspace?.name || "this workspace"

  const handleDeleteAccount = async () => {
    try {
      await accountApi.delete()
      toast.success("Account deleted.")
      await signOut()
      router.replace("/")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not delete your account.")
      throw error
    }
  }

  const handleLeaveWorkspace = async () => {
    if (!workspaceId) return
    setLeavingWorkspace(true)
    try {
      await workspaceApi.leave(workspaceId)
      toast.success("You left the workspace.")
      router.replace("/dashboard")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not leave the workspace.")
      setLeavingWorkspace(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    if (!workspaceId) return
    try {
      await workspaceApi.delete(workspaceId)
      toast.success("Workspace deleted.")
      router.replace("/dashboard")
    } catch (error: any) {
      toast.error(error?.detail || error?.message || "Could not delete the workspace.")
      throw error
    }
  }

  const creditTotal = billingStatus?.credits?.total_credits ?? 0
  const creditUsed = billingStatus?.credits?.used_credits ?? 0
  const creditAvailable = billingStatus?.credits?.available_credits ?? 0
  const creditPercent = creditTotal > 0 ? Math.min(100, Math.round((creditUsed / creditTotal) * 100)) : 0
  const noCredits = !billingLoading && creditAvailable <= 0
  const currentSubscription = billingStatus?.subscription
  const hasBillingPortal = Boolean(currentSubscription?.customer_portal_url || billingStatus?.customer?.portal_url)
  const planStatusLabel = checkoutSyncState === "pending"
    ? "Confirming"
    : currentSubscription?.status || (billingStatus?.plan === "free" ? "Free" : "Active")
  const planStatusTone: StatusTone =
    checkoutSyncState === "pending"
      ? "processing"
      : (currentSubscription?.status || (billingStatus?.plan === "free" ? "free" : "active")) === "active"
        ? "success"
        : billingStatus?.plan === "free"
          ? "info"
          : "neutral"

  const sidebarSections = [
    {
      title: "Sections",
      items: [
        { id: 'account', label: 'Account', short: 'Profile and access', icon: User },
        { id: 'billing', label: 'Billing', short: 'Plan, credits, limits', icon: BillingSeal },
        { id: 'accounting', label: 'Accounting', short: 'Connections and POs', icon: DownloadCloud },
        ...(isOwner ? [{ id: 'vendors', label: 'Vendor memory', short: 'Coding defaults', icon: FileSpreadsheet }] : []),
        { id: 'preferences', label: 'Preferences', short: 'Review defaults', icon: SlidersHorizontal },
      ] as SettingsNavItem[]
    }
  ]

  if (authLoading) {
    return <DashboardRouteLoader label="Loading settings" />
  }

  if (!user) {
    return null
  }

  return (
    <DashboardShell activeItem="settings" title="Settings" user={user}>
      <div className="space-y-5">
        <PageHeader title="Settings" className="mb-0" />
        <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          {/* Mobile Section Selector */}
          <div className="lg:hidden">
            <Select value={activeSection} onValueChange={(value) => setActiveSection(value as SettingsSection)}>
              <SelectTrigger className="h-11 w-full rounded-full bg-white px-4">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                {sidebarSections.map((section) => (
                  <div key={section.title}>
                    {section.items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center gap-2.5">
                          <item.icon className="h-4 w-4" />
                          <span className="flex flex-col">
                            <span>{item.label}</span>
                            <span className="text-xs text-[var(--workspace-muted)]">{item.short}</span>
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sidebar Navigation */}
          <nav className="hidden lg:block">
            <div className="sticky top-20 rounded-lg border border-[var(--workspace-border)] bg-white p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.75),0_1px_2px_0_rgba(16,24,40,0.04)]">
              <div className="space-y-1">
                {sidebarSections.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <p className="px-3 pb-2 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--workspace-muted)]">
                      {section.title}
                    </p>
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = activeSection === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id as SettingsSection)}
                          title={item.short}
                          className={cn(
                            "ax-interactive relative flex h-10 w-full items-center gap-3 rounded-full border border-transparent px-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-black/15",
                            isActive
                              ? "border-[var(--workspace-selection-border)] bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)]"
                              : "hover:border-[var(--workspace-border)] hover:bg-[var(--workspace-soft)]"
                          )}
                        >
                          {isActive && (
                            <span className="absolute inset-y-2 left-1 w-[3px] rounded-full bg-[var(--workspace-primary)]" />
                          )}
                          <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-[var(--workspace-primary)]")} />
                          <span className="min-w-0 truncate">{item.label}</span>
                          <span className="sr-only">{item.short}</span>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="min-w-0 max-w-4xl">
            {/* Account Settings */}
            {activeSection === 'account' && (
              <div className="space-y-5">
                {/* Profile Information */}
                <WorkspaceSection
                  title="Profile"
                  icon={<User />}
                  contentClassName="space-y-4"
                >
                  <Field label="Full name" htmlFor="fullname">
                    <Input
                      id="fullname"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-10"
                    />
                  </Field>
                  <Field label="Email address" htmlFor="email">
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-muted h-10 pr-9"
                      />
                      <Lock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-foreground" />
                    </div>
                  </Field>

                  <div className="flex items-center justify-end gap-4 border-t border-border pt-4">
                    <InlineAction
                      className={accountingTextAction}
                      onClick={() => setFullName(user?.user_metadata?.full_name || "")}
                    >
                      Reset
                    </InlineAction>
                    <Button
                      variant="glossy"
                      size="sm"
                      onClick={handleUpdateProfile}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </WorkspaceSection>

                {/* Danger zone — account */}
                <DangerZone
                  title="Delete account"
                  description="Permanent deletion."
                >
                  <Button
                    variant="dangerOutline"
                    size="sm"
                    onClick={() => setDeleteAccountOpen(true)}
                  >
                    Delete account
                  </Button>
                </DangerZone>

                {/* Danger zone — workspace */}
                {activeWorkspace && (
                  <DangerZone
                    title="Workspace"
                    description={
                      isOwner
                        ? `Delete "${workspaceName}" for everyone.`
                        : `Leave "${workspaceName}".`
                    }
                  >
                    {!isOwner && (
                      <Button
                        variant="dangerOutline"
                        size="sm"
                        onClick={() => void handleLeaveWorkspace()}
                        disabled={leavingWorkspace}
                      >
                        {leavingWorkspace ? "Leaving…" : "Leave workspace"}
                      </Button>
                    )}
                    {isOwner && (
                      <Button
                        variant="dangerOutline"
                        size="sm"
                        onClick={() => setDeleteWorkspaceOpen(true)}
                      >
                        Delete entire workspace
                      </Button>
                    )}
                  </DangerZone>
                )}

                <ConfirmDeleteDialog
                  open={deleteAccountOpen}
                  onOpenChange={setDeleteAccountOpen}
                  title="Delete account"
                  description="This permanently deletes your account and all data you own. You'll be signed out."
                  confirmText="DELETE"
                  confirmLabel="Delete account"
                  onConfirm={handleDeleteAccount}
                />

                {activeWorkspace && (
                  <ConfirmDeleteDialog
                    open={deleteWorkspaceOpen}
                    onOpenChange={setDeleteWorkspaceOpen}
                    title="Delete entire workspace"
                    description={`This permanently deletes "${workspaceName}" and all of its documents, members, and connections.`}
                    confirmText={activeWorkspace.name}
                    confirmLabel="Delete workspace"
                    onConfirm={handleDeleteWorkspace}
                  />
                )}
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="space-y-5">
                <WorkspaceSection
                  title={billingLoading ? "Loading plan" : `${formatPlan(billingStatus?.plan)} workspace`}
                  icon={<CreditCard />}
                  actions={<StatusBadge tone={planStatusTone}>{planStatusLabel}</StatusBadge>}
                  contentClassName="space-y-4"
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className={cn("p-4", softPanel)}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--workspace-muted)]">Plan</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {billingLoading ? "Loading" : formatPlan(billingStatus?.plan)}
                      </p>
                    </div>
                    <div className={cn("p-4", softPanel)}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--workspace-muted)]">Renewal</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {formatDate(currentSubscription?.renews_at || currentSubscription?.ends_at)}
                      </p>
                    </div>
                    <div className={cn("p-4", softPanel)}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--workspace-muted)]">Batch limit</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {limits ? `${limits.max_files_per_batch} files, ${limits.max_file_size_mb} MB` : "Loading"}
                      </p>
                    </div>
                  </div>

                  <div className={cn("p-4", softPanel)}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <CreditStack className="h-6 w-6 shrink-0 text-[var(--workspace-primary)]" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Credits</p>
                          <p className="text-xs font-medium text-foreground">{creditUsed} used of {creditTotal}</p>
                        </div>
                      </div>
                      {noCredits ? (
                        <StatusBadge tone="error">No credits left</StatusBadge>
                      ) : (
                        <p className="text-sm font-semibold text-[var(--workspace-primary)]">{creditAvailable} left</p>
                      )}
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[var(--workspace-primary)] transition-all"
                        style={{ width: `${creditPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
                    <Button
                      variant="glossy"
                      size="sm"
                      onClick={() => router.push("/pricing")}
                    >
                      {noCredits ? "Buy credits" : "Compare plans"}
                    </Button>
                    <InlineAction
                      className={accountingTextAction}
                      onClick={openBillingPortal}
                      disabled={!hasBillingPortal || billingAction === "portal"}
                    >
                      {billingAction === "portal" ? "Opening..." : "Manage billing"}
                    </InlineAction>
                  </div>
                </WorkspaceSection>

                <WorkspaceSection
                  title="Plan changes"
                  icon={<PlanSwitch />}
                  contentClassName="space-y-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                  {billingPlans
                    .filter((plan) => plan.checkout_key && selfServiceBillingKeys.has(plan.checkout_key))
                    .map((plan) => (
                    <button
                      key={plan.key}
                      type="button"
                      onClick={() => startCheckout(plan.checkout_key as BillingPlanKey)}
                      disabled={billingAction === plan.checkout_key || !plan.checkout_available}
                      className="ax-interactive group flex min-h-24 w-full cursor-pointer flex-col justify-between rounded-lg border border-[var(--workspace-border)] bg-white p-4 text-left text-foreground shadow-none outline-none hover:border-[var(--workspace-primary)] hover:bg-[var(--workspace-blue-soft)] focus-visible:ring-2 focus-visible:ring-black/15 disabled:cursor-wait disabled:opacity-70"
                    >
                      <span>
                        <span className="block text-sm font-semibold">
                          {plan.name} {plan.interval === "year" ? "annual" : "monthly"} - {plan.price_formatted}
                        </span>
                        <span className="mt-1 block text-xs font-medium text-[var(--workspace-muted)]">{plan.included_volume}</span>
                      </span>
                      <span className="mt-3 inline-flex h-7 w-fit items-center rounded-full border border-[var(--workspace-primary)] px-3 text-xs font-semibold text-[var(--workspace-primary)]">
                        Select plan
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => router.push("/contact?topic=enterprise")}
                    className="ax-interactive group flex min-h-24 w-full cursor-pointer flex-col justify-between rounded-lg border border-[var(--workspace-border)] bg-white p-4 text-left text-foreground shadow-none outline-none hover:border-[var(--workspace-primary)] hover:bg-[var(--workspace-blue-soft)] focus-visible:ring-2 focus-visible:ring-black/15"
                  >
                    <span>
                      <span className="block text-sm font-semibold">Enterprise</span>
                      <span className="mt-1 block text-xs font-medium text-[var(--workspace-muted)]">50,000+ documents/month and onboarding</span>
                    </span>
                    <span className="mt-3 inline-flex h-7 w-fit items-center rounded-full border border-[var(--workspace-primary)] px-3 text-xs font-semibold text-[var(--workspace-primary)]">
                      Contact sales
                    </span>
                  </button>

                  </div>

                </WorkspaceSection>
              </div>
            )}

            {activeSection === 'vendors' && isOwner && (
              <div className="space-y-5">
                <WorkspaceSection
                  title="Vendor memory"
                  icon={<Store />}
                  actions={(
                    <>
                      <StatusBadge tone="warning">Owner only</StatusBadge>
                      {vendorRules.length > 0 ? <StatusBadge tone="info">{vendorRules.length} saved</StatusBadge> : null}
                    </>
                  )}
                  contentClassName={vendorRules.length === 0 ? "p-0 sm:p-0" : "space-y-3"}
                >
                  {vendorRulesLoading ? (
                    <EmptyState
                      compact
                      icon={<Loader2 className="animate-spin h-5 w-5" />}
                      title="Loading vendors"
                    />
                  ) : vendorRules.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
                      <Symbol
                        name="firstsight-vendors-empty"
                        size="hero"
                        className="h-32 w-32 sm:h-36 sm:w-36"
                        alt=""
                      />
                      <div className="max-w-sm space-y-1.5">
                        <h3 className="text-base font-semibold tracking-tight text-foreground">
                          No supplier defaults yet
                        </h3>
                      </div>
                    </div>
                  ) : vendorRules.map(rule => (
                    <section key={rule.id} className={cn("p-3.5 sm:p-4", softPanel)}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Symbol
                            name="success-vendor-remembered"
                            size="badge"
                            className="mt-0.5 h-10 w-10"
                            alt=""
                          />
                          <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{rule.display_name}</h3>
                            <StatusBadge tone="info">
                              {rule.applies_to === 'both' ? 'Invoice / receipt' : rule.applies_to}
                            </StatusBadge>
                            <StatusBadge tone={rule.enabled ? "success" : "neutral"}>
                              {rule.enabled ? 'Enabled' : 'Disabled'}
                            </StatusBadge>
                          </div>
                          <p className="mt-1 text-xs font-medium text-[var(--workspace-muted)]">
                            Approved {formatDate(rule.approved_at)}
                          </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <InlineAction
                            tone={rule.enabled ? "warning" : "success"}
                            disabled={vendorRuleAction === rule.id}
                            onClick={() => void toggleVendorRule(rule)}
                          >
                            {rule.enabled ? 'Disable' : 'Enable'}
                          </InlineAction>
                          <InlineAction
                            tone="danger"
                            disabled={vendorRuleAction === rule.id}
                            onClick={() => void deleteVendorRule(rule)}
                          >
                            Delete
                          </InlineAction>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Field
                          label="Auto-apply mode"
                          icon={<SlidersHorizontal />}
                          trailing={
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex cursor-help text-foreground">
                                  <Info className="size-3.5" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {(rule.auto_mode || 'suggest') === 'auto_ready'
                                  ? 'Pre-fill and move to Ready for approval.'
                                  : (rule.auto_mode || 'suggest') === 'auto_fill'
                                    ? 'Pre-fill, then confirm before publishing.'
                                    : 'Show as a suggestion only.'}
                              </TooltipContent>
                            </Tooltip>
                          }
                        >
                          <Select
                            value={rule.auto_mode || 'suggest'}
                            onValueChange={(value) => void updateVendorRuleAutoMode(rule, value as VendorRuleAutoMode)}
                            disabled={vendorRuleAction === rule.id || !rule.enabled}
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="suggest">Suggest only</SelectItem>
                              <SelectItem value="auto_fill">Auto-fill + confirm required</SelectItem>
                              <SelectItem value="auto_ready">Auto-fill + move to Ready for your approval</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {([
                          ['category_account', 'Category / account', 'Office supplies'],
                          ['tax_code', 'Tax code', 'VAT 20%'],
                          ['currency', 'Currency', 'USD'],
                          ['payment_terms', 'Payment terms', 'Net 30'],
                          ['destination_treatment', 'Destination treatment', 'Draft bill'],
                        ] as Array<[keyof VendorRuleFields, string, string]>)
                          .filter(([field]) => rule.applies_to !== 'receipt' || field !== 'destination_treatment')
                          .map(([field, label, placeholder]) => (
                          <Field key={field} label={label} htmlFor={`${rule.id}-${field}`}>
                            <Input
                              id={`${rule.id}-${field}`}
                              value={vendorDrafts[rule.id]?.[field] || ''}
                              onChange={(event) => updateVendorDraft(rule.id, field, event.target.value)}
                              placeholder={placeholder}
                              className="h-9"
                            />
                          </Field>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-4 border-t border-border pt-3">
                        <Button
                          variant="glossy"
                          size="sm"
                          disabled={vendorRuleAction === rule.id}
                          onClick={() => void saveVendorRule(rule)}
                        >
                          {vendorRuleAction === rule.id ? 'Saving...' : 'Save changes'}
                        </Button>
                      </div>
                    </section>
                  ))}
                </WorkspaceSection>
              </div>
            )}

            {activeSection === 'accounting' && (
              <div className="space-y-5">
                <WorkspaceSection
                  title="Accounting connections"
                  icon={<DownloadCloud />}
                  contentClassName="py-3 sm:py-3"
                >
                  <InlineAction asChild className={cn("shrink-0", accountingTextAction)}>
                    <Link href="/dashboard/integrations">
                      Open integrations
                      <ExternalLink className="size-4" />
                    </Link>
                  </InlineAction>
                </WorkspaceSection>

                <WorkspaceSection
                  title="Purchase order import"
                  icon={<FileSpreadsheet />}
                  contentClassName="space-y-4"
                >
                  {!isOwner ? (
                    <StatusBadge tone="warning">Owner required</StatusBadge>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="purchase-orders-csv">Purchase orders CSV</Label>
                        <p className="mt-1 text-xs leading-5 text-[var(--workspace-muted)]">
                          Columns: <span className="font-mono text-slate-900 dark:text-slate-100">po_number, vendor, date, total, remaining, currency</span>
                        </p>
                      </div>
                      <textarea
                        id="purchase-orders-csv"
                        value={poCsv}
                        onChange={(event) => setPoCsv(event.target.value)}
                        placeholder={"po_number,vendor,date,total,remaining,currency\nPO-1001,Acme Ltd,2026-05-01,1200.00,1200.00,USD"}
                        rows={6}
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs outline-none transition focus:border-[var(--workspace-primary)]/40 focus:ring-2 focus:ring-black/15 dark:border-slate-800 dark:bg-slate-950"
                      />
                      <div className="flex justify-end border-t border-border pt-3">
                        <Button
                          variant="glossy"
                          size="sm"
                          onClick={() => void importPurchaseOrders()}
                          disabled={poImportBusy || !poCsv.trim()}
                          className={accountingPrimaryButton}
                        >
                          {poImportBusy ? <Loader2 className="size-4 animate-spin" /> : null}
                          {poImportBusy ? "Importing..." : "Import purchase orders"}
                        </Button>
                      </div>
                    </>
                  )}
                </WorkspaceSection>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="space-y-5">
                {/* Processing Settings */}
                <WorkspaceSection
                  title="Processing defaults"
                  icon={<Settings2 />}
                  contentClassName="space-y-4"
                >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-download">Auto download</Label>
                      </div>
                      <Switch
                        id="auto-download"
                        checked={autoDownload}
                        onCheckedChange={(checked) => {
                          setAutoDownload(checked)
                          localStorage.setItem('autoDownload', checked.toString())
                          toast.success(checked ? 'Auto-download enabled' : 'Auto-download disabled')
                        }}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-save">Save to history</Label>
                      </div>
                      <Switch
                        id="auto-save"
                        checked={autoSave}
                        onCheckedChange={(checked) => {
                          setAutoSave(checked)
                          localStorage.setItem('autoSave', checked.toString())
                          toast.success(checked ? 'Auto-save enabled' : 'Auto-save disabled')
                        }}
                      />
                    </div>
                    <Separator />
                    {/* P10 — Invoice schema language */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="invoice-language">Invoice language</Label>
                      </div>
                      <Select
                        value={invoiceLanguage}
                        onValueChange={(value) => {
                          const lang = value as InvoiceLanguage
                          setInvoiceLanguageState(lang)
                          writeInvoiceLanguage(lang)
                          toast.success('Invoice schema language updated')
                        }}
                      >
                        <SelectTrigger id="invoice-language" className="h-9 w-full sm:w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INVOICE_LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.flag} {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="invoice-autodetect">Auto-detect invoice language</Label>
                      </div>
                      <Switch
                        id="invoice-autodetect"
                        checked={invoiceAutoDetect}
                        onCheckedChange={(checked) => {
                          setInvoiceAutoDetectState(checked)
                          writeInvoiceAutoDetect(checked)
                          toast.success(checked ? 'Auto-detect enabled' : 'Auto-detect disabled')
                        }}
                      />
                    </div>
                </WorkspaceSection>

                {/* OCR Detection Language */}
                <WorkspaceSection
                  title="OCR language"
                  icon={<Languages />}
                  contentClassName="space-y-4"
                >
                    <div className="space-y-2">
                      <Label htmlFor="language">Detection language</Label>
                      <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger id="language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>English</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="de">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>Deutsch</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="fr">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>Français</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="ar">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>العربية</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="es">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>Español</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="it">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>Italiano</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="pt">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>Português</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="zh">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>中文</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                </WorkspaceSection>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

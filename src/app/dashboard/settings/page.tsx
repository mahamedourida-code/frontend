"use client"

import React, { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { BillingSeal, CreditStack, PlanSwitch } from "@/components/BillingGlyphs"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import { accountsPayableApi, billingApi, vendorMemoryApi, type BillingPlanKey, type VendorRule, type VendorRuleAutoMode, type VendorRuleFields } from "@/lib/api-client"
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
  Settings2,
  Moon,
  Sun,
  Laptop,
  Languages,
  Check,
  FileSpreadsheet,
  DownloadCloud,
  ExternalLink,
  Save,
  Loader2,
} from "lucide-react"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { clayButton } from "@/lib/clay-button"

type SettingsSection = 'account' | 'billing' | 'accounting' | 'vendors' | 'preferences'
type Theme = 'dark' | 'light' | 'system'

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
  const { user, loading: authLoading } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)
  const isOwner = !activeWorkspace || activeWorkspace.role === "owner"
  const { theme: currentTheme, setTheme } = useTheme()
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
  const [mounted, setMounted] = useState(false)
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

  // Prevent hydration mismatch for theme
  useEffect(() => {
    setMounted(true)
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

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    toast.success(`Theme changed to ${newTheme}`)
  }

  const formatPlan = (plan?: string | null) => {
    if (!plan) return "Free"
    if (plan === "pro") return "Standard"
    if (plan === "max" || plan === "business") return "Pro"
    if (plan === "mega" || plan === "enterprise") return "Max"
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

  const creditTotal = billingStatus?.credits?.total_credits ?? 0
  const creditUsed = billingStatus?.credits?.used_credits ?? 0
  const creditAvailable = billingStatus?.credits?.available_credits ?? 0
  const creditPercent = creditTotal > 0 ? Math.min(100, Math.round((creditUsed / creditTotal) * 100)) : 0
  const noCredits = !billingLoading && creditAvailable <= 0
  const currentSubscription = billingStatus?.subscription
  const hasBillingPortal = Boolean(currentSubscription?.customer_portal_url || billingStatus?.customer?.portal_url)

  const sidebarSections = [
    {
      title: "Settings",
      items: [
        { id: 'account', label: 'Account', icon: User },
        { id: 'billing', label: 'Billing', icon: BillingSeal },
        { id: 'accounting', label: 'Accounting connections', icon: DownloadCloud },
        ...(isOwner ? [{ id: 'vendors', label: 'Vendor memory', icon: FileSpreadsheet }] : []),
        { id: 'preferences', label: 'Preferences', icon: Settings2 },
      ] as Array<{ id: SettingsSection; label: string; icon: React.ComponentType<{ className?: string }> }>
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
        <PageHeader title="Settings" description="Account, billing, accounting, vendors, and workspace preferences" />
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile Section Selector */}
          <div className="lg:hidden">
            <Select value={activeSection} onValueChange={(value) => setActiveSection(value as SettingsSection)}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                {sidebarSections.map((section) => (
                  <div key={section.title}>
                    {section.items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sidebar Navigation */}
          <nav className="hidden lg:block w-64 shrink-0">
            <Card className="ax-glass-card">
              <CardContent className="p-3 lg:p-4">
                <div className="space-y-1">
                  {sidebarSections.map((section) => (
                    <div key={section.title} className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id as SettingsSection)}
                            className={cn(
                              "ax-interactive relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
                              activeSection === item.id
                                ? "bg-accent text-accent-foreground font-medium shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                          >
                            {activeSection === item.id && (
                              <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-primary" />
                            )}
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </nav>

          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            {/* Account Settings */}
            {activeSection === 'account' && (
              <div className="space-y-4 lg:space-y-6">
                {/* Profile Information */}
                <Card className="ax-glass-card">
                  <CardHeader className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base lg:text-lg">Profile Information</CardTitle>
                        <CardDescription className="text-xs lg:text-sm">Update your personal details</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-5">
                    <div className="space-y-1.5 lg:space-y-2">
                      <Label htmlFor="fullname" className="text-xs lg:text-sm">Full Name</Label>
                      <Input
                        id="fullname"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-9 lg:h-10"
                      />
                    </div>
                    <div className="space-y-1.5 lg:space-y-2">
                      <Label htmlFor="email" className="text-xs lg:text-sm">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-muted h-9 lg:h-10"
                      />
                      <p className="text-[13px] font-medium text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="flex justify-end gap-2 lg:gap-3 pt-3 lg:pt-4 border-t">
                      <Button
                        variant="surface"
                        size="sm"
                        onClick={() => setFullName(user?.user_metadata?.full_name || "")}
                        className="h-9"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="glossy"
                        size="sm"
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="h-9"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="space-y-5 lg:space-y-6">
                <Card className="ax-glass-card overflow-hidden rounded-xl">
                  <CardContent className="p-0">
                    <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">Billing</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                              {billingLoading ? "Loading plan" : `${formatPlan(billingStatus?.plan)} workspace`}
                            </h2>
                          </div>
                          <BillingSeal className="h-9 w-9 shrink-0 text-primary" />
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Status</p>
                            <p className="mt-2 text-xl font-semibold text-foreground">
                              {checkoutSyncState === "pending"
                                ? "confirming"
                                : currentSubscription?.status || (billingStatus?.plan === "free" ? "free" : "active")}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Renew date</p>
                            <p className="mt-2 text-xl font-semibold text-foreground">
                              {formatDate(currentSubscription?.renews_at || currentSubscription?.ends_at)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-border bg-card/50 p-4 backdrop-blur">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <CreditStack className="h-6 w-6 text-primary" />
                              <div>
                                <p className="text-sm font-bold text-foreground">Credits</p>
                                <p className="text-xs text-muted-foreground">{creditAvailable} available of {creditTotal}</p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-primary">{creditUsed} used</p>
                          </div>
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${creditPercent}%` }}
                            />
                          </div>
                        </div>

                        {noCredits && (
                          <div className="mt-4 rounded-xl border border-primary/20 bg-card/60 p-4 backdrop-blur">
                            <p className="text-sm font-semibold text-primary">No credits left</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              Pick a Lemon Squeezy plan to keep converting handwritten images and PDF pages.
                            </p>
                          </div>
                        )}

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                          <Button
                            variant="surface"
                            className={cn("h-11 rounded-lg", clayButton)}
                            onClick={openBillingPortal}
                            disabled={!hasBillingPortal || billingAction === "portal"}
                          >
                            {billingAction === "portal" ? "Opening..." : "Manage billing"}
                          </Button>
                          <Button
                            variant="lime"
                            className="h-11 rounded-lg"
                            onClick={() => window.location.assign("/pricing")}
                          >
                            {noCredits ? "Buy credits" : "Compare plans"}
                          </Button>
                        </div>
                      </div>

                      <div className="border-t border-border bg-card/25 p-5 backdrop-blur lg:border-l lg:border-t-0 sm:p-6">
                        <div className="flex items-center gap-3">
                          <PlanSwitch className="h-7 w-7 shrink-0 text-primary" />
                          <div>
                            <h3 className="font-semibold text-foreground">Upgrade path</h3>
                            <p className="text-sm text-muted-foreground">Checkout opens in Lemon Squeezy.</p>
                          </div>
                        </div>

                        <div className="mt-5 space-y-3">
                          {billingPlans
                            .filter((plan) => plan.checkout_key)
                            .map((plan) => (
                            <button
                              key={plan.key}
                              type="button"
                              onClick={() => startCheckout(plan.checkout_key as BillingPlanKey)}
                              disabled={billingAction === plan.checkout_key || !plan.checkout_available}
                              className="ax-interactive group flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card/50 p-4 text-left hover:border-primary/40 hover:bg-card/65 disabled:cursor-wait disabled:opacity-70"
                            >
                              <span>
                                <span className="block text-sm font-semibold text-foreground">
                                  {plan.name} {plan.interval === "year" ? "annual" : "monthly"} · {plan.price_formatted}
                                </span>
                                <span className="mt-1 block text-xs text-muted-foreground">{plan.included_volume}</span>
                              </span>
                              <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_6px_rgb(20 83 45 / 0.12)] transition group-hover:scale-110" />
                            </button>
                          ))}
                        </div>

                        <div className="mt-5 rounded-lg border border-border bg-card/40 p-4 text-sm text-muted-foreground">
                          Current batch size and file limits come from the backend:
                          <span className="ml-1 font-bold text-foreground">
                            {limits ? `${limits.max_files_per_batch} files, ${limits.max_file_size_mb} MB each` : "loading live limits"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'vendors' && isOwner && (
              <div className="space-y-5">
                <Card className="ax-glass-card overflow-hidden rounded-xl">
                  <CardHeader className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">Vendor memory</CardTitle>
                          <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
                            Owner only
                          </span>
                        </div>
                        <CardDescription className="mt-1 max-w-xl leading-5">
                          Rules saved after confirmed invoice or receipt review. AxLiner shows these as suggestions and never posts them automatically.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
                    {vendorRulesLoading ? (
                      <EmptyState
                        compact
                        icon={<Loader2 className="animate-spin h-5 w-5" />}
                        title="Loading vendors"
                        description="Fetching your saved vendor rules"
                      />
                    ) : vendorRules.length === 0 ? (
                      <EmptyState
                        compact
                        icon={<FileSpreadsheet />}
                        illustration="/symbols/code-account-badge.png"
                        illustrationSize={150}
                        title="No saved vendors"
                        description="Confirm an invoice or receipt in Review, then remember the vendor."
                      />
                    ) : vendorRules.map(rule => (
                      <section key={rule.id} className="rounded-lg border border-border bg-card/50 p-4 backdrop-blur">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-foreground">{rule.display_name}</h3>
                              <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                {rule.applies_to === 'both' ? 'Invoice / receipt' : rule.applies_to}
                              </span>
                              <StatusBadge tone={rule.enabled ? "success" : "neutral"}>
                                {rule.enabled ? 'Enabled' : 'Disabled'}
                              </StatusBadge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Approved {formatDate(rule.approved_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="surface"
                              disabled={vendorRuleAction === rule.id}
                              onClick={() => void toggleVendorRule(rule)}
                              className="h-8 rounded-md px-3 text-xs"
                            >
                              {rule.enabled ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={vendorRuleAction === rule.id}
                              onClick={() => void deleteVendorRule(rule)}
                              className="h-8 rounded-md px-3 text-xs"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Auto-apply mode
                              </p>
                              <p className="mt-1 text-xs text-foreground">
                                {(rule.auto_mode || 'suggest') === 'auto_ready'
                                  ? 'Next invoice from this vendor is pre-filled and moved to Ready for your approval. You still publish it.'
                                  : (rule.auto_mode || 'suggest') === 'auto_fill'
                                    ? 'Next invoice from this vendor is pre-filled. You still confirm before publishing.'
                                    : 'Next invoice from this vendor surfaces this rule as a suggestion only.'}
                              </p>
                            </div>
                            <Select
                              value={rule.auto_mode || 'suggest'}
                              onValueChange={(value) => void updateVendorRuleAutoMode(rule, value as VendorRuleAutoMode)}
                              disabled={vendorRuleAction === rule.id || !rule.enabled}
                            >
                              <SelectTrigger className="h-9 w-full max-w-[260px] sm:w-[260px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="suggest">Suggest only</SelectItem>
                                <SelectItem value="auto_fill">Auto-fill + confirm required</SelectItem>
                                <SelectItem value="auto_ready">Auto-fill + move to Ready for your approval</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {([
                            ['category_account', 'Category / account', 'Office supplies'],
                            ['tax_code', 'Tax code', 'VAT 20%'],
                            ['currency', 'Currency', 'USD'],
                            ['payment_terms', 'Payment terms', 'Net 30'],
                            ['destination_treatment', 'Destination treatment', 'Draft bill'],
                          ] as Array<[keyof VendorRuleFields, string, string]>)
                            .filter(([field]) => rule.applies_to !== 'receipt' || field !== 'destination_treatment')
                            .map(([field, label, placeholder]) => (
                            <label key={field} className="space-y-1.5">
                              <span className="block text-xs font-medium text-muted-foreground">{label}</span>
                              <Input
                                value={vendorDrafts[rule.id]?.[field] || ''}
                                onChange={(event) => updateVendorDraft(rule.id, field, event.target.value)}
                                placeholder={placeholder}
                                className="h-9"
                              />
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            variant="surface"
                            disabled={vendorRuleAction === rule.id}
                            onClick={() => void saveVendorRule(rule)}
                            className={cn("h-9 rounded-md px-4", clayButton)}
                          >
                            {vendorRuleAction === rule.id ? 'Saving...' : 'Save changes'}
                          </Button>
                        </div>
                      </section>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'accounting' && (
              <div className="space-y-5">
                <Card className="ax-glass-card overflow-hidden rounded-xl">
                  <CardHeader className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <DownloadCloud className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Accounting connections</CardTitle>
                        <CardDescription className="mt-1 max-w-xl leading-5">
                          Choose QuickBooks or Xero and manage the accounting connection shared by this workspace.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="border-t border-border p-5 sm:p-6">
                    <Button asChild variant="surface" size="sm">
                      <Link href="/dashboard/integrations">
                        Open integrations
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="ax-glass-card overflow-hidden rounded-xl">
                  <CardHeader className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Purchase order import</CardTitle>
                        <CardDescription className="mt-1 max-w-xl leading-5">
                          Import open purchase orders for matching in Accounts payable. Existing PO numbers are updated.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 border-t border-border p-5 sm:p-6">
                    {!isOwner ? (
                      <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                        Ask the workspace owner to import purchase orders.
                      </p>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="purchase-orders-csv">Purchase orders CSV</Label>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Columns: <span className="font-mono text-foreground">po_number, vendor, date, total, remaining, currency</span>
                          </p>
                        </div>
                        <textarea
                          id="purchase-orders-csv"
                          value={poCsv}
                          onChange={(event) => setPoCsv(event.target.value)}
                          placeholder={"po_number,vendor,date,total,remaining,currency\nPO-1001,Acme Ltd,2026-05-01,1200.00,1200.00,USD"}
                          rows={7}
                          className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                        />
                        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-muted-foreground">
                            Applies to {activeWorkspace?.name || "the current workspace"}.
                          </p>
                          <Button
                            variant="glossy"
                            size="sm"
                            onClick={() => void importPurchaseOrders()}
                            disabled={poImportBusy || !poCsv.trim()}
                          >
                            {poImportBusy ? <Loader2 className="size-4 animate-spin" /> : null}
                            {poImportBusy ? "Importing..." : "Import purchase orders"}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Preferences */}
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                {/* Processing Settings */}
                <Card className="ax-glass-card">
                  <CardHeader className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Settings2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Processing Settings</CardTitle>
                        <CardDescription>Configure automatic actions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-download">Auto Download</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically download files when processing completes
                        </p>
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
                        <Label htmlFor="auto-save">Auto Save to History</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically save processed files to your history
                        </p>
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
                        <p className="text-xs text-muted-foreground">
                          Adapts review-board field labels (TVA, Montant HT/TTC, Fournisseur…). Display only — the OCR language is set below.
                        </p>
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
                        <p className="text-xs text-muted-foreground">
                          Suggest switching the schema when an invoice contains another language&apos;s tax fields
                        </p>
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
                  </CardContent>
                </Card>

                {/* OCR Detection Language */}
                <Card className="ax-glass-card">
                  <CardHeader className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Languages className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>OCR Detection Language</CardTitle>
                        <CardDescription>Set the language for text recognition</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-5">
                    <div className="space-y-2">
                      <Label htmlFor="language">OCR Language</Label>
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
                      <p className="text-xs text-muted-foreground">
                        Changes will take effect immediately
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
    </DashboardShell>
  )
}

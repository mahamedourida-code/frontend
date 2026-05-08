"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/hooks/useAuth"
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
import { BillingSeal, CreditStack, PlanSwitch } from "@/components/BillingGlyphs"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import { billingApi, type BillingPlanKey } from "@/lib/api-client"
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
  Save
} from "lucide-react"

type SettingsSection = 'account' | 'billing' | 'preferences'
type Theme = 'dark' | 'light' | 'system'

function SettingsFallback() {
  return (
    <div className="min-h-screen bg-[#E9ECE4] p-3 sm:p-4">
      <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center rounded-[30px] border border-[#eadfff] bg-white/55 backdrop-blur-xl">
        <div className="h-12 w-12 rounded-full border-4 border-[#d9c9fb] border-t-[#2f165e] animate-spin" />
      </div>
    </div>
  )
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
  const { user } = useAuth()
  const { theme: currentTheme, setTheme } = useTheme()
  const supabase = createClient()

  const languageParam = searchParams.get('language') || (typeof window !== 'undefined' ? localStorage.getItem('ocrLanguage') || 'en' : 'en')
  const checkoutStatus = searchParams.get('checkout_status') || searchParams.get('billing')

  const [activeSection, setActiveSection] = useState<SettingsSection>('account')
  const [loading, setLoading] = useState(false)
  const [billingAction, setBillingAction] = useState<string | null>(null)
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

  // Prevent hydration mismatch for theme
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const section = searchParams.get('section')
    if (section === 'account' || section === 'billing' || section === 'preferences') {
      setActiveSection(section)
    }
  }, [searchParams])

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
    if (plan === "enterprise") return "Mega"
    if (plan === "business") return "Max"
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
        { id: 'preferences', label: 'Preferences', icon: Settings2 },
      ]
    }
  ]

  return (
    <DashboardShell activeItem="settings" title="Settings" user={user}>
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
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                              activeSection === item.id
                                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                          >
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
                  <CardHeader className="p-3 lg:p-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-base lg:text-lg">Profile Information</CardTitle>
                        <CardDescription className="text-xs lg:text-sm">Update your personal details</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 lg:space-y-4 p-3 lg:p-4">
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
                      <p className="text-[10px] lg:text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="flex justify-end gap-2 lg:gap-3 pt-3 lg:pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFullName(user?.user_metadata?.full_name || "")}
                        className="h-8 lg:h-9"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="h-8 lg:h-9"
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
                <Card className="ax-glass-card overflow-hidden rounded-[30px]">
                  <CardContent className="p-0">
                    <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7c62b1]">Billing</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">
                              {billingLoading ? "Loading plan" : `${formatPlan(billingStatus?.plan)} workspace`}
                            </h2>
                          </div>
                          <BillingSeal className="h-9 w-9 shrink-0 text-[#4b2d82]" />
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[24px] border border-[#eadfff] bg-white/45 p-4 backdrop-blur">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7c62b1]">Status</p>
                            <p className="mt-2 text-xl font-black text-foreground">
                              {checkoutSyncState === "pending"
                                ? "confirming"
                                : currentSubscription?.status || (billingStatus?.plan === "free" ? "free" : "active")}
                            </p>
                          </div>
                          <div className="rounded-[24px] border border-[#eadfff] bg-white/45 p-4 backdrop-blur">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7c62b1]">Renew date</p>
                            <p className="mt-2 text-xl font-black text-foreground">
                              {formatDate(currentSubscription?.renews_at || currentSubscription?.ends_at)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-[26px] border border-[#eadfff] bg-white/45 p-4 backdrop-blur">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <CreditStack className="h-6 w-6 text-[#4b2d82]" />
                              <div>
                                <p className="text-sm font-bold text-foreground">Credits</p>
                                <p className="text-xs text-muted-foreground">{creditAvailable} available of {creditTotal}</p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-[#4b2d82]">{creditUsed} used</p>
                          </div>
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eee7ff]">
                            <div
                              className="h-full rounded-full bg-[#2f165e] transition-all"
                              style={{ width: `${creditPercent}%` }}
                            />
                          </div>
                        </div>

                        {noCredits && (
                          <div className="mt-4 rounded-[24px] border border-[#2f165e]/20 bg-white/58 p-4 backdrop-blur">
                            <p className="text-sm font-black text-[#2f165e]">No credits left</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              Pick a Lemon Squeezy plan to keep converting handwritten images and PDF pages.
                            </p>
                          </div>
                        )}

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                          <Button
                            className="h-11 rounded-2xl bg-[#2f165e] text-white hover:bg-[#42207c]"
                            onClick={openBillingPortal}
                            disabled={!hasBillingPortal || billingAction === "portal"}
                          >
                            {billingAction === "portal" ? "Opening..." : "Manage billing"}
                          </Button>
                          <Button
                            variant="outline"
                            className="h-11 rounded-2xl border-[#d9c9fb] bg-white/55"
                            onClick={() => window.location.assign("/pricing")}
                          >
                            {noCredits ? "Buy credits" : "Compare plans"}
                          </Button>
                        </div>
                      </div>

                      <div className="border-t border-[#eadfff] bg-white/25 p-5 backdrop-blur lg:border-l lg:border-t-0 sm:p-6">
                        <div className="flex items-center gap-3">
                          <PlanSwitch className="h-7 w-7 shrink-0 text-[#4b2d82]" />
                          <div>
                            <h3 className="font-black text-foreground">Upgrade path</h3>
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
                              className="group flex w-full items-center justify-between gap-3 rounded-[22px] border border-[#eadfff] bg-white/48 p-4 text-left transition hover:border-[#bca7ef] hover:bg-white/65 disabled:cursor-wait disabled:opacity-70"
                            >
                              <span>
                                <span className="block text-sm font-black text-foreground">
                                  {plan.name} {plan.interval === "year" ? "annual" : "monthly"} · {plan.price_formatted}
                                </span>
                                <span className="mt-1 block text-xs text-muted-foreground">{plan.included_volume}</span>
                              </span>
                              <span className="h-2.5 w-2.5 rounded-full bg-[#7c3aed] shadow-[0_0_0_6px_rgba(124,58,237,0.12)] transition group-hover:scale-110" />
                            </button>
                          ))}
                        </div>

                        <div className="mt-5 rounded-[22px] border border-[#eadfff] bg-white/42 p-4 text-sm text-muted-foreground">
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

            {/* Preferences */}
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                {/* Processing Settings */}
                <Card className="ax-glass-card">
                  <CardHeader className="p-3 lg:p-4">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5 text-[#4b2d82]" />
                      <div>
                        <CardTitle>Processing Settings</CardTitle>
                        <CardDescription>Configure automatic actions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-3 lg:p-4">
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
                  </CardContent>
                </Card>

                {/* OCR Detection Language */}
                <Card className="ax-glass-card">
                  <CardHeader className="p-3 lg:p-4">
                    <div className="flex items-center gap-2">
                      <Languages className="h-5 w-5 text-[#4b2d82]" />
                      <div>
                        <CardTitle>OCR Detection Language</CardTitle>
                        <CardDescription>Set the language for text recognition</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-3 lg:p-4">
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

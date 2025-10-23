"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { AppIcon } from "@/components/AppIcon"
import { MobileNav } from "@/components/MobileNav"
import {
  User,
  Globe,
  ChevronLeft,
  Settings2,
  Moon,
  Sun,
  Laptop,
  Languages,
  KeyRound,
  Check,
  ShieldCheck
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type SettingsSection = 'account' | 'preferences'
type Theme = 'dark' | 'light' | 'system'

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { theme: currentTheme, setTheme } = useTheme()
  const supabase = createClient()

  const [activeSection, setActiveSection] = useState<SettingsSection>('account')
  const [loading, setLoading] = useState(false)

  // Account state
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")

  // Password state
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Preferences state
  const [language, setLanguage] = useState('en')
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch for theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load user data
  useEffect(() => {
    if (user) {
      setEmail(user.email || "")
      setFullName(user.user_metadata?.full_name || user.user_metadata?.name || "")
    }
  }, [user])

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

  // Update password
  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      // First verify the old password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: oldPassword
      })

      if (signInError) {
        throw new Error("Current password is incorrect")
      }

      // Now update to the new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast.success("Password updated successfully")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordChange(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    toast.success(`Language changed to ${newLanguage === 'en' ? 'English' : 'Français'}`)
    // In a real implementation, you would integrate with i18n library here
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    toast.success(`Theme changed to ${newTheme}`)
  }

  const sidebarSections = [
    {
      title: "Settings",
      items: [
        { id: 'account', label: 'Account', icon: User },
        { id: 'preferences', label: 'Preferences', icon: Settings2 },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-3 lg:px-4 py-3 lg:py-4">
          <div className="flex items-center gap-2 lg:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="shrink-0 h-8 w-8 lg:h-10 lg:w-10"
            >
              <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="hidden sm:block">
                <AppIcon size={28} className="lg:w-8 lg:h-8" />
              </div>
              <div>
                <h1 className="text-base lg:text-lg font-semibold flex items-center gap-2">
                  <Settings2 className="h-4 w-4 lg:hidden" />
                  Settings
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Manage your account and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-3 lg:px-4 py-4 lg:py-8">
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
            <Card className="bg-white dark:bg-white border-2 border-primary shadow-lg shadow-primary/10">
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
                <Card className="bg-white dark:bg-white border-2 border-primary shadow-lg shadow-primary/10">
                  <CardHeader className="p-3 lg:p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                      </div>
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

                {/* Security Settings */}
                <Card className="bg-white dark:bg-white border-2 border-primary shadow-lg shadow-primary/10">
                  <CardHeader className="p-3 lg:p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <ShieldCheck className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base lg:text-lg">Security</CardTitle>
                        <CardDescription className="text-xs lg:text-sm">Manage your password and security settings</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 lg:space-y-4 p-3 lg:p-4">
                    {!showPasswordChange ? (
                      <div className="flex items-center justify-between p-3 lg:p-4 rounded-lg border bg-muted/50">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <KeyRound className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs lg:text-sm font-medium">Password</p>
                            <p className="text-[10px] lg:text-xs text-muted-foreground">••••••••••••</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPasswordChange(true)}
                          className="h-8 lg:h-9 text-xs"
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Alert>
                          <ShieldCheck className="h-4 w-4" />
                          <AlertDescription>
                            Enter your current password and choose a new one. Password must be at least 6 characters.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="old-password">Current Password</Label>
                            <Input
                              id="old-password"
                              type="password"
                              placeholder="Enter current password"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                              id="new-password"
                              type="password"
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              placeholder="Confirm new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowPasswordChange(false)
                              setOldPassword("")
                              setNewPassword("")
                              setConfirmPassword("")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdatePassword}
                            disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                          >
                            {loading ? "Updating..." : "Update Password"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Preferences */}
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                {/* Appearance */}
                <Card className="bg-white dark:bg-white border-2 border-primary shadow-lg shadow-primary/10">
                  <CardHeader className="p-3 lg:p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Moon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Customize how Exceletto looks</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-3 lg:p-4">
                    <div className="space-y-3">
                      <Label>Theme</Label>
                      {mounted && (
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            onClick={() => handleThemeChange('light')}
                            className={cn(
                              "relative rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50",
                              currentTheme === 'light' ? "border-primary bg-primary/5" : "border-border"
                            )}
                          >
                            <Sun className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                            <p className="text-sm font-medium">Light</p>
                            {currentTheme === 'light' && (
                              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                          <button
                            onClick={() => handleThemeChange('dark')}
                            className={cn(
                              "relative rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50",
                              currentTheme === 'dark' ? "border-primary bg-primary/5" : "border-border"
                            )}
                          >
                            <Moon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                            <p className="text-sm font-medium">Dark</p>
                            {currentTheme === 'dark' && (
                              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                          <button
                            onClick={() => handleThemeChange('system')}
                            className={cn(
                              "relative rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50",
                              currentTheme === 'system' ? "border-primary bg-primary/5" : "border-border"
                            )}
                          >
                            <Laptop className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                            <p className="text-sm font-medium">System</p>
                            {currentTheme === 'system' && (
                              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Choose your preferred color theme
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Language & Region */}
                <Card className="bg-white dark:bg-white border-2 border-primary shadow-lg shadow-primary/10">
                  <CardHeader className="p-3 lg:p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Languages className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle>Language & Region</CardTitle>
                        <CardDescription>Set your preferred language</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-3 lg:p-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Display Language</Label>
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
                          <SelectItem value="fr">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>Français</span>
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
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        isAuthenticated={true}
        user={{
          email: user?.email,
          name: user?.user_metadata?.full_name
        }}
      />
    </div>
  )
}

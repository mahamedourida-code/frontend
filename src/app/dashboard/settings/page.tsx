"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { AppIcon } from "@/components/AppIcon"
import {
  User,
  CreditCard,
  Globe,
  Bell,
  Link2,
  CloudUpload,
  Key,
  Webhook,
  HardDrive,
  Download,
  Mail,
  Moon,
  Sun,
  Laptop,
  Languages,
  Clock,
  ChevronLeft,
  Settings2,
  Shield,
  Sparkles,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Check,
  X,
  HelpCircle,
  ExternalLink
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type SettingsSection = 'account' | 'security' | 'billing' | 'preferences' | 'integrations' | 'api' | 'storage'

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
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  
  // API state
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState("sk-proj-exceletto-1234567890abcdef")
  const [webhookUrl, setWebhookUrl] = useState("")
  
  // Preferences state
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('UTC')
  
  // Integrations state
  const [driveConnected, setDriveConnected] = useState(false)
  const [dropboxConnected, setDropboxConnected] = useState(false)
  const [onedriveConnected, setOnedriveConnected] = useState(false)
  
  // Storage state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)
  const [retentionDays, setRetentionDays] = useState("30")
  const [autoDownload, setAutoDownload] = useState(false)
  const [emailResults, setEmailResults] = useState(false)

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
    if (!oldPassword) {
      toast.error("Please enter your current password")
      return
    }
    if (!newPassword) {
      toast.error("Please enter a new password")
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
    } catch (error: any) {
      toast.error(error.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  // Save preferences
  const handleSavePreferences = async () => {
    setLoading(true)
    try {
      // Save language preference to user metadata
      const { error } = await supabase.auth.updateUser({
        data: { language, timezone }
      })
      
      if (error) throw error
      
      toast.success("Preferences saved successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to save preferences")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast.success("API key copied to clipboard")
  }

  const handleRegenerateApiKey = () => {
    toast.success("New API key generated")
    setApiKey("sk-proj-exceletto-" + Math.random().toString(36).substring(2, 15))
  }

  const sidebarSections = [
    {
      title: "User & authentication",
      items: [
        { id: 'account', label: 'Account Settings', icon: User },
      ]
    },
    {
      title: "Subscription",
      items: [
        { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
      ]
    },
    {
      title: "Customization",
      items: [
        { id: 'preferences', label: 'Preferences', icon: Settings2 },
      ]
    },
    {
      title: "Connections",
      items: [
        { id: 'integrations', label: 'Integrations', icon: Link2 },
        { id: 'api', label: 'API & Webhooks', icon: Key },
      ]
    },
    {
      title: "Data management",
      items: [
        { id: 'storage', label: 'Storage & Export', icon: HardDrive },
      ]
    }
  ]

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur">
          <div className="container max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/dashboard')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <AppIcon size={32} />
                <div>
                  <h1 className="text-lg font-semibold">Settings</h1>
                  <p className="text-xs text-muted-foreground">Manage your account and preferences</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-8">
            {/* Vertical Navigation */}
            <nav className="w-72 space-y-6">
              {sidebarSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-1">
                  <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id as SettingsSection)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                            activeSection === item.id
                              ? "bg-accent text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Main Content */}
            <div className="flex-1">
              {/* Account Settings */}
              {activeSection === 'account' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <CardTitle>Account Settings</CardTitle>
                    </div>
                    <CardDescription>
                      Manage your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullname">Full Name</Label>
                        <Input 
                          id="fullname" 
                          placeholder="Enter your full name" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setFullName(user?.user_metadata?.full_name || "")}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>

                    <Separator className="my-6" />

                    {/* Password Change Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Change Password</h3>
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
                          <p className="text-xs text-muted-foreground">
                            Minimum 6 characters
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={handleUpdatePassword}
                        disabled={loading || !oldPassword || !newPassword}
                      >
                        {loading ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}



              {/* Billing & Subscription */}
              {activeSection === 'billing' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <CardTitle>Billing & Subscription</CardTitle>
                    </div>
                    <CardDescription>
                      Manage your subscription plan and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Plan */}
                    <div className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">Free Plan</h3>
                            <Badge variant="secondary">Current Plan</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">80 images per month • 1 credit per image</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">$0</p>
                          <p className="text-xs text-muted-foreground">per month</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Credits used this month</span>
                        <span className="font-medium">45 / 80</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Billing cycle resets</span>
                        <span className="font-medium">Feb 1, 2025</span>
                      </div>
                    </div>

                    {/* Upgrade Options */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">Upgrade Your Plan</h3>
                      <div className="grid gap-4">
                        <div className="rounded-lg border p-4 hover:border-primary transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">Pro Plan</h4>
                                <Badge variant="default">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Popular
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">500 images per month • Priority processing</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold">$19</p>
                              <p className="text-xs text-muted-foreground">per month</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg border p-4 hover:border-primary transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">Enterprise Plan</h4>
                              <p className="text-sm text-muted-foreground">Unlimited images • API access • Custom integrations</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold">$99</p>
                              <p className="text-xs text-muted-foreground">per month</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Payment Methods */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">Payment Methods</h3>
                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">No payment methods added</p>
                        <Button variant="outline" className="mt-3" size="sm">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Add Payment Method
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preferences */}
              {activeSection === 'preferences' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5 text-primary" />
                      <CardTitle>Preferences</CardTitle>
                    </div>
                    <CardDescription>
                      Customize your experience with language and theme settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Language & Locale */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Language & Locale
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger id="language">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <Select value={timezone} onValueChange={setTimezone}>
                            <SelectTrigger id="timezone">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="EST">Eastern Time</SelectItem>
                              <SelectItem value="PST">Pacific Time</SelectItem>
                              <SelectItem value="CET">Central European Time</SelectItem>
                              <SelectItem value="JST">Japan Standard Time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Theme */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Appearance
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setTheme('light')}
                          className={cn(
                            "relative rounded-lg border-2 p-3 text-sm transition-colors",
                            currentTheme === 'light' ? "border-primary" : "border-border"
                          )}
                        >
                          <Sun className="h-5 w-5 mx-auto mb-2" />
                          <p className="font-medium">Light</p>
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={cn(
                            "relative rounded-lg border-2 p-3 text-sm transition-colors",
                            currentTheme === 'dark' ? "border-primary" : "border-border"
                          )}
                        >
                          <Moon className="h-5 w-5 mx-auto mb-2" />
                          <p className="font-medium">Dark</p>
                        </button>
                        <button
                          onClick={() => setTheme('system')}
                          className={cn(
                            "relative rounded-lg border-2 p-3 text-sm transition-colors",
                            currentTheme === 'system' ? "border-primary" : "border-border"
                          )}
                        >
                          <Laptop className="h-5 w-5 mx-auto mb-2" />
                          <p className="font-medium">System</p>
                        </button>
                      </div>
                    </div>



                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setLanguage(user?.user_metadata?.language || 'en')
                          setTimezone(user?.user_metadata?.timezone || 'UTC')
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSavePreferences}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Preferences"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}



              {/* Integrations */}
              {activeSection === 'integrations' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-primary" />
                      <CardTitle>Integrations</CardTitle>
                    </div>
                    <CardDescription>
                      Connect your favorite services and manage API access
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Cloud Storage */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <CloudUpload className="h-4 w-4" />
                        Cloud Storage
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <CloudUpload className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Google Drive</p>
                              <p className="text-xs text-muted-foreground">
                                {driveConnected ? "Connected" : "Not connected"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={driveConnected ? "outline" : "default"}
                            size="sm"
                            onClick={() => setDriveConnected(!driveConnected)}
                          >
                            {driveConnected ? "Disconnect" : "Connect"}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                              <CloudUpload className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium">Dropbox</p>
                              <p className="text-xs text-muted-foreground">
                                {dropboxConnected ? "Connected" : "Not connected"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={dropboxConnected ? "outline" : "default"}
                            size="sm"
                            onClick={() => setDropboxConnected(!dropboxConnected)}
                          >
                            {dropboxConnected ? "Disconnect" : "Connect"}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                              <CloudUpload className="h-5 w-5 text-cyan-600" />
                            </div>
                            <div>
                              <p className="font-medium">OneDrive</p>
                              <p className="text-xs text-muted-foreground">
                                {onedriveConnected ? "Connected" : "Not connected"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={onedriveConnected ? "outline" : "default"}
                            size="sm"
                            onClick={() => setOnedriveConnected(!onedriveConnected)}
                          >
                            {onedriveConnected ? "Disconnect" : "Connect"}
                          </Button>
                        </div>
                      </div>
                    </div>


                  </CardContent>
                </Card>
              )}

              {/* API & Webhooks */}
              {activeSection === 'api' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" />
                      <CardTitle>API & Webhooks</CardTitle>
                    </div>
                    <CardDescription>
                      Manage API access and webhook configurations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* API Access */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">API Access</h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input
                                type={showApiKey ? "text" : "password"}
                                value={apiKey}
                                readOnly
                                className="pr-20"
                              />
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setShowApiKey(!showApiKey)}
                                >
                                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={handleCopyApiKey}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <Button variant="outline" onClick={handleRegenerateApiKey}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Use this API key to authenticate your requests
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Webhooks */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Webhook URLs</h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="webhook">Webhook Endpoint</Label>
                          <div className="flex gap-2">
                            <Input
                              id="webhook"
                              placeholder="https://your-domain.com/webhook"
                              value={webhookUrl}
                              onChange={(e) => setWebhookUrl(e.target.value)}
                            />
                            <Button variant="outline">Test</Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Receive real-time notifications when processing completes
                          </p>
                        </div>
                        <div className="rounded-lg border bg-muted/50 p-4">
                          <h4 className="text-sm font-medium mb-2">Webhook Events</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Checkbox id="webhook-complete" defaultChecked />
                              <Label htmlFor="webhook-complete" className="text-sm font-normal">
                                Processing Complete
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox id="webhook-failed" defaultChecked />
                              <Label htmlFor="webhook-failed" className="text-sm font-normal">
                                Processing Failed
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox id="webhook-credits" />
                              <Label htmlFor="webhook-credits" className="text-sm font-normal">
                                Low Credit Alert
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Rate Limits */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Rate Limits</h3>
                      <div className="rounded-lg border p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Requests per minute</span>
                          <span className="font-medium">60</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Concurrent uploads</span>
                          <span className="font-medium">5</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Max file size</span>
                          <span className="font-medium">10 MB</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline">Cancel</Button>
                      <Button>Save API Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Storage & Export */}
              {activeSection === 'storage' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5 text-primary" />
                      <CardTitle>Storage & Export</CardTitle>
                    </div>
                    <CardDescription>
                      Configure automatic file handling and retention policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Auto-save */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <CloudUpload className="h-4 w-4" />
                        Auto-save to Cloud
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Enable Auto-save</Label>
                            <p className="text-xs text-muted-foreground">
                              Automatically save processed files to connected cloud storage
                            </p>
                          </div>
                          <Switch checked={autoSaveEnabled} onCheckedChange={setAutoSaveEnabled} />
                        </div>
                        {autoSaveEnabled && (
                          <div className="ml-6 space-y-2">
                            <Label htmlFor="save-location">Save Location</Label>
                            <Select defaultValue="drive">
                              <SelectTrigger id="save-location">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="drive" disabled={!driveConnected}>
                                  Google Drive {!driveConnected && "(Not connected)"}
                                </SelectItem>
                                <SelectItem value="dropbox" disabled={!dropboxConnected}>
                                  Dropbox {!dropboxConnected && "(Not connected)"}
                                </SelectItem>
                                <SelectItem value="onedrive" disabled={!onedriveConnected}>
                                  OneDrive {!onedriveConnected && "(Not connected)"}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Retention Policy */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Retention Policy
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="retention">Delete processed files after</Label>
                        <Select value={retentionDays} onValueChange={setRetentionDays}>
                          <SelectTrigger id="retention">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="14">14 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Automatically remove old files to save storage space
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Export Options */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export Options
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Auto-download after conversion</Label>
                            <p className="text-xs text-muted-foreground">
                              Automatically start download when processing completes
                            </p>
                          </div>
                          <Switch checked={autoDownload} onCheckedChange={setAutoDownload} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Send results via email</Label>
                            <p className="text-xs text-muted-foreground">
                              Email processed files as attachments
                            </p>
                          </div>
                          <Switch checked={emailResults} onCheckedChange={setEmailResults} />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline">Cancel</Button>
                      <Button>Save Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

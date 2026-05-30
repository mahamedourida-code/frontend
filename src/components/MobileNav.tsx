"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { AppLogo } from "@/components/AppIcon"
import { BillingSeal } from "@/components/BillingGlyphs"
import { ThemeToggle } from "@/components/theme-toggle"
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher"
import {
  Menu,
  ChevronRight,
  Home,
  LogIn,
  Activity,
  Upload,
  History,
  Settings,
  LogOut,
  FileText,
  LayoutDashboard,
  ReceiptText,
  Building2,
  Inbox,
  BookOpen,
  Download,
  Eye,
  FolderOpen,
  Layers,
  Link2,
  ArrowUpRight,
  ScanLine,
  Users,
  Workflow,
} from "lucide-react"

interface MobileNavProps {
  isAuthenticated?: boolean
  onSectionClick?: (sectionId: string) => void
  onSignInClick?: () => void
  user?: any
}

type NavIcon = React.ComponentType<{ className?: string }>

type MobileNavItem = {
  label: string
  href?: string
  sectionId?: string
  icon: NavIcon
  show?: boolean
  children?: Array<{
    label: string
    href: string
    icon?: NavIcon
    iconSrc?: string
    description?: string
  }>
}

export function MobileNav({ isAuthenticated = false, onSectionClick, onSignInClick, user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [bookkeepersOpen, setBookkeepersOpen] = useState(false)
  const [practicesOpen, setPracticesOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === "converter") {
      router.push("/dashboard/client")
      setIsOpen(false)
      return
    }

    if (pathname === "/" && onSectionClick) {
      onSectionClick(sectionId)
    } else {
      router.push(`/#${sectionId}`)
    }
    setIsOpen(false)
  }

  const handleSignOut = async () => {
    const { signOut } = await import("@/lib/auth-helpers")
    try {
      await signOut()
    } finally {
      window.location.replace("/")
    }
  }

  const mainNavItems: MobileNavItem[] = [
    {
      label: "Convert Files",
      href: "/dashboard/client",
      icon: Upload,
      show: isAuthenticated
    },
    {
      label: "Overview",
      href: "/dashboard",
      icon: Activity,
      show: isAuthenticated
    },
    {
      label: "History",
      href: "/history",
      icon: History,
      show: isAuthenticated
    },
    {
      label: "Accounts Payable",
      href: "/dashboard/accounts-payable",
      icon: ReceiptText,
      show: isAuthenticated
    },
    {
      label: "Inbox",
      href: "/dashboard/inbox",
      icon: Inbox,
      show: isAuthenticated
    },
    {
      label: "Integrations",
      href: "/dashboard/integrations",
      icon: Building2,
      show: isAuthenticated
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      show: isAuthenticated
    },
    {
      label: "Pricing",
      href: "/pricing",
      icon: BillingSeal,
      show: isAuthenticated
    },
    // Non-Authenticated User Menu
    {
      label: "Home",
      href: "/",
      icon: Home,
      show: !isAuthenticated
    },
    {
      label: "Try It",
      sectionId: "converter",
      icon: Upload,
      show: !isAuthenticated
    },
    {
      label: "For Bookkeepers",
      icon: Eye,
      show: !isAuthenticated,
      children: [
        { label: "Document extraction", href: "/dashboard/client", icon: ScanLine, description: "Invoices, receipts, bank statements, handwritten" },
        { label: "Review board", href: "/dashboard/client", icon: Eye, description: "Source image + editable cells side by side" },
        { label: "Mixed batch auto-detect", href: "/dashboard/auto-detect", icon: Layers, description: "Drop a whole folder — each file classified" },
        { label: "Export to Excel / CSV", href: "/dashboard/client", icon: Download, description: "One file or full batch, clean output" },
        { label: "QuickBooks publishing", href: "/dashboard/integrations", icon: ArrowUpRight, description: "Draft Bill posted with original doc attached" },
        { label: "Client upload links", href: "/dashboard/inbox", icon: Link2, description: "Clients submit without an account" },
      ]
    },
    {
      label: "For Accounting Practices",
      icon: Users,
      show: !isAuthenticated,
      children: [
        { label: "Batch processing", href: "/dashboard/client", icon: FolderOpen, description: "Up to 50 files, mixed types, one job" },
        { label: "Team reviewer access", href: "/dashboard/settings", icon: Users, description: "Invite colleagues — they review, you publish" },
        { label: "AP queue + QuickBooks", href: "/dashboard/accounts-payable", icon: ReceiptText, description: "Code, approve, and bulk-publish bills" },
        { label: "Vendor memory rules", href: "/dashboard/settings", icon: BookOpen, description: "Auto-fill coding for recurring suppliers" },
        { label: "Inbox & client intake", href: "/dashboard/inbox", icon: Inbox, description: "Watch folder, email forwarding, intake links" },
        { label: "Workflows", href: "/dashboard/workflows", icon: Workflow, description: "Routing rules for multi-step review" },
      ]
    },
    {
      label: "Pricing",
      href: "/pricing",
      icon: BillingSeal,
      show: !isAuthenticated
    },
    {
      label: "Blog",
      href: "/blogs",
      icon: FileText,
      show: !isAuthenticated
    }
  ]

  const bottomNavItems: Array<{
    label: string
    icon: NavIcon
    active: boolean
    onClick: () => void
  }> = isAuthenticated
    ? [
        { label: "Convert", icon: Upload, active: pathname === "/dashboard/client", onClick: () => handleNavigation("/dashboard/client") },
        { label: "Overview", icon: LayoutDashboard, active: pathname === "/dashboard", onClick: () => handleNavigation("/dashboard") },
        { label: "History", icon: History, active: pathname === "/history", onClick: () => handleNavigation("/history") },
      ]
    : [
        { label: "Home", icon: Home, active: pathname === "/", onClick: () => handleNavigation("/") },
        { label: "Try It", icon: Upload, active: false, onClick: () => handleSectionClick("converter") },
        { label: "Pricing", icon: BillingSeal, active: pathname === "/pricing", onClick: () => handleNavigation("/pricing") },
      ]

  return (
    <>
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-xl lg:hidden",
          isAuthenticated
            ? "border-border bg-background/95 shadow-sm"
            : "border-border bg-background/95 shadow-sm"
        )}
        style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto grid h-16 max-w-md grid-cols-4 items-center gap-1 px-2 pt-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                aria-current={item.active ? "page" : undefined}
                onClick={item.onClick}
                className={cn(
                  "ax-interactive h-14 min-w-0 flex-col gap-1 rounded-2xl px-1.5 text-[10px] font-semibold",
                  isAuthenticated
                    ? item.active
                      ? "bg-accent text-accent-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    : item.active
                      ? "bg-accent text-accent-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="w-full truncate leading-none">{item.label}</span>
              </Button>
            )
          })}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost"
                size="sm" 
                className={cn(
                  "ax-interactive h-14 min-w-0 flex-col gap-1 rounded-2xl px-1.5 text-[10px] font-semibold",
                  isAuthenticated
                    ? isOpen
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    : isOpen
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Menu className="h-5 w-5" />
                <span className="w-full truncate leading-none">Menu</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent 
              side="right" 
              className={cn(
                "flex h-dvh w-[88vw] max-w-[390px] flex-col border-l bg-background/95 p-0 backdrop-blur-xl sm:w-[380px]",
                "border-border"
              )}
            >
              <SheetHeader className={cn(
                "border-b px-4 py-4",
                "border-border bg-background"
              )}>
                <div className="flex items-center gap-2">
                  <SheetTitle className="sr-only">AxLiner</SheetTitle>
                  <AppLogo className="h-7 w-auto" />
                  <div className="ms-auto">
                    <ThemeToggle />
                  </div>
                </div>
              </SheetHeader>

              {/* User Info - if authenticated */}
              {isAuthenticated && user && (
                <div className="border-b border-border px-3 py-3">
                  <WorkspaceSwitcher user={user} onSignOut={() => void handleSignOut()} menuSide="bottom" />
                </div>
              )}

              {isAuthenticated && (
                <div className="border-b border-border px-3 py-3">
                  <Button
                    variant="glossy"
                    className="mx-auto h-10 w-[11.25rem] justify-center font-bold"
                    onClick={() => handleNavigation("/dashboard/client#upload-files")}
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </div>
              )}

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto py-3">
                <nav className="space-y-1 px-3">
                  {mainNavItems
                    .filter(item => item.show !== false)
                    .map((item, index) => {
                      if (item.children) {
                        const isBookkeepers = item.label === "For Bookkeepers"
                        const isPractices = item.label === "For Accounting Practices"
                        const isOpen = isBookkeepers ? bookkeepersOpen : isPractices ? practicesOpen : false
                        const setOpen = isBookkeepers ? setBookkeepersOpen : isPractices ? setPracticesOpen : () => {}
                        return (
                          <Collapsible
                            key={index}
                            open={isOpen}
                            onOpenChange={setOpen}
                          >
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "h-11 w-full justify-start gap-3 rounded-2xl px-3",
                                  isAuthenticated
                                    ? "ax-interactive text-foreground hover:bg-accent hover:text-accent-foreground"
                                    : "ax-interactive text-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                {item.icon && <item.icon className="h-5 w-5" />}
                                <span className="flex-1 text-left text-sm md:text-base">{item.label}</span>
                                <ChevronRight
                                  className={cn(
                                    "h-4 w-4 transition-transform",
                                    isOpen && "rotate-90"
                                  )}
                                />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-1 pl-4 pr-2">
                              {item.children.map((child, childIndex) => (
                                <Button
                                  key={childIndex}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleNavigation(child.href)}
                                  className={cn(
                                    "w-full justify-start h-auto py-2 px-3",
                                    "ax-interactive rounded-2xl hover:bg-accent",
                                    pathname === child.href && "bg-accent"
                                  )}
                                >
                                  <div className="flex items-start gap-2 w-full">
                                    {child.icon && (
                                      <child.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    )}
                                    {child.iconSrc && (
                                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-background p-1">
                                        <img src={child.iconSrc} alt="" className="h-full w-full object-contain" />
                                      </span>
                                    )}
                                    <div className="flex-1 text-left">
                                      <p className="text-sm font-medium leading-none">
                                        {child.label}
                                      </p>
                                      {child.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {child.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </Button>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        )
                      }

                      return (
                        <Button
                          key={index}
                          variant="ghost"
                          onClick={() => item.sectionId ? handleSectionClick(item.sectionId) : item.href && handleNavigation(item.href)}
                          className={cn(
                            "h-11 w-full justify-start gap-3 rounded-2xl px-3",
                            isAuthenticated
                              ? "ax-interactive text-foreground hover:bg-accent hover:text-accent-foreground"
                              : "ax-interactive text-foreground hover:bg-accent hover:text-accent-foreground",
                            pathname === item.href && "bg-accent"
                          )}
                        >
                          {item.icon && <item.icon className="h-5 w-5" />}
                          <span className="flex-1 text-left text-sm md:text-base">{item.label}</span>
                        </Button>
                      )
                    })}
                </nav>

              </div>

              {/* Footer Actions */}
              <div className={cn(
                "mt-auto space-y-2 border-t p-3",
                isAuthenticated ? "border-border bg-muted/40" : "border-border bg-muted/40"
              )}>
                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    className="h-11 w-full gap-3 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      void handleSignOut()
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm md:text-base">Sign Out</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ink"
                      className="h-11 w-full gap-3 rounded-xl text-base font-semibold"
                      onClick={() => {
                        setIsOpen(false);
                        handleNavigation("/sign-up?next=%2Fdashboard%2Fclient");
                      }}
                    >
                      <LogIn className="h-5 w-5" />
                      <span className="text-sm md:text-base">Create account</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-11 w-full gap-3 rounded-xl text-base font-medium"
                      onClick={() => {
                        setIsOpen(false);
                        if (onSignInClick) {
                          onSignInClick();
                        } else {
                          handleNavigation("/sign-in?next=%2Fdashboard%2Fclient");
                        }
                      }}
                    >
                      <LogIn className="h-5 w-5" />
                      <span className="text-sm md:text-base">Sign in</span>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* FAB — upload shortcut, authenticated only */}
      {isAuthenticated && (
        <motion.div
          className="lg:hidden"
          style={{
            position: "fixed",
            bottom: "calc(4.75rem + env(safe-area-inset-bottom) + 16px)",
            right: 16,
            zIndex: 50,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 }}
        >
          <motion.button
            aria-label="Upload files"
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsOpen(false)
              router.push("/dashboard/client#upload-files")
            }}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
              boxShadow: "0 4px 20px hsl(var(--primary) / 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Upload className="h-6 w-6 text-white" />
          </motion.button>
        </motion.div>
      )}

      {/* Add padding to body content to account for fixed bottom nav */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          body {
            padding-bottom: calc(4.75rem + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </>
  )
}

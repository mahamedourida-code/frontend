"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
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
  audienceSolutionGroups,
  audienceSolutionHref,
  getAudienceSolutionBySlug,
  primaryAudienceSlugs,
} from "@/lib/audience-solutions"
import {
  Menu,
  BookCheck,
  ChevronRight,
  Home,
  LogIn,
  Activity,
  Upload,
  Settings,
  LogOut,
  FileText,
  ReceiptText,
  Building2,
  Inbox,
  Users,
  ScanLine,
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
    group?: string
  }>
}

export function MobileNav({ isAuthenticated = false, onSectionClick, onSignInClick, user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [audiencesOpen, setAudiencesOpen] = useState(false)
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

  const publicAudienceChildren = [
    ...primaryAudienceSlugs.map((slug) => {
      const solution = getAudienceSolutionBySlug(slug)
      return {
        label: solution.menuLabel,
        href: audienceSolutionHref(slug),
        icon: Users,
        group: "Choose your fit",
      }
    }),
    ...audienceSolutionGroups.flatMap((group) =>
      group.slugs.map((slug) => {
        const solution = getAudienceSolutionBySlug(slug)
        return {
          label: solution.menuLabel,
          href: audienceSolutionHref(slug),
          icon: group.icon,
          group: group.label,
        }
      }),
    ),
  ]

  const mainNavItems: MobileNavItem[] = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home,
      show: isAuthenticated
    },
    {
      label: "Clients",
      href: "/dashboard/clients",
      icon: Users,
      show: isAuthenticated
    },
    {
      label: "Activity",
      href: "/history",
      icon: Activity,
      show: isAuthenticated
    },
    {
      label: "Inbox",
      href: "/dashboard/inbox",
      icon: Inbox,
      show: isAuthenticated
    },
    {
      label: "Review",
      href: "/dashboard/client",
      icon: BookCheck,
      show: isAuthenticated
    },
    {
      label: "Accounts payable",
      href: "/dashboard/accounts-payable",
      icon: ReceiptText,
      show: isAuthenticated
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
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
      label: "For Accountants & Bookkeepers",
      icon: Users,
      show: !isAuthenticated,
      children: publicAudienceChildren,
    },
    {
      label: "Integrations",
      href: "/integrations",
      icon: Building2,
      show: !isAuthenticated
    },
    {
      label: "OCR",
      href: "/ocr",
      icon: ScanLine,
      show: !isAuthenticated
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
        { label: "Home", icon: Home, active: pathname === "/dashboard", onClick: () => handleNavigation("/dashboard") },
        { label: "Review", icon: BookCheck, active: pathname === "/dashboard/client", onClick: () => handleNavigation("/dashboard/client") },
        { label: "Inbox", icon: Inbox, active: pathname === "/dashboard/inbox", onClick: () => handleNavigation("/dashboard/inbox") },
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
          "fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-xl",
          isAuthenticated ? "md:hidden" : "lg:hidden",
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
                    Upload documents
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
                        return (
                          <Collapsible
                            key={index}
                            open={audiencesOpen}
                            onOpenChange={setAudiencesOpen}
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
                                    audiencesOpen && "rotate-90"
                                  )}
                                />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-1 pl-4 pr-2">
                              {item.children.map((child, childIndex) => {
                                const previousGroup = item.children?.[childIndex - 1]?.group
                                const showGroup = child.group && child.group !== previousGroup

                                return (
                                  <React.Fragment key={child.href}>
                                    {showGroup && (
                                      <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-800">
                                        {child.group}
                                      </p>
                                    )}
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="sm"
                                      className={cn(
                                        "h-auto w-full justify-start rounded-full px-3 py-2",
                                        "ax-interactive hover:bg-accent",
                                        pathname === child.href && "bg-accent"
                                      )}
                                    >
                                      <Link href={child.href} onClick={() => setIsOpen(false)}>
                                        <div className="flex w-full items-center gap-2">
                                          {child.icon && (
                                            <child.icon className="h-4 w-4 text-muted-foreground" />
                                          )}
                                          <p className="flex-1 text-left text-sm font-medium leading-none">
                                            {child.label}
                                          </p>
                                        </div>
                                      </Link>
                                    </Button>
                                  </React.Fragment>
                                )
                              })}
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

      {/* Add padding to body content to account for fixed bottom nav */}
      <style jsx global>{`
        @media (max-width: ${isAuthenticated ? "767px" : "1023px"}) {
          body {
            padding-bottom: calc(4.75rem + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </>
  )
}

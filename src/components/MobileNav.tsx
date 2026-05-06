"use client"

import React, { useState, useEffect } from "react"
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
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AppIcon } from "@/components/AppIcon"
import { BillingSeal } from "@/components/BillingGlyphs"
import { industrySolutions } from "@/lib/industry-solutions"
import { 
  Menu, 
  ChevronRight,
  Home,
  Target, 
  LogIn,
  Activity,
  Upload,
  History,
  Settings,
  LogOut,
  HelpCircle,
  FileSpreadsheet,
  LayoutDashboard
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
  const [solutionsOpen, setSolutionsOpen] = useState(false)
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
    if (pathname === "/" && onSectionClick) {
      onSectionClick(sectionId)
    } else {
      router.push(`/#${sectionId}`)
    }
    setIsOpen(false)
  }

  const mainNavItems: MobileNavItem[] = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: Activity,
      show: isAuthenticated
    },
    {
      label: "Process Images",
      href: "/dashboard/client",
      icon: Upload,
      show: isAuthenticated
    },
    {
      label: "History",
      href: "/history",
      icon: History,
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
      label: "Pricing",
      href: "/pricing",
      icon: BillingSeal,
      show: !isAuthenticated
    },
    {
      label: "Solutions",
      icon: FileSpreadsheet,
      show: !isAuthenticated,
      children: industrySolutions.map((solution) => ({
        label: solution.title,
        href: `/solutions/${solution.slug}`,
        iconSrc: solution.cardAsset,
        description: solution.eyebrow
      }))
    }
  ]

  const bottomNavItems: Array<{
    label: string
    icon: NavIcon
    active: boolean
    onClick: () => void
  }> = isAuthenticated
    ? [
        { label: "Dashboard", icon: LayoutDashboard, active: pathname === "/dashboard", onClick: () => handleNavigation("/dashboard") },
        { label: "Process", icon: Upload, active: pathname === "/dashboard/client", onClick: () => handleNavigation("/dashboard/client") },
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
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#eadfff] bg-[#E9ECE4]/95 shadow-[0_-18px_45px_rgba(68,31,132,0.12)] backdrop-blur-xl lg:hidden"
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
                  "h-14 min-w-0 flex-col gap-1 rounded-2xl px-1.5 text-[10px] font-semibold transition-all",
                  item.active
                    ? "bg-[#2f165e] text-white shadow-[0_12px_28px_rgba(68,31,132,0.22)] hover:bg-[#2f165e] hover:text-white"
                    : "text-[#4b2d82] hover:bg-white/55 hover:text-[#2f165e]"
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
                  "h-14 min-w-0 flex-col gap-1 rounded-2xl px-1.5 text-[10px] font-semibold transition-all",
                  isOpen ? "bg-[#2f165e] text-white" : "text-[#4b2d82] hover:bg-white/55 hover:text-[#2f165e]"
                )}
              >
                <Menu className="h-5 w-5" />
                <span className="w-full truncate leading-none">Menu</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent 
              side="right" 
              className="flex h-dvh w-[88vw] max-w-[390px] flex-col border-l border-[#eadfff] bg-white/95 p-0 backdrop-blur-xl sm:w-[380px]"
            >
              <SheetHeader className="border-b border-[#eadfff] bg-[#E9ECE4]/75 px-4 py-4">
                <div className="flex items-center gap-2">
                  <AppIcon size={32} />
                  <SheetTitle className="text-base md:text-lg font-bold">AxLiner</SheetTitle>
                </div>
              </SheetHeader>

              {/* User Info - if authenticated */}
              {isAuthenticated && user && (
                <div className="border-b border-[#eadfff] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-[#2f165e] text-white flex items-center justify-center">
                        <span className="text-sm md:text-base font-semibold text-white">
                          {user.email?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name || user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {user.credits !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {user.credits} credits
                      </Badge>
                    )}
                  </div>
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
                            open={solutionsOpen}
                            onOpenChange={setSolutionsOpen}
                          >
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "h-11 w-full justify-start gap-3 rounded-2xl px-3",
                                  "hover:bg-white/60 hover:text-[#2f165e]",
                                  "transition-colors text-[#2f165e]"
                                )}
                              >
                                {item.icon && <item.icon className="h-5 w-5" />}
                                <span className="flex-1 text-left text-sm md:text-base">{item.label}</span>
                                <ChevronRight 
                                  className={cn(
                                    "h-4 w-4 transition-transform",
                                    solutionsOpen && "rotate-90"
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
                                    "rounded-2xl hover:bg-white/55 transition-colors",
                                    pathname === child.href && "bg-white/70"
                                  )}
                                >
                                  <div className="flex items-start gap-2 w-full">
                                    {child.icon && (
                                      <child.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    )}
                                    {child.iconSrc && (
                                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/55 p-1">
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
                            "hover:bg-white/60 hover:text-[#2f165e]",
                            "transition-colors text-[#2f165e]",
                            pathname === item.href && "bg-white/70"
                          )}
                        >
                          {item.icon && <item.icon className="h-5 w-5" />}
                          <span className="flex-1 text-left text-sm md:text-base">{item.label}</span>
                        </Button>
                      )
                    })}
                </nav>

                {/* Quick Links Section */}
                {!isAuthenticated && (
                  <>
                    <Separator className="my-3 bg-[#eadfff]" />
                    <div className="px-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d79bb] mb-2">
                        Quick Links
                      </p>
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSectionClick("features")}
                          className="h-10 w-full justify-start gap-3 rounded-2xl px-2 hover:bg-white/55"
                        >
                          <Target className="h-5 w-5" />
                          <span className="text-sm md:text-base">Features</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSectionClick("benchmarks")}
                          className="h-10 w-full justify-start gap-3 rounded-2xl px-2 hover:bg-white/55"
                        >
                          <HelpCircle className="h-5 w-5" />
                          <span className="text-sm md:text-base">Benchmarks</span>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Actions */}
              <div className="mt-auto space-y-2 border-t border-[#eadfff] bg-[#E9ECE4]/60 p-3">
                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    className="h-11 w-full gap-3 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      // Handle logout
                      handleNavigation("/signout")
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm md:text-base">Sign Out</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="h-11 w-full gap-3 rounded-2xl border-[#d9c9fb] bg-white/60"
                    onClick={() => {
                      setIsOpen(false);
                      onSignInClick?.();
                    }}
                  >
                    <LogIn className="h-5 w-5" />
                    <span className="text-sm md:text-base">Sign In</span>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

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

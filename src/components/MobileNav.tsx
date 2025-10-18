"use client"

import React, { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
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
import { ThemeToggle } from "@/components/theme-toggle"
import { AppIcon } from "@/components/AppIcon"
import { 
  Menu, 
  X,
  ChevronRight,
  Home,
  PenTool, 
  FileInput, 
  Target, 
  DollarSign,
  TrendingUp,
  LogIn,
  UserPlus,
  Activity,
  Upload,
  History,
  Settings,
  LogOut,
  HelpCircle,
  FileSpreadsheet,
  Building2,
  LayoutDashboard
} from "lucide-react"

interface MobileNavProps {
  isAuthenticated?: boolean
  onSectionClick?: (sectionId: string) => void
  user?: any
}

export function MobileNav({ isAuthenticated = false, onSectionClick, user }: MobileNavProps) {
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
    if (onSectionClick) {
      onSectionClick(sectionId)
    } else {
      window.location.href = `/#${sectionId}`
    }
    setIsOpen(false)
  }

  const mainNavItems = [
    // Authenticated User Menu
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: isAuthenticated,
      badge: user?.credits ? `${user.credits} credits` : null
    },
    {
      label: "Upload Images",
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
    // Non-Authenticated User Menu
    {
      label: "Home",
      href: "/",
      icon: Home,
      show: !isAuthenticated
    },
    {
      label: "Pricing",
      href: "/pricing",
      icon: DollarSign,
      show: !isAuthenticated
    },
    {
      label: "Solutions",
      icon: FileSpreadsheet,
      show: !isAuthenticated,
      children: [
        {
          label: "Handwritten Tables",
          href: "/solutions/handwritten-tables",
          icon: PenTool,
          description: "Convert handwritten tables"
        },
        {
          label: "Paper Forms",
          href: "/solutions/paper-forms",
          icon: FileInput,
          description: "Digitize paper forms"
        }
      ]
    }
  ]

  return (
    <>
      {/* Enhanced Mobile Navigation - Fixed bottom bar with icon-based navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-lg border-t shadow-lg">
        <div className="flex items-center justify-around px-2 h-16">
          {/* Home Button */}
          <Button
            variant={pathname === "/" ? "default" : "ghost"}
            size="sm"
            onClick={() => router.push("/")}
            className="flex-col h-14 px-3 gap-1 flex-1 max-w-[72px]"
          >
            <Home className={cn("h-5 w-5", pathname === "/" ? "text-primary-foreground" : "")} />
            <span className="text-[10px] font-medium">Home</span>
          </Button>

          {/* Upload/Dashboard Button */}
          <Button
            variant={pathname.startsWith("/dashboard") ? "default" : "ghost"}
            size="sm"
            onClick={() => router.push(isAuthenticated ? "/dashboard/client" : "/sign-in")}
            className="flex-col h-14 px-3 gap-1 flex-1 max-w-[72px]"
          >
            <Upload className={cn("h-5 w-5", pathname.startsWith("/dashboard") ? "text-primary-foreground" : "")} />
            <span className="text-[10px] font-medium">Upload</span>
          </Button>

          {/* Dashboard/Pricing Button - Conditional based on auth */}
          <Button
            variant={(isAuthenticated && pathname.startsWith("/dashboard")) || pathname === "/pricing" ? "default" : "ghost"}
            size="sm"
            onClick={() => router.push(isAuthenticated ? "/dashboard" : "/pricing")}
            className="flex-col h-14 px-3 gap-1 flex-1 max-w-[72px]"
          >
            {isAuthenticated ? (
              <>
                <LayoutDashboard className={cn("h-5 w-5", pathname.startsWith("/dashboard") ? "text-primary-foreground" : "")} />
                <span className="text-[10px] font-medium">Dashboard</span>
              </>
            ) : (
              <>
                <DollarSign className={cn("h-5 w-5", pathname === "/pricing" ? "text-primary-foreground" : "")} />
                <span className="text-[10px] font-medium">Pricing</span>
              </>
            )}
          </Button>

          {/* Theme Toggle - Icon only */}
          <div className="flex-col h-14 flex items-center justify-center gap-1 flex-1 max-w-[72px]">
            <ThemeToggle />
            <span className="text-[10px] font-medium text-muted-foreground">Theme</span>
          </div>

          {/* Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost"
                size="sm" 
                className="flex-col h-14 px-3 gap-1 flex-1 max-w-[72px]"
              >
                <Menu className="h-5 w-5" />
                <span className="text-[10px] font-medium">Menu</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent 
              side="right" 
              className="w-[85vw] sm:w-[380px] max-w-[420px] p-0 h-full flex flex-col"
            >
              {/* Header */}
              <SheetHeader className="px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AppIcon size={32} />
                    <SheetTitle className="text-base md:text-lg font-bold">Exceletto</SheetTitle>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>

              {/* User Info - if authenticated */}
              {isAuthenticated && user && (
                <div className="px-4 py-3 bg-muted/30 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm md:text-base font-semibold text-primary">
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
              <div className="flex-1 overflow-y-auto py-2">
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
                                  "w-full justify-start h-10 px-3 gap-3",
                                  "hover:bg-accent hover:text-accent-foreground",
                                  "transition-colors"
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
                            <CollapsibleContent className="pl-4 pr-2 space-y-1">
                              {item.children.map((child, childIndex) => (
                                <Button
                                  key={childIndex}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleNavigation(child.href)}
                                  className={cn(
                                    "w-full justify-start h-auto py-2 px-3",
                                    "hover:bg-accent/50 transition-colors",
                                    pathname === child.href && "bg-accent"
                                  )}
                                >
                                  <div className="flex items-start gap-2 w-full">
                                    {child.icon && (
                                      <child.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
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
                          onClick={() => item.href && handleNavigation(item.href)}
                          className={cn(
                            "w-full justify-start h-10 px-3 gap-2",
                            "hover:bg-accent hover:text-accent-foreground",
                            "transition-colors",
                            pathname === item.href && "bg-accent"
                          )}
                        >
                          {item.icon && <item.icon className="h-5 w-5" />}
                          <span className="flex-1 text-left text-sm md:text-base">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                      )
                    })}
                </nav>

                {/* Quick Links Section */}
                {!isAuthenticated && (
                  <>
                    <Separator className="my-2" />
                    <div className="px-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Quick Links
                      </p>
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSectionClick("differentiators")}
                          className="w-full justify-start h-9 px-2 gap-3"
                        >
                          <Target className="h-5 w-5" />
                          <span className="text-sm md:text-base">What Makes Us Different</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSectionClick("how-it-works")}
                          className="w-full justify-start h-9 px-2 gap-3"
                        >
                          <HelpCircle className="h-5 w-5" />
                          <span className="text-sm md:text-base">How It Works</span>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Actions */}
              <div className="mt-auto border-t p-3 space-y-2 bg-muted/30">
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full h-10 gap-3"
                      onClick={() => {
                        handleNavigation("/dashboard/client")
                      }}
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-sm md:text-base">Process New Images</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full h-10 gap-3 text-destructive hover:text-destructive"
                      onClick={() => {
                        // Handle logout
                        handleNavigation("/signout")
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="text-sm md:text-base">Sign Out</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full h-10 gap-3"
                      onClick={() => handleNavigation("/sign-in")}
                    >
                      <LogIn className="h-5 w-5" />
                      <span className="text-sm md:text-base">Sign In</span>
                    </Button>
                    <Button
                      className="w-full h-10 gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      onClick={() => handleNavigation("/sign-up")}
                    >
                      <UserPlus className="h-5 w-5" />
                      <span className="text-sm md:text-base font-medium">Get Started Free</span>
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
        @media (max-width: 1023px) {
          body {
            padding-bottom: 3.5rem;
          }
        }
      `}</style>
    </>
  )
}

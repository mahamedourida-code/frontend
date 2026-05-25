"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AppLogo } from "@/components/AppIcon";
import { IndustrySolutionsMenuGrid } from "@/components/IndustrySolutionsMenuGrid";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

type MarketingNavBarProps = {
  onSectionClick?: (sectionId: string) => void;
};

export function MarketingNavBar({ onSectionClick }: MarketingNavBarProps) {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = Boolean(user && !loading);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const navLinkClass = cn(
    navigationMenuTriggerStyle(),
    "rounded-none bg-transparent px-3 text-[15px] font-medium text-foreground transition-colors hover:bg-transparent hover:text-foreground/64 focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent"
  );

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[72px] border-b transition-[background-color,border-color] duration-200",
        scrolled
          ? "border-border bg-background/96 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-full max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="AxLiner home" className="flex-shrink-0">
            <AppLogo />
          </Link>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="rounded-none bg-transparent px-3 text-[15px] font-medium text-foreground transition-colors hover:bg-transparent hover:text-foreground/64 focus:bg-transparent data-[state=open]:bg-transparent">
                    Solutions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <IndustrySolutionsMenuGrid />
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink href="/how-axliner-is-built" className={navLinkClass}>
                    How AxLiner's Built
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink href="/benchmarks" className={navLinkClass}>
                    Benchmarks
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink href="/pricing" className={navLinkClass}>
                    Pricing
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink href="/blogs" className={navLinkClass}>
                    Blogs
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {loading ? (
              <div className="h-11 w-[184px]" aria-hidden="true" />
            ) : isAuthenticated ? (
              <Button variant="ink" asChild className="h-11 rounded-xl px-7 text-base font-semibold">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="h-11 rounded-xl px-5 text-base font-medium">
                  <Link href="/sign-in?next=%2Fdashboard%2Fclient">Log in</Link>
                </Button>
                <Button variant="ink" asChild className="h-11 rounded-xl px-7 text-base font-semibold">
                  <Link href="/sign-up?next=%2Fdashboard%2Fclient">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          {loading ? (
            <div className="h-10 w-10 lg:hidden" aria-hidden="true" />
          ) : (
            <MobileNav isAuthenticated={isAuthenticated} user={user} onSectionClick={onSectionClick} />
          )}
      </div>
    </nav>
  );
}

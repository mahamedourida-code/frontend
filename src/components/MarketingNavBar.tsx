import Link from "next/link";

import { AppLogo } from "@/components/AppIcon";
import { IndustrySolutionsMenuGrid } from "@/components/IndustrySolutionsMenuGrid";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
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

export function MarketingNavBar() {
  const navLinkClass = cn(
    navigationMenuTriggerStyle(),
    "bg-transparent text-foreground transition-colors hover:bg-muted focus:bg-transparent active:bg-transparent"
  );

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 pt-3 backdrop-blur-2xl lg:pt-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-md border border-border bg-background/82 p-2 shadow-sm backdrop-blur-2xl lg:p-3">
          <Link href="/" aria-label="AxLiner home" className="flex-shrink-0">
            <AppLogo />
          </Link>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-foreground transition-colors hover:bg-muted focus:bg-transparent active:bg-transparent">
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
            <Button asChild size="sm" className="rounded-md">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-md">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>

          <MobileNav />
        </div>
      </div>
    </nav>
  );
}

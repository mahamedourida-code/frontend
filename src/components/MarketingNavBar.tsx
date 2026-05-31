"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Sparkles } from "lucide-react";

import { AppLogo } from "@/components/AppIcon";
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
import { useAuth } from "@/hooks/useAuth";
import {
  AudienceSolution,
  audienceSolutionGroups,
  audienceSolutionHref,
  getAudienceSolutionBySlug,
  primaryAudienceSlugs,
} from "@/lib/audience-solutions";
import { cn } from "@/lib/utils";

const primaryAudienceSolutions = primaryAudienceSlugs.map(getAudienceSolutionBySlug);

function PrimaryAudienceLink({ solution }: { solution: AudienceSolution }) {
  const Icon = solution.icon;

  return (
    <NavigationMenuLink asChild>
      <Link
        href={audienceSolutionHref(solution.slug)}
        className="group flex items-center gap-3 rounded-[18px] border border-black/8 bg-white px-4 py-4 text-[#171717] outline-none transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-emerald-600/30 hover:bg-white hover:shadow-[0_15px_28px_-24px_rgba(6,78,59,0.55)] focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#d1fae5] text-[#064e3b]">
          <Icon className="size-5" />
        </span>
        <span className="text-sm font-bold tracking-[-0.02em]">{solution.menuLabel}</span>
        <ArrowRight className="ml-auto size-4 shrink-0 text-emerald-800 transition-transform group-hover:translate-x-1" />
      </Link>
    </NavigationMenuLink>
  );
}

function SecondaryAudienceLink({ solution }: { solution: AudienceSolution }) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={audienceSolutionHref(solution.slug)}
        className="group flex items-center gap-2 rounded-full border border-black/8 bg-white px-3.5 py-2 text-[12px] font-bold text-[#31312f] outline-none transition-[border-color,background-color,color] hover:border-emerald-600/30 hover:bg-[#d1fae5] hover:text-[#064e3b] focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        {solution.menuLabel}
        <ArrowRight className="size-3 shrink-0 opacity-35 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100" />
      </Link>
    </NavigationMenuLink>
  );
}

function AudienceMegaMenu() {
  return (
    <div className="w-[960px] overflow-hidden rounded-[26px] border border-black/8 bg-[#fffdf8] text-[#171717] shadow-[0_26px_75px_-34px_rgba(15,23,42,0.38)]">
      <div className="grid grid-cols-[0.92fr_1.08fr]">
        <div className="border-r border-black/8 bg-[#f7f3e9] p-7">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">
            <BriefcaseBusiness className="size-3.5" />
            Built for client work
          </div>
          <h2 className="mt-4 max-w-sm text-[27px] font-bold leading-[1.02] tracking-[-0.055em] text-[#171717]">
            Move the whole accounting batch forward.
          </h2>
          <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-black/58">
            Choose the workspace that fits your practice, then explore the review flow around it.
          </p>

          <div className="mt-6 space-y-2.5">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.19em] text-black/38">
              Choose your fit
            </p>
            {primaryAudienceSolutions.map((solution) => (
              <PrimaryAudienceLink key={solution.slug} solution={solution} />
            ))}
          </div>
        </div>

        <div className="p-7">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">
            <Sparkles className="size-3.5" />
            Explore the workflow
          </div>

          <div className="mt-5 space-y-5">
            {audienceSolutionGroups.map((group) => {
              const Icon = group.icon;

              return (
                <div
                  key={group.label}
                  className="grid grid-cols-[150px_1fr] gap-4 border-b border-black/8 pb-5 last:border-b-0 last:pb-0"
                >
                  <div>
                    <span className="flex size-8 items-center justify-center rounded-xl bg-[#d1fae5] text-[#064e3b]">
                      <Icon className="size-4" />
                    </span>
                    <p className="mt-3 text-sm font-bold tracking-[-0.02em] text-[#171717]">{group.label}</p>
                    <p className="mt-1 text-[11px] font-medium leading-4 text-black/48">{group.description}</p>
                  </div>
                  <div className="flex content-start flex-wrap items-start gap-2 pt-0.5">
                    {group.slugs.map((slug) => (
                      <SecondaryAudienceLink key={slug} solution={getAudienceSolutionBySlug(slug)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 border-t border-emerald-900/10 bg-[#d1fae5] px-7 py-4">
        <p className="max-w-xl text-[13px] font-bold leading-5 text-[#064e3b]">
          Built around batch intake, exception review, and controlled accounting handoff.
        </p>
        <Button variant="glossy" asChild className="h-9 shrink-0 px-4 text-[12px] font-bold">
          <Link href={audienceSolutionHref("batch-review-board")}>
            See the review board
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

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

  const flatLink = cn(
    navigationMenuTriggerStyle(),
    "rounded-none bg-transparent px-3.5 text-[15.5px] font-bold text-foreground",
    "transition-colors hover:bg-transparent hover:text-emerald-700",
    "focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
  );

  const audienceTrigger = cn(
    "relative h-9 rounded-none bg-transparent px-3.5 text-[15.5px] font-bold",
    "text-foreground transition-colors hover:bg-transparent hover:text-emerald-700",
    "focus:bg-transparent focus:ring-0 focus-visible:ring-2 focus-visible:ring-emerald-500",
    "data-[state=open]:bg-transparent data-[state=open]:text-emerald-700",
    "after:absolute after:inset-x-3.5 after:bottom-0 after:h-[2px] after:origin-left",
    "after:scale-x-0 after:rounded-full after:bg-emerald-700 after:transition-transform after:duration-[140ms] after:ease-out",
    "data-[state=open]:after:scale-x-100",
  );

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[68px] border-b",
        "transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-border bg-background/95 shadow-[0_1px_0_0_hsl(var(--border))] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-4 sm:px-5 lg:px-9">
        <Link href="/" aria-label="AxLiner home" className="flex-shrink-0">
          <AppLogo className="h-7 w-auto" />
        </Link>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="gap-0">
              <NavigationMenuItem>
                <NavigationMenuTrigger className={audienceTrigger}>
                  For Accountants &amp; Bookkeepers
                </NavigationMenuTrigger>
                <NavigationMenuContent className="-left-[240px] xl:-left-[180px] 2xl:-left-[120px]">
                  <AudienceMegaMenu />
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/pricing" className={flatLink}>
                    Pricing
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/blogs" className={flatLink}>
                    Blog
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {loading ? (
            <div className="h-9 w-[170px]" aria-hidden="true" />
          ) : isAuthenticated ? (
            <Button variant="ink" asChild className="h-10 px-5 text-sm font-bold">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="h-10 px-4 text-sm font-semibold text-foreground hover:text-emerald-700"
              >
                <Link href="/sign-in?next=%2Fdashboard%2Fclient">Log in</Link>
              </Button>
              <Button variant="ink" asChild className="h-10 px-5 text-sm font-bold">
                <Link href="/sign-up?next=%2Fdashboard%2Fclient">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {loading ? (
          <div className="h-10 w-10 lg:hidden" aria-hidden="true" />
        ) : (
          <MobileNav
            isAuthenticated={isAuthenticated}
            user={user}
            onSectionClick={onSectionClick}
          />
        )}
      </div>
    </nav>
  );
}

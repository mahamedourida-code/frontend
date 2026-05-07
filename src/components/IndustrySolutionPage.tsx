import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/AppIcon";
import { MobileNav } from "@/components/MobileNav";
import { IndustrySolution, POLIVALENT_SOLUTION_IMAGE } from "@/lib/industry-solutions";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { IndustrySolutionsMenuGrid } from "@/components/IndustrySolutionsMenuGrid";
import { cn } from "@/lib/utils";

function ArrowMark({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-block h-4 w-7 ${className}`} aria-hidden="true">
      <span className="absolute left-0 top-1/2 h-[2px] w-7 -translate-y-1/2 rounded-full bg-current" />
      <span className="absolute right-0 top-[3px] h-3 w-3 rotate-45 border-r-2 border-t-2 border-current" />
    </span>
  );
}

function NumberedBlock({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-[22px] border border-white/55 bg-white/35 p-4 shadow-[0_14px_38px_rgba(42,35,64,0.07)] backdrop-blur-xl">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#2f165e] text-xs font-semibold text-white">
        {number}
      </div>
      <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#111827]">{text}</p>
    </div>
  );
}

export function IndustrySolutionPage({ solution }: { solution: IndustrySolution }) {
  return (
    <main className="ax-page-bg min-h-screen overflow-hidden text-[#111827]">
      <nav className="fixed left-0 right-0 top-0 z-50 pt-3 backdrop-blur-2xl lg:pt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-[35px] border border-black/10 bg-neutral-100/55 p-2 shadow-[0_18px_45px_rgba(20,20,20,0.08)] ring-1 ring-white/35 backdrop-blur-2xl lg:p-3">
            <div className="flex-shrink-0">
              <Link href="/" aria-label="AxLiner home">
                <AppLogo />
              </Link>
            </div>

            <div className="hidden flex-1 items-center justify-center lg:flex">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-black transition-colors hover:bg-accent/50 dark:text-white">
                      Solutions
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <IndustrySolutionsMenuGrid />
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/pricing"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent text-black transition-colors hover:bg-accent/50 dark:text-white")}
                    >
                      Pricing
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/blogs"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent text-black transition-colors hover:bg-accent/50 dark:text-white")}
                    >
                      Blogs
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/#ai-engine"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent text-black transition-colors hover:bg-accent/50 dark:text-white")}
                    >
                      How AxLiner's Built
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/#benchmarks"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent text-black transition-colors hover:bg-accent/50 dark:text-white")}
                    >
                      Benchmarks
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Button asChild className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 hover:shadow-xl">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-full border-[1.6px] border-foreground/30 bg-white/90 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-white dark:bg-white/20 dark:hover:bg-white/30"
              >
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>

            <MobileNav />
          </div>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-28 sm:px-6 lg:grid-cols-[0.96fr_1.04fr] lg:px-8 lg:pb-16 lg:pt-32">
        <div className="flex flex-col justify-center">
          <div className="w-fit rounded-full border border-white/60 bg-white/35 px-4 py-2 text-sm font-semibold text-[#2f165e] backdrop-blur-xl">
            {solution.eyebrow}
          </div>
          <h1 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight tracking-normal text-[#111827] sm:text-4xl lg:text-5xl">
            {solution.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#111827]">
            {solution.summary}
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#111827]">
            {solution.proof}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-full bg-[#2f165e] px-6 text-white hover:bg-[#24104b]">
              <Link href="/#converter">
                Try it with your files
                <ArrowMark className="ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-12 rounded-full border-white/65 bg-white/35 px-6 text-[#111827] backdrop-blur-xl hover:bg-white/55"
            >
              <Link href="/pricing">See plans</Link>
            </Button>
          </div>
        </div>

        <div className="relative min-h-[300px] overflow-hidden rounded-[24px] shadow-[0_18px_55px_rgba(42,35,64,0.09)] sm:min-h-[360px] lg:min-h-[440px]">
          <Image
            src={solution.detailImage}
            alt={`${solution.title} document workflow`}
            fill
            priority
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {solution.useCases.map((item) => (
            <div
              key={item}
              className="rounded-[20px] border border-white/55 bg-white/30 px-4 py-5 shadow-[0_12px_34px_rgba(42,35,64,0.06)] backdrop-blur-xl"
            >
              <div className="mb-4 h-[3px] w-10 rounded-full bg-[#2f165e]" />
              <p className="text-sm font-semibold leading-6 text-[#111827]">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="rounded-[26px] border border-white/55 bg-white/28 p-6 shadow-[0_18px_55px_rgba(42,35,64,0.07)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2f165e]">
              Where it fits
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-[#111827] sm:text-3xl">
              Built for the gap between scanned documents and usable operations data.
            </h2>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-white/55 bg-white/32 p-6 shadow-[0_16px_45px_rgba(42,35,64,0.07)] backdrop-blur-xl">
              <p className="text-base leading-7 text-[#111827]">
                Most {solution.title.toLowerCase()} teams already know what has to happen after extraction: check the numbers, correct edge cases, and send the file into a spreadsheet, reporting tool, or internal workflow. AxLiner is shaped around that review step instead of producing a raw text dump that still needs to be rebuilt by hand.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/55 bg-white/32 p-6 shadow-[0_16px_45px_rgba(42,35,64,0.07)] backdrop-blur-xl">
              <p className="text-base leading-7 text-[#111827]">
                The product keeps batches simple: upload the documents, let the system preserve the table structure, then download a file your team can open immediately. That makes it useful for daily paperwork, backlog cleanup, and repeatable document intake without forcing a custom engineering project for every new format.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:py-16">
        <div className="relative min-h-[300px] overflow-hidden rounded-[24px] shadow-[0_18px_55px_rgba(42,35,64,0.08)] sm:min-h-[360px] lg:min-h-[420px]">
          <Image
            src={POLIVALENT_SOLUTION_IMAGE}
            alt="AxLiner workspace overview"
            fill
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <div className="rounded-[28px] border border-white/55 bg-white/28 p-6 shadow-[0_18px_55px_rgba(42,35,64,0.08)] backdrop-blur-xl sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2f165e]">
              How it works
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-[#111827] sm:text-3xl">
              A simple path from messy input to usable spreadsheet output.
            </h2>
            <div className="mt-7 grid gap-4">
              {solution.workflow.map((step, index) => (
                <NumberedBlock
                  key={step}
                  number={`0${index + 1}`}
                  title={step}
                  text={solution.outcomes[index] ?? "Keep the process clear, fast, and easy to review."}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[30px] border border-white/55 bg-[#2f165e] p-6 text-white shadow-[0_24px_70px_rgba(47,22,94,0.22)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
                Ready for batch work
              </p>
              <h2 className="mt-4 max-w-3xl text-2xl font-semibold leading-tight sm:text-3xl">
                Convert {solution.title.toLowerCase()} documents without building a custom data-entry team.
              </h2>
            </div>
            <Button asChild className="h-12 rounded-full bg-white px-6 text-[#2f165e] hover:bg-white/90">
              <Link href="/#converter">
                Start converting
                <ArrowMark className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

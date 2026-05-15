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
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
        {number}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-foreground">{text}</p>
    </div>
  );
}

export function IndustrySolutionPage({ solution }: { solution: IndustrySolution }) {
  return (
    <main className="ax-page-bg min-h-screen overflow-hidden text-foreground">
      <nav className="fixed left-0 right-0 top-0 z-50 pt-3 backdrop-blur-2xl lg:pt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-md border border-border bg-background/82 p-2 shadow-sm backdrop-blur-2xl lg:p-3">
            <div className="flex-shrink-0">
              <Link href="/" aria-label="AxLiner home">
                <AppLogo />
              </Link>
            </div>

            <div className="hidden flex-1 items-center justify-center lg:flex">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-black transition-colors hover:bg-accent/50 dark:text-primary-foreground">
                      Solutions
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <IndustrySolutionsMenuGrid />
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/pricing"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent text-black transition-colors hover:bg-accent/50 dark:text-primary-foreground")}
                    >
                      Pricing
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/blogs"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent text-black transition-colors hover:bg-accent/50 dark:text-primary-foreground")}
                    >
                      Blogs
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/#ai-engine"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent text-black transition-colors hover:bg-accent/50 dark:text-primary-foreground")}
                    >
                      How AxLiner's Built
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/#benchmarks"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent text-black transition-colors hover:bg-accent/50 dark:text-primary-foreground")}
                    >
                      Benchmarks
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Button asChild size="sm" className="rounded-md">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-md"
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
          <div className="w-fit rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-primary shadow-sm">
            {solution.eyebrow}
          </div>
          <h1 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight tracking-normal text-foreground sm:text-4xl lg:text-5xl">
            {solution.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-foreground">
            {solution.summary}
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-foreground">
            {solution.proof}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-md px-6">
              <Link href="/#converter">
                Try it with your files
                <ArrowMark className="ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-12 rounded-md px-6"
            >
              <Link href="/pricing">See plans</Link>
            </Button>
          </div>
        </div>

        <div className="relative min-h-[300px] overflow-hidden rounded-md border border-border bg-card p-2 shadow-sm sm:min-h-[360px] lg:min-h-[440px]">
          <Image
            src={solution.detailImage}
            alt={`${solution.title} document workflow`}
            fill
            priority
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="rounded-md object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {solution.useCases.map((item) => (
            <div
              key={item}
              className="rounded-md border border-border bg-card px-4 py-5 shadow-sm"
            >
              <div className="mb-4 h-[3px] w-10 rounded-full bg-primary" />
              <p className="text-sm font-semibold leading-6 text-foreground">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="rounded-md border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Where it fits
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
              Built for the gap between scanned documents and usable operations data.
            </h2>
          </div>

          <div className="grid gap-4">
            <div className="rounded-md border border-border bg-card p-6 shadow-sm">
              <p className="text-base leading-7 text-foreground">
                Most {solution.title.toLowerCase()} teams already know what has to happen after extraction: check the numbers, correct edge cases, and send the file into a spreadsheet, reporting tool, or internal workflow. AxLiner is shaped around that review step instead of producing a raw text dump that still needs to be rebuilt by hand.
              </p>
            </div>
            <div className="rounded-md border border-border bg-card p-6 shadow-sm">
              <p className="text-base leading-7 text-foreground">
                The product keeps batches simple: upload the documents, let the system preserve the table structure, then download a file your team can open immediately. That makes it useful for daily paperwork, backlog cleanup, and repeatable document intake without forcing a custom engineering project for every new format.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:py-16">
        <div className="relative min-h-[300px] overflow-hidden rounded-md border border-border bg-card p-2 shadow-sm sm:min-h-[360px] lg:min-h-[420px]">
          <Image
            src={POLIVALENT_SOLUTION_IMAGE}
            alt="AxLiner workspace overview"
            fill
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="rounded-md object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <div className="rounded-md border border-border bg-card p-6 shadow-sm sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              How it works
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
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
        <div className="overflow-hidden rounded-md border border-primary/20 bg-primary p-6 text-primary-foreground shadow-sm sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">
                Ready for batch work
              </p>
              <h2 className="mt-4 max-w-3xl text-2xl font-semibold leading-tight sm:text-3xl">
                Convert {solution.title.toLowerCase()} documents without building a custom data-entry team.
              </h2>
            </div>
            <Button asChild className="h-12 rounded-md bg-background px-6 text-primary hover:bg-card/90">
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

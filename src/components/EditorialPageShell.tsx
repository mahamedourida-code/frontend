import type { ReactNode } from "react"

import { MarketingNavBar } from "@/components/MarketingNavBar"
import { cn } from "@/lib/utils"

export type EditorialSectionLink = {
  id: string
  title: string
}

type EditorialPageShellProps = {
  eyebrow: string
  title: string
  intro: ReactNode
  meta?: string
  links: EditorialSectionLink[]
  hero?: ReactNode
  children: ReactNode
  className?: string
  articleClassName?: string
}

export function EditorialPageShell({
  eyebrow,
  title,
  intro,
  meta,
  links,
  hero,
  children,
  className,
  articleClassName,
}: EditorialPageShellProps) {
  return (
    <main className={cn("min-h-screen bg-background text-foreground", className)}>
      <MarketingNavBar />

      <div className="mx-auto max-w-[1560px] px-4 pb-24 pt-32 sm:px-6 lg:px-8 lg:pt-36">
        <div className="grid gap-10 lg:grid-cols-[minmax(224px,280px)_minmax(0,820px)] lg:items-start lg:gap-16 xl:grid-cols-[300px_minmax(0,820px)] xl:gap-20">
          <aside className="hidden self-stretch border-r border-border/90 pr-8 lg:block xl:pr-10">
            <nav
              className="sticky top-28 overflow-hidden rounded-md border border-border bg-muted/35 shadow-sm"
              aria-label={`${eyebrow} sections`}
            >
              <div className="border-b border-border bg-background/70 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  In this page
                </p>
              </div>
              <ol className="space-y-1 p-3">
                {links.map((link, index) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      className="group grid grid-cols-[22px_1fr] gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-background hover:text-primary"
                    >
                      <span className="pt-0.5 text-[11px] font-semibold text-muted-foreground group-hover:text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium leading-5 tracking-normal">{link.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className={cn("min-w-0", articleClassName)}>
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
                {title}
              </h1>
              <div className="mt-5 max-w-[760px] space-y-4 text-[17px] leading-7 text-foreground/78">{intro}</div>
              {meta ? <p className="mt-5 text-sm font-semibold text-foreground/58">{meta}</p> : null}
              {hero}
            </header>

            <nav
              className="mt-9 overflow-x-auto border-y border-border py-4 lg:hidden"
              aria-label={`${eyebrow} sections`}
            >
              <ol className="flex min-w-max gap-6 pr-4 text-sm font-semibold text-foreground">
                {links.map((link) => (
                  <li key={link.id}>
                    <a href={`#${link.id}`} className="whitespace-nowrap transition-colors hover:text-primary">
                      {link.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-10 space-y-12 text-base leading-7 text-foreground/82">{children}</div>
          </article>
        </div>
      </div>
    </main>
  )
}

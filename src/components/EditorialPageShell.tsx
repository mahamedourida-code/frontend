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

      <div className="mx-auto max-w-[1360px] px-4 pb-24 pt-32 sm:px-6 lg:px-8 lg:pt-36">
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,820px)] lg:justify-center lg:gap-14">
          <aside className="hidden lg:block">
            <nav className="sticky top-32 border-l border-border pl-6" aria-label={`${eyebrow} sections`}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">In this page</p>
              <ol className="mt-6 space-y-5">
                {links.map((link, index) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      className="group grid grid-cols-[24px_1fr] gap-3 text-left transition-colors hover:text-primary"
                    >
                      <span className="pt-1 text-xs font-semibold text-muted-foreground group-hover:text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-lg font-semibold leading-6 tracking-normal">{link.title}</span>
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
              <div className="mt-5 space-y-5 text-xl leading-8 text-foreground/78">{intro}</div>
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

            <div className="mt-10 space-y-12">{children}</div>
          </article>
        </div>
      </div>
    </main>
  )
}

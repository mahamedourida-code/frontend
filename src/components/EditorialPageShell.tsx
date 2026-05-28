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
    <main className={cn("min-h-screen bg-background text-neutral-900", className)}>
      <MarketingNavBar />

      <div className="mx-auto max-w-[1560px] px-4 pb-24 pt-32 sm:px-6 lg:px-8 lg:pt-36">
        <div className="grid gap-10 lg:grid-cols-[minmax(224px,280px)_minmax(0,820px)] lg:items-start lg:gap-16 xl:grid-cols-[300px_minmax(0,820px)] xl:gap-20">
          <aside className="hidden self-stretch border-r border-neutral-900/15 pr-8 lg:block xl:pr-10">
            <nav
              className="sticky top-28 overflow-hidden rounded-md border-2 border-neutral-900 bg-emerald-100 shadow-sm"
              aria-label={`${eyebrow} sections`}
            >
              <div className="border-b-2 border-neutral-900 bg-white px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                  In this page
                </p>
              </div>
              <ol className="space-y-1 p-3">
                {links.map((link, index) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      className="group grid grid-cols-[22px_1fr] gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-white"
                    >
                      <span className="pt-0.5 text-[11px] font-bold text-emerald-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-semibold leading-5 tracking-normal text-neutral-900 group-hover:text-emerald-700">
                        {link.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className={cn("min-w-0", articleClassName)}>
            <header>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">{eyebrow}</p>
              <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl">
                {title}
              </h1>
              <div className="mt-6 max-w-[760px] space-y-4 text-[18px] font-semibold leading-8 text-neutral-900">{intro}</div>
              {meta ? <p className="mt-5 text-sm font-bold text-neutral-700">{meta}</p> : null}
              {hero}
            </header>

            <nav
              className="mt-9 overflow-x-auto border-y-2 border-neutral-900 py-4 lg:hidden"
              aria-label={`${eyebrow} sections`}
            >
              <ol className="flex min-w-max gap-6 pr-4 text-sm font-bold text-neutral-900">
                {links.map((link) => (
                  <li key={link.id}>
                    <a href={`#${link.id}`} className="whitespace-nowrap transition-colors hover:text-emerald-700">
                      {link.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-10 space-y-12 text-[17px] font-semibold leading-8 text-neutral-900">{children}</div>
          </article>
        </div>
      </div>
    </main>
  )
}

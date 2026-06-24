import type { ReactNode } from "react"

import { MarketingFooter } from "@/components/MarketingFooter"
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
    <div className={cn("ax-marketing-page min-h-screen bg-[#FDFBF7] text-[#191919]", className)}>
      <MarketingNavBar />

      <main>
        <header className="ax-marketing-container max-w-[1500px] pb-16 pt-32 sm:pb-20 lg:pt-40">
          <div className="max-w-[1120px]">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--landing-blue)]">{eyebrow}</p>
            <h1 className="mt-5 max-w-[1050px] text-[clamp(3rem,7vw,7.25rem)] font-medium leading-[0.92] tracking-[-0.065em] text-[#191919]">
              {title}
            </h1>
            <div className="mt-8 max-w-[720px] space-y-4 text-lg font-medium leading-8 text-[#3f3f3f] sm:text-xl">
              {intro}
            </div>
            {meta ? (
              <p className="mt-7 max-w-[720px] border-l-2 border-[var(--landing-blue)] pl-4 text-sm font-semibold leading-6 text-[#5b5b5b]">
                {meta}
              </p>
            ) : null}
          </div>
          {hero ? <div className="mt-12 max-w-[1180px]">{hero}</div> : null}
        </header>

        <div className="ax-marketing-container max-w-[1500px] pb-24 sm:pb-32">
          <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,900px)] lg:items-start lg:gap-16 xl:gap-24">
            {links.length > 0 ? (
              <aside className="lg:sticky lg:top-28">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#777]">On this page</p>
                <nav aria-label={`${eyebrow} sections`}>
                  <ol className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1">
                    {links.map((link, index) => (
                      <li key={link.id}>
                        <a
                          href={`#${link.id}`}
                          className="group flex min-w-max items-center gap-3 rounded-full px-3 py-2 text-sm font-semibold text-[#555] transition-colors hover:bg-white hover:text-[#191919] lg:min-w-0"
                        >
                          <span className="text-[10px] font-bold text-[var(--landing-blue)]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </aside>
            ) : null}

            <article className={cn("min-w-0", articleClassName)}>
              <div className="ax-marketing-prose space-y-8 [&>section]:rounded-[28px] [&>section]:border [&>section]:border-black/10 [&>section]:bg-white [&>section]:p-6 [&>section]:shadow-[0_18px_55px_rgba(25,25,25,0.06)] sm:[&>section]:p-9 lg:[&>section]:p-11 [&_h2]:text-[#191919] [&_h3]:text-[#191919] [&_p]:text-[#444]">
                {children}
              </div>
            </article>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}

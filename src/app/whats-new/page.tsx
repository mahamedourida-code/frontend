import type { Metadata } from "next"
import Link from "next/link"

import { MarketingFooter } from "@/components/MarketingFooter"
import { MarketingNavBar } from "@/components/MarketingNavBar"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "What's new — AxLiner",
  description: "The latest in AxLiner: the batch review board, vendor memory, and one-click publishing to QuickBooks Online and Xero.",
}

const updates = [
  {
    number: "01",
    title: "Batch review board",
    body: "Upload the whole folder. AxLiner extracts every field and puts the exceptions in one focused review queue.",
    tone: "bg-[var(--landing-blue)] text-white",
  },
  {
    number: "02",
    title: "Vendor memory",
    body: "Reuse the account, tax, and terms you approved for a supplier while keeping every draft under review.",
    tone: "bg-white text-[#191919]",
  },
  {
    number: "03",
    title: "QuickBooks and Xero",
    body: "Publish a reviewed draft bill with its source document attached, then retry safely if a destination rejects it.",
    tone: "bg-[#d1fae5] text-[#191919]",
  },
  {
    number: "04",
    title: "Duplicate and anomaly checks",
    body: "Catch repeated invoice numbers, mismatched totals, and missing VAT before the batch reaches your books.",
    tone: "bg-[#191919] text-white",
  },
]

export default function WhatsNewPage() {
  return (
    <div className="ax-marketing-page min-h-screen bg-[#FDFBF7] text-[#191919]">
      <MarketingNavBar />

      <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-32 sm:px-5 lg:px-9 lg:pt-40">
        <header className="max-w-[1050px]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--landing-blue)]">What&apos;s new</p>
          <h1 className="mt-5 text-[clamp(3.5rem,7vw,7.5rem)] font-medium leading-[0.9] tracking-[-0.065em]">
            Less review noise. Better books.
          </h1>
          <p className="mt-8 max-w-[660px] text-lg font-medium leading-8 text-[#444] sm:text-xl">
            Recent improvements to the path from a messy folder to reviewed drafts in QuickBooks or Xero.
          </p>
        </header>

        <div className="mt-16 grid gap-3 md:grid-cols-2">
          {updates.map((update, index) => (
            <section
              key={update.title}
              className={`${update.tone} min-h-[330px] rounded-[32px] border border-black/10 p-7 shadow-[0_18px_55px_rgba(25,25,25,0.06)] sm:p-10 ${index === 0 ? "md:row-span-2 md:min-h-[680px]" : ""}`}
            >
              <div className="flex h-full flex-col justify-between gap-16">
                <span className="text-xs font-bold tracking-[0.2em] opacity-70">{update.number}</span>
                <div>
                  <h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">{update.title}</h2>
                  <p className="mt-5 max-w-[540px] text-base font-medium leading-7 opacity-80 sm:text-lg">{update.body}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-3 rounded-[32px] border border-black/10 bg-white p-8 sm:p-12">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--landing-blue)]">Ready for a cleaner close?</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-medium tracking-[-0.04em] sm:text-5xl">Put the next folder through AxLiner.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="glossy" size="lg"><Link href="/dashboard/client">Start free</Link></Button>
              <Button asChild variant="outline" size="lg"><Link href="/contact">Talk to us</Link></Button>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

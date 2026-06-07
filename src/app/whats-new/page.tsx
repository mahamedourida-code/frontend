import type { Metadata } from "next"
import NextLink from "next/link"
import { MarketingNavBar } from "@/components/MarketingNavBar"

export const metadata: Metadata = {
  title: "What's new — AxLiner",
  description: "The latest in AxLiner: the batch review board, vendor memory, and one-click publishing to QuickBooks Online and Xero.",
}

const updates = [
  {
    title: "Batch review board",
    body: "Upload a whole folder of invoices, receipts, and statements at once. AxLiner extracts every field and surfaces only the exceptions, so you confirm a batch in minutes instead of retyping it.",
  },
  {
    title: "Vendor memory",
    body: "AxLiner learns how you code each supplier — account, tax, and terms — and pre-fills the next bill from the same vendor. You stay in control; review is always one click.",
  },
  {
    title: "Publish to QuickBooks & Xero",
    body: "Send a reviewed draft bill straight to QuickBooks or Xero with the original document attached. If anything fails, retry safely without creating a duplicate.",
  },
  {
    title: "Duplicate & anomaly checks",
    body: "Repeat invoice numbers, off totals, and missing VAT are flagged before anything reaches your books.",
  },
]

export default function WhatsNewPage() {
  return (
    <div className="ax-marketing-page relative min-h-screen bg-white text-neutral-950">
      <MarketingNavBar />
      <main className="relative z-10 mx-auto max-w-[920px] px-5 py-20 sm:px-7 lg:py-28">
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-[var(--brand-brown)]">What&rsquo;s new</p>
        <h1 className="ax-h1 mt-4 font-bold tracking-tight text-neutral-950">
          The review layer keeps getting <span className="font-bold text-[var(--brand-brown)]">sharper</span>.
        </h1>
        <p className="ax-body mt-5 max-w-2xl font-semibold text-neutral-950">
          Recent updates to how AxLiner turns messy documents into reviewed, published books.
        </p>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-black/15 bg-black/15 sm:grid-cols-2">
          {updates.map((u) => (
            <section key={u.title} className="bg-white p-7">
              <h2 className="text-xl font-bold text-neutral-950">{u.title}</h2>
              <p className="mt-3 text-[16px] font-medium leading-7 text-neutral-950">{u.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3">
          <NextLink
            href="/dashboard/client"
            className="ax-interactive inline-flex h-12 items-center rounded-md border-2 border-[var(--brand-green)] bg-[var(--brand-green)] px-8 text-[15px] font-bold text-black transition-colors hover:border-black hover:bg-white hover:text-black hover:underline hover:decoration-1 hover:underline-offset-4"
          >
            Start free
          </NextLink>
          <NextLink
            href="/contact"
            className="ax-interactive inline-flex h-12 items-center rounded-md border-2 border-black/15 bg-white px-8 text-[15px] font-bold text-black transition-colors hover:border-black"
          >
            Talk to us
          </NextLink>
        </div>
      </main>
    </div>
  )
}

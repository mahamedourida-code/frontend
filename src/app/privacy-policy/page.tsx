import { AppLogo } from "@/components/AppIcon"
import { MobileNav } from "@/components/MobileNav"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const sections = [
  {
    title: "Data We Collect",
    items: [
      "Account details such as email, display name, provider profile data, and authentication state.",
      "Uploaded files, generated Excel or text outputs, file metadata, job status, and download/share metadata.",
      "Usage events such as batch size, processing time, credits, plan limits, and error states.",
      "Technical data such as browser, device, IP-derived request information, and security logs.",
    ],
  },
  {
    title: "How We Use Data",
    items: [
      "Convert documents into structured spreadsheets or text output.",
      "Recover active jobs, keep history available, and protect downloads from unauthorized access.",
      "Manage free quotas, paid plans, billing status, credits, and abuse prevention.",
      "Send verified billing and subscription state from Lemon Squeezy into AxLiner so credits and limits can be applied.",
      "Improve reliability, queue performance, OCR quality, and support investigations.",
    ],
  },
  {
    title: "Storage And Processors",
    items: [
      "Supabase is used for authentication, database records, and durable file metadata.",
      "Supabase Storage is used for generated files and upload/output storage.",
      "Fly.io and Vercel host backend and frontend infrastructure.",
      "Lemon Squeezy is used as Merchant of Record for paid checkout, receipts, invoices, tax handling, and customer billing portal access.",
      "OCR processing may use external model infrastructure where needed to perform the conversion.",
    ],
  },
  {
    title: "Retention",
    items: [
      "Generated files are kept for a limited download and share window unless the product plan says otherwise.",
      "Job, credit, and billing metadata may be retained longer for account history, fraud prevention, tax, chargeback, and audit needs.",
      "Temporary processing files are treated as scratch data and are not meant for permanent storage.",
    ],
  },
  {
    title: "Sharing",
    items: [
      "We do not sell personal data.",
      "Shared links are created only when a user requests sharing.",
      "Service providers receive only the data needed to operate the product.",
      "We may disclose information if required by law or to protect the service from abuse.",
    ],
  },
  {
    title: "Your Rights",
    items: [
      "Request access to personal data connected to your account.",
      "Ask us to correct or delete account data where legally possible.",
      "Delete generated files from your workspace when the product provides that control.",
      "Contact us about privacy, data deletion, or account questions.",
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 border-b border-border bg-background/84 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="AxLiner home">
            <AppLogo className="h-8 w-auto" />
          </Link>
          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/data-deletion" className="rounded-md px-4 py-2 text-sm font-semibold hover:bg-muted">
              Data deletion
            </Link>
            <Button asChild className="rounded-md">
              <Link href="/contact">Contact</Link>
            </Button>
          </div>
          <MobileNav />
        </div>
      </nav>

      <article className="mx-auto max-w-[760px] px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Privacy</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Clear rules for your documents and account data.
          </h1>
          <p className="mt-5 text-xl leading-8 text-foreground/76">
            AxLiner processes document files to create spreadsheet and text outputs. This page explains what data is
            handled, why the service needs it, and where users can ask for access, correction, or deletion.
          </p>
          <p className="mt-4 text-sm font-semibold text-foreground/58">Last updated: May 22, 2026</p>
        </header>

        <section className="mt-10 border-t border-border pt-9">
          <p className="text-[19px] leading-8">
            Uploaded images and PDFs are used for conversion, preview generation, review, and output delivery. Account,
            billing, usage, and job metadata exist so a batch can be limited, recovered, secured, and downloaded by
            the right owner.
          </p>
          <p className="mt-5 text-[19px] leading-8">
            Users control whether they share result links and should keep permanent copies of needed spreadsheets in
            their own workspace. AxLiner does not position temporary processing storage as an archive for source
            paperwork.
          </p>
        </section>

        <div className="mt-10 space-y-10 border-t border-border pt-9">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold tracking-normal">{section.title}</h2>
              <ul className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 text-[19px] leading-8 text-foreground">
                    <span className="mt-[14px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-10 border-t border-border pt-9">
          <h2 className="text-2xl font-semibold tracking-normal">Questions or deletion requests</h2>
          <div className="mt-5 space-y-5 text-[19px] leading-8">
            <p>
              Use the contact page for privacy questions, account questions, and file deletion support. If the request
              is a deletion request, use the account email when possible and state the action you want AxLiner to take.
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild className="rounded-md px-6">
              <Link href="/contact">Contact AxLiner</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-md px-6">
              <Link href="/data-deletion">Data deletion</Link>
            </Button>
          </div>
        </section>
      </article>
    </main>
  )
}

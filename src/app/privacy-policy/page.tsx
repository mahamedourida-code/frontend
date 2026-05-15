"use client"

import { AppLogo } from "@/components/AppIcon"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const highlights = [
  {
    title: "Documents",
    text: "Uploaded images and PDFs are used to run conversion, create previews, and generate output files.",
  },
  {
    title: "Account",
    text: "We keep basic account, billing, usage, and job metadata so your history, limits, and downloads work.",
  },
  {
    title: "Control",
    text: "You can request deletion, avoid sharing links, and keep permanent copies in your own workspace.",
  },
]

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
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 border-b border-black/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center font-bold" aria-label="AxLiner home">
            <AppLogo className="h-8 w-auto" />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="rounded-md text-primary hover:bg-muted"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 lg:px-8 lg:pb-16 lg:pt-24">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Privacy
        </p>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
          Clear rules for your documents and account data.
        </h1>
        <p className="mt-6 max-w-3xl text-lg font-medium leading-8 text-foreground/78">
          AxLiner processes documents to create spreadsheet and text outputs. This page explains what data is handled, why it is needed, and how users can control it.
        </p>
        <p className="mt-4 text-sm font-semibold text-foreground/58">Last updated: May 7, 2026</p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-md border border-border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm font-medium leading-7 text-foreground/72">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="divide-y divide-border rounded-md border border-border bg-card shadow-sm">
          {sections.map((section) => (
            <div key={section.title} className="grid gap-6 p-6 lg:grid-cols-[300px_1fr] lg:p-8">
              <h2 className="text-2xl font-semibold tracking-normal">{section.title}</h2>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 text-base font-medium leading-8 text-foreground/78">
                    <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-md bg-primary p-6 text-primary-foreground shadow-sm sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold">Questions or deletion requests</h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-primary-foreground/72">
                Contact us for privacy questions, account deletion, or file deletion support.
              </p>
            </div>
            <Button asChild className="rounded-md bg-background px-6 text-primary hover:bg-card/90">
              <a href="mailto:axliner.excel@gmail.com">Contact privacy</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

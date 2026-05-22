import Link from "next/link"

import { EditorialPageShell } from "@/components/EditorialPageShell"
import { Button } from "@/components/ui/button"

const sections = [
  {
    id: "collection",
    title: "Data we collect",
    intro:
      "AxLiner needs enough data to own a job, secure a file, apply a plan, and return output to the right user.",
    items: [
      "Account details such as email, display name, provider profile data, and authentication state.",
      "Uploaded files, generated Excel or text outputs, file metadata, job status, and download or share metadata.",
      "Usage events such as batch size, processing time, credits, plan limits, and error states.",
      "Technical request data such as browser, device, IP-derived request information, and security logs.",
    ],
  },
  {
    id: "use",
    title: "How we use data",
    intro:
      "The data path is tied to conversion work and account operation. It is not an excuse to turn temporary paperwork into an unrelated archive.",
    items: [
      "Convert documents into structured spreadsheets or text output.",
      "Recover active jobs, keep history available, and protect downloads from unauthorized access.",
      "Manage free quotas, paid plans, billing status, credits, and abuse prevention.",
      "Apply verified Lemon Squeezy billing and subscription state to AxLiner limits.",
      "Improve reliability, queue performance, OCR quality, and support investigations.",
    ],
  },
  {
    id: "processors",
    title: "Storage and processors",
    intro:
      "AxLiner uses service providers where infrastructure, billing, auth, and document processing need them.",
    items: [
      "Supabase is used for authentication, database records, durable file metadata, and storage.",
      "Fly.io and Vercel host backend and frontend infrastructure.",
      "Lemon Squeezy acts as Merchant of Record for paid checkout, receipts, invoices, tax handling, and billing portal access.",
      "OCR processing may use external model infrastructure when needed to perform the conversion.",
    ],
  },
  {
    id: "retention",
    title: "Retention",
    intro:
      "Document software should distinguish working retention from permanent storage. AxLiner keeps data only along the service path and required account obligations.",
    items: [
      "Generated files are kept for a limited download and share window unless a product plan says otherwise.",
      "Job, credit, and billing metadata may be retained longer for account history, fraud prevention, tax, chargeback, and audit needs.",
      "Temporary processing files are scratch data and are not meant to replace a user's own records system.",
    ],
  },
  {
    id: "rights",
    title: "Sharing and rights",
    intro:
      "The user controls deliberate sharing. Rights requests need a clear account or file context so AxLiner can act on the correct data.",
    items: [
      "AxLiner does not sell personal data.",
      "Shared links are created only when a user requests sharing.",
      "Service providers receive only the data needed to operate the product.",
      "Users may request access, correction, deletion, or privacy support where legally possible.",
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <EditorialPageShell
      eyebrow="Privacy"
      title="Clear rules for the documents and account data moving through AxLiner."
      meta="Last updated: May 22, 2026"
      links={sections.map(({ id, title }) => ({ id, title }))}
      intro={
        <>
          <p>
            AxLiner processes document files to create spreadsheet and text outputs. This policy explains what data is
            handled, why the service needs it, and where users can ask for access, correction, or deletion.
          </p>
          <p>
            Uploaded images and PDFs support conversion, preview generation, review, and output delivery. Account,
            billing, usage, and job metadata exist so a batch can be limited, recovered, secured, and downloaded by
            the right owner.
          </p>
        </>
      }
    >
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-32 border-t border-border pt-9">
          <h2 className="text-3xl font-semibold tracking-normal">{section.title}</h2>
          <p className="mt-5 text-[19px] leading-8">{section.intro}</p>
          <ul className="mt-5 space-y-3">
            {section.items.map((item) => (
              <li key={item} className="flex gap-3 text-[19px] leading-8">
                <span className="mt-[14px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="border-t border-border pt-9">
        <h2 className="text-3xl font-semibold tracking-normal">Questions or deletion requests</h2>
        <p className="mt-5 text-[19px] leading-8">
          Use the contact page for privacy questions and file or account deletion support. If the request is a deletion
          request, use the account email when possible and state the action you want AxLiner to take.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild className="rounded-md px-6">
            <Link href="/contact">Contact AxLiner</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-md px-6">
            <Link href="/data-deletion">Data deletion</Link>
          </Button>
        </div>
      </section>
    </EditorialPageShell>
  )
}

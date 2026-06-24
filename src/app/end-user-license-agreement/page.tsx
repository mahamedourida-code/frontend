import type { Metadata } from "next"
import Link from "next/link"

import { EditorialPageShell } from "@/components/EditorialPageShell"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "End-User License Agreement | AxLiner",
  description:
    "End-User License Agreement for access to and use of the AxLiner document conversion service.",
  alternates: {
    canonical: "https://www.axliner.com/end-user-license-agreement",
  },
}

const sections = [
  {
    id: "license",
    title: "License to use AxLiner",
    body: [
      "Subject to this agreement and the applicable plan limits, AxLiner grants you a limited, non-exclusive, non-transferable, revocable right to access and use the service for your own lawful document conversion and review workflows.",
      "This license permits you to upload documents that you are authorized to process, review extracted output, correct results, and download or export available files. It does not transfer ownership of AxLiner software, models, interfaces, branding, or service technology.",
    ],
  },
  {
    id: "documents",
    title: "Your documents and outputs",
    body: [
      "You retain your rights in the files you submit and in the resulting output to the extent permitted by law and any rights in the original material. You grant AxLiner the limited permission needed to receive, process, store, preview, secure, and deliver those files as part of the service.",
      "You are responsible for confirming that extracted spreadsheets, text, invoice fields, receipt fields, or statement data are accurate before relying on them in bookkeeping, reporting, payment, tax, banking, or other operational work.",
    ],
  },
  {
    id: "restrictions",
    title: "Restrictions",
    body: [
      "You may not use AxLiner to process files without authorization, violate privacy or intellectual-property rights, distribute malware, bypass usage or billing limits, probe protected systems, or attempt to access another user's files or workspace.",
      "You may not reverse engineer, resell, sublicense, or copy the service except where applicable law expressly permits that activity despite this restriction.",
    ],
  },
  {
    id: "plans",
    title: "Accounts, plans, and availability",
    body: [
      "Some features require an account, a paid plan, credits, or supported integrations. Usage allowances, billing status, retention windows, and conversion capacity may depend on the active plan and current service limits.",
      "AxLiner may update, suspend, or discontinue parts of the service where necessary for security, maintenance, legal compliance, abuse prevention, provider availability, or product operation.",
    ],
  },
  {
    id: "warranty",
    title: "Output review and liability",
    body: [
      "Document extraction is an assisted workflow, not a substitute for professional review. Handwriting, scans, photos, page quality, layout, and source ambiguity can affect the accuracy of generated output.",
      "The service is provided subject to the Terms of Service and applicable law. You should retain source documents and review important extracted values before exporting them to a downstream accounting or business process.",
    ],
  },
  {
    id: "termination",
    title: "Termination and contact",
    body: [
      "This license remains effective while you use AxLiner in accordance with this agreement. It ends if your account is terminated, if you stop using the service, or if you materially breach these terms. Obligations concerning ownership, restrictions, records, and liability may survive termination where applicable.",
      "Questions about this agreement can be sent to contact@axliner.com. Privacy and deletion requests are handled through the related public policy pages.",
    ],
  },
]

export default function EndUserLicenseAgreementPage() {
  return (
    <EditorialPageShell
      eyebrow="Legal"
      title="End-User License Agreement"
      meta="Last updated: May 27, 2026"
      links={sections.map(({ id, title }) => ({ id, title }))}
      intro={
        <>
          <p>
            This End-User License Agreement governs your licensed access to AxLiner, a document conversion and review
            service for turning images and PDFs into structured outputs.
          </p>
          <p>
            By accessing or using AxLiner, you agree to this license together with the Terms of Service and Privacy
            Policy.
          </p>
        </>
      }
    >
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-32">
          <h2 className="text-3xl font-medium tracking-[-0.03em]">{section.title}</h2>
          <div className="mt-5 space-y-4">
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2 className="text-3xl font-medium tracking-[-0.03em]">Related policies</h2>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild variant="outline" className="px-6">
            <Link href="/terms-of-service">Terms of Service</Link>
          </Button>
          <Button asChild variant="outline" className="px-6">
            <Link href="/privacy-policy">Privacy Policy</Link>
          </Button>
          <Button asChild variant="glossy" className="px-6">
            <Link href="/contact">Contact AxLiner</Link>
          </Button>
        </div>
      </section>
    </EditorialPageShell>
  )
}

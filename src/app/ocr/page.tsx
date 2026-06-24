import type { Metadata } from "next";

import { ConversionMarketingPage } from "@/components/ConversionMarketingPage";

export const metadata: Metadata = {
  title: "OCR for Accounting Documents | AxLiner",
  description:
    "Extract mixed batches of invoices, receipts, statements, tables, and handwriting into reviewable accounting data.",
};

export default function OCRPage() {
  return (
    <ConversionMarketingPage
      eyebrow="Document OCR"
      title={
        <>
          OCR that knows <span className="text-[var(--landing-blue)]">what matters.</span>
        </>
      }
      intro="AxLiner reads the real accounting pile—phone photos, faded receipts, scans, tables, and handwriting—then keeps every extracted field reviewable."
      heroImage={{
        src: "/landing/hero-poster.png",
        alt: "AxLiner extracting structured fields from accounting documents",
        width: 1280,
        height: 720,
      }}
      sectionTitle={
        <>
          Extraction is only the <span className="text-[var(--landing-blue)]">first step.</span>
        </>
      }
      sectionIntro="The useful part is what happens next: classification, confidence flags, correction, and a clean path into the books."
      blocks={[
        {
          title: "The right schema",
          copy: "Invoices, receipts, statements, tables, and notes each get fields that match the document—not a generic text dump.",
        },
        {
          title: "Uncertainty is visible",
          copy: "Field- and row-level confidence signals surface values that need a human check before they move downstream.",
        },
        {
          title: "Reviewed data out",
          copy: "Keep the source beside the extracted fields, then export the batch or publish reviewed drafts to QuickBooks or Xero.",
        },
      ]}
      steps={[
        {
          title: "Send the batch",
          copy: "Upload mixed PDFs, images, scans, screenshots, and handwriting together.",
        },
        {
          title: "Classify and extract",
          copy: "AxLiner identifies each document and maps it onto the appropriate fields and rows.",
        },
        {
          title: "Check and deliver",
          copy: "Correct flagged fields, then export or publish the reviewed accounting drafts.",
        },
      ]}
      finalTitle="Give the messy pile a clean ending."
    />
  );
}

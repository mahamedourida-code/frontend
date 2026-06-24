import type { Metadata } from "next";

import { ConversionMarketingPage } from "@/components/ConversionMarketingPage";

export const metadata: Metadata = {
  title: "Handwritten to Excel Converter | AxLiner",
  description:
    "Convert batches of handwritten tables, notes, and expense records into reviewable Excel and CSV files.",
};

export default function HandwrittenToExcelPage() {
  return (
    <ConversionMarketingPage
      eyebrow="Handwriting to Excel"
      title={
        <>
          Handwriting in. <span className="text-[var(--landing-blue)]">Usable rows out.</span>
        </>
      }
      intro="Photograph handwritten tables, logs, and expense notes. AxLiner structures the batch and puts uncertain values in front of the reviewer."
      heroImage={{
        src: "/landing/hero-poster.png",
        alt: "AxLiner turning handwritten accounting documents into structured fields",
        width: 1280,
        height: 720,
      }}
      sectionTitle={
        <>
          Built for handwriting that <span className="text-[var(--landing-blue)]">needs a human check.</span>
        </>
      }
      sectionIntro="No vague accuracy promise. You get structured output, visible confidence signals, and the original page beside every correction."
      blocks={[
        {
          title: "Whole notebooks, not demos",
          copy: "Upload field logs, expense sheets, handwritten tables, and photographed notes as one working batch.",
        },
        {
          title: "Flags stay specific",
          copy: "AxLiner marks the field or row that needs attention so reviewers do not reread every page from the beginning.",
        },
        {
          title: "Structured for the next step",
          copy: "Export reviewed tables to Excel or CSV, or publish accounting-ready drafts to QuickBooks or Xero.",
        },
      ]}
      steps={[
        {
          title: "Photograph the pages",
          copy: "Capture handwritten tables or notes without sorting them into individual conversion jobs.",
        },
        {
          title: "Check the handwriting",
          copy: "Review flagged cells beside the original page and make corrections in place.",
        },
        {
          title: "Use the result",
          copy: "Send the reviewed batch to Excel, CSV, QuickBooks, or Xero.",
        },
      ]}
      finalTitle="Make the paper useful again."
    />
  );
}

import type { Metadata } from "next";

import { ConversionMarketingPage } from "@/components/ConversionMarketingPage";

export const metadata: Metadata = {
  title: "Products | AxLiner",
  description:
    "Batch invoices, receipts, statements, tables, and handwriting into reviewed Excel, CSV, QuickBooks, or Xero entries.",
};

export default function ProductsPage() {
  return (
    <ConversionMarketingPage
      eyebrow="AxLiner products"
      title={
        <>
          One workflow for the <span className="text-[var(--landing-blue)]">whole folder.</span>
        </>
      }
      intro="Batch invoices, receipts, statements, tables, and handwriting. Review the exceptions once, then export or publish."
      heroImage={{
        src: "/landing/folder-drop-poster.png",
        alt: "AxLiner accepting a full folder of mixed accounting documents",
        width: 1345,
        height: 728,
      }}
      sectionTitle={
        <>
          Built around the batch, <span className="text-[var(--landing-blue)]">not the file.</span>
        </>
      }
      sectionIntro="Every product starts with the same idea: keep the source, extracted fields, review state, and accounting destination together."
      blocks={[
        {
          title: "Mixed documents in",
          copy: "Drop photos, scans, PDFs, screenshots, and handwriting into one batch. AxLiner sorts each document onto the right schema.",
        },
        {
          title: "Flags before clutter",
          copy: "Field- and row-level signals move uncertain values to the front. Review what changed, then move on.",
        },
        {
          title: "Books-ready output",
          copy: "Download a clean workbook or publish reviewed draft entries to QuickBooks or Xero without entering the same data twice.",
        },
      ]}
      steps={[
        {
          title: "Upload the folder",
          copy: "Send the entire client batch in one pass instead of converting files one by one.",
        },
        {
          title: "Review the flags",
          copy: "Compare the source beside editable fields and correct only the exceptions.",
        },
        {
          title: "Finish the books",
          copy: "Export Excel or CSV, or publish reviewed drafts to QuickBooks or Xero.",
        },
      ]}
      finalTitle="Stop rekeying client folders."
    />
  );
}

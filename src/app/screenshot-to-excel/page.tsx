import type { Metadata } from "next";

import { ConversionMarketingPage } from "@/components/ConversionMarketingPage";

export const metadata: Metadata = {
  title: "Screenshot to Excel Converter | AxLiner",
  description:
    "Convert batches of screenshots into structured, reviewable Excel and CSV files without retyping tables.",
};

export default function ScreenshotToExcelPage() {
  return (
    <ConversionMarketingPage
      eyebrow="Screenshot to Excel"
      title={
        <>
          Screenshots become <span className="text-[var(--landing-blue)]">working data.</span>
        </>
      }
      intro="Drop a batch of captured tables, statements, and accounting screens. AxLiner rebuilds the structure and keeps every value reviewable."
      heroImage={{
        src: "/landing/folder-drop-poster.png",
        alt: "A mixed batch of screenshots entering the AxLiner workflow",
        width: 1345,
        height: 728,
      }}
      sectionTitle={
        <>
          Capture once. <span className="text-[var(--landing-blue)]">Review as a batch.</span>
        </>
      }
      sectionIntro="The spreadsheet is only the output. The real time saving comes from reviewing many screenshots in one consistent queue."
      blocks={[
        {
          title: "Every capture together",
          copy: "Upload screenshots from portals, emails, dashboards, and phones as a single batch instead of separate jobs.",
        },
        {
          title: "Rows stay traceable",
          copy: "The source screenshot remains beside the extracted table while uncertain cells rise to the top.",
        },
        {
          title: "Ready beyond Excel",
          copy: "Export reviewed rows to Excel or CSV, or publish supported accounting documents to QuickBooks or Xero.",
        },
      ]}
      steps={[
        {
          title: "Capture the source",
          copy: "Take screenshots from any system and send the entire set to one workspace.",
        },
        {
          title: "Resolve the flags",
          copy: "Compare questionable values against the original capture without switching tools.",
        },
        {
          title: "Move the data on",
          copy: "Export the finished batch or publish the reviewed accounting drafts.",
        },
      ]}
      finalTitle="Retire copy, paste, repeat."
    />
  );
}

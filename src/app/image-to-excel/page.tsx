import type { Metadata } from "next";

import { ConversionMarketingPage } from "@/components/ConversionMarketingPage";

export const metadata: Metadata = {
  title: "Image to Excel Converter | AxLiner",
  description:
    "Convert batches of document images into reviewable Excel and CSV files, with accounting-ready publishing to QuickBooks or Xero.",
};

export default function ImageToExcelPage() {
  return (
    <ConversionMarketingPage
      title={
        <>
          Turn image batches into <span className="text-[var(--landing-blue)]">clean spreadsheets.</span>
        </>
      }
      intro="Upload the photos, scans, and screenshots together. AxLiner preserves the rows, flags uncertain cells, and produces one reviewed output."
      heroImage={{
        src: "/photos/istockphoto-2273856415-612x612.jpg",
        alt: "Man photographing an invoice with a smartphone",
        width: 612,
        height: 612,
      }}
      sectionTitle={
        <>
          More than image conversion. <span className="text-[var(--landing-blue)]">A review workflow.</span>
        </>
      }
      sectionIntro="Spreadsheets become useful when the source, structure, and corrections stay connected from upload to export."
      blocks={[
        {
          title: "Batch the images",
          copy: "Combine JPG, PNG, WebP, HEIC, scans, and PDFs instead of repeating the same upload-and-download loop.",
        },
        {
          title: "Keep the table intact",
          copy: "Rows, columns, headers, totals, and line items stay structured and editable in the review board.",
        },
        {
          title: "Choose the destination",
          copy: "Download reviewed Excel or CSV files, or move accounting documents into QuickBooks or Xero as reviewed drafts.",
        },
      ]}
      steps={[
        {
          title: "Drop the batch",
          copy: "Upload every image from the folder in one pass, from phone photos to clean scans.",
        },
        {
          title: "Review the cells",
          copy: "Open flagged rows first and compare each value directly against its source image.",
        },
        {
          title: "Export once",
          copy: "Download the reviewed workbook or publish the accounting drafts when the batch is ready.",
        },
      ]}
      finalTitle="Turn the camera roll into finished rows."
    />
  );
}

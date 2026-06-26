import type { Metadata } from "next";

import { ConversionMarketingPage } from "@/components/ConversionMarketingPage";

export const metadata: Metadata = {
  title: "JPG to Excel Converter | AxLiner",
  description:
    "Convert batches of JPG and JPEG document photos into structured, reviewable Excel and CSV files.",
};

export default function JpgToExcelPage() {
  return (
    <ConversionMarketingPage
      title={
        <>
          JPG folders become <span className="text-[var(--landing-blue)]">reviewed workbooks.</span>
        </>
      }
      intro="Upload the camera photos together. AxLiner reads the documents, rebuilds the rows, and shows exactly what needs review."
      heroImage={{
        src: "/photos/istockphoto-2273856415-612x612.jpg",
        alt: "A JPG document being captured with a phone beside a laptop, ready for AxLiner",
        width: 612,
        height: 323,
      }}
      sectionTitle={
        <>
          A converter designed for the <span className="text-[var(--landing-blue)]">entire folder.</span>
        </>
      }
      sectionIntro="JPG is the input format. The product is a batch review process that carries clean data all the way to its destination."
      blocks={[
        {
          title: "Camera photos welcome",
          copy: "Send scans, exports, and phone photos together. AxLiner handles them in one batch without a file-by-file loop.",
        },
        {
          title: "Source beside output",
          copy: "Reviewers can verify flagged fields against the original JPG while editing the structured result.",
        },
        {
          title: "One reviewed delivery",
          copy: "Download Excel or CSV, or send supported reviewed drafts to QuickBooks or Xero when the batch is complete.",
        },
      ]}
      steps={[
        {
          title: "Upload every JPG",
          copy: "Drop the complete set of document photos into a single batch.",
        },
        {
          title: "Review the exceptions",
          copy: "Check the fields and rows AxLiner flags instead of rereading every image.",
        },
        {
          title: "Deliver the batch",
          copy: "Export the reviewed workbook or publish supported drafts to the books.",
        },
      ]}
      finalTitle="Finish the folder, not one JPG."
    />
  );
}

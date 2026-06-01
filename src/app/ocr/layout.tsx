import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How AxLiner Reads Your Documents — OCR Engine",
  description:
    "AxLiner reads the messy stuff other tools refuse: handwriting, phone photos in bad light, faded thermal receipts. Every field is extracted with per-field confidence flags so you review exceptions, not everything.",
  openGraph: {
    title: "How AxLiner Reads Your Documents — OCR Engine",
    description:
      "Handwriting, WhatsApp photos, faded thermal receipts — AxLiner extracts them all into reviewable Excel/CSV with per-field confidence flags.",
    url: "https://www.axliner.com/ocr",
    siteName: "AxLiner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How AxLiner Reads Your Documents",
    description:
      "Per-field confidence flags on every extracted field. Review exceptions, not everything.",
  },
};

export default function OCRLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";
import { Nunito, Caveat } from "next/font/google";
import "./globals.css";
import "../styles/mobile-nav.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ProcessingStateProvider } from "@/contexts/ProcessingStateContext";
import { Toaster } from "sonner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Image to Excel – FREE OCR Model",
  description: "Convert images and handwritten tables to Excel for free , up to 100 in one click , with Axliner's 7B OCR model fine-tuned on Llama 3. Fast, accurate, and built for scale.",
  keywords: ["image to excel free", "AI OCR", "Llama 3", "7B model", "handwritten OCR", "table extractor", "screenshot to excel", "Axliner"],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://axliner.com/",
  },
  icons: {
    icon: [
      { url: '/crop.png' },
      { url: '/crop.png', sizes: '32x32', type: 'image/png' },
      { url: '/crop.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/crop.png',
    apple: '/crop.png',
    other: [
      {
        rel: 'apple-touch-icon',
        url: '/crop.png',
      },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "Image to Excel - 7B finetuned Llama 3 OCR Model",
    description: "Convert images and handwritten tables to Excel — up to 100 in one click — with Axliner's 7B OCR model fine-tuned on Llama 3. Fast, accurate, and built for scale.",
    url: "https://axliner.com/",
    siteName: "Axliner",
    type: "website",
    images: [
      {
        url: 'https://axliner.com/crop.png',
        width: 512,
        height: 512,
        alt: 'Axliner Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Image to Excel - 7B finetuned Llama 3 OCR Model",
    description: "Convert images and handwritten tables to Excel — up to 100 in one click — with Axliner's 7B OCR model fine-tuned on Llama 3. Fast, accurate, and built for scale.",
    images: ['https://axliner.com/crop.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${caveat.variable} antialiased font-sans bg-background text-foreground`}
        style={{ fontFamily: 'var(--font-nunito)' }}
      >
        <ThemeProvider defaultTheme="light" storageKey="AxLiner-theme">
          <ProcessingStateProvider>
            {children}
            <Toaster richColors position="top-right" />
          </ProcessingStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

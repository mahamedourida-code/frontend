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
  title: "Axliner - Convert Images & Screenshots to Excel Instantly",
  description: "Axliner converts any image, screenshot, or handwritten table into an editable Excel file. Fast, accurate, and simple. Try it now!",
  keywords: ["image to excel", "screenshot to excel", "convert image to excel", "Axliner", "handwritten table to excel", "OCR to excel", "table extraction"],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://axliner.com/",
  },
  icons: {
    icon: '/crop.png',
    shortcut: '/crop.png',
    apple: '/crop.png',
  },
  openGraph: {
    title: "Axliner - Convert Images & Screenshots to Excel Instantly",
    description: "Axliner converts any image, screenshot, or handwritten table into an editable Excel file. Fast, accurate, and simple. Try it now!",
    url: "https://axliner.com/",
    siteName: "Axliner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axliner - Convert Images & Screenshots to Excel Instantly",
    description: "Axliner converts any image, screenshot, or handwritten table into an editable Excel file. Fast, accurate, and simple. Try it now!",
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

import type { Metadata } from "next";
import { Caveat, Inter } from "next/font/google";
import "./globals.css";
import "../styles/mobile-nav.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ProcessingStateProvider } from "@/contexts/ProcessingStateContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AxLiner — Invoice & Document Review for Bookkeepers",
  description: "Process invoices, receipts, bank statements, and handwritten documents in one batch. Review everything before it touches QuickBooks. No per-client minimums.",
  keywords: ["invoice processing", "bookkeeper software", "document OCR", "QuickBooks invoice import", "bank statement extraction", "accounts payable automation", "handwritten OCR", "Axliner"],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://axliner.com/",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon-192.png',
    other: [
      {
        rel: 'apple-touch-icon',
        url: '/icon-192.png',
      },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "AxLiner — Invoice & Document Review for Bookkeepers",
    description: "Process invoices, receipts, bank statements, and handwritten documents in one batch. Reviewed by you before QuickBooks.",
    url: "https://axliner.com/",
    siteName: "Axliner",
    type: "website",
    images: [
      {
        url: 'https://axliner.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AxLiner',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AxLiner — Invoice & Document Review for Bookkeepers",
    description: "Process invoices, receipts, bank statements, and handwritten documents in one batch. Reviewed by you before QuickBooks.",
    images: ['https://axliner.com/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-E85ZH4VGDN"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-E85ZH4VGDN');
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${caveat.variable} antialiased font-sans bg-background text-foreground relative overflow-x-hidden`}
      >
        <ThemeProvider defaultTheme="light" storageKey="AxLiner-theme">
          <AuthProvider>
            <ProcessingStateProvider>
              <div className="relative z-10">
                {children}
              </div>
              <Toaster
                richColors
                position="top-right"
                toastOptions={{ duration: 3500, className: "ax-toast ax-interactive" }}
              />
            </ProcessingStateProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

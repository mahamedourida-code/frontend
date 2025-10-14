import type { Metadata } from "next";
import { Nunito, Caveat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
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
  title: "Exceletto",
  description: "Transform any screenshot into a structured Excel spreadsheet with just one click. Save hours of manual data entry with our AI-powered OCR technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${caveat.variable} antialiased font-sans`}
        style={{ fontFamily: 'var(--font-nunito)' }}
      >
        <ThemeProvider defaultTheme="light" storageKey="exceletto-theme">
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Screenshot to Excel Converter - Free Online Tool | AxLiner',
  description: 'Transform screenshots to Excel spreadsheets instantly. Upload table screenshots and convert them to downloadable XLSX files with AI-powered OCR. Free, no signup.',
  keywords: 'screenshot to excel, convert screenshot to excel, screenshot to xlsx, screen capture to spreadsheet',
  openGraph: {
    title: 'Screenshot to Excel  Converter - Free Online Tool | AxLiner',
    description: 'Transform screenshots to Excel spreadsheets instantly. Upload table screenshots and convert them to downloadable XLSX files.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

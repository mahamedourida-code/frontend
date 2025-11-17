import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Handwritten Table to Excel Converter - AI OCR Tool | AxLiner',
  description: 'Convert handwritten tables to Excel with 7B parameter AI model. Specialized OCR for handwritten text recognition. Upload handwritten table images, get editable XLSX files.',
  keywords: 'handwritten to excel, handwritten table to excel, handwriting recognition, handwritten ocr, convert handwriting to excel',
  openGraph: {
    title: 'Handwritten Table to Excel Converter - AI OCR Tool | AxLiner',
    description: 'Convert handwritten tables to Excel with specialized AI model. Accurate handwriting recognition and table extraction.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

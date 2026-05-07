export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
  supportingImage: string;
  supportingImageAlt: string;
  authorName: string;
  authorRole: string;
  authorImage: string;
  authorImageAlt: string;
  keywords: string[];
  intro: string;
  sections: Array<{
    title: string;
    body: string[];
  }>;
  takeaway: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "handwritten-paper-tables-to-excel",
    title: "How to Turn Handwritten Paper Tables Into Excel Without Retyping",
    description:
      "A practical guide for converting handwritten paper tables, notes, receipts, and forms into clean Excel spreadsheets without hours of manual typing.",
    eyebrow: "Handwritten OCR",
    date: "May 7, 2026",
    readTime: "5 min read",
    image: "/subsolution/accounting.jpg",
    imageAlt: "Accounting paperwork prepared for handwritten table extraction",
    supportingImage: "/subsolution/backoffice-automation.webp",
    supportingImageAlt: "Backoffice documents ready for spreadsheet automation",
    authorName: "Anna Kowalska",
    authorRole: "Handwritten document workflow specialist",
    authorImage: "/testimonials/alex_finn.jpg",
    authorImageAlt: "Anna Kowalska, handwritten document workflow specialist",
    keywords: [
      "handwritten paper to Excel",
      "handwritten table OCR",
      "convert paper tables to spreadsheet",
      "hand-filled forms to Excel",
    ],
    intro:
      "Handwritten paperwork still runs through real businesses every day. A delivery sheet signed in the field, a class table written by hand, a receipt batch, or a paper form filled with a pen can all become spreadsheet work later. The slow part is not taking the photo. The slow part is rebuilding the rows and columns by hand.",
    sections: [
      {
        title: "Start with the table, not just the text",
        body: [
          "Basic OCR can read words, but handwritten tables need more than loose text. The useful result is a spreadsheet where totals, dates, names, quantities, and notes land in the right cells. Before uploading, make sure the page is flat, the table edges are visible, and shadows do not cover the handwriting.",
          "If the paper has several small tables, keep the whole page in frame. AxLiner is designed for spreadsheet output, so preserving the shape of the paper table matters as much as recognizing the ink.",
        ],
      },
      {
        title: "Use batches when the work is repetitive",
        body: [
          "Most manual data entry becomes painful because the same job repeats. One handwritten inventory page is manageable. Fifty hand-filled sheets from a week of operations become a backlog. Batch conversion lets a team upload the paperwork together, wait for processing, then review the outputs instead of typing every row.",
          "That workflow is especially useful for invoices, receipts, classroom notes, field logs, checklists, and forms where the format changes a little but the final destination is still Excel.",
        ],
      },
      {
        title: "Review like an operator, not a typist",
        body: [
          "The best process is not blind automation. It is faster review. Once the handwritten page becomes an XLSX file, the person who knows the data can scan for unusual numbers, correct unclear handwriting, and send the spreadsheet into reporting or accounting.",
          "That keeps the human in the right place: checking meaning and context, not copying the same paper line into a cell over and over.",
        ],
      },
    ],
    takeaway:
      "For handwritten paper, the goal is not only recognition. The goal is a clean spreadsheet that keeps the structure of the original page and gives people less typing to do.",
  },
  {
    slug: "batch-processing-handwritten-forms",
    title: "A Simple Batch Workflow for Handwritten Forms, Notes, and Scanned Paper",
    description:
      "Learn how SaaS teams and operations teams handle handwritten forms in batches so users can upload mixed paper documents and receive clean spreadsheet results.",
    eyebrow: "Batch processing",
    date: "May 7, 2026",
    readTime: "6 min read",
    image: "/subsolution/Construction.png",
    imageAlt: "Construction field paperwork used for handwritten form processing",
    supportingImage: "/subsolution/healthcare.jpg",
    supportingImageAlt: "Healthcare administrative forms prepared for structured extraction",
    authorName: "Tomasz Nowak",
    authorRole: "Batch OCR operations analyst",
    authorImage: "/testimonials/tom_blomfield.jpg",
    authorImageAlt: "Tomasz Nowak, batch OCR operations analyst",
    keywords: [
      "batch handwritten forms",
      "scan handwritten notes to Excel",
      "paper form OCR workflow",
      "handwritten document processing",
    ],
    intro:
      "People do not upload perfect files. They upload phone photos, scanned PDFs, receipts, field notes, hand-filled forms, and mixed batches from a busy day. A good document product should accept that reality and still make the next step obvious.",
    sections: [
      {
        title: "Keep upload simple",
        body: [
          "The upload step should feel forgiving. Users should be able to drag images and PDFs together, see what was accepted, and understand what will happen before they start conversion. If a PDF has five pages, treating those pages like individual document images is often the cleanest mental model.",
          "That is how modern SaaS products reduce friction: the user brings the paper, the system prepares the pages, and the interface keeps the batch visible.",
        ],
      },
      {
        title: "Show progress around the job, not the file input",
        body: [
          "After the batch starts, users care about trust. They want to know that the job is still running, that completed pages are not lost, and that they can come back if the browser reloads. Durable job status is more important than decorative progress text.",
          "For handwritten forms, this matters because a batch may include easy printed tables and harder pen-written lines. Some pages finish quickly, while others need more processing time.",
        ],
      },
      {
        title: "Deliver outputs that are easy to inspect",
        body: [
          "The best output is not a mysterious download button. Users should see the original page preview beside the extracted result, then download a spreadsheet or text file when they are ready. This makes the product feel controlled and professional.",
          "For teams handling construction logs, healthcare forms, backoffice records, or finance paperwork, a clear review step builds confidence before the data moves into another system.",
        ],
      },
    ],
    takeaway:
      "Batch processing works when upload, progress, recovery, review, and download all feel connected. That is what turns messy handwritten paper into a reliable spreadsheet workflow.",
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

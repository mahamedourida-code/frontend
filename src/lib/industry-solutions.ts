export type IndustrySolution = {
  slug: string;
  title: string;
  cardAsset: string;
  detailImage: string;
  eyebrow: string;
  headline: string;
  summary: string;
  proof: string;
  useCases: string[];
  workflow: string[];
  outcomes: string[];
};

export const POLIVALENT_SOLUTION_IMAGE = "/subsolution/polivalent.jpg";

export const industrySolutions: IndustrySolution[] = [
  {
    slug: "accounting",
    title: "Accounting",
    cardAsset: "/solution/accounting.svg",
    detailImage: "/subsolution/accounting.jpg",
    eyebrow: "Accounting operations",
    headline: "Receipts, invoices, and expense tables ready for review.",
    summary:
      "AxLiner turns financial paperwork into structured spreadsheets without forcing the team to retype line items, totals, dates, or vendor fields by hand.",
    proof: "Built for monthly close, reimbursements, bookkeeping handoff, and messy scans from real operators.",
    useCases: ["Invoice line items", "Receipt batches", "Expense reports", "Bank statement tables"],
    workflow: ["Upload mixed accounting images", "Review extracted rows and totals", "Export clean XLSX files"],
    outcomes: ["Faster bookkeeping prep", "Cleaner audit trails", "Less manual spreadsheet repair"],
  },
  {
    slug: "banking",
    title: "Banking",
    cardAsset: "/solution/banking.svg",
    detailImage: "/subsolution/banking.webp",
    eyebrow: "Banking document intake",
    headline: "Structured tables from checks, statements, and onboarding files.",
    summary:
      "Use AxLiner to standardize document-heavy banking workflows where scanned forms, handwritten notes, and tabular records need to become reliable spreadsheet data.",
    proof: "Useful for operations teams that need fast extraction before verification, review, and downstream systems.",
    useCases: ["Loan packets", "KYC forms", "Check logs", "Statement tables"],
    workflow: ["Collect documents from branches or users", "Extract fields and table structure", "Send XLSX to review queues"],
    outcomes: ["Shorter intake cycles", "Less rekeying", "More consistent review files"],
  },
  {
    slug: "backoffice-automation",
    title: "Backoffice Automation",
    cardAsset: "/solution/Backoffice%20Automation.svg",
    detailImage: "/subsolution/backoffice-automation.webp",
    eyebrow: "Backoffice automation",
    headline: "Batch paperwork extraction for teams that live inside spreadsheets.",
    summary:
      "AxLiner helps admin and operations teams convert scanned forms, tables, invoices, and records into clean Excel outputs that can move through internal workflows.",
    proof: "Designed for repetitive work where speed matters, but the output still needs to be easy for a person to check.",
    useCases: ["Internal forms", "Vendor records", "Operations logs", "Paper tables"],
    workflow: ["Upload a batch", "Let AxLiner preserve rows and columns", "Download structured files"],
    outcomes: ["Lower data-entry load", "Faster handoffs", "Cleaner shared records"],
  },
  {
    slug: "construction",
    title: "Construction",
    cardAsset: "/solution/Construction.svg",
    detailImage: "/subsolution/Construction.png",
    eyebrow: "Construction field records",
    headline: "Site notes, checklists, and delivery logs converted into Excel.",
    summary:
      "AxLiner gives construction teams a practical way to move field paperwork into structured spreadsheets without losing table layout or handwritten details.",
    proof: "Useful for project managers, site admins, and operations teams handling mixed-quality scans from the field.",
    useCases: ["Delivery tickets", "Material logs", "Inspection forms", "Daily site notes"],
    workflow: ["Capture paperwork on site", "Process handwritten tables", "Share XLSX with office teams"],
    outcomes: ["Current project records", "Fewer missed fields", "Less end-of-week typing"],
  },
  {
    slug: "cpg-brands",
    title: "CPG Brands",
    cardAsset: "/solution/CPG%20Brands.svg",
    detailImage: "/subsolution/CGP-brands.webp",
    eyebrow: "CPG operations",
    headline: "Retail, inventory, and distributor paperwork in spreadsheet form.",
    summary:
      "AxLiner helps consumer brands process store forms, inventory sheets, purchase records, and field reports into structured files for operations review.",
    proof: "Made for teams comparing information across stores, distributors, regions, or field operators.",
    useCases: ["Inventory forms", "Retail reports", "Purchase records", "Distributor sheets"],
    workflow: ["Collect field documents", "Extract rows into Excel", "Compare data across locations"],
    outcomes: ["Faster reporting", "Cleaner comparisons", "Less spreadsheet cleanup"],
  },
  {
    slug: "fintech",
    title: "FinTech",
    cardAsset: "/solution/FinTech.svg",
    detailImage: "/subsolution/FinTech.jpg",
    eyebrow: "FinTech document flows",
    headline: "Document extraction for financial products and user uploads.",
    summary:
      "AxLiner supports fintech teams that need to convert user-uploaded images, statements, forms, and handwritten tables into clean files for review and operations.",
    proof: "Works best as a fast extraction layer before validation, underwriting, reconciliation, or support workflows.",
    useCases: ["User uploads", "Statement tables", "Application forms", "Support documents"],
    workflow: ["Receive document images", "Extract structured spreadsheets", "Review and push downstream"],
    outcomes: ["Faster verification", "Better batch handling", "Lower support workload"],
  },
  {
    slug: "healthcare",
    title: "Healthcare",
    cardAsset: "/solution/Healthcare.svg",
    detailImage: "/subsolution/healthcare.jpg",
    eyebrow: "Healthcare administration",
    headline: "Handwritten logs and admin forms converted into clean tables.",
    summary:
      "AxLiner helps healthcare administrators digitize logs, intake sheets, inventory records, and paper tables while keeping the output easy to review.",
    proof: "Use it for operational paperwork where accuracy, traceability, and clean spreadsheet handoff matter.",
    useCases: ["Intake forms", "Lab sheets", "Inventory logs", "Administrative tables"],
    workflow: ["Upload scanned records", "Extract tables and fields", "Review XLSX before sharing"],
    outcomes: ["Less manual entry", "Cleaner reporting", "Faster admin workflows"],
  },
  {
    slug: "real-estate",
    title: "Real Estate",
    cardAsset: "/solution/Real%20Estate.svg",
    detailImage: "/subsolution/Real-estate.jpg",
    eyebrow: "Real estate operations",
    headline: "Property records, inspection forms, and lease tables in Excel.",
    summary:
      "AxLiner converts real estate paperwork into structured spreadsheets for brokers, property managers, transaction teams, and backoffice operators.",
    proof: "Good for teams moving information from physical packets, PDF screenshots, and handwritten forms into organized records.",
    useCases: ["Inspection forms", "Lease packets", "Rent rolls", "Closing checklists"],
    workflow: ["Upload property documents", "Extract fields and tables", "Download review-ready XLSX"],
    outcomes: ["Faster deal admin", "Cleaner property records", "Less manual consolidation"],
  },
];

export function getIndustrySolution(slug: string) {
  return industrySolutions.find((solution) => solution.slug === slug);
}

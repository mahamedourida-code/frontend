// Onboarding option sets. Icons reuse existing /public assets where they already
// exist (doc types, accounting logos) and the generated /onboarding/* set otherwise.

export type OnboardingAnswers = {
  firstName: string
  lastName: string
  orgName: string
  role: string | null
  docTypes: string[]
  volume: string | null
  destinations: string[]
  heard: string | null
  heardOther: string
}

export const EMPTY_ANSWERS: OnboardingAnswers = {
  firstName: "",
  lastName: "",
  orgName: "",
  role: null,
  docTypes: [],
  volume: null,
  destinations: [],
  heard: null,
  heardOther: "",
}

export type Option = { id: string; label: string; icon: string; hint?: string }

export const ROLES: Option[] = [
  { id: "bookkeeper", label: "Bookkeeper", icon: "/onboarding/roles/bookkeeper.png" },
  { id: "accountant", label: "Accountant or firm", icon: "/onboarding/roles/accountant-firm.png" },
  { id: "business-owner", label: "Business owner", icon: "/onboarding/roles/business-owner.png" },
  { id: "freelancer", label: "Freelancer", icon: "/onboarding/roles/freelancer.png" },
]

export const DOC_TYPES: Option[] = [
  { id: "invoice", label: "Invoices", icon: "/icons/doc-types-v3/invoice.png" },
  { id: "receipt", label: "Receipts", icon: "/icons/doc-types-v3/receipt.png" },
  { id: "bank-statement", label: "Bank statements", icon: "/icons/doc-types-v3/bank-statement.png" },
  { id: "table", label: "Tables", icon: "/icons/doc-types-v3/table.png" },
  { id: "notes", label: "Notes", icon: "/icons/doc-types-v3/notes.png" },
  { id: "auto-detect", label: "A mix of everything", icon: "/icons/doc-types-v3/auto-detect.png" },
]

export const VOLUME: Option[] = [
  { id: "low", label: "Just a few", hint: "Under 50 a month", icon: "" },
  { id: "steady", label: "A steady stack", hint: "50 to 200 a month", icon: "" },
  { id: "high", label: "High volume", hint: "200 to 1,000 a month", icon: "" },
  { id: "firm", label: "Firm-scale", hint: "1,000 and up", icon: "" },
]

export const DESTINATIONS: Option[] = [
  { id: "quickbooks", label: "QuickBooks", icon: "/logos/quickbooks.png" },
  { id: "xero", label: "Xero", icon: "/logos/xero.png" },
  { id: "spreadsheet", label: "Excel or Sheets", icon: "/logos/excel.png" },
  { id: "undecided", label: "Not sure yet", icon: "/onboarding/dest/not-sure.png" },
]

export const HEARD: Option[] = [
  { id: "search", label: "Google search", icon: "/onboarding/heard/search.png" },
  { id: "linkedin", label: "LinkedIn", icon: "/onboarding/heard/linkedin.png" },
  { id: "youtube", label: "YouTube", icon: "/onboarding/heard/youtube.png" },
  { id: "reddit", label: "Reddit", icon: "/onboarding/heard/reddit.png" },
  { id: "blog", label: "Blog or article", icon: "/onboarding/heard/blog.png" },
  { id: "accountant", label: "My accountant", icon: "/onboarding/heard/accountant.png" },
  { id: "podcast", label: "Podcast", icon: "/onboarding/heard/podcast.png" },
]

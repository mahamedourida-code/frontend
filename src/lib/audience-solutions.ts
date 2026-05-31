import type { LucideIcon } from "lucide-react";
import {
  BookOpenCheck,
  ClipboardCheck,
  FolderOpen,
  Inbox,
  ReceiptText,
  ScanSearch,
  UsersRound,
  Workflow,
} from "lucide-react";

export type AudienceSolutionSlug =
  | "solo-bookkeepers"
  | "accounting-practices"
  | "mixed-batch-processing"
  | "client-intake"
  | "batch-review-board"
  | "team-review"
  | "quickbooks-draft-bills"
  | "accounts-payable-queue";

export type AudienceSolution = {
  slug: AudienceSolutionSlug;
  title: string;
  menuLabel: string;
  icon: LucideIcon;
  eyebrow: string;
  headline: string;
  summary: string;
  proof: string;
  signals: Array<{
    value: string;
    label: string;
  }>;
  benefits: Array<{
    title: string;
    description: string;
  }>;
  workflow: Array<{
    title: string;
    description: string;
  }>;
  related: AudienceSolutionSlug[];
};

export const audienceSolutions: AudienceSolution[] = [
  {
    slug: "solo-bookkeepers",
    title: "AxLiner for solo bookkeepers",
    menuLabel: "Solo bookkeepers",
    icon: BookOpenCheck,
    eyebrow: "For solo bookkeepers",
    headline: "Move a client folder from paperwork to reviewed books without rebuilding every row.",
    summary:
      "Upload mixed invoices, receipts, statements, and notes as one batch. AxLiner classifies the files, extracts the accounting details, and gives you one calm review board for the exceptions.",
    proof:
      "Keep the review step in your hands, then export clean files or publish reviewed draft bills to QuickBooks Online.",
    signals: [
      { value: "One batch", label: "for mixed client paperwork" },
      { value: "One board", label: "for flagged fields and rows" },
      { value: "One handoff", label: "to Excel, CSV, or QuickBooks" },
    ],
    benefits: [
      {
        title: "Protect your close-day focus",
        description:
          "Start with the whole client folder instead of opening and rekeying one document at a time.",
      },
      {
        title: "Review the exceptions",
        description:
          "See source documents beside editable fields so the uncertain parts get attention before export.",
      },
      {
        title: "Finish with a useful output",
        description:
          "Download corrected spreadsheets or send reviewed invoice drafts into QuickBooks Online.",
      },
    ],
    workflow: [
      {
        title: "Drop the client batch",
        description: "Combine invoices, receipts, statements, and notes in one upload.",
      },
      {
        title: "Correct what needs judgment",
        description: "Work through flagged rows while the source document stays in view.",
      },
      {
        title: "Export or publish",
        description: "Leave with corrected files or reviewed draft bills, ready for the next accounting step.",
      },
    ],
    related: ["mixed-batch-processing", "batch-review-board", "quickbooks-draft-bills"],
  },
  {
    slug: "accounting-practices",
    title: "AxLiner for accounting practices",
    menuLabel: "Accounting practices",
    icon: UsersRound,
    eyebrow: "For accounting practices",
    headline: "Give every client batch a visible path from intake to reviewer sign-off.",
    summary:
      "AxLiner helps practices process document-heavy client work without turning the close into a chain of private spreadsheets and status messages.",
    proof:
      "Collect files, review exceptions, coordinate reviewers, and prepare draft bills for QuickBooks Online from a workflow shaped around accounting operations.",
    signals: [
      { value: "Shared intake", label: "for recurring client files" },
      { value: "Clear queues", label: "for reviewers and exceptions" },
      { value: "Draft bills", label: "for controlled QuickBooks handoff" },
    ],
    benefits: [
      {
        title: "Standardize client intake",
        description:
          "Bring uploaded documents into an organized flow before they scatter across inboxes and folders.",
      },
      {
        title: "Route review work clearly",
        description:
          "Keep the source, extracted fields, confidence flags, and reviewer progress close together.",
      },
      {
        title: "Publish after review",
        description:
          "Prepare reviewed draft bills for QuickBooks Online without auto-approving or paying anything.",
      },
    ],
    workflow: [
      {
        title: "Collect the paperwork",
        description: "Give client batches a consistent intake path for the team.",
      },
      {
        title: "Assign the review",
        description: "Let reviewers correct the flagged work while progress stays visible.",
      },
      {
        title: "Move approved drafts downstream",
        description: "Publish reviewed draft bills to QuickBooks Online with control intact.",
      },
    ],
    related: ["client-intake", "team-review", "accounts-payable-queue"],
  },
  {
    slug: "mixed-batch-processing",
    title: "Mixed batch processing",
    menuLabel: "Mixed batch processing",
    icon: FolderOpen,
    eyebrow: "Prepare the batch",
    headline: "Drop the whole folder. Let each accounting document find the right lane.",
    summary:
      "AxLiner accepts mixed client paperwork in one batch, then separates the work so invoices, receipts, statements, tables, and notes can move through the right extraction flow.",
    proof:
      "The value is not one-file conversion. It is clearing the folder while preserving a review step for the documents that need attention.",
    signals: [
      { value: "Mixed files", label: "in a single upload" },
      { value: "Auto-detect", label: "for document routing" },
      { value: "Batch status", label: "for visible progress" },
    ],
    benefits: [
      {
        title: "Start with the real folder",
        description: "Process mixed client documents together instead of sorting them into separate upload rituals.",
      },
      {
        title: "Keep routing visible",
        description: "See how files were classified before review and correct the work that needs a closer look.",
      },
      {
        title: "Clear backlogs in batches",
        description: "Use the same workflow for recurring close work and document-heavy cleanup projects.",
      },
    ],
    workflow: [
      {
        title: "Upload mixed documents",
        description: "Select the client folder without pre-sorting every file type.",
      },
      {
        title: "Let AxLiner classify the batch",
        description: "Each document enters the extraction flow that fits its structure.",
      },
      {
        title: "Open the review board",
        description: "Correct flagged exceptions before the corrected batch leaves the workspace.",
      },
    ],
    related: ["solo-bookkeepers", "batch-review-board", "client-intake"],
  },
  {
    slug: "client-intake",
    title: "Client intake",
    menuLabel: "Client intake",
    icon: Inbox,
    eyebrow: "Prepare the batch",
    headline: "Give client paperwork a front door before the review queue fills up.",
    summary:
      "Use a repeatable intake path for the documents clients send throughout the month, then move those files into a batch that is ready for extraction and review.",
    proof:
      "A cleaner intake step means less time assembling the real workload after it has already arrived in several places.",
    signals: [
      { value: "Client links", label: "for simpler uploads" },
      { value: "Inbox flow", label: "for collected paperwork" },
      { value: "Ready batches", label: "for the review queue" },
    ],
    benefits: [
      {
        title: "Reduce chasing",
        description: "Give clients a simpler way to submit paperwork without asking them to learn your internal workflow.",
      },
      {
        title: "Organize before review",
        description: "Move incoming files into the right client batch while the status is still easy to understand.",
      },
      {
        title: "Keep the handoff clean",
        description: "Start review with a visible batch instead of a folder assembled from several private sources.",
      },
    ],
    workflow: [
      {
        title: "Share the intake path",
        description: "Collect client paperwork through a clear upload experience.",
      },
      {
        title: "Prepare the batch",
        description: "Group the submitted files into the client work that needs review.",
      },
      {
        title: "Move into extraction",
        description: "Send the organized batch forward without reassembling the folder by hand.",
      },
    ],
    related: ["accounting-practices", "mixed-batch-processing", "team-review"],
  },
  {
    slug: "batch-review-board",
    title: "Batch Review Board",
    menuLabel: "Batch Review Board",
    icon: ScanSearch,
    eyebrow: "Review the exceptions",
    headline: "Review the batch where the source document and the corrected row stay together.",
    summary:
      "AxLiner gives bookkeepers a focused review board for the fields and rows that need judgment before a spreadsheet export or QuickBooks handoff.",
    proof:
      "Confidence flags direct attention without pretending that accounting review can be replaced by a blanket accuracy percentage.",
    signals: [
      { value: "Side by side", label: "source and editable output" },
      { value: "Field flags", label: "for targeted review" },
      { value: "Batch view", label: "for exception progress" },
    ],
    benefits: [
      {
        title: "See the evidence",
        description: "Keep the original scan visible while you correct the extracted field or spreadsheet row.",
      },
      {
        title: "Focus reviewer time",
        description: "Work the flagged exceptions instead of scanning every clean result with equal effort.",
      },
      {
        title: "Export reviewed work",
        description: "Move corrected data downstream only after the batch has had the human pass it needs.",
      },
    ],
    workflow: [
      {
        title: "Open the batch",
        description: "See document status and exception counts before review begins.",
      },
      {
        title: "Correct flagged fields",
        description: "Compare the editable result with the source and resolve the uncertain rows.",
      },
      {
        title: "Complete the review",
        description: "Send corrected files to export or continue into the accounting handoff.",
      },
    ],
    related: ["mixed-batch-processing", "team-review", "quickbooks-draft-bills"],
  },
  {
    slug: "team-review",
    title: "Team review",
    menuLabel: "Team reviewer access",
    icon: UsersRound,
    eyebrow: "Review the exceptions",
    headline: "Keep review work visible when more than one person touches the client batch.",
    summary:
      "AxLiner gives accounting practices a shared place to work through exceptions so reviewers can correct the batch and the final publisher can see what is ready.",
    proof:
      "The workflow keeps responsibilities clear without removing the final accounting judgment from the team.",
    signals: [
      { value: "Shared queue", label: "for reviewer work" },
      { value: "Visible status", label: "for each batch" },
      { value: "Controlled step", label: "before publish" },
    ],
    benefits: [
      {
        title: "Make the queue understandable",
        description: "Give the team one view of what arrived, what is flagged, and what is ready to move forward.",
      },
      {
        title: "Separate review from publish",
        description: "Let reviewers correct documents while the final accounting handoff remains deliberate.",
      },
      {
        title: "Reduce status chasing",
        description: "Keep batch progress in the workflow instead of reconstructing it from private messages.",
      },
    ],
    workflow: [
      {
        title: "Open the shared queue",
        description: "See the client batches that need a reviewer pass.",
      },
      {
        title: "Resolve the exceptions",
        description: "Correct source-backed fields and leave the batch in a reviewable state.",
      },
      {
        title: "Hand off the reviewed batch",
        description: "Move corrected work to export or a controlled QuickBooks publishing step.",
      },
    ],
    related: ["accounting-practices", "batch-review-board", "accounts-payable-queue"],
  },
  {
    slug: "quickbooks-draft-bills",
    title: "QuickBooks draft bills",
    menuLabel: "QuickBooks draft bills",
    icon: ReceiptText,
    eyebrow: "Finish the books",
    headline: "Publish reviewed invoice drafts to QuickBooks Online with the source still attached.",
    summary:
      "AxLiner helps bookkeepers move corrected invoice data into QuickBooks Online as draft bills after review, with the original document available for the accounting record.",
    proof:
      "The workflow prepares drafts. It does not auto-approve, reconcile, pay, or delete transactions.",
    signals: [
      { value: "Reviewed first", label: "before publish" },
      { value: "Draft bills", label: "for controlled handoff" },
      { value: "Source attached", label: "for a clearer record" },
    ],
    benefits: [
      {
        title: "Publish after correction",
        description: "Send the accounting draft downstream after the extracted fields have had a human review.",
      },
      {
        title: "Preserve the source",
        description: "Keep the original document attached so the next person can inspect the record when needed.",
      },
      {
        title: "Keep approval separate",
        description: "Prepare the bill draft without allowing the extraction workflow to take over accounting control.",
      },
    ],
    workflow: [
      {
        title: "Review the invoice batch",
        description: "Correct vendor, amount, date, and line details while the source stays close.",
      },
      {
        title: "Prepare the draft bills",
        description: "Move reviewed invoice records into the controlled publishing queue.",
      },
      {
        title: "Publish to QuickBooks Online",
        description: "Create draft bills with their original documents attached for the next accounting step.",
      },
    ],
    related: ["solo-bookkeepers", "batch-review-board", "accounts-payable-queue"],
  },
  {
    slug: "accounts-payable-queue",
    title: "Accounts payable queue",
    menuLabel: "Accounts payable queue",
    icon: ClipboardCheck,
    eyebrow: "Finish the books",
    headline: "Turn reviewed invoice batches into an AP queue your practice can actually follow.",
    summary:
      "AxLiner keeps reviewed invoice drafts together for coding and controlled QuickBooks Online publishing, so the AP handoff stays visible after extraction.",
    proof:
      "The queue is for reviewed draft bills only. AxLiner never pays vendors, reconciles accounts, or auto-approves bills.",
    signals: [
      { value: "Review status", label: "before the AP handoff" },
      { value: "Draft queue", label: "for coding and publish" },
      { value: "QuickBooks", label: "for the downstream record" },
    ],
    benefits: [
      {
        title: "Keep invoice work together",
        description: "Move corrected invoice drafts into a queue where the next accounting step is clear.",
      },
      {
        title: "Preserve reviewer control",
        description: "Treat extraction, coding, and publishing as visible steps instead of one hidden automation.",
      },
      {
        title: "Publish in a deliberate batch",
        description: "Send reviewed draft bills to QuickBooks Online after the practice is ready.",
      },
    ],
    workflow: [
      {
        title: "Complete invoice review",
        description: "Resolve the flagged invoice fields while the source documents stay available.",
      },
      {
        title: "Prepare the AP queue",
        description: "Keep reviewed draft bills visible for coding and final checks.",
      },
      {
        title: "Publish the drafts",
        description: "Move controlled draft bills into QuickBooks Online for the accounting team.",
      },
    ],
    related: ["accounting-practices", "team-review", "quickbooks-draft-bills"],
  },
];

export const primaryAudienceSlugs: AudienceSolutionSlug[] = [
  "solo-bookkeepers",
  "accounting-practices",
];

export const audienceSolutionGroups: Array<{
  label: string;
  description: string;
  icon: LucideIcon;
  slugs: AudienceSolutionSlug[];
}> = [
  {
    label: "Prepare the batch",
    description: "Collect and sort the folder before review.",
    icon: FolderOpen,
    slugs: ["mixed-batch-processing", "client-intake"],
  },
  {
    label: "Review exceptions",
    description: "Keep human judgment close to the source.",
    icon: ScanSearch,
    slugs: ["batch-review-board", "team-review"],
  },
  {
    label: "Finish the books",
    description: "Move reviewed work into the accounting handoff.",
    icon: Workflow,
    slugs: ["quickbooks-draft-bills", "accounts-payable-queue"],
  },
];

export function getAudienceSolution(slug: string) {
  return audienceSolutions.find((solution) => solution.slug === slug);
}

export function getAudienceSolutionBySlug(slug: AudienceSolutionSlug) {
  return audienceSolutions.find((solution) => solution.slug === slug)!;
}

export function audienceSolutionHref(slug: AudienceSolutionSlug) {
  return `/for-accountants-and-bookkeepers/${slug}`;
}

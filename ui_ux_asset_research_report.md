# AxLiner UI/UX And Asset Research Report

Date: May 22, 2026

## Executive read

AxLiner has the right product core for a strong SaaS story:

- It focuses on handwritten document conversion instead of generic AI chat.
- It gives users a real conversion experience on the landing page.
- It is moving toward batch upload, per-file review, corrected downloads, billing, and document modes.

The current UI/UX weakness is not a lack of sections. It is that the product story, asset style, and dashboard workflow are not yet disciplined enough around one clear promise:

> Drop a messy batch of handwritten paperwork, review only what needs attention, and leave with usable spreadsheet files faster than manual entry.

The website should be judged against that promise. Every section, picture, dashboard card, chart, CTA, status message, and motion treatment should either:

1. prove AxLiner can handle messy handwritten documents,
2. show the batch workflow clearly,
3. reduce trust risk around files, billing, and outputs, or
4. help the user finish a conversion faster.

## Research basis

I reviewed:

- The live AxLiner landing and pricing pages on May 22, 2026.
- Current frontend structure around the landing converter, dashboard shell, conversion workspace, pricing, settings, and public editorial pages.
- B2B SaaS landing and screenshot guidance.
- Dashboard and empty-state UX articles.
- Multi-file upload guidance and implementation discussions.
- OCR/document automation vendor flows.
- Reddit and StackOverflow discussion signals around accounting data entry, OCR, batch uploads, progress, previews, retries, and accounting paperwork friction.

Research interpretation:

- Vendor pages show product patterns and expectations, not proof that AxLiner needs every feature they have.
- Reddit and StackOverflow are useful for pain-point signals. They are not a substitute for interviews with AxLiner users.
- The report recommends a design direction. It does not recommend copying competitor branding.

## Strong signals from the research

### 1. Accounting users do not only want OCR

Recurring accounting/document workflow pain points are:

- Re-entering values from invoices, receipts, handwritten forms, bank statements, and spreadsheets.
- Month-end pressure when many small documents arrive together.
- Vendor documents with different layouts.
- Line items, totals, tax/VAT, dates, references, and handwritten notes mixed in one source.
- Uncertainty: users want to inspect extraction before the file enters downstream work.

For AxLiner this means:

- Batch handling should be visible, not a hidden implementation detail.
- Review and correction should look first-class.
- The output file should feel more important than the model.

### 2. Multi-file upload UX is a product feature

Upload guidance and StackOverflow implementation discussions repeatedly revolve around:

- accepted file types,
- file count and size limits,
- drag/drop and browse parity,
- file previews,
- per-file or batch progress,
- cancel/retry,
- repeated drops,
- validation before a long operation,
- preserving user confidence while asynchronous processing continues.

For AxLiner this means:

- `Convert Files` is the core workspace, not just a form.
- The user should always know what is in the batch, what mode will run, what will cost credits, and what is ready.

### 3. Document automation products sell trust through workflow proof

OCR/document vendors repeatedly show:

- ingestion,
- queue or batch handling,
- review,
- exception handling,
- duplicate detection or document organization,
- exports and integrations,
- auditability and security.

For AxLiner this means:

- Product screenshots and workflow diagrams are more valuable than vague AI art.
- If AxLiner says "batch", it should show many source documents and many reviewable results.
- If AxLiner says "handwritten", it should show real-looking ruled notes, handwritten invoice notes, forms, and scanned paper texture.

### 4. Product screenshots and contextual illustrations outperform decoration

SaaS design articles keep returning to the same idea:

- Product visuals should explain the workflow.
- Screenshots should be legible, framed consistently, and connected to a benefit.
- Decorative imagery without product context weakens clarity.

For AxLiner this means:

- Use generated scenes to establish target-user context.
- Use real AxLiner UI screenshots and document/result composites to prove the workflow.
- Do not replace workflow proof with generic floating-paper illustrations everywhere.

## Current AxLiner observations

## Public website

### What already works

- The hero promise is specific: handwritten images to Excel.
- The landing page gives a live `Try It` path.
- The pricing page now exposes free, Standard, Pro, and Max structure and has a comparison table.
- The public site has useful destinations: pricing, blogs, benchmarks, security, contact, solution pages, and the engine page.

### Main UX/design problems

#### P0. The visual language is not yet one system

Current assets mix:

- generated photographs,
- large footer/sign-in background images,
- hand-edited SVGs,
- testimonial photos,
- solution illustrations,
- product screenshots,
- old colored motifs,
- charts and cards with different densities.

The issue is not that multiple media types exist. The issue is that they do not yet share:

- one lighting direction,
- one background treatment,
- one document style,
- one UI frame treatment,
- one motion vocabulary,
- one green/neutral accent hierarchy.

#### P0. Some landing-page vertical rhythm wastes attention

The live page currently has very large vertical gaps between some high-value sections. If a scroll animation does not reveal enough visible meaning in that space, the page reads as unfinished or broken.

Rule:

- Long scroll distance is acceptable only if it carries a visible story.
- If a section leaves large blank travel on desktop or mobile, compress it.

#### P0. Trust proof must be real or visibly framed as product proof

Organization logos and testimonials are high-risk trust surfaces.

Do:

- use approved real organization logos only,
- use real testimonials when possible,
- use benchmarks, workflows, security explanations, and real screenshots when real logo proof is not available.

Do not:

- depend on generic famous-company logos if AxLiner cannot claim that relationship.

#### P1. The product story still leans too much on "OCR" and not enough on "batch work saved"

The strongest message should be:

- add a batch,
- see a reviewable result set,
- fix exceptions,
- download corrected spreadsheet outputs.

This story should appear:

- in the hero proof visual,
- directly after the hero,
- in the dashboard empty state,
- in pricing restrictions and value copy,
- in solution pages.

#### P1. The landing converter is powerful but visually heavy

The live landing page currently gives upload UI plus preview UI. That is good for proof. It also risks making the landing page feel like a dashboard before the user understands the workflow.

Recommended split:

- Landing `Try It`: fast proof, compact output mode, sample before/after, clear free run framing.
- Dashboard `Convert Files`: full batch tray, pages/files count, review queue, result cards, corrected downloads, history, richer modes.

#### P1. Pricing has repetition and public checkout trust risk

The live pricing page repeats plan facts across cards and the comparison table. It is usable, but the value hierarchy can be clearer:

- price,
- files included,
- files per run,
- review workspace,
- mode access,
- support/billing certainty.

If public buttons show `Checkout pending`, that communicates unfinished purchase infrastructure. Until Lemon Squeezy is ready, use one deliberate state:

- waitlist/contact state, or
- checkout hidden/unavailable with a clear reason.

## Dashboard and product UX

### What already works

- There is a shared dashboard shell with credits, plan, active job signal, sidebar, and mobile nav.
- Conversion workspace already has batch upload, previews, PDF first-page preview, output modes, result cards, review overlay, corrected batch download logic, and billing/error connection work.
- Overview has metrics and processing charts.

### What is still missing or weak

#### P0. Dashboard should be workflow-led, not page-led

For AxLiner the dashboard should open around the user's next batch:

- current credits and plan,
- active or recoverable job,
- convert files action,
- review-needed files,
- recent corrected/downloaded batches.

Charts matter after that. They should not feel like decorative analytics for a product whose main job is conversion.

#### P0. The batch review mental model needs to be obvious

The best product differentiator is not a single before/after. It is a batch review board:

- one batch container,
- each input beside its output,
- low-confidence or edited state,
- previous/next review,
- corrected package download,
- status by file.

The dashboard should make this view the normal result, not an advanced view the user must discover.

#### P1. Empty states need to teach by action

Research on empty states is relevant here. Empty screens should not be blank statistics or paragraphs. They should offer:

- the next action,
- a sample batch,
- one illustration or screenshot of the expected result,
- a short explanation of what happens after upload.

Good empty-state examples for AxLiner:

- Overview with no jobs: `Run your first handwritten batch`.
- History with no saved outputs: show a result-card miniature and link to Convert Files.
- Bank statement mode with no files: show what the workbook sheets will contain.

#### P1. Placeholder or internal-looking dashboard cards reduce product finish

Avoid user-facing panels that read like roadmap cards, dev placeholders, or disabled navigation shells without a direct reason.

Examples to review:

- disabled dashboard tabs that suggest missing analytics,
- cards that talk about future product wins instead of current user work,
- repeated descriptive text where a state badge and action would be enough.

#### P1. Accounting-specific review helpers are missing

High-value UI helpers for the target user:

- output naming based on source file,
- clear modes: table, bank statement, invoice/receipt, text extraction,
- review flags for uncertain totals/dates/rows,
- visible file count and expected output count,
- download reviewed batch,
- "return to unfinished batch",
- quick filter: Ready, Needs review, Edited, Failed.

#### P2. Integrations and handoff surfaces are not yet part of the UI story

Users may not need deep integrations on day one, but the design should be prepared for:

- Google Sheets export,
- CSV/XLSX split choice,
- QuickBooks/Xero handoff later,
- email/upload source later,
- one-click download package for a client or month-end run.

If these are not built, do not fake them in active UI. They can appear in a roadmap or contact path only if honest.

## Missing marketing/page structure

## Landing page sections recommended order

Recommended first-pass order:

1. Hero: handwritten batch promise, one CTA, one strong product-context visual.
2. Immediate workflow proof: `handwritten sources -> AxLiner -> review-ready batch outputs`.
3. `Try It`: compact conversion proof.
4. Batch result proof: show multiple source/output pairs, not only one comparison.
5. Target-user section: accounting, bookkeeping, AP/admin paperwork.
6. What AxLiner does differently: handwriting, structure recovery, batch review.
7. Modes/solutions.
8. Benchmarks and trust.
9. Security and ownership.
10. Pricing or plan handoff.
11. FAQ.
12. Footer/contact.

## Important missing public proof assets

- A real product screenshot of batch result cards.
- A real comparison overlay screenshot.
- A real dashboard review queue screenshot.
- A clear product screenshot of bank statement mode.
- A compact "how credits/files per run work" visual.
- A trust visual that is not only logos.
- A security visual tied to document ownership and downloads, not a generic padlock.

## UI/UX tricks worth testing

These are product-facing patterns that fit AxLiner better than decorative effects:

- Batch filmstrip:
  - Show input thumbnails entering a batch tray and output cards returning in the same order.
- Exception-first review:
  - Default a completed batch to `Needs review` files first when there are uncertain results.
- Source/result pairing:
  - Keep each result card visually split between source document and output preview so a user can inspect without opening every overlay.
- Sticky batch actions:
  - When a batch is ready, keep `Download all`, `Download reviewed batch`, and `Convert another batch` close to the result board.
- First-run sample:
  - Let a new user load a small sample handwritten batch if they do not want to upload their own document yet.
- Mode handoff card:
  - In Convert Files, show a compact selector that explains table mode, bank statement mode, and future invoice/receipt mode by output shape, not by AI language.
- Smart empty states:
  - History empty state should show the shape of a saved batch.
  - Billing empty state should show credits and plan consequences, not only upgrade copy.
- Review confidence language:
  - Prefer `Ready`, `Needs review`, and `Edited` over unsupported accuracy claims at file level.
- Insider micro-motifs:
  - Use line-item strips, reconciliation ticks, statement rows, PO fields, and stamped document corners as small repeated motifs.
- Human proof beside product proof:
  - Pair an accounting-context picture with a real AxLiner result screenshot. Avoid long stretches where only generated art carries the story.

## Asset system to build

## Asset categories

Build assets in four families only:

### 1. Product proof

Use actual AxLiner UI or realistic composites derived from it.

Examples:

- batch results,
- compare and correct,
- corrected download,
- active job/resume,
- billing/credits,
- bank statement workbook preview.

### 2. Accounting context

Use generated images that feel like target-user reality.

Examples:

- month-end desk,
- AP invoice stack,
- handwritten petty-cash notebook,
- receipt sorting,
- bank statement review,
- spreadsheet correction with visible document sources.

### 3. Document motifs

Use small clean objects and motifs as section support.

Examples:

- ruled form fragment,
- invoice line-item strip,
- bank statement column strip,
- green review tick,
- numbered batch stack,
- file tab labels,
- paperclip/scan corner/approved stamp used sparingly.

### 4. Trust/editorial

Use restrained visuals for:

- security,
- contact,
- blog covers,
- editorial explainers,
- benchmark diagrams.

## Visual rules for generated assets

- Use one primary visual treatment per page section.
- Prefer realistic or editorial-real scenes over generic 3D AI icons.
- Show actual paperwork and spreadsheets.
- Use green as a controlled accent, not a flood fill.
- Keep neutral backgrounds close to the UI background unless the section intentionally changes tone.
- Avoid neon glows, random floating cubes, robots, magic particles, generic brains, and fake holograms.
- Avoid fake confidential data. Use anonymized values and believable dummy documents.
- Avoid relying on generated image text for important claims. Put important words in HTML.
- Keep documents legible enough to read as invoices/forms/statements, but not dependent on tiny baked text.
- Keep one lighting direction and one shadow softness across the generated set.
- Export consistent aspect-ratio families instead of improvising every time.

## Recommended asset specs

For each generated marketing image, request or export:

- Desktop hero/context version: `16:10` or `3:2`.
- Section version: `4:3`.
- Mobile crop-safe version: `4:5` if the image contains people or desks.
- Transparent cutout only when the subject truly needs to sit on the UI background.

Performance rules:

- Prefer WebP or AVIF for raster marketing images.
- Compress large hero/background images aggressively.
- Avoid testimonial/avatar source files in multi-megabyte sizes.
- Treat current very large assets as optimization candidates before adding more of the same.

Current inventory warning:

- The public folder already contains very large images, including testimonial files over several MB and one file over 25 MB.
- New generated assets should not repeat that cost.

## GPT Image prompts to generate next

Use these as starting prompts. Generate a small coherent set first, review the look, then generate variants using the chosen style.

### Prompt 1: hero accounting batch scene

Placement:

- Landing hero or first workflow proof section.

Prompt:

> Create a professional editorial product image for a SaaS that converts handwritten accounting documents into Excel batches. Show a clean month-end accounting desk from a slightly elevated angle: a small stack of handwritten invoices, ruled expense notes, several receipts, a printed bank statement page, and a laptop with a clean spreadsheet review interface visible but not readable in detail. The paperwork should feel real and varied, not messy stock clutter. Include subtle accounting cues such as invoice line items, PO reference boxes, tax/VAT rows, debit-credit columns, and reconciliation check marks as visual motifs only. Color palette: neutral paper whites, graphite text, muted desk tones, and restrained AxLiner green accents. Lighting soft and natural, professional, calm, high trust, no neon glow, no robots, no floating AI symbols, no confidential company data, no branded logos, no oversized text. Leave clean negative space on one side for website copy. Photorealistic with polished SaaS art direction.

### Prompt 2: bulk input to review-ready output

Placement:

- Section directly after hero.

Prompt:

> Create a clean workflow illustration that explains bulk handwritten document conversion without using words. On the left, show a neat fan of several source documents: handwritten tables, receipts with handwritten notes, a paper form, and a bank statement PDF page. In the center, show a restrained AxLiner processing surface represented by a clean document scanner-like software node with green review light accents. On the right, show a batch of organized spreadsheet result previews and file cards, each paired visually with its source. The feeling should be one-click batch flow, review-ready results, and accounting efficiency. Keep it professional and minimal, with accurate paper textures and spreadsheet grid cues. No generic AI brain, no glowing tunnel, no excessive arrows, no illegible fake UI text, no logos. Background should be easy to cut out or place on a light SaaS page.

### Prompt 3: AP invoice pile under control

Placement:

- Solutions/accounting page or landing target-user section.

Prompt:

> Generate a polished professional scene of an accounts payable specialist handling a high-volume invoice morning. Show the moment after disorder becomes organized: incoming invoices and receipts grouped on one side, reviewed spreadsheet outputs and tidy batch folders on the other side, with the person's attention on verification rather than typing. Include subtle AP details such as vendor invoice layouts, totals rows, PO fields, approval stamps, tax lines, and payment date cues. The person should look focused and credible, not exaggerated or smiling at camera. The scene should communicate time saved from manual data entry. Palette neutral with restrained green accents, soft natural office lighting, editorial B2B SaaS quality, no visible brand names, no private data, no futuristic AI effects.

### Prompt 4: handwritten ledger to spreadsheet comparison

Placement:

- Try It support visual, blog cover, or benchmark explainer.

Prompt:

> Create a crisp comparison image for handwritten OCR review. Left side: a believable handwritten ledger page with ruled columns, imperfect pen pressure, notes in margins, and a few crossed corrections. Right side: a clean spreadsheet table preview with aligned rows and clear column boundaries. The two sides should visibly correspond without needing labels. Use realistic accounting cues such as date, reference, description, debit, credit, balance, tax, and total structure, but keep details anonymized and not dependent on readable tiny text. Product-quality lighting and spacing, clean paper texture, no heavy frame, no generic iconography, no blue-purple AI glow.

### Prompt 5: bank statement mode

Placement:

- Bank statement mode page.

Prompt:

> Create a professional product-context image for bank statement extraction. Show a scanned statement with a text summary region and a transaction table region being reviewed beside a clean workbook preview that preserves statement metadata above organized transaction rows. The visual should communicate "extract what is visible, keep the statement context, review the rows" without claiming automated accounting decisions. Use realistic bank-statement structure such as opening balance, transaction dates, descriptions, debits, credits, and closing balance as layout cues only. Keep the bank anonymous. Tone: precise, careful, trustworthy, finance-oriented, restrained green accents, soft white and graphite palette, no coins, no calculators as the main idea, no magical AI visuals.

### Prompt 6: bookkeeping daily-life receipt batch

Placement:

- Blog/solution asset.

Prompt:

> Create a modern editorial image of a bookkeeper sorting a day's small-paper workload: thermal receipts, handwritten expense notes, folded supplier slips, and a spreadsheet open for review. The work should look familiar to small business bookkeeping: paper clips, dated receipt groups, vendor slips, and a calm verification process. Emphasize batch handling and reduced typing. Professional office realism, slight top-down composition, subtle green accent objects, clean surfaces, no meme style, no stock-photo handshake, no brand logos, no visible personal information.

### Prompt 7: correction and exception review

Placement:

- Dashboard empty state or landing product proof.

Prompt:

> Generate a polished SaaS visual of document exception review. Show several compact result cards where most outputs are marked ready and one result is flagged for review, with a source handwritten table beside an editable spreadsheet grid. The focus is careful correction, not model magic. Use realistic file thumbnails, subtle status chips, spreadsheet cells, and a batch download idea. Keep the interface abstract enough to avoid copying any competitor UI, but close enough to look like real software. Clean grid, high trust, neutral background, restrained green highlights, no oversized text, no clutter, no neon.

### Prompt 8: month-end bulk savings story

Placement:

- Landing section around value/savings.

Prompt:

> Create an editorial split-moment image for month-end document work. One side implies repetitive manual entry with many handwritten forms waiting; the other side implies fast reviewed output batches with organized spreadsheets and fewer papers remaining. Make the improvement subtle and credible, not a dramatic before-after mess. Include accounting cues: close checklist, invoice batch tabs, receipts, ledger columns, reconciliation marks. The visual should say "less retyping, more review" for accountants and operations staff. Professional B2B composition, calm green accents, soft shadows, no cartoon chaos, no fake KPI text.

### Prompt 9: security for document ownership

Placement:

- Security page or trust section.

Prompt:

> Create a professional security image for a document-processing SaaS without using a giant padlock. Show organized document files moving through controlled stages: upload, owned job, storage, verified download. Use subtle visual cues such as secure file trays, identity-bound tags, clear paths, and clean workstation context. The documents should be handwritten and accounting-related but anonymized. Mood: precise, accountable, calm, enterprise-ready. Palette neutral with subtle AxLiner green. No hacker imagery, no shield explosion, no glowing cyberspace tunnel, no confidential data.

### Prompt 10: contact and support scene

Placement:

- Contact page.

Prompt:

> Create a calm support-oriented editorial image for a document SaaS contact page. Show a professional workspace with a reviewed batch of handwritten accounting files, a clear notes sheet, and a support conversation implied by a clean open laptop view without readable chat text. The image should communicate that users can ask about document modes, pricing, and processing workflow. Natural lighting, credible B2B tone, clean desk, muted colors with small green accents, no call-center stock photo, no fake customer logos.

### Prompt 11: dashboard empty-state mini illustration

Placement:

- Dashboard Overview empty state or History empty state.

Prompt:

> Create a small clean illustration for an empty conversion workspace. Show three compact source documents entering a tidy batch tray and one spreadsheet result card ready to review. Style should be minimal editorial software illustration with real-paper cues, soft lines, neutral background, subtle green accent, no text, no complex background, no generic upload cloud icon, suitable for a dashboard card.

### Prompt 12: accounting insider motif sheet

Placement:

- Reusable supporting motifs for cards, blogs, and solution headings.

Prompt:

> Create a coherent sheet of small professional accounting-document motifs on a transparent or plain light background: invoice line-item strip, receipt corner, ruled handwritten ledger fragment, approval stamp impression, VAT/tax row marker, PO reference tag, debit-credit columns, reconciliation tick, bank statement row strip, paperclip, file tab, and spreadsheet cell selection. Keep all motifs in one consistent visual style with neutral paper tones and restrained green accents. No playful emoji style, no 3D plastic icons, no fake brand logos, no large text.

## Accounting cues and "insider" motifs to reuse

Use these as prompt cues, section labels, or small UI motifs when they match the feature:

- Month-end close.
- AP queue.
- AR remittance.
- PO number.
- Vendor code.
- Invoice number.
- Tax/VAT row.
- Line items.
- Debit / credit / balance.
- Reconciliation.
- GL code.
- Expense receipt.
- Petty cash note.
- Handwritten correction.
- Approval stamp.
- Bank statement transaction row.
- Client batch.
- Reviewed / needs review.

Do not overuse them. One or two real cues are better than a fake accounting collage.

## What to bring before the next serious design pass

## Assets from you

Priority 1:

- 6 to 10 generated images from the prompts above in one coherent style.
- One chosen style sample that becomes the reference for future generations.
- Real anonymized examples of:
  - handwritten table,
  - invoice with handwritten note,
  - receipt batch,
  - bank statement page,
  - paper form.
- Permission-safe customer proof:
  - real testimonial,
  - real organization logo permission, or
  - permission to remove/reframe logo claims.

Priority 2:

- Real AxLiner screenshots from:
  - empty Convert Files workspace,
  - selected batch before conversion,
  - processing state,
  - result board,
  - comparison/correction overlay,
  - dashboard overview,
  - billing/credits state.
- A decision on integrations worth designing for first:
  - Google Sheets,
  - CSV/XLSX variants,
  - QuickBooks/Xero,
  - email inbox ingestion,
  - API/webhook export.

Priority 3:

- Blog-cover style references.
- Security/trust image preference.
- Logo usage pack and final favicon exports.

## Product facts needed before writing more claims

- Real benchmark methodology and numbers that can be defended.
- Real file retention/deletion policy.
- Real data processor statement.
- Real batch limits by plan.
- Real supported modes at launch.
- Real integrations built now versus planned later.

## Consistency rules to follow

## Marketing pages

- One main CTA per section.
- Put the batch promise near the top and repeat it with proof, not copy repetition.
- Use product screenshots where the feature is interactive.
- Use generated accounting-context images where the user needs emotional recognition.
- Keep section spacing deliberate. Avoid long empty scroll unless motion explains it.
- Keep headings short and body copy narrower than product screenshots.
- Every trust claim needs evidence or careful wording.
- Do not make security, benchmark, contact, and editorial pages look like unrelated mini-sites.

## Dashboard pages

- State before decoration:
  - what files are selected,
  - what job is active,
  - what requires review,
  - what can be downloaded.
- Keep batch actions persistent near the batch.
- Prefer one main workspace over many competing cards.
- Use stable positions during upload, conversion, and ready states.
- Show empty, loading, failed, cancelled, ready, and quota-exceeded states intentionally.
- Prefer direct labels and status chips over helper paragraphs.
- Use visuals only when they reduce ambiguity: PDF first-page preview, source/output pairing, edited flag, confidence flag.

## Motion

- Motion should explain flow:
  - source documents arrive,
  - batch processes,
  - outputs become reviewable,
  - long page transitions reveal section changes.
- Avoid motion that only makes assets float.
- Avoid pinned blank spaces.
- Respect reduced-motion behavior.

## Tables and review UX

- Spreadsheet previews should stay readable.
- Keep source and result paired.
- Make edits visible.
- Provide batch navigation and a final reviewed download.
- Do not bury failed or low-confidence files in a completed batch.

## Images and assets

- Use the same visual family across sign-in, landing footer, solution imagery, blog covers, and dashboard empty states.
- Keep generated people credible and task-focused.
- Use real paperwork texture, but keep the website clean.
- Avoid generic AI visual cliches.
- Keep asset sizes controlled before deploy.

## Recommended next work order

1. Decide the final asset style from 2 to 3 generated reference images.
2. Replace or compress oversized inconsistent raster assets.
3. Rework landing spacing around hero, Try It, batch proof, and trust.
4. Add a real batch workflow proof section using product screenshots/composites.
5. Tighten dashboard Overview and Convert Files around batch review and empty states.
6. Normalize pricing trust states and remove public `checkout pending` ambiguity when billing is not live.
7. Rebuild solution/blog cover images from the same accounting-focused asset family.

## Research sources and references

Product and workflow references:

- PatternFly multi-file upload pattern:
  - https://www.patternfly.org/components/file-upload/multiple-file-upload/design-guidelines
- Rossum transactional document intake:
  - https://rossum.ai/platform/receive-documents/
- Rossum accounting automation example:
  - https://rossum.ai/solutions/accounting-automation/
- Rossum AI OCR overview:
  - https://rossum.ai/solutions/ai-ocr/
- Floowed bookkeeping OCR pain-point article:
  - https://www.floowed.com/en/blog/ocr-accounting
- BlackLine manual accounting pain-point article:
  - https://www.blackline.com/resources/articles/how-to-manual-accounting/

SaaS page and dashboard guidance:

- SaaS product screenshot guidance:
  - https://nerdcow.co.uk/blog/saas-product-screenshots-examples/
- Dashboard UX guidance:
  - https://www.designpixil.com/learn/saas-dashboard-ux-design/
- Empty state guidance:
  - https://pixxen.io/blog/product-design/b2b-saas-ui-design-essential-strategies-for-product-success

Forum and implementation signals:

- Reddit signals were reviewed around bookkeeping, accounting, OCR, handwritten documents, bank statements, and batch processing.
- StackOverflow signals were reviewed around multi-file drag/drop, previews, per-file progress, same-file re-upload, retries, and file upload validation.

Examples reviewed:

- Reddit accounting manual-entry discussion:
  - https://www.reddit.com/r/Accounting/comments/1icy1jh/manual_data_entry_is_the_new_form_of_torture_help/
- Reddit invoice OCR recommendations discussion:
  - https://www.reddit.com/r/smallbusiness/comments/1t9tuc5/ocr_invoice_processing_software_recs/
- Reddit enterprise OCR/batch processing discussion:
  - https://www.reddit.com/r/SaaS/comments/1r75uvu/any_enterprise_ocr_software_that_can_handle/
- StackOverflow multiple file upload progress discussion:
  - https://stackoverflow.com/questions/38478912/multiple-file-upload-with-progress-bar-for-each-file-drag-and-drop
- StackOverflow repeated drag/drop additions discussion:
  - https://stackoverflow.com/questions/64502494/javascript-drag-n-drop-files-multiple-times-add-new-files-to-previous-ones-instead-of-substituting
- StackOverflow same-file re-upload discussion:
  - https://stackoverflow.com/questions/72461549/react-drag-drop-files-re-upload-issue-in-chrome

Forum findings are used only as pain-point and implementation signals. AxLiner should validate product decisions with real users.

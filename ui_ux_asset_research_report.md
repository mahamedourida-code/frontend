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

## Image prompts to generate

Use generated images for atmosphere, trust, and the accounting context. Do not ask the image model to draw readable invoices, bank statements, spreadsheet cells, dashboard UI, or screens full of document text. Use real AxLiner screenshots and real document previews when the product itself must be shown.

Shared constraints to append to the prompts below:

`Photorealistic editorial commercial photography, believable human posture, natural skin texture, real materials, restrained green accent details, soft neutral color grading, no readable text, no fake UI, no legible document content, no brand logos, no floating paperwork, no holograms, no stock-photo handshake, no overdone neon glow, no vector illustration, no 3D render.`

### Landing and hero support

1. **Batch work saved**

   `A calm accounting operations desk after a busy intake period, several tidy trays and clipped paper stacks arranged by stage, one calculator, neutral folders, green sticky tabs used as subtle accents, a finance professional's hands moving the last checked stack into a finished tray, bright side daylight, authentic office detail, wide composition with clear negative space for website copy.`

2. **Handwritten specialist**

   `Close editorial photograph of a bookkeeper reviewing a rough field notebook beside organized office tools, the marks on paper are blurred and not readable, pencil smudges and worn paper edges feel real, green pen and small desk plant as restrained accent, warm natural light, focused and trustworthy mood, no visible computer screen.`

3. **Bulk conversion story**

   `Top-down professional photograph of an intake table with mixed physical sources represented by envelopes, clipped sheets, phone-photo printouts, folders, binder clips, receipt silhouettes, and a finished output tray, stages arranged left to right so the scene suggests batch flow, no readable page content, clean premium SaaS campaign style, realistic shadows.`

### Auth and trust surfaces

4. **Sign-in side visual**

   `A quiet modern finance workspace at early morning, a focused accounting professional seated near a window with a notebook, calculator, and tidy folders, relaxed confidence rather than staged smiling, soft green reflections from desk objects, half of the frame left open for UI overlay, shallow depth of field, realistic office atmosphere.`

5. **Security and reliability**

   `Professional archive and operations scene with a secure locked storage cabinet, labeled shapes kept abstract and unreadable, orderly folders, a laptop closed on the desk, soft directional lighting, muted neutral materials with a subtle AxLiner green accent, visual tone of privacy and care without cyber-security cliches.`

6. **Contact page**

   `Approachable support scene in a real small SaaS office, one operations specialist listening on headset while taking concise notes, no visible monitor content, daylight, tidy desk, human and responsive mood, green accent from desk accessories only, realistic editorial photograph with room for contact-page text.`

### Accounting and vertical pages

7. **Invoice workflow**

   `Bookkeeping desk during invoice review, two people working side by side with calculators, clipped paper bundles, stamps, ruler, and highlighter marks kept abstract, no readable supplier names or totals, practical monthly-close energy, natural overhead and window light, clean but not sterile.`

8. **Bank statement mode**

   `A reconciliation workspace with a finance analyst comparing organized paper bundles and a calculator beside a notebook, papers show only soft lines and blurred marks, no readable account numbers, no visible spreadsheet screen, precise orderly composition, restrained green highlight tabs, professional banking tone.`

9. **Backoffice bulk intake**

   `Operations table receiving many small paperwork batches from different teams, folders grouped in reusable trays, barcode-like shapes kept abstract and unreadable, hands sorting work into ready and review piles, efficient real-world office scene, neutral palette with small green accents.`

### Dashboard empty states and pricing support

10. **First batch invitation**

    `A single clean intake tray waiting on a desk with a notebook, calculator, clips, and one green marker beside it, realistic soft morning light, minimal premium composition, generous negative space, feeling of ready-to-start work without showing any screen or readable paper.`

11. **Plan value image**

    `Three neat stacks of paperwork represented only by thickness and organization level, from small personal stack to larger team trays, placed on a refined accounting desk with scale communicated by volume rather than numbers, realistic photography, clear separation, soft shadows, no labels or text.`

### Brand-world and campaign backgrounds

Use these for hero backgrounds, footer backdrops, auth visuals, pricing accents, and section breaks. They should make AxLiner feel recognizable before the product UI appears. They do not need documents.

12. **Jade coast**

    `A real coastal landscape photographed at the edge of morning light, deep jade water folding into pale stone and sea mist, soft green-blue reflections that match a modern spreadsheet brand, organic shoreline curves leaving generous clean space for web copy, premium calm mood, sharp natural detail, no people, no boats, no fantasy effects.`

13. **Forest light path**

    `A photoreal forest opening with filtered mint-green sunlight passing through dark leaves onto a quiet path, rich shadow detail, wet bark and soft moss textures, refined color grading that pairs emerald green with warm neutral highlights, the image feels elegant and slightly unexpected for a SaaS website, broad composition with one clear low-detail area for text.`

14. **Sea-glass workspace mood**

    `Close cinematic photograph of sea-glass green reflections moving across brushed metal, clear glass, and a pale desk surface, sunlight refracted like water but fully realistic, sophisticated material study for a premium software campaign, abstract enough for a section background, not a render, no UI, no logos, no text.`

15. **Greenhouse after rain**

    `A real modern greenhouse after rain, glass walls with crisp droplets, lush green plants kept controlled and architectural, cool daylight meeting warm interior highlights, quiet premium atmosphere, subtle depth and strong negative space, colors harmonize with emerald and graphite UI accents, not overly tropical, not stock imagery.`

16. **Night harbor contrast**

    `A calm harbor at blue hour with deep charcoal water, restrained green reflections from distant lights, soft silver sky, realistic atmospheric haze, elegant dark-mode campaign background with smooth open space around the horizon, refined and trustworthy rather than dramatic, no city logos, no neon overload.`

17. **Stone and water rhythm**

    `Editorial close view of clear water moving over dark smooth stone and pale mineral edges, emerald-tinted highlights, natural ripples forming a quiet rhythm, highly realistic texture and lighting, a distinctive organic background for a precision product, contrast stays soft enough for overlaid interface cards.`

18. **Warm field contrast**

    `A real late-afternoon landscape with muted golden grass beside a narrow green irrigation line and dark earth, clean horizon, understated human-order-meets-nature feeling, color palette intentionally complements AxLiner green with warm cream and graphite tones, premium documentary photograph, no buildings, no text.`

Brand-world rule:

`Keep the scene real and ownable. Prefer one memorable natural material or place with AxLiner-compatible color over generic abstract gradients, floating shapes, fake papers, or fake screens.`

### Prompt rule

If the image is meant to explain a product action, do not generate it. Use a real UI capture, a controlled SVG, or a coded product frame instead. Generated images should sell the setting, audience, and workload relief.

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

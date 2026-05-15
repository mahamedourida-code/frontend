# AxLiner Feature Enhancement Ideas

These ideas are based on recurring pain points seen in OCR/accounting/data-entry products and user discussions: manual bank statement entry, messy invoice line items, inconsistent tables, review accuracy, and the need to push clean outputs into Excel or accounting tools.

## High-Impact Features

1. **Bank Statement Mode**
   - Detect deposits, withdrawals, dates, descriptions, balances, and account numbers.
   - Add balance validation: opening balance + credits - debits should equal closing balance.
   - Support multi-account statements by splitting one upload into separate sheets.
   - Useful for accountants, lenders, bookkeeping teams, and users who still manually copy bank PDF data into Excel.

2. **Invoice And Receipt Line-Item Mode**
   - Extract vendor, invoice number, date, tax, subtotal, total, and every line item.
   - Add validation checks: line items should sum to subtotal, subtotal + tax should match total.
   - Export one workbook with a summary sheet plus one line-item sheet.
   - This complements handwritten tables because many users upload mixed invoices, receipts, and scanned paper forms.

3. **Column Mapper**
   - Let users map extracted columns to their preferred Excel schema: `Date`, `Description`, `Debit`, `Credit`, `Category`, `Notes`.
   - Save mappings as reusable templates per user.
   - Add automatic type cleanup for dates, currencies, percentages, and IDs.
   - This solves the common problem where OCR extracts data correctly but columns are not ready for the user's workflow.

4. **Review Queue With Confidence**
   - Mark files and cells as `Ready` or `Needs review`.
   - Highlight low-confidence cells directly inside the comparison editor.
   - Add quick filters: `Show only uncertain cells`, `Show changed cells`, `Show blank required cells`.
   - This makes batch review faster without forcing users to inspect every row manually.

5. **Download Reviewed Batch**
   - Keep raw OCR output separate from corrected output.
   - After the user edits cells, create one final package: corrected Excel files, CSV exports, and a review summary.
   - Use smart file names based on the original upload, for example `bank_statement_april_reviewed.xlsx`.

6. **Merge Batch Into One Workbook**
   - Give users three export choices:
     - One Excel file per upload.
     - One workbook with each upload as a separate sheet.
     - One normalized master table combining all files.
   - This is valuable for accountants processing many similar documents at once.

7. **Table Repair Tools**
   - Add simple controls to split a column, merge columns, move a row, set a header row, and remove blank rows.
   - Add an `Undo` trail while editing.
   - This directly addresses OCR table issues like borderless columns, merged cells, multi-line rows, and repeated headers.

8. **Document Preprocessing Before OCR**
   - Auto-rotate, deskew, crop page borders, improve contrast, and detect upside-down pages.
   - For PDFs, show page thumbnails and let users remove pages before conversion.
   - This reduces failed jobs and improves handwriting/table extraction quality before the model is called.

9. **Google Sheets, QuickBooks, Xero, And CSV Export**
   - Add one-click export to Google Sheets first because it is simpler and broadly useful.
   - Later add QuickBooks/Xero exports for accounting users.
   - Add Zapier/Make/webhook export for teams that want automated workflows.

10. **Email And Folder Intake**
   - Give each user a private upload email like `workspace-id@upload.axliner.com`.
   - Allow users to forward invoices, receipts, or statements directly to AxLiner.
   - Later add Google Drive/Dropbox watched folders.
   - This turns AxLiner from a one-time converter into a repeatable workflow tool.

11. **Smart Document Type Detection**
   - Auto-label uploads as handwritten table, bank statement, receipt, invoice, class notes, inventory sheet, or form.
   - Pick the best extraction prompt and output schema automatically.
   - Let the user override the detected type before conversion.

12. **Batch ETA And Queue Transparency**
   - Show estimated conversion time before the user clicks convert.
   - Explain limits clearly: selected files, pages, current plan run limit, and queue status.
   - This improves trust when users upload large batches.

13. **Duplicates And Missing Pages Detection**
   - Detect duplicate images or repeated PDF pages.
   - Warn when page numbers look missing in a bank statement or report.
   - Helps users avoid paying credits for duplicate pages and prevents incomplete exports.

14. **Audit Trail For Teams**
   - Store original file, extracted table, corrected table, editor, timestamp, and download history.
   - Add a simple approval state: `Extracted`, `Reviewed`, `Approved`, `Exported`.
   - This is important for accounting teams, compliance-heavy workflows, and paid business plans.

15. **API Access For Business Plans**
   - Add a clean API for upload, job status, result download, and webhook callbacks.
   - Keep the dashboard as the visual workflow, but let businesses automate high-volume batches.

## Suggested Build Order

1. **Review Queue With Confidence** because it improves the existing batch comparison flow immediately.
2. **Column Mapper** because clean Excel structure is the actual user outcome.
3. **Merge Batch Into One Workbook** because it makes batch processing feel more valuable than single-file OCR.
4. **Bank Statement Mode** because accountants and finance users have a clear high-value pain point.
5. **Google Sheets Export** because it is a practical first integration before QuickBooks/Xero.
6. **Table Repair Tools** because they make AxLiner feel like a serious correction workspace, not only a converter.

## Research Signals Used

- DocuClipper positions accounting OCR around bank statements, invoices, receipts, checks, tax forms, Excel/CSV, QuickBooks, and Xero exports: https://www.docuclipper.com/
- DocuClipper accounting page highlights multiple-account bank statement detection and editable exports: https://www.docuclipper.com/solutions/accountants/
- Parseur describes invoice table extraction pain points such as many vendor formats, line items, merged headers, subtotals, taxes, and validation checks: https://parseur.com/blog/vision-ai-table-extraction
- Lido notes table OCR challenges like borderless column alignment and inferred column boundaries: https://www.lido.app/blog/ocr-table-to-excel
- LlamaIndex describes layout-aware table extraction with geometry, headers, merged cells, and row integrity: https://www.llamaindex.ai/blog/ocr-for-tables
- Turing IT Labs notes export automation into Google Sheets, Excel, webhooks, Zapier, and Make: https://turingitlabs.com/data-extraction-software/

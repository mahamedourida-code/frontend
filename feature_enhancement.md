
--MoRs usually reject apps if your site looks incomplete or lacks clear terms of service and refund policies. They are terrified of chargebacks, so make sure your site has a professional landing page, a functional checkout flow, and legal pages that look legit. I help founders tighten up these operational gaps before they go live, and usually, just having a clear privacy policy and a professional domain email is enough to flip that rejection into an approval.
-- add acount payable mode ( AP/Bank stat../invoice/recepit/table/ notes)
-- analyze and copy from competitors ( autoentry//dext / rossum / veryfi ...)
-- adding symbols next to each button in  dashboards 
-- make screen studio comparaison exactly like tella ....
-- in pricing comparaisons in pricing page , when scrolling down the plans prices should stay appeared( animation)
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




6. **Merge Batch Into One Workbook**
   - Give users three export choices:
     - One Excel file per upload.
     - One workbook with each upload as a separate sheet.
     - One normalized master table combining all files.
   - This is valuable for accountants processing many similar documents at once.






2. **Column Mapper** because clean Excel structure is the actual user outcome.
3. **Merge Batch Into One Workbook** because it makes batch processing feel more valuable than single-file OCR.
4. **Bank Statement Mode** because accountants and finance users have a clear high-value pain point.


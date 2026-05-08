## Lemon Squeezy Payment Integration Plan

- Goal:
  - Use Lemon Squeezy as Merchant of Record.
  - Lemon handles checkout, payment collection, invoices, VAT/tax, payment methods, and customer billing portal.
  - AxLiner handles plans, credits, queue limits, access control, and OCR usage.

## Priority 1: What You Do After Creating Lemon Account

- Create the store.
  - Save `store_id`.
  - Enable test mode first.

- Create subscription products.
  - Pro monthly.
  - Pro yearly if needed.
  - Business monthly if needed.
  - Save each Lemon `variant_id`; these are what checkout uses.

- Decide plan limits.
  - Free: batch limit, daily credits, queue priority.
  - Pro: monthly credits, max batch size, retention time.
  - Business: higher credits, higher batch size, priority queue.

- Create webhook secret.
  - Lemon webhooks require a signing secret.
  - Save it as backend secret, not frontend env.

- Create webhook in Lemon dashboard/API.
  - URL: `https://YOUR_BACKEND_DOMAIN/api/v1/billing/lemon/webhook`
  - Events to enable:
    - `order_created`
    - `subscription_created`
    - `subscription_updated`
    - `subscription_cancelled`
    - `subscription_expired`
    - `subscription_payment_success`
    - `subscription_payment_failed`

- Collect backend secrets.
  - `LEMONSQUEEZY_API_KEY`
  - `LEMONSQUEEZY_STORE_ID`
  - `LEMONSQUEEZY_WEBHOOK_SECRET`
  - `LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID`
  - `LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID`
  - `LEMONSQUEEZY_BUSINESS_MONTHLY_VARIANT_ID`

## Dashboard and UX Gaps - Priority Order

### Priority 1: Make the dashboard feel like one product

- Use one shared dashboard shell for Overview, Process Images, History, and Settings.
- Keep the same top bar, spacing, credit pill, page title style, and actions everywhere.
- Remove repeated explanatory text. The dashboard should be mostly labels, numbers, tables, and clear actions.

### Priority 2: Make Process Images fit above the fold

- Keep credits in the top bar, not inside the upload card.
- Keep the upload card compact until files are selected.
- Show the selected file count only near the selected files and convert action.
- Keep output type, upload, and convert controls visible without scrolling on common laptop screens.

### Priority 3: Improve paid-user confidence

- Always show credits with a small symbol in the top bar.
- If credits are low or zero, show one clear upgrade action near the credit pill.
- Make pricing, billing, and process limits use the same backend values so users never see different promises.

### Priority 4: Simplify History

- Replace dense table controls with a compact filter row.
- Make download, share, delete, and retry actions visually consistent.
- Add better empty states: upload CTA, no saved files, no matching filters.

### Priority 5: Polish Settings

- Remove settings that do not apply, especially password settings when Google sign-in is the only auth path.
- Put billing status, renewal date, credits, and portal access in one clean billing block.
- Keep account preferences separate from billing so users do not have to scan too much.

### Priority 6: Add lifecycle states

- Add clear states for uploading, queued, processing, finished, failed, cancelled, and low credits.
- Make every state explain the next action in one short line or with one obvious button.
- Avoid long paragraphs in dashboard pages.

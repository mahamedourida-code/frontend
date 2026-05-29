# Manual Setup Requirements

This file records only account access, provider approval, secret configuration, or intentional live-system actions that cannot be completed safely in code.

## Prompts 1-14

No remaining manual provider steps. Supabase stores durable documents, review state, reviewed exports, duplicate decisions, vendor memory, and the Accounts Payable preparation queue.

## Prompt 15 - QuickBooks Online Connection

### Production Setup

1. In Intuit, enable the **QuickBooks Online Accounting** scope and register this production redirect URI:

   `https://backend-lively-hill-7043.fly.dev/api/v1/integrations/quickbooks/callback`

2. Keep the production Client ID and Client Secret in Fly secrets only, never frontend settings or Git.
3. The production connection is authorized from `/dashboard/integrations`; it remains scoped to its owning workspace.
4. If credentials are rotated or the backend hostname changes, update Fly secrets or the registered redirect URI and reconnect.

### Fly Secrets

These values must remain backend-only:

```powershell
fly secrets set QUICKBOOKS_CLIENT_ID="<intuit production client id>" QUICKBOOKS_CLIENT_SECRET="<intuit production client secret>" -a backend-lively-hill-7043
```

`QUICKBOOKS_TOKEN_ENCRYPTION_KEY` must remain configured as a Fly secret. `QUICKBOOKS_REDIRECT_URI`, production environment, and API minor version are represented in `backend/fly.toml`.

## Prompt 16 - QuickBooks Unpaid Bill Publishing

1. Open `/dashboard/accounts-payable` and use **Refresh lists** once after connecting or whenever QuickBooks vendors/accounts/tax codes change.
2. Select the QuickBooks vendor and expense account for a reviewed invoice before marking it Ready to publish.
3. Publishing creates a real **unpaid Bill** in the connected QuickBooks company. Use a deliberate reviewed invoice for the first live publication, or use a sandbox connection for testing.
4. Confirm that the source attachment appears on the created Bill when attachment upload is enabled. If it fails, use **Retry attachment**; AxLiner will not create another Bill.
5. AxLiner does not authorize payments or perform reconciliation. Those operations remain in QuickBooks.

## Prompt 17 - QuickBooks Receipt Publishing

1. Use **Refresh QuickBooks lists** in a reviewed receipt before publishing so vendors, accounts, and tax codes reflect the connected company.
2. **Expense** creates an already-paid QuickBooks Purchase; **Bill** creates an unpaid QuickBooks Bill. The reviewer must select the treatment explicitly.
3. Confirm a first receipt publication and its attached source file in a QuickBooks sandbox before intentionally writing receipts to production.

## Prompt 19 - Email Intake

1. In Resend, configure an inbound receiving domain for `intake.axliner.com` and add its required DNS/MX records.
2. Create an `email.received` webhook pointing to:

   `https://backend-lively-hill-7043.fly.dev/api/v1/email-intake/resend/webhook`

3. Keep receiving credentials in Fly secrets only:

```powershell
fly secrets set RESEND_API_KEY="<resend api key>" RESEND_WEBHOOK_SECRET="<resend webhook signing secret>" -a backend-lively-hill-7043
```

4. After DNS and webhook setup are active, an authenticated workspace can copy its generated address from `/dashboard/inbox`.
5. Send one invoice or receipt attachment to that address and confirm it appears in Inbox and opens its Auto-detect review batch.

## Deployment Responsibility

- Frontend: changes are committed and pushed to the GitHub `frontend` repository so Vercel deploys them.
- Backend: changes are committed and pushed to `olmocr-backend`, then deployed from `backend/` using Fly CLI.
- Provider secrets are never committed. They are set with Fly secrets or provider dashboards.

## Prompt P3 - Vendor Rule Auto-Apply Mode

The `vendor_rules` table needs a new `auto_mode` column. The backend defaults the value to `'suggest'` (current behaviour) for any rule that does not yet carry the column, but new writes will fail until the column exists with the right CHECK constraint.

### Supabase migration

Run once against the production Supabase project (`iawkqvdtktnvxqgpupvt`) — either via the Supabase SQL editor or `supabase db push` with a migration file containing:

```sql
ALTER TABLE public.vendor_rules
  ADD COLUMN IF NOT EXISTS auto_mode TEXT NOT NULL DEFAULT 'suggest';

ALTER TABLE public.vendor_rules
  DROP CONSTRAINT IF EXISTS vendor_rules_auto_mode_check;

ALTER TABLE public.vendor_rules
  ADD CONSTRAINT vendor_rules_auto_mode_check
  CHECK (auto_mode IN ('suggest', 'auto_fill', 'auto_ready'));
```

Existing rules will keep the legacy "suggest" behaviour. Power-user vendors are upgraded from the **Vendor memory** card in `/dashboard/settings` (toggle between *Suggest only*, *Auto-fill + confirm required*, and *Auto-fill + mark Ready automatically*).

### Workspace setup

1. Open `/dashboard/settings` → **Vendor memory** and pick the auto-apply mode per vendor. Only switch a vendor to **Auto-fill + mark Ready automatically** after several invoices have published cleanly with the same coding.
2. After backend deploy, the next Accounts Payable item created from a matching vendor's reviewed invoice will be pre-filled. The review board surfaces a **Pre-filled by vendor rule** notice with a one-click **Override** that clears the pre-filled fields and tells the backend to stop showing the notice on that item.

## Prompt P6 - Connected Sources (Google Drive / Dropbox Watch Folders)

The backend route and Supabase schema are deployed. The **Connect** buttons stay disabled in the UI until provider OAuth apps are registered and secrets are written. The UI shows "Setup pending" with a pointer to this section.

### 1. Generate the token encryption key

Connected source access + refresh tokens are stored Fernet-encrypted. Generate one key per environment and treat it like a database password — losing it means every connected workspace has to reconnect.

```powershell
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### 2. Register the Google Cloud OAuth client

1. Open the [Google Cloud console](https://console.cloud.google.com/) → APIs & Services → **OAuth consent screen** → set the app to *External* (or *Internal* if your workspace is Google Workspace) and add `…/auth/drive.readonly`, `openid`, `email` as scopes.
2. APIs & Services → **Credentials** → **Create credentials → OAuth client ID** → *Web application*.
3. Add the redirect URI:

   `https://backend-lively-hill-7043.fly.dev/api/v1/connected-sources/google_drive/callback`

4. Copy the **Client ID** and **Client secret**.

### 3. Register the Dropbox app

1. Open the [Dropbox app console](https://www.dropbox.com/developers/apps) → **Create app** → *Scoped access* → *Full Dropbox* (or *App folder* if you want stricter sandboxing).
2. Permissions tab → enable `files.metadata.read` and `files.content.read`.
3. Settings tab → add the redirect URI:

   `https://backend-lively-hill-7043.fly.dev/api/v1/connected-sources/dropbox/callback`

4. Copy the **App key** and **App secret**.

### 4. Write the Fly secrets

```powershell
fly secrets set `
  GOOGLE_DRIVE_CLIENT_ID="<google client id>" `
  GOOGLE_DRIVE_CLIENT_SECRET="<google client secret>" `
  GOOGLE_DRIVE_REDIRECT_URI="https://backend-lively-hill-7043.fly.dev/api/v1/connected-sources/google_drive/callback" `
  DROPBOX_APP_KEY="<dropbox app key>" `
  DROPBOX_APP_SECRET="<dropbox app secret>" `
  DROPBOX_REDIRECT_URI="https://backend-lively-hill-7043.fly.dev/api/v1/connected-sources/dropbox/callback" `
  CONNECTED_SOURCES_TOKEN_ENCRYPTION_KEY="<fernet key from step 1>" `
  -a backend-lively-hill-7043
```

Once these land, the **Connect** buttons activate in `/dashboard/inbox` and the OAuth handshake works end-to-end (code exchange → encrypted token storage → account email lookup → redirect back to the inbox).

### 5. Pending: file polling

The Connect, Disconnect, Edit folder, and Sync now buttons are wired and the schema is in place, but the periodic worker that pulls new files from each connected folder is **not yet implemented**. The current **Sync now** action records the timestamp and surfaces an amber notice in the card: *"Folder polling is queued — files will start arriving once the scheduled poller lands."*

When you are ready to ship the poller, the implementation lives in `backend/app/services/connected_sources_service.py` (the `manual_sync_stub` function is the placeholder). The minimum cut needs:

- Celery beat task that wakes every N minutes per connected source
- Token refresh helpers for both providers (refresh tokens are already stored in `encrypted_refresh_token`)
- A `pull_new_files` routine that lists files in `watched_folder` modified since `last_synced_at`, downloads each, and hands them to the existing batch ingest pipeline with `source_kind` set to the matching provider so the inbox table shows the right badge

Until then, the connection UI is fully usable — useful for QA and screenshots — but no files arrive from the watched folder.

## Prompt P8 - Xero Accounting Connector

The backend connector, Supabase schema (`xero_connections`, `xero_oauth_states`, `xero_reference_data`, `xero_bill_publications`, and `workspaces.accounting_destination`), Integrations card, destination selector, and destination-aware AP coding form are all deployed. The **Connect Xero** button works once the Xero app is registered and secrets are written.

### 1. Generate the token encryption key

Xero access + refresh tokens are stored Fernet-encrypted with their own key (independent of QuickBooks and Connected Sources):

```powershell
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### 2. Register the Xero app

1. Open the [Xero developer portal](https://developer.xero.com/app/manage) → **New app** → *Web app*.
2. Set the OAuth 2.0 redirect URI:

   `https://backend-lively-hill-7043.fly.dev/api/v1/integrations/xero/callback`

3. The connector requests these scopes (already coded, no portal config needed): `offline_access accounting.transactions accounting.contacts accounting.settings`.
4. Copy the **Client id** and generate a **Client secret**.

### 3. Write the Fly secrets

```powershell
fly secrets set `
  XERO_CLIENT_ID="<xero client id>" `
  XERO_CLIENT_SECRET="<xero client secret>" `
  XERO_REDIRECT_URI="https://backend-lively-hill-7043.fly.dev/api/v1/integrations/xero/callback" `
  XERO_TOKEN_ENCRYPTION_KEY="<fernet key from step 1>" `
  -a backend-lively-hill-7043
```

Once these land, the **Connect Xero** card in `/dashboard/integrations` activates. The OAuth handshake exchanges the code, reads the organisation tenant from `/connections`, stores encrypted tokens, and syncs contacts (suppliers) + chart of accounts + tax rates into the coding form.

### 4. Per-workspace destination

The Integrations page has a **Accounting destination** toggle (QuickBooks / Xero). It is stored on `workspaces.accounting_destination` and drives:
- which connector the AP coding form reads its dropdowns from
- the field labels (QuickBooks "vendor / expense account / tax code" vs Xero "contact / account / tax rate")
- which API the **Publish** button targets (a draft ACCPAY invoice in Xero, or an unpaid Bill in QuickBooks)

Connecting Xero auto-switches the destination to Xero; you can switch back any time. Connecting both lets you keep QuickBooks clients and Xero clients in separate workspaces.

### Notes / deferred

- Xero "Bills" are created as **DRAFT ACCPAY invoices** — the reviewer/owner approves them inside Xero, matching the "reviewed by you before it posts" model.
- Source-document attachment to the Xero Bill is **not yet wired** (QuickBooks has it). The Bill is created with line coding; attaching the original file is the next increment if needed.

## Prompt P9 - Purchase Order Matching

No provider credentials or secrets. The `purchase_orders` table and the `accounts_payable_items.matched_po_id` column are deployed.

### Importing open POs (workspace owner action)

There is no live PO sync yet, so open POs are loaded by CSV:

1. In the AP coding form, click **Match PO** next to the vendor field, then **Import POs (CSV)** (also reachable from the empty state).
2. Paste a CSV with a header row. Recognised columns (case-insensitive): `po_number` (required), `vendor`, `date`, `total`, `remaining`, `currency`. Rows without a `po_number` are skipped; existing PO numbers in the workspace are updated in place.
3. Matching uses the normalised vendor name — POs whose vendor matches the invoice's vendor are shown first, with all open POs as a fallback so a slightly different name still lets the reviewer pick.

### Deferred

- **Live QBO/Xero PO sync** is not yet implemented (the `source` column already supports `qbo`/`xero` for when it lands). Today POs come from CSV import.
- Matching is at the **document/total level** (2-way: invoice ↔ PO total), not line-level 3-way (PO ↔ receipt ↔ invoice). The "Exceeds" flag fires when the invoice total is greater than the PO total, and publish asks for confirmation before proceeding.

## Rule For Later Prompts

After each later prompt, append a new section here only if it adds a manual provider step, API credential, dashboard configuration, compliance action, or user authorization step. If a prompt needs no manual action, do not add a section.

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

## Deployment Responsibility

- Frontend: changes are committed and pushed to the GitHub `frontend` repository so Vercel deploys them.
- Backend: changes are committed and pushed to `olmocr-backend`, then deployed from `backend/` using Fly CLI.
- Provider secrets are never committed. They are set with Fly secrets or provider dashboards.

## Rule For Later Prompts

After each later prompt, append a new section here only if it adds a manual provider step, API credential, dashboard configuration, compliance action, or user authorization step. If a prompt needs no manual action, do not add a section.

# Manual Setup Requirements

This file records only work that requires your account access, provider approval, or secret values. Code and Supabase migrations that can be performed through the project tools are not manual steps.

## Completed By Implementation Through Prompt 15

- Durable Supabase tables and backend APIs for document modes, extraction review, duplicate warnings, vendor memory, Accounts Payable preparation, and QuickBooks connection storage have been implemented or migrated through the connected tooling.
- Redis remains queue/progress state; Supabase Database and Storage remain durable state.
- QuickBooks tokens are designed to stay backend-only and encrypted at rest.
- No QuickBooks bill publishing or automatic payment behavior exists yet.

## Prompt 1 - Canonical Document Modes

No manual action required.

## Prompt 2 - Durable Document And Extraction Persistence

No manual action required. Supabase is the durable metadata/storage source.

## Prompt 3 - Source Pages And Preview Traceability

No manual action required unless the Supabase `jobs` storage bucket is later renamed or its storage policies are manually changed.

## Prompt 4 - Structured Invoice Extraction

No manual action required.

## Prompt 5 - Structured Receipt Extraction

No manual action required.

## Prompt 6 - Bank Statement Canonical Review Output

No manual action required.

## Prompt 7 - Table And Notes Modes

No manual action required.

## Prompt 8 - Auto Detection For Mixed Batches

No manual action required.

## Prompt 9 - Backend Review Editing API

No manual action required after the Supabase migration has been applied.

## Prompt 10 - Spreadsheet Review Board UI

No manual action required.

## Prompt 11 - Reviewed Excel And CSV Exports

No manual action required.

## Prompt 12 - Duplicate Detection

No manual action required.

## Prompt 13 - Vendor Memory

No manual action required. Vendor suggestions remain workspace-scoped and user-approved.

## Prompt 14 - Accounts Payable Queue

No manual action required. This queue prepares reviewed invoice drafts only; it does not publish or pay bills.

## Prompt 15 - QuickBooks Online Connection

### You Must Do In Intuit

1. Create a QuickBooks Online app in the Intuit Developer dashboard and enable the **QuickBooks Online Accounting** scope.
2. Create or connect an Intuit sandbox company for testing.
3. Add this exact sandbox redirect URI in the Intuit app:

   `https://backend-lively-hill-7043.fly.dev/api/v1/integrations/quickbooks/callback`

4. Copy the sandbox **Client ID** and **Client Secret** from Intuit.
5. After deployment, sign in to AxLiner, open `/dashboard/integrations`, choose **Connect QuickBooks**, and authorize your sandbox company as a company admin.
6. Use **Refresh lists** and confirm that vendors, accounts/categories, and tax references are visible.
7. Use **Disconnect** once in sandbox and confirm Intuit access is revoked, then reconnect if you need the connection for Prompt 16 work.

### You Must Set As Fly Secrets

Do not put these values in Git or frontend environment variables:

```powershell
fly secrets set QUICKBOOKS_CLIENT_ID="<intuit sandbox client id>" QUICKBOOKS_CLIENT_SECRET="<intuit sandbox client secret>" -a backend-lively-hill-7043
```

`QUICKBOOKS_TOKEN_ENCRYPTION_KEY` has already been generated and configured as a Fly secret. `QUICKBOOKS_REDIRECT_URI`, environment, and API minor version are already represented in `backend/fly.toml`.

### Before Production Use

1. Create or promote the Intuit production app credentials.
2. Register the production callback URI in Intuit; keep the same backend callback URL if the backend domain does not change.
3. Replace Fly secrets with production Client ID and Client Secret.
4. Set `QUICKBOOKS_ENVIRONMENT=production` and redeploy the backend.
5. Connect a real QuickBooks company only with the owner's authorization.
6. Complete QuickBooks review/publishing requirements before exposing bill publishing to customers.

## Deployment Responsibility

- Frontend: changes are committed and pushed to the GitHub `frontend` repository so Vercel deploys them.
- Backend: changes are committed and pushed to `olmocr-backend`, then deployed from `backend/` using Fly CLI.
- Provider secrets are never committed. They are set with Fly secrets or provider dashboards.

## Rule For Later Prompts

After each later prompt, append a new section here only if it adds a manual provider step, API credential, dashboard configuration, compliance action, or user authorization step. If a prompt needs no manual action, do not add a section.

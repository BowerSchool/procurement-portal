# Bower Procurement & Vendor Payables Management Portal

Modern web portal for Bower School of Entrepreneurship to stop unauthorized vendor payments, enforce PR/PO/invoice controls, and give Finance visibility into future liabilities.

## Stack

- Next.js 15, TypeScript, Tailwind CSS, ShadCN-style UI components
- Node.js route handlers
- PostgreSQL and Prisma ORM
- RBAC for Employee, Reporting Manager, Finance, Finance Head, Founder/CEO and Admin

## Included

- Vendor master with GST, PAN, contact, banking and documents
- Purchase Request workflow with automatic approval matrix routing
- Purchase Order generation model with `PO-YYYY-00001` numbering
- Purchase receipts gatekeeping
- Vendor bill validation: no PO, duplicate invoice, amount exceeding PO, missing GST and incomplete receipt
- Recurring bills, notifications, reports, audit trail and budget controls
- Finance dashboard, Founder dashboard and settings/RBAC screens
- Prisma schema, seed data, API route handlers and Docker deployment

## Run Locally

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open `http://localhost:3000`.

## Supabase Backend

This project is ready to use Supabase as the hosted backend.

1. Create a Supabase project.
2. Copy `.env.example` to `.env`.
3. In Supabase, open **Project Settings > Database** and copy:
   - pooled connection string into `DATABASE_URL`
   - direct connection string into `DIRECT_URL`
   - URL-encode special characters in the password, for example `@` becomes `%40`
4. In Supabase, open **Project Settings > API** and copy:
   - Project URL into `NEXT_PUBLIC_SUPABASE_URL`, using the format `https://<project-ref>.supabase.co`
   - anon public key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service role key into `SUPABASE_SERVICE_ROLE_KEY`
5. Run Prisma migrations against Supabase:

```bash
npx prisma migrate deploy
npx prisma db seed
```

6. Run `supabase/rls.sql` in the Supabase SQL editor to enable row level security for direct Supabase table access.
7. Run `supabase/storage.sql` in the Supabase SQL editor to create private Storage buckets for vendor documents, PR attachments, receipts, invoices and POs.

The API routes use Prisma for database writes and Supabase Auth for bearer-token user lookup. Send authenticated API requests with:

```http
Authorization: Bearer <supabase-access-token>
```

The endpoint `GET /api/auth/me` confirms the active Supabase-authenticated portal user and role.

## Docker

```bash
docker compose up --build
```

The app starts on `http://localhost:3000` and PostgreSQL on port `5432`.

## API Surface

- `GET /api/dashboard`
- `GET /api/vendors`
- `POST /api/vendors`
- `GET /api/purchase-requests`
- `POST /api/purchase-requests`
- `POST /api/approvals`
- `POST /api/purchase-orders`
- `GET /api/bills`
- `POST /api/bills`

For demo RBAC, pass `x-user-email` and optionally `x-user-role` headers. Replace `lib/auth.ts` with a NextAuth provider for production identity.

## Controls

- Employees see only their own PRs.
- Managers see approval tasks assigned to them.
- Finance, Finance Head, Founder and Admin see global procurement and payables.
- Finance creates POs only after PR approval.
- Bills require a linked PO.
- Payments are held until receipt status is `COMPLETE`.
- Budget exceed blocks approval unless Finance Head or Founder applies override.
- Every mutating API writes an audit trail entry.

## Production Notes

- Add S3/GCS storage for documents and invoice PDFs.
- Or use Supabase Storage buckets for vendor documents, PR attachments, receipt proofs and invoice PDFs.
- Add background jobs for recurring bill generation and 7-day due notifications.
- Add email provider integration in notification triggers.
- Add database indexes for business-unit scale once usage patterns are known.
- Put the app behind SSO by connecting Supabase Auth to the organization's identity provider.

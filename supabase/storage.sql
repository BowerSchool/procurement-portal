-- Optional Supabase Storage setup for procurement files.
-- Run this in the Supabase SQL editor after creating the project.

insert into storage.buckets (id, name, public)
values
  ('vendor-documents', 'vendor-documents', false),
  ('purchase-request-attachments', 'purchase-request-attachments', false),
  ('purchase-receipts', 'purchase-receipts', false),
  ('vendor-invoices', 'vendor-invoices', false),
  ('purchase-orders', 'purchase-orders', false)
on conflict (id) do nothing;

create policy "authenticated_upload_procurement_files"
on storage.objects for insert
to authenticated
with check (
  bucket_id in (
    'vendor-documents',
    'purchase-request-attachments',
    'purchase-receipts',
    'vendor-invoices',
    'purchase-orders'
  )
);

create policy "authenticated_read_procurement_files"
on storage.objects for select
to authenticated
using (
  bucket_id in (
    'vendor-documents',
    'purchase-request-attachments',
    'purchase-receipts',
    'vendor-invoices',
    'purchase-orders'
  )
);

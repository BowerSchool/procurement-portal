-- Run this in the Supabase SQL editor after Prisma has created the tables.
-- The application server still enforces RBAC. These policies protect direct
-- Supabase table access when using anon/authenticated clients.

create or replace function public.current_app_user_id()
returns text
language sql
stable
as $$
  select id from public."User" where email = auth.jwt() ->> 'email' limit 1
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
as $$
  select role::text from public."User" where email = auth.jwt() ->> 'email' limit 1
$$;

create or replace function public.can_see_all_procurement()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_app_role() in ('FINANCE', 'FINANCE_HEAD', 'FOUNDER_CEO', 'ADMIN'), false)
$$;

alter table public."User" enable row level security;
alter table public."Department" enable row level security;
alter table public."Vendor" enable row level security;
alter table public."VendorDocument" enable row level security;
alter table public."PurchaseRequest" enable row level security;
alter table public."RequestAttachment" enable row level security;
alter table public."ApprovalStep" enable row level security;
alter table public."PurchaseOrder" enable row level security;
alter table public."PurchaseReceipt" enable row level security;
alter table public."VendorBill" enable row level security;
alter table public."RecurringBill" enable row level security;
alter table public."DepartmentBudget" enable row level security;
alter table public."Notification" enable row level security;
alter table public."AuditTrail" enable row level security;

create policy "users_read_self_or_finance"
on public."User" for select
to authenticated
using (id = public.current_app_user_id() or public.can_see_all_procurement());

create policy "departments_are_readable"
on public."Department" for select
to authenticated
using (true);

create policy "finance_can_read_vendors"
on public."Vendor" for select
to authenticated
using (public.can_see_all_procurement() or status = 'ACTIVE');

create policy "finance_can_manage_vendors"
on public."Vendor" for all
to authenticated
using (public.current_app_role() in ('FINANCE', 'FINANCE_HEAD', 'ADMIN'))
with check (public.current_app_role() in ('FINANCE', 'FINANCE_HEAD', 'ADMIN'));

create policy "vendor_documents_follow_vendor_access"
on public."VendorDocument" for select
to authenticated
using (
  public.can_see_all_procurement()
  or exists (
    select 1 from public."Vendor" vendor
    where vendor.id = public."VendorDocument"."vendorId"
      and vendor.status = 'ACTIVE'
  )
);

create policy "request_visibility"
on public."PurchaseRequest" for select
to authenticated
using (
  public.can_see_all_procurement()
  or "requesterId" = public.current_app_user_id()
  or exists (
    select 1 from public."User" teammate
    where teammate.id = public."PurchaseRequest"."requesterId"
      and teammate."managerId" = public.current_app_user_id()
  )
);

create policy "employees_create_own_requests"
on public."PurchaseRequest" for insert
to authenticated
with check ("requesterId" = public.current_app_user_id());

create policy "request_attachments_follow_request_access"
on public."RequestAttachment" for select
to authenticated
using (
  public.can_see_all_procurement()
  or exists (
    select 1 from public."PurchaseRequest" pr
    where pr.id = public."RequestAttachment"."purchaseRequestId"
      and pr."requesterId" = public.current_app_user_id()
  )
);

create policy "approval_visibility"
on public."ApprovalStep" for select
to authenticated
using (
  public.can_see_all_procurement()
  or "approverId" = public.current_app_user_id()
  or exists (
    select 1 from public."PurchaseRequest" pr
    where pr.id = public."ApprovalStep"."purchaseRequestId"
      and pr."requesterId" = public.current_app_user_id()
  )
);

create policy "assigned_approvers_update_steps"
on public."ApprovalStep" for update
to authenticated
using ("approverId" = public.current_app_user_id() or public.current_app_role() = 'ADMIN')
with check ("approverId" = public.current_app_user_id() or public.current_app_role() = 'ADMIN');

create policy "finance_manage_pos"
on public."PurchaseOrder" for all
to authenticated
using (public.can_see_all_procurement())
with check (public.current_app_role() in ('FINANCE', 'FINANCE_HEAD', 'ADMIN'));

create policy "finance_manage_receipts"
on public."PurchaseReceipt" for all
to authenticated
using (public.can_see_all_procurement())
with check (public.current_app_role() in ('REPORTING_MANAGER', 'FINANCE', 'FINANCE_HEAD', 'ADMIN'));

create policy "finance_manage_bills"
on public."VendorBill" for all
to authenticated
using (public.can_see_all_procurement())
with check (public.current_app_role() in ('FINANCE', 'FINANCE_HEAD', 'ADMIN'));

create policy "finance_manage_recurring_bills"
on public."RecurringBill" for all
to authenticated
using (public.can_see_all_procurement())
with check (public.current_app_role() in ('FINANCE', 'FINANCE_HEAD', 'ADMIN'));

create policy "budget_visibility"
on public."DepartmentBudget" for select
to authenticated
using (public.can_see_all_procurement());

create policy "users_read_own_notifications"
on public."Notification" for select
to authenticated
using ("userId" = public.current_app_user_id());

create policy "users_update_own_notifications"
on public."Notification" for update
to authenticated
using ("userId" = public.current_app_user_id())
with check ("userId" = public.current_app_user_id());

create policy "audit_finance_visibility"
on public."AuditTrail" for select
to authenticated
using (public.can_see_all_procurement());

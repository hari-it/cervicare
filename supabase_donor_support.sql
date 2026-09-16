-- CERVICARE Phase 5: donor support prototype
-- Run manually after the existing support and hospital-verification SQL files.
-- This file is not executed by the application.
-- No payment gateway or card data is handled here.

-- Donors create support intents through the controlled RPC below rather than
-- inserting arbitrary amounts directly from the browser.
drop policy if exists "Donors can create own support records for approved cases"
  on public.support_records;

create or replace function public.create_support_intent(
  p_case_id uuid,
  p_amount numeric
)
returns public.support_records
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_case public.patient_cases%rowtype;
  reserved_amount numeric(12, 2);
  created_record public.support_records;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Support amount must be greater than zero';
  end if;

  select * into selected_case
  from public.patient_cases
  where id = p_case_id
    and case_status = 'published'
    and hospital_verification_status = 'verified'
    and admin_verification_status = 'approved'
  for update;

  if not found then
    raise exception 'This case is not approved for donor support';
  end if;

  select coalesce(sum(amount), 0)
  into reserved_amount
  from public.support_records
  where case_id = p_case_id
    and status in ('pending', 'under_review', 'verified', 'completed');

  if p_amount > greatest(
    0,
    coalesce(selected_case.assistance_requested, 0)
      - coalesce(selected_case.assistance_received, 0)
      - reserved_amount
  ) then
    raise exception 'Support amount exceeds the remaining available need';
  end if;

  insert into public.support_records (donor_user_id, case_id, amount, status)
  values (auth.uid(), p_case_id, p_amount, 'pending')
  returning * into created_record;

  return created_record;
end;
$$;

revoke all on function public.create_support_intent(uuid, numeric) from public;
grant execute on function public.create_support_intent(uuid, numeric) to authenticated;

-- Only verified/completed support changes actual assistance_received. A pending
-- prototype intent is not represented as received money.
create or replace function public.apply_verified_support_amount()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('verified', 'completed')
    and (tg_op = 'INSERT' or old.status not in ('verified', 'completed')) then
    update public.patient_cases
    set assistance_received = least(
      coalesce(assistance_requested, 0),
      coalesce(assistance_received, 0) + new.amount
    ),
    updated_at = now()
    where id = new.case_id;
  end if;
  return new;
end;
$$;

drop trigger if exists support_records_apply_verified_amount on public.support_records;
create trigger support_records_apply_verified_amount
after insert or update on public.support_records
for each row execute function public.apply_verified_support_amount();

-- CERVICARE Phase 2: hospital verification workflow
-- Run manually after supabase_support_schema.sql.
-- This file is not executed by the application.
-- Reviewer rows must be provisioned manually for trusted CERVICARE reviewers.

create table if not exists public.hospital_representatives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  hospital_id uuid not null references public.hospitals (id) on delete cascade,
  status text not null default 'pending' check (
    status in ('pending', 'verified', 'rejected')
  ),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, hospital_id)
);

create table if not exists public.support_reviewers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'pending' check (
    status in ('pending', 'verified', 'rejected')
  ),
  created_at timestamptz not null default now()
);

create index if not exists hospital_representatives_hospital_id_idx
  on public.hospital_representatives (hospital_id);

create index if not exists hospital_representatives_user_id_idx
  on public.hospital_representatives (user_id);

alter table public.hospital_representatives enable row level security;
alter table public.support_reviewers enable row level security;

create or replace function public.support_is_reviewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.support_reviewers
    where user_id = auth.uid()
      and status = 'verified'
  );
$$;

create or replace function public.support_is_verified_representative(p_hospital_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.hospital_representatives hr
    join public.hospitals h on h.id = hr.hospital_id
    where hr.user_id = auth.uid()
      and hr.hospital_id = p_hospital_id
      and hr.status = 'verified'
      and h.verification_status = 'verified'
  );
$$;

revoke all on function public.support_is_reviewer() from public;
revoke all on function public.support_is_verified_representative(uuid) from public;
grant execute on function public.support_is_reviewer() to authenticated;
grant execute on function public.support_is_verified_representative(uuid) to authenticated;

create policy "Authenticated users can request hospital registration"
  on public.hospitals
  for insert
  to authenticated
  with check (verification_status = 'pending');

create policy "Users can read their hospital registration"
  on public.hospitals
  for select
  to authenticated
  using (
    verification_status = 'verified'
    or exists (
      select 1
      from public.hospital_representatives hr
      where hr.hospital_id = hospitals.id
        and hr.user_id = auth.uid()
    )
    or public.support_is_reviewer()
  );

create policy "Users can request hospital representation"
  on public.hospital_representatives
  for insert
  to authenticated
  with check (user_id = auth.uid() and status = 'pending');

create policy "Users can read their hospital representation"
  on public.hospital_representatives
  for select
  to authenticated
  using (user_id = auth.uid() or public.support_is_reviewer());

create policy "Reviewers can read all hospitals"
  on public.hospitals
  for select
  to authenticated
  using (public.support_is_reviewer());

create policy "Reviewers can read all hospital representations"
  on public.hospital_representatives
  for select
  to authenticated
  using (public.support_is_reviewer());

create policy "Verified representatives can read assigned cases"
  on public.patient_cases
  for select
  to authenticated
  using (public.support_is_verified_representative(hospital_id));

create policy "Verified representatives can read assigned document metadata"
  on public.case_documents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.patient_cases pc
      where pc.id = case_documents.case_id
        and public.support_is_verified_representative(pc.hospital_id)
    )
  );

create policy "Reviewers can read all patient cases"
  on public.patient_cases
  for select
  to authenticated
  using (public.support_is_reviewer());

create policy "Reviewers can read all case document metadata"
  on public.case_documents
  for select
  to authenticated
  using (public.support_is_reviewer());

create or replace function public.approve_hospital_registration(
  p_hospital_id uuid,
  p_representative_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.support_is_reviewer() then
    raise exception 'Reviewer approval is required';
  end if;

  update public.hospitals
  set verification_status = 'verified', verified_at = now()
  where id = p_hospital_id
    and verification_status in ('pending', 'under_review');

  if not found then
    raise exception 'Hospital registration is not awaiting review';
  end if;

  update public.hospital_representatives
  set status = 'verified', reviewed_by = auth.uid(), reviewed_at = now()
  where hospital_id = p_hospital_id
    and user_id = p_representative_user_id
    and status = 'pending';

  if not found then
    raise exception 'Hospital representative request is not awaiting review';
  end if;
end;
$$;

create or replace function public.reject_hospital_registration(
  p_hospital_id uuid,
  p_representative_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.support_is_reviewer() then
    raise exception 'Reviewer approval is required';
  end if;

  update public.hospitals
  set verification_status = 'rejected', verified_at = null
  where id = p_hospital_id
    and verification_status in ('pending', 'under_review');

  if not found then
    raise exception 'Hospital registration is not awaiting review';
  end if;

  update public.hospital_representatives
  set status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now()
  where hospital_id = p_hospital_id
    and user_id = p_representative_user_id
    and status = 'pending';
end;
$$;

create or replace function public.verify_patient_case(p_case_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.patient_cases
  set hospital_verification_status = 'verified',
      case_status = 'under_review',
      updated_at = now()
  where id = p_case_id
    and public.support_is_verified_representative(hospital_id)
    and hospital_verification_status in ('pending', 'under_review')
    and admin_verification_status = 'pending';

  if not found then
    raise exception 'This case is not assigned to your verified hospital or is not awaiting verification';
  end if;
end;
$$;

create or replace function public.reject_patient_case(p_case_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.patient_cases
  set hospital_verification_status = 'rejected',
      case_status = 'rejected',
      updated_at = now()
  where id = p_case_id
    and public.support_is_verified_representative(hospital_id)
    and hospital_verification_status in ('pending', 'under_review')
    and admin_verification_status = 'pending';

  if not found then
    raise exception 'This case is not assigned to your verified hospital or is not awaiting verification';
  end if;
end;
$$;

create or replace function public.protect_case_review_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.hospital_id is distinct from new.hospital_id
    or old.assistance_received is distinct from new.assistance_received
    or old.admin_verification_status is distinct from new.admin_verification_status
    or old.hospital_verification_status is distinct from new.hospital_verification_status
    or old.case_status is distinct from new.case_status then
    if public.support_is_reviewer() then
      return new;
    end if;

    if public.support_is_verified_representative(old.hospital_id)
      and new.hospital_id = old.hospital_id
      and new.assistance_received = old.assistance_received
      and new.admin_verification_status = old.admin_verification_status
      and new.hospital_verification_status in ('verified', 'rejected')
      and new.case_status in ('under_review', 'rejected') then
      return new;
    end if;

    raise exception 'Case verification fields are controlled by the hospital or CERVICARE reviewer';
  end if;

  return new;
end;
$$;

drop trigger if exists patient_cases_protect_review_fields on public.patient_cases;
create trigger patient_cases_protect_review_fields
before update on public.patient_cases
for each row execute function public.protect_case_review_fields();

create or replace function public.review_patient_case(
  p_case_id uuid,
  p_decision text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.support_is_reviewer() then
    raise exception 'Reviewer approval is required';
  end if;

  if p_decision = 'approve' then
    update public.patient_cases
    set admin_verification_status = 'approved',
        case_status = 'published',
        updated_at = now()
    where id = p_case_id
      and hospital_verification_status = 'verified'
      and admin_verification_status in ('pending', 'under_review');
  elsif p_decision = 'reject' then
    update public.patient_cases
    set admin_verification_status = 'rejected',
        case_status = 'rejected',
        updated_at = now()
    where id = p_case_id
      and admin_verification_status in ('pending', 'under_review');
  else
    raise exception 'Decision must be approve or reject';
  end if;

  if not found then
    raise exception 'Case is not eligible for reviewer decision';
  end if;
end;
$$;

revoke all on function public.approve_hospital_registration(uuid, uuid) from public;
revoke all on function public.reject_hospital_registration(uuid, uuid) from public;
revoke all on function public.verify_patient_case(uuid) from public;
revoke all on function public.reject_patient_case(uuid) from public;
revoke all on function public.review_patient_case(uuid, text) from public;
grant execute on function public.approve_hospital_registration(uuid, uuid) to authenticated;
grant execute on function public.reject_hospital_registration(uuid, uuid) to authenticated;
grant execute on function public.verify_patient_case(uuid) to authenticated;
grant execute on function public.reject_patient_case(uuid) to authenticated;
grant execute on function public.review_patient_case(uuid, text) to authenticated;

-- Reviewer bootstrap example; replace the UUID manually and never expose keys:
-- insert into public.support_reviewers (user_id, status)
-- values ('AUTHENTICATED_REVIEWER_USER_UUID', 'verified');

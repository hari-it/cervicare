-- CERVICARE role foundation and database-enforced portal access.
-- Run manually after the existing profile, support, and hospital SQL files.

alter table public.profiles add column if not exists role text;
update public.profiles set role = 'patient' where role is null;
alter table public.profiles alter column role set default 'patient';
alter table public.profiles alter column role set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check' and conrelid = 'public.profiles'::regclass) then
    alter table public.profiles add constraint profiles_role_check check (role in ('patient', 'hospital', 'donor', 'admin'));
  end if;
end;
$$;

create or replace function public.cervicare_is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.support_reviewers where user_id = auth.uid() and status = 'verified');
$$;

create or replace function public.cervicare_has_profile_role(required_role text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = required_role);
$$;

create or replace function public.cervicare_is_verified_hospital()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.hospital_representatives hr
    join public.hospitals h on h.id = hr.hospital_id
    where hr.user_id = auth.uid() and hr.status = 'verified' and h.verification_status = 'verified'
  );
$$;

revoke all on function public.cervicare_is_admin() from public;
revoke all on function public.cervicare_has_profile_role(text) from public;
revoke all on function public.cervicare_is_verified_hospital() from public;
grant execute on function public.cervicare_is_admin() to authenticated;
grant execute on function public.cervicare_has_profile_role(text) to authenticated;
grant execute on function public.cervicare_is_verified_hospital() to authenticated;
drop function if exists public.cervicare_is_role(text);

-- Map already-provisioned reviewers before installing the self-change trigger.
update public.profiles p set role = 'admin'
where exists (select 1 from public.support_reviewers sr where sr.user_id = p.id and sr.status = 'verified');

create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.cervicare_is_admin() then
    raise exception 'Only a verified CERVICARE reviewer can change account roles';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_self_role_change on public.profiles;
create trigger profiles_prevent_self_role_change before update on public.profiles
for each row execute function public.prevent_self_role_change();

drop policy if exists "Patients can read own cases or approved published cases" on public.patient_cases;
drop policy if exists "Role access for patient cases" on public.patient_cases;
create policy "Role access for patient cases" on public.patient_cases for select to authenticated
using (
  (auth.uid() = patient_user_id and public.cervicare_has_profile_role('patient'))
  or public.cervicare_is_admin()
  or public.cervicare_is_verified_hospital()
  or (public.cervicare_has_profile_role('donor') and case_status = 'published' and hospital_verification_status = 'verified' and admin_verification_status = 'approved')
);

drop policy if exists "Patients can create own cases" on public.patient_cases;
create policy "Patients can create own cases" on public.patient_cases for insert to authenticated
with check (auth.uid() = patient_user_id and public.cervicare_has_profile_role('patient'));

drop policy if exists "Patients can update own cases" on public.patient_cases;
create policy "Patients can update own cases" on public.patient_cases for update to authenticated
using (auth.uid() = patient_user_id and public.cervicare_has_profile_role('patient'))
with check (auth.uid() = patient_user_id and public.cervicare_has_profile_role('patient'));

drop policy if exists "Patients can delete own cases" on public.patient_cases;
create policy "Patients can delete own cases" on public.patient_cases for delete to authenticated
using (auth.uid() = patient_user_id and public.cervicare_has_profile_role('patient'));

drop policy if exists "Patients can read own case document metadata" on public.case_documents;
drop policy if exists "Patients can add own case document metadata" on public.case_documents;
drop policy if exists "Patients can update own case document metadata" on public.case_documents;
drop policy if exists "Patients can delete own case document metadata" on public.case_documents;
drop policy if exists "Role access for case document metadata" on public.case_documents;
create policy "Role access for case document metadata" on public.case_documents for select to authenticated
using (
  public.cervicare_is_admin() or public.cervicare_is_verified_hospital()
  or exists (select 1 from public.patient_cases pc where pc.id = case_documents.case_id and pc.patient_user_id = auth.uid() and public.cervicare_has_profile_role('patient'))
);
create policy "Patients can add own case document metadata" on public.case_documents for insert to authenticated
with check (exists (select 1 from public.patient_cases pc where pc.id = case_documents.case_id and pc.patient_user_id = auth.uid() and public.cervicare_has_profile_role('patient')));
create policy "Patients can update own case document metadata" on public.case_documents for update to authenticated
using (exists (select 1 from public.patient_cases pc where pc.id = case_documents.case_id and pc.patient_user_id = auth.uid() and public.cervicare_has_profile_role('patient')))
with check (exists (select 1 from public.patient_cases pc where pc.id = case_documents.case_id and pc.patient_user_id = auth.uid() and public.cervicare_has_profile_role('patient')));
create policy "Patients can delete own case document metadata" on public.case_documents for delete to authenticated
using (exists (select 1 from public.patient_cases pc where pc.id = case_documents.case_id and pc.patient_user_id = auth.uid() and public.cervicare_has_profile_role('patient')));

drop policy if exists "Donors can read own support records or patients can read case support" on public.support_records;
drop policy if exists "Role access for support records" on public.support_records;
create policy "Role access for support records" on public.support_records for select to authenticated
using (
  (donor_user_id = auth.uid() and public.cervicare_has_profile_role('donor')) or public.cervicare_is_admin()
  or exists (select 1 from public.patient_cases pc where pc.id = support_records.case_id and pc.patient_user_id = auth.uid() and public.cervicare_has_profile_role('patient'))
);

drop policy if exists "Donors can create own support records for approved cases" on public.support_records;
create policy "Donors can create own support records for approved cases" on public.support_records for insert to authenticated
with check (
  donor_user_id = auth.uid() and public.cervicare_has_profile_role('donor')
  and exists (select 1 from public.patient_cases pc where pc.id = support_records.case_id and pc.case_status = 'published' and pc.hospital_verification_status = 'verified' and pc.admin_verification_status = 'approved')
);

-- Donor access is granted by an admin, never by public signup:
-- update public.profiles set role = 'donor' where id = 'USER_UUID';
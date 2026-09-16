-- CERVICARE Phase 3: patient support case submission
-- Run manually after supabase_support_schema.sql and
-- supabase_hospital_verification.sql.
-- This file is not executed by the application.

insert into storage.buckets (id, name, public)
values ('patient-case-documents', 'patient-case-documents', false)
on conflict (id) do nothing;

-- Patients may upload only into a private folder belonging to their own case.
create policy "Patients can upload own case documents"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'patient-case-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.patient_cases
      where patient_cases.id = ((storage.foldername(name))[2])::uuid
        and patient_cases.patient_user_id = auth.uid()
    )
  );

create policy "Patients can read own private case documents"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'patient-case-documents'
    and (
      (
        (storage.foldername(name))[1] = auth.uid()::text
        and exists (
          select 1
          from public.patient_cases
          where patient_cases.id = ((storage.foldername(name))[2])::uuid
            and patient_cases.patient_user_id = auth.uid()
        )
      )
      or exists (
        select 1
        from public.patient_cases
        where patient_cases.id = ((storage.foldername(name))[2])::uuid
          and public.support_is_verified_representative(patient_cases.hospital_id)
      )
      or public.support_is_reviewer()
    )
  );

create policy "Patients can delete own private case documents"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'patient-case-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.patient_cases
      where patient_cases.id = ((storage.foldername(name))[2])::uuid
        and patient_cases.patient_user_id = auth.uid()
    )
  );

-- Force patient-created rows into the unverified workflow. Human hospital and
-- reviewer RPCs remain the only path to verification/publication.
create or replace function public.enforce_patient_case_submission_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.support_is_reviewer() then
    if new.hospital_id is null
      or not exists (
        select 1 from public.hospitals
        where hospitals.id = new.hospital_id
          and hospitals.verification_status = 'verified'
      ) then
      raise exception 'A verified hospital must be selected';
    end if;

    new.case_status = 'pending';
    new.hospital_verification_status = 'pending';
    new.admin_verification_status = 'pending';
    new.assistance_received = 0;
  end if;

  return new;
end;
$$;

drop trigger if exists patient_cases_enforce_submission_defaults on public.patient_cases;
create trigger patient_cases_enforce_submission_defaults
before insert on public.patient_cases
for each row execute function public.enforce_patient_case_submission_defaults();

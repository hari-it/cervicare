-- CERVICARE support foundation
-- Run manually in the Supabase SQL Editor.
-- This file is not executed by the application.
-- Keep any Storage bucket containing medical documents private; storage_path is
-- metadata only and this schema does not make uploaded files public.

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  region text,
  official_website text,
  verification_status text not null default 'pending' check (
    verification_status in ('pending', 'under_review', 'verified', 'rejected')
  ),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.patient_cases (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references auth.users (id) on delete cascade,
  case_reference text not null unique,
  diagnosis_description text,
  treatment_description text,
  hospital_id uuid references public.hospitals (id) on delete set null,
  estimated_treatment_cost numeric(12, 2),
  assistance_requested numeric(12, 2),
  assistance_received numeric(12, 2) not null default 0,
  case_status text not null default 'pending' check (
    case_status in ('pending', 'under_review', 'published', 'closed', 'rejected')
  ),
  hospital_verification_status text not null default 'pending' check (
    hospital_verification_status in ('pending', 'under_review', 'verified', 'rejected')
  ),
  admin_verification_status text not null default 'pending' check (
    admin_verification_status in ('pending', 'under_review', 'approved', 'rejected')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.patient_cases (id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  verification_status text not null default 'pending' check (
    verification_status in ('pending', 'under_review', 'verified', 'rejected')
  ),
  verified_by uuid references auth.users (id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.support_records (
  id uuid primary key default gen_random_uuid(),
  donor_user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid not null references public.patient_cases (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  status text not null default 'pending' check (
    status in ('pending', 'under_review', 'verified', 'rejected', 'completed', 'refunded')
  ),
  created_at timestamptz not null default now()
);

create index if not exists patient_cases_patient_user_id_idx
  on public.patient_cases (patient_user_id);

create index if not exists patient_cases_public_status_idx
  on public.patient_cases (case_status, admin_verification_status);

create index if not exists case_documents_case_id_idx
  on public.case_documents (case_id);

create index if not exists support_records_donor_user_id_idx
  on public.support_records (donor_user_id);

create index if not exists support_records_case_id_idx
  on public.support_records (case_id);

create or replace function public.set_support_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists patient_cases_set_updated_at on public.patient_cases;
create trigger patient_cases_set_updated_at
before update on public.patient_cases
for each row execute function public.set_support_updated_at();

alter table public.hospitals enable row level security;
alter table public.patient_cases enable row level security;
alter table public.case_documents enable row level security;
alter table public.support_records enable row level security;

-- Verified hospital records are visible to signed-in users; pending records
-- remain available only to the hospital owner/reviewer workflows added later.
create policy "Authenticated users can read verified hospitals"
  on public.hospitals
  for select
  to authenticated
  using (verification_status = 'verified');

-- Patients can manage only their own case rows. Published cases require both
-- human admin approval and hospital verification before donor-facing access.
create policy "Patients can read own cases or approved published cases"
  on public.patient_cases
  for select
  to authenticated
  using (
    auth.uid() = patient_user_id
    or (
      case_status = 'published'
      and hospital_verification_status = 'verified'
      and admin_verification_status = 'approved'
    )
  );

create policy "Patients can create own cases"
  on public.patient_cases
  for insert
  to authenticated
  with check (auth.uid() = patient_user_id);

create policy "Patients can update own cases"
  on public.patient_cases
  for update
  to authenticated
  using (auth.uid() = patient_user_id)
  with check (auth.uid() = patient_user_id);

create policy "Patients can delete own cases"
  on public.patient_cases
  for delete
  to authenticated
  using (auth.uid() = patient_user_id);

-- Document metadata and storage paths are visible only to the patient who owns
-- the case. No anonymous policy or public document policy is created.
create policy "Patients can read own case document metadata"
  on public.case_documents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.patient_cases
      where patient_cases.id = case_documents.case_id
        and patient_cases.patient_user_id = auth.uid()
    )
  );

create policy "Patients can add own case document metadata"
  on public.case_documents
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.patient_cases
      where patient_cases.id = case_documents.case_id
        and patient_cases.patient_user_id = auth.uid()
    )
  );

create policy "Patients can update own case document metadata"
  on public.case_documents
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.patient_cases
      where patient_cases.id = case_documents.case_id
        and patient_cases.patient_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.patient_cases
      where patient_cases.id = case_documents.case_id
        and patient_cases.patient_user_id = auth.uid()
    )
  );

create policy "Patients can delete own case document metadata"
  on public.case_documents
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.patient_cases
      where patient_cases.id = case_documents.case_id
        and patient_cases.patient_user_id = auth.uid()
    )
  );

-- Donors can create and read only their own support records. Patients can read
-- support records attached to their own cases. Published-case visibility is
-- governed by the patient_cases policy above.
create policy "Donors can read own support records or patients can read case support"
  on public.support_records
  for select
  to authenticated
  using (
    donor_user_id = auth.uid()
    or exists (
      select 1
      from public.patient_cases
      where patient_cases.id = support_records.case_id
        and patient_cases.patient_user_id = auth.uid()
    )
  );

create policy "Donors can create own support records for approved cases"
  on public.support_records
  for insert
  to authenticated
  with check (
    donor_user_id = auth.uid()
    and exists (
      select 1
      from public.patient_cases
      where patient_cases.id = support_records.case_id
        and patient_cases.case_status = 'published'
        and patient_cases.hospital_verification_status = 'verified'
        and patient_cases.admin_verification_status = 'approved'
    )
  );

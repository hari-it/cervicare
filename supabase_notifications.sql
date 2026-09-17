-- CERVICARE in-app notifications.
-- Run manually after the existing support, hospital, role-access, donor,
-- and admin-management migrations. This file is not executed by the app.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  link text,
  read boolean not null default false,
  event_key text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx
  on public.notifications (user_id);

create index if not exists notifications_unread_idx
  on public.notifications (user_id, created_at desc)
  where read = false;

create index if not exists notifications_created_at_idx
  on public.notifications (created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can mark own notifications read" on public.notifications;
create policy "Users can mark own notifications read"
  on public.notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.protect_notification_update()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or old.user_id <> auth.uid() then
    raise exception 'Only the notification owner can update notifications';
  end if;
  if new.user_id is distinct from old.user_id
    or new.type is distinct from old.type
    or new.title is distinct from old.title
    or new.message is distinct from old.message
    or new.link is distinct from old.link
    or new.event_key is distinct from old.event_key
    or new.created_at is distinct from old.created_at
    or (old.read and not new.read) then
    raise exception 'Only the read state can be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists notifications_protect_update on public.notifications;
create trigger notifications_protect_update
before update on public.notifications
for each row execute function public.protect_notification_update();

create or replace function public.cervicare_insert_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_link text,
  p_event_key text
)
returns void
language plpgsql
security definer set search_path = public, pg_temp
as $$
begin
  if p_user_id is null or p_event_key is null then return; end if;
  insert into public.notifications (user_id, type, title, message, link, event_key)
  values (p_user_id, p_type, p_title, p_message, p_link, p_event_key)
  on conflict (event_key) do nothing;
end;
$$;

revoke all on function public.cervicare_insert_notification(uuid, text, text, text, text, text) from public;

create or replace function public.notify_support_case_event()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
  representative record;
  reviewer record;
begin
  if tg_op = 'INSERT' then
    for representative in
      select hr.user_id
      from public.hospital_representatives hr
      join public.hospitals h on h.id = hr.hospital_id
      where hr.hospital_id = new.hospital_id
        and hr.status = 'verified'
        and h.verification_status = 'verified'
    loop
      perform public.cervicare_insert_notification(
        representative.user_id,
        'case_submitted',
        'New support case awaiting verification',
        'A new support case is awaiting hospital verification.',
        '/hospital-verification',
        'case_submitted:' || new.id || ':' || representative.user_id
      );
    end loop;
  elsif tg_op = 'UPDATE' then
    if old.hospital_verification_status is distinct from new.hospital_verification_status
      and new.hospital_verification_status = 'verified' then
      for reviewer in
        select user_id from public.support_reviewers where status = 'verified'
      loop
        perform public.cervicare_insert_notification(
          reviewer.user_id,
          'case_hospital_verified',
          'Patient case awaiting CERVICARE review',
          'A patient support case is awaiting CERVICARE review.',
          '/admin',
          'case_hospital_verified:' || new.id || ':' || reviewer.user_id
        );
      end loop;
    end if;

    if old.admin_verification_status is distinct from new.admin_verification_status
      and new.admin_verification_status in ('approved', 'rejected') then
      perform public.cervicare_insert_notification(
        new.patient_user_id,
        case when new.admin_verification_status = 'approved' then 'case_approved' else 'case_rejected' end,
        case when new.admin_verification_status = 'approved' then 'Support case approved' else 'Support case not approved' end,
        case when new.admin_verification_status = 'approved'
          then 'Your support case has been approved for donor viewing.'
          else 'Your support case was not approved for donor viewing. Please review the case status for details.'
        end,
        '/support-case',
        'case_admin_decision:' || new.id || ':' || new.admin_verification_status
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists patient_cases_notify_events on public.patient_cases;
create trigger patient_cases_notify_events
after insert or update on public.patient_cases
for each row execute function public.notify_support_case_event();

create or replace function public.notify_hospital_event()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
  reviewer record;
begin
  if tg_op = 'INSERT' and new.verification_status in ('pending', 'under_review') then
    for reviewer in select user_id from public.support_reviewers where status = 'verified' loop
      perform public.cervicare_insert_notification(
        reviewer.user_id,
        'hospital_submitted',
        'Hospital registration awaiting approval',
        'A hospital registration is awaiting approval.',
        '/admin',
        'hospital_submitted:' || new.id || ':' || reviewer.user_id
      );
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists hospitals_notify_submission on public.hospitals;
create trigger hospitals_notify_submission
after insert on public.hospitals
for each row execute function public.notify_hospital_event();

create or replace function public.notify_hospital_representative_event()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
begin
  if old.status is distinct from new.status and new.status in ('verified', 'rejected') then
    perform public.cervicare_insert_notification(
      new.user_id,
      case when new.status = 'verified' then 'hospital_approved' else 'hospital_rejected' end,
      case when new.status = 'verified' then 'Hospital registration approved' else 'Hospital registration not approved' end,
      case when new.status = 'verified' then 'Your hospital registration has been approved.' else 'Your hospital registration was not approved.' end,
      case when new.status = 'verified' then '/hospital-verification' else '/hospital-registration' end,
      'hospital_decision:' || new.id || ':' || new.status
    );
  end if;
  return new;
end;
$$;

drop trigger if exists hospital_representatives_notify_decision on public.hospital_representatives;
create trigger hospital_representatives_notify_decision
after update on public.hospital_representatives
for each row execute function public.notify_hospital_representative_event();

create or replace function public.notify_donor_request_event()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
  reviewer record;
begin
  if tg_op = 'INSERT' and new.status = 'pending' then
    for reviewer in select user_id from public.support_reviewers where status = 'verified' loop
      perform public.cervicare_insert_notification(
        reviewer.user_id,
        'donor_request_submitted',
        'Donor access request awaiting approval',
        'A donor access request is awaiting approval.',
        '/admin',
        'donor_request_submitted:' || new.id || ':' || reviewer.user_id
      );
    end loop;
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status and new.status in ('approved', 'rejected') then
    perform public.cervicare_insert_notification(
      new.user_id,
      case when new.status = 'approved' then 'donor_approved' else 'donor_rejected' end,
      case when new.status = 'approved' then 'Donor access approved' else 'Donor access not approved' end,
      case when new.status = 'approved'
        then 'Your donor access has been approved. You can now access the Donor Portal.'
        else 'Your donor access request was not approved.'
      end,
      case when new.status = 'approved' then '/donor-portal' else '/dashboard' end,
      'donor_decision:' || new.id || ':' || new.status
    );
  end if;
  return new;
end;
$$;

drop trigger if exists donor_access_requests_notify_events on public.donor_access_requests;
create trigger donor_access_requests_notify_events
after insert or update on public.donor_access_requests
for each row execute function public.notify_donor_request_event();

create or replace function public.notify_support_intent_event()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
  patient_id uuid;
begin
  select patient_user_id into patient_id
  from public.patient_cases
  where id = new.case_id
    and case_status = 'published'
    and hospital_verification_status = 'verified'
    and admin_verification_status = 'approved';

  perform public.cervicare_insert_notification(
    patient_id,
    'support_intent_created',
    'New donor support activity',
    'A donor has initiated support for your approved case.',
    '/support-case',
    'support_intent_created:' || new.id
  );
  return new;
end;
$$;

drop trigger if exists support_records_notify_events on public.support_records;
create trigger support_records_notify_events
after insert on public.support_records
for each row execute function public.notify_support_intent_event();

revoke all on function public.protect_notification_update() from public;
revoke all on function public.notify_support_case_event() from public;
revoke all on function public.notify_hospital_event() from public;
revoke all on function public.notify_hospital_representative_event() from public;
revoke all on function public.notify_donor_request_event() from public;
revoke all on function public.notify_support_intent_event() from public;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;
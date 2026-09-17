-- CERVICARE admin management and donor access requests.
-- Run manually after the existing support, hospital, and role-access migrations.
-- This migration does not change hospital or patient-case approval functions.

create table if not exists public.donor_access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists donor_access_requests_status_idx
  on public.donor_access_requests (status, created_at);

alter table public.donor_access_requests enable row level security;

drop policy if exists "Admins can read donor access requests" on public.donor_access_requests;
create policy "Admins can read donor access requests"
  on public.donor_access_requests for select to authenticated
  using (public.cervicare_is_admin());

create or replace function public.create_donor_access_request_from_profile()
returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  account_type text;
  account_email text;
begin
  select raw_user_meta_data ->> 'account_type', email
  into account_type, account_email
  from auth.users
  where id = new.id;

  if account_type = 'donor' then
    insert into public.donor_access_requests (user_id, email, full_name)
    values (new.id, coalesce(account_email, ''), new.full_name)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_create_donor_access_request on public.profiles;
create trigger profiles_create_donor_access_request
after insert on public.profiles
for each row execute function public.create_donor_access_request_from_profile();

create or replace function public.request_donor_access()
returns void
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  current_profile public.profiles%rowtype;
  current_email text;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;

  select * into current_profile from public.profiles where id = auth.uid();
  select email into current_email from auth.users where id = auth.uid();
  if current_profile.id is null then raise exception 'Profile is required before requesting donor access'; end if;
  if current_profile.role = 'admin' or current_profile.role = 'hospital' then
    raise exception 'This account cannot request donor access';
  end if;

  insert into public.donor_access_requests (user_id, email, full_name)
  values (auth.uid(), coalesce(current_email, ''), current_profile.full_name)
  on conflict (user_id) do nothing;
end;
$$;

create or replace function public.approve_donor_access(p_request_id uuid)
returns void
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  requested_user_id uuid;
begin
  if not public.cervicare_is_admin() then raise exception 'Reviewer approval is required'; end if;
  select user_id into requested_user_id
  from public.donor_access_requests
  where id = p_request_id and status = 'pending';
  if not found then raise exception 'Donor request is not awaiting review'; end if;

  update public.profiles set role = 'donor' where id = requested_user_id;
  if not found then raise exception 'Donor profile was not found'; end if;
  update public.donor_access_requests
  set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_request_id;
end;
$$;

create or replace function public.reject_donor_access(p_request_id uuid)
returns void
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if not public.cervicare_is_admin() then raise exception 'Reviewer approval is required'; end if;
  update public.donor_access_requests
  set status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_request_id and status = 'pending';
  if not found then raise exception 'Donor request is not awaiting review'; end if;
end;
$$;

revoke all on function public.request_donor_access() from public;
revoke all on function public.approve_donor_access(uuid) from public;
revoke all on function public.reject_donor_access(uuid) from public;
grant execute on function public.request_donor_access() to authenticated;
grant execute on function public.approve_donor_access(uuid) to authenticated;
grant execute on function public.reject_donor_access(uuid) to authenticated;
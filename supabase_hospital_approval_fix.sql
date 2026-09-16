-- CERVICARE hospital approval compatibility fix
-- Run manually after supabase_hospital_verification.sql.
-- Keeps the existing RPC signature and approval workflow.

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
  -- Read support_reviewers inside this security-definer function so its RLS
  -- cannot incorrectly reject a reviewer whose row is status = verified.
  if not exists (
    select 1
    from public.support_reviewers
    where user_id = auth.uid()
      and status = 'verified'
  ) then
    raise exception 'Reviewer approval is required';
  end if;

  if not exists (
    select 1
    from public.hospitals h
    join public.hospital_representatives hr on hr.hospital_id = h.id
    where h.id = p_hospital_id
      and hr.user_id = p_representative_user_id
      and h.verification_status in ('pending', 'under_review')
      and hr.status = 'pending'
  ) then
    raise exception 'Hospital registration or representative request is not awaiting review';
  end if;

  update public.hospitals
  set verification_status = 'verified', verified_at = now()
  where id = p_hospital_id
    and verification_status in ('pending', 'under_review');

  update public.hospital_representatives
  set status = 'verified', reviewed_by = auth.uid(), reviewed_at = now()
  where hospital_id = p_hospital_id
    and user_id = p_representative_user_id
    and status = 'pending';
end;
$$;

revoke all on function public.approve_hospital_registration(uuid, uuid) from public;
grant execute on function public.approve_hospital_registration(uuid, uuid) to authenticated;

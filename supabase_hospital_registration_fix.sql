-- CERVICARE hospital registration compatibility fix
-- Run manually after supabase_hospital_verification.sql.
-- This replaces the browser's two-step insert with one atomic, authenticated RPC.

create or replace function public.register_hospital(
  p_name text,
  p_city text,
  p_region text,
  p_official_website text
)
returns table (
  hospital_id uuid,
  representative_id uuid,
  verification_status text,
  representative_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_hospital_id uuid;
  new_representative_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if nullif(trim(p_name), '') is null
    or nullif(trim(p_city), '') is null
    or nullif(trim(p_region), '') is null then
    raise exception 'Hospital name, city, and region are required';
  end if;

  insert into public.hospitals (
    name,
    city,
    region,
    official_website,
    verification_status
  )
  values (
    trim(p_name),
    trim(p_city),
    trim(p_region),
    nullif(trim(coalesce(p_official_website, '')), ''),
    'pending'
  )
  returning id into new_hospital_id;

  insert into public.hospital_representatives (
    user_id,
    hospital_id,
    status
  )
  values (
    auth.uid(),
    new_hospital_id,
    'pending'
  )
  returning id into new_representative_id;

  return query
  select new_hospital_id, new_representative_id, 'pending'::text, 'pending'::text;
end;
$$;

revoke all on function public.register_hospital(text, text, text, text) from public;
grant execute on function public.register_hospital(text, text, text, text) to authenticated;

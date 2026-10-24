-- Pakkathu Kadai: account roles and approval
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer'
    check (role in ('customer','shopkeeper','delivery','admin')),
  status text not null default 'active'
    check (status in ('pending','active','rejected')),
  shop_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists role text default 'customer',
  add column if not exists status text default 'active',
  add column if not exists shop_name text,
  add column if not exists created_at timestamptz default now();

create or replace function public.pk_is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and status = 'active'
  );
$$;

create or replace function public.pk_create_profile()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  requested text;
begin
  requested := coalesce(
    new.raw_user_meta_data->>'requested_role', 'customer'
  );

  if requested not in ('customer','shopkeeper','delivery') then
    requested := 'customer';
  end if;

  insert into public.profiles
    (id, full_name, role, status, shop_name)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'full_name',''),
    requested,
    case when requested = 'customer'
      then 'active' else 'pending' end,
    nullif(new.raw_user_meta_data->>'shop_name','')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists pk_auth_user_created on auth.users;

create trigger pk_auth_user_created
after insert on auth.users
for each row execute procedure public.pk_create_profile();

alter table public.profiles enable row level security;

drop policy if exists "profiles read own or admin"
on public.profiles;

create policy "profiles read own or admin"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.pk_is_admin());

drop policy if exists "admin updates profiles"
on public.profiles;

create policy "admin updates profiles"
on public.profiles for update to authenticated
using (public.pk_is_admin())
with check (public.pk_is_admin());

-- No public profile insert/update policy.
-- Users must not be able to promote themselves to admin.
-- Provision the first admin securely; never use public signup.

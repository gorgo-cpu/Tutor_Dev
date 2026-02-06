-- Supabase schema for Tutor_Dev (Auth + schedules + booking)
-- Run this in the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- Helper: treat postgres/service_role as privileged (bypasses client restrictions).
create or replace function public.is_privileged()
returns boolean
language sql
stable
as $$
  select
    current_user in ('postgres', 'supabase_admin')
    or coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), '') = 'service_role';
$$;

-- Profiles (role is NOT client-writable; requested_role is only set on first profile creation)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  subjects text[] not null default '{}',
  role text,
  requested_role text,
  created_at timestamptz not null default now(),
  set search_path = public, auth
);

alter table public.profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check') then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('student','parent','teacher','admin') or role is null);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_requested_role_check') then
    alter table public.profiles
      add constraint profiles_requested_role_check
      check (requested_role in ('student','parent','teacher') or requested_role is null);
  end if;
end $$;

-- Read: self + public teacher directory
drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_select_teachers" on public.profiles;
create policy "profiles_select_teachers"
on public.profiles
for select
to authenticated
using (role = 'teacher');

-- Update: self only; trigger blocks privileged fields
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Insert: self only; role must be null (requested_role allowed, but constrained)
drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role is null
  and (requested_role in ('student','parent','teacher') or requested_role is null)
);

create or replace function public.profiles_block_privileged_fields()
returns trigger
language plpgsql
set search_path = public, auth
as $$
begin
  if not public.is_privileged() then
    if new.role is distinct from old.role then
      raise exception 'profiles.role is not client-writable';
    end if;
    if new.requested_role is distinct from old.requested_role then
      raise exception 'profiles.requested_role is not client-writable';
    end if;
    if new.email is distinct from old.email then
      raise exception 'profiles.email is not client-writable';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_block_privileged_fields on public.profiles;
create trigger trg_profiles_block_privileged_fields
before update on public.profiles
for each row
execute procedure public.profiles_block_privileged_fields();

-- Parent -> Student link (managed by admin/backend)
create table if not exists public.parent_students (
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

alter table public.parent_students enable row level security;

drop policy if exists "parent_students_select_parent" on public.parent_students;
create policy "parent_students_select_parent"
on public.parent_students
for select
to authenticated
using (parent_id = auth.uid());

-- Lessons (created only by RPC or service role)
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete restrict,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  title text,
  location text,
  booked_by_parent_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint lessons_time_check check (end_at > start_at)
);

create index if not exists idx_lessons_student_time on public.lessons(student_id, start_at);
create index if not exists idx_lessons_teacher_time on public.lessons(teacher_id, start_at);

alter table public.lessons enable row level security;

drop policy if exists "lessons_select_student" on public.lessons;
create policy "lessons_select_student"
on public.lessons
for select
to authenticated
using (student_id = auth.uid());

drop policy if exists "lessons_select_teacher" on public.lessons;
create policy "lessons_select_teacher"
on public.lessons
for select
to authenticated
using (teacher_id = auth.uid());

drop policy if exists "lessons_select_parent" on public.lessons;
create policy "lessons_select_parent"
on public.lessons
for select
to authenticated
using (
  exists (
    select 1
    from public.parent_students ps
    where ps.parent_id = auth.uid()
      and ps.student_id = lessons.student_id
  )
);

-- Teacher availability (teachers can create their own; booking updates happen via RPC)
create table if not exists public.teacher_availability (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_booked boolean not null default false,
  booked_lesson_id uuid references public.lessons(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint teacher_availability_time_check check (end_at > start_at)
);

create index if not exists idx_teacher_availability_teacher_time on public.teacher_availability(teacher_id, start_at);

alter table public.teacher_availability enable row level security;

drop policy if exists "teacher_availability_select_all" on public.teacher_availability;
create policy "teacher_availability_select_all"
on public.teacher_availability
for select
to authenticated
using (true);

drop policy if exists "teacher_availability_insert_teacher" on public.teacher_availability;
create policy "teacher_availability_insert_teacher"
on public.teacher_availability
for insert
to authenticated
with check (
  teacher_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
);

-- RPC: create profile on first verified sign-in (role remains null)
create or replace function public.ensure_profile(requested_role text default null)
returns public.profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid;
  jwt jsonb;
  email_value text;
  desired_role text;
  result public.profiles;
begin
  uid := auth.uid();
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  jwt := auth.jwt();
  email_value := nullif(jwt ->> 'email', '');

  desired_role := requested_role;
  if desired_role is null then
    desired_role := nullif(jwt #>> '{user_metadata,requested_role}', '');
  end if;
  if desired_role not in ('student','parent','teacher') then
    desired_role := null;
  end if;

  insert into public.profiles (id, email, role, requested_role)
  values (uid, email_value, null, desired_role)
  on conflict (id) do update
    set email = coalesce(excluded.email, profiles.email),
        requested_role = coalesce(profiles.requested_role, excluded.requested_role)
  returning * into result;

  return result;
end;
$$;

grant execute on function public.ensure_profile(text) to authenticated;

-- Admin-only role assignment (called by .NET backend using service role key)
create or replace function public.admin_set_role(user_id uuid, new_role text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.profiles;
begin
  if not public.is_privileged() then
    raise exception 'Not authorized';
  end if;
  if new_role not in ('student','parent','teacher','admin') then
    raise exception 'Invalid role';
  end if;

  update public.profiles
     set role = new_role
   where id = user_id
   returning * into result;

  if result.id is null then
    raise exception 'Profile not found';
  end if;

  return result;
end;
$$;

grant execute on function public.admin_set_role(uuid, text) to service_role;

-- Booking RPC: atomic slot booking with conflict checks (derive parent from auth.uid())
create or replace function public.book_slot(
  availability_id uuid,
  student_id uuid,
  title text default null,
  location text default null
)
returns public.lessons
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  parent_id uuid;
  slot_row public.teacher_availability;
  lesson_row public.lessons;
begin
  parent_id := auth.uid();
  if parent_id is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (select 1 from public.profiles p where p.id = parent_id and p.role = 'parent') then
    raise exception 'Only parents can book';
  end if;

  if not exists (
    select 1 from public.parent_students ps
    where ps.parent_id = parent_id and ps.student_id = student_id
  ) then
    raise exception 'Parent is not linked to this student';
  end if;

  select *
    into slot_row
    from public.teacher_availability
   where id = availability_id
   for update;

  if not found then
    raise exception 'Availability not found';
  end if;
  if slot_row.is_booked then
    raise exception 'Slot already booked';
  end if;

  -- Conflict checks: prevent overlapping lessons for teacher and student.
  if exists (
    select 1 from public.lessons l
    where l.teacher_id = slot_row.teacher_id
      and (l.start_at, l.end_at) overlaps (slot_row.start_at, slot_row.end_at)
  ) then
    raise exception 'Teacher has a conflicting lesson';
  end if;
  if exists (
    select 1 from public.lessons l
    where l.student_id = student_id
      and (l.start_at, l.end_at) overlaps (slot_row.start_at, slot_row.end_at)
  ) then
    raise exception 'Student has a conflicting lesson';
  end if;

  insert into public.lessons (
    student_id, teacher_id, start_at, end_at, title, location, booked_by_parent_id
  )
  values (
    student_id,
    slot_row.teacher_id,
    slot_row.start_at,
    slot_row.end_at,
    coalesce(title, 'Tutoring Session'),
    location,
    parent_id
  )
  returning * into lesson_row;

  update public.teacher_availability
     set is_booked = true,
         booked_lesson_id = lesson_row.id
   where id = slot_row.id;

  return lesson_row;
end;
$$;

grant execute on function public.book_slot(uuid, uuid, text, text) to authenticated;


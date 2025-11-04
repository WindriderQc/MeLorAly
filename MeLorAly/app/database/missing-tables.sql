-- Missing Tables for MeLorAly Database
-- Run this in your Supabase SQL Editor to add missing tables

-- Activity completions (already in schema.sql but likely not created)
create table if not exists public.activity_completions (
  id uuid default uuid_generate_v4() primary key,
  activity_id text not null,
  child_id uuid references public.children(id) on delete cascade not null,
  family_id uuid references public.families(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(activity_id, child_id)
);

-- Contact requests table
create table if not exists public.contact_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text check (status in ('pending', 'responded', 'closed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.activity_completions enable row level security;
alter table public.contact_requests enable row level security;

-- Activity completions policies
do $$ 
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'activity_completions' 
    and policyname = 'Family members can view activity completions'
  ) then
    create policy "Family members can view activity completions" on public.activity_completions
      for select using (
        exists (
          select 1 from public.family_members
          where family_id = activity_completions.family_id
          and user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'activity_completions' 
    and policyname = 'Family members can insert activity completions'
  ) then
    create policy "Family members can insert activity completions" on public.activity_completions
      for insert with check (
        auth.uid() = user_id and
        exists (
          select 1 from public.family_members
          where family_id = activity_completions.family_id
          and user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'activity_completions' 
    and policyname = 'Family members can delete activity completions'
  ) then
    create policy "Family members can delete activity completions" on public.activity_completions
      for delete using (
        auth.uid() = user_id or
        exists (
          select 1 from public.family_members
          where family_id = activity_completions.family_id
          and user_id = auth.uid()
          and role = 'admin'
        )
      );
  end if;
end $$;

-- Contact requests policies
do $$ 
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'contact_requests' 
    and policyname = 'Users can view own contact requests'
  ) then
    create policy "Users can view own contact requests" on public.contact_requests
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'contact_requests' 
    and policyname = 'Anyone can insert contact requests'
  ) then
    create policy "Anyone can insert contact requests" on public.contact_requests
      for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'contact_requests' 
    and policyname = 'Users can update own contact requests'
  ) then
    create policy "Users can update own contact requests" on public.contact_requests
      for update using (auth.uid() = user_id);
  end if;
end $$;

-- Add updated_at trigger for contact_requests
do $$
begin
  if not exists (
    select 1 from pg_trigger 
    where tgname = 'handle_contact_requests_updated_at'
  ) then
    create trigger handle_contact_requests_updated_at 
      before update on public.contact_requests
      for each row execute function public.handle_updated_at();
  end if;
end $$;

-- Indexes for better performance
create index if not exists idx_activity_completions_child_id on public.activity_completions(child_id);
create index if not exists idx_activity_completions_family_id on public.activity_completions(family_id);
create index if not exists idx_activity_completions_user_id on public.activity_completions(user_id);

create index if not exists idx_contact_requests_user_id on public.contact_requests(user_id);
create index if not exists idx_contact_requests_status on public.contact_requests(status);

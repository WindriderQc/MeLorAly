-- MeLorAly Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text check (role in ('parent', 'grandparent')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Families table
create table public.families (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  avatar_url text,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Family members (junction table)
create table public.family_members (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text check (role in ('admin', 'member', 'grandparent')) default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(family_id, user_id)
);

-- Children table
create table public.children (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  name text not null,
  birth_date date,
  grade text,
  avatar_url text,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activity completions
create table public.activity_completions (
  id uuid default uuid_generate_v4() primary key,
  activity_id text not null,
  child_id uuid references public.children(id) on delete cascade not null,
  family_id uuid references public.families(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(activity_id, child_id)
);

-- Contact requests table
create table public.contact_requests (
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

-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  message_type text default 'text' check (message_type in ('text', 'image', 'file')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invitations table
create table public.invitations (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  email text not null,
  role text check (role in ('member', 'grandparent')) default 'member',
  invited_by uuid references auth.users(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'expired')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default timezone('utc'::text, now() + interval '7 days') not null
);

-- Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.children enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.invitations enable row level security;
alter table public.activity_completions enable row level security;
alter table public.contact_requests enable row level security;

-- Profiles: Users can only see and edit their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Families: Users can only see families they're members of
create policy "Users can view families they belong to" on public.families
  for select using (
    created_by = auth.uid() or
    exists (
      select 1 from public.family_members 
      where family_id = families.id 
      and user_id = auth.uid()
    )
  );

create policy "Users can create families" on public.families
  for insert with check (created_by = auth.uid());

create policy "Family creators can update families" on public.families
  for update using (created_by = auth.uid());

-- Family Members: Users can see members of families they belong to
create policy "Users can view family members" on public.family_members
  for select using (user_id = auth.uid());

create policy "Users can insert family members" on public.family_members
  for insert with check (
    exists (
      select 1 from public.families 
      where id = family_members.family_id 
      and created_by = auth.uid()
    )
  );

create policy "Users can delete family members" on public.family_members
  for delete using (
    exists (
      select 1 from public.families 
      where id = family_members.family_id 
      and created_by = auth.uid()
    )
  );

-- Children: Family members can see children
create policy "Family members can view children" on public.children
  for select using (
    exists (
      select 1 from public.family_members 
      where family_id = children.family_id 
      and user_id = auth.uid()
    )
  );

create policy "Family members can manage children" on public.children
  for all using (
    exists (
      select 1 from public.family_members 
      where family_id = children.family_id 
      and user_id = auth.uid()
    )
  );

-- Messages: Family members can see and send messages
create policy "Family members can view messages" on public.messages
  for select using (
    exists (
      select 1 from public.family_members 
      where family_id = messages.family_id 
      and user_id = auth.uid()
    )
  );

create policy "Family members can send messages" on public.messages
  for insert with check (
    exists (
      select 1 from public.family_members 
      where family_id = messages.family_id 
      and user_id = auth.uid()
    ) and auth.uid() = user_id
  );

-- Notifications: Users can only see their own notifications
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Invitations: Users can see invitations for their families or sent to their email
create policy "Users can view relevant invitations" on public.invitations
  for select using (
    auth.uid() = invited_by or 
    auth.email() = email or
    exists (
      select 1 from public.family_members 
      where family_id = invitations.family_id 
      and user_id = auth.uid() 
      and role = 'admin'
    )
  );

-- Activity completions: Family members can update progress
create policy "Family members can view activity completions" on public.activity_completions
  for select using (
    exists (
      select 1 from public.family_members
      where family_id = activity_completions.family_id
      and user_id = auth.uid()
    )
  );

create policy "Family members can insert activity completions" on public.activity_completions
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.family_members
      where family_id = activity_completions.family_id
      and user_id = auth.uid()
    )
  );

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

-- Functions and Triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Apply updated_at triggers
create trigger handle_profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_families_updated_at before update on public.families
  for each row execute function public.handle_updated_at();

create trigger handle_children_updated_at before update on public.children
  for each row execute function public.handle_updated_at();

create trigger handle_contact_requests_updated_at before update on public.contact_requests
  for each row execute function public.handle_updated_at();

-- Function to automatically create profile after user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Contact requests policies
create policy "Users can view own contact requests" on public.contact_requests
  for select using (auth.uid() = user_id);

create policy "Anyone can insert contact requests" on public.contact_requests
  for insert with check (true);

create policy "Users can update own contact requests" on public.contact_requests
  for update using (auth.uid() = user_id);

-- Indexes for better performance
create index idx_activity_completions_child_id on public.activity_completions(child_id);
create index idx_activity_completions_family_id on public.activity_completions(family_id);
create index idx_activity_completions_user_id on public.activity_completions(user_id);

create index idx_contact_requests_user_id on public.contact_requests(user_id);
create index idx_contact_requests_status on public.contact_requests(status);

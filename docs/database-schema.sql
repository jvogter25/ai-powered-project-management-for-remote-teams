-- ========================================
-- Database Schema for AI-powered task assignment
-- ========================================
-- This file contains suggested database tables for your application.
-- Execute these commands in your Supabase SQL editor.

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ========================================
-- Core Tables
-- ========================================

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using (true);

create policy "Users can insert their own profile."
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile."
  on profiles for update
  using (auth.uid() = id);

-- ========================================
-- Subscription Tables
-- ========================================

-- Subscription plans
create table public.plans (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price_monthly decimal(10,2),
  price_yearly decimal(10,2),
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  features jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User subscriptions
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_id uuid references public.plans(id) not null,
  stripe_subscription_id text unique,
  status text not null default 'inactive',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions."
  on subscriptions for select
  using (auth.uid() = user_id);

-- ========================================
-- Utility Functions
-- ========================================

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

-- ========================================
-- Sample Data (Optional)
-- ========================================

-- Insert sample subscription plans
insert into public.plans (name, description, price_monthly, price_yearly) values
  ('Starter', 'Perfect for individuals', 9.99, 99.99),
  ('Pro', 'Great for small teams', 29.99, 299.99),
  ('Enterprise', 'For large organizations', 99.99, 999.99);

-- ========================================
-- Notes
-- ========================================
-- 1. Remember to create storage buckets if you need file uploads
-- 2. Set up Stripe webhooks to sync subscription status
-- 3. Consider adding indexes for frequently queried columns
-- 4. Test your RLS policies thoroughly before going to production

-- Monetization System Tables
-- This script adds tables for the NOW platform's business models

-- Table for subscription plans (Model 2: Provider subscriptions, Model 3: Client plans)
create table if not exists public.plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null, -- e.g., 'Free', 'Pro', 'Enterprise', 'Condominio Basic'
  type text not null check (type in ('provider_subscription', 'client_subscription', 'maintenance')),
  description text,
  price_monthly numeric(10, 2), -- for monthly plans
  price_yearly numeric(10, 2), -- optional yearly pricing
  features jsonb, -- array of features included
  limits jsonb, -- e.g., {"leads_per_month": 10, "highlighted": true}
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for user subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_id uuid references public.plans(id) on delete cascade not null,
  status text not null default 'active' check (status in ('active', 'inactive', 'cancelled', 'expired')),
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  cancel_at_period_end boolean default false,
  payment_method_id text, -- reference to payment provider
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for service transactions (Model 1: Commission per service)
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  service_request_id uuid references public.service_requests(id) on delete cascade,
  provider_id uuid references public.service_providers(id) on delete cascade not null,
  client_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(10, 2) not null, -- total service amount
  commission_rate numeric(5, 2) default 10.00, -- percentage (8-15%)
  commission_amount numeric(10, 2) generated always as (amount * commission_rate / 100) stored,
  provider_amount numeric(10, 2) generated always as (amount - commission_amount) stored,
  status text not null default 'pending' check (status in ('pending', 'completed', 'refunded', 'cancelled')),
  payment_method text, -- 'card', 'pix', etc.
  payment_id text, -- external payment provider ID
  escrow_released_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for highlights and advertising (Model 4)
create table if not exists public.highlights (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references public.service_providers(id) on delete cascade not null,
  type text not null check (type in ('top_listing', 'recommended', 'regional_campaign')),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  cost numeric(10, 2) not null,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for recurring maintenance contracts (Model 5)
create table if not exists public.maintenance_contracts (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references auth.users(id) on delete cascade not null,
  provider_id uuid references public.service_providers(id) on delete cascade not null,
  plan_name text not null, -- e.g., 'Manutenção Mensal', 'Preventiva Trimestral'
  frequency text not null check (frequency in ('monthly', 'quarterly', 'biannual', 'annual')),
  amount numeric(10, 2) not null,
  commission_or_margin numeric(10, 2), -- fixed margin or percentage
  is_percentage boolean default false,
  status text not null default 'active' check (status in ('active', 'inactive', 'cancelled')),
  next_service_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add commission_rate to services table if not exists
alter table public.services
add column if not exists commission_rate numeric(5, 2) default 10.00;

-- Indexes for performance
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_transactions_provider_id on public.transactions(provider_id);
create index if not exists idx_transactions_client_id on public.transactions(client_id);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_highlights_provider_id on public.highlights(provider_id);
create index if not exists idx_highlights_status on public.highlights(status);
create index if not exists idx_maintenance_contracts_client_id on public.maintenance_contracts(client_id);
create index if not exists idx_maintenance_contracts_provider_id on public.maintenance_contracts(provider_id);
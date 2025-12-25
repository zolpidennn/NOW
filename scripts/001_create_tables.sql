-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tabela de perfis de usuários (clientes)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de prestadores de serviços (empresas terceirizadas)
create table if not exists public.service_providers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  company_name text not null,
  description text,
  phone text not null,
  email text not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  rating numeric(3, 2) default 0,
  total_reviews integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de categorias de serviços
create table if not exists public.service_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  icon_name text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de serviços oferecidos pelos prestadores
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references public.service_providers(id) on delete cascade not null,
  category_id uuid references public.service_categories(id) on delete restrict not null,
  name text not null,
  description text,
  estimated_duration integer, -- em minutos
  base_price numeric(10, 2),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de solicitações de serviço
create table if not exists public.service_requests (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references auth.users(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete restrict not null,
  provider_id uuid references public.service_providers(id) on delete restrict not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  service_type text not null, -- residencial, condominial, empresarial
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  scheduled_date timestamp with time zone,
  completed_date timestamp with time zone,
  notes text,
  total_price numeric(10, 2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de mensagens entre cliente e prestador
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid references public.service_requests(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de avaliações
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid references public.service_requests(id) on delete cascade not null,
  customer_id uuid references auth.users(id) on delete cascade not null,
  provider_id uuid references public.service_providers(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para melhor performance
create index if not exists idx_service_requests_customer on public.service_requests(customer_id);
create index if not exists idx_service_requests_provider on public.service_requests(provider_id);
create index if not exists idx_service_requests_status on public.service_requests(status);
create index if not exists idx_messages_request on public.messages(request_id);
create index if not exists idx_services_provider on public.services(provider_id);
create index if not exists idx_services_category on public.services(category_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.service_providers enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_requests enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

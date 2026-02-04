-- ==========================================
-- NOW Security Marketplace - Core Schema
-- ==========================================
-- Versão limpa e consolidada do banco de dados
-- Execute este script PRIMEIRO

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- TABELA: profiles (perfis de usuários)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  cpf text UNIQUE, -- Para identificação de pessoa física
  address text,
  city text,
  state text,
  zip_code text,
  is_admin boolean DEFAULT false, -- Flag de administrador
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ==========================================
-- TABELA: service_providers (prestadores PF/PJ)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.service_providers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de prestador
  provider_type text NOT NULL CHECK (provider_type IN ('PF', 'PJ')),
  
  -- Dados PJ (Pessoa Jurídica)
  cnpj text UNIQUE,
  company_name text,
  razao_social text,
  inscricao_estadual text,
  cnae_principal text,
  
  -- Dados PF (Pessoa Física)
  cpf_provider text UNIQUE,
  individual_name text,
  
  -- Dados comuns
  description text,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  
  -- Verificação e status
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'pending_documents', 'under_review', 'verified', 'rejected', 'suspended')),
  verification_date timestamptz,
  rejection_reason text,
  
  -- Documentos
  document_urls jsonb DEFAULT '[]'::jsonb,
  
  -- Avaliações e visibilidade
  rating numeric(3, 2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  visibility_score integer DEFAULT 50, -- PJ verificada: 100, PF: 50
  
  -- Status
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Constraints
  CONSTRAINT pj_required_fields CHECK (
    (provider_type = 'PJ' AND cnpj IS NOT NULL AND company_name IS NOT NULL) OR
    (provider_type = 'PF' AND cpf_provider IS NOT NULL AND individual_name IS NOT NULL)
  )
);

-- ==========================================
-- TABELA: addresses (endereços dos usuários)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL, -- "Casa", "Trabalho", "Principal"
  street text NOT NULL,
  number text NOT NULL,
  complement text,
  neighborhood text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ==========================================
-- TABELA: service_categories
-- ==========================================
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon_name text,
  
  -- Informações detalhadas
  explanation text,
  importance_text text,
  how_now_helps text,
  benefits jsonb DEFAULT '[]'::jsonb,
  available_services jsonb DEFAULT '[]'::jsonb,
  
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ==========================================
-- TABELA: products (produtos do marketplace)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
  
  name text NOT NULL,
  description text,
  category text NOT NULL,
  brand text,
  model text,
  
  price numeric(10, 2) NOT NULL,
  stock integer DEFAULT 0,
  warranty_months integer,
  
  images jsonb DEFAULT '[]'::jsonb,
  specifications jsonb DEFAULT '{}'::jsonb,
  
  -- E-commerce
  views integer DEFAULT 0,
  sales_count integer DEFAULT 0,
  
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'inactive')),
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ==========================================
-- TABELA: product_orders (pedidos de produtos)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.product_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE RESTRICT NOT NULL,
  
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  
  -- Endereço de entrega
  delivery_address jsonb NOT NULL,
  
  -- Pagamento
  payment_method text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ==========================================
-- TABELA: services (serviços oferecidos)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES public.service_categories(id) ON DELETE RESTRICT NOT NULL,
  
  name text NOT NULL,
  description text,
  estimated_duration integer, -- minutos
  base_price numeric(10, 2),
  
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ==========================================
-- TABELA: service_requests (solicitações de serviço)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.service_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE RESTRICT,
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE RESTRICT NOT NULL,
  category_id uuid REFERENCES public.service_categories(id) ON DELETE RESTRICT NOT NULL,
  
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  
  -- Detalhes do serviço
  service_type text NOT NULL, -- residencial, condominial, empresarial
  problem_description text NOT NULL,
  product_model text,
  
  -- Endereço
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  
  -- Agendamento
  preferred_date timestamptz,
  scheduled_date timestamptz,
  completed_date timestamptz,
  
  -- Preço
  total_price numeric(10, 2),
  
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ==========================================
-- TABELA: provider_schedules (agenda dos prestadores)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.provider_schedules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
  service_request_id uuid REFERENCES public.service_requests(id) ON DELETE SET NULL,
  
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  
  is_available boolean DEFAULT true,
  status text DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
  
  created_at timestamptz DEFAULT now() NOT NULL,
  
  UNIQUE(provider_id, date, start_time)
);

-- ==========================================
-- TABELA: messages (mensagens)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid REFERENCES public.service_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ==========================================
-- TABELA: reviews (avaliações)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid REFERENCES public.service_requests(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ==========================================
-- TABELA: verification_logs (logs de verificação)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.verification_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  status text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ==========================================
-- ÍNDICES para performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_service_providers_type ON public.service_providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_service_providers_verification ON public.service_providers(verification_status);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer ON public.service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_provider ON public.service_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_messages_request ON public.messages(request_id);
CREATE INDEX IF NOT EXISTS idx_services_provider ON public.services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_products_provider ON public.products(provider_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_customer ON public.product_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_schedules_provider_date ON public.provider_schedules(provider_id, date);

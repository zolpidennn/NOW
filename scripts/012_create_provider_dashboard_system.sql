-- Add provider dashboard and enhanced security system
-- Requires running scripts 001-011 first

-- =============================================
-- 1. PROVIDER DASHBOARD TABLES
-- =============================================

-- Provider products management (published by providers, reviewed by admin)
CREATE TABLE IF NOT EXISTS provider_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  images TEXT[], -- Array of image URLs
  status VARCHAR(50) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0
);

-- Provider service appointments (assigned to providers)
CREATE TABLE IF NOT EXISTS provider_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  service_type VARCHAR(255) NOT NULL,
  scheduled_date TIMESTAMPTZ,
  scheduled_time_slot VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending',
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  description TEXT,
  customer_phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider chat messages with customers
CREATE TABLE IF NOT EXISTS provider_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  sender_type VARCHAR(20) CHECK (sender_type IN ('provider', 'customer', 'system')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. ENHANCED SECURITY TABLES
-- =============================================

-- Registration attempt tracking (rate limiting)
CREATE TABLE IF NOT EXISTS registration_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  ip_address INET NOT NULL,
  attempt_type VARCHAR(50) CHECK (attempt_type IN ('pj_registration', 'pf_registration', 'cnpj_validation', 'cpf_validation')),
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CNPJ/CPF uniqueness enforcement
CREATE TABLE IF NOT EXISTS document_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number VARCHAR(20) UNIQUE NOT NULL, -- CNPJ or CPF (numbers only)
  document_type VARCHAR(10) CHECK (document_type IN ('CNPJ', 'CPF')),
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'suspended')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_at TIMESTAMPTZ,
  block_reason TEXT
);

-- IP blocking for fraud prevention
CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET UNIQUE NOT NULL,
  reason TEXT NOT NULL,
  blocked_by VARCHAR(100) DEFAULT 'system',
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_permanent BOOLEAN DEFAULT FALSE
);

-- =============================================
-- 3. CATEGORY SERVICE INFORMATION
-- =============================================

-- Enhanced category information for better user education
ALTER TABLE service_categories 
ADD COLUMN IF NOT EXISTS detailed_description TEXT,
ADD COLUMN IF NOT EXISTS how_it_works TEXT,
ADD COLUMN IF NOT EXISTS service_examples TEXT[],
ADD COLUMN IF NOT EXISTS trust_reasons TEXT[],
ADD COLUMN IF NOT EXISTS average_duration VARCHAR(100),
ADD COLUMN IF NOT EXISTS average_price_range VARCHAR(100);

-- =============================================
-- 4. INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_provider_products_provider ON provider_products(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_products_status ON provider_products(status);
CREATE INDEX IF NOT EXISTS idx_provider_appointments_provider ON provider_appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_appointments_status ON provider_appointments(status);
CREATE INDEX IF NOT EXISTS idx_provider_chats_request ON provider_chats(request_id);
CREATE INDEX IF NOT EXISTS idx_registration_attempts_ip ON registration_attempts(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_document_registry_number ON document_registry(document_number);

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE provider_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_chats ENABLE ROW LEVEL SECURITY;

-- Providers can manage their own products
CREATE POLICY provider_products_select ON provider_products
  FOR SELECT USING (
    status = 'approved' OR 
    provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid())
  );

CREATE POLICY provider_products_insert ON provider_products
  FOR INSERT WITH CHECK (
    provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid())
  );

CREATE POLICY provider_products_update ON provider_products
  FOR UPDATE USING (
    provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid())
  );

-- Providers can view their appointments
CREATE POLICY provider_appointments_select ON provider_appointments
  FOR SELECT USING (
    provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()) OR
    customer_id = auth.uid()
  );

-- Chat access for provider and customer
CREATE POLICY provider_chats_select ON provider_chats
  FOR SELECT USING (
    provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()) OR
    customer_id = auth.uid()
  );

CREATE POLICY provider_chats_insert ON provider_chats
  FOR INSERT WITH CHECK (
    provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()) OR
    customer_id = auth.uid()
  );

-- =============================================
-- 6. FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to check registration rate limit
CREATE OR REPLACE FUNCTION check_registration_rate_limit(
  p_ip_address INET,
  p_attempt_type VARCHAR,
  p_max_attempts INTEGER DEFAULT 5,
  p_time_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM registration_attempts
  WHERE ip_address = p_ip_address
    AND attempt_type = p_attempt_type
    AND created_at > NOW() - (p_time_window_minutes || ' minutes')::INTERVAL;
    
  RETURN attempt_count < p_max_attempts;
END;
$$ LANGUAGE plpgsql;

-- Function to check document uniqueness
CREATE OR REPLACE FUNCTION is_document_available(
  p_document_number VARCHAR,
  p_document_type VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  existing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM document_registry
  WHERE document_number = p_document_number
    AND status = 'active';
    
  RETURN existing_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update provider_products timestamp
CREATE OR REPLACE FUNCTION update_provider_product_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER provider_products_update_timestamp
BEFORE UPDATE ON provider_products
FOR EACH ROW
EXECUTE FUNCTION update_provider_product_timestamp();

-- =============================================
-- 7. SEED ENHANCED CATEGORY DATA
-- =============================================

UPDATE service_categories
SET 
  detailed_description = 'Sistema completo de vigilância por câmeras com monitoramento 24/7, gravação em alta definição e acesso remoto pelo celular.',
  how_it_works = 'A NOW conecta você com empresas especializadas em CFTV que realizam visita técnica, instalação profissional e configuração completa do sistema.',
  service_examples = ARRAY['Instalação de câmeras IP', 'Sistemas de gravação DVR/NVR', 'Monitoramento remoto', 'Manutenção preventiva'],
  trust_reasons = ARRAY['Empresas certificadas', 'Garantia de serviço', 'Suporte técnico 24/7', 'Equipamentos homologados'],
  average_duration = '4-8 horas',
  average_price_range = 'R$ 1.500 - R$ 8.000'
WHERE name = 'Câmeras de Segurança';

UPDATE service_categories
SET 
  detailed_description = 'Sistemas de alarme residencial e comercial com sensores de movimento, abertura e disparo sonoro para máxima proteção.',
  how_it_works = 'Após sua solicitação, uma empresa credenciada faz análise do local, propõe o melhor sistema e realiza instalação com treinamento.',
  service_examples = ARRAY['Alarmes com sensores', 'Central de monitoramento', 'Alarmes sem fio', 'Integração com câmeras'],
  trust_reasons = ARRAY['Profissionais treinados', 'Equipamentos certificados', 'Monitoramento 24h opcional', 'Manutenção inclusa'],
  average_duration = '3-6 horas',
  average_price_range = 'R$ 800 - R$ 4.000'
WHERE name = 'Alarmes';

UPDATE service_categories
SET 
  detailed_description = 'Interfones e videoporteiros com câmera, permitindo visualização e comunicação antes de liberar acesso.',
  how_it_works = 'Profissionais avaliam o ponto de instalação, instalam o equipamento e configuram integração com fechaduras elétricas se necessário.',
  service_examples = ARRAY['Videoporteiros IP', 'Interfones residenciais', 'Sistemas coletivos', 'Integração mobile'],
  trust_reasons = ARRAY['Instalação garantida', 'Produtos de qualidade', 'Assistência técnica', 'Configuração completa'],
  average_duration = '2-4 horas',
  average_price_range = 'R$ 500 - R$ 2.500'
WHERE name = 'Interfones';

UPDATE service_categories
SET 
  detailed_description = 'Controle de acesso por biometria, cartão, senha ou reconhecimento facial para ambientes seguros.',
  how_it_works = 'Análise das necessidades de segurança, instalação de catracas ou fechaduras eletrônicas e cadastro de usuários autorizados.',
  service_examples = ARRAY['Fechaduras biométricas', 'Catracas eletrônicas', 'Controle por cartão RFID', 'Reconhecimento facial'],
  trust_reasons = ARRAY['Tecnologia avançada', 'Empresas especializadas', 'Suporte contínuo', 'Integração com sistemas'],
  average_duration = '4-12 horas',
  average_price_range = 'R$ 1.200 - R$ 15.000'
WHERE name = 'Controle de Acesso';

UPDATE service_categories
SET 
  detailed_description = 'Instalação de cerca elétrica perimetral com alta voltagem para proteção de muros e perímetros.',
  how_it_works = 'Medição do perímetro, instalação de hastes e fios eletrificados, central de choque e sinalização de segurança.',
  service_examples = ARRAY['Cerca elétrica residencial', 'Sistemas industriais', 'Concertinas elétricas', 'Manutenção preventiva'],
  trust_reasons = ARRAY['Instaladores certificados', 'Normas de segurança', 'Garantia do serviço', 'Laudos técnicos'],
  average_duration = '6-10 horas',
  average_price_range = 'R$ 1.000 - R$ 6.000'
WHERE name = 'Cerca Elétrica';

COMMENT ON TABLE provider_products IS 'Products published by providers for sale, subject to admin review';
COMMENT ON TABLE provider_appointments IS 'Service appointments assigned to providers';
COMMENT ON TABLE provider_chats IS 'Chat messages between providers and customers';
COMMENT ON TABLE registration_attempts IS 'Tracks registration attempts for rate limiting and fraud prevention';
COMMENT ON TABLE document_registry IS 'Enforces CNPJ/CPF uniqueness across the platform';
COMMENT ON TABLE blocked_ips IS 'IP addresses blocked for suspicious activity';

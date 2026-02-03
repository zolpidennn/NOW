-- Add detailed category information
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS importance_text TEXT;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS how_now_helps TEXT;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]'::jsonb;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS available_services JSONB DEFAULT '[]'::jsonb;

-- Add scheduling fields to service_requests
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS preferred_date DATE;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS preferred_time TIME;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS product_model TEXT;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS assigned_provider_id UUID REFERENCES service_providers(id);
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS confirmed_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS confirmed_time TIME;

-- Create provider availability table
CREATE TABLE IF NOT EXISTS provider_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(provider_id, date, start_time)
);

-- Create scheduled appointments table to track bookings
CREATE TABLE IF NOT EXISTS scheduled_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL UNIQUE,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update category data with detailed information
UPDATE service_categories 
SET 
  explanation = 'Sistemas de Circuito Fechado de Televisão (CFTV) são fundamentais para monitoramento e segurança patrimonial.',
  importance_text = 'Em 2024, imóveis com câmeras de segurança tiveram 67% menos incidentes de roubo. Um sistema CFTV funcional é essencial para proteção 24/7.',
  how_now_helps = 'A NOW conecta você com técnicos especializados em CFTV, com experiência comprovada e atendimento rápido. Oferecemos suporte antes, durante e após a instalação.',
  benefits = '[
    "Resposta em até 24 horas",
    "Técnicos certificados",
    "Garantia em todos os serviços",
    "Suporte técnico contínuo",
    "Orçamento transparente",
    "Acompanhamento em tempo real"
  ]'::jsonb,
  available_services = '[
    "Instalação de câmeras",
    "Configuração de DVR/NVR",
    "Cabeamento estruturado",
    "Manutenção preventiva",
    "Upgrade de sistema",
    "Monitoramento remoto",
    "Análise de imagens",
    "Integração com alarmes"
  ]'::jsonb
WHERE name = 'CFTV';

UPDATE service_categories 
SET 
  explanation = 'Sistemas de alarme são a primeira linha de defesa contra invasões e situações de emergência.',
  importance_text = 'Alarmes monitorados reduzem em até 80% o tempo de resposta em emergências, protegendo seu patrimônio e sua família.',
  how_now_helps = 'Empresas credenciadas NOW oferecem instalação profissional com equipamentos de última geração e central de monitoramento 24/7.',
  benefits = '[
    "Instalação profissional",
    "Monitoramento 24/7",
    "Resposta imediata",
    "Equipamentos modernos",
    "Manutenção inclusa",
    "Garantia estendida"
  ]'::jsonb,
  available_services = '[
    "Instalação de alarmes",
    "Sensores de movimento",
    "Alarmes perimetrais",
    "Central de monitoramento",
    "Manutenção de alarmes",
    "Upgrade de sistema",
    "Testes periódicos",
    "Botão de pânico"
  ]'::jsonb
WHERE name = 'Alarmes';

UPDATE service_categories 
SET 
  explanation = 'Automatização de portões oferece comodidade, segurança e controle de acesso para sua propriedade.',
  importance_text = 'Portões automatizados aumentam a segurança em 75% e agregam valor ao imóvel, além de proporcionar conforto no dia a dia.',
  how_now_helps = 'Profissionais credenciados NOW garantem instalação segura, manutenção preventiva e atendimento rápido em emergências.',
  benefits = '[
    "Instalação certificada",
    "Atendimento emergencial",
    "Peças originais",
    "Garantia de 12 meses",
    "Manutenção preventiva",
    "Suporte técnico"
  ]'::jsonb,
  available_services = '[
    "Instalação de motor",
    "Manutenção preventiva",
    "Reparo de motores",
    "Troca de peças",
    "Controles remotos",
    "Fotocélulas",
    "Programação de horários",
    "Automatização completa"
  ]'::jsonb
WHERE name LIKE '%Automatização%' OR name LIKE '%Portão%' OR name LIKE '%Portao%';

UPDATE service_categories 
SET 
  explanation = 'Sistemas de controle de acesso garantem que apenas pessoas autorizadas entrem em áreas restritas.',
  importance_text = 'Controle de acesso reduz em 90% acessos não autorizados e permite rastreabilidade completa de entradas e saídas.',
  how_now_helps = 'A NOW oferece soluções integradas de controle de acesso com tecnologia biométrica, cartões e senhas, instaladas por especialistas.',
  benefits = '[
    "Tecnologia avançada",
    "Instalação profissional",
    "Integração com sistemas",
    "Suporte técnico",
    "Relatórios detalhados",
    "Backup de dados"
  ]'::jsonb,
  available_services = '[
    "Biometria digital",
    "Cartões de proximidade",
    "Senhas e PINs",
    "Reconhecimento facial",
    "Controle via app",
    "Catracas eletrônicas",
    "Cancelas automáticas",
    "Gestão de acessos"
  ]'::jsonb
WHERE name LIKE '%Controle%Acesso%' OR name LIKE '%Acesso%';

UPDATE service_categories 
SET 
  explanation = 'Interfones e videoporteiros permitem identificar visitantes antes de liberar o acesso.',
  importance_text = 'Videoporteiros aumentam a segurança em 85% ao permitir identificação visual de visitantes, evitando acessos indesejados.',
  how_now_helps = 'Técnicos certificados NOW instalam sistemas modernos com imagem HD, gravação e integração com smartphones.',
  benefits = '[
    "Imagem HD",
    "Áudio cristalino",
    "Gravação automática",
    "Acesso via celular",
    "Visão noturna",
    "Instalação rápida"
  ]'::jsonb,
  available_services = '[
    "Instalação de interfones",
    "Videoporteiros IP",
    "Sistemas condominiais",
    "Manutenção preventiva",
    "Upgrade para vídeo",
    "Integração com celular",
    "Câmera adicional",
    "Central de portaria"
  ]'::jsonb
WHERE name LIKE '%Interfone%' OR name LIKE '%Videoporteiro%';

UPDATE service_categories 
SET 
  explanation = 'Cercas elétricas são barreiras físicas eficazes que impedem invasões perimetrais.',
  importance_text = 'Cercas elétricas reduzem em 95% tentativas de invasão por muros e cercas, sendo obrigatórias em muitos condomínios.',
  how_now_helps = 'Instaladores certificados NOW garantem instalação segura, dentro das normas NBR, com garantia e manutenção.',
  benefits = '[
    "Instalação normalizada",
    "Certificado de garantia",
    "Manutenção periódica",
    "Testes de funcionamento",
    "Suporte 24/7",
    "Laudo técnico"
  ]'::jsonb,
  available_services = '[
    "Instalação completa",
    "Manutenção preventiva",
    "Laudo técnico NBR",
    "Troca de hastes",
    "Central de choque",
    "Aterramento",
    "Cerca concertina",
    "Alarmes integrados"
  ]'::jsonb
WHERE name LIKE '%Cerca%' OR name LIKE '%Elétrica%';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_availability_date ON provider_availability(provider_id, date);
CREATE INDEX IF NOT EXISTS idx_scheduled_appointments_date ON scheduled_appointments(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_appointments_provider ON scheduled_appointments(provider_id, scheduled_date);

-- Enable RLS
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_appointments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Providers can manage their own availability"
  ON provider_availability FOR ALL
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Everyone can view provider availability"
  ON provider_availability FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own appointments"
  ON scheduled_appointments FOR SELECT
  USING (
    request_id IN (SELECT id FROM service_requests WHERE user_id = auth.uid())
    OR provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid())
  );

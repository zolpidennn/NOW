-- Add detailed information columns to service_categories table
ALTER TABLE service_categories 
ADD COLUMN IF NOT EXISTS explanation TEXT,
ADD COLUMN IF NOT EXISTS importance_text TEXT,
ADD COLUMN IF NOT EXISTS how_now_helps TEXT,
ADD COLUMN IF NOT EXISTS benefits TEXT[], -- Array of benefits
ADD COLUMN IF NOT EXISTS available_services TEXT[]; -- Array of available services

-- Update CFTV category with detailed information
UPDATE service_categories 
SET 
  explanation = 'Sistema de Circuito Fechado de TV para monitoramento e segurança 24 horas',
  importance_text = 'Câmeras de segurança são essenciais para proteger seu patrimônio, prevenir crimes e ter evidências em casos de incidentes. Um sistema bem instalado garante monitoramento completo e tranquilidade para você e sua família.',
  how_now_helps = 'A NOW conecta você com empresas especializadas em CFTV, certificadas e avaliadas. Fazemos uma análise do seu local, sugerimos o melhor projeto e garantimos instalação profissional com suporte contínuo.',
  benefits = ARRAY[
    'Instalação rápida',
    'Empresas verificadas',
    'Monitoramento remoto',
    'Garantia de serviço',
    'Suporte técnico 24/7',
    'Melhores preços'
  ],
  available_services = ARRAY[
    'Instalação completa de câmeras IP',
    'Configuração de sistema DVR/NVR',
    'Monitoramento remoto via aplicativo',
    'Manutenção preventiva e corretiva',
    'Upgrade de sistemas existentes',
    'Consultoria de segurança'
  ]
WHERE name = 'CFTV';

-- Update Alarmes category
UPDATE service_categories 
SET 
  explanation = 'Sistemas de alarme residencial e empresarial com central de monitoramento',
  importance_text = 'Um sistema de alarme eficiente é a primeira linha de defesa contra invasões. Com sensores modernos e central de monitoramento, você recebe alertas instantâneos em qualquer situação de risco.',
  how_now_helps = 'Conectamos você com as melhores empresas de alarmes do mercado. Elas fazem um projeto personalizado para seu imóvel, instalam equipamentos de qualidade e oferecem monitoramento 24h.',
  benefits = ARRAY[
    'Resposta rápida',
    'Monitoramento 24h',
    'Equipamentos modernos',
    'Instalação certificada',
    'Central de alarme',
    'App mobile'
  ],
  available_services = ARRAY[
    'Instalação de central de alarme',
    'Sensores de movimento e abertura',
    'Integração com app mobile',
    'Monitoramento 24h com empresa certificada',
    'Manutenção e testes periódicos',
    'Sirenes e dispositivos de alerta'
  ]
WHERE name = 'Alarmes';

-- Update Automatização de Portão category
UPDATE service_categories 
SET 
  explanation = 'Automação inteligente para portões residenciais, condominiais e empresariais',
  importance_text = 'Portões automatizados oferecem praticidade, segurança e valorizam seu imóvel. Com controles remotos e integração com apps, você controla o acesso de forma simples e eficiente.',
  how_now_helps = 'A NOW seleciona empresas especializadas em automação que avaliam seu portão, recomendam o motor ideal e fazem a instalação completa com garantia e suporte.',
  benefits = ARRAY[
    'Praticidade no dia a dia',
    'Motores de qualidade',
    'Controle remoto',
    'Integração com app',
    'Garantia estendida',
    'Manutenção inclusa'
  ],
  available_services = ARRAY[
    'Instalação de motor de portão',
    'Automação de portão basculante e deslizante',
    'Integração com interfone e câmeras',
    'Controles remotos e sensores',
    'Manutenção preventiva',
    'Reparo de motores existentes'
  ]
WHERE name LIKE '%Automatização%' OR name LIKE '%Automação%';

-- Update Controle de Acesso category
UPDATE service_categories 
SET 
  explanation = 'Sistemas biométricos, por cartão e senha para controle total de entrada e saída',
  importance_text = 'Controlar quem entra e sai do seu imóvel é fundamental para a segurança. Sistemas modernos registram todos os acessos, permitindo rastreamento completo e evitando entradas não autorizadas.',
  how_now_helps = 'Empresas parceiras da NOW instalam sistemas de controle de acesso personalizados, desde catracas até biometria facial, com integração total e treinamento da sua equipe.',
  benefits = ARRAY[
    'Registro de acessos',
    'Biometria avançada',
    'Cartões e senhas',
    'Relatórios completos',
    'Integração com CFTV',
    'Controle remoto'
  ],
  available_services = ARRAY[
    'Instalação de catracas e torniquetes',
    'Leitores biométricos e de cartão',
    'Software de gestão de acessos',
    'Integração com ponto eletrônico',
    'Controle de visitantes',
    'Manutenção e suporte técnico'
  ]
WHERE name LIKE '%Controle%Acesso%';

-- Update Interfones e Videoporteiros category
UPDATE service_categories 
SET 
  explanation = 'Comunicação e identificação visual de visitantes antes de liberar o acesso',
  importance_text = 'Interfones e videoporteiros permitem que você veja e converse com visitantes antes de abrir a porta, aumentando significativamente sua segurança e comodidade.',
  how_now_helps = 'A NOW conecta você com instaladores certificados que oferecem os melhores equipamentos do mercado, com instalação profissional e configuração completa.',
  benefits = ARRAY[
    'Visualização de visitantes',
    'Áudio cristalino',
    'Fácil instalação',
    'Integração com portão',
    'Modelos modernos',
    'Garantia NOW'
  ],
  available_services = ARRAY[
    'Instalação de videoporteiro',
    'Interfones para condomínios',
    'Integração com fechadura elétrica',
    'Sistemas IP com app mobile',
    'Manutenção e reparo',
    'Upgrade de sistemas antigos'
  ]
WHERE name LIKE '%Interfone%' OR name LIKE '%Videoporteiro%';

-- Update Cerca Elétrica category
UPDATE service_categories 
SET 
  explanation = 'Instalação de cercas elétricas para perímetro de segurança residencial e empresarial',
  importance_text = 'Cercas elétricas são um dos sistemas de segurança mais eficazes para prevenir invasões. Causam desconforto sem riscos graves e funcionam como excelente elemento de dissuasão.',
  how_now_helps = 'Empresas credenciadas pela NOW fazem o projeto completo da cerca elétrica, seguindo todas as normas de segurança, com instalação profissional e garantia.',
  benefits = ARRAY[
    'Alta eficiência',
    'Instalação segura',
    'Normas técnicas',
    'Central de choque',
    'Alarme integrado',
    'Baixa manutenção'
  ],
  available_services = ARRAY[
    'Instalação de cerca elétrica residencial',
    'Cercas para muros e grades',
    'Central de choque com alarme',
    'Hastes e isoladores de qualidade',
    'Manutenção e teste de voltagem',
    'Adequação às normas técnicas'
  ]
WHERE name LIKE '%Cerca%';

-- Create index for better performance on new text fields
CREATE INDEX IF NOT EXISTS idx_service_categories_explanation ON service_categories USING gin(to_tsvector('portuguese', explanation));

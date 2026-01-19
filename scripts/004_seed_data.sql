-- Inserir categorias de serviços de segurança eletrônica
insert into public.service_categories (name, description, icon_name, display_order) values
  ('Automatização de Portão', 'Instalação, manutenção e reparo de sistemas de automatização de portões residenciais, condominiais e empresariais', 'DoorOpen', 1),
  ('Alarmes', 'Instalação e manutenção de sistemas de alarme para residências, condomínios e empresas', 'Bell', 2),
  ('CFTV', 'Instalação e configuração de câmeras de segurança e sistemas de monitoramento', 'Camera', 3),
  ('Controle de Acesso', 'Sistemas de controle de acesso biométrico, por cartão e senha', 'Shield', 4),
  ('Interfones e Videoporteiros', 'Instalação e manutenção de interfones e videoporteiros', 'Phone', 5),
  ('Cerca Elétrica', 'Instalação e manutenção de cercas elétricas de segurança', 'Zap', 6)
on conflict (name) do nothing;

-- Inserir planos de monetização
insert into public.plans (name, type, description, price_monthly, features, limits) values
  -- Provider subscriptions (Model 2)
  ('Free', 'provider_subscription', 'Plano gratuito para prestadores iniciantes', 0.00,
   '["Perfil básico", "Até 5 propostas por mês"]',
   '{"leads_per_month": 5, "highlighted": false}'),
  ('Pro', 'provider_subscription', 'Plano profissional com destaques', 79.00,
   '["Leads ilimitados", "Destaque no ranking", "Avaliações em destaque", "Suporte prioritário"]',
   '{"leads_per_month": -1, "highlighted": true}'),
  ('Enterprise', 'provider_subscription', 'Plano completo para empresas', 149.00,
   '["Tudo do Pro", "Dashboards avançados", "Integração com ERP", "Atendimento prioritário 24/7"]',
   '{"leads_per_month": -1, "highlighted": true, "enterprise_features": true}'),
  -- Client plans (Model 3)
  ('Condomínio Basic', 'client_subscription', 'Plano básico para condomínios', 99.00,
   '["Gestão de chamados", "Histórico técnico", "Relatórios básicos"]',
   '{"units": 50, "sla": "24h"}'),
  ('Empresa Premium', 'client_subscription', 'Plano premium para empresas', 199.00,
   '["Tudo do Basic", "SLA garantido", "Fornecedores homologados", "Relatórios avançados"]',
   '{"units": 100, "sla": "4h"}'),
  -- Maintenance plans (Model 5)
  ('Manutenção Mensal', 'maintenance', 'Manutenção preventiva mensal', 150.00,
   '["Inspeção mensal", "Manutenção preventiva", "Relatório detalhado"]',
   '{"frequency": "monthly"}'),
  ('Preventiva Trimestral', 'maintenance', 'Manutenção preventiva trimestral', 400.00,
   '["Inspeção trimestral", "Manutenção completa", "Relatório com recomendações"]',
   '{"frequency": "quarterly"}')
on conflict do nothing;

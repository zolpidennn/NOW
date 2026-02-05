-- Inserir categorias de serviços de segurança eletrônica
insert into public.service_categories (name, description, icon_name, display_order) values
  ('Automatização de Portão', 'Instalação, manutenção e reparo de sistemas de automatização de portões residenciais, condominiais e empresariais', 'DoorOpen', 1),
  ('Alarmes', 'Instalação e manutenção de sistemas de alarme para residências, condomínios e empresas', 'Bell', 2),
  ('CFTV', 'Instalação e configuração de câmeras de segurança e sistemas de monitoramento', 'Camera', 3),
  ('Controle de Acesso', 'Sistemas de controle de acesso biométrico, por cartão e senha', 'Shield', 4),
  ('Interfones e Videoporteiros', 'Instalação e manutenção de interfones e videoporteiros', 'Phone', 5),
  ('Cerca Elétrica', 'Instalação e manutenção de cercas elétricas de segurança', 'Zap', 6)
on conflict (name) do nothing;

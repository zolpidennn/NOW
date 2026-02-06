# NOW - Plataforma de Segurança Eletrônica

## Visão Geral

Ela resolve urgência, confiança e padronização em segurança eletrônica.

**Posicionamento:** NOW é a plataforma que conecta segurança profissional ao cliente, no tempo certo, com confiança real.

### O que a NOW é
- Plataforma digital de serviços de segurança eletrônica
- Marketplace B2C e B2B
- Ponte entre:
  - Condomínios
  - Empresas
  - Técnicos / Integradores / Empresas

### O que a NOW NÃO é
- Não é classificados (tipo OLX)
- Não é "indicação informal"
- Não é apenas orçamento

## Modelos de Monetização

### 💰 Modelo 1 — Comissão por Serviço (core)
- NOW cobra 8% a 15% por serviço fechado
- Comissão automática no app
- Pagamento protegido (escrow futuramente)
- Alta recorrência + baixo atrito

### 💳 Modelo 2 — Assinatura para Prestadores (B2B)
Planos para técnicos/empresas:
- **Free:** Até X propostas/mês, Perfil básico
- **Pro (R$ 79–149/mês):** Leads ilimitados, Destaque no ranking, Avaliações em destaque
- **Enterprise:** Dashboards, Integração com ERP, Atendimento prioritário

### 🏢 Modelo 3 — Plano para Condomínios e Empresas
- Plano mensal por unidade / empresa
- Inclui: Gestão de chamados, Histórico técnico, SLA, Fornecedores homologados, Relatórios
- Potencial de integração com Condfy

### 📢 Modelo 4 — Destaque & Publicidade Interna
- Técnicos pagam para aparecer no topo, ser "Recomendado NOW", campanhas regionais

### 🔧 Modelo 5 — Manutenção Recorrente (ouro)
- Segurança não é venda única
- Planos: Manutenção mensal, Preventiva trimestral
- NOW ganha comissão ou margem fixa

## Arquitetura Técnica

### Fluxo Principal (MVP)
1. Cliente cria solicitação
2. Escolhe categoria (CFTV, Acesso, Alarme…)
3. Define urgência (Agora / 24h / Agendado)
4. Técnicos recebem lead
5. Propostas enviadas
6. Cliente escolhe
7. Pagamento (ou agendamento)
8. Avaliação pós-serviço

### Backend
- Tabela `plans`
- Tabela `subscriptions`
- Tabela `transactions`
- Campo `commission_rate`
- Integrações futuras: Stripe / Mercado Pago, Split de pagamento, Nota fiscal

### Dashboards
**Técnico vê:**
- Leads recebidos
- Conversão
- Faturamento
- Avaliações

**Cliente vê:**
- Status do chamado
- Histórico
- Técnicos favoritos

## Instalação e Desenvolvimento

Ver [README_PWA.md](README_PWA.md) para instruções de instalação como PWA.

## Scripts de Banco

Os scripts SQL estão na pasta `scripts/` e devem ser executados em ordem:

1. `001_core_schema.sql` - Esquema base
2. `001_create_tables.sql` - Tabelas principais
3. `001_setup_admin_user.sql` - Usuário admin
4. `002_rls_policies.sql` - Políticas RLS
5. `003_functions_triggers.sql` - Funções e triggers
6. `004_seed_data.sql` - Dados iniciais
7. `019_add_monetization_system.sql` - Sistema de monetização

## Tecnologias
- Next.js 14
- Supabase
- TypeScript
- Tailwind CSS
- PWA
# 🚀 Guia Completo de Configuração - NOW Security

## 1️⃣ Variáveis de Ambiente

### 1.1 Criar arquivo `.env.local`

Na raiz do projeto, crie um arquivo `.env.local` com as seguintes variáveis:

```bash
# Supabase Configuration (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-servico-aqui

# OAuth Redirect URLs
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# PWA Push Notifications (opcional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua-chave-publica-aqui
VAPID_PRIVATE_KEY=sua-chave-privada-aqui
```

### 1.2 Obter as credenciais do Supabase

**Para NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY:**

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em [Settings](https://app.supabase.com/project/_/settings) > API
4. Copie:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Para SUPABASE_SERVICE_ROLE_KEY:**

1. No mesmo local (Settings > API)
2. Copie: service_role secret key → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **SEGURANÇA**: Nunca commite `.env.local`. Apenas `.env.example` deve estar no git.

---

## 2️⃣ Banco de Dados - Migrations SQL

### 2.1 Executar Scripts SQL Críticos

Os seguintes scripts DEVEM ser executados no Supabase SQL Editor:

#### Passo 1: Limpar políticas antigas (se necessário)

**Arquivo**: `scripts/026_cleanup_policies.sql`

```bash
1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em SQL Editor > New Query
4. Copie todo o conteúdo de scripts/026_cleanup_policies.sql
5. Clique em Run
```

#### Passo 2: Criar tabelas e políticas (OBRIGATÓRIO)

**Arquivo**: `scripts/027_create_company_admin_tables.sql`

Este script cria:
- Tabela `company_admins` (administradores de empresas)
- Tabela `company_documents` (documentos de empresas)
- Políticas de segurança (RLS)
- Índices de performance
- Triggers automáticos

```bash
1. Crie uma New Query no Supabase SQL Editor
2. Copie TODO o conteúdo de scripts/027_create_company_admin_tables.sql
3. Clique em Run
4. Aguarde conclusão
```

**Status esperado**: ✅ Executado com sucesso

### 2.2 Verificar Criação das Tabelas

No Supabase, vá em [Table Editor](https://app.supabase.com/project/_/editor) e verifique:

- ✅ Tabela `company_admins` existe
- ✅ Tabela `company_documents` existe
- ✅ Ambas têm RLS habilitado

---

## 3️⃣ Instalação e Build Local

### 3.1 Instalar dependências

```bash
npm install
```

### 3.2 Executar em desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### 3.3 Build para produção

```bash
npm run build
npm start
```

---

## 4️⃣ Funcionalidades Principais

### 4.1 Seção de Empresas

✅ **Implementado e Pronto**

- Listagem estilo iFood: `/companies`
- Página detalhada: `/companies/[id]`
- 3 abas: Serviços, Produtos, Avaliações
- Busca e filtros de ordenação

**Dados**: Atualmente mockados. Para usar dados reais, veja [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)

### 4.2 Gerenciamento de Empresas (Admin)

✅ **Implementado**

- Dashboard: `/admin/dashboard/companies`
- Detalhes: `/admin/dashboard/companies/[id]`
- Adicionar administradores por email
- Gerenciar permissões (master, staff, simple)
- Upload de documentos

**Status**: Requer execução do SQL (seção 2.2)

### 4.3 PWA (Progressive Web App)

✅ **Implementado**

- Instalação em dispositivo
- Funcionamento offline
- Notificações push
- Sincronização em background

**Como testar**: Veja [README_PWA.md](README_PWA.md)

---

## 5️⃣ Testes

### 5.1 Teste da Listagem de Empresas

```bash
1. npm run dev
2. Navegar para http://localhost:3000
3. Clicar em "Empresas" na aba de navegação
4. Ver lista estilo iFood com 5 empresas mockadas
```

### 5.2 Teste do Dashboard (requer SQL)

```bash
1. npm run dev
2. Fazer login em /auth/login
3. Navegar para /admin/dashboard
4. Ir em Empresas
5. Clicar em uma empresa para ver detalhes
6. Tentar adicionar um administrador (requer SQL executado)
```

### 5.3 Build lint e tipo checking

```bash
npm run build    # Build completo
npm run lint     # Verificar código
```

---

## 6️⃣ Deployment (Vercel/Produção)

### 6.1 Configurar Variáveis no Vercel

1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em Settings > Environment Variables
3. Adicione as mesmas variáveis do `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://seu-dominio.com
```

### 6.2 Deploy

```bash
# Opção 1: Via Git Push (automático com Vercel)
git add .
git commit -m "Configuração inicial"
git push origin main

# Opção 2: Via Vercel CLI
vercel --prod
```

### 6.3 Verificar Deploy

- Acesse seu URL de produção
- Verifique que as variáveis de ambiente estão configuradas
- Teste os fluxos principais

---

## 7️⃣ Checklist de Preparação

### Antes de Ir para Produção

- [ ] Variáveis de ambiente configuradas
- [ ] Scripts SQL executados (027_create_company_admin_tables.sql)
- [ ] Build local passa (`npm run build`)
- [ ] Sem erros de console no dev (`npm run dev`)
- [ ] Testou seção de empresas
- [ ] Testou dashboard admin
- [ ] PWA install test (opcional)
- [ ] Vercel environment variables configuradas
- [ ] Deploy realizado com sucesso

---

## 8️⃣ Troubleshooting

### Erro: "Missing Supabase environment variables"

**Causa**: `.env.local` não configurado

**Solução**:
```bash
1. Criar arquivo .env.local
2. Adicionar variáveis Supabase
3. Reiniciar servidor (npm run dev)
```

### Erro: "Could not find the table 'company_admins'"

**Causa**: Script SQL não foi executado

**Solução**:
```bash
1. Vá em app.supabase.com
2. SQL Editor > New Query
3. Cole scripts/027_create_company_admin_tables.sql
4. Click Run
5. Recarregue a página
```

### Erro: "API request failed with status 401"

**Causa**: Chaves Supabase inválidas ou expiradas

**Solução**:
```bash
1. Verifique NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local
2. Compare com valores no Supabase Dashboard (Settings > API)
3. Regenere as chaves se necessário
4. Reinicie o servidor
```

### Build falha em Vercel

**Causa**: Variáveis de ambiente não configuradas

**Solução**:
```bash
1. Vercel Dashboard > Project > Settings > Environment Variables
2. Adicione TODAS as variáveis necessárias
3. Trigue um novo deploy
```

---

## 9️⃣ Próximos Passos

### Após Configuração Básica

1. **Integrar Banco de Dados Real**
   - Veja [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
   - Modificar queries para usar dados reais em vez de mockados

2. **Implementar Autenticação Social**
   - Configurar Google OAuth
   - Configurar GitHub OAuth

3. **Adicionar Mais Features**
   - Sistema de mensagens
   - Agendamento de serviços
   - Sistema de pagamentos

4. **Otimizar Performance**
   - Implementar caching (SWR, React Query)
   - Otimizar imagens
   - Lazy loading de componentes

---

## 📚 Documentação Relacionada

| Arquivo | Descrição |
|---------|-----------|
| [QUICK_START.md](QUICK_START.md) | 3 passos para testar rápido |
| [FINAL_SUMMARY.md](FINAL_SUMMARY.md) | Resumo do que foi entregue |
| [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) | Como integrar com banco real |
| [README_PWA.md](README_PWA.md) | Configuração de PWA |
| [FIX_RLS_POLICIES.md](FIX_RLS_POLICIES.md) | Resolver problemas de RLS |
| [.env.example](.env.example) | Template de variáveis |

---

**Último atualizado**: Fevereiro 6, 2026

**Status**: ✅ Pronto para deploy

**Suporte**: Ver TEAM_MEMBER_ACCESS_README.md para acesso de equipe

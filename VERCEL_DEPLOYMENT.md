# 🚀 Guia de Deploy na Vercel

## ✅ Pré-requisitos

- Projeto já testado localmente com `npm run dev`
- Repositório Git configurado (GitHub, GitLab ou Bitbucket)
- Conta Vercel criada (vercel.com)
- Credenciais Supabase prontas

---

## 📋 Checklist Antes do Deploy

### 1. ✅ Verificações de Build Local
```bash
npm run build
# Deve compilar SEM erros críticos
# Avisos de deprecação são normais
```

### 2. ✅ Verificações de Código
```bash
npm run lint
# Verificar se há erros graves
```

### 3. ✅ Git e Repositório
```bash
git status
git add .
git commit -m "Preparar para deploy Vercel"
git push origin main
```

---

## 🔧 Configurar Variáveis de Ambiente na Vercel

### Passo 1: Acessar Vercel Dashboard
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto ou crie um novo

### Passo 2: Ir para Configurações
1. Clique em **Settings** (Engrenagem) no menu superior
2. Selecione **Environment Variables** no menu esquerdo

### Passo 3: Adicionar Variáveis Necessárias

Adicione as seguintes variáveis (copie dos valores do seu Supabase):

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://seu-projeto.supabase.co` | Produção, Preview, Dev |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sua chave anon Key | Produção, Preview, Dev |
| `SUPABASE_SERVICE_ROLE_KEY` | Sua chave Service Role | **Apenas Production** |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | `https://seu-dominio.vercel.app` | Produção |

### Passo 4: Obter Credenciais do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** → **API** (menu esquerdo)
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role secret key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## 🎯 Deploy via Vercel

### Opção 1: Deploy Automático (Recomendado)

1. No Vercel Dashboard, clique em **Add New** → **Project**
2. Selecione seu repositório Git
3. Configure:
   - **Framework Preset**: Next.js
   - **Environment Variables**: Adicione conforme Passo 2 acima
   - **Build Settings**: Deixar padrão
4. Clique em **Deploy**

### Opção 2: Deploy Manual via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy
vercel --prod

# Ou Preview
vercel
```

---

## 🔐 Segurança

### ⚠️ IMPORTANTE: Variáveis Privadas

- `SUPABASE_SERVICE_ROLE_KEY` deve ter acesso APENAS em ambiente **Production**
- NUNCA exponha `SUPABASE_SERVICE_ROLE_KEY` em commit ou `.env`
- Use `.env.local` para desenvolvimento local

### ✅ Boas Práticas

1. Sempre use variáveis de ambiente para credenciais
2. Configure CORS no Supabase se necessário
3. Ative autenticação de dois fatores na Vercel
4. Monitore logs de erro na Vercel Analytics

---

## 📊 Problemas Comuns e Soluções

### ❌ Erro: "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Solução**: Variável não foi adicionada no Vercel Settings → Environment Variables

### ❌ Erro: "Permission denied" ao fazer ações de admin
**Solução**: Adicionar `SUPABASE_SERVICE_ROLE_KEY` e verificar RLS policies no Supabase

### ❌ Erro: "Database error" após deploy
**Solução**: Verificar se as tabelas foram criadas (ver SQL_MIGRATION_INSTRUCTIONS.md)

### ❌ Build falha com "imagin.unoptimized"
**Solução**: Configurar `images.unoptimized: true` em next.config.mjs (já feito)

---

## 🧪 Testar Após Deploy

### 1. Verificar URL
```
https://seu-projeto.vercel.app
```

### 2. Testar Funcionalidades Críticas
- ✅ Login / Sign up
- ✅ Página de empresas
- ✅ Dashboard (se admin)
- ✅ Envio de pedidos

### 3. Verificar Logs
- Vercel → **Deployments** → Selecione deploy
- Ver **Logs** para erros

### 4. Monitorar Performance
- Vercel → **Analytics**
- Verificar Core Web Vitals

---

## 🔄 Deploy de Atualizações

Depois do deploy inicial, apenas faça:

```bash
git commit -m "Sua alteração"
git push origin main
# Vercel faz deploy automaticamente!
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique [Documentação Vercel](https://vercel.com/docs)
2. Verifique [Documentação Supabase](https://supabase.com/docs)
3. Veja logs no Vercel Dashboard
4. Verifique Console do navegador para erros

---

**Data de criação**: 06/02/2026  
**Status**: ✅ Pronto para deploy

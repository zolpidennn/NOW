# 🔧 CORRIGIR AS POLÍTICAS DE RLS

## O Problema
Você recebeu o erro `403 Forbidden - new row violates row-level security policy` porque as políticas RLS não permitiam que você adicionasse usuários.

## Solução

### Passo 1: Limpar as Antigas Políticas

Se você já executou o SQL uma vez, **execute primeiro** o script de limpeza:

**Arquivo**: `scripts/026_cleanup_policies.sql`

No Supabase SQL Editor:
1. Crie uma **New Query**
2. Copie e cole o conteúdo de `scripts/026_cleanup_policies.sql`
3. Clique **Run**

### Passo 2: Executar o SQL Atualizado

Agora execute o SQL **COMPLETO** atualizado:

**Arquivo**: `scripts/027_create_company_admin_tables.sql`

No Supabase SQL Editor:
1. Crie uma **New Query** (ou limpe a anterior)
2. Copie e cole o arquivo **completo** (linhas 1-207)
3. Clique **Run**

## ✅ O que mudou

As novas políticas agora permitem que:
- ✅ Você (leonardo@oliport.com.br) seja tratado como **super-admin**
- ✅ Você pode adicionar usuários a **qualquer empresa**
- ✅ Proprietários de empresas podem adicionar usuários às **suas empresas**
- ✅ Outros administradores podem ver e gerenciar **sua empresa**

## Próximos Passos

1. Execute `scripts/026_cleanup_policies.sql`
2. Execute `scripts/027_create_company_admin_tables.sql` (completo)
3. Recarregue a página `/admin/dashboard/companies/{id}`
4. Tente adicionar um usuário novamente

---

**Tempo estimado**: 2 minutos

# ⚠️ AÇÃO NECESSÁRIA - Erro: Tabela company_admins não encontrada

## Status

O código foi implementado com sucesso e a aplicação foi compilada sem erros. Porém, a tabela `company_admins` ainda não existe no banco de dados Supabase.

**Erro atual**: 
```
PGRST205: Could not find the table 'public.company_admins' in the schema cache
```

## O que precisa ser feito

### Executar a Migração SQL

Você precisa executar um script SQL no Supabase para criar as tabelas necessárias.

**Arquivo**: `scripts/027_create_company_admin_tables.sql`

**Passos**:

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **SQL Editor** → **New Query**
4. Copie todo o conteúdo do arquivo `scripts/027_create_company_admin_tables.sql`
5. Cole no editor do Supabase
6. Clique em **Run**

### Instruções Completas

Veja o arquivo `SQL_MIGRATION_INSTRUCTIONS.md` para instruções detalhadas passo a passo.

## O que foi implementado

✅ **Frontend**:
- Página de gerenciamento de empresa (`/admin/dashboard/companies/{id}`)
- Aba "Administradores" com lista e formulário de adicionar
- Suporte para adicionar usuários por email
- Sistema de permissões (master, staff, simple)
- Indicador visual de usuários com cadastro pendente

✅ **Backend**:
- API endpoint `/api/migrate-company-admins`
- Tratamento de erro quando tabela não existe
- Auto-retry para criar tabela

✅ **Banco de Dados (SQL)**:
- Script SQL completo para criar tabelas
- Índices para performance
- Políticas de segurança (RLS)
- Triggers automáticos
- Função para auto-popular user_id

## O que vai funcionar após a migração

1. ✅ Adicionar usuários à empresa por email
2. ✅ Se o usuário já está registrado → acesso imediato
3. ✅ Se o usuário não está registrado → acesso automático quando se registrar
4. ✅ Permissões granulares (master, staff, simple)
5. ✅ Histórico de convites e aceitações
6. ✅ Gerenciamento de documentos da empresa

## Erro Específico Encontrado

Quando você tenta adicionar um usuário:

```
TypeError: Failed to execute 'addAll' on 'Cache'
PGRST205: Could not find the table 'public.company_admins' in the schema cache
GET /rest/v1/company_admins... 404 (Not Found)
```

Isso ocorre porque a tabela não foi criada no banco de dados. Após executar o SQL, este erro desaparecerá.

## Próximas Etapas

1. Execute o SQL em `scripts/027_create_company_admin_tables.sql`
2. Recarregue a página `/admin/dashboard/companies/{companyId}`
3. Tente adicionar um usuário novamente
4. O sistema deve funcionar sem erros

---

**Data**: 2025-01-14  
**Status**: ⚠️ Aguardando execução da migração SQL

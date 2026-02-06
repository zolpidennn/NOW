# Resumo da Solução para o Erro: company_admins Table Not Found

## Problema Identificado

Ao tentar adicionar usuários ao dashboard de gerenciamento de empresa, você recebe:

```
PGRST205: Could not find the table 'public.company_admins' in the schema cache
404: GET /rest/v1/company_admins
```

## Causa Raiz

A tabela `company_admins` não foi criada no banco de dados Supabase, mas o código TypeScript espera que ela exista.

## Solução Implementada

### 1. ✅ Código TypeScript Aprimorado

**Arquivo**: `/app/admin/dashboard/companies/[id]/page.tsx`

Adicionei:

- ✅ Estados para controlar se a tabela existe: `tableNotFound`, `creatingTable`
- ✅ Verificação automática ao carregar a página: `checkAndCreateTable()`
- ✅ Tratamento de erro PGRST205 com retry automático
- ✅ Tentativa de criar a tabela através do endpoint `/api/migrate-company-admins`
- ✅ Mensagens claras ao usuário sobre o status
- ✅ Botão desabilitado enquanto inicializa com spinner "Inicializando..."
- ✅ Alert visual mostrando instruções quando tabela não encontrada

### 2. ✅ Script SQL Pronto para Execução

**Arquivo**: `scripts/027_create_company_admin_tables.sql`

Contém instruções para:

```sql
✓ CREATE TABLE public.company_admins
✓ CREATE TABLE public.company_documents
✓ CREATE INDEXES (performance)
✓ ALTER TABLE ENABLE ROW LEVEL SECURITY
✓ CREATE RLS POLICIES (6 políticas de segurança)
✓ CREATE TRIGGER (auto-update updated_at)
✓ CREATE FUNCTION + TRIGGER (auto-populate user_id)
```

### 3. ✅ Endpoints de Migração

**Arquivo**: `/app/api/migrate-company-admins/route.ts`

- GET: Verifica se tabela existe
- POST: Tenta criar as tabelas automaticamente
- Fallback: Retorna SQL para execução manual se RPC não disponível

### 4. ✅ Documentação e Instruções

**Arquivos Criados**:

- `SQL_MIGRATION_INSTRUCTIONS.md` - Guia passo a passo completo
- `MIGRATION_REQUIRED.md` - Resumo executivo do que fazer

## Como Usar

### Opção 1: Execução Automática (Recomendado)

Quando o usuário tentar adicionar um usuário, se a tabela não existir:

1. Página detecta erro PGRST205
2. Mostra alert: "Sistema de gerenciamento ainda não inicializado"
3. Tenta chamar POST `/api/migrate-company-admins` automaticamente
4. Se falhar, mostra instruções para execução manual

### Opção 2: Execução Manual Imediata

1. Abra seu dashboard Supabase
2. Vá para SQL Editor
3. Crie uma nova query
4. Copie e cole o conteúdo de `scripts/027_create_company_admin_tables.sql`
5. Clique em Run

## Mudanças no Código

### Arquivo Modificado: `/app/admin/dashboard/companies/[id]/page.tsx`

```diff
+ const [tableNotFound, setTableNotFound] = useState(false)
+ const [creatingTable, setCreatingTable] = useState(false)

+ useEffect(() => {
+   checkAndCreateTable()
+ }, [companyId])

+ const checkAndCreateTable = async () => {
+   // Verifica se tabela existe e tenta criar se não
+ }

+ // Na função handleInviteAdmin:
+ if (tableNotFound) {
+   // Tenta criar tabela automaticamente
+   const createResponse = await fetch('/api/migrate-company-admins', {
+     method: 'POST'
+   })
+ }

+ // No UI:
- <Button>Adicionar Usuário</Button>
+ <Button disabled={tableNotFound || creatingTable}>
+   {creatingTable ? "Inicializando..." : "Adicionar Usuário"}
+ </Button>

+ {tableNotFound && (
+   <Alert className="border-yellow-200 bg-yellow-50">
+     <AlertTriangle className="h-4 w-4 text-yellow-600" />
+     <AlertDescription>
+       Sistema de gerenciamento ainda não inicializado.
+       Execute SQL em scripts/027_create_company_admin_tables.sql
+     </AlertDescription>
+   </Alert>
+ )}
```

## Fluxo de Funcionamento Esperado

```
1. Usuário vai para /admin/dashboard/companies/{id}
   ↓
2. Página carrega e chama checkAndCreateTable()
   ↓
3. Se tabela não existe (PGRST205):
   a) setTableNotFound(true)
   b) Tenta POST /api/migrate-company-admins
   c) Se sucesso: inicializa tabelas automaticamente
   d) Se falha: mostra alert com instruções
   ↓
4. Usuário clica "Adicionar Usuário"
   ↓
5. Se tabela não existe, tenta criar novamente
   ↓
6. Uma vez criada:
   a) Se user já existe → acesso imediato
   b) Se user não existe → acesso automático após registrar
```

## Status Atual

| Componente | Status |
|-----------|--------|
| Frontend Code | ✅ Implementado |
| Backend API | ✅ Implementado |
| SQL Schema | ✅ Pronto para executar |
| Build | ✅ Sucesso (sem erros) |
| Database Tables | ⚠️ **Precisa ser executado** |
| End-to-End Funcionando | ⏳ Após executar SQL |

## Próximo Passo

**Execute o SQL** em `scripts/027_create_company_admin_tables.sql`:

```bash
# Opção 1: Supabase UI (Recomendado)
1. app.supabase.com → SQL Editor → New Query
2. Copie e cole scripts/027_create_company_admin_tables.sql
3. Click Run

# Opção 2: Deixar automaticamente (ao acessar a página)
1. Acesse /admin/dashboard/companies/{id}
2. Sistema tentará criar automaticamente
```

---

**Criado em**: 14/01/2025  
**Tempo Estimado para Ativar**: ~2 minutos (executar SQL)

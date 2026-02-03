# Instruções para Inicializar o Sistema de Gerenciamento de Administradores da Empresa

## O Problema

Ao tentar adicionar usuários ao dashboard de gerenciamento da empresa (`/admin/dashboard/companies/{companyId}`), você pode receber o erro:

```
PGRST205: Could not find the table 'public.company_admins' in the schema cache
```

Isso significa que as tabelas necessárias para gerenciar administradores de empresa não foram criadas no seu banco de dados Supabase.

## A Solução

Você precisa executar um script SQL no Supabase para criar as tabelas e políticas de segurança.

### Passo 1: Acesse seu Supabase Dashboard

1. Vá para [app.supabase.com](https://app.supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto

### Passo 2: Abra o SQL Editor

1. No painel esquerdo, clique em **"SQL Editor"**
2. Clique em **"New Query"** ou **"Create new query"**

### Passo 3: Copie o Script SQL

O script SQL está localizado em: `scripts/027_create_company_admin_tables.sql`

Copie todo o conteúdo do arquivo. O script contém:

- Criação da tabela `company_admins`
- Criação da tabela `company_documents`
- Índices para melhor performance
- Políticas de segurança (RLS)
- Triggers automáticos para atualizar `updated_at`
- Função para auto-popular `user_id` quando um usuário se registra

### Passo 4: Cole e Execute

1. Cole o conteúdo do SQL no editor do Supabase
2. Clique em **"Run"** ou pressione `Ctrl + Enter`

### Passo 5: Verifique a Criação

Você verá uma mensagem de sucesso indicando que as tabelas foram criadas.

## O que o Script Faz

### Tabela `company_admins`

Armazena informações sobre quem administra cada empresa:

```sql
company_id       -- ID da empresa
user_id          -- ID do usuário (NULL se não registrado ainda)
user_email       -- Email do administrador
permission_level -- 'master', 'staff' ou 'simple'
is_active        -- Se o acesso está ativo
invited_by       -- Quem convidou este administrador
invited_at       -- Data do convite
accepted_at      -- Data em que aceitou (será preenchida automaticamente)
```

### Tabela `company_documents`

Armazena documentação das empresas:

```sql
company_id       -- ID da empresa
document_type    -- Tipo de documento
file_url         -- URL do arquivo
file_name        -- Nome do arquivo
uploaded_by      -- Quem fez upload
uploaded_at      -- Data do upload
verified         -- Se foi verificado
verified_by      -- Quem verificou
verified_at      -- Data da verificação
rejection_reason -- Motivo de rejeição (se aplicável)
```

### Trigger Automático

O script cria um trigger que **auto-popula `user_id`** quando um usuário se registra:

1. Um administrador é adicionado por email
2. Quando esse usuário se registra, o sistema automaticamente:
   - Popula o `user_id` no registro de `company_admins`
   - Define `accepted_at` com a data/hora atual
3. O usuário ganha acesso ao dashboard da empresa imediatamente

## Testando a Funcionalidade

Após executar o SQL:

### 1. **Usuário Já Registrado**
- Vá para `/admin/dashboard/companies/{companyId}`
- Clique em "Adicionar Usuário"
- Digite o email de um usuário já registrado
- Selecione o nível de permissão
- Clique em "Adicionar Usuário"
- **Resultado esperado**: Mensagem dizendo que o usuário foi adicionado e terá acesso imediatamente

### 2. **Usuário Não Registrado**
- Repita os passos acima com um email de um usuário não registrado
- **Resultado esperado**: Mensagem dizendo que o email foi adicionado e o acesso será automático quando se registrar

### 3. **Verificar Lista de Administradores**
- A lista de administradores apareça na aba "Administradores"
- Usuários pendentes mostram "(Cadastro Pendente)"
- Uma vez que se registram, o status muda para ativo

## Políticas de Segurança (RLS)

O script também cria políticas que garantem:

✅ Usuários só veem seus próprios registros  
✅ Donos de empresa veem todos os administradores da sua empresa  
✅ Administradores veem os administradores da sua empresa  
✅ Apenas donos de empresa podem adicionar/remover administradores  
✅ Apenas donos de empresa podem adicionar/remover documentos  

## Se Houver Erros

Se o script falhar:

1. **Verifique se as tabelas já existem**: Talvez o script tenha sido executado antes
   - Vá para "Table Editor" e procure por `company_admins`
   - Se existir, tudo está ok

2. **Consulte os logs**: O Supabase mostra mensagens de erro detalhadas
   - Procure por `already exists`, `duplicate key`, etc.

3. **Entre em contato**: Se persistir, envie a mensagem de erro para análise

## Próximos Passos

Após executar o SQL:

1. ✅ Recarregue a página `/admin/dashboard/companies/{companyId}`
2. ✅ Tente adicionar um usuário
3. ✅ Verifique se funcionou
4. ✅ Teste registrando um novo usuário com um email já adicionado à empresa

---

**Nota**: Este é um script de migração única. Você só precisa executar uma vez por projeto.

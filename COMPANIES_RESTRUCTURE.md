# Reestruturação da Seção de Empresas

## 📋 Visão Geral

A seção de empresas foi completamente reestruturada para apresentar uma experiência de listagem similar ao iFood, com cards de empresas clicáveis e páginas detalhadas de cada empresa.

## 🏗️ Estrutura Implementada

### 1. **Lista de Empresas (Estilo iFood)**
   - **Local**: Sheet no `navigation-tabs.tsx` (aba "Empresas")
   - **Funcionalidade**: 
     - Exibe lista de empresas credenciadas
     - Cards com imagem, nome, descrição, rating, especialidades
     - Tempo de resposta e número de avaliações
     - Ao clicar, navega para a página detalhada da empresa

### 2. **Página de Empresa Detalhada**
   - **Rota**: `/companies/[id]/page.tsx`
   - **Componentes**:
     - Header sticky com botões (voltar, compartilhar, favoritar)
     - Banner e logo da empresa
     - Informações principais (nome, verificação, descrição, rating)
     - Contato (endereço, telefone, email)
     - 3 Tabs principais:
       - **Serviços**: Lista de serviços oferecidos com preços e duração
       - **Produtos**: Produtos disponíveis com imagens e preços
       - **Avaliações**: Reviews de clientes com ratings e comentários

### 3. **Componente Reutilizável**
   - **Arquivo**: `components/company-card.tsx`
   - **Uso**: Listagem em navigation-tabs e página de empresas
   - **Props**: Interface `CompanyCardProps` com todos os dados necessários

### 4. **Página de Listagem Completa**
   - **Rota**: `/companies/page.tsx`
   - **Funcionalidades**:
     - Listagem completa de todas as empresas
     - Barra de busca por nome, descrição ou especialidades
     - Filtros de ordenação (Melhor Avaliação, Mais Avaliações, Mais Rápido)
     - Responsivo e otimizado para mobile

## 📂 Arquivos Criados/Modificados

### Criados:
```
app/companies/
├── page.tsx                 # Página de listagem de empresas
└── [id]/
    └── page.tsx            # Página detalhada da empresa

components/
└── company-card.tsx        # Componente card reutilizável
```

### Modificados:
```
components/navigation-tabs.tsx  # Atualizado para usar CompanyCard
```

## 🎯 Funcionalidades Principais

### Na Lista (Sheet/Página):
- ✅ Busca por nome de empresa
- ✅ Busca por especialidades
- ✅ Filtro por rating
- ✅ Exibição de tempo de resposta
- ✅ Número de avaliações

### Na Página Detalhada:
- ✅ Informações completas da empresa
- ✅ Botão de contato
- ✅ Compartilhar perfil
- ✅ Adicionar aos favoritos
- ✅ Visualizar serviços com preços
- ✅ Galeria de produtos
- ✅ Avaliações de clientes
- ✅ Informações de contato (telefone, email, endereço)

## 🔗 Integração com Banco de Dados

Os dados atualmente estão mockados. Para integração real:

1. **Alterar a fonte de dados** no `/companies/page.tsx` e `/companies/[id]/page.tsx`:
   - Substituir `companiesData` por chamadas à API/Supabase

2. **Usar a interface `ServiceProvider`** do `lib/types.ts`:
   ```typescript
   interface ServiceProvider {
     id: string
     user_id?: string
     company_name: string
     description?: string
     phone: string
     email: string
     address: string
     city: string
     state: string
     zip_code: string
     rating: number
     total_reviews: number
     is_active: boolean
     created_at: string
     updated_at: string
   }
   ```

3. **Criar tabelas adicionais** (se necessário):
   - `company_services` - serviços oferecidos
   - `company_products` - produtos à venda
   - `company_reviews` - avaliações

## 🎨 Estilo Visual

- **Cards**: Design similar ao iFood com imagens, ratings em destaque
- **Cores**: Usa sistema de tokens existente (primary, muted-foreground, etc)
- **Animações**: Hover effects, scale transitions, smooth scrolling
- **Responsividade**: Totalmente otimizado para mobile

## 🚀 Próximos Passos

1. Conectar ao banco de dados real
2. Implementar carregamento de imagens otimizado
3. Adicionar filtros avançados (localização, preço, disponibilidade)
4. Implementar sistema de favoritos persistente
5. Adicionar chat/mensagem com empresa
6. Integrar agenda/agendamento de serviços

## 📱 Navegação

```
Home (navigation-tabs)
└── Aba "Empresas"
    ├── Sheet com lista de empresas
    └── Clique em empresa → /companies/[id]
        ├── Visualizar serviços
        ├── Visualizar produtos
        └── Visualizar avaliações

Ou diretamente:
└── /companies (página de listagem)
    └── Clique em empresa → /companies/[id]
```

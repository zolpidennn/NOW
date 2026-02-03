# 🗺️ Mapa de Navegação - Seção de Empresas

## Estrutura de Rotas

```
/
├── Home (page.tsx)
│   └── navigation-tabs.tsx
│       └── [Aba "Empresas"] ← Sheet
│           ├── Lista de Empresas (CompanyCard)
│           └── Click → /companies/[id]
│
├── /companies
│   └── page.tsx
│       ├── Busca (searchTerm)
│       ├── Filtros (sortBy)
│       ├── Lista de Empresas (CompanyCard)
│       └── Click em Card → /companies/[id]
│
└── /companies/[id]
    └── page.tsx
        ├── Header (voltar, share, favoritar)
        ├── Informações da Empresa
        ├── Tabs:
        │   ├── [Serviços]
        │   ├── [Produtos]
        │   └── [Avaliações]
        └── Botão Contato
```

## Fluxo de Usuário

### Cenário 1: Descobrir Empresas no Home

```
┌────────────┐
│ Home Page  │
└─────┬──────┘
      │
      ↓
┌──────────────────────┐
│ Clica em "Empresas"  │
│ (navigation-tabs)    │
└─────┬────────────────┘
      │
      ↓
┌──────────────────────────────┐
│ Sheet com Lista iFood        │
│ - Imagem                     │
│ - Nome                       │
│ - Rating ⭐                 │
│ - Especialidades            │
│ - Tempo resposta            │
│ - Avaliações #              │
└─────┬────────────────────────┘
      │
      ↓ (Click em Card)
┌──────────────────────────────┐
│ Página Detalhada             │
│ /companies/[id]              │
│                              │
│ - Informações Completas      │
│ - 3 Tabs (Svc/Prod/Reviews) │
│ - Contato                    │
│ - Compartilhar/Favoritar    │
└──────────────────────────────┘
```

### Cenário 2: Buscar Empresas Específicas

```
┌────────────────────┐
│ Url: /companies    │
│ (Página Listagem)  │
└─────┬──────────────┘
      │
      ↓
┌──────────────────────┐
│ Input de Busca 🔍    │
│ "CFTV" ou "Câmeras" │
└─────┬────────────────┘
      │
      ↓ (Filtra em tempo real)
┌──────────────────────────────┐
│ Resultados Filtrados         │
│ - SecureVision ✓             │
│ - Outros matches             │
└─────┬────────────────────────┘
      │
      ↓ (Click em resultado)
┌──────────────────────────────┐
│ Página Detalhada             │
│ /companies/[id]              │
└──────────────────────────────┘
```

### Cenário 3: Ordenar por Melhor Avaliação

```
┌──────────────────────────┐
│ /companies (Listagem)    │
│ Clica: "Melhor Avaliação"│
└─────┬────────────────────┘
      │
      ↓
┌──────────────────────────┐
│ Ordena por rating        │
│ (descending)             │
│ AutoHome 4.9 ✨          │
│ SecureVision 4.8         │
│ ProTech 4.6              │
│ Smart Access 4.7         │
│ InterSystem 4.5          │
└──────────────────────────┘
```

## Componentes Principais

### 1. NavigationTabs
```typescript
├── Tabs: [Início] [Serviços] [Empresas] [Produtos]
├── Sheets: 
│   ├── Serviços Sheet
│   ├── Empresas Sheet ← Mostra 5 empresas principais
│   └── Produtos Sheet
└── Cards: CompanyCard reutilizável
```

### 2. CompanyCard
```typescript
├── Props:
│   ├── id: string
│   ├── company_name: string
│   ├── description: string
│   ├── rating: number
│   ├── total_reviews: number
│   ├── logo: string
│   ├── specialties: string[]
│   ├── responseTime: string
│   ├── address, city, state: string
│   └── phone: string
├── Render:
│   ├── Imagem
│   ├── Nome + Rating
│   ├── Localização + Tempo
│   └── Especialidades
└── onClick: router.push(`/companies/${id}`)
```

### 3. Companies Page (`/companies`)
```typescript
├── State:
│   ├── companies: ServiceProvider[]
│   ├── searchTerm: string
│   ├── sortBy: "rating" | "reviews" | "response"
│   └── filteredCompanies: ServiceProvider[]
├── Features:
│   ├── Search Input
│   ├── Filter Buttons
│   ├── CompanyCard Grid
│   └── Skeleton/Loading
└── Navigation: onClick → /companies/[id]
```

### 4. Company Detail Page (`/companies/[id]`)
```typescript
├── Header:
│   ├── Botão Voltar
│   ├── Botão Compartilhar
│   └── Botão Favoritar
├── Company Info:
│   ├── Banner
│   ├── Logo
│   ├── Nome + Verificado
│   ├── Rating
│   ├── Informações de Contato
│   └── Especialidades
├── Tabs:
│   ├── Serviços
│   │   └── Lista de Services
│   ├── Produtos
│   │   └── Grid de Products
│   └── Avaliações
│       └── Lista de Reviews
└── CTA: Botão Contato
```

## Estados e Fluxos

### Carregamento
```
┌─────────┐
│ Loading │
│ (spinner)
└────┬────┘
     │
     ↓
┌──────────────┐
│ Dados Prontos│
│ (rendered)   │
└──────────────┘
```

### Busca
```
┌──────────────────┐
│ Digite "CFTV"    │
└────┬─────────────┘
     │
     ↓
┌────────────────────────────┐
│ Filter companies on-the-fly│
└────┬───────────────────────┘
     │
     ↓
┌────────────────────────┐
│ Mostra resultados      │
│ que contêm "CFTV"      │
└────────────────────────┘
```

### Ordenação
```
┌──────────────────┐
│ Clica Filter     │
│ "Melhor Avaliado"│
└────┬─────────────┘
     │
     ↓
┌──────────────────────────┐
│ Sort by rating DESC      │
└────┬─────────────────────┘
     │
     ↓
┌──────────────────────────┐
│ Re-render com novo sort  │
│ AutoHome 4.9 (topo)      │
│ ...                      │
│ InterSystem 4.5 (final)  │
└──────────────────────────┘
```

## Data Flow

### Dados Mockados (Current)
```
components/navigation-tabs.tsx
    ↓ (companiesData[])
    └─→ CompanyCard

app/companies/page.tsx
    ↓ (companiesData[])
    ├─→ Search Filter
    ├─→ Sort Logic
    └─→ CompanyCard[]

app/companies/[id]/page.tsx
    ↓ (companiesData[id])
    ├─→ Header Info
    ├─→ Services Tab
    ├─→ Products Tab
    └─→ Reviews Tab
```

### Com Supabase (Future)
```
Supabase: service_providers
    ↓ (useEffect → fetch)
components/navigation-tabs.tsx
    ├─→ query: limit(5)
    └─→ CompanyCard

Supabase: service_providers
    ↓ (useEffect → fetch)
app/companies/page.tsx
    ├─→ Search filter (ilike)
    ├─→ Sort by rating/reviews
    └─→ CompanyCard[]

Supabase: service_providers + related tables
    ↓ (useEffect → fetch)
app/companies/[id]/page.tsx
    ├─→ company_services
    ├─→ company_products
    ├─→ company_reviews
    └─→ company_specialties
```

## URLs Disponíveis

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/companies` | Static | Listagem completa com busca |
| `/companies/1` | Dynamic | Detalhes empresa #1 |
| `/companies/2` | Dynamic | Detalhes empresa #2 |
| `/companies/[id]` | Dynamic | Template para todas |

## Componentes Reutilizáveis

```typescript
CompanyCard
├── Usado em: navigation-tabs.tsx
├── Usado em: /companies/page.tsx
├── Propriedades: CompanyCardProps interface
└── Funcionalidade: Card interativo estilo iFood
```

---

**Última atualização**: 02/02/2026
**Pronto para**: Desenvolvimento + Testes + Deploy

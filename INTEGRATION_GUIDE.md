# 📚 Guia de Integração - Dados Reais de Empresas

## 🎯 Objetivo

Este guia explica como integrar os dados reais de empresas (ServiceProvider) do Supabase nas páginas criadas.

## 📊 Estrutura do Banco de Dados

### Tabela `service_providers`
```sql
CREATE TABLE service_providers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  company_name VARCHAR NOT NULL,
  description TEXT,
  phone VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  address VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  state VARCHAR NOT NULL,
  zip_code VARCHAR NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabelas Relacionadas (a criar)
```sql
-- Serviços da empresa
CREATE TABLE company_services (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  estimated_duration INTEGER, -- em minutos
  base_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Produtos da empresa
CREATE TABLE company_products (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Avaliações/Reviews
CREATE TABLE company_reviews (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Especialidades (tags)
CREATE TABLE company_specialties (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  specialty VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔗 Passo a Passo de Integração

### 1. Atualizar `/companies/page.tsx`

**Antes (mockado):**
```typescript
const companiesData = [
  {
    id: "1",
    company_name: "SecureVision Segurança",
    // ...
  },
]
```

**Depois (com Supabase):**
```typescript
"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { ServiceProvider } from "@/lib/types"

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadCompanies() {
      try {
        const { data, error } = await supabase
          .from("service_providers")
          .select(`
            *,
            company_specialties(specialty),
            company_reviews(rating)
          `)
          .eq("is_active", true)
          .order("rating", { ascending: false })

        if (error) throw error

        // Transformar dados do Supabase para formato esperado
        const formattedCompanies = data?.map(company => ({
          ...company,
          specialties: company.company_specialties.map(s => s.specialty),
          total_reviews: company.company_reviews.length,
          responseTime: "15 min", // Calcular com lógica real se disponível
        })) || []

        setCompanies(formattedCompanies)
      } catch (error) {
        console.error("Erro ao carregar empresas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCompanies()
  }, [supabase])

  if (loading) {
    return <div className="text-center py-12">Carregando empresas...</div>
  }

  // ... resto do componente
}
```

### 2. Atualizar `/companies/[id]/page.tsx`

**Criar hook para carregar dados da empresa:**
```typescript
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { ServiceProvider } from "@/lib/types"

interface CompanyWithDetails extends ServiceProvider {
  company_services: Array<{
    id: string
    name: string
    description?: string
    estimated_duration?: number
    base_price?: number
  }>
  company_products: Array<{
    id: string
    name: string
    description?: string
    price: number
    image_url?: string
  }>
  company_reviews: Array<{
    id: string
    rating: number
    comment?: string
    created_at: string
    customer_id: string
  }>
  company_specialties: Array<{
    specialty: string
  }>
}

export default function CompanyPage() {
  const params = useParams()
  const [company, setCompany] = useState<CompanyWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadCompany() {
      try {
        const { data, error: supabaseError } = await supabase
          .from("service_providers")
          .select(`
            *,
            company_services(*),
            company_products(*),
            company_reviews(*),
            company_specialties(specialty)
          `)
          .eq("id", params.id)
          .single()

        if (supabaseError) throw supabaseError
        setCompany(data)
      } catch (error) {
        console.error("Erro ao carregar empresa:", error)
        setError("Empresa não encontrada")
      } finally {
        setLoading(false)
      }
    }

    loadCompany()
  }, [params.id, supabase])

  // ... resto do componente
}
```

### 3. Criar Função Auxiliar em `lib/companies.ts`

```typescript
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { ServiceProvider } from "./types"

export async function getCompanies(filters?: {
  search?: string
  sortBy?: "rating" | "reviews" | "response"
}) {
  const supabase = createClientComponentClient()

  let query = supabase
    .from("service_providers")
    .select(`
      *,
      company_specialties(specialty),
      company_reviews(rating)
    `)
    .eq("is_active", true)

  if (filters?.search) {
    query = query.or(
      `company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query

  if (error) throw error

  // Aplicar sorting
  if (data) {
    if (filters?.sortBy === "rating") {
      data.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (filters?.sortBy === "reviews") {
      data.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0))
    }
  }

  return data
}

export async function getCompanyById(id: string) {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from("service_providers")
    .select(`
      *,
      company_services(*),
      company_products(*),
      company_reviews(*, customer_id),
      company_specialties(specialty)
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}
```

### 4. Atualizar `navigation-tabs.tsx`

```typescript
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { ServiceProvider } from "@/lib/types"

export function NavigationTabs() {
  const [companies, setCompanies] = useState<ServiceProvider[]>([])

  useEffect(() => {
    async function loadCompanies() {
      const supabase = createClientComponentClient()
      const { data } = await supabase
        .from("service_providers")
        .select("*")
        .eq("is_active", true)
        .limit(5) // Apenas top 5 para o sheet

      setCompanies(data || [])
    }

    loadCompanies()
  }, [])

  // ... resto do componente usando companies ao invés de companiesData
}
```

## 📝 Exemplo Completo - Migração em `/companies/page.tsx`

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ChevronLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CompanyCard } from "@/components/company-card"
import type { ServiceProvider } from "@/lib/types"

interface CompanyWithExtras extends ServiceProvider {
  specialties?: string[]
  responseTime?: string
}

export default function CompaniesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [companies, setCompanies] = useState<CompanyWithExtras[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithExtras[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "response">("rating")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompanies()
  }, [])

  async function loadCompanies() {
    try {
      const { data, error } = await supabase
        .from("service_providers")
        .select(`
          *,
          company_specialties(specialty)
        `)
        .eq("is_active", true)

      if (error) throw error

      const formatted: CompanyWithExtras[] = (data || []).map(company => ({
        ...company,
        specialties: (company as any).company_specialties?.map((s: any) => s.specialty) || [],
        responseTime: "15 min", // TODO: Calcular baseado em dados reais
      }))

      setCompanies(formatted)
      applyFilters(formatted, searchTerm, sortBy)
    } catch (error) {
      console.error("Erro ao carregar empresas:", error)
    } finally {
      setLoading(false)
    }
  }

  function applyFilters(
    data: CompanyWithExtras[],
    search: string,
    sort: typeof sortBy
  ) {
    let filtered = data.filter((company) =>
      company.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (company.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (company.specialties || []).some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      )
    )

    if (sort === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (sort === "reviews") {
      filtered.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0))
    }

    setFilteredCompanies(filtered)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    applyFilters(companies, value, sortBy)
  }

  const handleSort = (value: typeof sortBy) => {
    setSortBy(value)
    applyFilters(companies, searchTerm, value)
  }

  // ... render component
}
```

## 🔐 Segurança (RLS Policies)

Adicione policies no Supabase:

```sql
-- Qualquer um pode ver empresas ativas
CREATE POLICY "Enable read access for service providers"
  ON service_providers
  FOR SELECT
  USING (is_active = true);

-- Apenas a empresa pode editar seus dados
CREATE POLICY "Enable update for own service provider"
  ON service_providers
  FOR UPDATE
  USING (auth.uid() = user_id);
```

## 📦 Dependências Necessárias

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

## 🚀 Deploy

1. Executar migrations no Supabase
2. Atualizar variáveis de ambiente (.env.local)
3. Testar localmente com `npm run dev`
4. Fazer build: `npm run build`
5. Deploy com `vercel deploy` ou seu provedor

---

**Status**: Pronto para implementação
**Último update**: 02/02/2026

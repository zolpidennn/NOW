"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CompanyCard } from "@/components/company-card"
import { createClient } from "@/lib/supabase/client"
import type { ServiceProvider } from "@/lib/types"

interface CompanyWithExtras extends ServiceProvider {
  specialties?: string[]
  responseTime?: string
}

const companiesData = [
  {
    id: "1",
    company_name: "SecureVision Segurança",
    description: "Especializada em sistemas CFTV e monitoramento 24h",
    rating: 4.8,
    total_reviews: 145,
    address: "Av. Paulista, 1000",
    city: "São Paulo",
    state: "SP",
    phone: "(11) 99999-0001",
    logo: "https://via.placeholder.com/300x200?text=SecureVision",
    specialties: ["CFTV", "Monitoramento", "Instalação"],
    responseTime: "15 min",
  },
  {
    id: "2",
    company_name: "ProTech Alarmes",
    description: "Sistemas de alarme inteligentes para residências",
    rating: 4.6,
    total_reviews: 98,
    address: "Rua Augusta, 500",
    city: "São Paulo",
    state: "SP",
    phone: "(11) 99999-0002",
    logo: "https://via.placeholder.com/300x200?text=ProTech",
    specialties: ["Alarmes", "Automação Residencial"],
    responseTime: "20 min",
  },
  {
    id: "3",
    company_name: "AutoHome Inteligente",
    description: "Soluções completas de automação residencial e predial",
    rating: 4.9,
    total_reviews: 210,
    address: "Av. Berrini, 2000",
    city: "São Paulo",
    state: "SP",
    phone: "(11) 99999-0003",
    logo: "https://via.placeholder.com/300x200?text=AutoHome",
    specialties: ["Automação", "Controle de Acesso", "Iluminação"],
    responseTime: "10 min",
  },
  {
    id: "4",
    company_name: "Smart Access Control",
    description: "Fechaduras inteligentes e controle de acesso biométrico",
    rating: 4.7,
    total_reviews: 156,
    address: "Rua Oscar Freire, 1500",
    city: "São Paulo",
    state: "SP",
    phone: "(11) 99999-0004",
    logo: "https://via.placeholder.com/300x200?text=Smart+Access",
    specialties: ["Controle de Acesso", "Biometria", "Fechaduras"],
    responseTime: "25 min",
  },
  {
    id: "5",
    company_name: "InterSystem Comunicação",
    description: "Interfones e videoporteiros para condomínios",
    rating: 4.5,
    total_reviews: 87,
    address: "Av. Faria Lima, 800",
    city: "São Paulo",
    state: "SP",
    phone: "(11) 99999-0005",
    logo: "https://via.placeholder.com/300x200?text=InterSystem",
    specialties: ["Interfones", "Videoporteiros", "Comunicação"],
    responseTime: "30 min",
  },
]

export default function CompaniesPage() {
  const router = useRouter()
  const supabase = createClient()
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
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false })

      if (error) {
        console.error("Erro ao carregar empresas:", error)
        setLoading(false)
        return
      }

      const formatted: CompanyWithExtras[] = (data || []).map((company) => ({
        ...company,
        specialties: [],
        responseTime: "15 min",
      }))

      setCompanies(formatted)
      applyFilters(formatted, searchTerm, sortBy)
      setLoading(false)
    } catch (error) {
      console.error("Erro ao carregar empresas:", error)
      setLoading(false)
    }
  }

  function applyFilters(
    data: CompanyWithExtras[],
    search: string,
    sort: typeof sortBy
  ) {
    let filtered = data.filter(
      (company) =>
        company.company_name.toLowerCase().includes(search.toLowerCase()) ||
        (company.description || "")
          .toLowerCase()
          .includes(search.toLowerCase())
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">Empresas Credenciadas</h1>
        </div>

        {/* Barra de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
      </div>

      {/* Filtros */}
      {!loading && companies.length > 0 && (
        <div className="px-4 py-3 border-b sticky top-20 z-30 bg-background">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { value: "rating" as const, label: "Melhor Avaliação" },
              { value: "reviews" as const, label: "Mais Avaliações" },
              { value: "response" as const, label: "Mais Rápido" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSort(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  sortBy === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Empresas */}
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="ml-2">Carregando empresas...</p>
          </div>
        ) : filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <button
              key={company.id}
              onClick={() => router.push(`/companies/${company.id}`)}
              className="w-full text-left"
            >
              <CompanyCard {...company} />
            </button>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-2">Nenhuma empresa encontrada</p>
            <p className="text-sm">Nenhuma empresa credenciada está disponível no momento</p>
          </div>
        )}
      </div>
    </div>
  )
}

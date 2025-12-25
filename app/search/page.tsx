"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { SearchCategories } from "@/components/search-categories"
import { SearchResults } from "@/components/search-results"
import { Input } from "@/components/ui/input"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileHeader />

      <main className="px-4 py-6 max-w-7xl mx-auto">
        {/* Barra de busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar em Todos os Serviços NOW"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-lg border bg-card pl-10 text-base shadow-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Conteúdo da busca */}
        {searchQuery ? (
          <SearchResults query={searchQuery} />
        ) : (
          <>
            <h2 className="mb-4 text-xl font-bold">Categorias</h2>
            <SearchCategories />
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

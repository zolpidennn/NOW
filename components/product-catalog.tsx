"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, SlidersHorizontal, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ProductCard } from "@/components/product-card"

type Product = {
  id: string
  name: string
  description: string
  price: number
  discount_price: number | null
  image_url: string
  category: string
  brand: string
  stock: number
  views: number
  sales_count: number
  featured: boolean
}

type FilterState = {
  search: string
  category: string[]
  brand: string[]
  minPrice: number
  maxPrice: number
  sortBy: string
}

const categories = [
  "Câmeras de Segurança",
  "Alarmes",
  "Interfones",
  "Controle de Acesso",
  "Cerca Elétrica",
  "Automatização",
  "Acessórios",
]

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [brands, setBrands] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: [],
    brand: [],
    minPrice: 0,
    maxPrice: 10000,
    sortBy: "relevance",
  })

  const supabase = createClient()

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, products])

  async function loadProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("featured", { ascending: false })

    if (error) {
      console.error("Error loading products:", error)
    } else {
      setProducts(data || [])
      const uniqueBrands = [...new Set(data?.map((p) => p.brand).filter(Boolean))] as string[]
      setBrands(uniqueBrands)
    }
    setLoading(false)
  }

  function applyFilters() {
    let filtered = [...products]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.category?.toLowerCase().includes(searchLower),
      )
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter((p) => filters.category.includes(p.category))
    }

    // Brand filter
    if (filters.brand.length > 0) {
      filtered = filtered.filter((p) => filters.brand.includes(p.brand))
    }

    // Price range filter
    filtered = filtered.filter((p) => {
      const price = p.discount_price || p.price
      return price >= filters.minPrice && price <= filters.maxPrice
    })

    // Sort
    switch (filters.sortBy) {
      case "price-asc":
        filtered.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price))
        break
      case "price-desc":
        filtered.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price))
        break
      case "popular":
        filtered.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
        break
      case "views":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case "relevance":
      default:
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return (b.sales_count || 0) - (a.sales_count || 0)
        })
    }

    setFilteredProducts(filtered)
  }

  function clearFilters() {
    setFilters({
      search: "",
      category: [],
      brand: [],
      minPrice: 0,
      maxPrice: 10000,
      sortBy: "relevance",
    })
  }

  const activeFiltersCount = filters.category.length + filters.brand.length + (filters.search ? 1 : 0)

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos, marcas ou categorias..."
            className="pl-10 h-11"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <div className="flex gap-2">
          <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
            <SelectTrigger className="w-[180px] h-11">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Mais Relevante</SelectItem>
              <SelectItem value="popular">Mais Vendidos</SelectItem>
              <SelectItem value="views">Em Alta</SelectItem>
              <SelectItem value="price-asc">Menor Preço</SelectItem>
              <SelectItem value="price-desc">Maior Preço</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 relative bg-transparent">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>

              <div className="space-y-6 py-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-3">Categorias</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${cat}`}
                          checked={filters.category.includes(cat)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters({ ...filters, category: [...filters.category, cat] })
                            } else {
                              setFilters({ ...filters, category: filters.category.filter((c) => c !== cat) })
                            }
                          }}
                        />
                        <Label htmlFor={`cat-${cat}`} className="text-sm font-normal cursor-pointer">
                          {cat}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                {brands.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Marcas</h3>
                    <div className="space-y-2">
                      {brands.map((brand) => (
                        <div key={brand} className="flex items-center space-x-2">
                          <Checkbox
                            id={`brand-${brand}`}
                            checked={filters.brand.includes(brand)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters({ ...filters, brand: [...filters.brand, brand] })
                              } else {
                                setFilters({ ...filters, brand: filters.brand.filter((b) => b !== brand) })
                              }
                            }}
                          />
                          <Label htmlFor={`brand-${brand}`} className="text-sm font-normal cursor-pointer">
                            {brand}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-3">Faixa de Preço</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="min-price" className="text-xs">
                        Mínimo
                      </Label>
                      <Input
                        id="min-price"
                        type="number"
                        min={0}
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-price" className="text-xs">
                        Máximo
                      </Label>
                      <Input
                        id="max-price"
                        type="number"
                        min={0}
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Busca: {filters.search}
              <button onClick={() => setFilters({ ...filters, search: "" })} className="ml-1 hover:text-foreground">
                ×
              </button>
            </Badge>
          )}
          {filters.category.map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1">
              {cat}
              <button
                onClick={() => setFilters({ ...filters, category: filters.category.filter((c) => c !== cat) })}
                className="ml-1 hover:text-foreground"
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.brand.map((brand) => (
            <Badge key={brand} variant="secondary" className="gap-1">
              {brand}
              <button
                onClick={() => setFilters({ ...filters, brand: filters.brand.filter((b) => b !== brand) })}
                className="ml-1 hover:text-foreground"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {loading ? "Carregando..." : `${filteredProducts.length} produto(s) encontrado(s)`}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-lg h-80" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
          <p className="text-sm text-muted-foreground mb-4">Tente ajustar os filtros ou fazer uma nova busca</p>
          <Button variant="outline" onClick={clearFilters}>
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

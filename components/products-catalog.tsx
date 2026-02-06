"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart } from "lucide-react"
import Image from "next/image"

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
  featured: boolean
}

export function ProductsCatalog() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8)

    if (data && data.length > 0) {
      setProducts(data)
    } else {
      // Fallback to mock data for testing
      const mockProducts = [
        {
          id: "43a956e5-dab5-498e-89c2-304beac09197",
          name: "Câmera de Segurança Intelbras VHL 1120 B",
          description: "Câmera Full HD 1080p com visão noturna, ideal para monitoramento residencial e comercial.",
          price: 299.99,
          discount_price: 249.99,
          image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
          category: "Câmeras de Segurança",
          brand: "Intelbras",
          stock: 15,
          featured: true
        },
        {
          id: "mock-2",
          name: "Alarme Residencial Intelbras AMT 3000",
          description: "Sistema de alarme completo com 8 zonas, teclado touch, sirene interna e externa.",
          price: 899.99,
          image_url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400",
          category: "Alarmes",
          brand: "Intelbras",
          stock: 8,
          featured: true
        }
      ]
      setProducts(mockProducts)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <section className="py-6">
        <h2 className="text-xl font-bold mb-4">Catálogo de Produtos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-40 mb-2"></div>
              <div className="bg-muted rounded h-4 mb-1"></div>
              <div className="bg-muted rounded h-4 w-2/3"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Catálogo de Produtos</h2>
        <a href="/products" className="text-sm text-primary hover:underline">
          Ver todos
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative w-full h-40 bg-muted">
                {product.image_url ? (
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {product.featured && (
                  <Badge className="absolute top-2 left-2" variant="default">
                    Destaque
                  </Badge>
                )}
                {product.discount_price && (
                  <Badge className="absolute top-2 right-2 bg-destructive">
                    {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                  </Badge>
                )}
              </div>
              <div className="p-3 space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <div className="flex flex-col gap-1">
                  {product.discount_price ? (
                    <>
                      <span className="text-xs text-muted-foreground line-through">R$ {product.price.toFixed(2)}</span>
                      <span className="text-lg font-bold text-primary">R$ {product.discount_price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold">R$ {product.price.toFixed(2)}</span>
                  )}
                </div>
                <Button size="sm" className="w-full" variant="default" onClick={() => router.push(`/products/${product.id}`)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Comprar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

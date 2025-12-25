"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

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
  featured?: boolean
  sales_count?: number
}

export function ProductCard({ product }: { product: Product }) {
  const finalPrice = product.discount_price || product.price
  const hasDiscount = product.discount_price && product.discount_price < product.price
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        <div className="relative aspect-square bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="text-4xl font-bold text-muted-foreground/30">{product.name.charAt(0)}</span>
            </div>
          )}

          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">-{discountPercent}%</Badge>
          )}

          {product.featured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-yellow-950">
              <TrendingUp className="h-3 w-3 mr-1" />
              Destaque
            </Badge>
          )}

          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs">
              Últimas {product.stock} unidades
            </Badge>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Esgotado</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-3 space-y-2">
          {product.brand && <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.brand}</p>}

          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="space-y-1">
            {hasDiscount && <p className="text-xs text-muted-foreground line-through">R$ {product.price.toFixed(2)}</p>}
            <p className="text-lg font-bold text-primary">R$ {finalPrice.toFixed(2)}</p>
          </div>

          {product.sales_count && product.sales_count > 0 && (
            <p className="text-xs text-muted-foreground">
              {product.sales_count} vendido{product.sales_count > 1 ? "s" : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

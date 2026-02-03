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
  const hasDiscount =
    typeof product.discount_price === "number" &&
    product.discount_price < product.price

  const finalPrice = hasDiscount ? product.discount_price! : product.price

  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0

  const priceFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 h-full hover:shadow-lg ${
        product.stock === 0 ? "opacity-70" : ""
      }`}
    >
      <Link
        href={`/products/${product.id}`}
        aria-disabled={product.stock === 0}
        className={product.stock === 0 ? "pointer-events-none block h-full" : "block h-full"}
      >
        <div className="relative aspect-square bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="text-4xl font-bold text-muted-foreground/30">
                {product.name.charAt(0)}
              </span>
            </div>
          )}

          {hasDiscount && (
            <Badge
              className="absolute top-2 left-2 bg-red-500 hover:bg-red-600"
              aria-label={`Desconto de ${discountPercent}%`}
            >
              -{discountPercent}%
            </Badge>
          )}

          {product.featured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-yellow-950">
              <TrendingUp className="h-3 w-3 mr-1" />
              Destaque
            </Badge>
          )}

          {product.stock > 0 && product.stock <= 5 && (
            <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs">
              Últimas {product.stock} unidades
            </Badge>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" aria-live="polite">
                Esgotado
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-3 space-y-2">
          {product.brand && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {product.brand}
            </p>
          )}

          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] transition-colors group-hover:text-primary">
            {product.name}
          </h3>

          <div className="space-y-1">
            {hasDiscount && (
              <p className="text-xs text-muted-foreground line-through">
                {priceFormatter.format(product.price)}
              </p>
            )}

            <p className="text-lg font-bold text-primary">
              {priceFormatter.format(finalPrice)}
            </p>
          </div>

          {typeof product.sales_count === "number" && product.sales_count > 0 && (
            <p className="text-xs text-muted-foreground">
              {product.sales_count} vendido{product.sales_count > 1 ? "s" : ""}
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}

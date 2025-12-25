"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product-card"
import { Star, ShieldCheck, Truck, CreditCard, Plus, Minus, Store, TrendingUp } from "lucide-react"
import { Label } from "@/components/ui/label"

type Product = {
  id: string
  name: string
  description: string
  price: number
  discount_price: number | null
  image_url: string
  category: string
  brand: string
  model: string
  stock: number
  warranty_months: number
  provider_id: string
  views: number
  sales_count: number
  featured: boolean
  shipping_weight: number
}

type Provider = {
  id: string
  company_name: string
  rating: number
  total_reviews: number
}

export function ProductDetails({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [zipCode, setZipCode] = useState("")
  const [shippingCalculated, setShippingCalculated] = useState(false)
  const [shippingPrice, setShippingPrice] = useState(0)
  const [deliveryDays, setDeliveryDays] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProduct()
  }, [productId])

  async function loadProduct() {
    setLoading(true)

    // Load product
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single()

    if (productError) {
      console.error("Error loading product:", productError)
      setLoading(false)
      return
    }

    setProduct(productData)

    // Increment views
    await supabase
      .from("products")
      .update({ views: (productData.views || 0) + 1 })
      .eq("id", productId)

    // Load provider if exists
    if (productData.provider_id) {
      const { data: providerData } = await supabase
        .from("service_providers")
        .select("id, company_name, rating, total_reviews")
        .eq("id", productData.provider_id)
        .single()

      if (providerData) {
        setProvider(providerData)
      }
    }

    // Load related products
    const { data: relatedData } = await supabase
      .from("products")
      .select("*")
      .eq("category", productData.category)
      .eq("is_active", true)
      .neq("id", productId)
      .limit(6)

    setRelatedProducts(relatedData || [])
    setLoading(false)
  }

  function calculateShipping() {
    if (zipCode.length === 8 && product) {
      // Simulated shipping calculation
      const basePrice = 15
      const weightFactor = (product.shipping_weight || 1) * 2
      const calculatedPrice = basePrice + weightFactor

      setShippingPrice(calculatedPrice)
      setDeliveryDays(Math.floor(Math.random() * 5) + 3) // 3-7 days
      setShippingCalculated(true)
    }
  }

  async function handleBuyNow() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    // Check if user has complete profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    const { data: paymentInfo } = await supabase
      .from("customer_payment_info")
      .select("*")
      .eq("customer_id", user.id)
      .single()

    if (!profile?.full_name || !profile?.phone || !paymentInfo?.is_complete) {
      alert("Complete seu perfil e informações de pagamento antes de comprar")
      router.push("/profile/settings")
      return
    }

    // Redirect to checkout
    router.push(`/products/${productId}/checkout?qty=${quantity}`)
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-6">Carregando...</div>
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-6">Produto não encontrado</div>
  }

  const finalPrice = product.discount_price || product.price
  const hasDiscount = product.discount_price && product.discount_price < product.price
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0
  const totalPrice = finalPrice * quantity

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Product Main Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {product.image_url ? (
              <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl font-bold text-muted-foreground/30">{product.name.charAt(0)}</span>
              </div>
            )}

            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">-{discountPercent}%</Badge>
            )}

            {product.featured && (
              <Badge className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-yellow-950">
                <TrendingUp className="h-3 w-3 mr-1" />
                Destaque
              </Badge>
            )}
          </div>

          {/* Additional badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              {product.warranty_months} meses de garantia
            </Badge>
            {product.stock > 0 && (
              <Badge variant="outline" className="gap-1">
                <Store className="h-3 w-3" />
                {product.stock} em estoque
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Brand */}
          <div>
            {product.brand && (
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">{product.brand}</p>
            )}
            <h1 className="text-3xl font-bold text-balance">{product.name}</h1>
            {product.model && <p className="text-muted-foreground mt-1">Modelo: {product.model}</p>}
          </div>

          {/* Provider */}
          {provider && (
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vendido por</p>
                  <p className="font-semibold">{provider.company_name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{provider.rating?.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({provider.total_reviews})</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price */}
          <Card>
            <CardContent className="p-6 space-y-2">
              {hasDiscount && (
                <p className="text-sm text-muted-foreground line-through">R$ {product.price.toFixed(2)}</p>
              )}
              <p className="text-4xl font-bold text-primary">R$ {finalPrice.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">em até 12x de R$ {(finalPrice / 12).toFixed(2)} sem juros</p>
            </CardContent>
          </Card>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label>Quantidade</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.min(product.stock, Number.parseInt(e.target.value) || 1)))
                }
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {product.stock} disponível{product.stock > 1 ? "is" : ""}
              </span>
            </div>
          </div>

          {/* Shipping Calculator */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Calcular Frete</h3>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite seu CEP"
                  value={zipCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "")
                    setZipCode(value)
                    setShippingCalculated(false)
                  }}
                  maxLength={8}
                  className="flex-1"
                />
                <Button onClick={calculateShipping} disabled={zipCode.length !== 8}>
                  Calcular
                </Button>
              </div>
              {shippingCalculated && (
                <div className="text-sm space-y-1">
                  <p className="text-foreground font-medium">Frete: R$ {shippingPrice.toFixed(2)}</p>
                  <p className="text-muted-foreground">Entrega em {deliveryDays} dias úteis</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Price */}
          {quantity > 1 && (
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-primary">R$ {totalPrice.toFixed(2)}</span>
            </div>
          )}

          {/* Buy Buttons */}
          <div className="space-y-3">
            <Button size="lg" className="w-full h-12 text-base" onClick={handleBuyNow} disabled={product.stock === 0}>
              {product.stock === 0 ? "Produto Esgotado" : "Comprar Agora"}
            </Button>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>Pagamento 100% seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="description">Descrição</TabsTrigger>
          <TabsTrigger value="specs">Especificações</TabsTrigger>
          <TabsTrigger value="shipping">Entrega</TabsTrigger>
          <TabsTrigger value="reviews">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-6 space-y-3">
              {product.brand && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marca:</span>
                  <span className="font-medium">{product.brand}</span>
                </div>
              )}
              {product.model && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modelo:</span>
                  <span className="font-medium">{product.model}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoria:</span>
                <span className="font-medium">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Garantia:</span>
                <span className="font-medium">{product.warranty_months} meses</span>
              </div>
              {product.shipping_weight > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="font-medium">{product.shipping_weight} kg</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Frete Calculado</h3>
                  <p className="text-sm text-muted-foreground">
                    O valor do frete e prazo de entrega variam de acordo com seu CEP.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Compra Protegida</h3>
                  <p className="text-sm text-muted-foreground">
                    Seu dinheiro está protegido. Receba o produto ou seu dinheiro de volta.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProductCard } from "@/components/product-card"
import {
  Star,
  ShieldCheck,
  Truck,
  CreditCard,
  Plus,
  Minus,
  Store,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Heart,
  Share2,
  CheckCircle,
  AlertCircle,
  Tag,
  Award,
  ThumbsUp,
  Flag,
  Eye,
  ShoppingCart
} from "lucide-react"
import { toast } from "sonner"
import { formatCEP } from "@/lib/viacep"

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
  created_at: string
}

type Provider = {
  id: string
  company_name: string
  rating: number
  total_reviews: number
  description: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zip_code: string
  logo_url: string | null
  verified: boolean
  total_sales: number
  member_since: string
}

type Review = {
  id: string
  user_id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
  helpful: number
}

type ProductImage = {
  id: string
  url: string
  alt: string
}

export function ProductDetails({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [zipCode, setZipCode] = useState("")
  const [shippingCalculated, setShippingCalculated] = useState(false)
  const [shippingPrice, setShippingPrice] = useState(0)
  const [deliveryDays, setDeliveryDays] = useState(0)
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [selectedImage, setSelectedImage] = useState(0)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (productId && productId !== "undefined") {
      loadProduct()
    }
  }, [productId])

  async function loadProduct() {
    setLoading(true)

    // Validate productId exists
    if (!productId || productId === "undefined") {
      console.error("Invalid product ID format:", { productId, type: typeof productId, length: productId?.length })
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Query product by ID (without is_active filter to allow loading inactive products in edit mode)
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)

      if (productError) {
        console.error("Database error loading product:", productError)
        setLoading(false)
        return
      }

      if (!productData || productData.length === 0) {
        console.warn("Product not found with ID:", productId)
        setLoading(false)
        return
      }

      const productRecord = productData[0]
      
      // Validate product has required fields
      if (!productRecord.id || !productRecord.name) {
        console.error("Product data incomplete")
        setLoading(false)
        return
      }

      setProduct(productRecord)

      // Set product images
      const images: ProductImage[] = [
        {
          id: "main",
          url: productRecord.image_url || "/placeholder.svg",
          alt: productRecord.name || "Product Image"
        }
      ]
      setProductImages(images)

      // Update views counter asynchronously (non-blocking)
      supabase
        .from("products")
        .update({ views: (productRecord.views || 0) + 1 })
        .eq("id", productId)
        .then()
        .catch((err) => console.warn("Could not update views:", err))

      // Load provider data in parallel
      if (productRecord.provider_id) {
        supabase
          .from("service_providers")
          .select("*")
          .eq("id", productRecord.provider_id)
          .single()
          .then(({ data: providerData }) => {
            if (providerData) setProvider(providerData)
          })
          .catch((err) => console.warn("Could not load provider:", err))
      }

      // Load reviews in parallel
      supabase
        .from("product_reviews")
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          user_id,
          profiles:user_id (
            full_name
          )
        `
        )
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .then(({ data: reviewsData }) => {
          if (reviewsData && reviewsData.length > 0) {
            const formattedReviews: Review[] = reviewsData.map((review) => ({
              id: review.id,
              user_id: review.user_id,
              user_name: review.profiles?.full_name || "Usuário Anônimo",
              rating: review.rating,
              comment: review.comment,
              created_at: review.created_at,
              helpful: 0
            }))
            setReviews(formattedReviews)
          }
        })
        .catch((err) => console.warn("Could not load reviews:", err))

      // Load related products in parallel
      supabase
        .from("products")
        .select("*")
        .eq("category", productRecord.category)
        .neq("id", productId)
        .limit(8)
        .then(({ data: relatedData }) => {
          if (relatedData) setRelatedProducts(relatedData)
        })
        .catch((err) => console.warn("Could not load related products:", err))
    } catch (error) {
      console.error("Unexpected error loading product:", error)
    } finally {
      setLoading(false)
    }
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

  async function applyCoupon() {
    if (!couponCode.trim()) {
      toast.error("Digite um código de cupom válido")
      return
    }

    // Simulate coupon validation
    const validCoupons = {
      "DESCONTO10": 0.1,
      "NOW15": 0.15,
      "PRIMEIRA20": 0.2
    }

    const discount = validCoupons[couponCode.toUpperCase() as keyof typeof validCoupons]
    if (discount) {
      setCouponDiscount(discount)
      toast.success(`Cupom aplicado! ${discount * 100}% de desconto`)
    } else {
      toast.error("Cupom inválido ou expirado")
    }
  }

  async function submitReview() {
    if (!newReview.comment.trim()) {
      toast.error("Escreva um comentário para sua avaliação")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Faça login para avaliar o produto")
      return
    }

    setIsSubmittingReview(true)
    try {
      const { error } = await supabase
        .from("product_reviews")
        .insert({
          product_id: productId,
          user_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment
        })

      if (error) throw error

      toast.success("Avaliação enviada com sucesso!")
      setNewReview({ rating: 5, comment: "" })
      
      // Reload reviews after submission
      const { data: updatedReviews } = await supabase
        .from("product_reviews")
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          user_id,
          profiles:user_id (
            full_name
          )
        `
        )
        .eq("product_id", productId)
        .order("created_at", { ascending: false })

      if (updatedReviews) {
        const formattedReviews: Review[] = updatedReviews.map((review) => ({
          id: review.id,
          user_id: review.user_id,
          user_name: review.profiles?.full_name || "Usuário Anônimo",
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          helpful: 0
        }))
        setReviews(formattedReviews)
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Erro ao enviar avaliação")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  async function handleBuyNow() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.full_name || !profile?.phone) {
      toast.error("Complete seu perfil antes de comprar")
      router.push("/profile/settings")
      return
    }

    // Redirect to checkout
    const params = new URLSearchParams({
      qty: quantity.toString(),
      coupon: couponCode
    })
    router.push(`/products/${productId}/checkout?${params.toString()}`)
  }

  async function toggleFavorite() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Faça login para favoritar produtos")
      return
    }

    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos")
  }

  function shareProduct() {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Confira este produto: ${product?.name}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copiado para a área de transferência")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-muted animate-pulse rounded-lg" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-16 h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-12 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Produto não encontrado</h1>
        <p className="text-muted-foreground mb-4">O produto que você está procurando pode ter sido removido ou não existe.</p>
        <Button onClick={() => router.push("/products")}>Voltar ao catálogo</Button>
      </div>
    )
  }

  const finalPrice = product.discount_price || product.price
  const hasDiscount = product.discount_price && product.discount_price < product.price
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0
  const couponDiscountAmount = finalPrice * couponDiscount
  const discountedPrice = finalPrice - couponDiscountAmount
  const totalPrice = discountedPrice * quantity + (shippingCalculated ? shippingPrice : 0)
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/products" className="hover:text-foreground">Produtos</Link>
            <span className="mx-2">›</span>
            <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground">{product.category}</Link>
            <span className="mx-2">›</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Images and Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={productImages[selectedImage]?.url || "/placeholder.svg"}
                      alt={productImages[selectedImage]?.alt || product.name}
                      fill
                      className="object-cover"
                    />
                    {hasDiscount && (
                      <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white">
                        -{discountPercent}%
                      </Badge>
                    )}
                    {product.featured && (
                      <Badge className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-yellow-950">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                  </div>

                  {/* Thumbnail Images */}
                  {productImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {productImages.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                            selectedImage === index ? "border-primary" : "border-muted"
                          }`}
                        >
                          <Image
                            src={image.url}
                            alt={image.alt}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Title and Actions */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-balance mb-2">{product.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {product.views} visualizações
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4" />
                    {product.sales_count} vendas
                  </div>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {averageRating.toFixed(1)} ({reviews.length} avaliações)
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="icon" onClick={toggleFavorite}>
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={shareProduct}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Product Details Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="description">Descrição</TabsTrigger>
                <TabsTrigger value="specs">Especificações</TabsTrigger>
                <TabsTrigger value="reviews">Avaliações ({reviews.length})</TabsTrigger>
                <TabsTrigger value="shipping">Entrega</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4 mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specs" className="space-y-4 mt-6">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {product.brand && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Marca:</span>
                          <span className="font-medium">{product.brand}</span>
                        </div>
                      )}
                      {product.model && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Modelo:</span>
                          <span className="font-medium">{product.model}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Categoria:</span>
                        <span className="font-medium">{product.category}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Garantia:</span>
                        <span className="font-medium">{product.warranty_months} meses</span>
                      </div>
                      {product.shipping_weight > 0 && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Peso:</span>
                          <span className="font-medium">{product.shipping_weight} kg</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Estoque:</span>
                        <span className="font-medium">{product.stock} unidades</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Avaliações dos Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Rating Summary */}
                    {reviews.length > 0 && (
                      <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
                        <div className="text-center">
                          <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= averageRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground">{reviews.length} avaliações</div>
                        </div>
                        <div className="flex-1">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = reviews.filter(r => r.rating === rating).length
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                            return (
                              <div key={rating} className="flex items-center gap-2 text-sm mb-1">
                                <span className="w-3">{rating}</span>
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <div className="flex-1 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-yellow-400 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="w-8 text-right">{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Write Review */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold mb-4">Escreva uma avaliação</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Sua avaliação</Label>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= newReview.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground hover:text-yellow-400"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="review-comment">Seu comentário</Label>
                          <Textarea
                            id="review-comment"
                            placeholder="Conte sua experiência com este produto..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                            rows={4}
                          />
                        </div>
                        <Button
                          onClick={submitReview}
                          disabled={isSubmittingReview}
                          className="w-full"
                        >
                          {isSubmittingReview ? "Enviando..." : "Enviar Avaliação"}
                        </Button>
                      </div>
                    </div>

                    {/* Reviews List */}
                    {reviews.length > 0 && (
                      <div className="border-t pt-6 space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{review.user_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{review.user_name}</div>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-3 w-3 ${
                                          star <= review.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-muted-foreground"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Button variant="ghost" size="sm">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Útil ({review.helpful})
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Flag className="h-3 w-3 mr-1" />
                                Denunciar
                              </Button>
                            </div>
                          </div>
                        ))}
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
                        <h3 className="font-semibold mb-1">Frete e Entrega</h3>
                        <p className="text-sm text-muted-foreground">
                          Calculamos o frete baseado no seu CEP e peso do produto.
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
                    <Separator />
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Garantia</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.warranty_months} meses de garantia contra defeitos de fabricação.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Price, Purchase, Seller Info */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                {/* Price */}
                <div className="space-y-2">
                  {hasDiscount && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground line-through">
                        R$ {product.price.toFixed(2)}
                      </span>
                      <Badge variant="destructive">-{discountPercent}%</Badge>
                    </div>
                  )}
                  <div className="text-3xl font-bold text-primary">
                    R$ {discountedPrice.toFixed(2)}
                  </div>
                  {couponDiscount > 0 && (
                    <div className="text-sm text-green-600">
                      Cupom aplicado: -R$ {couponDiscountAmount.toFixed(2)}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    em até 12x de R$ {(discountedPrice / 12).toFixed(2)} sem juros
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  {product.stock > 0 ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">
                        {product.stock} {product.stock === 1 ? "unidade" : "unidades"} em estoque
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Produto esgotado</span>
                    </>
                  )}
                </div>

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
                  </div>
                </div>

                {/* Coupon */}
                <div className="space-y-2">
                  <Label htmlFor="coupon">Cupom de desconto</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      placeholder="Digite o código"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button variant="outline" onClick={applyCoupon}>
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Shipping Calculator */}
                <div className="space-y-2">
                  <Label htmlFor="zipcode">Calcular frete</Label>
                  <div className="flex gap-2">
                    <Input
                      id="zipcode"
                      placeholder="Digite seu CEP"
                      value={zipCode}
                      onChange={(e) => {
                        const formatted = formatCEP(e.target.value)
                        setZipCode(formatted)
                        setShippingCalculated(false)
                      }}
                      maxLength={9}
                    />
                    <Button onClick={calculateShipping} disabled={zipCode.length !== 8}>
                      Calcular
                    </Button>
                  </div>
                  {shippingCalculated && (
                    <div className="text-sm space-y-1 p-3 bg-muted/50 rounded">
                      <div className="flex justify-between">
                        <span>Frete:</span>
                        <span>R$ {shippingPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Prazo:</span>
                        <span>{deliveryDays} dias úteis</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total */}
                {quantity > 1 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">R$ {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Buy Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    size="lg"
                    className="w-full h-12 text-base"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? "Produto Esgotado" : "Comprar Agora"}
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Pagamento 100% seguro</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Formas de pagamento</h3>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1 p-2 border rounded">
                      <CreditCard className="h-3 w-3" />
                      <span>Cartão</span>
                    </div>
                    <div className="flex items-center gap-1 p-2 border rounded">
                      <span>💳</span>
                      <span>Boleto</span>
                    </div>
                    <div className="flex items-center gap-1 p-2 border rounded">
                      <span>🏦</span>
                      <span>PIX</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            {provider && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Vendedor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={provider.logo_url || undefined} />
                      <AvatarFallback>{provider.company_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{provider.company_name}</h3>
                        {provider.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {provider.rating?.toFixed(1)} ({provider.total_reviews} avaliações)
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Membro desde {new Date(provider.member_since).getFullYear()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.city}, {provider.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.total_sales} vendas realizadas</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Conversar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>

                  {provider.description && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

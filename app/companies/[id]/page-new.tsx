"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import {
  Star,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  Share2,
  Heart,
  MessageCircle,
  Clock,
  CheckCircle2,
  Loader2,
  Tag,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"

interface CompanyData {
  id: string
  company_name: string
  description: string
  rating: number
  total_reviews: number
  address: string
  city: string
  state: string
  zip_code: string
  phone: string
  email: string
  logo: string
  is_active: boolean
  created_at: string
}

interface Product {
  id: string
  product_name: string
  description: string
  price: number
  image_url: string
  stock: number
}

interface ServiceRequest {
  id: string
  title: string
  description: string
  budget: number
  status: string
  category: string
}

interface Review {
  id: string
  rating: number
  comment: string
  author_name: string
  created_at: string
}

export default function CompanyPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState("services")
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<ServiceRequest[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const companyId = params.id as string

  useEffect(() => {
    loadCompanyData()
  }, [companyId])

  async function loadCompanyData() {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      // Fetch company data
      const { data: companyData, error: companyError } = await supabase
        .from("service_providers")
        .select("*")
        .eq("id", companyId)
        .single()

      if (companyError) {
        console.error("Erro ao carregar empresa:", companyError)
        setError("Empresa não encontrada")
        setLoading(false)
        return
      }

      if (!companyData) {
        setError("Empresa não encontrada")
        setLoading(false)
        return
      }

      setCompany(companyData)

      // Fetch products from this company
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("company_id", companyId)
        .limit(12)

      if (productsData && !productsError) {
        setProducts(productsData)
      }

      // Fetch custom services from service_requests
      const { data: servicesData, error: servicesError } = await supabase
        .from("service_requests")
        .select("*")
        .eq("provider_id", companyId)
        .eq("status", "completed")
        .limit(12)

      if (servicesData && !servicesError) {
        setServices(servicesData)
      }

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("provider_id", companyId)
        .order("created_at", { ascending: false })
        .limit(20)

      if (reviewsData && !reviewsError) {
        setReviews(reviewsData)
      }

      setLoading(false)
    } catch (err) {
      console.error("Erro ao carregar dados da empresa:", err)
      setError("Erro ao carregar dados da empresa")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Carregando perfil da empresa...</p>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Empresa não encontrada</h1>
          <p className="text-muted-foreground">{error || "A empresa que você procura não existe ou foi removida"}</p>
          <Button onClick={() => router.back()}>Voltar</Button>
        </div>
      </div>
    )
  }

  const handleContact = () => {
    router.push(
      `/contact?company=${company.id}&name=${company.company_name}&phone=${company.phone}`
    )
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: company.company_name,
        text: company.description,
        url: window.location.href,
      })
    } else {
      toast({
        title: "Link copiado!",
        description: "O link da empresa foi copiado para a área de transferência",
      })
    }
  }

  const defaultBanner = `https://api.dicebear.com/7.x/shapes/svg?seed=${company.id}&backgroundColor=3b82f6`
  const defaultLogo = `https://api.dicebear.com/7.x/initials/svg?seed=${company.company_name}`

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header com botões flutuantes */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b flex items-center justify-between px-4 py-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFavorite ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Banner e Logo */}
      <div className="relative">
        <div className="relative w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5">
          <Image
            src={defaultBanner}
            alt={company.company_name}
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute -bottom-10 left-4 w-24 h-24 rounded-lg border-4 border-background overflow-hidden bg-card">
          <Image
            src={company.logo || defaultLogo}
            alt={company.company_name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = defaultLogo
            }}
          />
        </div>
      </div>

      {/* Informações da Empresa */}
      <div className="px-4 pt-16 pb-4">
        <div className="space-y-3">
          {/* Nome e Badge */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {company.company_name}
                {company.is_active && (
                  <CheckCircle2 className="h-6 w-6 text-primary" title="Verificado" />
                )}
              </h1>
              <p className="text-muted-foreground text-sm">{company.description}</p>
            </div>
          </div>

          {/* Rating e Reviews */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950 px-3 py-1 rounded-lg">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{company.rating?.toFixed(1) || "N/A"}</span>
              <span className="text-sm text-muted-foreground">
                ({company.total_reviews || 0} avaliações)
              </span>
            </div>
          </div>

          {/* Informações de contato */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {company.address}, {company.city} - {company.state}
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a href={`tel:${company.phone}`} className="hover:text-primary">
                {company.phone}
              </a>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${company.email}`} className="hover:text-primary">
                {company.email}
              </a>
            </div>
          </div>

          {/* Botão de Contato */}
          <Button onClick={handleContact} className="w-full mt-4">
            <MessageCircle className="h-4 w-4 mr-2" />
            Entrar em Contato
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 px-4 bg-transparent border-b rounded-none h-auto gap-0">
          <TabsTrigger
            value="services"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Serviços
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Produtos
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Avaliações
          </TabsTrigger>
        </TabsList>

        {/* Serviços */}
        <TabsContent value="services" className="px-4 py-4 space-y-3">
          {services.length > 0 ? (
            services.map((service) => (
              <div
                key={service.id}
                className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{service.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  </div>
                  {service.budget && (
                    <span className="text-primary font-semibold text-sm whitespace-nowrap">
                      {service.budget > 0 ? `R$ ${service.budget.toLocaleString("pt-BR")}` : "Consulte"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground capitalize">{service.category}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum serviço registrado</p>
            </div>
          )}
        </TabsContent>

        {/* Produtos */}
        <TabsContent value="products" className="px-4 py-4">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="relative w-full h-32 bg-muted">
                    <Image
                      src={product.image_url || defaultLogo}
                      alt={product.product_name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = defaultLogo
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold line-clamp-2">
                      {product.product_name}
                    </h4>
                    <p className="text-primary font-semibold text-sm mt-2">
                      R$ {product.price?.toFixed(2) || "0,00"}
                    </p>
                    {product.stock > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {product.stock} em estoque
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum produto disponível</p>
            </div>
          )}
        </TabsContent>

        {/* Avaliações */}
        <TabsContent value="reviews" className="px-4 py-4 space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{review.author_name || "Anônimo"}</h4>
                  <span className="text-xs text-muted-foreground">
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString("pt-BR")
                      : ""}
                  </span>
                </div>
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < (review.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma avaliação ainda</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import {
  Star,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  Share2,
  Heart,
  MessageCircle,
  Zap,
  Tag,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CompanyDetailClientProps {
  company: any
  isMocked?: boolean
}

export function CompanyDetailClient({ company, isMocked = false }: CompanyDetailClientProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState("services")

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
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copiado para a área de transferência!")
    }
  }

  // Generate gradient banner if not available
  const bannerUrl = company.banner || `https://api.dicebear.com/7.x/shapes/svg?seed=${company.id}&backgroundColor=3b82f6`
  const logoUrl = company.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${company.company_name}`

  const products = company.products || []
  const services = company.services || []
  const reviews = company.reviews || []

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

      {/* Mocked indicator */}
      {isMocked && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800">
          Dados de exemplo
        </div>
      )}

      {/* Banner e Logo */}
      <div className="relative">
        <div className="relative w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5">
          <Image
            src={bannerUrl}
            alt={company.company_name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute -bottom-10 left-4 w-24 h-24 rounded-lg border-4 border-background overflow-hidden bg-card">
          <Image
            src={logoUrl}
            alt={company.company_name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
            priority
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
                {(company.verified || company.is_active) && (
                  <CheckCircle2 className="h-6 w-6 text-primary" title="Verificado" />
                )}
              </h1>
              <p className="text-muted-foreground text-sm line-clamp-2">{company.description}</p>
            </div>
          </div>

          {/* Rating e Reviews */}
          {company.rating !== undefined && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950 px-3 py-1 rounded-lg">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">
                  {typeof company.rating === "number" ? company.rating.toFixed(1) : company.rating}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({company.total_reviews || 0} avaliações)
                </span>
              </div>
            </div>
          )}

          {/* Informações de Contato */}
          <div className="space-y-2 text-sm">
            {company.address && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>
                  {company.address}, {company.city} - {company.state}
                </span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href={`tel:${company.phone}`} className="hover:text-primary">
                  {company.phone}
                </a>
              </div>
            )}
            {company.email && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href={`mailto:${company.email}`} className="hover:text-primary">
                  {company.email}
                </a>
              </div>
            )}
          </div>

          {/* Especialidades/Tags */}
          {company.specialties && company.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {company.specialties.map((specialty: string) => (
                <span
                  key={specialty}
                  className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          {/* Botão de Contato */}
          <Button onClick={handleContact} className="w-full mt-4">
            <MessageCircle className="h-4 w-4 mr-2" />
            Entrar em Contato
          </Button>
        </div>
      </div>

      {/* Sobre a Empresa */}
      {company.about && (
        <div className="px-4 py-4 border-t">
          <h3 className="font-semibold mb-2">Sobre</h3>
          <p className="text-sm text-muted-foreground">{company.about}</p>
        </div>
      )}

      {/* Tabs */}
      {(services.length > 0 || products.length > 0 || reviews.length > 0) && (
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
              services.map((service: any) => (
                <div
                  key={service.id}
                  className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{service.title || service.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                    {service.price && (
                      <span className="text-primary font-semibold text-sm whitespace-nowrap">
                        {typeof service.price === "number"
                          ? `R$ ${service.price.toLocaleString("pt-BR")}`
                          : service.price}
                      </span>
                    )}
                  </div>
                  {service.category && (
                    <div className="flex items-center gap-2 mt-3 text-xs">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground capitalize">{service.category}</span>
                    </div>
                  )}
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
                {products.map((product: any) => (
                  <div
                    key={product.id}
                    className="border rounded-lg overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="relative w-full h-32 bg-muted">
                      {product.image_url || product.image ? (
                        <Image
                          src={product.image_url || product.image}
                          alt={product.name || product.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Tag className="h-8 w-8 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-semibold line-clamp-2">
                        {product.name || product.product_name}
                      </h4>
                      {product.price && (
                        <p className="text-primary font-semibold text-sm mt-2">
                          R$ {typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                        </p>
                      )}
                      {product.stock !== undefined && product.stock > 0 && (
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
              reviews.map((review: any) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">
                      {review.author_name || review.author || "Anônimo"}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString("pt-BR")
                        : review.date || ""}
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
      )}
    </div>
  )
}

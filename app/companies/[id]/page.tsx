"use client"

import { useState } from "react"
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
  Shield,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dados mockados - será substituído por API
const companiesData: Record<string, any> = {
  "1": {
    id: "1",
    company_name: "SecureVision Segurança",
    description: "Especializada em sistemas CFTV e monitoramento 24h",
    rating: 4.8,
    total_reviews: 145,
    address: "Av. Paulista, 1000",
    city: "São Paulo",
    state: "SP",
    zip_code: "01311-100",
    phone: "(11) 99999-0001",
    email: "contato@securevision.com.br",
    logo: "https://via.placeholder.com/600x400?text=SecureVision",
    banner: "https://via.placeholder.com/1200x300?text=SecureVision+Banner",
    responseTime: "15 min",
    specialties: ["CFTV", "Monitoramento", "Instalação"],
    verified: true,
    about: "A SecureVision é uma empresa com mais de 10 anos de experiência em sistemas de segurança eletrônica. Oferecemos soluções completas em CFTV, monitoramento 24h e integração com sistemas inteligentes.",
    services: [
      {
        id: "1",
        name: "Instalação de CFTV",
        description: "Instalação completa de câmeras e sistema de monitoramento",
        price: "A partir de R$ 500",
        duration: "4-8 horas",
      },
      {
        id: "2",
        name: "Monitoramento 24h",
        description: "Serviço de monitoramento contínuo com central de segurança",
        price: "R$ 99/mês",
        duration: "Contínuo",
      },
      {
        id: "3",
        name: "Manutenção Preventiva",
        description: "Limpeza, ajuste de câmeras e verificação do sistema",
        price: "R$ 200",
        duration: "2 horas",
      },
    ],
    reviews: [
      {
        id: "1",
        author: "João Silva",
        rating: 5,
        date: "25/01/2026",
        comment:
          "Excelente atendimento! Instalaram tudo muito rápido e o sistema funciona perfeitamente.",
        avatar: "https://via.placeholder.com/40x40?text=JS",
      },
      {
        id: "2",
        author: "Maria Santos",
        rating: 5,
        date: "20/01/2026",
        comment:
          "Recomendo muito! Profissionais muito atenciosos e experientes.",
        avatar: "https://via.placeholder.com/40x40?text=MS",
      },
      {
        id: "3",
        author: "Pedro Oliveira",
        rating: 4,
        date: "15/01/2026",
        comment: "Ótimo produto, chegou no tempo combinado.",
        avatar: "https://via.placeholder.com/40x40?text=PO",
      },
    ],
    products: [
      {
        id: "1",
        name: "Câmera IP 4K",
        price: "R$ 450",
        image: "https://via.placeholder.com/150x150?text=Camera+4K",
      },
      {
        id: "2",
        name: "DVR 8 Canais",
        price: "R$ 800",
        image: "https://via.placeholder.com/150x150?text=DVR+8CH",
      },
      {
        id: "3",
        name: "Cabo UTP 100m",
        price: "R$ 120",
        image: "https://via.placeholder.com/150x150?text=Cabo+UTP",
      },
    ],
  },
  "2": {
    id: "2",
    company_name: "ProTech Alarmes",
    description: "Sistemas de alarme inteligentes para residências",
    rating: 4.6,
    total_reviews: 98,
    address: "Rua Augusta, 500",
    city: "São Paulo",
    state: "SP",
    zip_code: "01305-100",
    phone: "(11) 99999-0002",
    email: "contato@protechaalarmes.com.br",
    logo: "https://via.placeholder.com/600x400?text=ProTech",
    banner: "https://via.placeholder.com/1200x300?text=ProTech+Banner",
    responseTime: "20 min",
    specialties: ["Alarmes", "Automação Residencial"],
    verified: true,
    about: "ProTech Alarmes oferece sistemas de segurança inteligentes com tecnologia de ponta e monitoramento remoto via aplicativo.",
    services: [
      {
        id: "1",
        name: "Instalação de Alarme",
        description: "Instalação completa de sistema de alarme",
        price: "A partir de R$ 400",
        duration: "3-5 horas",
      },
      {
        id: "2",
        name: "Monitoramento",
        description: "Serviço de monitoramento 24h com resposta rápida",
        price: "R$ 79/mês",
        duration: "Contínuo",
      },
    ],
    reviews: [
      {
        id: "1",
        author: "Ana Costa",
        rating: 5,
        date: "23/01/2026",
        comment: "Sistema muito bom, app funciona perfeitamente!",
        avatar: "https://via.placeholder.com/40x40?text=AC",
      },
    ],
    products: [
      {
        id: "1",
        name: "Alarme WiFi Smart",
        price: "R$ 600",
        image: "https://via.placeholder.com/150x150?text=Alarme+WiFi",
      },
    ],
  },
  "3": {
    id: "3",
    company_name: "AutoHome Inteligente",
    description: "Soluções completas de automação residencial e predial",
    rating: 4.9,
    total_reviews: 210,
    address: "Av. Berrini, 2000",
    city: "São Paulo",
    state: "SP",
    zip_code: "04571-200",
    phone: "(11) 99999-0003",
    email: "contato@autohome.com.br",
    logo: "https://via.placeholder.com/600x400?text=AutoHome",
    banner: "https://via.placeholder.com/1200x300?text=AutoHome+Banner",
    responseTime: "10 min",
    specialties: ["Automação", "Controle de Acesso", "Iluminação"],
    verified: true,
    about: "Lider em soluções de automação residencial com mais de 15 anos no mercado.",
    services: [
      {
        id: "1",
        name: "Projeto de Automação",
        description: "Consultoria e projeto personalizado",
        price: "R$ 300",
        duration: "2 horas",
      },
      {
        id: "2",
        name: "Instalação Completa",
        description: "Instalação de automação residencial",
        price: "A partir de R$ 2000",
        duration: "2-3 dias",
      },
    ],
    reviews: [],
    products: [],
  },
}

export default function CompanyPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState("services")

  const companyId = params.id as string
  const company = companiesData[companyId]

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Empresa não encontrada</h1>
          <Button onClick={() => router.back()}>Voltar</Button>
        </div>
      </div>
    )
  }

  const handleContact = () => {
    router.push(`/contact?company=${company.id}&name=${company.company_name}&phone=${company.phone}`)
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
            src={company.banner}
            alt={company.company_name}
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute -bottom-10 left-4 w-24 h-24 rounded-lg border-4 border-background overflow-hidden bg-card">
          <Image
            src={company.logo}
            alt={company.company_name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
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
                {company.verified && (
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
              <span className="font-semibold">{company.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({company.total_reviews} avaliações)
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
              <Clock className="h-4 w-4" />
              <span>Tempo de resposta: {company.responseTime}</span>
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

          {/* Especialidades */}
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

          {/* Botão de Contato */}
          <Button onClick={handleContact} className="w-full mt-4">
            <MessageCircle className="h-4 w-4 mr-2" />
            Entrar em Contato
          </Button>
        </div>
      </div>

      {/* Sobre a Empresa */}
      <div className="px-4 py-4 border-t">
        <h3 className="font-semibold mb-2">Sobre</h3>
        <p className="text-sm text-muted-foreground">{company.about}</p>
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
          {company.services.length > 0 ? (
            company.services.map((service: any) => (
              <div
                key={service.id}
                className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
              >
                <h4 className="font-semibold">{service.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-primary font-semibold">{service.price}</span>
                  <span className="text-muted-foreground">{service.duration}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum serviço registrado</p>
            </div>
          )}
        </TabsContent>

        {/* Produtos */}
        <TabsContent value="products" className="px-4 py-4">
          {company.products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {company.products.map((product: any) => (
                <div
                  key={product.id}
                  className="border rounded-lg overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="relative w-full h-24 bg-muted">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <h4 className="text-sm font-semibold line-clamp-2">
                      {product.name}
                    </h4>
                    <p className="text-primary font-semibold text-sm mt-1">
                      {product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum produto disponível</p>
            </div>
          )}
        </TabsContent>

        {/* Avaliações */}
        <TabsContent value="reviews" className="px-4 py-4 space-y-4">
          {company.reviews.length > 0 ? (
            company.reviews.map((review: any) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <Image
                    src={review.avatar}
                    alt={review.author}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{review.author}</h4>
                      <span className="text-xs text-muted-foreground">
                        {review.date}
                      </span>
                    </div>
                    <div className="flex gap-1 my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma avaliação ainda</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

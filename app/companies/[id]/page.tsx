import { notFound } from "next/navigation"
import Image from "next/image"
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
  AlertCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { CompanyDetailClient } from "@/components/company-detail-client"

interface CompanyPageProps {
  params: Promise<{
    id: string
  }>
}

// Dados mockados como fallback - será substituído por API
const companiesDataFallback: Record<string, any> = {
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

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id: companyId } = await params

  if (!companyId || companyId === "undefined") {
    notFound()
  }

  try {
    const supabase = await createClient()

    // Load company data
    const { data: company, error: companyError } = await supabase
      .from("service_providers")
      .select("*")
      .eq("id", companyId)
      .maybeSingle()

    if (companyError) {
      console.error("Error loading company:", companyError)
      notFound()
    }

    if (!company) {
      // Try fallback mockado data
      const fallbackData = companiesDataFallback[companyId]
      if (fallbackData) {
        return (
          <CompanyDetailClient 
            company={fallbackData} 
            isMocked={true}
          />
        )
      }
      notFound()
    }

    // Load related data in parallel
    const [
      { data: products = [] },
      { data: services = [] },
      { data: reviews = [] },
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id, name:product_name, description, price, image_url, stock")
        .eq("provider_id", companyId)
        .limit(12),
      supabase
        .from("service_requests")
        .select("id, title, description, status, category")
        .eq("provider_id", companyId)
        .eq("status", "completed")
        .limit(12),
      supabase
        .from("reviews")
        .select("id, rating, comment, author_name, created_at")
        .eq("provider_id", companyId)
        .order("created_at", { ascending: false })
        .limit(20),
    ])

    const enrichedCompany = {
      ...company,
      products: products || [],
      services: services || [],
      reviews: reviews || [],
    }

    return <CompanyDetailClient company={enrichedCompany} isMocked={false} />
  } catch (error) {
    console.error("Unexpected error loading company:", error)
    notFound()
  }
}

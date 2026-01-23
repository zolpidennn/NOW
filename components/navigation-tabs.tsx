"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import {
  Camera,
  BellIcon,
  Zap,
  Lock,
  Wifi,
  Shield,
  Home,
  Building2,
  CheckCircle2,
  BadgeCheck,
  Store,
} from "lucide-react"

const tabs = [
  { id: "inicio", label: "Início" },
  { id: "servicos", label: "Serviços" },
  { id: "empresas", label: "Empresas" },
  { id: "promocoes", label: "Produtos" },
]

const services = [
  { icon: Camera, label: "CFTV", slug: "cftv", description: "Sistemas de câmeras e monitoramento" },
  { icon: BellIcon, label: "Alarmes", slug: "alarmes", description: "Alarmes residenciais e comerciais" },
  { icon: Zap, label: "Automatização", slug: "automatizacao", description: "Automação residencial e predial" },
  { icon: Lock, label: "Controle de Acesso", slug: "controle-de-acesso", description: "Fechaduras e controles inteligentes" },
  { icon: Wifi, label: "Cerca Elétrica", slug: "cerca-eletrica", description: "Instalação e manutenção" },
  { icon: Shield, label: "Interfone", slug: "interfone", description: "Interfones e videoporteiros" },
  { icon: Home, label: "Residencial", slug: "residencial", description: "Soluções para sua casa" },
  { icon: Building2, label: "Empresarial", slug: "empresarial", description: "Soluções corporativas" },
]

export function NavigationTabs() {
  const [activeTab, setActiveTab] = useState("inicio")
  const [showServicesSheet, setShowServicesSheet] = useState(false)
  const [showCompaniesSheet, setShowCompaniesSheet] = useState(false)
  const [showPromotionsSheet, setShowPromotionsSheet] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const router = useRouter()

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab]
    if (activeTabElement && scrollRef.current) {
      const scrollContainer = scrollRef.current
      const tabLeft = activeTabElement.offsetLeft
      const tabWidth = activeTabElement.offsetWidth
      const containerWidth = scrollContainer.offsetWidth
      const scrollPosition = tabLeft - containerWidth / 2 + tabWidth / 2

      scrollContainer.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
    }
  }, [activeTab])

  const handleTabClick = (tabId: string) => {
    if (tabId === "servicos") {
      setShowServicesSheet(true)
    } else if (tabId === "empresas") {
      setShowCompaniesSheet(true)
    } else if (tabId === "promocoes") {
      router.push("/products")
    }
    setActiveTab(tabId)
  }

  return (
    <>
      <nav className="sticky top-[64px] z-40 bg-background px-4 shadow-sm dark:bg-background">
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el
              }}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "relative whitespace-nowrap py-3 text-sm font-medium transition-all duration-300",
                activeTab === tab.id ? "text-foreground scale-105" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground transition-all duration-300" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <Sheet open={showServicesSheet} onOpenChange={(open) => {
        setShowServicesSheet(open)
        if (!open) setActiveTab("inicio")
      }}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">


          <div className="bg-primary/5 rounded-lg p-4 my-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Como Funciona a Plataforma NOW
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Você solicita o serviço:</strong> Escolha a categoria que precisa
                e descreva seu projeto.
              </p>
              <p>
                <strong className="text-foreground">2. Nós indicamos os melhores profissionais:</strong> Nossa
                plataforma conecta você com especialistas qualificados e avaliados.
              </p>
              <p>
                <strong className="text-foreground">3. Tudo pelo app:</strong> Agendamento, comunicação e pagamento são
                feitos de forma extremamente segura através da plataforma.
              </p>
              <p className="text-primary font-medium pt-1">
                ✓ Segurança garantida • ✓ Profissionais verificados • ✓ Sem peso na consciência
              </p>
            </div>
          </div>

          <div className="space-y-3 pb-6">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Categorias Disponíveis
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {services.map((service) => {
                const Icon = service.icon
                return (
                  <button
                    key={service.label}
                    onClick={() => {
                      setShowServicesSheet(false)
                      router.push(`/categories/${service.slug}`)
                    }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all active:scale-95"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium text-sm">{service.label}</span>
                      <span className="text-xs text-muted-foreground">{service.description}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showCompaniesSheet} onOpenChange={(open) => {
        setShowCompaniesSheet(open)
        if (!open) setActiveTab("inicio")
      }}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl">Empresas Verificadas</SheetTitle>
            <SheetDescription className="text-base pt-2">
              Parceiros de confiança, credenciados e selecionados pela NOW
            </SheetDescription>
          </SheetHeader>

          <div className="bg-primary/5 rounded-lg p-4 my-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary" />
              Por que confiar em nossas empresas?
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">✓ Empresas de confiança:</strong> Todas as empresas parceiras são
                rigorosamente verificadas e credenciadas pela NOW.
              </p>
              <p>
                <strong className="text-foreground">✓ Seleção inteligente:</strong> Nossa tecnologia avançada analisa
                sua necessidade e conecta você com a empresa ideal.
              </p>
              <p>
                <strong className="text-foreground">✓ Qualidade garantida:</strong> Trabalhamos apenas com profissionais
                qualificados e com histórico comprovado.
              </p>
              <p className="text-primary font-medium pt-1">
                A NOW garante que você será atendido pelos melhores profissionais do mercado.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p>Nossos parceiros verificados aparecerão aqui em breve</p>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showPromotionsSheet} onOpenChange={(open) => {
        setShowPromotionsSheet(open)
        if (!open) setActiveTab("inicio")
      }}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl flex items-center gap-2">
              <Store className="h-6 w-6" />
              Catálogo de Produtos
            </SheetTitle>
            <SheetDescription className="text-base pt-2">
              Equipamentos e produtos de segurança eletrônica
            </SheetDescription>
          </SheetHeader>

          <div className="bg-primary/5 rounded-lg p-4 my-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">🛒 Loja oficial NOW:</strong> Equipamentos de segurança com garantia
                e suporte.
              </p>
              <p>
                <strong className="text-foreground">🔐 Compra segura:</strong> Pagamento protegido via PIX, cartão ou
                boleto.
              </p>
              <p className="text-xs text-muted-foreground pt-2">
                * É necessário estar logado e ter dados completos (CPF e endereço) para finalizar a compra.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Store className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Catálogo em construção</p>
            <p className="text-sm mt-1">Em breve você poderá comprar produtos diretamente por aqui</p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

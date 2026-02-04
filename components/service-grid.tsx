"use client"

import { Shield, Camera, Zap, Lock, BellIcon, Wifi, Home, Building2 } from "lucide-react"
import Link from "next/link"

const services = [
<<<<<<< HEAD
  { icon: Camera, label: "Câmeras", href: "/categories/cftv" },
  { icon: BellIcon, label: "Alarmes", href: "/categories/alarmes" },
  { icon: Zap, label: "Automação", href: "/categories/automacao" },
=======
  { icon: Camera, label: "CFTV", href: "/categories/cftv" },
  { icon: BellIcon, label: "Alarmes", href: "/categories/alarmes" },
  { icon: Zap, label: "Automatização", href: "/categories/automacao" },
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
  { icon: Lock, label: "Controle de Acesso", href: "/categories/acesso" },
  { icon: Wifi, label: "Cerca Elétrica", href: "/categories/cerca" },
  { icon: Shield, label: "Interfone", href: "/categories/interfone" },
  { icon: Home, label: "Residencial", href: "/services?type=residencial" },
  { icon: Building2, label: "Empresarial", href: "/services?type=empresarial" },
]

export function ServiceGrid() {
  return (
    <section className="py-8">
      {/* Título da seção */}
      <div className="mb-8 text-center">

      </div>

      {/* Grid de serviços com melhor espaçamento */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <Link
                key={service.label}
                href={service.href}
                className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 md:p-6 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/5 active:scale-95 hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-50"
              >
                {/* Ícone com efeito hover */}
                <div className="relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                  <Icon className="h-7 w-7 md:h-8 md:w-8 text-primary transition-all duration-300 group-hover:text-primary-foreground" strokeWidth={2} />
                  <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </div>

                {/* Label com melhor tipografia */}
                <span className="text-center text-sm md:text-base font-semibold text-foreground leading-tight transition-colors duration-300 group-hover:text-primary">
                  {service.label}
                </span>

                {/* Efeito decorativo sutil */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </Link>
            )
          })}
        </div>

        {/* Call-to-action adicional */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Não encontrou o que procura?
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors duration-200"
          >
            Busque seus serviços aqui
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

"use client"

import { Shield, Camera, Zap, Lock, BellIcon, Wifi, Home, Building2 } from "lucide-react"
import Link from "next/link"

const services = [
  { icon: Camera, label: "CFTV", href: "categories/cftv" },
  { icon: BellIcon, label: "Alarmes", href: "categories/larmes" },
  { icon: Zap, label: "Automatização", href: "/categories/automacao" },
  { icon: Lock, label: "Controle de Acesso", href: "/categories/acesso" },
  { icon: Wifi, label: "Cerca Elétrica", href: "/categories/cerca" },
  { icon: Shield, label: "Interfone", href: "/categories/interfone" },
  { icon: Home, label: "Residencial", href: "/services?type=residencial" },
  { icon: Building2, label: "Empresarial", href: "/services?type=empresarial" },
]

export function ServiceGrid() {
  return (
    <section className="py-6">
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <Link
              key={service.label}
              href={service.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary hover:shadow-sm active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" strokeWidth={2} />
              </div>
              <span className="text-center text-xs font-medium text-foreground leading-tight">{service.label}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

"use client"

import { Camera, DoorOpen, Lock, Shield, Zap, Wrench, Network, Server, FileCheck, Calendar } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    id: "cftv",
    slug: "cftv",
    name: "CFTV",
    description: "Câmeras",
    icon: Camera,
  },
  {
    id: "portoes",
    slug: "automacao",
    name: "Portões",
    description: "Automáticos",
    icon: DoorOpen,
  },
  {
    id: "alarmes",
    slug: "alarmes",
    name: "Alarmes",
    description: "Sistemas",
    icon: Shield,
  },
  {
    id: "controle-acesso",
    slug: "acesso",
    name: "Acesso",
    description: "Controle",
    icon: Lock,
  },
  {
    id: "interfones",
    slug: "interfone",
    name: "Interfones",
    description: "e Vídeo",
    icon: Server,
  },
  {
    id: "rede",
    slug: "rede",
    name: "Rede",
    description: "Internet",
    icon: Network,
  },
  {
    id: "eletrica",
    slug: "eletrica",
    name: "Elétrica",
    description: "Instalação",
    icon: Zap,
  },
  {
    id: "preventiva",
    slug: "preventiva",
    name: "Preventiva",
    description: "Manutenção",
    icon: Wrench,
  },
  {
    id: "planos",
    slug: "planos",
    name: "Planos",
    description: "Contratos",
    icon: FileCheck,
  },
  {
    id: "empresas",
    slug: "empresas",
    name: "Empresas",
    description: "Serviços",
    icon: Calendar,
  },
]

export function SearchCategories() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {categories.map((category) => {
        const Icon = category.icon
        return (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md active:scale-95"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Icon className="h-6 w-6 text-primary" strokeWidth={2} />
            </div>
            <h3 className="text-center text-sm font-semibold text-foreground">{category.name}</h3>
            <p className="text-center text-xs text-muted-foreground">{category.description}</p>
          </Link>
        )
      })}
    </div>
  )
}

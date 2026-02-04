"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Service, ServiceProvider, ServiceCategory } from "@/lib/types"
import { Clock, Star } from "lucide-react"
import Link from "next/link"

interface ServiceWithRelations extends Service {
  provider: ServiceProvider
  category: ServiceCategory
}

interface ServiceListProps {
  services: ServiceWithRelations[]
}

export function ServiceList({ services }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <p className="text-lg text-muted-foreground">Nenhum serviço encontrado</p>
        <p className="mt-2 text-sm text-muted-foreground">Tente ajustar os filtros ou buscar por outros termos</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {services.map((service) => (
        <Card key={service.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <CardDescription className="mt-1">{service.provider.company_name}</CardDescription>
              </div>
              <Badge variant="secondary">{service.category.name}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <p className="line-clamp-2 text-sm text-muted-foreground">{service.description}</p>

            <div className="mt-4 flex items-center gap-4 text-sm">
              {service.estimated_duration && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{service.estimated_duration} min</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{service.provider.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({service.provider.total_reviews})</span>
              </div>
            </div>

            {service.base_price && (
              <p className="mt-4 text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(service.base_price))}
              </p>
            )}

            <Button asChild className="mt-6">
              <Link href={`/services/${service.id}/request`}>Solicitar Serviço</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

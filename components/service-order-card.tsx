"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MessageCircle, Phone, Mail, MapPin, Calendar, Clock, Building2, ChevronRight, Check } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Image from "next/image"

interface ServiceRequest {
  id: string
  service_type: string
  status: string
  scheduled_date: string | null
  address: string
  city: string
  state: string
  zip_code: string | null
  notes: string | null
  total_price: number | null
  created_at: string
  provider_id: string | null
  service_providers: {
    id: string
    company_name: string
    cnpj?: string
    phone?: string
    email?: string
    logo_url?: string
    rating?: number
    total_reviews?: number
  } | null
  service?: {
    name: string
  } | null
  service_categories?: {
    name: string
    icon?: string
  } | null
}

interface ServiceOrderCardProps {
  request: ServiceRequest
  onSelect?: () => void
}

const progressStages = [
  { status: "pending", label: "Solicitado", percentage: 20 },
  { status: "accepted", label: "Aceito", percentage: 40 },
  { status: "scheduled", label: "Agendado", percentage: 60 },
  { status: "in_progress", label: "Em Andamento", percentage: 80 },
  { status: "completed", label: "Concluído", percentage: 100 },
]

export function ServiceOrderCard({ request, onSelect }: ServiceOrderCardProps) {
  const [progress, setProgress] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
    const stage = progressStages.find(s => s.status === request.status)
    setProgress(stage?.percentage || 20)
  }, [request.status])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "accepted":
        return "bg-blue-500"
      case "scheduled":
        return "bg-purple-500"
      case "in_progress":
        return "bg-orange-500"
      case "completed":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: "Aguardando empresa aceitar",
      accepted: "Aceito pela Empresa",
      scheduled: "Agendado",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado",
    }
    return labels[status] || status
  }

  const getProgressSteps = () => {
    const currentIndex = progressStages.findIndex(s => s.status === request.status)
    return progressStages.map((stage, index) => ({
      ...stage,
      completed: index <= currentIndex,
      current: index === currentIndex
    }))
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md bg-background dark:bg-gray-900 hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-primary/5 to-primary/0 dark:from-primary/10 dark:to-transparent p-4 border-b border-border dark:border-gray-800">
          {/* Header with provider info and time */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex gap-3 flex-1">
              {/* Provider Logo */}
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                {request.service_providers?.logo_url ? (
                  <Image
                    src={request.service_providers.logo_url}
                    alt={request.service_providers.company_name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="h-6 w-6 text-primary" />
                )}
              </div>

              {/* Provider details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-foreground truncate">
                  {request.service_providers?.company_name || "Empresa não definida"}
                </h3>
                {request.service_providers?.rating && (
                  <p className="text-sm text-muted-foreground">
                    ⭐ {request.service_providers.rating.toFixed(1)} ({request.service_providers.total_reviews} avaliações)
                  </p>
                )}
                {request.service_type && (
                  <Badge variant="secondary" className="mt-1">
                    {request.service_type}
                  </Badge>
                )}
              </div>
            </div>

            {/* Status Badge and Time */}
            <div className="text-right flex-shrink-0 ml-2">
              <Badge className={`${getStatusColor(request.status)} text-white mb-2`}>
                {getStatusLabel(request.status).split(" ")[0]}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(request.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>

          {/* Progress Bar with Steps */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {getStatusLabel(request.status)}
              </span>
              <span className="text-sm text-primary font-bold">{progress}%</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between px-0 pt-1">
              {getProgressSteps().map((step, index) => (
                <div key={step.status} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      step.completed
                        ? "bg-primary text-white"
                        : step.current
                          ? "bg-primary/30 text-primary ring-2 ring-primary/50"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    }`}
                  >
                    {step.completed && step.status !== "pending" ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground text-center whitespace-nowrap max-w-12">
                    {step.label.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="p-4 space-y-3">
          {/* Pending Status Alert */}
          {request.status === "pending" && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex gap-2">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Solicitação em análise</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400/80">A empresa está analisando sua solicitação. Você receberá uma notificação quando ela aceitar.</p>
              </div>
            </div>
          )}

          {/* Address */}
          <div className="flex gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Endereço</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {request.address}, {request.city} - {request.state}
                {request.zip_code && ` - CEP: ${request.zip_code}`}
              </p>
            </div>
          </div>

          {/* Scheduled Date */}
          {request.scheduled_date && (
            <div className="flex gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Data Agendada</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(request.scheduled_date).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Price */}
          {request.total_price && (
            <div className="pt-2 border-t border-border dark:border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Valor Total</span>
                <span className="text-xl font-bold text-primary">
                  R$ {request.total_price.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          {request.notes && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-1">Observações</p>
              <p className="text-sm text-foreground line-clamp-2">{request.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-0 flex gap-2 border-t border-border dark:border-gray-800">
          <Button size="sm" className="w-full flex-1" onClick={onSelect}>
            Ver Pedido
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>

          {request.service_providers?.phone && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`tel:${request.service_providers.phone}`, "_self")}
              title="Ligar para fornecedor"
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}

          {request.service_providers?.email && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`mailto:${request.service_providers.email}`, "_self")}
              title="Enviar e-mail para fornecedor"
            >
              <Mail className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MessageCircle, Phone, Mail, MapPin, Calendar, Clock, Building2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

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
    company_name: string
    cnpj?: string
    phone?: string
    email?: string
  } | null
  service?: {
    name: string
  } | null
}

interface ServiceOrderCardProps {
  request: ServiceRequest
}

export function ServiceOrderCard({ request }: ServiceOrderCardProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate progress animation
    const timer = setTimeout(() => {
      switch (request.status) {
        case "pending":
          setProgress(25)
          break
        case "confirmed":
          setProgress(50)
          break
        case "in_progress":
          setProgress(75)
          break
        case "completed":
          setProgress(100)
          break
        default:
          setProgress(10)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [request.status])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "confirmed":
        return "bg-blue-500"
      case "in_progress":
        return "bg-purple-500"
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
      pending: "Aguardando confirmação",
      confirmed: "Confirmado",
      in_progress: "Em andamento",
      completed: "Concluído",
      cancelled: "Cancelado",
    }
    return labels[status] || status
  }

  const getProgressLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Solicitação enviada"
      case "confirmed":
        return "Empresa confirmou"
      case "in_progress":
        return "Serviço em andamento"
      case "completed":
        return "Serviço concluído"
      case "cancelled":
        return "Serviço cancelado"
      default:
        return "Status desconhecido"
    }
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardContent className="p-0">
        <div className="flex">
          {/* Company Logo Section */}
          <div className="w-20 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground mb-1">
                  {request.service?.name || request.service_type}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {request.service_providers?.company_name || "Empresa não definida"}
                </p>

                {/* Status Badge */}
                <Badge
                  className={`${getStatusColor(request.status)} text-white text-xs px-2 py-1`}
                >
                  {getStatusLabel(request.status)}
                </Badge>
              </div>

              {/* Time */}
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(request.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  {getProgressLabel(request.status)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {progress}%
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={progress}
                  className="h-2 bg-gray-200 dark:bg-gray-700"
                />
                <div
                  className="absolute top-0 left-0 h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 mb-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground line-clamp-2">
                {request.address}, {request.city} - {request.state}
                {request.zip_code && `, CEP: ${request.zip_code}`}
              </p>
            </div>

            {/* Scheduled Date */}
            {request.scheduled_date && (
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Agendado para: {new Date(request.scheduled_date).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}

            {/* Price */}
            {request.total_price && (
              <div className="mb-3">
                <p className="text-lg font-bold text-primary">
                  R$ {request.total_price.toFixed(2).replace(".", ",")}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link href={`/dashboard/requests/${request.id}`} className="flex-1">
                <Button size="sm" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Abrir Chamado
                </Button>
              </Link>

              {request.service_providers?.phone && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`tel:${request.service_providers.phone}`, '_self')}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              )}

              {request.service_providers?.email && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`mailto:${request.service_providers.email}`, '_self')}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
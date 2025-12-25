"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, MessageCircle, Clock, Building2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ServiceRequest {
  id: string
  service_type: string
  status: string
  scheduled_date: string
  address: string
  city: string
  state: string
  notes: string
  total_price: number
  created_at: string
  provider_id: string
  service_providers: {
    company_name: string
  } | null
}

export function ServiceOrdersList({ userId }: { userId: string }) {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("service_requests")
      .select(
        `
        *,
        service_providers (
          company_name
        )
      `,
      )
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setRequests(data as ServiceRequest[])
    }
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500"
      case "confirmed":
        return "bg-blue-500/10 text-blue-500"
      case "in_progress":
        return "bg-purple-500/10 text-purple-500"
      case "completed":
        return "bg-green-500/10 text-green-500"
      case "cancelled":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: "Pendente",
      confirmed: "Confirmado",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado",
    }
    return labels[status] || status
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Você ainda não tem solicitações de serviço</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{request.service_type}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(request.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(request.status)}>{getStatusLabel(request.status)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {request.service_providers && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{request.service_providers.company_name}</span>
              </div>
            )}

            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                {request.address}, {request.city} - {request.state}
              </span>
            </div>

            {request.scheduled_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(request.scheduled_date).toLocaleDateString("pt-BR")}</span>
              </div>
            )}

            {request.total_price && (
              <div className="text-lg font-bold text-primary">
                R$ {request.total_price.toFixed(2).replace(".", ",")}
              </div>
            )}

            <Link href={`/orders/service/${request.id}/chat`}>
              <Button className="w-full mt-2 bg-transparent" variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat com a Empresa
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

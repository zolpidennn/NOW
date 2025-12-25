"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ServiceRequest, Service } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, MapPin, FileText, User, Phone } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface RequestWithRelations extends ServiceRequest {
  service: Service
  customer: {
    id: string
    raw_user_meta_data: {
      full_name?: string
      phone?: string
    }
  }
}

interface ProviderRequestDetailsProps {
  request: RequestWithRelations
  providerId: string
}

const statusMap = {
  pending: { label: "Pendente", variant: "secondary" as const },
  accepted: { label: "Aceito", variant: "default" as const },
  scheduled: { label: "Agendado", variant: "default" as const },
  in_progress: { label: "Em Andamento", variant: "default" as const },
  completed: { label: "Concluído", variant: "outline" as const },
  cancelled: { label: "Cancelado", variant: "destructive" as const },
}

export function ProviderRequestDetails({ request, providerId }: ProviderRequestDetailsProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const supabase = createClient()
      const updateData: any = { status: newStatus }

      if (newStatus === "completed") {
        updateData.completed_date = new Date().toISOString()
      }

      const { error } = await supabase.from("service_requests").update(updateData).eq("id", request.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Erro ao atualizar status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{request.service.name}</CardTitle>
            <p className="mt-1 text-muted-foreground capitalize">{request.service_type}</p>
          </div>
          <Badge variant={statusMap[request.status].variant} className="text-sm">
            {statusMap[request.status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 border-b border-border pb-6">
          <h4 className="font-semibold">Informações do Cliente</h4>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{request.customer.raw_user_meta_data?.full_name || "Cliente"}</span>
          </div>
          {request.customer.raw_user_meta_data?.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{request.customer.raw_user_meta_data.phone}</span>
            </div>
          )}
        </div>

        <div className="space-y-3 border-b border-border pb-6">
          <h4 className="font-semibold">Detalhes da Solicitação</h4>
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Endereço do Serviço</p>
              <p className="font-medium">
                {request.address}
                <br />
                {request.city}, {request.state} - {request.zip_code}
              </p>
            </div>
          </div>

          {request.scheduled_date && (
            <div className="flex items-start gap-3">
              <Calendar className="mt-1 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Data Agendada</p>
                <p className="font-medium">
                  {format(new Date(request.scheduled_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          )}

          {request.notes && (
            <div className="flex items-start gap-3">
              <FileText className="mt-1 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Observações do Cliente</p>
                <p className="font-medium">{request.notes}</p>
              </div>
            </div>
          )}
        </div>

        {request.total_price && (
          <div className="border-b border-border pb-6">
            <p className="text-sm text-muted-foreground">Valor do Serviço</p>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(request.total_price))}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {request.status === "pending" && (
            <>
              <Button className="w-full" onClick={() => handleStatusUpdate("accepted")} disabled={isUpdating}>
                Aceitar Solicitação
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => handleStatusUpdate("cancelled")}
                disabled={isUpdating}
              >
                Recusar Solicitação
              </Button>
            </>
          )}
          {request.status === "accepted" && (
            <Button className="w-full" onClick={() => handleStatusUpdate("scheduled")} disabled={isUpdating}>
              Marcar como Agendado
            </Button>
          )}
          {request.status === "scheduled" && (
            <Button className="w-full" onClick={() => handleStatusUpdate("in_progress")} disabled={isUpdating}>
              Iniciar Serviço
            </Button>
          )}
          {request.status === "in_progress" && (
            <Button className="w-full" onClick={() => handleStatusUpdate("completed")} disabled={isUpdating}>
              Concluir Serviço
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

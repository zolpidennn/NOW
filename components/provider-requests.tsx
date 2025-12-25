"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ServiceRequest, Service } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { Calendar, MapPin, User } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface RequestWithRelations extends ServiceRequest {
  service: Service
  customer: {
    id: string
    raw_user_meta_data: {
      full_name?: string
    }
  }
}

interface ProviderRequestsProps {
  requests: RequestWithRelations[]
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

export function ProviderRequests({ requests, providerId }: ProviderRequestsProps) {
  const router = useRouter()
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const activeRequests = requests.filter((r) => ["accepted", "scheduled", "in_progress"].includes(r.status))
  const completedRequests = requests.filter((r) => r.status === "completed")

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    setUpdatingStatus(requestId)
    try {
      const supabase = createClient()
      const updateData: any = { status: newStatus }

      if (newStatus === "completed") {
        updateData.completed_date = new Date().toISOString()
      }

      const { error } = await supabase.from("service_requests").update(updateData).eq("id", requestId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Erro ao atualizar status:", error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const renderRequestCard = (request: RequestWithRelations) => (
    <Card key={request.id}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{request.service.name}</h3>
              <Badge variant={statusMap[request.status].variant}>{statusMap[request.status].label}</Badge>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{request.customer.raw_user_meta_data?.full_name || "Cliente"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {request.address}, {request.city} - {request.state}
                </span>
              </div>
              {request.scheduled_date && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Agendado para{" "}
                    {format(new Date(request.scheduled_date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>

            {request.total_price && (
              <p className="mt-4 text-xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(request.total_price))}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              {request.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(request.id, "accepted")}
                    disabled={updatingStatus === request.id}
                  >
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(request.id, "cancelled")}
                    disabled={updatingStatus === request.id}
                  >
                    Recusar
                  </Button>
                </>
              )}
              {request.status === "accepted" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(request.id, "scheduled")}
                  disabled={updatingStatus === request.id}
                >
                  Marcar como Agendado
                </Button>
              )}
              {request.status === "scheduled" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(request.id, "in_progress")}
                  disabled={updatingStatus === request.id}
                >
                  Iniciar Serviço
                </Button>
              )}
              {request.status === "in_progress" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(request.id, "completed")}
                  disabled={updatingStatus === request.id}
                >
                  Concluir Serviço
                </Button>
              )}
            </div>
          </div>

          <Button variant="ghost" asChild>
            <Link href={`/provider/requests/${request.id}`}>Ver Detalhes</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pendentes ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="active">Ativas ({activeRequests.length})</TabsTrigger>
            <TabsTrigger value="completed">Concluídas ({completedRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
              </div>
            ) : (
              pendingRequests.map(renderRequestCard)
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">Nenhuma solicitação ativa</p>
              </div>
            ) : (
              activeRequests.map(renderRequestCard)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">Nenhuma solicitação concluída</p>
              </div>
            ) : (
              completedRequests.map(renderRequestCard)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

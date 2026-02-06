"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ServiceRequest, Service, ServiceProvider } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { Calendar, MapPin } from "lucide-react"

interface RequestWithRelations extends ServiceRequest {
  service: Service
  provider: ServiceProvider
}

interface RequestsListProps {
  requests: RequestWithRelations[]
}

const statusMap = {
  pending: { label: "Pendente", variant: "secondary" as const },
  accepted: { label: "Aceito", variant: "default" as const },
  scheduled: { label: "Agendado", variant: "default" as const },
  in_progress: { label: "Em Andamento", variant: "default" as const },
  completed: { label: "Concluído", variant: "outline" as const },
  cancelled: { label: "Cancelado", variant: "destructive" as const },
}

export function RequestsList({ requests }: RequestsListProps) {
  const activeRequests = requests.filter((r) => ["pending", "accepted", "scheduled", "in_progress"].includes(r.status))
  const completedRequests = requests.filter((r) => r.status === "completed")
  const cancelledRequests = requests.filter((r) => r.status === "cancelled")

  const renderRequestCard = (request: RequestWithRelations) => (
    <Card key={request.id}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{request.service.name}</h3>
              <Badge variant={statusMap[request.status].variant}>{statusMap[request.status].label}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{request.provider.company_name}</p>

            <div className="mt-4 space-y-2 text-sm">
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
          </div>

          <Button asChild>
            <Link href={`/dashboard/requests/${request.id}`}>Ver Detalhes</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="active">
      <TabsList>
        <TabsTrigger value="active">Ativas ({activeRequests.length})</TabsTrigger>
        <TabsTrigger value="completed">Concluídas ({completedRequests.length})</TabsTrigger>
        <TabsTrigger value="cancelled">Canceladas ({cancelledRequests.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-4">
        {activeRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">Nenhuma solicitação ativa</p>
            </CardContent>
          </Card>
        ) : (
          activeRequests.map(renderRequestCard)
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        {completedRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">Nenhuma solicitação concluída</p>
            </CardContent>
          </Card>
        ) : (
          completedRequests.map(renderRequestCard)
        )}
      </TabsContent>

      <TabsContent value="cancelled" className="space-y-4">
        {cancelledRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">Nenhuma solicitação cancelada</p>
            </CardContent>
          </Card>
        ) : (
          cancelledRequests.map(renderRequestCard)
        )}
      </TabsContent>
    </Tabs>
  )
}

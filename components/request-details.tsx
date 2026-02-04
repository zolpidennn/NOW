import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ServiceRequest, Service, ServiceProvider } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, MapPin, FileText, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

interface RequestWithRelations extends ServiceRequest {
  service: Service
  provider: ServiceProvider
}

interface RequestDetailsProps {
  request: RequestWithRelations
}

const statusMap = {
  pending: { label: "Pendente", variant: "secondary" as const },
  accepted: { label: "Aceito", variant: "default" as const },
  scheduled: { label: "Agendado", variant: "default" as const },
  in_progress: { label: "Em Andamento", variant: "default" as const },
  completed: { label: "Concluído", variant: "outline" as const },
  cancelled: { label: "Cancelado", variant: "destructive" as const },
}

export async function RequestDetails({ request }: RequestDetailsProps) {
  const supabase = await createClient()

  // Verificar se já existe avaliação
  const { data: existingReview } = await supabase.from("reviews").select("*").eq("request_id", request.id).single()

  const showReviewButton = request.status === "completed" && !existingReview

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{request.service.name}</CardTitle>
            <p className="mt-1 text-muted-foreground">{request.provider.company_name}</p>
          </div>
          <Badge variant={statusMap[request.status].variant} className="text-sm">
            {statusMap[request.status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tipo de Serviço</p>
            <p className="font-medium capitalize">{request.service_type}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Solicitado em</p>
            <p className="font-medium">
              {format(new Date(request.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Endereço</p>
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
                <p className="text-sm text-muted-foreground">Observações</p>
                <p className="font-medium">{request.notes}</p>
              </div>
            </div>
          )}
        </div>

        {request.total_price && (
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(request.total_price))}
            </p>
          </div>
        )}

        {showReviewButton && (
          <div className="border-t border-border pt-6">
            <Button className="w-full" size="lg" asChild>
              <Link href={`/dashboard/requests/${request.id}/review`}>
                <Star className="mr-2 h-4 w-4" />
                Avaliar Serviço
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ServiceRequest, Service, ServiceProvider } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface RequestWithRelations extends ServiceRequest {
  service: Service
  provider: ServiceProvider
}

interface RecentRequestsProps {
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

export function RecentRequests({ requests }: RecentRequestsProps) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suas Solicitações</CardTitle>
          <CardDescription>Você ainda não tem solicitações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mb-4 text-muted-foreground">Comece solicitando um serviço</p>
            <Button asChild>
              <Link href="/services">Buscar Serviços</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Suas Solicitações</CardTitle>
          <CardDescription>Acompanhe o status de seus serviços</CardDescription>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/requests">
            Ver todas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.slice(0, 5).map((request) => (
            <div key={request.id} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">{request.service.name}</h4>
                  <Badge variant={statusMap[request.status].variant}>{statusMap[request.status].label}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{request.provider.company_name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Solicitado em {format(new Date(request.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/requests/${request.id}`}>Detalhes</Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

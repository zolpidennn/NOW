import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ServiceRequest } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle, Clock, Calendar, PlayCircle, XCircle } from "lucide-react"

interface RequestTimelineProps {
  request: ServiceRequest
}

const statusIcons = {
  pending: Clock,
  accepted: CheckCircle,
  scheduled: Calendar,
  in_progress: PlayCircle,
  completed: CheckCircle,
  cancelled: XCircle,
}

const statusLabels = {
  pending: "Solicitação Criada",
  accepted: "Solicitação Aceita",
  scheduled: "Serviço Agendado",
  in_progress: "Serviço em Andamento",
  completed: "Serviço Concluído",
  cancelled: "Solicitação Cancelada",
}

export function RequestTimeline({ request }: RequestTimelineProps) {
  const timelineSteps = [
    {
      status: "pending",
      date: request.created_at,
      completed: true,
    },
    {
      status: "accepted",
      completed: ["accepted", "scheduled", "in_progress", "completed"].includes(request.status),
    },
    {
      status: "scheduled",
      date: request.scheduled_date,
      completed: ["scheduled", "in_progress", "completed"].includes(request.status),
    },
    {
      status: "in_progress",
      completed: ["in_progress", "completed"].includes(request.status),
    },
    {
      status: "completed",
      date: request.completed_date,
      completed: request.status === "completed",
    },
  ]

  if (request.status === "cancelled") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Linha do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                  <XCircle className="h-5 w-5" />
                </div>
                <div className="h-full w-px bg-border" />
              </div>
              <div className="flex-1 pb-8">
                <p className="font-medium">Solicitação Cancelada</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(request.updated_at), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linha do Tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineSteps.map((step, index) => {
            const Icon = statusIcons[step.status as keyof typeof statusIcons]
            const isLast = index === timelineSteps.length - 1

            return (
              <div key={step.status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {!isLast && <div className="h-full w-px bg-border" />}
                </div>
                <div className={`flex-1 ${!isLast ? "pb-8" : ""}`}>
                  <p className={`font-medium ${step.completed ? "" : "text-muted-foreground"}`}>
                    {statusLabels[step.status as keyof typeof statusLabels]}
                  </p>
                  {step.date && step.completed && (
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(step.date), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

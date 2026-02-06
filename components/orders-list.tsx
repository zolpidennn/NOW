import { createClient } from "@/lib/supabase/server"
import { Package } from "lucide-react"
import type { ServiceRequest } from "@/lib/types"

export async function OrdersList({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: requests } = await supabase
    .from("service_requests")
    .select("*")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-center text-lg font-medium text-foreground">Não há nada por aqui!</p>
        <p className="text-center text-muted-foreground mt-2">Solicite seu serviço.</p>
        <a
          href="/search"
          className="mt-6 rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-colors active:bg-primary/90"
        >
          Buscar Serviços
        </a>
      </div>
    )
  }

  const statusLabels = {
    pending: "Aguardando",
    accepted: "Aceito",
    scheduled: "Agendado",
    in_progress: "Em Andamento",
    completed: "Concluído",
    cancelled: "Cancelado",
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    accepted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    scheduled: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  }

  return (
    <div className="space-y-4">
      {requests.map((request: ServiceRequest) => (
        <a
          key={request.id}
          href={`/dashboard/requests/${request.id}`}
          className="block rounded-xl bg-card p-4 shadow-sm transition-shadow active:shadow-md border border-border"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span
                className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[request.status]}`}
              >
                {statusLabels[request.status]}
              </span>
              <h3 className="font-semibold text-card-foreground">{request.service_type}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{request.address}</p>
              {request.scheduled_date && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Agendado: {new Date(request.scheduled_date).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

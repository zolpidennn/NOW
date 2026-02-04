"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, User, Phone, Mail, Calendar, DollarSign, CheckCircle2, XCircle, Clock } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"

interface ServiceRequest {
  id: string
  customer_id: string
  status: string
  service_type: string
  address: string
  city: string
  state: string
  zip_code?: string
  notes?: string
  total_price?: number
  scheduled_date?: string
  created_at: string
  profiles?: {
    first_name: string
    last_name: string
    phone?: string
    email?: string
    avatar_url?: string
  }
  service_categories?: {
    name: string
    icon?: string
  }
}

interface ProviderRequestsProps {
  providerId: string
}

export function ProviderRequests({ providerId }: ProviderRequestsProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("pending")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    loadRequests()
  }, [providerId, filter])

  async function loadRequests() {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from("service_requests")
        .select(`
          *,
          profiles:customer_id (
            first_name,
            last_name,
            phone,
            email,
            avatar_url
          ),
          service_categories (
            name,
            icon
          )
        `)
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setRequests(data || [])
    } catch (err) {
      console.error("Error loading requests:", err)
      setError("Erro ao carregar solicitações")
    } finally {
      setLoading(false)
    }
  }

  async function updateRequestStatus(requestId: string, newStatus: string) {
    try {
      setUpdatingId(requestId)

      const { error } = await supabase
        .from("service_requests")
        .update({ status: newStatus })
        .eq("id", requestId)

      if (error) throw error

      // Update local state
      setRequests(requests.map(r => 
        r.id === requestId ? { ...r, status: newStatus } : r
      ))
      
      router.refresh()
    } catch (err) {
      console.error("Error updating request:", err)
      setError("Erro ao atualizar solicitação")
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "in_progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: "Aguardando Confirmação",
      accepted: "Aceito",
      scheduled: "Agendado",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado",
    }
    return labels[status] || status
  }

  const filters = [
    { value: "all", label: "Todas" },
    { value: "pending", label: "Aguardando" },
    { value: "accepted", label: "Aceitos" },
    { value: "scheduled", label: "Agendados" },
    { value: "in_progress", label: "Em Andamento" },
    { value: "completed", label: "Concluídos" },
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Carregando solicitações...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map(f => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            className="whitespace-nowrap"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex gap-4 p-4">
                  {/* Customer Avatar */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                    {request.profiles?.avatar_url ? (
                      <Image
                        src={request.profiles.avatar_url}
                        alt={`${request.profiles.first_name} ${request.profiles.last_name}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-primary" />
                    )}
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {request.profiles?.first_name} {request.profiles?.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {request.service_type}
                        </p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                      {/* Address */}
                      <div className="flex gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          {request.address}, {request.city} - {request.state}
                        </span>
                      </div>

                      {/* Customer Contact */}
                      <div className="flex gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{request.profiles?.phone || "Sem telefone"}</span>
                      </div>

                      {/* Scheduled Date */}
                      {request.scheduled_date && (
                        <div className="flex gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>{new Date(request.scheduled_date).toLocaleDateString("pt-BR")}</span>
                        </div>
                      )}

                      {/* Price */}
                      {request.total_price && (
                        <div className="flex gap-2 font-semibold text-primary">
                          <DollarSign className="h-4 w-4 flex-shrink-0" />
                          <span>R$ {request.total_price.toFixed(2).replace(".", ",")}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {request.notes && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded text-sm text-foreground mb-3 line-clamp-2">
                        {request.notes}
                      </div>
                    )}

                    {/* Time Info */}
                    <p className="text-xs text-muted-foreground">
                      Recebido {formatDistanceToNow(new Date(request.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {request.status === "pending" && (
                  <div className="flex gap-2 p-4 pt-0 border-t border-border dark:border-gray-800">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => updateRequestStatus(request.id, "accepted")}
                      disabled={updatingId === request.id}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Aceitar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => updateRequestStatus(request.id, "cancelled")}
                      disabled={updatingId === request.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                )}

                {request.status === "accepted" && !request.scheduled_date && (
                  <div className="p-4 pt-0 border-t border-border dark:border-gray-800">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // TODO: Open scheduling dialog
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Atendimento
                    </Button>
                  </div>
                )}

                {["in_progress", "completed"].includes(request.status) && (
                  <div className="p-4 pt-0 border-t border-border dark:border-gray-800">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // TODO: Open messaging/details dialog
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

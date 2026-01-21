"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Phone, MessageCircle, User } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

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
  customer_id: string
  profiles: {
    full_name: string
    phone: string
  } | null
}

export function ProviderAppointmentsManager({ providerId }: { providerId: string }) {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [providerId])

  const loadRequests = async () => {
    const supabase = createClient()

    // Query service requests for this provider, including team member access
    const { data, error } = await supabase
      .from("service_requests")
      .select(`
        id,
        service_type,
        status,
        scheduled_date,
        address,
        city,
        state,
        zip_code,
        notes,
        total_price,
        created_at,
        customer_id,
        profiles:customer_id (
          full_name,
          phone
        )
      `)
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setRequests(data as ServiceRequest[])
    }
    setLoading(false)
  }

  const statusMap = {
    pending: { label: "Pendente", variant: "secondary" as const },
    confirmed: { label: "Confirmado", variant: "default" as const },
    in_progress: { label: "Em Andamento", variant: "default" as const },
    completed: { label: "Concluído", variant: "outline" as const },
    cancelled: { label: "Cancelado", variant: "destructive" as const },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitações de Serviço</CardTitle>
        <CardDescription>
          Gerencie todas as solicitações de serviço para sua empresa
          {requests.length > 0 && ` (${requests.length} solicitações)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma solicitação de serviço ainda</p>
            <p className="text-sm text-muted-foreground mt-2">
              As solicitações aparecerão aqui quando clientes solicitarem seus serviços
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{request.service_type}</h3>
                      <Badge variant={statusMap[request.status as keyof typeof statusMap]?.variant || "secondary"}>
                        {statusMap[request.status as keyof typeof statusMap]?.label || request.status}
                      </Badge>
                    </div>

                    {/* Customer Info */}
                    {request.profiles && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{request.profiles.full_name}</span>
                        {request.profiles.phone && (
                          <>
                            <span>•</span>
                            <span>{request.profiles.phone}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Scheduled Date */}
                    {request.scheduled_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Agendado: {format(new Date(request.scheduled_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    )}

                    {/* Address */}
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        {request.address}, {request.city} - {request.state}
                        {request.zip_code && `, CEP: ${request.zip_code}`}
                      </span>
                    </div>

                    {/* Price */}
                    {request.total_price && (
                      <div className="text-sm font-medium text-primary">
                        Valor: R$ {request.total_price.toFixed(2).replace(".", ",")}
                      </div>
                    )}

                    {/* Notes */}
                    {request.notes && (
                      <div className="text-sm text-muted-foreground border-t pt-3">
                        <strong>Descrição:</strong> {request.notes}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/provider/requests/${request.id}`}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Conversar
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/provider/requests/${request.id}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

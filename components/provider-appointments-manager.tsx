"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Phone } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Appointment {
  id: string
  service_type: string
  scheduled_date: string
  scheduled_time_slot: string
  status: string
  address: string
  city: string
  state: string
  description: string
  customer_phone: string
  created_at: string
}

export function ProviderAppointmentsManager({ providerId }: { providerId: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAppointments()
  }, [providerId])

  const loadAppointments = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("provider_appointments")
      .select("*")
      .eq("provider_id", providerId)
      .order("scheduled_date", { ascending: true })

    if (!error && data) {
      setAppointments(data)
    }
    setLoading(false)
  }

  const statusMap = {
    pending: { label: "Pendente", variant: "secondary" as const },
    confirmed: { label: "Confirmado", variant: "default" as const },
    completed: { label: "Concluído", variant: "outline" as const },
    cancelled: { label: "Cancelado", variant: "destructive" as const },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendamentos de Serviços</CardTitle>
        <CardDescription>Visualize todos os agendamentos solicitados</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum agendamento ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{appointment.service_type}</h3>
                      <Badge variant={statusMap[appointment.status as keyof typeof statusMap].variant}>
                        {statusMap[appointment.status as keyof typeof statusMap].label}
                      </Badge>
                    </div>

                    {appointment.scheduled_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(appointment.scheduled_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} -{" "}
                          {appointment.scheduled_time_slot}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {appointment.address}, {appointment.city} - {appointment.state}
                      </span>
                    </div>

                    {appointment.customer_phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{appointment.customer_phone}</span>
                      </div>
                    )}

                    {appointment.description && (
                      <p className="text-sm text-muted-foreground border-t pt-3">{appointment.description}</p>
                    )}
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

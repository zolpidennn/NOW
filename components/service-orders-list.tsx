"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Calendar } from "lucide-react"
import { ServiceOrderCard } from "@/components/service-order-card"

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
  provider_id: string | null
  service_providers: {
    id: string
    company_name: string
    cnpj?: string
    phone?: string
    email?: string
    logo_url?: string
    rating?: number
    total_reviews?: number
  } | null
  service?: {
    name: string
  } | null
  service_categories?: {
    name: string
    icon?: string
  } | null
}

interface ServiceOrdersListProps {
  userId: string
  onSelectOrder?: (request: ServiceRequest) => void
}

export function ServiceOrdersList({ userId, onSelectOrder }: ServiceOrdersListProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [userId])

  const loadRequests = async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("service_requests")
      .select(
        `
        *,
        service_providers (
          id,
          company_name,
          cnpj,
          phone,
          email,
          logo_url,
          rating,
          total_reviews
        ),
        service:services (
          name
        ),
        service_categories (
          name,
          icon
        )
      `,
      )
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setRequests(data as ServiceRequest[])
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Você ainda não tem solicitações de serviço</p>
        <p className="text-xs text-muted-foreground mt-2">Comece selecionando um serviço e preenchendo o formulário</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <ServiceOrderCard
          key={request.id}
          request={request}
          onSelect={() => onSelectOrder?.(request)}
        />
      ))}
    </div>
  )
}

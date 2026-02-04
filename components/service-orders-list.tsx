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
<<<<<<< HEAD
    id: string
=======
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
    company_name: string
    cnpj?: string
    phone?: string
    email?: string
<<<<<<< HEAD
    logo_url?: string
    rating?: number
    total_reviews?: number
=======
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
  } | null
  service?: {
    name: string
  } | null
<<<<<<< HEAD
  service_categories?: {
    name: string
    icon?: string
  } | null
=======
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
}

export function ServiceOrdersList({ userId }: { userId: string }) {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
<<<<<<< HEAD
  }, [userId])
=======
  }, [])
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8

  const loadRequests = async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("service_requests")
      .select(
        `
        *,
        service_providers (
<<<<<<< HEAD
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
=======
          company_name,
          cnpj,
          phone,
          email
        ),
        service:services (
          name
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
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
<<<<<<< HEAD
        <p className="text-xs text-muted-foreground mt-2">Comece selecionando um serviço e preenchendo o formulário</p>
=======
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <ServiceOrderCard
          key={request.id}
          request={request}
        />
      ))}
    </div>
  )
}

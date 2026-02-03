"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface ServiceRequest {
  id: string
  service_id: string
  customer_id: string
  provider_id: string | null
  status: string
  description: string
  location: string
  preferred_date: string
  customer_latitude: number | null
  customer_longitude: number | null
  estimated_arrival: string | null
  actual_arrival: string | null
  created_at: string
  updated_at: string
}

export function useRealtimeServiceRequests(initialData: ServiceRequest[] = []) {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialData)
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel("service-requests-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "service_requests",
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setRequests((current) => [payload.new as ServiceRequest, ...current])
            } else if (payload.eventType === "UPDATE") {
              setRequests((current) =>
                current.map((req) => (req.id === payload.new.id ? (payload.new as ServiceRequest) : req)),
              )
            } else if (payload.eventType === "DELETE") {
              setRequests((current) => current.filter((req) => req.id !== payload.old.id))
            }
          },
        )
        .subscribe()
    }

    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase])

  return requests
}

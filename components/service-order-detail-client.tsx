"use client"

import { ServiceOrderCard } from "./service-order-card"

export function ServiceOrderDetailClient({ request }: { request: any }) {
  return <ServiceOrderCard request={request} />
}

export default ServiceOrderDetailClient
